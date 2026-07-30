-- Migration: add per-set logging to workout_logs
-- Run this once in the Supabase SQL editor against your existing database.
-- Safe to run on a table that already has rows: existing logs get set_index = 0
-- (treated as "set 1" for whichever exercise they belong to).

alter table public.workout_logs
  add column if not exists set_index integer not null default 0;

-- Drop the old unique constraint (name may vary slightly; this finds it dynamically).
do $$
declare
  old_constraint text;
begin
  select conname into old_constraint
  from pg_constraint
  where conrelid = 'public.workout_logs'::regclass
    and contype = 'u'
    and array_to_string(
      (select array_agg(attname order by u.ord)
       from unnest(conkey) with ordinality as u(attnum, ord)
       join pg_attribute a on a.attrelid = conrelid and a.attnum = u.attnum),
      ','
    ) = 'program_id,user_id,week,day_index,exercise_name';

  if old_constraint is not null then
    execute format('alter table public.workout_logs drop constraint %I', old_constraint);
  end if;
end $$;

alter table public.workout_logs
  add constraint workout_logs_program_id_user_id_week_day_index_exercise_name_set_index_key
  unique (program_id, user_id, week, day_index, exercise_name, set_index);
