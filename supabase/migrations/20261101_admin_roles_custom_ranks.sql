-- Admin powers and custom roles.
-- NOT applied yet: run this once in the Supabase SQL editor (or `supabase db push`) BEFORE using the new
-- Permissions room features, and deploy the edge functions manage-roles, delete-officer and discord-auth.
--
-- What this does
--   1. is_admin(): Chef Sheriff or Management.
--   2. Management gets every room and every permission (has_perm / has_room treat it like the Chef Sheriff).
--   3. The Permissions room table (role_permissions) can be edited by any admin, not only the Chef Sheriff.
--   4. custom_ranks: roles created from the website. The rank check on profiles / role_permissions now accepts the
--      built-in ranks plus whatever is in custom_ranks. Writes to custom_ranks go through the manage-roles edge
--      function (service role) only; signed-in users can read the list.

-- 1) is_admin ----------------------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $$
  select exists (
    select 1 from profiles
    where id = auth.uid()
      and rank in ('Chef Sheriff', 'Management')
  );
$$;
revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- 2) Management has full access (same definitions as before, with Management added next to the Chef Sheriff) ----
create or replace function public.has_perm(p_room text, p_action text)
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $$
  select coalesce((
    select p.rank in ('Chef Sheriff', 'Management')
        or coalesce((rp.actions -> p_room ->> p_action)::boolean, false)
    from profiles p
    left join role_permissions rp on rp.rank = p.rank
    where p.id = auth.uid()
  ), false);
$$;
revoke execute on function public.has_perm(text, text) from public, anon;
grant execute on function public.has_perm(text, text) to authenticated;

create or replace function public.has_room(p_room text)
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $$
  select coalesce((
    select p.rank in ('Chef Sheriff', 'Management')
        or coalesce((rp.rooms ->> p_room)::boolean, false)
    from profiles p
    left join role_permissions rp on rp.rank = p.rank
    where p.id = auth.uid()
  ), false);
$$;
revoke execute on function public.has_room(text) from public, anon;
grant execute on function public.has_room(text) to authenticated;

-- 3) Permissions room: any admin may edit --------------------------------------------------------------
drop policy if exists "role_permissions: chief can insert" on public.role_permissions;
drop policy if exists "role_permissions: chief can update" on public.role_permissions;
drop policy if exists "role_permissions: chief can delete" on public.role_permissions;
drop policy if exists "role_permissions: admin can insert" on public.role_permissions;
drop policy if exists "role_permissions: admin can update" on public.role_permissions;
drop policy if exists "role_permissions: admin can delete" on public.role_permissions;

create policy "role_permissions: admin can insert"
  on public.role_permissions for insert to authenticated with check (public.is_admin());
create policy "role_permissions: admin can update"
  on public.role_permissions for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "role_permissions: admin can delete"
  on public.role_permissions for delete to authenticated using (public.is_admin());

-- 4) Custom roles ----------------------------------------------------------------------------------------
create table if not exists public.custom_ranks (
  name text primary key check (char_length(btrim(name)) between 2 and 40),
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles(id) on delete set null
);

alter table public.custom_ranks enable row level security;

drop policy if exists "custom_ranks: signed-in users can read" on public.custom_ranks;
create policy "custom_ranks: signed-in users can read"
  on public.custom_ranks for select to authenticated using (true);
-- No insert / update / delete policies on purpose: only the manage-roles edge function (service role) writes here.

-- A role that still has members can not be deleted
create or replace function public.custom_ranks_guard_delete()
returns trigger
language plpgsql
set search_path to 'public'
as $$
begin
  if exists (select 1 from public.profiles where rank = old.name) then
    raise exception 'role "%" still has members', old.name;
  end if;
  return old;
end;
$$;
revoke execute on function public.custom_ranks_guard_delete() from public, anon, authenticated;

drop trigger if exists custom_ranks_guard_delete on public.custom_ranks;
create trigger custom_ranks_guard_delete
  before delete on public.custom_ranks
  for each row execute function public.custom_ranks_guard_delete();

-- Built-in ranks + custom ranks. Used by the rank checks below.
create or replace function public.is_valid_rank(p_rank text)
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $$
  select p_rank = any (array[
    'Deputy','Deputy First Class','Master Deputy','Sergent','Lieutnant','Capitan','Major',
    'Division Chef','Assistant Chef','Management','Under Sheriff','Chef Sheriff','Galaxy Citizen'
  ])
  or exists (select 1 from public.custom_ranks where name = p_rank);
$$;
grant execute on function public.is_valid_rank(text) to anon, authenticated, service_role;

alter table public.profiles drop constraint if exists profiles_rank_check;
alter table public.profiles add constraint profiles_rank_check check (public.is_valid_rank(rank));

alter table public.role_permissions drop constraint if exists role_permissions_rank_check;
alter table public.role_permissions add constraint role_permissions_rank_check check (public.is_valid_rank(rank));
