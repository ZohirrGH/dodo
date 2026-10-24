-- Rules room: six sealed chapters (Miranda Rights, Bill System, 10-Codes, Operational Codes, PD Rules,
-- Police Internal Rules). Chapters live in public.rules_sections so they can be added / edited / deleted /
-- reordered from the app. Who may do what is set per rank in the permissions room (room "rules"),
-- exactly like the uniform room. Creates one table, one function, updates role_permissions, one INSERT (plus the clean-up in step 0).
--
-- Body format (one entry per line, written in the app's editor):
--   ## Heading            sub-heading ("## 1. Pursuits" shows a number badge)
--   > text                highlighted note
--   - text                bullet
--   Left :: a | b         row with chips on the right ("10-4 :: Received" shows a code badge)
--   ~ text                small detail line attached to the line above
--   anything else         plain paragraph

-- 0) Clean-up: an earlier, unused rules design (tables rule_sections / rule_items, never used by the app)
--    was created by hand in the database. It is dropped here so only one rules system is left.
drop table if exists public.rule_items;
drop table if exists public.rule_sections;

create table if not exists public.rules_sections (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  subtitle    text not null default '',
  icon        text not null default 'scale',
  accent      text not null default '#F4C744',
  body        text not null default '',
  sort_order  integer,
  created_by  uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now()
);

alter table public.rules_sections enable row level security;
revoke all on public.rules_sections from anon;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='rules_sections' and policyname='rules: read if room visible') then
    create policy "rules: read if room visible" on public.rules_sections for select to authenticated
      using (public.has_room('rules'));
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='rules_sections' and policyname='rules: create by permission') then
    create policy "rules: create by permission" on public.rules_sections for insert to authenticated
      with check (created_by = auth.uid() and public.has_perm('rules', 'create'));
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='rules_sections' and policyname='rules: edit by permission') then
    create policy "rules: edit by permission" on public.rules_sections for update to authenticated
      using (public.has_perm('rules', 'edit_all') or (created_by = auth.uid() and public.has_perm('rules', 'edit_own')));
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='rules_sections' and policyname='rules: delete by permission') then
    create policy "rules: delete by permission" on public.rules_sections for delete to authenticated
      using (public.has_perm('rules', 'delete_all') or (created_by = auth.uid() and public.has_perm('rules', 'delete_own')));
  end if;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.rules_sections;
exception when others then null;
end $$;

-- Reordering goes through one function that checks the "reorder" permission (Chef Sheriff always allowed)
create or replace function public.reorder_rules(p_ids uuid[])
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  if not public.has_perm('rules', 'reorder') then
    raise exception 'not allowed to reorder the rules chapters' using errcode = '42501';
  end if;
  update public.rules_sections r
  set sort_order = o.ord
  from unnest(p_ids) with ordinality as o(id, ord)
  where r.id = o.id;
end;
$$;

revoke execute on function public.reorder_rules(uuid[]) from public, anon;
grant execute on function public.reorder_rules(uuid[]) to authenticated;

-- Permissions: every rank can see the room; only the Chef Sheriff can change it until he opens the
-- switches rank by rank in the permissions room (a rank he already customised is left alone).
update public.role_permissions
set rooms = rooms || '{"rules": true}'::jsonb
where not (rooms ? 'rules');

update public.role_permissions
set actions = actions || jsonb_build_object('rules', jsonb_build_object(
      'create',     rank = 'Chef Sheriff',
      'edit_own',   rank = 'Chef Sheriff',
      'edit_all',   rank = 'Chef Sheriff',
      'delete_own', rank = 'Chef Sheriff',
      'delete_all', rank = 'Chef Sheriff',
      'reorder',    rank = 'Chef Sheriff'))
where not coalesce(((actions -> 'rules') ? 'edit_all'), false);   -- also replaces the old create/edit/delete shape

