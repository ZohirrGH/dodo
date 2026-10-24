-- Uniform room: cards live in public.uniforms (table created in 20261023d, not part of main until now).
-- 1) The app's room key is "uniform" (singular): point the policies and role_permissions at it.
-- 2) Move the 8 cards that were hard-coded in App.jsx into the table so they can be edited in the app.
-- Additive: ALTER POLICY, one UPDATE on role_permissions, one INSERT. No DROP / DELETE.

create table if not exists public.uniforms (
  id          uuid primary key default gen_random_uuid(),
  rank        text not null,
  outfit_code text,
  image_url   text,
  created_by  uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now()
);

alter table public.uniforms enable row level security;
revoke all on public.uniforms from anon;

-- Policies (created here if the earlier migration was never applied, otherwise just re-pointed)
do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='uniforms' and policyname='uniforms: read if room visible') then
    create policy "uniforms: read if room visible" on public.uniforms for select to authenticated using (public.has_room('uniform'));
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='uniforms' and policyname='uniforms: create by permission') then
    create policy "uniforms: create by permission" on public.uniforms for insert to authenticated
      with check (created_by = auth.uid() and public.has_perm('uniform', 'create'));
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='uniforms' and policyname='uniforms: edit by permission') then
    create policy "uniforms: edit by permission" on public.uniforms for update to authenticated
      using (public.has_perm('uniform', 'edit_all') or (created_by = auth.uid() and public.has_perm('uniform', 'edit_own')));
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='uniforms' and policyname='uniforms: delete by permission') then
    create policy "uniforms: delete by permission" on public.uniforms for delete to authenticated
      using (public.has_perm('uniform', 'delete_all') or (created_by = auth.uid() and public.has_perm('uniform', 'delete_own')));
  end if;
end $$;

alter policy "uniforms: read if room visible" on public.uniforms
  using (public.has_room('uniform'));
alter policy "uniforms: create by permission" on public.uniforms
  with check (created_by = auth.uid() and public.has_perm('uniform', 'create'));
alter policy "uniforms: edit by permission" on public.uniforms
  using (public.has_perm('uniform', 'edit_all') or (created_by = auth.uid() and public.has_perm('uniform', 'edit_own')));
alter policy "uniforms: delete by permission" on public.uniforms
  using (public.has_perm('uniform', 'delete_all') or (created_by = auth.uid() and public.has_perm('uniform', 'delete_own')));

do $$
begin
  alter publication supabase_realtime add table public.uniforms;
exception when others then null;
end $$;

-- role_permissions: rename the "uniforms" keys to "uniform" (keep a room value somebody already saved)
update public.role_permissions
set rooms = (rooms - 'uniforms') || case when rooms ? 'uniform' then '{}'::jsonb else '{"uniform": true}'::jsonb end,
    actions = (actions - 'uniforms') || jsonb_build_object('uniform', actions -> 'uniforms')
where actions ? 'uniforms';

-- Ranks that never had either key (safety net): visible room, management ranks may add cards
update public.role_permissions
set rooms = rooms || '{"uniform": true}'::jsonb
where not (rooms ? 'uniform');

update public.role_permissions
set actions = actions || jsonb_build_object('uniform', jsonb_build_object(
      'create',     rank in ('Chef Sheriff','Under Sheriff','Management','Assistant Chef','Division Chef','Major','Capitan','Lieutnant'),
      'edit_own',   true,
      'edit_all',   rank = 'Chef Sheriff',
      'delete_own', true,
      'delete_all', rank = 'Chef Sheriff'))
where not (actions ? 'uniform');

-- The 8 cards that were written in App.jsx (images are files in public/uniforms/)
insert into public.uniforms (rank, outfit_code, image_url)
select v.rank, v.code, v.img
from (values
  ('Division Chef',      'DAUNhTjAnA', 'division-chef.png'),
  ('Major',              'q3RCu0NObi', 'major.png'),
  ('Capitan',            's2YMa10BAE', 'capitan.png'),
  ('Lieutnant',          '9URtq1j0M1', 'lieutnant.png'),
  ('Sergent',            's2YMa10BAE', 'sergent.png'),
  ('Master Deputy',      'MaNPLXk-N-', 'master-deputy.png'),
  ('Deputy First Class', 's2YMa10BAE', 'deputy-first-class.png'),
  ('Deputy',             '6kov4er4Aa', 'deputy.png')
) as v(rank, code, img)
where not exists (select 1 from public.uniforms);
