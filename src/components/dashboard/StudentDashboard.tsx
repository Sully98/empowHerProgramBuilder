import { useCallback, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { deleteProgram, duplicateProgram, fetchPrograms } from '../../lib/programs';
import { getMyCoach } from '../../lib/coaching';
import type { CoachStudent, Profile, SavedProgram } from '../../data/types';
import { ProgramCard } from './ProgramCard';

interface StudentDashboardProps {
  user: User;
  profile: Profile;
  onNewProgram: () => void;
  onLoadProgram: (p: SavedProgram) => void;
  onGoToLanding: () => void;
  onSignOut: () => void;
}

export function StudentDashboard({ user, profile, onNewProgram, onLoadProgram, onGoToLanding, onSignOut }: StudentDashboardProps) {
  const [myPrograms, setMyPrograms] = useState<SavedProgram[]>([]);
  const [coach, setCoach] = useState<(CoachStudent & { profile: Profile }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [progs, coachRel] = await Promise.all([
        fetchPrograms(),
        getMyCoach(user.id),
      ]);
      setMyPrograms(progs);
      setCoach(coachRel);
    } catch (e) { setError((e as Error).message); }
    finally { setLoading(false); }
  }, [user.id]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this program? This cannot be undone.')) return;
    await deleteProgram(id);
    setMyPrograms(prev => prev.filter(p => p.id !== id));
  };

  const handleDuplicate = async (program: SavedProgram) => {
    const copy = await duplicateProgram(program);
    setMyPrograms(prev => [copy, ...prev]);
  };

  const ownPrograms = myPrograms.filter(p => !p.assigned_to || p.assigned_to === user.id);
  const coachPrograms = myPrograms.filter(p => p.assigned_to === user.id && p.user_id !== user.id);

  const displayName = profile.display_name || profile.email;

  return (
    <div className="dash-page">
      <header className="dash-hdr">
        <div className="dash-hdr-left">
          <button className="dash-logo-btn" onClick={onGoToLanding}>
            <span className="dash-logo">Empower<em>HER</em> Strength</span>
          </button>
          <div className="hdr-div"></div>
          <span className="dash-logo-tag">My Programs</span>
        </div>
        <div className="dash-hdr-right">
          <span className="dash-user-email">{displayName}</span>
          <button className="btn btn-primary btn-sm" onClick={onNewProgram}>+ New Program</button>
          <button className="btn btn-ghost btn-sm" onClick={onSignOut}>Sign Out</button>
        </div>
      </header>

      <div className="dash-body">
        {error && <div className="dash-error">{error}</div>}

        {loading ? (
          <div className="dash-loading"><div className="dash-loading-text">Loading…</div></div>
        ) : (
          <>
            {/* Coach-assigned programs */}
            {coachPrograms.length > 0 && (
              <div style={{ marginBottom: '40px' }}>
                <div className="dash-section-hdr">
                  <div className="dash-section-tag">From your coach{coach ? ` — ${coach.profile.display_name ?? coach.profile.email}` : ''}</div>
                  <h2 className="dash-section-h">Coach-assigned programs</h2>
                </div>
                <div className="dash-grid">
                  {coachPrograms.map(p => (
                    <ProgramCard
                      key={p.id}
                      program={p}
                      badge="Coach assigned"
                      onLoad={onLoadProgram}
                      onDuplicate={handleDuplicate}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Own programs */}
            <div className="dash-section-hdr">
              <div className="dash-section-tag">Your programs</div>
              <h2 className="dash-section-h">Saved programs</h2>
            </div>
            {ownPrograms.length === 0 ? (
              <div className="dash-empty">
                <div className="dash-empty-icon">📋</div>
                <div className="dash-empty-h">No saved programs yet</div>
                <div className="dash-empty-p">Build your first program and hit Save to see it here.</div>
                <button className="btn btn-primary" style={{ marginTop: '20px' }} onClick={onNewProgram}>
                  Build My First Program →
                </button>
              </div>
            ) : (
              <div className="dash-grid">
                {ownPrograms.map(p => (
                  <ProgramCard
                    key={p.id}
                    program={p}
                    onLoad={onLoadProgram}
                    onDuplicate={handleDuplicate}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
