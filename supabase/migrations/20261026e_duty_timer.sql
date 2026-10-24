-- Duty timer: officers press Start / Stop instead of typing their hours.
-- Allowed window 14:00 -> 06:00 (Africa/Algiers). A session left open is closed
-- automatically at 06:00 and logged into duty_logs. Mirrors what is live on the project.

create table if not exists public.duty_sessions (
  officer_id uuid primary key references public.profiles(id) on delete cascade,
  started_at timestamptz not null default now()
);
alter table public.duty_sessions enable row level security;  -- no policies: only the functions below touch it

create or replace function public.duty_tz() returns text language sql immutable
as $$ select 'Africa/Algiers'::text $$;

create or replace function public.duty_window_open(p_at timestamptz default now())
returns boolean language sql stable set search_path to 'public' as $$
  select (p_at at time zone public.duty_tz())::time >= time '14:00'
      or (p_at at time zone public.duty_tz())::time <  time '06:00';
$$;

create or replace function public.duty_window_end(p_start timestamptz)
returns timestamptz language sql stable set search_path to 'public' as $$
  select ((case when (p_start at time zone public.duty_tz())::time >= time '14:00'
                then (p_start at time zone public.duty_tz())::date + 1
                else (p_start at time zone public.duty_tz())::date end) + time '06:00') at time zone public.duty_tz();
$$;

create or replace function public.duty_next_change()
returns timestamptz language sql stable set search_path to 'public' as $$
  select case when public.duty_window_open()
              then public.duty_window_end(now())
              else ((now() at time zone public.duty_tz())::date + time '14:00') at time zone public.duty_tz() end;
$$;

create or replace function public._duty_finish(p_officer uuid, p_end timestamptz)
returns jsonb language plpgsql security definer set search_path to 'public' as $$
declare
  s timestamptz; e timestamptz; hrs numeric; tz text := public.duty_tz();
begin
  delete from public.duty_sessions where officer_id = p_officer returning started_at into s;
  if s is null then return jsonb_build_object('logged', false); end if;
  e := greatest(least(p_end, public.duty_window_end(s)), s);
  hrs := round(extract(epoch from (e - s)) / 3600.0, 2);
  if hrs < 0.02 then return jsonb_build_object('logged', false, 'too_short', true); end if;
  insert into public.duty_logs (officer_id, work_date, time_in, time_out, duration_hours)
  values (p_officer, (s at time zone tz)::date, to_char(s at time zone tz, 'HH24:MI'), to_char(e at time zone tz, 'HH24:MI'), hrs);
  return jsonb_build_object('logged', true, 'duration_hours', hrs,
    'time_in', to_char(s at time zone tz, 'HH24:MI'), 'time_out', to_char(e at time zone tz, 'HH24:MI'));
end; $$;

create or replace function public.duty_close_expired()
returns integer language plpgsql security definer set search_path to 'public' as $$
declare r record; n integer := 0;
begin
  for r in select officer_id, started_at from public.duty_sessions where public.duty_window_end(started_at) <= now() loop
    perform public._duty_finish(r.officer_id, public.duty_window_end(r.started_at));
    n := n + 1;
  end loop;
  return n;
end; $$;

create or replace function public.duty_status()
returns jsonb language sql stable security definer set search_path to 'public' as $$
  select jsonb_build_object(
    'server_now', now(),
    'started_at', (select started_at from public.duty_sessions where officer_id = auth.uid()),
    'on_duty', (select count(*)::int from public.duty_sessions s join public.profiles p on p.id = s.officer_id
                where p.rank <> 'Galaxy Citizen' and public.duty_window_end(s.started_at) > now()),
    'window_open', public.duty_window_open(),
    'changes_at', public.duty_next_change());
$$;

create or replace function public.duty_start()
returns jsonb language plpgsql security definer set search_path to 'public' as $$
declare me uuid := auth.uid();
begin
  if me is null then raise exception 'not signed in' using errcode = '28000'; end if;
  if not exists (select 1 from public.profiles where id = me and rank <> 'Galaxy Citizen') then
    raise exception 'officers only' using errcode = '42501'; end if;
  if not public.duty_window_open() then raise exception 'outside_hours' using errcode = 'P0001'; end if;
  insert into public.duty_sessions (officer_id) values (me) on conflict (officer_id) do nothing;
  return public.duty_status();
end; $$;

create or replace function public.duty_stop()
returns jsonb language plpgsql security definer set search_path to 'public' as $$
begin
  if auth.uid() is null then raise exception 'not signed in' using errcode = '28000'; end if;
  return public._duty_finish(auth.uid(), now());
end; $$;

revoke all on function public.duty_start(), public.duty_stop(), public.duty_status() from public, anon;
grant execute on function public.duty_start(), public.duty_stop(), public.duty_status() to authenticated;

-- Hours can no longer be typed by hand: only the timer inserts into duty_logs.
drop policy if exists "duty_logs: officer inserts own logs" on public.duty_logs;

-- Auto-close every 5 minutes
select cron.schedule('duty-auto-close', '*/5 * * * *', $$ select public.duty_close_expired(); $$);
