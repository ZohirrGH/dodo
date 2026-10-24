-- Editing / deleting other officers' duty logs now follows the permissions room ("Duty time logs").
-- Management ranks start with both switches on, exactly like before; the Chef Sheriff can change them per rank.

update public.role_permissions
set actions = jsonb_set(coalesce(actions, '{}'::jsonb), '{duty}',
      jsonb_build_object('edit_all', true, 'delete_all', true), true)
where rank in ('Chef Sheriff','Under Sheriff','Management','Assistant Chef','Division Chef','Major','Capitan','Lieutnant');

update public.role_permissions
set actions = jsonb_set(coalesce(actions, '{}'::jsonb), '{duty}',
      jsonb_build_object('edit_all', false, 'delete_all', false), true)
where rank not in ('Chef Sheriff','Under Sheriff','Management','Assistant Chef','Division Chef','Major','Capitan','Lieutnant');

alter policy "duty_logs: owner or management can update" on public.duty_logs
  using (public.has_perm('duty', 'edit_all'))
  with check (public.has_perm('duty', 'edit_all'));

alter policy "duty_logs: owner or management can delete" on public.duty_logs
  using (officer_id = auth.uid() or public.has_perm('duty', 'delete_all'));
