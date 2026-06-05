import { supabase } from './supabase';
import type { WorkoutLog, WorkoutLogKey } from '../data/types';

export function logKey(dayIndex: number, exerciseName: string): WorkoutLogKey {
  return `${dayIndex}_${exerciseName}`;
}

export async function fetchLogsForWeek(
  programId: string,
  userId: string,
  week: number
): Promise<Record<WorkoutLogKey, WorkoutLog>> {
  const { data } = await supabase
    .from('workout_logs')
    .select('*')
    .eq('program_id', programId)
    .eq('user_id', userId)
    .eq('week', week);

  const map: Record<WorkoutLogKey, WorkoutLog> = {};
  for (const row of (data ?? []) as WorkoutLog[]) {
    map[logKey(row.day_index, row.exercise_name)] = row;
  }
  return map;
}

export async function upsertLog(
  programId: string,
  userId: string,
  week: number,
  dayIndex: number,
  exerciseName: string,
  actualWeight: string,
  actualReps: string
): Promise<void> {
  await supabase.from('workout_logs').upsert(
    {
      program_id: programId,
      user_id: userId,
      week,
      day_index: dayIndex,
      exercise_name: exerciseName,
      actual_weight: actualWeight || null,
      actual_reps: actualReps || null,
      logged_at: new Date().toISOString(),
    },
    { onConflict: 'program_id,user_id,week,day_index,exercise_name' }
  );
}
