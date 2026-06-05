import { supabase } from './supabase';
import type { Profile } from '../data/types';

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
  return (data as Profile | null);
}

export async function upsertProfile(userId: string, email: string, updates: Partial<Pick<Profile, 'role' | 'display_name'>>): Promise<void> {
  await supabase.from('profiles').upsert({ id: userId, email, ...updates });
}

export async function getProfilesByIds(ids: string[]): Promise<Profile[]> {
  if (!ids.length) return [];
  const { data } = await supabase.from('profiles').select('*').in('id', ids);
  return (data ?? []) as Profile[];
}
