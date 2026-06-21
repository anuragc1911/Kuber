-- Core financial data model for Kuber.
-- Tables: accounts, categories, vendors, transactions, clients, subscriptions.
-- Every row carries org_id; RLS scopes everything to the caller's memberships.
-- Idempotent — safe to re-run.

-- ─── Tables ──────────────────────────────────────────────────────────

create table if not exists public.accounts (
  id               uuid primary key default gen_random_uuid(),
  org_id           uuid not null references public.orgs(id) on delete cascade,
  name             text not null,
  type             text not null check (type in ('bank','credit_card','cash','wallet','other')),
  currency         text not null,
  opening_balance  numeric not null default 0,
  is_active        boolean not null default true,
  created_at       timestamptz not null default now()
);
create index if not exists idx_accounts_org on public.accounts(org_id);

create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references public.orgs(id) on delete cascade,
  parent_id   uuid references public.categories(id) on delete set null,
  name        text not null,
  type        text not null check (type in ('income','expense','transfer','asset','liability')),
  icon        text,
  is_system   boolean not null default false,
  created_at  timestamptz not null default now()
);
create index if not exists idx_categories_org on public.categories(org_id);
create index if not exists idx_categories_parent on public.categories(parent_id);

create table if not exists public.vendors (
  id                   uuid primary key default gen_random_uuid(),
  org_id               uuid not null references public.orgs(id) on delete cascade,
  canonical_name       text not null,
  aliases              text[] not null default array[]::text[],
  default_category_id  uuid references public.categories(id) on delete set null,
  vendor_type          text,
  notes                text,
  created_at           timestamptz not null default now(),
  unique (org_id, canonical_name)
);
create index if not exists idx_vendors_org on public.vendors(org_id);

create table if not exists public.transactions (
  id                uuid primary key default gen_random_uuid(),
  org_id            uuid not null references public.orgs(id) on delete cascade,
  account_id        uuid not null references public.accounts(id) on delete cascade,
  date              date not null,
  amount            numeric not null,
  currency          text not null,
  raw_description   text not null,
  vendor_id         uuid references public.vendors(id) on delete set null,
  category_id       uuid references public.categories(id) on delete set null,
  notes             text,
  is_recurring      boolean not null default false,
  source            text not null check (source in ('csv_upload','manual','integration','bank_sync')),
  source_id         text,
  dedupe_hash       text not null,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (org_id, dedupe_hash)
);
create index if not exists idx_tx_org_date     on public.transactions(org_id, date);
create index if not exists idx_tx_org_vendor   on public.transactions(org_id, vendor_id);
create index if not exists idx_tx_org_category on public.transactions(org_id, category_id);

create table if not exists public.clients (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references public.orgs(id) on delete cascade,
  name        text not null,
  email       text,
  status      text not null default 'active' check (status in ('active','paused','churned')),
  notes       text,
  created_at  timestamptz not null default now()
);
create index if not exists idx_clients_org on public.clients(org_id);

create table if not exists public.subscriptions (
  id                 uuid primary key default gen_random_uuid(),
  org_id             uuid not null references public.orgs(id) on delete cascade,
  vendor_id          uuid not null references public.vendors(id) on delete cascade,
  amount             numeric not null,
  currency           text not null,
  frequency          text not null check (frequency in ('weekly','monthly','quarterly','annual')),
  first_charged_at   date,
  last_charged_at    date,
  last_used_at       date,
  status             text not null default 'active' check (status in ('active','flagged','cancelled','paused')),
  cancel_url         text,
  cancel_method      text check (cancel_method is null or cancel_method in ('email','portal','phone','api')),
  notes              text,
  created_at         timestamptz not null default now(),
  unique (org_id, vendor_id, amount, frequency)
);
create index if not exists idx_subs_org on public.subscriptions(org_id);

-- ─── RLS ────────────────────────────────────────────────────────────

alter table public.accounts      enable row level security;
alter table public.categories    enable row level security;
alter table public.vendors       enable row level security;
alter table public.transactions  enable row level security;
alter table public.clients       enable row level security;
alter table public.subscriptions enable row level security;

-- Wipe any prior policies on these tables, then rebuild.
do $$
declare r record;
begin
  for r in
    select schemaname, tablename, policyname from pg_policies
    where schemaname = 'public'
      and tablename in ('accounts','categories','vendors','transactions','clients','subscriptions')
  loop
    execute format('drop policy if exists %I on %I.%I', r.policyname, r.schemaname, r.tablename);
  end loop;
end
$$;

-- Helper: inline subquery against memberships. memberships SELECT policy is
-- `user_id = auth.uid()` (set in 0006), so subqueries from other tables only
-- ever see the caller's own membership rows — no recursion.
--
-- We use a macro-by-copy-paste approach below since Postgres doesn't have
-- policy templates. Pattern: SELECT = any member; INSERT/UPDATE = writer
-- (owner/admin/accountant); DELETE = manager (owner/admin).

