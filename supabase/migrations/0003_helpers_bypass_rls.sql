-- Fix: SECURITY DEFINER alone doesn't bypass RLS in Postgres 15+. Add an
-- explicit `SET row_security = off` so the helpers don't re-trigger
-- policies on `memberships` (which would cause infinite recursion).
-- The Supabase `postgres` role has BYPASSRLS, so this is safe.

create or replace function public.is_org_member(p_org_id uuid)
returns boolean
language plpgsql
security definer
stable
set search_path = public
set row_security = off
as $$
begin
  return exists (
    select 1 from public.memberships
    where org_id = p_org_id and user_id = auth.uid()
  );
end;
$$;

create or replace function public.has_org_role(p_org_id uuid, p_roles text[])
returns boolean
language plpgsql
security definer
stable
set search_path = public
set row_security = off
as $$
begin
  return exists (
    select 1 from public.memberships
    where org_id = p_org_id and user_id = auth.uid() and role = any(p_roles)
  );
end;
$$;

-- Same fix for the existing RPCs — they read memberships too.
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
set row_security = off
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
set row_security = off
as $$
  select o.id, o.name, o.industry, o.country, o.currency,
         o.fiscal_year_start_month, o.created_at, m.role
  from public.orgs o
  join public.memberships m on m.org_id = o.id
  where m.user_id = auth.uid()
  order by o.created_at desc;
$$;

revoke all on function public.is_org_member(uuid) from public;
revoke all on function public.has_org_role(uuid, text[]) from public;
revoke all on function public.create_org(text, text, text, text, int) from public;
revoke all on function public.get_user_orgs() from public;
grant execute on function public.is_org_member(uuid) to authenticated;
grant execute on function public.has_org_role(uuid, text[]) to authenticated;
grant execute on function public.create_org(text, text, text, text, int) to authenticated;
grant execute on function public.get_user_orgs() to authenticated;
