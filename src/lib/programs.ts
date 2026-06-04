import { supabase } from './supabase';
import type { SavedProgram, SavedProgramInsert } from '../data/types';

export async function fetchPrograms(): Promise<SavedProgram[]> {
  const { data, error } = await supabase
    .from('programs')
    .select('*')
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as SavedProgram[];
}

export async function upsertProgram(program: SavedProgramInsert & { id?: string }): Promise<string> {
  if (program.id) {
    const { error } = await supabase
      .from('programs')
      .update({ ...program, updated_at: new Date().toISOString() })
      .eq('id', program.id);
    if (error) throw error;
    return program.id;
  }
  const { data, error } = await supabase
    .from('programs')
    .insert(program)
    .select('id')
    .single();
  if (error) throw error;
  return (data as { id: string }).id;
}

export async function deleteProgram(id: string): Promise<void> {
  const { error } = await supabase.from('programs').delete().eq('id', id);
  if (error) throw error;
}

export async function duplicateProgram(program: SavedProgram): Promise<SavedProgram> {
  const { id: _id, created_at: _c, updated_at: _u, ...rest } = program;
  const { data, error } = await supabase
    .from('programs')
    .insert({ ...rest, name: `${program.name} (Copy)` })
    .select()
    .single();
  if (error) throw error;
  return data as SavedProgram;
}