-- ── accounts ──
create policy accounts_select on public.accounts for select using (
  exists (select 1 from public.memberships m where m.org_id = accounts.org_id and m.user_id = auth.uid())
);
create policy accounts_insert on public.accounts for insert with check (
  exists (select 1 from public.memberships m where m.org_id = accounts.org_id and m.user_id = auth.uid() and m.role in ('owner','admin','accountant'))
);
create policy accounts_update on public.accounts for update using (
  exists (select 1 from public.memberships m where m.org_id = accounts.org_id and m.user_id = auth.uid() and m.role in ('owner','admin','accountant'))
);
create policy accounts_delete on public.accounts for delete using (
  exists (select 1 from public.memberships m where m.org_id = accounts.org_id and m.user_id = auth.uid() and m.role in ('owner','admin'))
);

-- ── categories ──
create policy categories_select on public.categories for select using (
  exists (select 1 from public.memberships m where m.org_id = categories.org_id and m.user_id = auth.uid())
);
create policy categories_insert on public.categories for insert with check (
  exists (select 1 from public.memberships m where m.org_id = categories.org_id and m.user_id = auth.uid() and m.role in ('owner','admin','accountant'))
);
create policy categories_update on public.categories for update using (
  exists (select 1 from public.memberships m where m.org_id = categories.org_id and m.user_id = auth.uid() and m.role in ('owner','admin','accountant'))
);
create policy categories_delete on public.categories for delete using (
  exists (select 1 from public.memberships m where m.org_id = categories.org_id and m.user_id = auth.uid() and m.role in ('owner','admin'))
);

-- ── vendors ──
create policy vendors_select on public.vendors for select using (
  exists (select 1 from public.memberships m where m.org_id = vendors.org_id and m.user_id = auth.uid())
);
create policy vendors_insert on public.vendors for insert with check (
  exists (select 1 from public.memberships m where m.org_id = vendors.org_id and m.user_id = auth.uid() and m.role in ('owner','admin','accountant'))
);
create policy vendors_update on public.vendors for update using (
  exists (select 1 from public.memberships m where m.org_id = vendors.org_id and m.user_id = auth.uid() and m.role in ('owner','admin','accountant'))
);
create policy vendors_delete on public.vendors for delete using (
  exists (select 1 from public.memberships m where m.org_id = vendors.org_id and m.user_id = auth.uid() and m.role in ('owner','admin'))
);

-- ── transactions ──
create policy transactions_select on public.transactions for select using (
  exists (select 1 from public.memberships m where m.org_id = transactions.org_id and m.user_id = auth.uid())
);
create policy transactions_insert on public.transactions for insert with check (
  exists (select 1 from public.memberships m where m.org_id = transactions.org_id and m.user_id = auth.uid() and m.role in ('owner','admin','accountant'))
);
create policy transactions_update on public.transactions for update using (
  exists (select 1 from public.memberships m where m.org_id = transactions.org_id and m.user_id = auth.uid() and m.role in ('owner','admin','accountant'))
);
create policy transactions_delete on public.transactions for delete using (
  exists (select 1 from public.memberships m where m.org_id = transactions.org_id and m.user_id = auth.uid() and m.role in ('owner','admin'))
);

-- ── clients ──
create policy clients_select on public.clients for select using (
  exists (select 1 from public.memberships m where m.org_id = clients.org_id and m.user_id = auth.uid())
);
create policy clients_insert on public.clients for insert with check (
  exists (select 1 from public.memberships m where m.org_id = clients.org_id and m.user_id = auth.uid() and m.role in ('owner','admin','accountant'))
);
create policy clients_update on public.clients for update using (
  exists (select 1 from public.memberships m where m.org_id = clients.org_id and m.user_id = auth.uid() and m.role in ('owner','admin','accountant'))
);
create policy clients_delete on public.clients for delete using (
  exists (select 1 from public.memberships m where m.org_id = clients.org_id and m.user_id = auth.uid() and m.role in ('owner','admin'))
);

-- ── subscriptions ──
create policy subscriptions_select on public.subscriptions for select using (
  exists (select 1 from public.memberships m where m.org_id = subscriptions.org_id and m.user_id = auth.uid())
);
create policy subscriptions_insert on public.subscriptions for insert with check (
  exists (select 1 from public.memberships m where m.org_id = subscriptions.org_id and m.user_id = auth.uid() and m.role in ('owner','admin','accountant'))
);
create policy subscriptions_update on public.subscriptions for update using (
  exists (select 1 from public.memberships m where m.org_id = subscriptions.org_id and m.user_id = auth.uid() and m.role in ('owner','admin','accountant'))
);
create policy subscriptions_delete on public.subscriptions for delete using (
  exists (select 1 from public.memberships m where m.org_id = subscriptions.org_id and m.user_id = auth.uid() and m.role in ('owner','admin'))
);

