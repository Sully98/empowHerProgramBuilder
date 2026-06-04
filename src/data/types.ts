export type SplitKey = 'upperlower' | 'fullbody' | 'bro' | 'everyother';
export type GoalKey = 'hypertrophy' | 'strength' | 'power' | 'endurance';
export type OverloadMethodId = 'load' | 'reps' | 'sets' | 'tempo' | 'quality' | 'rest' | 'freq';

export interface OverloadMethod {
  id: OverloadMethodId;
  name: string;
  desc: string;
  icon: string;
}

export interface GoalResearch {
  h: string;
  cite: string;
  t: string;
}

export interface Goal {
  label: string;
  color: string;
  sets: string;
  reps: string;
  load: string;
  rest: string;
  wkMin: number;
  wkTarget: string;
  defSets: () => string;
  research: GoalResearch[];
}

export interface Exercise {
  n: string;
  a: string;
}

export interface Muscle {
  color: string;
  exercises: Exercise[];
}

export interface SplitTemplateEntry {
  m: string;
  i: number;
}

export interface Split {
  label: string;
  days: string[];
  tmpl: Record<number, SplitTemplateEntry[]>;
}

export interface WeekInstruction {
  method: string;
  detail: string;
}

export interface WeekPlan {
  week: number;
  isDeload: boolean;
  label: string;
  instructions: WeekInstruction[];
}

export interface ProgramExercise {
  muscle: string;
  name: string;
  adapt: string;
  sets: string;
  weight?: string;
  color: string;
}

export interface Day {
  label: string;
  isRest: boolean;
  exercises: ProgramExercise[];
}

export interface DragData {
  src: 'sb' | 'block';
  muscle?: string;
  ei?: number;
  color?: string;
  di?: number;
}

export interface AnalysisResult {
  html: string;
  tips: string[];
}

export interface SavedProgram {
  id: string;
  user_id: string;
  name: string;
  split: string;
  goal: string;
  block_weeks: number;
  deload_on: boolean;
  deload_pct: number;
  selected_methods: string[];
  overload_plan: WeekPlan[];
  days: Day[];
  created_at: string;
  updated_at: string;
}

export type SavedProgramInsert = Omit<SavedProgram, 'id' | 'created_at' | 'updated_at'>;
