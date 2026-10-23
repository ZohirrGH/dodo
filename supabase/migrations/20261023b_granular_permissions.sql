-- Applied to project lfpbkvfcwbzqpjxcsowz on 2026-10-23 (kept here for the record).
-- Fine-grained, per-room permissions (create / edit / delete, their own vs anyone's).
-- Starting values reproduce the behaviour the database had before this migration.

-- 1. Where the per-room actions live, and the function the policies use to read them
alter table public.role_permissions add column if not exists actions jsonb not null default '{}'::jsonb;

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

-- 2. Seed from the caps already stored for each rank (management / write / writeAdvanced)
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

-- 3. Row-level-security policies now read has_perm() instead of fixed rank lists
alter policy "operations: everyone can create" on public.operations rename to "operations: create by permission";
alter policy "operations: create by permission" on public.operations with check (created_by = auth.uid() and public.has_perm('operations', 'create'));
alter policy "operations: creator or management can update" on public.operations rename to "operations: edit by permission";
alter policy "operations: edit by permission" on public.operations using (public.has_perm('operations', 'edit_all') or (created_by = auth.uid() and public.has_perm('operations', 'edit_own')));
alter policy "operations: creator or management can delete" on public.operations rename to "operations: delete by permission";
alter policy "operations: delete by permission" on public.operations using (public.has_perm('operations', 'delete_all') or (created_by = auth.uid() and public.has_perm('operations', 'delete_own')));

alter policy "wanted: master deputy and above can create" on public.wanted_persons rename to "wanted: create by permission";
alter policy "wanted: create by permission" on public.wanted_persons with check (created_by = auth.uid() and public.has_perm('wanted', 'create'));
alter policy "wanted: creator or chief can update" on public.wanted_persons rename to "wanted: edit by permission";
alter policy "wanted: edit by permission" on public.wanted_persons using (public.has_perm('wanted', 'edit_all') or (created_by = auth.uid() and public.has_perm('wanted', 'edit_own')));
alter policy "wanted: creator or chief can delete" on public.wanted_persons rename to "wanted: delete by permission";
alter policy "wanted: delete by permission" on public.wanted_persons using (public.has_perm('wanted', 'delete_all') or (created_by = auth.uid() and public.has_perm('wanted', 'delete_own')));

alter policy "officer_tests: master deputy and above can create" on public.officer_tests rename to "officer_tests: create by permission";
alter policy "officer_tests: create by permission" on public.officer_tests with check (created_by = auth.uid() and public.has_perm('tests', 'create'));
alter policy "officer_tests: creator or chief can update" on public.officer_tests rename to "officer_tests: edit by permission";
alter policy "officer_tests: edit by permission" on public.officer_tests using (public.has_perm('tests', 'edit_all') or (created_by = auth.uid() and public.has_perm('tests', 'edit_own')));
alter policy "officer_tests: creator or chief can delete" on public.officer_tests rename to "officer_tests: delete by permission";
alter policy "officer_tests: delete by permission" on public.officer_tests using (public.has_perm('tests', 'delete_all') or (created_by = auth.uid() and public.has_perm('tests', 'delete_own')));

alter policy "dispatch_logs: master deputy and above insert own" on public.dispatch_logs rename to "dispatch_logs: create by permission";
alter policy "dispatch_logs: create by permission" on public.dispatch_logs with check (officer_id = auth.uid() and public.has_perm('dispatch', 'create'));
alter policy "dispatch_logs: owner or chief can update" on public.dispatch_logs rename to "dispatch_logs: edit by permission";
alter policy "dispatch_logs: edit by permission" on public.dispatch_logs using (public.has_perm('dispatch', 'edit_all') or (officer_id = auth.uid() and public.has_perm('dispatch', 'edit_own')));
alter policy "dispatch_logs: owner or chief can delete" on public.dispatch_logs rename to "dispatch_logs: delete by permission";
alter policy "dispatch_logs: delete by permission" on public.dispatch_logs using (public.has_perm('dispatch', 'delete_all') or (officer_id = auth.uid() and public.has_perm('dispatch', 'delete_own')));

alter policy "vacation: officer creates own request" on public.vacation_requests rename to "vacation: create by permission";
alter policy "vacation: create by permission" on public.vacation_requests with check (officer_id = auth.uid() and public.has_perm('vacations', 'create'));
alter policy "vacation: management sees all, officer sees own" on public.vacation_requests rename to "vacation: reviewers see all, officer sees own";
alter policy "vacation: reviewers see all, officer sees own" on public.vacation_requests using (public.has_perm('vacations', 'review') or officer_id = auth.uid());
alter policy "vacation: only management can update status" on public.vacation_requests rename to "vacation: reviewers can update status";
alter policy "vacation: reviewers can update status" on public.vacation_requests using (public.has_perm('vacations', 'review'));

-- 4. Duty logs could not be edited at all (no UPDATE policy); owner or management can now
create policy "duty_logs: owner or management can update" on public.duty_logs for update to authenticated
  using (public.is_management() or officer_id = auth.uid())
  with check (public.is_management() or officer_id = auth.uid());
