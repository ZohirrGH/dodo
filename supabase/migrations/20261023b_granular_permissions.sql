-- DRAFT: NOT APPLIED to the database yet. Review before running.
-- Fine-grained, per-room permissions (create / edit / delete, own vs anyone's).
-- Starting values reproduce the behaviour the database had before this migration.

alter table public.role_permissions
  add column if not exists actions jsonb not null default '{}'::jsonb;

-- Seed from the caps already stored for each rank (management / write / writeAdvanced)
update public.role_permissions rp
set actions = jsonb_build_object(
  'operations', jsonb_build_object(
    'create', coalesce((rp.caps->>'write')::boolean, false),
    'edit_own', true,
    'edit_all', coalesce((rp.caps->>'management')::boolean, false),
    'delete_own', true,
    'delete_all', coalesce((rp.caps->>'management')::boolean, false)
  ),
  'wanted', jsonb_build_object(
    'create', coalesce((rp.caps->>'writeAdvanced')::boolean, false),
    'edit_own', true, 'edit_all', rp.rank = 'Chef Sheriff',
    'delete_own', true, 'delete_all', rp.rank = 'Chef Sheriff'
  ),
  'tests', jsonb_build_object(
    'create', coalesce((rp.caps->>'writeAdvanced')::boolean, false),
    'edit_own', true, 'edit_all', rp.rank = 'Chef Sheriff',
    'delete_own', true, 'delete_all', rp.rank = 'Chef Sheriff'
  ),
  'dispatch', jsonb_build_object(
    'create', coalesce((rp.caps->>'writeAdvanced')::boolean, false),
    'edit_own', true, 'edit_all', rp.rank = 'Chef Sheriff',
    'delete_own', true, 'delete_all', rp.rank = 'Chef Sheriff'
  ),
  'vacations', jsonb_build_object(
    'create', coalesce((rp.caps->>'write')::boolean, false),
    'review', coalesce((rp.caps->>'management')::boolean, false)
  )
);

-- Does the signed-in user's rank allow this action in this room? The Chef Sheriff always can.
create or replace function public.has_perm(p_room text, p_action text)
 returns boolean
 language sql
 stable
 security definer
 set search_path to 'public'
as $function$
  select coalesce((
    select p.rank = 'Chef Sheriff'
        or coalesce((rp.actions -> p_room ->> p_action)::boolean, false)
    from profiles p
    left join role_permissions rp on rp.rank = p.rank
    where p.id = auth.uid()
  ), false);
$function$;

revoke execute on function public.has_perm(text, text) from public, anon;
grant execute on function public.has_perm(text, text) to authenticated;

-- operations
drop policy if exists "operations: everyone can create" on public.operations;
drop policy if exists "operations: creator or management can update" on public.operations;
drop policy if exists "operations: creator or management can delete" on public.operations;
create policy "operations: create by permission" on public.operations for insert to authenticated
  with check (created_by = auth.uid() and public.has_perm('operations', 'create'));
create policy "operations: edit by permission" on public.operations for update to authenticated
  using (public.has_perm('operations', 'edit_all') or (created_by = auth.uid() and public.has_perm('operations', 'edit_own')));
create policy "operations: delete by permission" on public.operations for delete to authenticated
  using (public.has_perm('operations', 'delete_all') or (created_by = auth.uid() and public.has_perm('operations', 'delete_own')));

-- wanted persons
drop policy if exists "wanted: master deputy and above can create" on public.wanted_persons;
drop policy if exists "wanted: creator or chief can update" on public.wanted_persons;
drop policy if exists "wanted: creator or chief can delete" on public.wanted_persons;
create policy "wanted: create by permission" on public.wanted_persons for insert to authenticated
  with check (created_by = auth.uid() and public.has_perm('wanted', 'create'));
create policy "wanted: edit by permission" on public.wanted_persons for update to authenticated
  using (public.has_perm('wanted', 'edit_all') or (created_by = auth.uid() and public.has_perm('wanted', 'edit_own')));
create policy "wanted: delete by permission" on public.wanted_persons for delete to authenticated
  using (public.has_perm('wanted', 'delete_all') or (created_by = auth.uid() and public.has_perm('wanted', 'delete_own')));

-- officer tests
drop policy if exists "officer_tests: master deputy and above can create" on public.officer_tests;
drop policy if exists "officer_tests: creator or chief can update" on public.officer_tests;
drop policy if exists "officer_tests: creator or chief can delete" on public.officer_tests;
create policy "officer_tests: create by permission" on public.officer_tests for insert to authenticated
  with check (created_by = auth.uid() and public.has_perm('tests', 'create'));
create policy "officer_tests: edit by permission" on public.officer_tests for update to authenticated
  using (public.has_perm('tests', 'edit_all') or (created_by = auth.uid() and public.has_perm('tests', 'edit_own')));
create policy "officer_tests: delete by permission" on public.officer_tests for delete to authenticated
  using (public.has_perm('tests', 'delete_all') or (created_by = auth.uid() and public.has_perm('tests', 'delete_own')));

-- dispatch logs (an officer's own logs are the ones with officer_id = their id)
drop policy if exists "dispatch_logs: master deputy and above insert own" on public.dispatch_logs;
drop policy if exists "dispatch_logs: owner or chief can update" on public.dispatch_logs;
drop policy if exists "dispatch_logs: owner or chief can delete" on public.dispatch_logs;
create policy "dispatch_logs: create by permission" on public.dispatch_logs for insert to authenticated
  with check (officer_id = auth.uid() and public.has_perm('dispatch', 'create'));
create policy "dispatch_logs: edit by permission" on public.dispatch_logs for update to authenticated
  using (public.has_perm('dispatch', 'edit_all') or (officer_id = auth.uid() and public.has_perm('dispatch', 'edit_own')));
create policy "dispatch_logs: delete by permission" on public.dispatch_logs for delete to authenticated
  using (public.has_perm('dispatch', 'delete_all') or (officer_id = auth.uid() and public.has_perm('dispatch', 'delete_own')));

-- vacation requests ("review" = see everyone's requests and accept / reject them)
drop policy if exists "vacation: officer creates own request" on public.vacation_requests;
drop policy if exists "vacation: management sees all, officer sees own" on public.vacation_requests;
drop policy if exists "vacation: only management can update status" on public.vacation_requests;
create policy "vacation: create by permission" on public.vacation_requests for insert to authenticated
  with check (officer_id = auth.uid() and public.has_perm('vacations', 'create'));
create policy "vacation: reviewers see all, officer sees own" on public.vacation_requests for select to authenticated
  using (public.has_perm('vacations', 'review') or officer_id = auth.uid());
create policy "vacation: reviewers can update status" on public.vacation_requests for update to authenticated
  using (public.has_perm('vacations', 'review'));
