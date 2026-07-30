import { useEffect, useRef, useState } from 'react';
import { DOW, GOALS, SPLITS } from '../../data/constants';
import type { AnalysisResult, Day, DragData, GoalKey, OverloadMethodId, SplitKey, WeekPlan, WorkoutLog, WorkoutLogKey } from '../../data/types';
import { DayCard } from './DayCard';
import { OverloadSummary } from './OverloadSummary';
import { SuggestionPanel } from './SuggestionPanel';
import { VolStrip } from './VolStrip';
import { WeekTabs } from './WeekTabs';

interface MainAreaProps {
  programName: string;
  split: SplitKey;
  goal: GoalKey;
  blockWeeks: number;
  deloadOn: boolean;
  deloadPct: number;
  days: Day[];
  overloadPlan: WeekPlan[];
  overloadVisible: boolean;
  selectedMethods: Set<OverloadMethodId>;
  activeWeekView: number;
  totalWeeks: number;
  isDeloadView: boolean;
  analysis: AnalysisResult | null;
  isCoachView: boolean;
  weekLogs: Record<WorkoutLogKey, WorkoutLog>;
  onSelectWeek: (w: number) => void;
  onProgramNameChange: (name: string) => void;
  onToggleDay: (di: number) => void;
  onUpdateLabel: (di: number, label: string) => void;
  onRemoveExercise: (di: number, ei: number) => void;
  onRowChange: (di: number, ei: number, si: number, field: 'reps' | 'weight', value: string) => void;
  onAddRow: (di: number, ei: number) => void;
  onRemoveRow: (di: number, ei: number, si: number) => void;
  onLogChange: (dayIndex: number, exerciseName: string, setIndex: number, field: 'actual_weight' | 'actual_reps', value: string) => void;
  onDragStart: (data: DragData) => void;
  onDrop: (tdi: number, goal: GoalKey, tei?: number) => void;
  onDismissOverload: () => void;
  onDismissAnalysis: () => void;
}

export function MainArea({
  programName, split, goal, blockWeeks, deloadOn, deloadPct,
  days, overloadPlan, overloadVisible, selectedMethods,
  activeWeekView, totalWeeks, isDeloadView, analysis,
  isCoachView, weekLogs,
  onSelectWeek, onProgramNameChange, onToggleDay, onUpdateLabel,
  onRemoveExercise, onRowChange, onAddRow, onRemoveRow, onLogChange, onDragStart, onDrop,
  onDismissOverload, onDismissAnalysis,
}: MainAreaProps) {
  const sugPanelRef = useRef<HTMLDivElement>(null);
  const [showAddDay, setShowAddDay] = useState(false);

  useEffect(() => {
    if (analysis) {
      sugPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [analysis]);

  const totalEx = days.filter(d => !d.isRest).reduce((a, d) => a + d.exercises.length, 0);
  const totalSets = days.filter(d => !d.isRest).reduce((a, d) => {
    return a + d.exercises.reduce((b, e) => b + e.setRows.length, 0);
  }, 0);
  const indexedDays = days.map((day, di) => ({ day, di }));
  const visibleDays = indexedDays.filter(({ day }) => !day.isRest);
  const hiddenDays = indexedDays.filter(({ day }) => day.isRest);
  const activeDays = visibleDays.length;
  const g = GOALS[goal];
  const s = SPLITS[split];
  const isDeloadWeek = deloadOn && activeWeekView === totalWeeks;

  return (
    <main className="main" id="main">
      <div className="prog-hdr">
        <div>
          <input
            className="prog-title"
            id="prog-title"
            type="text"
            value={programName}
            placeholder="My Program"
            maxLength={28}
            onChange={e => onProgramNameChange(e.target.value)}
          />
          <div className="prog-sub" id="prog-sub">
            {s.label} · {g.label} · {blockWeeks} Week Block{deloadOn ? ' + Deload' : ''} · Viewing: {isDeloadWeek ? 'Deload Week' : `Week ${activeWeekView}`}
            {isCoachView && <span className="prog-sub-coach-badge">Coach View</span>}
          </div>
        </div>
        <div className="prog-hdr-right">
          <div className="meta-row">
            <div className="mstat"><div className="mnum">{totalEx}</div><div className="mlbl">Exercises</div></div>
            <div className="mstat"><div className="mnum">{totalSets}</div><div className="mlbl">Total Sets</div></div>
            <div className="mstat"><div className="mnum">{activeDays}</div><div className="mlbl">Days/Wk</div></div>
            <div className="mstat"><div className="mnum" style={{ color: 'var(--gold)' }}>{totalWeeks}</div><div className="mlbl">Wk Block</div></div>
          </div>
          {hiddenDays.length > 0 && (
            <div className="add-day-wrap">
              <button className="btn btn-ghost btn-sm" onClick={() => setShowAddDay(v => !v)}>+ Add Day</button>
              {showAddDay && (
                <>
                  <div className="add-day-backdrop" onClick={() => setShowAddDay(false)} />
                  <div className="add-day-menu">
                    {hiddenDays.map(({ di }) => (
                      <button
                        key={di}
                        className="add-day-item"
                        onClick={() => { onToggleDay(di); setShowAddDay(false); }}
                      >
                        <span className="add-day-dow">{DOW[di]}</span>
                        <span className="add-day-lbl">Add this day back in</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <WeekTabs
        blockWeeks={blockWeeks}
        deloadOn={deloadOn}
        activeWeekView={activeWeekView}
        onSelectWeek={onSelectWeek}
      />

      <VolStrip days={days} goal={goal} />

      <OverloadSummary
        overloadPlan={overloadPlan}
        visible={overloadVisible}
        activeWeekView={activeWeekView}
        deloadPct={deloadPct}
        onClose={onDismissOverload}
      />

      <SuggestionPanel analysis={analysis} panelRef={sugPanelRef} onClose={onDismissAnalysis} />

      <div className="days-grid" id="days-grid">
        {visibleDays.map(({ day, di }) => (
          <DayCard
            key={di}
            day={day}
            di={di}
            activeWeekView={activeWeekView}
            isDeloadView={isDeloadView}
            overloadPlan={overloadPlan}
            selectedMethods={selectedMethods}
            deloadPct={deloadPct}
            goal={goal}
            isCoachView={isCoachView}
            weekLogs={weekLogs}
            onToggleDay={onToggleDay}
            onUpdateLabel={onUpdateLabel}
            onRemoveExercise={onRemoveExercise}
            onRowChange={onRowChange}
            onAddRow={onAddRow}
            onRemoveRow={onRemoveRow}
            onLogChange={onLogChange}
            onDragStart={onDragStart}
            onDrop={onDrop}
          />
        ))}
      </div>

    </main>
  );
}
