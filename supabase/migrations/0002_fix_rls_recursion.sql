-- Fix: RLS policies on `memberships` referenced `memberships` itself, which
-- triggers infinite recursion. Move the lookup into SECURITY DEFINER helpers
-- so the policy check bypasses RLS. Idempotent — safe to re-run.

-- ─── Helper functions ───────────────────────────────────────────────

create or replace function public.is_org_member(p_org_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.memberships
    where org_id = p_org_id and user_id = auth.uid()
  );
$$;

create or replace function public.has_org_role(p_org_id uuid, p_roles text[])
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.memberships
    where org_id = p_org_id and user_id = auth.uid() and role = any(p_roles)
  );
$$;

revoke all on function public.is_org_member(uuid) from public;
revoke all on function public.has_org_role(uuid, text[]) from public;
grant execute on function public.is_org_member(uuid) to authenticated;
grant execute on function public.has_org_role(uuid, text[]) to authenticated;

-- ─── Replace recursive policies on memberships ──────────────────────

drop policy if exists memberships_select_members   on public.memberships;
drop policy if exists memberships_insert_bootstrap on public.memberships;
drop policy if exists memberships_update_owner     on public.memberships;
drop policy if exists memberships_delete_owner_admin on public.memberships;

create policy memberships_select_members on public.memberships for select
  using (public.is_org_member(memberships.org_id));

create policy memberships_insert_bootstrap on public.memberships for insert
  with check (
    -- (a) creator self-bootstrap of a brand-new org
    (
      memberships.user_id = auth.uid()
      and exists (
        select 1 from public.orgs o
        where o.id = memberships.org_id and o.created_by = auth.uid()
      )
    )
    -- (b) acting owner/admin of the org
    or public.has_org_role(memberships.org_id, array['owner','admin'])
  );

create policy memberships_update_owner on public.memberships for update
  using (public.has_org_role(memberships.org_id, array['owner']));

create policy memberships_delete_owner_admin on public.memberships for delete
  using (public.has_org_role(memberships.org_id, array['owner','admin']));

-- ─── Tidy: same helpers on orgs (faster, consistent) ───────────────

drop policy if exists orgs_select_members        on public.orgs;
drop policy if exists orgs_update_owners_admins  on public.orgs;
drop policy if exists orgs_delete_owners         on public.orgs;

create policy orgs_select_members on public.orgs for select
  using (public.is_org_member(orgs.id));

create policy orgs_update_owners_admins on public.orgs for update
  using (public.has_org_role(orgs.id, array['owner','admin']));

create policy orgs_delete_owners on public.orgs for delete
  using (public.has_org_role(orgs.id, array['owner']));
