import { useCallback, useRef, useState } from 'react';
import { GOALS, MUSCLES, OVERLOAD_METHODS, SPLITS } from '../data/constants';
import type {
  AnalysisResult,
  Day,
  DragData,
  GoalKey,
  OverloadMethodId,
  ProgramExercise,
  SavedProgram,
  SplitKey,
  WeekInstruction,
  WeekPlan,
} from '../data/types';

function buildWeekInstructions(w: number, methods: OverloadMethodId[]): WeekInstruction[] {
  const instr: WeekInstruction[] = [];
  if (methods.includes('load'))
    instr.push({ method: 'Load', detail: w === 1 ? 'Establish your working weight for all exercises' : `Increase weight 2.5–5% from Week ${w - 1}` });
  if (methods.includes('reps'))
    instr.push({ method: 'Reps', detail: w === 1 ? 'Work at the bottom of your rep range' : w % 3 === 0 ? 'Top of rep range — ready to add weight next week' : 'Add 1–2 reps from last week' });
  if (methods.includes('sets'))
    instr.push({ method: 'Sets', detail: w === 1 ? 'Start with prescribed sets' : w >= 3 ? 'Add 1 set to each primary exercise' : 'Maintain sets from Week 1' });
  if (methods.includes('tempo')) {
    const t = ['2-0-1-0', '3-0-1-0', '3-1-1-0', '4-1-1-0'];
    instr.push({ method: 'Tempo', detail: `Use ${t[Math.min(w - 1, t.length - 1)]} (eccentric-pause-concentric-pause) this week` });
  }
  if (methods.includes('quality')) {
    const c = ['Focus on full range of motion across all reps', 'Eliminate momentum — control every rep', 'Pause at peak contraction for 1 second', 'Perfect form before adding any load'];
    instr.push({ method: 'Rep Quality', detail: c[Math.min(w - 1, c.length - 1)] });
  }
  if (methods.includes('rest')) {
    const r = ['Use full prescribed rest intervals', 'Reduce rest by 10 seconds from last week', 'Reduce rest by another 10 seconds', 'Minimum rest — push training density'];
    instr.push({ method: 'Rest', detail: r[Math.min(w - 1, r.length - 1)] });
  }
  if (methods.includes('freq'))
    instr.push({ method: 'Frequency', detail: w <= 2 ? 'Standard session frequency' : 'Consider an extra session for any lagging muscle groups' });
  return instr;
}

function buildDeloadInstructions(deloadPct: number): WeekInstruction[] {
  return [
    { method: 'Volume',    detail: `Reduce total sets by ${deloadPct}% — keep the same movements` },
    { method: 'Load',      detail: 'Drop to approximately 60% of your working weights' },
    { method: 'Intensity', detail: 'No sets to failure — stop 3–4 reps before failure' },
    { method: 'Purpose',   detail: 'Active recovery — allow your CNS, joints, and connective tissue to recover before the next block' },
  ];
}

export function getWkSets(base: string, w: number, overloadPlan: WeekPlan[], selectedMethods: Set<OverloadMethodId>): string {
  if (!overloadPlan.length || !selectedMethods.has('sets')) return base;
  const wp = overloadPlan[w - 1];
  if (!wp || wp.isDeload) return base;
  const m = base.match(/^(\d+)×(.+)/);
  if (!m) return base;
  let s = parseInt(m[1]);
  if (w >= 3) s = Math.min(s + 1, 6);
  return `${s}×${m[2]}`;
}

export function applyDeload(base: string, deloadPct: number): string {
  const m = base.match(/^(\d+)×(.+)/);
  if (!m) return base + ' ↓';
  const s = Math.max(1, Math.round(parseInt(m[1]) * (deloadPct / 100)));
  return `${s}×${m[2]} ↓`;
}

function roundWeight(value: number): number {
  if (value >= 20) return Math.round(value / 2.5) * 2.5;
  return Math.round(value * 2) / 2;
}

