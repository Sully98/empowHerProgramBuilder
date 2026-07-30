import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { GOALS, MUSCLES, OVERLOAD_METHODS, SPLITS } from '../data/constants';
import type {
  AnalysisResult,
  Day,
  DragData,
  GoalKey,
  OverloadMethodId,
  ProgramExercise,
  SavedProgram,
  SetRow,
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

function roundWeight(value: number): number {
  if (value >= 20) return Math.round(value / 2.5) * 2.5;
  return Math.round(value * 2) / 2;
}

// Applies week progression to a single set's weight (e.g. "95 lbs")
function progressWeight(weight: string, week: number): string {
  if (!weight) return weight;
  const match = weight.match(/^([\d.]+)(.*)/);
  if (!match) return weight;
  const baseNum = parseFloat(match[1]);
  if (isNaN(baseNum) || baseNum === 0) return weight;
  const suffix = match[2]; // e.g. " lbs", " kg", ""
  const n = roundWeight(baseNum * Math.pow(1.025, week - 1));
  return n === baseNum ? weight : `${n}${suffix}`;
}

// Reduces a single set's weight to ~60% for a deload week
function deloadWeight(weight: string): string {
  if (!weight) return weight;
  const match = weight.match(/^([\d.]+)(.*)/);
  if (!match) return weight;
  const baseNum = parseFloat(match[1]);
  if (isNaN(baseNum) || baseNum === 0) return weight;
  const suffix = match[2];
  return `${roundWeight(baseNum * 0.6)}${suffix}`;
}

// Computes the displayed set rows for a given (non-deload) week based on selected methods.
// Each set can carry its own reps and weight, and each progresses independently.
export function getWkDisplayRows(
  baseRows: SetRow[],
  week: number,
  overloadPlan: WeekPlan[],
  selectedMethods: Set<OverloadMethodId>
): SetRow[] {
  if (!overloadPlan.length) return baseRows;
  const wp = overloadPlan[week - 1];
  if (!wp || wp.isDeload) return baseRows;

  let rows = baseRows;

  // Sets method: add a working set from week 3 onward (clone the last row)
  if (selectedMethods.has('sets') && week >= 3 && rows.length < 6) {
    rows = [...rows, { ...rows[rows.length - 1] }];
  }

  // Reps method: progress each row's target reps through its range (+1/wk)
  if (selectedMethods.has('reps')) {
    rows = rows.map(r => {
      const m = r.reps.match(/^(\d+)(?:-(\d+))?/);
      if (!m) return r;
      const minReps = parseInt(m[1]);
      const maxReps = m[2] ? parseInt(m[2]) : minReps;
      const target = Math.min(minReps + (week - 1), maxReps);
      return { ...r, reps: `${target}` };
    });
  }

  // Load method: 2.5% compound weight increase per week, per set
  if (selectedMethods.has('load') && week > 1) {
    rows = rows.map(r => ({ ...r, weight: progressWeight(r.weight, week) }));
  }

  return rows;
}

// Deload display: fewer working sets (reduced by deloadPct) at ~60% of working weight
export function applyDeloadRows(baseRows: SetRow[], deloadPct: number): SetRow[] {
  const keep = Math.max(1, Math.round(baseRows.length * (deloadPct / 100)));
  return baseRows.slice(0, keep).map(r => ({ ...r, weight: deloadWeight(r.weight) }));
}

function makeDaysFromSplit(splitKey: SplitKey): Day[] {
  return SPLITS[splitKey].days.map(label => ({ label, isRest: label === 'REST', exercises: [] }));
}

const STORAGE_KEY = 'empowher_program_builder_draft';

function loadDraft() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveDraft(data: object) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // quota exceeded or private browsing — silently ignore
  }
}

// Migrates exercises saved before per-set rows existed: { sets: "3×8-12", weight?: "95" or "95/95/105" }
function normalizeExercise(ex: ProgramExercise & { sets?: string; weight?: string }): ProgramExercise {
  if (Array.isArray(ex.setRows)) return ex;

  const m = (ex.sets ?? '3×8-12').match(/^(\d+)×(.+)/);
  const count = m ? Math.max(1, parseInt(m[1])) : 3;
  const reps = m ? m[2] : (ex.sets ?? '8-12');
  const weights = ex.weight ? ex.weight.split('/').map(w => w.trim()) : [];

  const setRows: SetRow[] = Array.from({ length: count }, (_, i) => ({
    reps,
    weight: weights.length ? (weights[i] ?? weights[weights.length - 1]) : '',
  }));
  return { muscle: ex.muscle, name: ex.name, adapt: ex.adapt, color: ex.color, setRows };
}

