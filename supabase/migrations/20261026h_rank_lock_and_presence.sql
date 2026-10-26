-- 1) Ranks are managed from Discord only.
--    The site (any signed-in user, Chef Sheriff included) can no longer change profiles.rank.
--    The Discord sync (edge function discord-auth, service role) and the SQL editor have auth.uid() = null, so they still can.
--    Badge / username / discord_id rules are unchanged (Chef Sheriff only).

create or replace function public.prevent_rank_selfchange()
 returns trigger
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
begin
  -- auth.uid() is null for the SQL editor and the service role (edge functions): allowed
  if new.rank is distinct from old.rank and auth.uid() is not null then
    raise exception 'ranks are managed from Discord';
  end if;
  return new;
end;
$function$;

create or replace function public.protect_profile_columns()
 returns trigger
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
begin
  -- auth.uid() is null for the SQL editor and for the service role (edge functions): allowed
  if auth.uid() is not null then
    if new.rank is distinct from old.rank then
      raise exception 'ranks are managed from Discord';
    end if;
    if not public.is_chief() then
      if new.badge is distinct from old.badge
         or new.username is distinct from old.username
         or new.discord_id is distinct from old.discord_id then
        raise exception 'only the Chef Sheriff can change rank, badge, username or discord_id';
      end if;
    end if;
  end if;
  return new;
end
$function$;

revoke execute on function public.prevent_rank_selfchange() from public, anon, authenticated;
revoke execute on function public.protect_profile_columns() from public, anon, authenticated;


-- 2) Presence room: who signed in today, for how long, and who is online right now.
--    The open site pings every 30 s (presence_ping). One row = one visit; tabs and short gaps share the same row.
--    Online = pinged in the last 2 minutes. Time on site = last ping - first ping of the visit.

create table if not exists public.presence_sessions (
  id uuid primary key default gen_random_uuid(),
  officer_id uuid not null references public.profiles(id) on delete cascade,
  started_at timestamptz not null default now(),
  last_seen timestamptz not null default now()
);
create index if not exists presence_sessions_officer_idx on public.presence_sessions (officer_id, last_seen desc);
create index if not exists presence_sessions_started_idx on public.presence_sessions (started_at);

-- No policies on purpose: nobody reads or writes the table directly, only through the two functions below.
alter table public.presence_sessions enable row level security;
revoke all on public.presence_sessions from anon, authenticated;

create or replace function public.presence_ping()
 returns void
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
declare
  me uuid := auth.uid();
  sid uuid;
begin
  if me is null then return; end if;
  perform pg_advisory_xact_lock(hashtext('presence:' || me::text));

  select id into sid from presence_sessions
  where officer_id = me and last_seen > now() - interval '3 minutes'
  order by last_seen desc limit 1;

  if sid is null then
    insert into presence_sessions (officer_id) values (me);
    -- housekeeping: forget visits older than 60 days (about once per 100 new visits)
    if random() < 0.01 then
      delete from presence_sessions where started_at < now() - interval '60 days';
    end if;
  else
    update presence_sessions set last_seen = now() where id = sid;
  end if;
end;
$function$;

-- p_since = start of "today" in the viewer's own time zone (sent by the site)
create or replace function public.presence_today(p_since timestamptz)
 returns table (
   officer_id uuid, name text, rank text, badge text, avatar_url text,
   first_login timestamptz, last_seen timestamptz, seconds integer, visits integer, online boolean
 )
 language plpgsql
 stable
 security definer
 set search_path to 'public'
as $function$
begin
  if not public.has_room('presence') then
    raise exception 'not allowed';
  end if;
  return query
  select p.id, p.name, p.rank, p.badge, p.avatar_url,
         min(greatest(s.started_at, p_since)),
         max(s.last_seen),
         coalesce(sum(extract(epoch from (s.last_seen - greatest(s.started_at, p_since)))), 0)::int,
         count(*)::int,
         max(s.last_seen) > now() - interval '2 minutes'
  from presence_sessions s
  join profiles p on p.id = s.officer_id
  where s.last_seen >= p_since
    and p.rank <> 'Galaxy Citizen'
  group by p.id, p.name, p.rank, p.badge, p.avatar_url
  order by (max(s.last_seen) > now() - interval '2 minutes') desc, max(s.last_seen) desc;
end;
$function$;

revoke execute on function public.presence_ping() from public, anon;
revoke execute on function public.presence_today(timestamptz) from public, anon;
grant execute on function public.presence_ping() to authenticated;
grant execute on function public.presence_today(timestamptz) to authenticated;

-- The new room starts open for the management ranks (same list as officers / weekly). The Chef Sheriff can change it per rank
-- in the permissions room. Only ranks that have no "presence" setting yet are touched, so re-running never overrides a choice.
update public.role_permissions
set rooms = jsonb_set(coalesce(rooms, '{}'::jsonb), '{presence}',
      to_jsonb(rank in ('Chef Sheriff','Under Sheriff','Management','Assistant Chef','Division Chef','Major','Capitan','Lieutnant')), true)
where not (coalesce(rooms, '{}'::jsonb) ? 'presence');