// Enhanced sets display: handles both "sets" and "reps" progression methods
export function getWkDisplaySets(
  baseSets: string,
  week: number,
  overloadPlan: WeekPlan[],
  selectedMethods: Set<OverloadMethodId>
): string {
  if (!overloadPlan.length) return baseSets;
  const wp = overloadPlan[week - 1];
  if (!wp || wp.isDeload) return baseSets;
  if (!selectedMethods.has('sets') && !selectedMethods.has('reps')) return baseSets;

  const m = baseSets.match(/^(\d+)×(\d+)(?:-(\d+))?/);
  if (!m) return baseSets;

  let sets = parseInt(m[1]);
  const minReps = parseInt(m[2]);
  const maxReps = m[3] ? parseInt(m[3]) : minReps;

  // Sets method: add 1 set from week 3 onwards
  if (selectedMethods.has('sets') && week >= 3) {
    sets = Math.min(sets + 1, 6);
  }

  // Reps method: progress target rep count through the range (+1 per week)
  if (selectedMethods.has('reps')) {
    const target = Math.min(minReps + (week - 1), maxReps);
    return `${sets}×${target}`;
  }

  return maxReps > minReps ? `${sets}×${minReps}-${maxReps}` : `${sets}×${minReps}`;
}

// Computes the displayed weight for a given week based on selected methods
export function getWkDisplayWeight(
  baseWeight: string | undefined,
  week: number,
  overloadPlan: WeekPlan[],
  selectedMethods: Set<OverloadMethodId>
): string | undefined {
  if (!baseWeight) return baseWeight;

  const match = baseWeight.match(/^([\d.]+)(.*)/);
  if (!match) return baseWeight;
  const baseNum = parseFloat(match[1]);
  if (isNaN(baseNum) || baseNum === 0) return baseWeight;
  const suffix = match[2]; // e.g. " lbs", " kg", ""

  if (!overloadPlan.length) return baseWeight;
  const wp = overloadPlan[week - 1];
  if (!wp) return baseWeight;

  // Deload: always reduce to 60% of base weight regardless of method selection
  if (wp.isDeload) {
    const n = roundWeight(baseNum * 0.6);
    return `${n}${suffix}`;
  }

  // Load progression: 2.5% compound increase per week
  if (!selectedMethods.has('load') || week === 1) return baseWeight;
  const n = roundWeight(baseNum * Math.pow(1.025, week - 1));
  return n === baseNum ? baseWeight : `${n}${suffix}`;
}

function makeDaysFromSplit(splitKey: SplitKey): Day[] {
  return SPLITS[splitKey].days.map(label => ({ label, isRest: label === 'REST', exercises: [] }));
}

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function autoRenameActiveDays(days: Day[], split: SplitKey): Day[] {
  let activeCount = 0;
  return days.map(day => {
    if (day.isRest) return { ...day, label: 'REST' };
    let label = day.label;
    switch (split) {
      case 'upperlower': {
        const isUpper = activeCount % 2 === 0;
        const letter = LETTERS[Math.floor(activeCount / 2)] ?? '';
        label = `${isUpper ? 'UPPER' : 'LOWER'} ${letter}`;
        break;
      }
      case 'fullbody':
        label = `FULL BODY ${LETTERS[activeCount] ?? ''}`;
        break;
      case 'everyother':
        label = `WORKOUT ${LETTERS[activeCount] ?? ''}`;
        break;
      // bro split: keep whatever name the day already has
    }
    activeCount++;
    return { ...day, label };
  });
}

