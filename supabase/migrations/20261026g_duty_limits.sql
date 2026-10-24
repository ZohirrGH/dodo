-- Duty timer v2
--   1. A shift can last 8 hours at most (on top of the 14:00 -> 06:00 window): whichever comes first closes it.
--   2. duty_status() also returns the live roster of who is on duty, and closes expired sessions on every call
--      (no more waiting for the 5-minute cron).
--   3. Manual time entry is back: officers can type their own hours again (the timer keeps working next to it).

-- 1) the 8 hour cap ----------------------------------------------------------------------------------------
create or replace function public.duty_max_len() returns interval language sql immutable
as $$ select interval '8 hours' $$;

create or replace function public.duty_session_end(p_start timestamptz)
returns timestamptz language sql stable set search_path to 'public' as $$
  select least(public.duty_window_end(p_start), p_start + public.duty_max_len());
$$;

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
  insert into public.duty_logs (officer_id, work_date, time_in, time_out, duration_hours)
  values (p_officer, (s at time zone tz)::date, to_char(s at time zone tz, 'HH24:MI'), to_char(e at time zone tz, 'HH24:MI'), hrs);
  return jsonb_build_object('logged', true, 'duration_hours', hrs,
    'time_in', to_char(s at time zone tz, 'HH24:MI'), 'time_out', to_char(e at time zone tz, 'HH24:MI'));
end; $$;

create or replace function public.duty_close_expired()
returns integer language plpgsql security definer set search_path to 'public' as $$
declare r record; n integer := 0;
begin
  for r in select officer_id, started_at from public.duty_sessions where public.duty_session_end(started_at) <= now() loop
    perform public._duty_finish(r.officer_id, public.duty_session_end(r.started_at));
    n := n + 1;
  end loop;
  return n;
end; $$;

-- 2) status + live roster -----------------------------------------------------------------------------------
create or replace function public.duty_status()
returns jsonb language plpgsql volatile security definer set search_path to 'public' as $$
declare me uuid := auth.uid(); my_start timestamptz;
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
    'on_duty_list', coalesce((select jsonb_agg(jsonb_build_object(
                        'id', p.id, 'name', p.name, 'rank', p.rank, 'badge', p.badge, 'started_at', s.started_at)
                      order by s.started_at)
                    from public.duty_sessions s join public.profiles p on p.id = s.officer_id
                    where p.rank <> 'Galaxy Citizen'), '[]'::jsonb),
    'window_open', public.duty_window_open(),
    'changes_at', public.duty_next_change());
end; $$;

revoke all on function public.duty_status() from public, anon;
grant execute on function public.duty_status() to authenticated;

-- 3) manual time entry is back ------------------------------------------------------------------------------
drop policy if exists "duty_logs: officer inserts own logs" on public.duty_logs;
create policy "duty_logs: officer inserts own logs" on public.duty_logs
  for insert to authenticated
  with check (officer_id = auth.uid() and not public.is_galaxy_citizen());
