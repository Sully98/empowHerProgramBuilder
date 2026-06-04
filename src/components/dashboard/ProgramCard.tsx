import { GOALS, MUSCLES, SPLITS } from '../../data/constants';
import type { SavedProgram } from '../../data/types';

interface ProgramCardProps {
  program: SavedProgram;
  onLoad: (p: SavedProgram) => void;
  onDuplicate: (p: SavedProgram) => void;
  onDelete: (id: string) => void;
}

function relativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)   return 'just now';
  if (mins < 60)  return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)   return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30)  return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function countExercises(program: SavedProgram): number {
  return program.days.filter(d => !d.isRest).reduce((n, d) => n + d.exercises.length, 0);
}

function countActiveDays(program: SavedProgram): number {
  return program.days.filter(d => !d.isRest).length;
}

function goalColor(goal: string): string {
  const map: Record<string, string> = {
    hypertrophy: 'var(--accent)',
    strength:    'var(--gold)',
    power:       '#c17d5a',
    endurance:   '#7aab80',
  };
  return map[goal] ?? 'var(--muted)';
}

export function ProgramCard({ program, onLoad, onDuplicate, onDelete }: ProgramCardProps) {
  const splitLabel = SPLITS[program.split as keyof typeof SPLITS]?.label ?? program.split;
  const goalLabel  = GOALS[program.goal as keyof typeof GOALS]?.label ?? program.goal;
  const exCount    = countExercises(program);
  const activeDays = countActiveDays(program);

  const musclesUsed = [...new Set(
    program.days.flatMap(d => d.exercises.map(e => e.muscle))
  )].map(m => ({ name: m, color: MUSCLES[m]?.color ?? 'var(--muted)' })).slice(0, 5);

  return (
    <div className="prog-card">
      <div className="prog-card-top">
        <div className="prog-card-name">{program.name}</div>
        <div className="prog-card-updated">{relativeDate(program.updated_at)}</div>
      </div>

      <div className="prog-card-stats">
        <div className="prog-card-stat">
          <span className="pcs-label">Split</span>
          <span className="pcs-value">{splitLabel}</span>
        </div>
        <div className="prog-card-stat">
          <span className="pcs-label">Goal</span>
          <span className="pcs-value" style={{ color: goalColor(program.goal) }}>{goalLabel}</span>
        </div>
        <div className="prog-card-stat">
          <span className="pcs-label">Block</span>
          <span className="pcs-value">{program.block_weeks}wk{program.deload_on ? ' + D' : ''}</span>
        </div>
        <div className="prog-card-stat">
          <span className="pcs-label">Days</span>
          <span className="pcs-value">{activeDays}/wk</span>
        </div>
        <div className="prog-card-stat">
          <span className="pcs-label">Exercises</span>
          <span className="pcs-value">{exCount}</span>
        </div>
      </div>

      {musclesUsed.length > 0 && (
        <div className="prog-card-muscles">
          {musclesUsed.map(m => (
            <span key={m.name} className="prog-card-muscle-dot" style={{ background: m.color }} title={m.name} />
          ))}
        </div>
      )}

      <div className="prog-card-actions">
        <button className="btn btn-primary btn-sm" onClick={() => onLoad(program)}>
          Load →
        </button>
        <button className="btn btn-ghost btn-sm" onClick={() => onDuplicate(program)}>
          Duplicate
        </button>
        <button className="btn btn-ghost btn-sm prog-card-delete" onClick={() => onDelete(program.id)}>
          Delete
        </button>
      </div>
    </div>
  );
}
