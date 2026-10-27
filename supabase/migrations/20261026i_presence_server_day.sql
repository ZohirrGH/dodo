-- Applied to the project on 2026-10-26 (kept here for the record).
-- "Today" in the Presence room is now decided by the database in Africa/Algiers time,
-- so the list no longer depends on the viewer's own time zone. p_since is still accepted but ignored.
create or replace function public.presence_today(p_since timestamptz default null)
 returns table (
   officer_id uuid, name text, rank text, badge text, avatar_url text,
   first_login timestamptz, last_seen timestamptz, seconds integer, visits integer, online boolean
 )
 language plpgsql
 stable
 security definer
 set search_path to 'public'
as $function$
declare
  day_start timestamptz := date_trunc('day', now() at time zone 'Africa/Algiers') at time zone 'Africa/Algiers';
begin
  if not public.has_room('presence') then
    raise exception 'not allowed';
  end if;
  return query
  select p.id, p.name, p.rank, p.badge, p.avatar_url,
         min(greatest(s.started_at, day_start)),
         max(s.last_seen),
         coalesce(sum(extract(epoch from (s.last_seen - greatest(s.started_at, day_start)))), 0)::int,
         count(*)::int,
         max(s.last_seen) > now() - interval '2 minutes'
  from presence_sessions s
  join profiles p on p.id = s.officer_id
  where s.last_seen >= day_start
    and p.rank <> 'Galaxy Citizen'
  group by p.id, p.name, p.rank, p.badge, p.avatar_url
  order by (max(s.last_seen) > now() - interval '2 minutes') desc, max(s.last_seen) desc;
end;
$function$;
