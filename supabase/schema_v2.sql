-- ════════════════════════════════════════════
-- EmpowHER Program Builder — Schema v2
-- Run this in: Supabase Dashboard → SQL Editor
-- Run AFTER schema.sql
-- ════════════════════════════════════════════

-- ─── 1. PROFILES ──────────────────────────────────────────────────────────────
-- Stores role and display info for every user

create table public.profiles (
  id           uuid references auth.users(id) on delete cascade primary key,
  role         text,                          -- 'coach' | 'user' | null = not yet selected
  display_name text,
  email        text not null,
  created_at   timestamptz default now() not null
);

alter table public.profiles enable row level security;

create policy "view own profile"   on public.profiles for select using (auth.uid() = id);
create policy "update own profile" on public.profiles for update using (auth.uid() = id);

-- Backfill profiles for any users who signed up before this schema ran
insert into public.profiles (id, email)
select id, email from auth.users
on conflict (id) do nothing;

-- Auto-create a profile row whenever a new auth user is created
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ─── 2. COACH-STUDENT INVITES ────────────────────────────────────────────────

create table public.coach_invites (
  id           uuid default gen_random_uuid() primary key,
  coach_id     uuid references public.profiles(id) on delete cascade not null,
  student_email text not null,
  status       text not null default 'pending',   -- 'pending' | 'accepted'
  created_at   timestamptz default now() not null,
  unique(coach_id, student_email)
);

alter table public.coach_invites enable row level security;

create policy "coach manages own invites" on public.coach_invites for all using (coach_id = auth.uid());
create policy "student views own invites" on public.coach_invites for select
  using (student_email = (select email from public.profiles where id = auth.uid()));


-- ─── 3. COACH-STUDENT RELATIONSHIPS ──────────────────────────────────────────

create table public.coach_students (
  id         uuid default gen_random_uuid() primary key,
  coach_id   uuid references public.profiles(id) on delete cascade not null,
  student_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now() not null,
  unique(coach_id, student_id)
);

alter table public.coach_students enable row level security;

create policy "coach sees own roster"    on public.coach_students for select  using (coach_id   = auth.uid());
create policy "student sees own coaches" on public.coach_students for select  using (student_id = auth.uid());
create policy "coach manages roster"     on public.coach_students for insert  with check (coach_id = auth.uid());
create policy "coach removes students"   on public.coach_students for delete  using (coach_id   = auth.uid());

-- Now that coach_students exists, add the cross-table profile visibility policy
create policy "coaches view students"    on public.profiles for select
  using (
    id in (select student_id from public.coach_students where coach_id   = auth.uid())
    or
    id in (select coach_id   from public.coach_students where student_id = auth.uid())
  );


-- ─── 4. UPDATE PROGRAMS TABLE ─────────────────────────────────────────────────
-- Add coach-assigned-program support

alter table public.programs
  add column if not exists assigned_to uuid references public.profiles(id),
  add column if not exists created_by  uuid references public.profiles(id);

-- Backfill: existing programs were self-created
update public.programs set created_by = user_id where created_by is null;

-- Drop old single-user policies and replace with coach-aware ones
drop policy if exists "select own programs" on public.programs;
drop policy if exists "update own programs" on public.programs;
drop policy if exists "delete own programs" on public.programs;

create policy "select own or assigned programs"
  on public.programs for select
  using (user_id = auth.uid() or assigned_to = auth.uid());

create policy "update own or assigned programs"
  on public.programs for update
  using (user_id = auth.uid() or assigned_to = auth.uid());

create policy "delete own programs"
  on public.programs for delete
  using (user_id = auth.uid());


-- ─── 5. WORKOUT LOGS ──────────────────────────────────────────────────────────
-- Students log actual reps/weight per exercise per week

create table public.workout_logs (
  id             uuid default gen_random_uuid() primary key,
  program_id     uuid references public.programs(id) on delete cascade not null,
  user_id        uuid references auth.users(id) on delete cascade not null,
  week           integer not null,
  day_index      integer not null,
  exercise_name  text not null,
  actual_weight  text,
  actual_reps    text,
  notes          text,
  logged_at      timestamptz default now() not null,
  unique(program_id, user_id, week, day_index, exercise_name)
);

alter table public.workout_logs enable row level security;

-- Users log their own workouts
create policy "log own workouts"   on public.workout_logs for all    using (user_id = auth.uid());

-- Coaches can view their students' logs
create policy "coaches view logs"  on public.workout_logs for select
  using (
    auth.uid() in (
      select cs.coach_id from public.coach_students cs where cs.student_id = workout_logs.user_id
    )
  );
