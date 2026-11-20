-- Project Hayati: run this once in Supabase > SQL Editor > New query > Run

create table if not exists public.tasks (
  id bigint generated always as identity primary key,
  uid uuid not null default auth.uid() references auth.users(id) on delete cascade,
  "name" text not null default '',
  "code" text not null default '',
  "desc" text not null default '',
  "due" text not null default '',
  "done" boolean not null default false
);
create index if not exists tasks_uid_idx on public.tasks(uid);
alter table public.tasks enable row level security;
drop policy if exists "tasks: own rows" on public.tasks;
create policy "tasks: own rows" on public.tasks for all to authenticated
  using (uid = (select auth.uid())) with check (uid = (select auth.uid()));
grant select, insert, update, delete on public.tasks to authenticated;

create table if not exists public.classes (
  id bigint generated always as identity primary key,
  uid uuid not null default auth.uid() references auth.users(id) on delete cascade,
  "code" text not null default '',
  "day" text not null default '',
  "start" text not null default '',
  "end" text not null default '',
  "room" text not null default '',
  "inst" text not null default ''
);
create index if not exists classes_uid_idx on public.classes(uid);
alter table public.classes enable row level security;
drop policy if exists "classes: own rows" on public.classes;
create policy "classes: own rows" on public.classes for all to authenticated
  using (uid = (select auth.uid())) with check (uid = (select auth.uid()));
grant select, insert, update, delete on public.classes to authenticated;

create table if not exists public.water (
  id bigint generated always as identity primary key,
  uid uuid not null default auth.uid() references auth.users(id) on delete cascade,
  "ml" double precision not null default 0,
  "date" text not null default '',
  "time" text not null default ''
);
create index if not exists water_uid_idx on public.water(uid);
alter table public.water enable row level security;
drop policy if exists "water: own rows" on public.water;
create policy "water: own rows" on public.water for all to authenticated
  using (uid = (select auth.uid())) with check (uid = (select auth.uid()));
grant select, insert, update, delete on public.water to authenticated;

create table if not exists public.sleep (
  id bigint generated always as identity primary key,
  uid uuid not null default auth.uid() references auth.users(id) on delete cascade,
  "bed" text not null default '',
  "wake" text not null default ''
);
create index if not exists sleep_uid_idx on public.sleep(uid);
alter table public.sleep enable row level security;
drop policy if exists "sleep: own rows" on public.sleep;
create policy "sleep: own rows" on public.sleep for all to authenticated
  using (uid = (select auth.uid())) with check (uid = (select auth.uid()));
grant select, insert, update, delete on public.sleep to authenticated;

create table if not exists public.routines (
  id bigint generated always as identity primary key,
  uid uuid not null default auth.uid() references auth.users(id) on delete cascade,
  "name" text not null default '',
  "when" text not null default '',
  "doneOn" text not null default ''
);
create index if not exists routines_uid_idx on public.routines(uid);
alter table public.routines enable row level security;
drop policy if exists "routines: own rows" on public.routines;
create policy "routines: own rows" on public.routines for all to authenticated
  using (uid = (select auth.uid())) with check (uid = (select auth.uid()));
grant select, insert, update, delete on public.routines to authenticated;

create table if not exists public.tx (
  id bigint generated always as identity primary key,
  uid uuid not null default auth.uid() references auth.users(id) on delete cascade,
  "type" text not null default '',
  "cat" text not null default '',
  "amt" double precision not null default 0,
  "date" text not null default ''
);
create index if not exists tx_uid_idx on public.tx(uid);
alter table public.tx enable row level security;
drop policy if exists "tx: own rows" on public.tx;
create policy "tx: own rows" on public.tx for all to authenticated
  using (uid = (select auth.uid())) with check (uid = (select auth.uid()));
grant select, insert, update, delete on public.tx to authenticated;

