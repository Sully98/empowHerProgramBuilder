import type { ProgramExercise, WorkoutLog } from '../../data/types';

interface ExerciseBlockProps {
  ex: ProgramExercise;
  di: number;
  ei: number;
  displaySets: string;
  displayWeight: string | undefined;
  isDeload: boolean;
  log?: WorkoutLog;
  isCoachView: boolean; // coach sees log read-only; student/user can edit
  onRemove: (di: number, ei: number) => void;
  onSetsChange: (di: number, ei: number, sets: string) => void;
  onWeightChange: (di: number, ei: number, weight: string) => void;
  onLogChange: (dayIndex: number, exerciseName: string, field: 'actual_weight' | 'actual_reps', value: string) => void;
  onDragStart: (di: number, ei: number) => void;
}

export function ExerciseBlock({
  ex, di, ei, displaySets, displayWeight, isDeload, log, isCoachView,
  onRemove, onSetsChange, onWeightChange, onLogChange, onDragStart,
}: ExerciseBlockProps) {
  return (
    <div
      className="exb"
      draggable
      title={ex.adapt ? `Equipment alternatives: ${ex.adapt}` : ''}
      style={isDeload ? { borderLeftColor: 'var(--gold)' } : undefined}
      onDragStart={() => onDragStart(di, ei)}
    >
      <div className="exb-dot" style={{ background: ex.color }}></div>
      <div className="exb-info">
        <div className="exb-name">{ex.name}</div>
        <div className="exb-muscle">{ex.muscle}</div>
      </div>

      <div className="exb-cols">
        {/* Planned fields */}
        <div className="exb-col-group">
          <div className="exb-col-label">Plan</div>
          <div className="exb-fields">
            <div className="exb-field-col">
              <input
                className="exb-sets"
                value={displaySets}
                readOnly={isDeload}
                style={isDeload ? { color: 'var(--gold)' } : undefined}
                onChange={e => !isDeload && onSetsChange(di, ei, e.target.value)}
              />
              <div className="exb-lbl">Sets × Reps{isDeload ? ' ↓' : ''}</div>
            </div>
            <div className="exb-field-col">
              <input
                className="exb-sets exb-weight"
                value={displayWeight ?? ''}
                readOnly={isDeload}
                placeholder="—"
                style={isDeload ? { color: 'var(--gold)' } : undefined}
                onChange={e => !isDeload && onWeightChange(di, ei, e.target.value)}
              />
              <div className="exb-lbl">Weight{isDeload ? ' ↓' : ''}</div>
            </div>
          </div>
        </div>

        {/* Logged fields */}
        <div className="exb-col-group exb-log-group">
          <div className="exb-col-label exb-log-label">{isCoachView ? 'Logged' : 'Actual'}</div>
          <div className="exb-fields">
            <div className="exb-field-col">
              <input
                className="exb-sets exb-log-input"
                value={log?.actual_reps ?? ''}
                readOnly={isCoachView}
                placeholder="—"
                onChange={e => !isCoachView && onLogChange(di, ex.name, 'actual_reps', e.target.value)}
              />
              <div className="exb-lbl">Reps Done</div>
            </div>
            <div className="exb-field-col">
              <input
                className="exb-sets exb-log-input"
                value={log?.actual_weight ?? ''}
                readOnly={isCoachView}
                placeholder="—"
                onChange={e => !isCoachView && onLogChange(di, ex.name, 'actual_weight', e.target.value)}
              />
              <div className="exb-lbl">Wt. Used</div>
            </div>
          </div>
        </div>
      </div>

      <button className="exb-rm" onClick={() => onRemove(di, ei)}>✕</button>
    </div>
  );
}
