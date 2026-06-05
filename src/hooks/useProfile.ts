import type { User } from '@supabase/supabase-js';
import { useCallback, useEffect, useState } from 'react';
import { acceptPendingInvites } from '../lib/coaching';
import { getProfile, upsertProfile } from '../lib/profiles';
import type { Profile } from '../data/types';

export function useProfile(user: User | null) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    if (!user) { setProfile(null); setProfileLoading(false); return; }
    setProfileLoading(true);
    getProfile(user.id).then(async p => {
      // Ensure profile row exists (trigger may not have fired for existing users)
      if (!p) {
        await upsertProfile(user.id, user.email ?? '', {});
        p = await getProfile(user.id);
      }
      setProfile(p);
      setProfileLoading(false);

      // Check for pending coach invites on every login
      if (p && user.email) {
        const joined = await acceptPendingInvites(user.id, user.email);
        if (joined && p.role !== 'user') {
          await upsertProfile(user.id, user.email, { role: 'user' });
          setProfile(prev => prev ? { ...prev, role: 'user' } : prev);
        }
      }
    });
  }, [user]);

  const setRole = useCallback(async (role: 'coach' | 'user') => {
    if (!user) return;
    await upsertProfile(user.id, user.email ?? '', { role });
    setProfile(prev => prev ? { ...prev, role } : prev);
  }, [user]);

  const setDisplayName = useCallback(async (name: string) => {
    if (!user) return;
    await upsertProfile(user.id, user.email ?? '', { display_name: name });
    setProfile(prev => prev ? { ...prev, display_name: name } : prev);
  }, [user]);

  return { profile, profileLoading, setRole, setDisplayName };
}
