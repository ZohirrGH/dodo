-- Uniform cards: the name under a card is typed freely (new column "name") instead of being a rank.
-- Uniform permissions: closed by default for everybody except the Chef Sheriff; he opens them per rank
-- from the permissions room. Additive only (ADD COLUMN, SET DEFAULT, UPDATE).

alter table public.uniforms add column if not exists name text;
alter table public.uniforms alter column rank set default '';   -- "rank" is no longer filled by the app

update public.uniforms set name = rank where name is null;

-- Keep the original hierarchy order for the 8 seeded cards (the gallery now sorts by creation time, oldest first)
update public.uniforms u
set created_at = timestamptz '2026-10-01 00:00:00+00' + (o.n * interval '1 minute')
from (
  select id, row_number() over (order by array_position(
    array['Chef Sheriff','Under Sheriff','Management','Assistant Chef','Division Chef','Major','Capitan','Lieutnant',
          'Sergent','Master Deputy','Deputy First Class','Deputy'], rank)) as n
  from public.uniforms
  where created_by is null
) o
where u.id = o.id;

-- Close the uniform permissions for every rank still on the starting values from 20261024
-- (a rank the Chef Sheriff already customised is left alone).
update public.role_permissions
set actions = actions || jsonb_build_object('uniform', jsonb_build_object(
      'create',     rank = 'Chef Sheriff',
      'edit_own',   rank = 'Chef Sheriff',
      'edit_all',   rank = 'Chef Sheriff',
      'delete_own', rank = 'Chef Sheriff',
      'delete_all', rank = 'Chef Sheriff'))
where actions -> 'uniform' = jsonb_build_object(
      'create',     rank in ('Chef Sheriff','Under Sheriff','Management','Assistant Chef','Division Chef','Major','Capitan','Lieutnant'),
      'edit_own',   true,
      'edit_all',   rank = 'Chef Sheriff',
      'delete_own', true,
      'delete_all', rank = 'Chef Sheriff');
