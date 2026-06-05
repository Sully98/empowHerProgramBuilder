import { useCallback, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { getMyInvites, getMyStudents, getStudentPrograms, inviteStudent, removeStudent } from '../../lib/coaching';
import { fetchPrograms } from '../../lib/programs';
import type { CoachInvite, CoachStudent, Profile, SavedProgram } from '../../data/types';
import { ProgramCard } from '../dashboard/ProgramCard';
import { InviteModal } from './InviteModal';
import { deleteProgram, duplicateProgram } from '../../lib/programs';

interface CoachDashboardProps {
  user: User;
  coachProfile: Profile;
  onNewProgram: () => void;
  onLoadProgram: (p: SavedProgram) => void;
  onLoadProgramForStudent: (p: SavedProgram, student: Profile) => void;
  onGoToLanding: () => void;
  onSignOut: () => void;
}

export function CoachDashboard({
  user, coachProfile, onNewProgram, onLoadProgram, onLoadProgramForStudent, onGoToLanding, onSignOut,
}: CoachDashboardProps) {
  const [students, setStudents] = useState<(CoachStudent & { profile: Profile })[]>([]);
  const [invites, setInvites] = useState<CoachInvite[]>([]);
  const [myPrograms, setMyPrograms] = useState<SavedProgram[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Profile | null>(null);
  const [studentPrograms, setStudentPrograms] = useState<SavedProgram[]>([]);
  const [showInvite, setShowInvite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [studs, ivts, progs] = await Promise.all([
        getMyStudents(user.id),
        getMyInvites(user.id),
        fetchPrograms(),
      ]);
      setStudents(studs);
      setInvites(ivts.filter(i => i.status === 'pending'));
      setMyPrograms(progs);
    } catch (e) { setError((e as Error).message); }
    finally { setLoading(false); }
  }, [user.id]);

  useEffect(() => { reload(); }, [reload]);

  const handleSelectStudent = async (student: Profile) => {
    setSelectedStudent(student);
    const progs = await getStudentPrograms(student.id);
    setStudentPrograms(progs as SavedProgram[]);
  };

  const handleInvite = async (email: string) => {
    await inviteStudent(user.id, email);
    await reload();
  };

  const handleRemoveStudent = async (studentId: string) => {
    if (!confirm('Remove this athlete from your roster?')) return;
    await removeStudent(user.id, studentId);
    setStudents(prev => prev.filter(s => s.student_id !== studentId));
    if (selectedStudent?.id === studentId) setSelectedStudent(null);
  };

  const handleDeleteProgram = async (id: string) => {
    if (!confirm('Delete this program? This cannot be undone.')) return;
    await deleteProgram(id);
    setMyPrograms(prev => prev.filter(p => p.id !== id));
    setStudentPrograms(prev => prev.filter(p => p.id !== id));
  };

  const handleDuplicate = async (program: SavedProgram) => {
    const copy = await duplicateProgram(program);
    if (selectedStudent) setStudentPrograms(prev => [copy, ...prev]);
    else setMyPrograms(prev => [copy, ...prev]);
  };

  const displayName = coachProfile.display_name || coachProfile.email;

  return (
    <div className="dash-page">
      <header className="dash-hdr">
        <div className="dash-hdr-left">
          <button className="dash-logo-btn" onClick={onGoToLanding}>
            <span className="dash-logo">Empower<em>HER</em> Strength</span>
          </button>
          <div className="hdr-div"></div>
          <span className="dash-logo-tag">Coach Dashboard</span>
        </div>
        <div className="dash-hdr-right">
          <span className="dash-user-email">{displayName}</span>
          <button className="btn btn-primary btn-sm" onClick={onNewProgram}>+ New Program</button>
          <button className="btn btn-ghost btn-sm" onClick={onSignOut}>Sign Out</button>
        </div>
      </header>

      <div className="coach-body">
        {/* LEFT: Roster */}
        <aside className="coach-sidebar">
          <div className="coach-sidebar-hdr">
            <div>
              <div className="dash-section-tag">My Athletes</div>
              <div className="coach-roster-count">{students.length} athlete{students.length !== 1 ? 's' : ''}</div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowInvite(true)}>+ Invite</button>
          </div>

          {error && <div className="dash-error">{error}</div>}

          {loading ? (
            <div className="dash-loading-text" style={{ padding: '20px 16px' }}>Loading…</div>
          ) : (
            <div className="roster-list">
              <button
                className={`roster-item${!selectedStudent ? ' active' : ''}`}
                onClick={() => setSelectedStudent(null)}
              >
                <div className="roster-item-name">My Programs</div>
                <div className="roster-item-meta">{myPrograms.length} program{myPrograms.length !== 1 ? 's' : ''}</div>
              </button>

              {students.map(rel => (
                <div key={rel.student_id} className="roster-item-wrap">
                  <button
                    className={`roster-item${selectedStudent?.id === rel.student_id ? ' active' : ''}`}
                    onClick={() => handleSelectStudent(rel.profile)}
                  >
                    <div className="roster-item-avatar">{(rel.profile?.display_name || rel.profile?.email || '?')[0].toUpperCase()}</div>
                    <div>
                      <div className="roster-item-name">{rel.profile?.display_name || rel.profile?.email}</div>
                      <div className="roster-item-meta">{rel.profile?.email}</div>
                    </div>
                  </button>
                  <button className="roster-item-remove" onClick={() => handleRemoveStudent(rel.student_id)} title="Remove">✕</button>
                </div>
              ))}

              {invites.length > 0 && (
                <div className="roster-pending-hdr">Pending invites</div>
              )}
              {invites.map(inv => (
                <div key={inv.id} className="roster-item roster-item-pending">
                  <div className="roster-item-name">{inv.student_email}</div>
                  <div className="roster-item-meta">Awaiting sign-in</div>
                </div>
              ))}
            </div>
          )}
        </aside>

        {/* RIGHT: Programs */}
        <main className="coach-main">
          {selectedStudent ? (
            <>
              <div className="dash-section-hdr">
                <div className="dash-section-tag">Programs for</div>
                <h2 className="dash-section-h">{selectedStudent.display_name || selectedStudent.email}</h2>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => onLoadProgramForStudent({ id: '', name: 'New Program' } as SavedProgram, selectedStudent)}
                >
                  + New Program for {selectedStudent.display_name || selectedStudent.email.split('@')[0]}
                </button>
              </div>
              {studentPrograms.length === 0 ? (
                <div className="dash-empty">
                  <div className="dash-empty-icon">📋</div>
                  <div className="dash-empty-h">No programs yet</div>
                  <div className="dash-empty-p">Create a program for this athlete to get started.</div>
                </div>
              ) : (
                <div className="dash-grid">
                  {studentPrograms.map(p => (
                    <ProgramCard
                      key={p.id}
                      program={p}
                      onLoad={() => onLoadProgramForStudent(p, selectedStudent)}
                      onDuplicate={handleDuplicate}
                      onDelete={handleDeleteProgram}
                      badge={selectedStudent.display_name || selectedStudent.email.split('@')[0]}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="dash-section-hdr">
                <div className="dash-section-tag">My Programs</div>
                <h2 className="dash-section-h">Your saved programs</h2>
              </div>
              {myPrograms.length === 0 ? (
                <div className="dash-empty">
                  <div className="dash-empty-icon">📋</div>
                  <div className="dash-empty-h">No programs yet</div>
                  <div className="dash-empty-p">Hit "+ New Program" to build your first one.</div>
                  <button className="btn btn-primary" style={{ marginTop: '20px' }} onClick={onNewProgram}>
                    Build My First Program →
                  </button>
                </div>
              ) : (
                <div className="dash-grid">
                  {myPrograms.map(p => (
                    <ProgramCard
                      key={p.id}
                      program={p}
                      onLoad={onLoadProgram}
                      onDuplicate={handleDuplicate}
                      onDelete={handleDeleteProgram}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {showInvite && <InviteModal onInvite={handleInvite} onClose={() => setShowInvite(false)} />}
    </div>
  );
}
