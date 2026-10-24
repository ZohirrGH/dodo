-- CV Sheriff recruitment flow.
-- NOT YET APPLIED to project lfpbkvfcwbzqpjxcsowz: apply only after the owner's OK.
--
-- What this does
--   1. New rank "Galaxy Citizen" (profiles + role_permissions check constraints, role_permissions row,
--      discord_role_map row for the Discord role GALAXY CITIZEN with the lowest priority).
--   2. rules_sections.visibility ('public' | 'staff'); citizens only read the public chapters.
--   3. cv_applications table, read-only for the app; every write goes through a function
--      (submit_cv, delete_my_cv) or through the review-cv edge function (service role).
--   4. Cooldown after a rejection (7 days, see cv_cooldown()). It is computed from the rejected rows
--      INCLUDING soft-deleted ones and is keyed on discord_id, so deleting the request cannot skip it.
--   5. Permissions: room "cv", actions create / review. Closed for every rank except Galaxy Citizen
--      (create) and the Chef Sheriff (review); the Chef Sheriff opens it per rank in the permissions room.
--   6. Two small hardening fixes so a citizen cannot touch officer data (duty_logs insert, operations_count).

-- 1) Rank ------------------------------------------------------------------------------------------
alter table public.profiles drop constraint profiles_rank_check;
alter table public.profiles add constraint profiles_rank_check check (rank = any (array[
  'Deputy','Deputy First Class','Master Deputy','Sergent','Lieutnant','Capitan','Major',
  'Division Chef','Assistant Chef','Management','Under Sheriff','Chef Sheriff','Galaxy Citizen'
]));

alter table public.role_permissions drop constraint role_permissions_rank_check;
alter table public.role_permissions add constraint role_permissions_rank_check check (rank = any (array[
  'Deputy','Deputy First Class','Master Deputy','Sergent','Lieutnant','Capitan','Major',
  'Division Chef','Assistant Chef','Management','Under Sheriff','Chef Sheriff','Galaxy Citizen'
]));

create or replace function public.is_galaxy_citizen()
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $$
  select exists (select 1 from profiles where id = auth.uid() and rank = 'Galaxy Citizen');
$$;
revoke execute on function public.is_galaxy_citizen() from public, anon;
grant execute on function public.is_galaxy_citizen() to authenticated;

-- Discord role GALAXY CITIZEN -> rank Galaxy Citizen. Priority 0 is below every officer rank (they start at 1),
-- so someone who is both a citizen and an officer keeps the officer rank.
insert into public.discord_role_map (discord_role_id, rank, priority)
select '1563459942785097798', 'Galaxy Citizen', 0
where not exists (select 1 from public.discord_role_map where discord_role_id = '1563459942785097798');

-- 2) Rules: public / staff chapters ----------------------------------------------------------------
do $$
begin
  if not exists (select 1 from information_schema.columns
                 where table_schema = 'public' and table_name = 'rules_sections' and column_name = 'visibility') then
    alter table public.rules_sections
      add column visibility text not null default 'staff' check (visibility in ('public', 'staff'));
    -- Starting choice (change it from the chapter form): the four general chapters are public
    update public.rules_sections set visibility = 'public'
    where title in ('Miranda Rights', 'Bill System', '10-Codes', 'GX_PD Operational Codes');
  end if;
end $$;

alter policy "rules: read if room visible" on public.rules_sections
  using (public.has_room('rules') and (visibility = 'public' or not public.is_galaxy_citizen()));

-- 3) Applications ----------------------------------------------------------------------------------
create table if not exists public.cv_applications (
  id            uuid primary key default gen_random_uuid(),
  applicant_id  uuid references public.profiles(id) on delete set null,
  discord_id    text not null,
  name_rp       text not null check (char_length(name_rp) between 2 and 60),
  age_irl       integer not null check (age_irl between 10 and 99),
  age_rp        integer not null check (age_rp between 10 and 99),
  sex           text not null check (sex in ('male', 'female')),
  experience    text not null check (char_length(experience) between 1 and 1500),
  availability  text not null check (char_length(availability) between 1 and 100),
  status        text not null default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  reject_reason text check (reject_reason is null or char_length(reject_reason) <= 500),
  reviewed_by   uuid references public.profiles(id) on delete set null,
  reviewed_at   timestamptz,
  deleted_at    timestamptz,
  created_at    timestamptz not null default now(),
  constraint cv_rejected_needs_reason check (status <> 'rejected' or char_length(btrim(coalesce(reject_reason, ''))) >= 3)
);

-- one active (pending, not deleted) application per person
create unique index if not exists cv_one_pending_per_person
  on public.cv_applications (discord_id) where status = 'pending' and deleted_at is null;
create index if not exists cv_by_discord on public.cv_applications (discord_id, status);
create index if not exists cv_by_created on public.cv_applications (created_at desc);

alter table public.cv_applications enable row level security;
revoke all on public.cv_applications from anon;
revoke insert, update, delete on public.cv_applications from authenticated;   -- writes only via the functions below / the edge function

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'cv_applications' and policyname = 'cv: read own or review') then
    create policy "cv: read own or review" on public.cv_applications for select to authenticated
      using (deleted_at is null and (applicant_id = auth.uid() or public.has_perm('cv', 'review')));
  end if;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.cv_applications;
exception when others then null;
end $$;

-- Waiting time after a rejection. Change it here (and re-run this function) to change it for everybody.
create or replace function public.cv_cooldown()
returns interval
language sql
immutable
as $$ select interval '7 days'; $$;

