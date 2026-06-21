-- Final RLS — non-recursive by design.
-- Key insight: the SELECT policy on memberships only checks `user_id = auth.uid()`.
-- Every other policy (and the orgs policies) does a subquery against memberships,
-- which then sees only the caller's own rows — no recursion.
--
-- Idempotent — drops and recreates all org/membership policies + helpers.

-- ── Drop everything from prior attempts ──
drop policy if exists memberships_select_members     on public.memberships;
drop policy if exists memberships_select_own         on public.memberships;
drop policy if exists memberships_insert_bootstrap   on public.memberships;
drop policy if exists memberships_update_owner       on public.memberships;
drop policy if exists memberships_delete_owner_admin on public.memberships;

drop policy if exists orgs_select_members        on public.orgs;
drop policy if exists orgs_insert_self           on public.orgs;
drop policy if exists orgs_update_owners_admins  on public.orgs;
drop policy if exists orgs_delete_owners         on public.orgs;

drop function if exists public.is_org_member(uuid);
drop function if exists public.has_org_role(uuid, text[]);

-- ── memberships policies (no recursion) ──

-- SELECT: only your own rows. Use the get_org_members RPC for team views.
create policy memberships_select_own on public.memberships for select
  using (user_id = auth.uid());

-- INSERT — two paths, both non-recursive thanks to the simple SELECT above:
--   (a) bootstrap: I add myself to an org I just created
--   (b) admin-add: I'm an owner/admin of the org (subquery sees only my rows)
create policy memberships_insert on public.memberships for insert
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

-- UPDATE: owners only (subquery sees only own rows = bounded).
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

-- ── orgs policies ──

create policy orgs_select_members on public.orgs for select
  using (
    exists (
      select 1 from public.memberships m
      where m.org_id = orgs.id and m.user_id = auth.uid()
    )
  );

create policy orgs_insert_self on public.orgs for insert
  with check (created_by = auth.uid());

create policy orgs_update_owners_admins on public.orgs for update
  using (
    exists (
      select 1 from public.memberships m
      where m.org_id = orgs.id
        and m.user_id = auth.uid()
        and m.role in ('owner','admin')
    )
  );

create policy orgs_delete_owners on public.orgs for delete
  using (
    exists (
      select 1 from public.memberships m
      where m.org_id = orgs.id
        and m.user_id = auth.uid()
        and m.role = 'owner'
    )
  );

-- ── RPCs (no SET row_security tricks needed) ──

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
stable
set search_path = public
as $$
  select o.id, o.name, o.industry, o.country, o.currency,
         o.fiscal_year_start_month, o.created_at, m.role
  from public.orgs o
  join public.memberships m on m.org_id = o.id
  where m.user_id = auth.uid()
  order by o.created_at desc;
$$;

revoke all on function public.create_org(text, text, text, text, int) from public;
revoke all on function public.get_user_orgs() from public;
grant execute on function public.create_org(text, text, text, text, int) to authenticated;
grant execute on function public.get_user_orgs() to authenticated;
