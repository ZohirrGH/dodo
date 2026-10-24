-- Fix: officers could not be deleted from the officers room.
-- Four foreign keys to public.profiles(id) had no ON DELETE action (NO ACTION), so deleting the auth user
-- failed whenever the officer was referenced there (activity logs, vacation reviews, operation chiefs, test examiners).
-- They become ON DELETE SET NULL: the row and its history stay, only the link to the deleted officer is cleared
-- (activity_logs keeps actor_name / target_name as text).

alter table public.activity_logs
  drop constraint activity_logs_actor_id_fkey,
  add constraint activity_logs_actor_id_fkey
    foreign key (actor_id) references public.profiles(id) on delete set null;

alter table public.vacation_requests
  drop constraint vacation_requests_reviewed_by_fkey,
  add constraint vacation_requests_reviewed_by_fkey
    foreign key (reviewed_by) references public.profiles(id) on delete set null;

alter table public.operations
  drop constraint operations_chief_id_fkey,
  add constraint operations_chief_id_fkey
    foreign key (chief_id) references public.profiles(id) on delete set null;

alter table public.officer_tests
  drop constraint officer_tests_tested_by_fkey,
  add constraint officer_tests_tested_by_fkey
    foreign key (tested_by) references public.profiles(id) on delete set null;
