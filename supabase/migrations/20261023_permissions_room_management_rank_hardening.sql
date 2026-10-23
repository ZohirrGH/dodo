-- Applied to project lfpbkvfcwbzqpjxcsowz on 2026-10-23 (kept here for the record).

-- 1. Per-rank permissions edited from the "permissions" room (Chef Sheriff only)
create table if not exists public.role_permissions (
  rank text primary key,
  rooms jsonb not null default '{}'::jsonb,
  caps jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id) on delete set null,
  constraint role_permissions_rank_check check (rank = any (array[
    'Deputy','Deputy First Class','Master Deputy','Sergent','Lieutnant','Capitan','Major',
    'Division Chef','Assistant Chef','Management','Under Sheriff','Chef Sheriff'
  ]))
);

alter table public.role_permissions enable row level security;

create policy "role_permissions: signed-in users can read"
  on public.role_permissions for select to authenticated using (true);
create policy "role_permissions: chief can insert"
  on public.role_permissions for insert to authenticated with check (public.is_chief());
create policy "role_permissions: chief can update"
  on public.role_permissions for update to authenticated using (public.is_chief()) with check (public.is_chief());
create policy "role_permissions: chief can delete"
  on public.role_permissions for delete to authenticated using (public.is_chief());

-- Seed with the behaviour the app had before the permissions room existed
insert into public.role_permissions (rank, rooms, caps)
select t.r,
  jsonb_build_object(
    'dashboard', true, 'leaderboard', true, 'operations', true, 'wanted', true, 'tests', true, 'vacations', true,
    'officers', t.m, 'weekly', t.m, 'dispatch', t.a, 'activity', t.r = 'Chef Sheriff'
  ),
  jsonb_build_object('management', t.m, 'write', t.w, 'writeAdvanced', t.a)
from (
  select r,
         r in ('Chef Sheriff','Under Sheriff','Management','Assistant Chef','Division Chef','Major','Capitan','Lieutnant') as m,
         r <> 'Deputy' as w,
         r not in ('Deputy','Deputy First Class') as a
  from unnest(array[
    'Chef Sheriff','Under Sheriff','Management','Assistant Chef','Division Chef','Major',
    'Capitan','Lieutnant','Sergent','Master Deputy','Deputy First Class','Deputy'
  ]) as r
) t
on conflict (rank) do nothing;

-- 2. New rank: Management
alter table public.profiles drop constraint profiles_rank_check;
alter table public.profiles add constraint profiles_rank_check check (rank = any (array[
  'Deputy','Deputy First Class','Master Deputy','Sergent','Lieutnant','Capitan','Major',
  'Division Chef','Assistant Chef','Management','Under Sheriff','Chef Sheriff'
]));

create or replace function public.is_management()
 returns boolean
 language sql
 security definer
 set search_path to 'public'
as $function$
  select exists (
    select 1 from profiles
    where id = auth.uid()
    and rank in ('Chef Sheriff','Under Sheriff','Management','Assistant Chef','Division Chef','Major','Capitan','Lieutnant')
  );
$function$;

-- 3. Trigger functions must not be callable through the REST API
revoke execute on function public.log_operation_delete() from public, anon, authenticated;
revoke execute on function public.log_rank_change() from public, anon, authenticated;
revoke execute on function public.prevent_rank_selfchange() from public, anon, authenticated;
revoke execute on function public.protect_profile_columns() from public, anon, authenticated;

-- 4. Proof uploads: images only, 10 MB max
update storage.buckets
set file_size_limit = 10485760,
    allowed_mime_types = array['image/png','image/jpeg','image/webp','image/gif','image/heic','image/heif','image/avif']
where id = 'proofs';
