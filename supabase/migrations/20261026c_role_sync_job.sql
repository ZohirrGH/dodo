-- Background role sync.
-- The discord-auth function (action "sync_all") re-reads every linked officer's Discord roles and writes only what
-- changed. pg_cron calls it every 10 seconds, so rank / name changes reach everybody without each open page asking
-- Discord by itself. Open pages only read their own profile row (cheap) and ask Discord rarely.

-- 1) throttle: at most one sync_all run per p_seconds, however often the endpoint is called
create table if not exists public.role_sync_state (
  id int primary key default 1 check (id = 1),
  last_run timestamptz not null default 'epoch'
);
insert into public.role_sync_state (id) values (1) on conflict (id) do nothing;
alter table public.role_sync_state enable row level security;   -- no policies: only the service role touches it

create or replace function public.take_role_sync_slot(p_seconds integer)
returns boolean
language plpgsql
security definer
set search_path to 'public'
as $$
declare ok boolean;
begin
  update public.role_sync_state
     set last_run = now()
   where id = 1 and last_run < now() - make_interval(secs => p_seconds)
  returning true into ok;
  return coalesce(ok, false);
end;
$$;
revoke all on function public.take_role_sync_slot(integer) from public, anon, authenticated;
grant execute on function public.take_role_sync_slot(integer) to service_role;

-- 2) the schedule
create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;

-- The key below is the project's public anon key (the same one the site ships with); it only gets the request
-- past the function's JWT check. The function itself is throttled.
select cron.schedule(
  'discord-role-sync',
  '10 seconds',
  $job$
  select net.http_post(
    url := 'https://lfpbkvfcwbzqpjxcsowz.supabase.co/functions/v1/discord-auth',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxmcGJrdmZjd2J6cXBqeGNzb3d6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg2Mzc0ODQsImV4cCI6MjEwNDIxMzQ4NH0._F18X5Q4ycJ4M8SVgdMgdSK6-JSJac2sb4oHrofNpkU'
    ),
    body := '{"action":"sync_all"}'::jsonb,
    timeout_milliseconds := 8000
  );
  $job$
);
