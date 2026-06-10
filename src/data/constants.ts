import type { Goal, GoalKey, Muscle, OverloadMethod, Split, SplitKey } from './types';

export const OVERLOAD_METHODS: OverloadMethod[] = [
  { id: 'load',    name: 'Load',           desc: 'Increase weight each week or cycle',                     icon: '↑' },
  { id: 'reps',    name: 'Reps',           desc: 'Add 1–2 reps within your target range',                  icon: '#' },
  { id: 'sets',    name: 'Sets',           desc: 'Add one working set per exercise or day',                icon: '+' },
  { id: 'tempo',   name: 'Tempo / TUT',    desc: 'Slow the eccentric to increase time under tension',      icon: '⏱' },
  { id: 'quality', name: 'Rep Quality',    desc: 'Improve ROM, control, and reduce momentum',              icon: '✦' },
  { id: 'rest',    name: 'Rest Reduction', desc: 'Same work in less time — increase training density',     icon: '↓' },
  { id: 'freq',    name: 'Frequency',      desc: 'Add a training day or session for a muscle group',       icon: '📅' },
];

export const GOALS: Record<GoalKey, Goal> = {
  hypertrophy: {
    label: 'Hypertrophy', plain: 'Build Muscle', color: 'var(--accent)', sets: '3–4', reps: '6–12', load: '67–85% 1RM',
    rest: '60–90 sec', wkMin: 10, wkTarget: '10–20 sets/muscle',
    defSets: () => '3×8–12',
    research: [
      { h: 'Volume Threshold', cite: 'Schoenfeld BJ et al. (2017). Dose-response relationship between weekly resistance training volume and increases in muscle mass. J Strength Cond Res. 31(12):3508–3523.', t: 'Research demonstrates a clear dose-response relationship between weekly training volume and muscle hypertrophy, with <strong>10+ sets per muscle group per week</strong> producing significantly greater gains than lower volumes. Optimal range is 10–20 sets per muscle per week.' },
      { h: 'Repetition Range', cite: 'Ratamess NA et al. (2009). ACSM Position Stand: Progression Models in Resistance Training for Healthy Adults. Med Sci Sports Exerc. 41(3):687–708.', t: 'The ACSM recommends <strong>6–12 repetitions at 67–85% of 1RM</strong> as the primary zone for hypertrophy, balancing mechanical tension and metabolic stress — the two primary drivers of muscle growth.' },
    ],
  },
  strength: {
    label: 'Strength', plain: 'Get Stronger', color: 'var(--gold)', sets: '3–5', reps: '1–6', load: '≥85% 1RM',
    rest: '3–5 min', wkMin: 6, wkTarget: '6–10 sets/muscle',
    defSets: () => '4×4–6',
    research: [
      { h: 'Loading & Intensity', cite: 'Ratamess NA et al. (2009). ACSM Position Stand: Progression Models in Resistance Training for Healthy Adults. Med Sci Sports Exerc. 41(3):687–708.', t: 'For maximal strength, ACSM recommends <strong>≥85% of 1RM for 1–6 repetitions</strong>. The primary adaptation is neural — improved motor unit recruitment, synchronization, and rate coding — rather than muscle hypertrophy.' },
      { h: 'Rest Intervals', cite: 'de Salles BF et al. (2009). Rest interval between sets in strength training. Sports Med. 39(9):765–777.', t: 'Strength training requires <strong>3–5 minutes of rest between sets</strong> to allow near-complete phosphocreatine resynthesis. Shorter rest compromises performance and neural adaptations.' },
    ],
  },
  power: {
    label: 'Power', plain: 'Be More Athletic', color: '#c17d5a', sets: '3–5', reps: '1–5', load: '75–90% 1RM',
    rest: '3–5 min', wkMin: 4, wkTarget: '4–8 sets/muscle',
    defSets: () => '4×3–5',
    research: [
      { h: 'Force-Velocity', cite: 'Ratamess NA et al. (2009). ACSM Position Stand: Progression Models in Resistance Training for Healthy Adults. Med Sci Sports Exerc. 41(3):687–708.', t: 'Power development requires training the force-velocity curve — <strong>high loads (75–90% 1RM) performed with maximal intent speed</strong>. ACSM recommends 3–5 sets of 1–5 reps with full recovery to preserve movement velocity.' },
      { h: 'CNS Demand', cite: 'Haff GG & Triplett NT (Eds). (2015). Essentials of Strength Training and Conditioning, 4th ed. NSCA.', t: 'Power training places extreme demand on the CNS. <strong>Weekly volume should remain conservative (4–8 sets/muscle)</strong> with long rest intervals. Quality of each rep is paramount.' },
    ],
  },
  endurance: {
    label: 'Endurance', plain: 'Build Stamina', color: '#7aab80', sets: '2–3', reps: '15–25', load: '30–60% 1RM',
    rest: '≤30 sec', wkMin: 4, wkTarget: '4–8 sets/muscle',
    defSets: () => '3×15–20',
    research: [
      { h: 'High-Rep Protocol', cite: 'Ratamess NA et al. (2009). ACSM Position Stand: Progression Models in Resistance Training for Healthy Adults. Med Sci Sports Exerc. 41(3):687–708.', t: 'Muscular endurance is best developed with <strong>light loads (30–60% 1RM) for 15–25+ repetitions</strong> with rest intervals ≤30 seconds, maximizing oxidative enzyme activity and slow-twitch fatigue resistance.' },
      { h: 'Frequency', cite: "American College of Sports Medicine. (2013). ACSM's Guidelines for Exercise Testing and Prescription, 9th ed. Lippincott Williams & Wilkins.", t: 'ACSM recommends a minimum of <strong>2 days per week</strong> for maintenance, 3 days for continued development. Total weekly set volume can be lower because high rep counts create significant metabolic stimulus per session.' },
    ],
  },
};

