-- Debug: does auth.uid() return the expected value when called via RPC?
create or replace function public.whoami()
returns text
language sql
stable
as $$
  select coalesce(auth.uid()::text, 'NULL')
$$;
grant execute on function public.whoami() to authenticated, anon;
