import { useCallback, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { deleteProgram, duplicateProgram, fetchPrograms } from '../../lib/programs';
import type { SavedProgram } from '../../data/types';
import { ProgramCard } from './ProgramCard';

interface DashboardPageProps {
  user: User;
  onNewProgram: () => void;
  onLoadProgram: (p: SavedProgram) => void;
  onGoToLanding: () => void;
  onSignOut: () => void;
}

export function DashboardPage({ user, onNewProgram, onLoadProgram, onGoToLanding, onSignOut }: DashboardPageProps) {
  const [programs, setPrograms] = useState<SavedProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setPrograms(await fetchPrograms());
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this program? This cannot be undone.')) return;
    try {
      await deleteProgram(id);
      setPrograms(prev => prev.filter(p => p.id !== id));
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const handleDuplicate = async (program: SavedProgram) => {
    try {
      const copy = await duplicateProgram(program);
      setPrograms(prev => [copy, ...prev]);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <div className="dash-page">
      {/* Header */}
      <header className="dash-hdr">
        <div className="dash-hdr-left">
          <button className="dash-logo-btn" onClick={onGoToLanding}>
            <span className="dash-logo">Empower<em>HER</em> Strength</span>
          </button>
          <div className="hdr-div"></div>
          <span className="dash-logo-tag">My Programs</span>
        </div>
        <div className="dash-hdr-right">
          <span className="dash-user-email">{user.email}</span>
          <button className="btn btn-primary btn-sm" onClick={onNewProgram}>+ New Program</button>
          <button className="btn btn-ghost btn-sm" onClick={onSignOut}>Sign Out</button>
        </div>
      </header>

      {/* Body */}
      <div className="dash-body">
        <div className="dash-section-hdr">
          <div className="dash-section-tag">Your Programs</div>
          <h2 className="dash-section-h">Saved programs</h2>
        </div>

        {error && <div className="dash-error">{error}</div>}

        {loading ? (
          <div className="dash-loading">
            <div className="dash-loading-text">Loading programs…</div>
          </div>
        ) : programs.length === 0 ? (
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
            {programs.map(p => (
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
      </div>
    </div>
  );
}
