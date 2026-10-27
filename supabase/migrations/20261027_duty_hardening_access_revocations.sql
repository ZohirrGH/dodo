-- Hardening that is NOT in 20261026h / 20261026i (those already lock ranks to Discord and add the Presence room).
-- Apply AFTER 20261026i_presence_server_day.sql. Everything is CREATE OR REPLACE / IF NOT EXISTS, so it can be re-run.
--
--   1. duty_logs: typed hours are checked by the database (the browser can no longer send any number it likes).
--   2. duty_status(): Galaxy Citizens no longer receive the on-duty roster (names, ranks, badges).
--   3. access_revocations: remembers who lost access in Discord (used by the discord-auth function).

-- 1) duty_logs: the database checks typed hours -----------------------------------------------------------
-- Same reading rules as the site (parseTimeToHours / computeDuration in App.jsx): "17", "17.5", "17,5", "17:30".
-- Everything the site can produce is accepted (up to 24 h, the same as before); only numbers that do not match
-- time in / time out are refused, for example 500 hours typed straight to the API.
create or replace function public._clock_hours(p_text text)
returns numeric
language plpgsql
immutable
set search_path to 'public'
as $$
declare
  s text;
  parts text[];
  h numeric;
  m numeric;
begin
  if p_text is null then return null; end if;
  s := replace(btrim(p_text), ',', '.');
  if s ~ '^[0-9]{1,2}:[0-9]{1,2}$' then
    parts := string_to_array(s, ':');
    h := parts[1]::numeric;
    m := parts[2]::numeric;
    if h > 24 or m > 59 then return null; end if;
    return h + m / 60.0;
  end if;
  if s ~ '^[0-9]{1,2}(\.[0-9]+)?$' then
    h := s::numeric;
    if h > 24 then return null; end if;
    return h;
  end if;
  return null;
end;
$$;

create or replace function public.validate_duty_log()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  a numeric;
  b numeric;
  diff numeric;
begin
  -- rows written by the duty timer are produced by the server itself (see _duty_finish below)
  if current_setting('app.duty_timer', true) = '1' then return new; end if;
  -- editing something else on an old row (a note, say) is not re-checked
  if tg_op = 'UPDATE'
     and new.time_in is not distinct from old.time_in
     and new.time_out is not distinct from old.time_out
     and new.duration_hours is not distinct from old.duration_hours then
    return new;
  end if;

  a := public._clock_hours(new.time_in);
  b := public._clock_hours(new.time_out);
  if a is null or b is null then
    raise exception 'invalid time format' using errcode = '22023';
  end if;
  diff := b - a;
  if diff <= 0 then diff := diff + 24; end if;
  diff := round(diff, 2);

  if new.duration_hours is null or new.duration_hours <= 0 or new.duration_hours > 24 then
    raise exception 'a log must be longer than 0 and at most 24 hours' using errcode = '22023';
  end if;
  if abs(new.duration_hours - diff) > 0.02 then
    raise exception 'the duration does not match time in / time out' using errcode = '22023';
  end if;
  return new;
end;
$$;
revoke execute on function public.validate_duty_log() from public, anon, authenticated;

drop trigger if exists trg_validate_duty_log on public.duty_logs;
create trigger trg_validate_duty_log
  before insert or update on public.duty_logs
  for each row execute function public.validate_duty_log();

-- Same body as the one in 20261026g, plus the flag that tells validate_duty_log() "this row comes from the timer".
create or replace function public._duty_finish(p_officer uuid, p_end timestamptz)
returns jsonb language plpgsql security definer set search_path to 'public' as $$
declare
  s timestamptz; e timestamptz; hrs numeric; tz text := public.duty_tz();
begin
  delete from public.duty_sessions where officer_id = p_officer returning started_at into s;
  if s is null then return jsonb_build_object('logged', false); end if;
  e := greatest(least(p_end, public.duty_session_end(s)), s);
  hrs := round(extract(epoch from (e - s)) / 3600.0, 2);
  if hrs < 0.02 then return jsonb_build_object('logged', false, 'too_short', true); end if;
  perform set_config('app.duty_timer', '1', true);
  insert into public.duty_logs (officer_id, work_date, time_in, time_out, duration_hours)
  values (p_officer, (s at time zone tz)::date, to_char(s at time zone tz, 'HH24:MI'), to_char(e at time zone tz, 'HH24:MI'), hrs);
  perform set_config('app.duty_timer', '', true);
  return jsonb_build_object('logged', true, 'duration_hours', hrs,
    'time_in', to_char(s at time zone tz, 'HH24:MI'), 'time_out', to_char(e at time zone tz, 'HH24:MI'));
end; $$;

-- 2) duty_status(): no roster for Galaxy Citizens ---------------------------------------------------------
-- Same as in 20261026g, except that citizens get an empty on_duty_list (the number on duty is still shown).
create or replace function public.duty_status()
returns jsonb language plpgsql volatile security definer set search_path to 'public' as $$
declare me uuid := auth.uid(); my_start timestamptz; citizen boolean := public.is_galaxy_citizen();
begin
  perform public.duty_close_expired();
  select started_at into my_start from public.duty_sessions where officer_id = me;
  return jsonb_build_object(
    'server_now', now(),
    'started_at', my_start,
    'ends_at', case when my_start is null then null else public.duty_session_end(my_start) end,
    'max_seconds', extract(epoch from public.duty_max_len())::int,
    'on_duty', (select count(*)::int from public.duty_sessions s join public.profiles p on p.id = s.officer_id
                where p.rank <> 'Galaxy Citizen'),
    'on_duty_list', case when citizen then '[]'::jsonb else coalesce((select jsonb_agg(jsonb_build_object(
                        'id', p.id, 'name', p.name, 'rank', p.rank, 'badge', p.badge, 'started_at', s.started_at)
                      order by s.started_at)
                    from public.duty_sessions s join public.profiles p on p.id = s.officer_id
                    where p.rank <> 'Galaxy Citizen'), '[]'::jsonb) end,
    'window_open', public.duty_window_open(),
    'changes_at', public.duty_next_change());
end; $$;

revoke all on function public.duty_status() from public, anon;
grant execute on function public.duty_status() to authenticated;

-- 3) Who lost access in Discord ---------------------------------------------------------------------------
-- Written and read only by the discord-auth function (service role). RLS on, no policies, on purpose.
create table if not exists public.access_revocations (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  revoked_at timestamptz not null default now(),
  reason     text
);
alter table public.access_revocations enable row level security;
revoke all on public.access_revocations from anon, authenticated;
