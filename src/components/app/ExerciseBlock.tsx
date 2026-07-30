import type { ProgramExercise, SetRow, WorkoutLog } from '../../data/types';

interface ExerciseBlockProps {
  ex: ProgramExercise;
  di: number;
  ei: number;
  displayRows: SetRow[];
  isDeload: boolean;
  getLog: (si: number) => WorkoutLog | undefined;
  isCoachView: boolean; // coach sees log read-only; student/user can edit
  onRemove: (di: number, ei: number) => void;
  onRowChange: (di: number, ei: number, si: number, field: 'reps' | 'weight', value: string) => void;
  onAddRow: (di: number, ei: number) => void;
  onRemoveRow: (di: number, ei: number, si: number) => void;
  onLogChange: (dayIndex: number, exerciseName: string, setIndex: number, field: 'actual_weight' | 'actual_reps', value: string) => void;
  onDragStart: (di: number, ei: number) => void;
}

export function ExerciseBlock({
  ex, di, ei, displayRows, isDeload, getLog, isCoachView,
  onRemove, onRowChange, onAddRow, onRemoveRow, onLogChange, onDragStart,
}: ExerciseBlockProps) {
  return (
    <div
      className="exb"
      draggable
      title={ex.adapt ? `Equipment alternatives: ${ex.adapt}` : ''}
      style={isDeload ? { borderLeftColor: 'var(--gold)' } : undefined}
      onDragStart={() => onDragStart(di, ei)}
    >
      <div className="exb-hdr">
        <div className="exb-dot" style={{ background: ex.color }}></div>
        <div className="exb-info">
          <div className="exb-name">{ex.name}</div>
          <div className="exb-muscle">{ex.muscle}</div>
        </div>
        <button className="exb-rm" onClick={() => onRemove(di, ei)}>✕</button>
      </div>

      <div className="exb-rows">
        <div className="exb-row exb-row-hdr">
          <span></span>
          <span>Reps</span>
          <span>Weight{isDeload ? ' ↓' : ''}</span>
          <span className="exb-log-lbl">Done</span>
          <span className="exb-log-lbl">Used</span>
          <span></span>
        </div>
        {displayRows.map((row, si) => {
          const log = getLog(si);
          return (
            <div className="exb-row" key={si}>
              <span className="exb-row-num">{si + 1}</span>
              <input
                className="exb-row-input"
                value={row.reps}
                readOnly={isDeload}
                placeholder="8-10"
                style={isDeload ? { color: 'var(--gold)' } : undefined}
                onChange={e => !isDeload && onRowChange(di, ei, si, 'reps', e.target.value)}
              />
              <input
                className="exb-row-input exb-row-weight"
                value={row.weight}
                readOnly={isDeload}
                placeholder="—"
                style={isDeload ? { color: 'var(--gold)' } : undefined}
                onChange={e => !isDeload && onRowChange(di, ei, si, 'weight', e.target.value)}
              />
              <input
                className="exb-row-input exb-log-input"
                value={log?.actual_reps ?? ''}
                readOnly={isCoachView}
                placeholder="—"
                onChange={e => !isCoachView && onLogChange(di, ex.name, si, 'actual_reps', e.target.value)}
              />
              <input
                className="exb-row-input exb-log-input"
                value={log?.actual_weight ?? ''}
                readOnly={isCoachView}
                placeholder="—"
                onChange={e => !isCoachView && onLogChange(di, ex.name, si, 'actual_weight', e.target.value)}
              />
              {!isDeload && displayRows.length > 1 ? (
                <button className="exb-row-rm" onClick={() => onRemoveRow(di, ei, si)} title="Remove set">✕</button>
              ) : <span></span>}
            </div>
          );
        })}
        {!isDeload && (
          <button className="exb-add-row" onClick={() => onAddRow(di, ei)}>+ Add Set</button>
        )}
      </div>
    </div>
  );
}