-- What can the signed-in person do right now?  { can_apply, reason, next_apply_at }
-- reason: null | not_allowed | no_discord | accepted | pending | cooldown
create or replace function public.cv_apply_status()
returns jsonb
language plpgsql
stable
security definer
set search_path to 'public'
as $$
declare
  v_did text;
  v_last timestamptz;
begin
  select discord_id into v_did from profiles where id = auth.uid();
  if auth.uid() is null or not public.has_perm('cv', 'create') then
    return jsonb_build_object('can_apply', false, 'reason', 'not_allowed');
  end if;
  if v_did is null then
    return jsonb_build_object('can_apply', false, 'reason', 'no_discord');
  end if;
  -- deleted rows count on purpose: deleting a request never resets these rules
  if exists (select 1 from cv_applications where discord_id = v_did and status = 'accepted') then
    return jsonb_build_object('can_apply', false, 'reason', 'accepted');
  end if;
  if exists (select 1 from cv_applications where discord_id = v_did and status = 'pending' and deleted_at is null) then
    return jsonb_build_object('can_apply', false, 'reason', 'pending');
  end if;
  select max(reviewed_at) into v_last from cv_applications where discord_id = v_did and status = 'rejected';
  if v_last is not null and v_last + public.cv_cooldown() > now() then
    return jsonb_build_object('can_apply', false, 'reason', 'cooldown', 'next_apply_at', v_last + public.cv_cooldown());
  end if;
  return jsonb_build_object('can_apply', true, 'reason', null);
end;
$$;
revoke execute on function public.cv_apply_status() from public, anon;
grant execute on function public.cv_apply_status() to authenticated;

-- Send a CV. The Discord id comes from the person's profile, never from the browser.
create or replace function public.submit_cv(
  p_name_rp text, p_age_irl integer, p_age_rp integer, p_sex text, p_experience text, p_availability text
)
returns uuid
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_did text;
  v_state jsonb;
  v_id uuid;
begin
  select discord_id into v_did from profiles where id = auth.uid();
  if v_did is not null then
    perform pg_advisory_xact_lock(hashtext('cv:' || v_did));
  end if;
  v_state := public.cv_apply_status();
  if not (v_state ->> 'can_apply')::boolean then
    raise exception 'cannot apply: %', coalesce(v_state ->> 'reason', 'not_allowed') using errcode = 'P0001', detail = v_state::text;
  end if;
  insert into cv_applications (applicant_id, discord_id, name_rp, age_irl, age_rp, sex, experience, availability)
  values (auth.uid(), v_did, btrim(p_name_rp), p_age_irl, p_age_rp, p_sex, btrim(p_experience), btrim(p_availability))
  returning id into v_id;
  return v_id;
end;
$$;
revoke execute on function public.submit_cv(text, integer, integer, text, text, text) from public, anon;
grant execute on function public.submit_cv(text, integer, integer, text, text, text) to authenticated;

-- Applicants delete (hide) their own pending / rejected request. The row stays, so the cooldown stays.
create or replace function public.delete_my_cv(p_id uuid)
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_status text;
begin
  select status into v_status from cv_applications where id = p_id and applicant_id = auth.uid() and deleted_at is null;
  if v_status is null then
    raise exception 'request not found' using errcode = 'P0002';
  end if;
  if v_status = 'accepted' then
    raise exception 'an accepted request cannot be deleted' using errcode = '42501';
  end if;
  update cv_applications set deleted_at = now() where id = p_id;
end;
$$;
revoke execute on function public.delete_my_cv(uuid) from public, anon;
grant execute on function public.delete_my_cv(uuid) to authenticated;

-- 4) Permissions -----------------------------------------------------------------------------------
-- Every officer rank: room closed, review only for the Chef Sheriff (he opens it per rank in the permissions room)
update public.role_permissions
set rooms = rooms || '{"cv": false}'::jsonb
where rank <> 'Galaxy Citizen' and not (rooms ? 'cv');

update public.role_permissions
set actions = actions || jsonb_build_object('cv', jsonb_build_object('create', false, 'review', rank = 'Chef Sheriff'))
where rank <> 'Galaxy Citizen' and not (actions ? 'cv');

-- Citizens: rooms rules + cv only, and they may send a CV
insert into public.role_permissions (rank, rooms, actions)
values ('Galaxy Citizen',
        '{"rules": true, "cv": true}'::jsonb,
        '{"cv": {"create": true, "review": false}}'::jsonb)
on conflict (rank) do nothing;

-- 5) Keep citizens away from officer data ------------------------------------------------------------
-- can_write() / can_write_advanced() say "anyone who is not Deputy", which would include citizens. No policy uses
-- them today, but make them safe in case one does later.
create or replace function public.can_write()
returns boolean language sql security definer set search_path to 'public'
as $$ select exists (select 1 from profiles where id = auth.uid() and rank not in ('Deputy', 'Galaxy Citizen')); $$;

create or replace function public.can_write_advanced()
returns boolean language sql security definer set search_path to 'public'
as $$ select exists (select 1 from profiles where id = auth.uid() and rank not in ('Deputy', 'Deputy First Class', 'Galaxy Citizen')); $$;

-- a citizen cannot add duty logs
alter policy "duty_logs: officer inserts own logs" on public.duty_logs
  with check (officer_id = auth.uid() and not public.is_galaxy_citizen());

-- operations_count answers 0 for citizens
create or replace function public.operations_count(p_officer uuid)
returns integer
language sql
stable
security definer
set search_path to 'public'
as $$
  select case when auth.uid() is null or public.is_galaxy_citizen() then 0 else (
    select count(*)::integer from operations
    where chief_id = p_officer or p_officer = any(member_ids)
  ) end;
$$;
