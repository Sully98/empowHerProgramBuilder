import { supabase } from './supabase';
import type { CoachInvite, CoachStudent, Profile } from '../data/types';

export async function getMyStudents(coachId: string): Promise<(CoachStudent & { profile: Profile })[]> {
  const { data: rels } = await supabase
    .from('coach_students')
    .select('*')
    .eq('coach_id', coachId)
    .order('created_at', { ascending: false });

  if (!rels?.length) return [];

  const ids = (rels as CoachStudent[]).map(r => r.student_id);
  const { data: profiles } = await supabase.from('profiles').select('*').in('id', ids);
  const profileMap = Object.fromEntries((profiles ?? []).map((p: Profile) => [p.id, p]));

  return (rels as CoachStudent[]).map(r => ({ ...r, profile: profileMap[r.student_id] }));
}

export async function getMyCoach(studentId: string): Promise<(CoachStudent & { profile: Profile }) | null> {
  const { data } = await supabase
    .from('coach_students')
    .select('*')
    .eq('student_id', studentId)
    .single();

  if (!data) return null;
  const rel = data as CoachStudent;

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', rel.coach_id).single();
  return profile ? { ...rel, profile: profile as Profile } : null;
}

export async function inviteStudent(coachId: string, studentEmail: string): Promise<void> {
  const { error } = await supabase.from('coach_invites').upsert(
    { coach_id: coachId, student_email: studentEmail.toLowerCase().trim(), status: 'pending' },
    { onConflict: 'coach_id,student_email' }
  );
  if (error) throw error;
}

export async function getMyInvites(coachId: string): Promise<CoachInvite[]> {
  const { data } = await supabase
    .from('coach_invites')
    .select('*')
    .eq('coach_id', coachId)
    .order('created_at', { ascending: false });
  return (data ?? []) as CoachInvite[];
}

export async function acceptPendingInvites(studentId: string, studentEmail: string): Promise<boolean> {
  const { data: invites } = await supabase
    .from('coach_invites')
    .select('*')
    .eq('student_email', studentEmail.toLowerCase())
    .eq('status', 'pending');

  if (!invites?.length) return false;

  for (const invite of invites as CoachInvite[]) {
    await supabase.from('coach_students').upsert(
      { coach_id: invite.coach_id, student_id: studentId },
      { onConflict: 'coach_id,student_id' }
    );
    await supabase.from('coach_invites').update({ status: 'accepted' }).eq('id', invite.id);
  }
  return true;
}

export async function removeStudent(coachId: string, studentId: string): Promise<void> {
  await supabase.from('coach_students').delete().eq('coach_id', coachId).eq('student_id', studentId);
}

export async function getStudentPrograms(studentId: string) {
  const { data } = await supabase
    .from('programs')
    .select('*')
    .eq('assigned_to', studentId)
    .order('updated_at', { ascending: false });
  return data ?? [];
}
