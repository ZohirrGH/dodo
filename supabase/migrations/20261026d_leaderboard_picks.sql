-- Leaderboard: the podium is chosen BY HAND (no hours, no calculation).
-- Two boards ("overall" = all time, "week" = Top Sheriff Week), three places each. Whoever has the permission
-- room "leaderboard" -> action "manage" (set per rank in the permissions room; the Chef Sheriff always has it)
-- puts an officer on a place, moves him or removes him. Everybody who can see the room sees the podium.
--
-- Why functions and not a plain table read: ranks below Lieutnant can only read their own row in profiles, so a
-- direct join would show them an empty podium. get_leaderboard() hands out only name / rank / badge / avatar of the
-- six picked officers, to everybody who may see the room.

create table if not exists public.leaderboard_picks (
  board       text not null check (board in ('overall', 'week')),
  place       integer not null check (place between 1 and 3),
  officer_id  uuid not null references public.profiles(id) on delete cascade,
  picked_by   uuid references public.profiles(id) on delete set null,
  updated_at  timestamptz not null default now(),
  primary key (board, place),
  unique (board, officer_id)
);

alter table public.leaderboard_picks enable row level security;   -- no policies: everything goes through the functions below
revoke all on public.leaderboard_picks from anon, authenticated;

-- The podium, for everybody who may see the leaderboard room
create or replace function public.get_leaderboard()
returns table (board text, place integer, officer_id uuid, name text, rank text, badge text, avatar_url text)
language sql
stable
security definer
set search_path to 'public'
as $$
  select k.board, k.place, p.id, p.name, p.rank, p.badge, p.avatar_url
  from public.leaderboard_picks k
  join public.profiles p on p.id = k.officer_id
  where public.has_room('leaderboard') and p.rank <> 'Galaxy Citizen'
  order by k.board, k.place;
$$;

-- The list the picker chooses from (only for people who may manage the podium)
create or replace function public.leaderboard_candidates()
returns table (id uuid, name text, rank text, badge text, avatar_url text)
language sql
stable
security definer
set search_path to 'public'
as $$
  select p.id, p.name, p.rank, p.badge, p.avatar_url
  from public.profiles p
  where public.has_perm('leaderboard', 'manage') and p.rank <> 'Galaxy Citizen'
  order by p.name;
$$;

-- Put an officer on a place (p_officer = null empties the place). An officer is on a board only once:
-- putting him on a new place frees his old one.
create or replace function public.set_leaderboard_pick(p_board text, p_place integer, p_officer uuid)
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  if not public.has_perm('leaderboard', 'manage') then
    raise exception 'not allowed to manage the leaderboard' using errcode = '42501';
  end if;
  if p_board not in ('overall', 'week') or p_place not between 1 and 3 then
    raise exception 'bad board or place' using errcode = '22023';
  end if;

  if p_officer is null then
    delete from public.leaderboard_picks where board = p_board and place = p_place;
    return;
  end if;

  if not exists (select 1 from public.profiles where id = p_officer and rank <> 'Galaxy Citizen') then
    raise exception 'unknown officer' using errcode = '22023';
  end if;

  delete from public.leaderboard_picks where board = p_board and officer_id = p_officer and place <> p_place;

  insert into public.leaderboard_picks (board, place, officer_id, picked_by, updated_at)
  values (p_board, p_place, p_officer, auth.uid(), now())
  on conflict (board, place) do update
    set officer_id = excluded.officer_id, picked_by = excluded.picked_by, updated_at = now();
end;
$$;

revoke execute on function public.get_leaderboard() from public, anon;
revoke execute on function public.leaderboard_candidates() from public, anon;
revoke execute on function public.set_leaderboard_pick(text, integer, uuid) from public, anon;
grant execute on function public.get_leaderboard() to authenticated;
grant execute on function public.leaderboard_candidates() to authenticated;
grant execute on function public.set_leaderboard_pick(text, integer, uuid) to authenticated;

-- Permission: only the Chef Sheriff can manage the podium until he opens "manage" rank by rank in the permissions room
-- (a rank that already has a leaderboard entry is left alone).
update public.role_permissions
set actions = actions || jsonb_build_object('leaderboard', jsonb_build_object('manage', rank = 'Chef Sheriff'))
where not (actions ? 'leaderboard');