-- ─── Touch updated_at on transaction edits ──────────────────────────
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;
drop trigger if exists transactions_updated_at on public.transactions;
create trigger transactions_updated_at before update on public.transactions
  for each row execute function public.touch_updated_at();

-- ─── Default category seeder + updated create_org ───────────────────

create or replace function public.seed_default_categories(p_org_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.categories (org_id, name, type, is_system, icon) values
    -- income
    (p_org_id, 'Sales',              'income',  true, 'shopping-bag'),
    (p_org_id, 'Service Revenue',    'income',  true, 'briefcase'),
    (p_org_id, 'Other Income',       'income',  true, 'plus-circle'),
    -- expense
    (p_org_id, 'Software & SaaS',    'expense', true, 'monitor'),
    (p_org_id, 'Payroll',            'expense', true, 'users'),
    (p_org_id, 'Rent',                'expense', true, 'home'),
    (p_org_id, 'Marketing',          'expense', true, 'megaphone'),
    (p_org_id, 'Travel',              'expense', true, 'plane'),
    (p_org_id, 'Meals',               'expense', true, 'utensils'),
    (p_org_id, 'Professional Services','expense', true, 'gavel'),
    (p_org_id, 'Bank Fees',           'expense', true, 'banknote'),
    (p_org_id, 'Taxes',               'expense', true, 'receipt'),
    (p_org_id, 'Other',               'expense', true, 'circle');
end;
$$;
revoke all on function public.seed_default_categories(uuid) from public;
grant execute on function public.seed_default_categories(uuid) to authenticated;

-- Replace create_org to also seed defaults atomically.
create or replace function public.create_org(
  p_name                     text,
  p_industry                 text,
  p_country                  text,
  p_currency                 text,
  p_fiscal_year_start_month  int default 4
)
returns public.orgs
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org public.orgs%rowtype;
  v_user uuid := auth.uid();
begin
  if v_user is null then raise exception 'not authenticated'; end if;

  insert into public.orgs (name, industry, country, currency, fiscal_year_start_month, created_by)
  values (p_name, p_industry, p_country, p_currency, coalesce(p_fiscal_year_start_month, 4), v_user)
  returning * into v_org;

  insert into public.memberships (user_id, org_id, role)
  values (v_user, v_org.id, 'owner');

  perform public.seed_default_categories(v_org.id);

  return v_org;
end;
$$;
revoke all on function public.create_org(text, text, text, text, int) from public;
grant execute on function public.create_org(text, text, text, text, int) to authenticated;

-- ─── get_org_summary ────────────────────────────────────────────────

create or replace function public.get_org_summary(p_org_id uuid)
returns jsonb
language plpgsql
security invoker  -- runs as the caller; RLS handles authorization
stable
set search_path = public
as $$
declare
  v_inflow            numeric;
  v_outflow           numeric;
  v_tx_count          int;
  v_account_count     int;
  v_top_vendors       jsonb;
  v_month_start       date := date_trunc('month', current_date)::date;
  v_next_month_start  date := (date_trunc('month', current_date) + interval '1 month')::date;
begin
  -- Confirm membership (else return empty so we don't leak existence).
  if not exists (
    select 1 from public.memberships m where m.org_id = p_org_id and m.user_id = auth.uid()
  ) then
    return jsonb_build_object(
      'total_inflow_this_month', 0,
      'total_outflow_this_month', 0,
      'transaction_count', 0,
      'account_count', 0,
      'top_5_vendors_by_spend', '[]'::jsonb
    );
  end if;

  select coalesce(sum(case when amount > 0 then amount else 0 end), 0),
         coalesce(sum(case when amount < 0 then -amount else 0 end), 0),
         count(*)
    into v_inflow, v_outflow, v_tx_count
    from public.transactions
   where org_id = p_org_id
     and date >= v_month_start
     and date <  v_next_month_start;

  select count(*) into v_account_count
    from public.accounts
   where org_id = p_org_id and is_active = true;

  select coalesce(jsonb_agg(row_to_json(x) order by x.total_spend desc), '[]'::jsonb)
    into v_top_vendors
    from (
      select v.id           as vendor_id,
             v.canonical_name as vendor,
             sum(-t.amount) as total_spend
        from public.transactions t
        join public.vendors v on v.id = t.vendor_id
       where t.org_id = p_org_id
         and t.amount < 0
         and t.date >= v_month_start
         and t.date <  v_next_month_start
       group by v.id, v.canonical_name
       order by sum(-t.amount) desc
       limit 5
    ) x;

  return jsonb_build_object(
    'total_inflow_this_month', v_inflow,
    'total_outflow_this_month', v_outflow,
    'transaction_count', v_tx_count,
    'account_count', v_account_count,
    'top_5_vendors_by_spend', v_top_vendors
  );
end;
$$;
revoke all on function public.get_org_summary(uuid) from public;
grant execute on function public.get_org_summary(uuid) to authenticated;
