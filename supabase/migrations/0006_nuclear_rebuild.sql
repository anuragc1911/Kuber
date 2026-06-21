-- Nuclear rebuild: drop ALL policies on orgs + memberships (regardless of name),
-- drop helper functions, and recreate from scratch with the non-recursive structure.

-- ── Drop every policy on these two tables ──
do $$
declare r record;
begin
  for r in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public' and tablename in ('orgs','memberships')
  loop
    execute format('drop policy if exists %I on %I.%I', r.policyname, r.schemaname, r.tablename);
  end loop;
end
$$;

-- ── Drop helpers if they exist (in any signature) ──
do $$
declare r record;
begin
  for r in
    select n.nspname, p.proname, pg_get_function_identity_arguments(p.oid) as args
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname in ('is_org_member','has_org_role')
  loop
    execute format('drop function if exists %I.%I(%s) cascade', r.nspname, r.proname, r.args);
  end loop;
end
$$;

-- Confirm RLS still on
alter table public.orgs        enable row level security;
alter table public.memberships enable row level security;

-- ── memberships policies (NO recursion) ──

-- SELECT: only your own rows. (Use a get_org_members RPC for team views.)
create policy memberships_select_own on public.memberships for select
  using (user_id = auth.uid());

-- INSERT — bootstrap (creator self-add) OR owner/admin add.
-- Subqueries hit memberships' own SELECT policy (`user_id = auth.uid()`),
-- so they only see the caller's rows — non-recursive.
create policy memberships_insert on public.memberships for insert
  with check (
    (
      memberships.user_id = auth.uid()
      and exists (
        select 1 from public.orgs o
        where o.id = memberships.org_id and o.created_by = auth.uid()
      )
    )
    or exists (
      select 1 from public.memberships m
      where m.org_id = memberships.org_id
        and m.user_id = auth.uid()
        and m.role in ('owner','admin')
    )
  );

create policy memberships_update_owner on public.memberships for update
  using (
    exists (
      select 1 from public.memberships m
      where m.org_id = memberships.org_id
        and m.user_id = auth.uid()
        and m.role = 'owner'
    )
  );

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

-- ── Diagnostic view: see what policies exist ──
-- After running, paste this SELECT to verify in the SQL editor:
--   select policyname, cmd, qual, with_check from pg_policies
--   where schemaname='public' and tablename in ('orgs','memberships')
--   order by tablename, cmd;