export function useProgramBuilder() {
  const [programName, setProgramName] = useState('My Program');
  const [currentProgramId, setCurrentProgramId] = useState<string | null>(null);
  const [split, setSplitState] = useState<SplitKey>('upperlower');
  const [goal, setGoalState] = useState<GoalKey>('hypertrophy');
  const [blockWeeks, setBlockWeeks] = useState(4);
  const [deloadOn, setDeloadOn] = useState(true);
  const [deloadPct, setDeloadPct] = useState(50);
  const [selectedMethods, setSelectedMethods] = useState<Set<OverloadMethodId>>(new Set(['load', 'reps']));
  const [overloadPlan, setOverloadPlan] = useState<WeekPlan[]>([]);
  const [overloadVisible, setOverloadVisible] = useState(false);
  const [days, setDays] = useState<Day[]>(() => makeDaysFromSplit('upperlower'));
  const [activeWeekView, setActiveWeekView] = useState(1);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  const dragDataRef = useRef<DragData | null>(null);

  const totalWeeks = blockWeeks + (deloadOn ? 1 : 0);
  const isDeloadView = deloadOn && activeWeekView === totalWeeks;

  const setSplit = useCallback((s: SplitKey) => {
    setSplitState(s);
    setDays(makeDaysFromSplit(s));
  }, []);

  const setGoal = useCallback((g: GoalKey) => {
    setGoalState(g);
  }, []);

  const toggleMethod = useCallback((id: OverloadMethodId) => {
    setSelectedMethods(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const handleBlockWeeksChange = useCallback((value: number) => {
    const newWeeks = Math.max(1, value || 4);
    setBlockWeeks(newWeeks);
    setActiveWeekView(prev => (prev > newWeeks + (deloadOn ? 1 : 0) ? 1 : prev));
    setOverloadPlan([]);
  }, [deloadOn]);

  const handleToggleDeload = useCallback(() => {
    setDeloadOn(prev => {
      const newDeload = !prev;
      const newTotal = blockWeeks + (newDeload ? 1 : 0);
      setActiveWeekView(wv => (wv > newTotal ? 1 : wv));
      setOverloadPlan([]);
      return newDeload;
    });
  }, [blockWeeks]);

  const handleDeloadPctChange = useCallback((value: number) => {
    setDeloadPct(Math.min(80, Math.max(30, value)));
  }, []);

  const generateOverload = useCallback((showToast: (msg: string) => void) => {
    if (!selectedMethods.size) { showToast('Select at least one method'); return; }
    const methods = [...selectedMethods];
    const tw = blockWeeks + (deloadOn ? 1 : 0);
    const plan: WeekPlan[] = [];
    for (let w = 1; w <= tw; w++) {
      const isDl = deloadOn && w === tw;
      plan.push(isDl
        ? { week: w, isDeload: true,  label: 'Deload',    instructions: buildDeloadInstructions(deloadPct) }
        : { week: w, isDeload: false, label: `Week ${w}`, instructions: buildWeekInstructions(w, methods) }
      );
    }
    setOverloadPlan(plan);
    setOverloadVisible(true);
    setActiveWeekView(v => Math.min(v, plan.length));
    showToast('Overload plan generated');
  }, [selectedMethods, blockWeeks, deloadOn, deloadPct]);

  const setActiveWeek = useCallback((w: number) => {
    setActiveWeekView(w);
  }, []);

  const loadTemplate = useCallback((showToast: (msg: string) => void) => {
    const sp = SPLITS[split];
    const g = GOALS[goal];
    setDays(sp.days.map((label, i) => ({
      label,
      isRest: label === 'REST',
      exercises: (sp.tmpl[i] || []).map(e => ({
        muscle: e.m,
        name: MUSCLES[e.m].exercises[e.i].n,
        adapt: MUSCLES[e.m].exercises[e.i].a,
        sets: g.defSets(),
        color: MUSCLES[e.m].color,
      })),
    })));
    showToast('Template loaded');
  }, [split, goal]);

  const clearProg = useCallback((showToast: (msg: string) => void) => {
    setDays(prev => prev.map(d => ({ ...d, exercises: [] })));
    setAnalysis(null);
    showToast('Cleared');
  }, []);

  const handleDragStart = useCallback((data: DragData) => {
    dragDataRef.current = data;
  }, []);

  const handleDrop = useCallback((tdi: number, currentGoal: GoalKey) => {
    const data = dragDataRef.current;
    if (!data) return;
    if (data.src === 'sb') {
      const md = MUSCLES[data.muscle!];
      const ex = md.exercises[data.ei!];
      const newEx: ProgramExercise = {
        muscle: data.muscle!,
        name: ex.n,
        adapt: ex.a,
        sets: GOALS[currentGoal].defSets(),
        color: data.color!,
      };
      setDays(prev => {
        const next = prev.map(d => ({ ...d, exercises: [...d.exercises] }));
        next[tdi].exercises.push(newEx);
        return next;
      });
    } else {
      const di = data.di!;
      const ei = data.ei!;
      if (di === tdi) { dragDataRef.current = null; return; }
      setDays(prev => {
        const next = prev.map(d => ({ ...d, exercises: [...d.exercises] }));
        const [moved] = next[di].exercises.splice(ei, 1);
        next[tdi].exercises.push(moved);
        return next;
      });
    }
    dragDataRef.current = null;
  }, []);

  const removeExercise = useCallback((di: number, ei: number) => {
    setDays(prev => {
      const next = prev.map(d => ({ ...d, exercises: [...d.exercises] }));
      next[di].exercises.splice(ei, 1);
      return next;
    });
  }, []);

  const toggleDay = useCallback((di: number) => {
    setDays(prev => {
      const next = prev.map(d => ({ ...d }));
      const turningOn = next[di].isRest;
      next[di] = { ...next[di], isRest: !next[di].isRest };

      if (split === 'bro') {
        // Bro split: newly-on day gets a blank editable label; turning off → REST
        next[di].label = turningOn ? '' : 'REST';
        return next;
      }

      // Upper/Lower, Full Body, Every Other: re-sequence all active day names
      return autoRenameActiveDays(next, split);
    });
  }, [split]);

  const updateDayLabel = useCallback((di: number, label: string) => {
    setDays(prev => {
      const next = [...prev];
      next[di] = { ...next[di], label };
      return next;
    });
  }, []);

  const updateExerciseSets = useCallback((di: number, ei: number, sets: string) => {
    setDays(prev => {
      const next = prev.map(d => ({ ...d, exercises: [...d.exercises] }));
      next[di].exercises[ei] = { ...next[di].exercises[ei], sets };
      return next;
    });
  }, []);

  const analyzeProg = useCallback((showToast: (msg: string) => void) => {
    const g = GOALS[goal];
    const active = days.filter(d => !d.isRest);
    const totalEx = active.reduce((a, d) => a + d.exercises.length, 0);
    const counts: Record<string, number> = {};
    days.forEach(d => {
      if (!d.isRest) d.exercises.forEach(e => {
        const m = e.sets.match(/^(\d+)/);
        counts[e.muscle] = (counts[e.muscle] || 0) + (m ? parseInt(m[1]) : 3);
      });
    });
    const under = Object.entries(counts).filter(([, v]) => v < g.wkMin).map(([k]) => k);
    const notTrained = Object.keys(MUSCLES).filter(m => !counts[m]);

    let html = '';
    if (!totalEx) {
      html = '<strong>No exercises added yet.</strong> Drag exercises from the sidebar or hit Load Template to get started.';
      setAnalysis({ html, tips: [] });
      return;
    }

    html += `You're running a <strong>${SPLITS[split].label}</strong> with <strong>${active.length} active days</strong> targeting <strong>${g.label}</strong> over a <strong>${blockWeeks}-week block</strong>${deloadOn ? ' with a deload week' : ''}.`;
    if (!overloadPlan.length)
      html += ' <strong>Tip:</strong> Select your overload methods in the sidebar and hit Generate Plan to build your week-by-week progression.';
    else
      html += ` Your progressive overload plan uses: <strong>${[...selectedMethods].map(m => OVERLOAD_METHODS.find(o => o.id === m)!.name).join(', ')}</strong>.`;
    if (under.length)
      html += ` The following muscles are below the ${g.wkMin} sets/week minimum for ${goal}: <strong>${under.join(', ')}</strong>. Consider adding a set or two across your training days.`;
    if (notTrained.length)
      html += ` Not currently in your program: <strong>${notTrained.join(', ')}</strong>.`;

    const tips: string[] = [];
    if (goal === 'hypertrophy') tips.push('Track load week-to-week for each exercise');
    if (goal === 'strength')    tips.push('Log RPE — aim for 8–9 on working sets');
    if (goal === 'power')       tips.push('Prioritize speed on every concentric rep');
    if (goal === 'endurance')   tips.push('Use a timer — minimize rest between sets');
    if (deloadOn)               tips.push(`Deload at ${deloadPct}% volume — recovery is part of the program`);
    if (overloadPlan.length)    tips.push('Re-evaluate working weights after each full block');
    tips.push('Hover any exercise to see equipment alternatives');

    setAnalysis({ html, tips });
    showToast('Analysis complete');
  }, [goal, split, blockWeeks, deloadOn, deloadPct, overloadPlan, selectedMethods, days]);

  const dismissAnalysis = useCallback(() => setAnalysis(null), []);

  const dismissOverloadPlan = useCallback(() => setOverloadVisible(false), []);

  const updateExerciseWeight = useCallback((di: number, ei: number, weight: string) => {
    setDays(prev => {
      const next = prev.map(d => ({ ...d, exercises: [...d.exercises] }));
      next[di].exercises[ei] = { ...next[di].exercises[ei], weight };
      return next;
    });
  }, []);

  const updateProgramName = useCallback((name: string) => setProgramName(name), []);

  const getProgramSnapshot = useCallback(() => ({
    name: programName,
    split,
    goal,
    block_weeks: blockWeeks,
    deload_on: deloadOn,
    deload_pct: deloadPct,
    selected_methods: [...selectedMethods],
    overload_plan: overloadPlan,
    days,
  }), [programName, split, goal, blockWeeks, deloadOn, deloadPct, selectedMethods, overloadPlan, days]);

  const loadProgram = useCallback((saved: SavedProgram) => {
    setCurrentProgramId(saved.id);
    setProgramName(saved.name);
    setSplitState(saved.split as SplitKey);
    setGoalState(saved.goal as GoalKey);
    setBlockWeeks(saved.block_weeks);
    setDeloadOn(saved.deload_on);
    setDeloadPct(saved.deload_pct);
    setSelectedMethods(new Set(saved.selected_methods as OverloadMethodId[]));
    setOverloadPlan(saved.overload_plan ?? []);
    setDays(saved.days);
    setActiveWeekView(1);
    setAnalysis(null);
  }, []);

  const resetForNew = useCallback(() => {
    setCurrentProgramId(null);
    setProgramName('My Program');
    setSplitState('upperlower');
    setGoalState('hypertrophy');
    setBlockWeeks(4);
    setDeloadOn(true);
    setDeloadPct(50);
    setSelectedMethods(new Set<OverloadMethodId>(['load', 'reps']));
    setOverloadPlan([]);
    setDays(makeDaysFromSplit('upperlower'));
    setActiveWeekView(1);
    setAnalysis(null);
  }, []);

  const setProgramId = useCallback((id: string) => setCurrentProgramId(id), []);

  return {
    programName, currentProgramId,
    split, goal, blockWeeks, deloadOn, deloadPct,
    selectedMethods, overloadPlan, days, activeWeekView,
    totalWeeks, isDeloadView, analysis,
    setSplit, setGoal, toggleMethod,
    handleBlockWeeksChange, handleToggleDeload, handleDeloadPctChange,
    generateOverload, setActiveWeek,
    loadTemplate, clearProg,
    handleDragStart, handleDrop,
    removeExercise, toggleDay, updateDayLabel, updateExerciseSets,
    analyzeProg, dismissAnalysis,
    updateProgramName, getProgramSnapshot, loadProgram, resetForNew, setProgramId,
    overloadVisible, dismissOverloadPlan, updateExerciseWeight,
  };
}