export const MUSCLES: Record<string, Muscle> = {
  chest:      { color: '#c47a7a', exercises: [
    { n: 'Barbell Bench Press',   eq: ['Barbell', 'Dumbbell', 'Smith Machine'] },
    { n: 'Incline DB Press',      eq: ['Dumbbell', 'Barbell', 'Cable'] },
    { n: 'Cable Fly / Pec Deck',  eq: ['Cable', 'Machine', 'Band'] },
    { n: 'Dips (Chest Lean)',     eq: ['Bodyweight', 'Machine'] },
    { n: 'Push-Up Variations',    eq: ['Bodyweight', 'Band'] },
  ] },
  back:       { color: '#7bb5b2', exercises: [
    { n: 'Barbell Row',           eq: ['Barbell', 'Dumbbell'] },
    { n: 'Pull-Up / Weighted',    eq: ['Bodyweight', 'Machine'] },
    { n: 'Lat Pulldown',          eq: ['Cable', 'Machine'] },
    { n: 'Seated Cable Row',      eq: ['Cable', 'Machine', 'Dumbbell'] },
    { n: 'Chest-Supported Row',   eq: ['Dumbbell', 'Machine', 'Cable'] },
  ] },
  shoulders:  { color: '#8fafd4', exercises: [
    { n: 'Overhead Press (BB/DB)', eq: ['Barbell', 'Dumbbell', 'Cable', 'Smith Machine'] },
    { n: 'Lateral Raise',          eq: ['Dumbbell', 'Cable', 'Band', 'Machine'] },
    { n: 'Face Pull / Rear Delt Fly', eq: ['Cable', 'Band', 'Dumbbell'] },
    { n: 'Cable Lateral Raise',    eq: ['Cable', 'Band', 'Dumbbell'] },
    { n: 'Arnold Press',           eq: ['Dumbbell', 'Machine'] },
  ] },
  biceps:     { color: '#edd286', exercises: [
    { n: 'Barbell Curl',          eq: ['Barbell', 'Dumbbell'] },
    { n: 'Incline DB Curl',       eq: ['Dumbbell', 'Cable'] },
    { n: 'Cable Curl',            eq: ['Cable', 'Band', 'Dumbbell'] },
    { n: 'Hammer Curl',           eq: ['Dumbbell', 'Cable'] },
    { n: 'Preacher Curl',         eq: ['Barbell', 'Dumbbell', 'Machine'] },
  ] },
  triceps:    { color: '#b09ac4', exercises: [
    { n: 'Close-Grip Bench Press', eq: ['Barbell', 'Dumbbell', 'Smith Machine'] },
    { n: 'Overhead Tricep Ext.',   eq: ['Dumbbell', 'Barbell', 'Cable', 'Band'] },
    { n: 'Cable Pushdown',         eq: ['Cable', 'Band'] },
    { n: 'Skull Crusher',          eq: ['Barbell', 'Dumbbell', 'Cable'] },
    { n: 'Dip Machine / Bench Dip', eq: ['Machine', 'Bodyweight'] },
  ] },
  quads:      { color: '#c4b87a', exercises: [
    { n: 'Back Squat',            eq: ['Barbell', 'Smith Machine'] },
    { n: 'Leg Press',             eq: ['Machine'] },
    { n: 'Hack Squat',            eq: ['Machine', 'Barbell'] },
    { n: 'Bulgarian Split Squat', eq: ['Dumbbell', 'Barbell', 'Bodyweight'] },
    { n: 'Leg Extension',         eq: ['Machine', 'Band'] },
  ] },
  hamstrings: { color: '#c4956a', exercises: [
    { n: 'Romanian Deadlift (RDL)', eq: ['Barbell', 'Dumbbell'] },
    { n: 'Leg Curl (Seated/Lying)', eq: ['Machine', 'Band', 'Cable'] },
    { n: 'Nordic Hamstring Curl',   eq: ['Bodyweight', 'Machine'] },
    { n: 'Stiff-Leg Deadlift',      eq: ['Barbell', 'Dumbbell'] },
    { n: 'Good Morning',            eq: ['Barbell', 'Band', 'Cable'] },
  ] },
  glutes:     { color: '#c47a9a', exercises: [
    { n: 'Hip Thrust (Barbell)',   eq: ['Barbell', 'Dumbbell', 'Machine'] },
    { n: 'Cable Pull-Through',    eq: ['Cable', 'Band', 'Kettlebell'] },
    { n: 'Glute Kickback (Cable)', eq: ['Cable', 'Band', 'Machine'] },
    { n: 'Sumo Squat / Wide Stance', eq: ['Barbell', 'Dumbbell', 'Kettlebell', 'Smith Machine'] },
    { n: 'Step-Up (Weighted)',    eq: ['Dumbbell', 'Barbell', 'Bodyweight'] },
  ] },
  core:       { color: '#7aab80', exercises: [
    { n: 'Ab Wheel Rollout',      eq: ['Bodyweight'] },
    { n: 'Cable Crunch',          eq: ['Cable', 'Band'] },
    { n: 'Hanging Leg Raise',     eq: ['Bodyweight', 'Machine'] },
    { n: 'Pallof Press',          eq: ['Cable', 'Band'] },
    { n: 'Plank Variations',      eq: ['Bodyweight'] },
  ] },
};

