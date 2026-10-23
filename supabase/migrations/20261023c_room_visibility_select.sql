-- Make room visibility real: SELECT on a room's data now requires that the signed-in user's rank
-- can see that room (role_permissions.rooms), instead of "any signed-in user".
-- Additive migration: one new function, one count function, ALTER POLICY only (no DROP / DELETE).

-- 1) has_room(room): Chef Sheriff always true, otherwise the rank's rooms flag (missing = false).
create or replace function public.has_room(p_room text)
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $$
  select coalesce((
    select p.rank = 'Chef Sheriff'
        or coalesce((rp.rooms ->> p_room)::boolean, false)
    from profiles p
    left join role_permissions rp on rp.rank = p.rank
    where p.id = auth.uid()
  ), false);
$$;

revoke execute on function public.has_room(text) from public, anon;
grant execute on function public.has_room(text) to authenticated;

-- 2) Aggregate-only helper: the dashboard card and officer profile show "operations joined" for any
--    officer, even when the viewer cannot open the Operations room. Returns a number, never rows.
create or replace function public.operations_count(p_officer uuid)
returns integer
language sql
stable
security definer
set search_path to 'public'
as $$
  select case when auth.uid() is null then 0 else (
    select count(*)::integer from operations
    where chief_id = p_officer or p_officer = any(member_ids)
  ) end;
$$;

revoke execute on function public.operations_count(uuid) from public, anon;
grant execute on function public.operations_count(uuid) to authenticated;

-- 3) Tighten the four SELECT policies (renamed so the name matches what they do).
alter policy "operations: everyone can read" on public.operations
  using (public.has_room('operations'));
alter policy "operations: everyone can read" on public.operations
  rename to "operations: read if room visible";

alter policy "wanted: everyone can read" on public.wanted_persons
  using (public.has_room('wanted'));
alter policy "wanted: everyone can read" on public.wanted_persons
  rename to "wanted: read if room visible";

alter policy "officer_tests: everyone can read" on public.officer_tests
  using (public.has_room('tests'));
alter policy "officer_tests: everyone can read" on public.officer_tests
  rename to "officer_tests: read if room visible";

alter policy "dispatch_logs: everyone can read" on public.dispatch_logs
  using (public.has_room('dispatch'));
alter policy "dispatch_logs: everyone can read" on public.dispatch_logs
  rename to "dispatch_logs: read if room visible";