function normalizeDays(days: Day[]): Day[] {
  return days.map(d => ({ ...d, exercises: d.exercises.map(normalizeExercise) }));
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
  const draft = useRef(loadDraft());
  const d = draft.current;

  const [programName, setProgramName] = useState<string>(d?.programName ?? 'My Program');
  const [currentProgramId, setCurrentProgramId] = useState<string | null>(d?.currentProgramId ?? null);
  const [split, setSplitState] = useState<SplitKey>(d?.split ?? 'upperlower');
  const [goal, setGoalState] = useState<GoalKey>(d?.goal ?? 'hypertrophy');
  const [blockWeeks, setBlockWeeks] = useState<number>(d?.blockWeeks ?? 4);
  const [deloadOn, setDeloadOn] = useState<boolean>(d?.deloadOn ?? true);
  const [deloadPct, setDeloadPct] = useState<number>(d?.deloadPct ?? 50);
  const [selectedMethods, setSelectedMethods] = useState<Set<OverloadMethodId>>(
    new Set<OverloadMethodId>(d?.selectedMethods ?? ['load', 'reps'])
  );
  const [overloadPlan, setOverloadPlan] = useState<WeekPlan[]>(d?.overloadPlan ?? []);
  const [overloadVisible, setOverloadVisible] = useState<boolean>(d?.overloadVisible ?? false);
  const [days, setDays] = useState<Day[]>(() => d?.days ? normalizeDays(d.days) : makeDaysFromSplit('upperlower'));
  const [activeWeekView, setActiveWeekView] = useState<number>(d?.activeWeekView ?? 1);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  const dragDataRef = useRef<DragData | null>(null);

  // useLayoutEffect runs synchronously after every render, before the browser paints.
  // This guarantees localStorage is always current before any tab-switch or page unload
  // can occur, eliminating the race where visibilitychange fired with stale ref state.
  useLayoutEffect(() => {
    saveDraft({
      programName, currentProgramId, split, goal, blockWeeks, deloadOn, deloadPct,
      selectedMethods: [...selectedMethods], overloadPlan, overloadVisible, days, activeWeekView,
    });
  }, [programName, currentProgramId, split, goal, blockWeeks, deloadOn, deloadPct,
      selectedMethods, overloadPlan, overloadVisible, days, activeWeekView]);

  // Belt-and-suspenders: also flush on beforeunload in case the very first render
  // hasn't saved yet or the browser bypasses normal lifecycle on hard close.
  useEffect(() => {
    const flush = () => saveDraft({
      programName, currentProgramId, split, goal, blockWeeks, deloadOn, deloadPct,
      selectedMethods: [...selectedMethods], overloadPlan, overloadVisible, days, activeWeekView,
    });
    window.addEventListener('beforeunload', flush);
    return () => window.removeEventListener('beforeunload', flush);
  }, [programName, currentProgramId, split, goal, blockWeeks, deloadOn, deloadPct,
      selectedMethods, overloadPlan, overloadVisible, days, activeWeekView]);

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
        adapt: MUSCLES[e.m].exercises[e.i].eq.join(', '),
        setRows: g.defSets(),
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

  const handleDrop = useCallback((tdi: number, currentGoal: GoalKey, tei?: number) => {
    const data = dragDataRef.current;
    if (!data) return;

    const insertAt = (arr: ProgramExercise[], item: ProgramExercise, idx?: number) => {
      if (idx !== undefined) arr.splice(idx, 0, item);
      else arr.push(item);
    };

    if (data.src === 'sb') {
      let newEx: ProgramExercise;
      if (data.customName) {
        newEx = {
          muscle: data.muscle ?? 'custom',
          name: data.customName,
          adapt: (data.customEquipment ?? []).join(', '),
          setRows: GOALS[currentGoal].defSets(),
          color: data.color ?? '#888888',
        };
      } else {
        const md = MUSCLES[data.muscle!];
        const ex = md.exercises[data.ei!];
        newEx = {
          muscle: data.muscle!,
          name: ex.n,
          adapt: ex.eq.join(', '),
          setRows: GOALS[currentGoal].defSets(),
          color: data.color!,
        };
      }
      setDays(prev => {
        const next = prev.map(d => ({ ...d, exercises: [...d.exercises] }));
        insertAt(next[tdi].exercises, newEx, tei);
        return next;
      });
    } else {
      const di = data.di!;
      const ei = data.ei!;
      setDays(prev => {
        const next = prev.map(d => ({ ...d, exercises: [...d.exercises] }));
        const [moved] = next[di].exercises.splice(ei, 1);
        if (di === tdi) {
          // same-day reorder: after splice the indices shift
          const adjusted = tei !== undefined ? (tei > ei ? tei - 1 : tei) : next[tdi].exercises.length;
          next[tdi].exercises.splice(adjusted, 0, moved);
        } else {
          insertAt(next[tdi].exercises, moved, tei);
        }
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

  const updateSetRow = useCallback((di: number, ei: number, si: number, field: 'reps' | 'weight', value: string) => {
    setDays(prev => {
      const next = prev.map(d => ({ ...d, exercises: [...d.exercises] }));
      const ex = next[di].exercises[ei];
      const setRows = ex.setRows.map((r, i) => i === si ? { ...r, [field]: value } : r);
      next[di].exercises[ei] = { ...ex, setRows };
      return next;
    });
  }, []);

  const addSetRow = useCallback((di: number, ei: number) => {
    setDays(prev => {
      const next = prev.map(d => ({ ...d, exercises: [...d.exercises] }));
      const ex = next[di].exercises[ei];
      const last = ex.setRows[ex.setRows.length - 1] ?? { reps: '', weight: '' };
      next[di].exercises[ei] = { ...ex, setRows: [...ex.setRows, { ...last }] };
      return next;
    });
  }, []);

  const removeSetRow = useCallback((di: number, ei: number, si: number) => {
    setDays(prev => {
      const next = prev.map(d => ({ ...d, exercises: [...d.exercises] }));
      const ex = next[di].exercises[ei];
      if (ex.setRows.length <= 1) return next;
      next[di].exercises[ei] = { ...ex, setRows: ex.setRows.filter((_, i) => i !== si) };
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
        counts[e.muscle] = (counts[e.muscle] || 0) + e.setRows.length;
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
    setDays(normalizeDays(saved.days));
    setActiveWeekView(1);
    setAnalysis(null);
  }, []);

  const resetForNew = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
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
    removeExercise, toggleDay, updateDayLabel,
    updateSetRow, addSetRow, removeSetRow,
    analyzeProg, dismissAnalysis,
    updateProgramName, getProgramSnapshot, loadProgram, resetForNew, setProgramId,
    overloadVisible, dismissOverloadPlan,
  };
}
