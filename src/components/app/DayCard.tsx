import { useState } from 'react';
import { DOW } from '../../data/constants';
import { applyDeloadRows, getWkDisplayRows } from '../../hooks/useProgramBuilder';
import { logKey } from '../../lib/workoutLogs';
import type { Day, DragData, GoalKey, OverloadMethodId, WeekPlan, WorkoutLog, WorkoutLogKey } from '../../data/types';
import { ExerciseBlock } from './ExerciseBlock';

interface DayCardProps {
  day: Day;
  di: number;
  activeWeekView: number;
  isDeloadView: boolean;
  overloadPlan: WeekPlan[];
  selectedMethods: Set<OverloadMethodId>;
  deloadPct: number;
  goal: GoalKey;
  isCoachView: boolean;
  weekLogs: Record<WorkoutLogKey, WorkoutLog>;
  onToggleDay: (di: number) => void;
  onUpdateLabel: (di: number, label: string) => void;
  onRemoveExercise: (di: number, ei: number) => void;
  onRowChange: (di: number, ei: number, si: number, field: 'reps' | 'weight', value: string) => void;
  onAddRow: (di: number, ei: number) => void;
  onRemoveRow: (di: number, ei: number, si: number) => void;
  onLogChange: (dayIndex: number, exerciseName: string, setIndex: number, field: 'actual_weight' | 'actual_reps', value: string) => void;
  onDragStart: (data: DragData) => void;
  onDrop: (tdi: number, goal: GoalKey, tei?: number) => void;
}

export function DayCard({
  day, di, activeWeekView, isDeloadView, overloadPlan, selectedMethods, deloadPct, goal,
  isCoachView, weekLogs,
  onToggleDay, onUpdateLabel, onRemoveExercise, onRowChange, onAddRow, onRemoveRow, onLogChange, onDragStart, onDrop,
}: DayCardProps) {
  const [dragOver, setDragOver] = useState(false);
  const [dropIndex, setDropIndex] = useState<number | null>(null);

  return (
    <div
      className={`day-card${day.isRest ? ' rest' : ''}${dragOver ? ' drag-over' : ''}`}
      onDragOver={e => { if (!day.isRest) { e.preventDefault(); setDragOver(true); setDropIndex(day.exercises.length); } }}
      onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) { setDragOver(false); setDropIndex(null); } }}
      onDrop={e => { e.preventDefault(); setDragOver(false); const idx = dropIndex; setDropIndex(null); onDrop(di, goal, idx ?? undefined); }}
    >
      <div className="day-hdr">
        <span className="day-dow">{DOW[di]}</span>
        <input
          className="day-lbl"
          value={day.label}
          placeholder="Name this day"
          onChange={e => onUpdateLabel(di, e.target.value)}
        />
        <div className="dtog-wrap">
          <span className="dtog-lbl">{day.isRest ? 'Off' : 'On'}</span>
          <div className={`dtog${!day.isRest ? ' on' : ''}`} onClick={() => onToggleDay(di)}></div>
        </div>
      </div>

      <div className="day-exs" id={`dex-${di}`}>
        {!day.isRest && (
          day.exercises.length === 0
            ? <div className="drop-hint">Drop exercises here</div>
            : day.exercises.map((ex, ei) => {
                const displayRows = isDeloadView
                  ? applyDeloadRows(ex.setRows, deloadPct)
                  : getWkDisplayRows(ex.setRows, activeWeekView, overloadPlan, selectedMethods);
                const getLog = (si: number) => weekLogs[logKey(di, ex.name, si)];
                return (
                  <div
                    key={ei}
                    onDragOver={e => { e.preventDefault(); e.stopPropagation(); setDropIndex(ei); setDragOver(true); }}
                  >
                    {dropIndex === ei && (
                      <div style={{ height: '2px', background: 'var(--accent)', margin: '2px 0', borderRadius: '1px' }} />
                    )}
                    <ExerciseBlock
                      ex={ex}
                      di={di}
                      ei={ei}
                      displayRows={displayRows}
                      isDeload={isDeloadView}
                      getLog={getLog}
                      isCoachView={isCoachView}
                      onRemove={onRemoveExercise}
                      onRowChange={onRowChange}
                      onAddRow={onAddRow}
                      onRemoveRow={onRemoveRow}
                      onLogChange={onLogChange}
                      onDragStart={(d, e) => onDragStart({ src: 'block', di: d, ei: e })}
                    />
                  </div>
                );
              })
        )}
      </div>

      <div className="day-rest-ui">
        <div className="rest-ico">💤</div>
        <div className="rest-t">Rest Day</div>
      </div>
    </div>
  );
}
