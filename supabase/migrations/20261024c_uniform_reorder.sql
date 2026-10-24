-- Uniform cards can be reordered (right-click a card, then click where it should go).
-- sort_order stores the order for everybody; reorder_uniforms() is the only way to change it and it
-- checks the new "reorder" permission (Chef Sheriff always allowed). Additive only.

alter table public.uniforms add column if not exists sort_order integer;

-- Starting order = the order the gallery shows today (oldest first)
update public.uniforms u
set sort_order = o.n
from (select id, row_number() over (order by created_at, id) as n from public.uniforms) o
where u.id = o.id and u.sort_order is null;

create or replace function public.reorder_uniforms(p_ids uuid[])
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  if not public.has_perm('uniform', 'reorder') then
    raise exception 'not allowed to reorder the uniform cards' using errcode = '42501';
  end if;
  update public.uniforms u
  set sort_order = o.ord
  from unnest(p_ids) with ordinality as o(id, ord)
  where u.id = o.id;
end;
$$;

revoke execute on function public.reorder_uniforms(uuid[]) from public, anon;
grant execute on function public.reorder_uniforms(uuid[]) to authenticated;

-- New permission switch: off for everybody except the Chef Sheriff until he opens it in the permissions room
update public.role_permissions
set actions = jsonb_set(actions, '{uniform,reorder}', to_jsonb(rank = 'Chef Sheriff'), true)
where actions ? 'uniform' and not (actions -> 'uniform' ? 'reorder');
