-- Presence room v2: shift attendance (who pressed Start shift, who worked today and for how long, who is on shift now).
-- Apply AFTER 20261027_duty_hardening_access_revocations.sql. Everything is CREATE OR REPLACE / guarded, so it can be re-run.
--
--   1. New permission  duty.stop_all  : end another officer's running shift (closed by default, the Chef Sheriff always has it).
--   2. shift_presence(p_day)          : the room's data (needs the presence room).
--   3. shift_force_stop(p_officer)    : ends the shift and saves the hours (needs duty.stop_all). Written to activity_logs.
--   4. shift_delete_log(p_log)        : deletes a saved shift (needs duty.delete_all). Written to activity_logs.

-- 1) the new switch ---------------------------------------------------------------------------------------
-- Only ranks that have no stop_all setting yet are touched, so re-running never overrides a choice made in the permissions room.
update public.role_permissions
set actions = jsonb_set(
      coalesce(actions, '{}'::jsonb), '{duty}',
      coalesce(actions -> 'duty', '{}'::jsonb) || jsonb_build_object('stop_all', (rank = 'Chef Sheriff')), true)
where not (coalesce(actions -> 'duty', '{}'::jsonb) ? 'stop_all');

-- 2) the room's data --------------------------------------------------------------------------------------
-- p_day is a calendar day in Africa/Algiers (null = today). A shift belongs to the day it STARTED on (same as duty_logs.work_date).
create or replace function public.shift_presence(p_day date default null)
returns jsonb
language plpgsql
volatile
security definer
set search_path to 'public'
as $$
declare
  tz text := public.duty_tz();
  today date := (now() at time zone public.duty_tz())::date;
  d date;
begin
  if auth.uid() is null or not public.has_room('presence') then
    raise exception 'not allowed' using errcode = '42501';
  end if;

  perform public.duty_close_expired();
  d := least(coalesce(p_day, today), today);

  return jsonb_build_object(
    'server_now', now(),
    'day', d,
    'today', today,
    'can_stop', public.has_perm('duty', 'stop_all'),
    'can_delete', public.has_perm('duty', 'delete_all'),
    'max_seconds', extract(epoch from public.duty_max_len())::int,
    -- everybody who is on shift right now, whatever day they started on
    'on_shift', coalesce((
      select jsonb_agg(jsonb_build_object(
               'id', p.id, 'name', p.name, 'rank', p.rank, 'badge', p.badge, 'avatar_url', p.avatar_url,
               'started_at', s.started_at, 'ends_at', public.duty_session_end(s.started_at))
             order by s.started_at)
      from public.duty_sessions s
      join public.profiles p on p.id = s.officer_id
      where p.rank <> 'Galaxy Citizen'), '[]'::jsonb),
    -- the table of the chosen day: saved shifts plus a shift that is still running
    'rows', coalesce((
      select jsonb_agg(r order by (r ->> 'running')::boolean desc, (r ->> 'total_hours')::numeric desc, r ->> 'name')
      from (
        select jsonb_build_object(
                 'id', p.id, 'name', p.name, 'rank', p.rank, 'badge', p.badge, 'avatar_url', p.avatar_url,
                 'running', (cur.started_at is not null),
                 'started_at', cur.started_at,
                 'ends_at', case when cur.started_at is null then null else public.duty_session_end(cur.started_at) end,
                 'total_hours', coalesce(sum(l.duration_hours), 0),
                 'shifts', count(l.id),
                 'first_in', min(l.time_in),
                 'logs', coalesce(jsonb_agg(jsonb_build_object(
                           'id', l.id, 'time_in', l.time_in, 'time_out', l.time_out,
                           'duration_hours', l.duration_hours, 'note', l.note) order by l.created_at)
                           filter (where l.id is not null), '[]'::jsonb)
               ) as r
        from public.profiles p
        left join public.duty_logs l on l.officer_id = p.id and l.work_date = d
        left join public.duty_sessions cur on cur.officer_id = p.id
                                          and (cur.started_at at time zone tz)::date = d
        where p.rank <> 'Galaxy Citizen'
          and (l.id is not null or cur.started_at is not null)
        group by p.id, p.name, p.rank, p.badge, p.avatar_url, cur.started_at
      ) t), '[]'::jsonb)
  );
end;
$$;

-- 3) end somebody else's shift ----------------------------------------------------------------------------
create or replace function public.shift_force_stop(p_officer uuid)
returns jsonb
language plpgsql
volatile
security definer
set search_path to 'public'
as $$
declare
  me uuid := auth.uid();
  res jsonb;
  actor_n text;
  target_n text;
begin
  if me is null or not public.has_perm('duty', 'stop_all') then
    raise exception 'not allowed' using errcode = '42501';
  end if;
  if not exists (select 1 from public.duty_sessions where officer_id = p_officer) then
    raise exception 'no_active_shift' using errcode = 'P0001';
  end if;

  select name into actor_n from public.profiles where id = me;
  select name into target_n from public.profiles where id = p_officer;

  res := public._duty_finish(p_officer, now());

  insert into public.activity_logs (actor_id, actor_name, action, target_id, target_name, details)
  values (me, actor_n, 'shift_stop', p_officer, target_n,
          case when coalesce((res ->> 'logged')::boolean, false)
               then format('%s h saved (%s → %s)', res ->> 'duration_hours', res ->> 'time_in', res ->> 'time_out')
               else 'ended before 1 minute, nothing was saved' end);
  return res;
end;
$$;

-- 4) delete a saved shift ---------------------------------------------------------------------------------
create or replace function public.shift_delete_log(p_log uuid)
returns void
language plpgsql
volatile
security definer
set search_path to 'public'
as $$
declare
  me uuid := auth.uid();
  rec public.duty_logs%rowtype;
  actor_n text;
  target_n text;
begin
  if me is null or not public.has_perm('duty', 'delete_all') then
    raise exception 'not allowed' using errcode = '42501';
  end if;

  delete from public.duty_logs where id = p_log returning * into rec;
  if rec.id is null then
    raise exception 'not_found' using errcode = 'P0002';
  end if;

  select name into actor_n from public.profiles where id = me;
  select name into target_n from public.profiles where id = rec.officer_id;

  insert into public.activity_logs (actor_id, actor_name, action, target_id, target_name, details)
  values (me, actor_n, 'shift_delete', rec.officer_id, target_n,
          format('%s, %s → %s (%s h)', rec.work_date, rec.time_in, rec.time_out, rec.duration_hours));
end;
$$;

revoke all on function public.shift_presence(date), public.shift_force_stop(uuid), public.shift_delete_log(uuid) from public, anon;
grant execute on function public.shift_presence(date), public.shift_force_stop(uuid), public.shift_delete_log(uuid) to authenticated;
