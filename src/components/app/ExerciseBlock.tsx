import type { ProgramExercise } from '../../data/types';

interface ExerciseBlockProps {
  ex: ProgramExercise;
  di: number;
  ei: number;
  displaySets: string;
  displayWeight: string | undefined;
  isDeload: boolean;
  onRemove: (di: number, ei: number) => void;
  onSetsChange: (di: number, ei: number, sets: string) => void;
  onWeightChange: (di: number, ei: number, weight: string) => void;
  onDragStart: (di: number, ei: number) => void;
}

export function ExerciseBlock({ ex, di, ei, displaySets, displayWeight, isDeload, onRemove, onSetsChange, onWeightChange, onDragStart }: ExerciseBlockProps) {
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
      <button className="exb-rm" onClick={() => onRemove(di, ei)}>✕</button>
    </div>
  );
}