export const SPLITS: Record<SplitKey, Split> = {
  upperlower: {
    label: 'Upper / Lower',
    days: ['UPPER A', 'LOWER A', 'REST', 'UPPER B', 'LOWER B', 'REST', 'REST'],
    tmpl: {
      0: [{ m: 'chest', i: 0 }, { m: 'back', i: 0 }, { m: 'shoulders', i: 0 }, { m: 'biceps', i: 0 }, { m: 'triceps', i: 0 }],
      1: [{ m: 'quads', i: 0 }, { m: 'hamstrings', i: 0 }, { m: 'glutes', i: 0 }, { m: 'core', i: 0 }],
      3: [{ m: 'chest', i: 1 }, { m: 'back', i: 2 }, { m: 'shoulders', i: 1 }, { m: 'biceps', i: 1 }, { m: 'triceps', i: 1 }],
      4: [{ m: 'quads', i: 1 }, { m: 'hamstrings', i: 1 }, { m: 'glutes', i: 0 }, { m: 'quads', i: 4 }, { m: 'core', i: 3 }],
    },
  },
  fullbody: {
    label: 'Full Body',
    days: ['FULL BODY A', 'REST', 'FULL BODY B', 'REST', 'FULL BODY C', 'REST', 'REST'],
    tmpl: {
      0: [{ m: 'chest', i: 0 }, { m: 'back', i: 1 }, { m: 'quads', i: 0 }, { m: 'shoulders', i: 0 }, { m: 'core', i: 0 }],
      2: [{ m: 'back', i: 0 }, { m: 'hamstrings', i: 0 }, { m: 'chest', i: 1 }, { m: 'biceps', i: 0 }, { m: 'triceps', i: 0 }],
      4: [{ m: 'quads', i: 1 }, { m: 'glutes', i: 0 }, { m: 'shoulders', i: 1 }, { m: 'biceps', i: 2 }, { m: 'core', i: 3 }],
    },
  },
  bro: {
    label: 'Bro Split',
    days: ['CHEST', 'BACK', 'SHOULDERS', 'LEGS', 'ARMS', 'REST', 'REST'],
    tmpl: {
      0: [{ m: 'chest', i: 0 }, { m: 'chest', i: 1 }, { m: 'chest', i: 2 }, { m: 'chest', i: 3 }],
      1: [{ m: 'back', i: 0 }, { m: 'back', i: 1 }, { m: 'back', i: 2 }, { m: 'back', i: 3 }],
      2: [{ m: 'shoulders', i: 0 }, { m: 'shoulders', i: 1 }, { m: 'shoulders', i: 2 }, { m: 'shoulders', i: 4 }],
      3: [{ m: 'quads', i: 0 }, { m: 'quads', i: 1 }, { m: 'hamstrings', i: 0 }, { m: 'glutes', i: 0 }, { m: 'core', i: 2 }],
      4: [{ m: 'biceps', i: 0 }, { m: 'biceps', i: 1 }, { m: 'triceps', i: 0 }, { m: 'triceps', i: 1 }, { m: 'triceps', i: 2 }],
    },
  },
  everyother: {
    label: 'Every Other Day',
    days: ['WORKOUT A', 'REST', 'WORKOUT B', 'REST', 'WORKOUT C', 'REST', 'WORKOUT D'],
    tmpl: {
      0: [{ m: 'chest', i: 0 }, { m: 'back', i: 1 }, { m: 'shoulders', i: 0 }, { m: 'triceps', i: 0 }],
      2: [{ m: 'quads', i: 0 }, { m: 'hamstrings', i: 0 }, { m: 'glutes', i: 0 }, { m: 'core', i: 0 }],
      4: [{ m: 'back', i: 0 }, { m: 'chest', i: 1 }, { m: 'shoulders', i: 1 }, { m: 'biceps', i: 0 }],
      6: [{ m: 'quads', i: 3 }, { m: 'hamstrings', i: 1 }, { m: 'glutes', i: 0 }, { m: 'core', i: 3 }],
    },
  },
};

export const DOW = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

// Tell Vite this module can be hot-updated in place.
// Without this, any save to this file (e.g. VS Code auto-save on tab switch)
// causes a full page reload because Vite can't propagate HMR through named
// non-component exports.
if (import.meta.hot) {
  import.meta.hot.accept();
}
