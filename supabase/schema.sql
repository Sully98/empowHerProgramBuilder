-- ════════════════════════════════════════════
-- EmpowHER Program Builder — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor
-- ════════════════════════════════════════════

create table public.programs (
  id           uuid    default gen_random_uuid() primary key,
  user_id      uuid    references auth.users(id) on delete cascade not null,
  name         text    not null default 'My Program',
  split        text    not null default 'upperlower',
  goal         text    not null default 'hypertrophy',
  block_weeks  integer not null default 4,
  deload_on    boolean not null default true,
  deload_pct   integer not null default 50,
  selected_methods text[]  not null default '{}',
  overload_plan    jsonb   not null default '[]',
  days             jsonb   not null default '[]',
  created_at   timestamptz default now() not null,
  updated_at   timestamptz default now() not null
);

-- Row-level security: users can only see/edit their own programs
alter table public.programs enable row level security;

create policy "select own programs"
  on public.programs for select
  using (auth.uid() = user_id);

create policy "insert own programs"
  on public.programs for insert
  with check (auth.uid() = user_id);

create policy "update own programs"
  on public.programs for update
  using (auth.uid() = user_id);

create policy "delete own programs"
  on public.programs for delete
  using (auth.uid() = user_id);

-- Auto-update updated_at on every row change
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger programs_touch_updated_at
  before update on public.programs
  for each row execute procedure public.touch_updated_at();