-- The six starting chapters (only when the table is empty)
insert into public.rules_sections (title, subtitle, icon, accent, body, sort_order)
select v.title, v.subtitle, v.icon, v.accent, v.body, v.ord
from (values
  ('Miranda Rights', 'The words every arrest begins with', 'scale', '#F4C744', 1, $r$
- You have the right to remain silent.
- Anything you say can and will be used against you in a court of law.
- You have the right to an attorney.
- If you cannot afford an attorney, one will be appointed for you.
> Do you understand the rights I have just read to you?
$r$),

  ('Bill System', 'Sentences and fines for every offense', 'receipt', '#FF6B6B', 2, $r$
> Important: ignorance of the law is no excuse.
## Offenses against the authorities
Insulting a police officer or a judge :: 12 months | $35,000
Bribery :: 15 months | $40,000
Disobeying a judge's orders :: 10 months | $20,000
Disrespecting court rules :: $25,000
Harassing the authorities :: 12 months | $20,000
Disturbing the public :: 10 months | $20,000
## Weapons offenses
Carrying an unlicensed weapon :: 12 months | $25,000
## Criminal offenses
Killing a police officer :: 15 months | $40,000
Killing a citizen :: 15 months | $30,000
Attempted murder :: 12 months | $25,000
Escaping from prison or court :: Double the previous sentence
Shooting :: 12 months | $20,000
Fleeing from the police :: 10 months | $15,000
Drug dealing :: 15 months | $20,000
Drug possession :: 10 months | $18,000
Assault with a bladed weapon :: 10 months | $15,000
Kidnapping a police officer :: 12 months | $30,000
Kidnapping a citizen :: 10 months | $15,000
Attempting to smuggle a suspect out :: 10 months | $20,000
Harboring criminals :: 10 months | $10,000
## Robbery offenses
Attempted robbery :: 7 months | $10,000
Car theft :: 7 months | $10,000
Grocery store robbery :: 10 months | $18,000
House robbery :: 10 months | $15,000
Fleeca bank robbery :: 12 months | $25,000
ATM robbery :: 10 months | $20,000
Jewelry store robbery :: 12 months | $27,000
Paleto bank robbery :: 15 months | $28,000
Bobcat robbery :: 16 months | $30,000
Yacht robbery :: 18 months | $40,000
Central Bank robbery :: 19 months | $50,000
Lab robbery :: 20 months | $60,000
$r$),

  ('10-Codes', 'Short signals for fast radio talk', 'radio', '#38D6E8', 3, $r$
10-0 :: Warning
10-2 :: Negative
10-3 :: Stop transmitting
10-4 :: Received
10-5 :: Backup request
10-6 :: Busy
10-7 :: Done (mission complete)
$r$),

  ('GX_PD Operational Codes', 'What is happening, in one word', 'siren', '#A78BFA', 4, $r$
Code 0 :: Radio Silence
Code 1 :: Shots Fired
Code 2 :: Pursuit
Code 3 :: Drugs
Code 4 :: House Robbery
Code 5 :: Store Robbery
Code 6 :: Small Bank
Code 7 :: Jewelry
Code 8 :: Central Bank
Code 9 :: Transport
Code 10 :: Officer Kidnapped
Code 11 :: Meeting
Code 12 :: Radio Check-In
Code 13 :: Radio Check-Out
$r$),

  ('PD Rules', 'Robbery limits and outside interference', 'shield', '#34D399', 5, $r$
## Outside interference during robberies
## 1. Mandatory declaration
- Any outside interference must be declared to the police during the negotiation phase, before it takes place.
## 2. Respect the maximum number of robberies
- Respect the maximum number of robberies allowed at the same time on the server.
## 3. Respect the number of participants
- Example, jewelry store: 3 people maximum inside the store.
- One person maximum outside the store (lookout or getaway driver).
## 4. Allowed vehicles
- Only one vehicle, or one motorcycle at most, during outside interference.
## 5. Conditions for outside interference
- A person outside the robbery location may interfere only if it is justified within the RP context.
- The interference must be logical and keep the game balanced between the police and the criminals.
> Goal: a fair, realistic and organized RolePlay experience for every player on the server.
## Heist limits
House Robbery, Grocery Store, ATM :: 2 criminals | 3 police
~ One car or one motorcycle allowed
~ No helicopter
Jewelry Store :: 4 criminals | 5 police
~ One or more hostages allowed
~ 2 cars
~ 1 motorcycle
Paleto Bank :: 4 or 5 criminals | 6 police max
~ One or more hostages allowed
~ 2 cars
~ 1 motorcycle
Fleeca Bank :: 3 or 4 criminals | 5 police
~ One or more hostages allowed
~ 2 cars
~ 1 motorcycle
Bobcat :: 4 criminals | 6 police
~ One or more hostages allowed
~ 2 cars
~ 1 motorcycle
Central Bank :: 8 criminals | 10 police
~ One or more hostages allowed
~ 4 cars
~ 1 motorcycle
Yacht :: 6 criminals | 8 police
Lab :: 6 criminals | 8 police
Submarine :: 15 criminals | 17 police
## Detained citizens
> When the court is available, it is strictly forbidden to handle detained citizens outside the legal framework.
- Handle detainees inside the cell by taking their information and confiscating the evidence.
- When finished, transfer them directly to the court.
> Any violation leads to a disciplinary penalty: an immediate demotion, with no discussion.
Following the rules reflects the professionalism of the department and protects its credibility.
$r$),

  ('Police Internal Rules', 'Conduct, chain of command and discipline', 'book', '#F472B6', 6, $r$
## 1. Pursuits
- A pursuit of one motorcycle allows a maximum of two police motorcycles.
- A pursuit of one vehicle allows a maximum of two police vehicles.
- An officer who arrives first on a motorcycle may start the pursuit and request backup.
- If backup does not arrive in a reasonable time, the pursuit must be stopped.
## 2. Chain of command
- Respect higher ranks.
- Orders from higher-ranking officers are binding.
## 3. Use of equipment
- Using weapons or vehicles that do not match your rank is forbidden.
- Every officer is responsible for their own weapon and vehicle.
## 4. Professional conduct
- No sabotage and no mocking of citizens.
- Use the radio for essential information only.
- No out-of-character (HRP) talk.
## 5. Masks
- Wearing masks on duty is forbidden.
- Exception: special units, or by order of the command.
## 6. Negotiations
- Only the appointed negotiator speaks.
- All other officers stay silent.
## 7. Police vehicles
- Changing the color or design of vehicles is forbidden.
- Using them outside of missions is forbidden.
## 8. Uniform
- Wear the approved uniform for your rank.
## 9. Patrol system
- Solo patrols are forbidden.
- A motorcycle unit must be at least two motorcycles.
## 10. Calls and radio
- Report on the radio when heading to a call.
- Answer backup requests if you are available.
## 11. Fines
- Changing the value of fines is forbidden.
- Maximum vehicle fine: $10,000.
## 12. Interrogation
- Maximum 20 minutes.
## 13. Damaged vehicle
- Swapping vehicles is forbidden until the case is over.
## 14. Accidents
- Provide a Repair Kit if available.
## 15. Patrol zones
- No patrols in the desert if fewer than 8 sheriffs are on duty.
- Exception: an official backup request.
## 16. Military base
- Citizens are forbidden to enter.
- In case of infiltration, opening fire is allowed.
> Breaking these rules may lead to administrative penalties on the server.
## Article 1 · Chain of command
- Every member must respect their direct superior.
- Orders given during an intervention are executed immediately and override any discussion.
- Disagreements are discussed after the situation is over, not during it.
## Article 2 · Conduct
- Serious and consistent roleplay (RP) is mandatory.
- Abuse of power in any form is forbidden.
- Bodycam footage or other evidence is mandatory in sensitive incidents.
A written report is mandatory after:
- A shooting
- A major pursuit
- An important arrest
## Article 3 · Discipline
Possible penalties:
- Verbal warning
- Written warning
- Temporary suspension
- Demotion
- Permanent dismissal
Authority:
Sergent and above :: May give a warning
Lieutnant and above :: May suspend temporarily
Under Sheriff and above :: May demote
Chef Sheriff :: Final decision
## Negotiation rules
Citizen :: Max $15,000
Police officer :: Max $25,000
Forbidden to negotiate over:
- Helicopter
- Shield
- Smoke
$r$)
) as v(title, subtitle, icon, accent, ord, body)
where not exists (select 1 from public.rules_sections);
