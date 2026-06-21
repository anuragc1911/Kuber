-- Kuber multi-tenancy foundation: orgs + memberships
-- Apply in Supabase Studio → SQL Editor → New query → paste → Run.
-- Idempotent: safe to re-run.

create extension if not exists "pgcrypto";

-- ─── Tables ────────────────────────────────────────────────────────────

create table if not exists public.orgs (
  id                       uuid primary key default gen_random_uuid(),
  name                     text not null,
  industry                 text not null
                            check (industry in ('agency','d2c','saas','services','other')),
  country                  text not null,                 -- ISO code, e.g. 'IN'
  currency                 text not null,                 -- e.g. 'INR'
  fiscal_year_start_month  int  not null default 4
                            check (fiscal_year_start_month between 1 and 12),
  created_at               timestamptz not null default now(),
  created_by               uuid references auth.users(id) on delete set null
);

create table if not exists public.memberships (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  org_id      uuid not null references public.orgs(id) on delete cascade,
  role        text not null
              check (role in ('owner','admin','accountant','viewer')),
  created_at  timestamptz not null default now(),
  unique (user_id, org_id)
);

create index if not exists idx_memberships_user on public.memberships(user_id);
create index if not exists idx_memberships_org  on public.memberships(org_id);

-- ─── RLS ───────────────────────────────────────────────────────────────

alter table public.orgs        enable row level security;
alter table public.memberships enable row level security;

-- Drop existing policies to allow re-run.
drop policy if exists orgs_select_members          on public.orgs;
drop policy if exists orgs_insert_self             on public.orgs;
drop policy if exists orgs_update_owners_admins    on public.orgs;
drop policy if exists orgs_delete_owners           on public.orgs;
drop policy if exists memberships_select_members   on public.memberships;
drop policy if exists memberships_insert_bootstrap on public.memberships;
drop policy if exists memberships_update_owner     on public.memberships;
drop policy if exists memberships_delete_owner_admin on public.memberships;

-- ── orgs ──
-- SELECT: only members of the org.
create policy orgs_select_members on public.orgs for select
  using (
    exists (
      select 1 from public.memberships m
      where m.org_id = orgs.id and m.user_id = auth.uid()
    )
  );

-- INSERT: only as the creator. The matching owner membership is created in the
-- same RPC (`create_org`) so direct inserts are still allowed for flexibility.
create policy orgs_insert_self on public.orgs for insert
  with check (created_by = auth.uid());

-- UPDATE: owners + admins.
create policy orgs_update_owners_admins on public.orgs for update
  using (
    exists (
      select 1 from public.memberships m
      where m.org_id = orgs.id
        and m.user_id = auth.uid()
        and m.role in ('owner','admin')
    )
  );

-- DELETE: owners only.
create policy orgs_delete_owners on public.orgs for delete
  using (
    exists (
      select 1 from public.memberships m
      where m.org_id = orgs.id
        and m.user_id = auth.uid()
        and m.role = 'owner'
    )
  );

-- ── memberships ──
-- SELECT: any member of the org sees other members of the same org.
create policy memberships_select_members on public.memberships for select
  using (
    exists (
      select 1 from public.memberships m2
      where m2.org_id = memberships.org_id and m2.user_id = auth.uid()
    )
  );

-- INSERT: two cases —
--   (a) bootstrap — creator of the org adds themselves as the first member
--   (b) owner/admin adds another user
create policy memberships_insert_bootstrap on public.memberships for insert
  with check (
    -- (a) creator self-bootstrap
    (
      memberships.user_id = auth.uid()
      and exists (
        select 1 from public.orgs o
        where o.id = memberships.org_id and o.created_by = auth.uid()
      )
    )
    -- (b) acting owner/admin
    or exists (
      select 1 from public.memberships m
      where m.org_id = memberships.org_id
        and m.user_id = auth.uid()
        and m.role in ('owner','admin')
    )
  );

-- UPDATE: only owners may change roles.
create policy memberships_update_owner on public.memberships for update
  using (
    exists (
      select 1 from public.memberships m
      where m.org_id = memberships.org_id
        and m.user_id = auth.uid()
        and m.role = 'owner'
    )
  );

-- DELETE: owners + admins.
create policy memberships_delete_owner_admin on public.memberships for delete
  using (
    exists (
      select 1 from public.memberships m
      where m.org_id = memberships.org_id
        and m.user_id = auth.uid()
        and m.role in ('owner','admin')
    )
  );

-- ─── RPC: create_org ─────────────────────────────────────────────────
-- Single-transaction: insert org + insert owner membership.

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
  if v_user is null then
    raise exception 'not authenticated';
  end if;

  insert into public.orgs (name, industry, country, currency, fiscal_year_start_month, created_by)
  values (p_name, p_industry, p_country, p_currency, coalesce(p_fiscal_year_start_month, 4), v_user)
  returning * into v_org;

  insert into public.memberships (user_id, org_id, role)
  values (v_user, v_org.id, 'owner');

  return v_org;
end;
$$;

revoke all on function public.create_org(text, text, text, text, int) from public;
grant execute on function public.create_org(text, text, text, text, int) to authenticated;

-- ─── RPC: get_user_orgs ──────────────────────────────────────────────

create or replace function public.get_user_orgs()
returns table (
  id                       uuid,
  name                     text,
  industry                 text,
  country                  text,
  currency                 text,
  fiscal_year_start_month  int,
  created_at               timestamptz,
  role                     text
)
language sql
security definer
set search_path = public
as $$
  select o.id, o.name, o.industry, o.country, o.currency,
         o.fiscal_year_start_month, o.created_at, m.role
  from public.orgs o
  join public.memberships m on m.org_id = o.id
  where m.user_id = auth.uid()
  order by o.created_at desc;
$$;

revoke all on function public.get_user_orgs() from public;
grant execute on function public.get_user_orgs() to authenticated;
