import { useEffect, useRef } from 'react';
import { GOALS, SPLITS } from '../../data/constants';
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
  onSetsChange: (di: number, ei: number, sets: string) => void;
  onWeightChange: (di: number, ei: number, weight: string) => void;
  onLogChange: (dayIndex: number, exerciseName: string, field: 'actual_weight' | 'actual_reps', value: string) => void;
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
  onRemoveExercise, onSetsChange, onWeightChange, onLogChange, onDragStart, onDrop,
  onDismissOverload, onDismissAnalysis,
}: MainAreaProps) {
  const sugPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (analysis) {
      sugPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [analysis]);

  const totalEx = days.filter(d => !d.isRest).reduce((a, d) => a + d.exercises.length, 0);
  const totalSets = days.filter(d => !d.isRest).reduce((a, d) => {
    return a + d.exercises.reduce((b, e) => {
      const m = e.sets.match(/^(\d+)/);
      return b + (m ? parseInt(m[1]) : 0);
    }, 0);
  }, 0);
  const activeDays = days.filter(d => !d.isRest).length;
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
        <div className="meta-row">
          <div className="mstat"><div className="mnum">{totalEx}</div><div className="mlbl">Exercises</div></div>
          <div className="mstat"><div className="mnum">{totalSets}</div><div className="mlbl">Total Sets</div></div>
          <div className="mstat"><div className="mnum">{activeDays}</div><div className="mlbl">Days/Wk</div></div>
          <div className="mstat"><div className="mnum" style={{ color: 'var(--gold)' }}>{totalWeeks}</div><div className="mlbl">Wk Block</div></div>
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

      <div
        className="days-grid"
        id="days-grid"
        style={{ gridTemplateColumns: `repeat(${Math.min(days.length, 7)}, 1fr)` }}
      >
        {days.map((day, di) => (
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
            onSetsChange={onSetsChange}
            onWeightChange={onWeightChange}
            onLogChange={onLogChange}
            onDragStart={onDragStart}
            onDrop={onDrop}
          />
        ))}
      </div>

    </main>
  );
}
