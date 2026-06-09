import { useState } from 'react';
import { GOALS } from '../../data/constants';
import type { GoalKey, SplitKey } from '../../data/types';

interface GoalQuizProps {
  onResult: (goal: GoalKey, split: SplitKey) => void;
  ctaLabel: string;
}

interface Answers {
  a1?: string;
  a2?: string;
  a3?: string;
}

function computeGoal(a1: string, a3: string): GoalKey {
  let g: GoalKey;
  if (a1 === 'muscle') g = 'hypertrophy';
  else if (a1 === 'strong') g = 'strength';
  else if (a1 === 'energy') g = 'endurance';
  else g = 'power';
  if (a3 === 'new' && g === 'power') g = 'strength';
  if (a3 === 'new' && g !== 'endurance') g = 'hypertrophy';
  return g;
}

function computeSplit(a2: string): SplitKey {
  if (a2 === '2-3') return 'fullbody';
  if (a2 === '6+') return 'bro';
  return 'upperlower';
}

const descs: Record<GoalKey, string> = {
  hypertrophy: 'Your goal is <strong>building muscle</strong> — that\'s hypertrophy. You\'ll train with moderate weight for 6–12 reps per set, and you need at least 10 sets per muscle group per week. The builder sets this all up automatically.',
  strength: 'Your goal is <strong>getting stronger</strong>. You\'ll use heavier weights for fewer reps (4–6 per set) with longer rest between sets. Progress is measured in how much you lift, not how you look.',
  endurance: 'Your goal is <strong>building stamina and energy</strong>. You\'ll use lighter weight for higher reps (15–25), shorter rest, and the focus is on how long you can keep going — not how heavy you go.',
  power: 'Your goal is <strong>athletic power and explosiveness</strong>. Lower reps, high intensity, full recovery between sets. Every rep should be done with maximum speed and intent.',
};

const splitLabels: Record<string, string> = {
  '2-3': 'Full Body (3 days/week)',
  '4-5': 'Upper / Lower (4 days)',
  '6+': 'Bro Split (5–6 days)',
};

export function GoalQuiz({ onResult, ctaLabel }: GoalQuizProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 'result'>(1);
  const [answers, setAnswers] = useState<Answers>({});

  const answer = (key: keyof Answers, val: string) => {
    const next = { ...answers, [key]: val };
    setAnswers(next);
    if (key === 'a1') setStep(2);
    else if (key === 'a2') setStep(3);
    else if (key === 'a3') setStep('result');
  };

  const reset = () => { setStep(1); setAnswers({}); };

  const goal = step === 'result' ? computeGoal(answers.a1!, answers.a3!) : null;
  const split = step === 'result' ? computeSplit(answers.a2!) : null;

  const dots = [1, 2, 3].map(n => (
    <div
      key={n}
      className={`quiz-prog-dot${(step === 'result' || (typeof step === 'number' && step > n)) ? ' done' : ''}`}
    />
  ));

  return (
    <div className="quiz-wrap">
      <div className="quiz-progress">{dots}</div>

      {step === 1 && (
        <>
          <div className="quiz-q">What's your main reason for wanting to train?</div>
          <div className="quiz-options">
            <button className="quiz-opt" onClick={() => answer('a1', 'muscle')}>
              <span className="quiz-opt-icon">💪</span>
              <span className="quiz-opt-text">
                <strong>I want to build muscle and look stronger</strong>
                <span>I want my clothes to fit differently and feel more confident</span>
              </span>
            </button>
            <button className="quiz-opt" onClick={() => answer('a1', 'strong')}>
              <span className="quiz-opt-icon">🏋️</span>
              <span className="quiz-opt-text">
                <strong>I want to actually get stronger</strong>
                <span>I want to lift more, feel capable, and not struggle with heavy things</span>
              </span>
            </button>
            <button className="quiz-opt" onClick={() => answer('a1', 'energy')}>
              <span className="quiz-opt-icon">⚡</span>
              <span className="quiz-opt-text">
                <strong>I want more energy and endurance</strong>
                <span>I want to feel less winded, move better, and have stamina throughout my day</span>
              </span>
            </button>
            <button className="quiz-opt" onClick={() => answer('a1', 'athlete')}>
              <span className="quiz-opt-icon">🏃</span>
              <span className="quiz-opt-text">
                <strong>I want to be more athletic and explosive</strong>
                <span>I play sports or want to move faster and with more power</span>
              </span>
            </button>
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <div className="quiz-q">How much time do you have to train each week?</div>
          <div className="quiz-options">
            <button className="quiz-opt" onClick={() => answer('a2', '2-3')}>
              <span className="quiz-opt-icon">📅</span>
              <span className="quiz-opt-text">
                <strong>2–3 days a week</strong>
                <span>I'm busy — I want something efficient that actually works</span>
              </span>
            </button>
            <button className="quiz-opt" onClick={() => answer('a2', '4-5')}>
              <span className="quiz-opt-icon">📆</span>
              <span className="quiz-opt-text">
                <strong>4–5 days a week</strong>
                <span>I can commit to a solid routine with dedicated training days</span>
              </span>
            </button>
            <button className="quiz-opt" onClick={() => answer('a2', '6+')}>
              <span className="quiz-opt-icon">🗓️</span>
              <span className="quiz-opt-text">
                <strong>6+ days a week</strong>
                <span>I want to be in the gym as much as possible</span>
              </span>
            </button>
          </div>
          <button className="quiz-back" onClick={() => setStep(1)}>← Back</button>
        </>
      )}

      {step === 3 && (
        <>
          <div className="quiz-q">How long have you been training?</div>
          <div className="quiz-options">
            <button className="quiz-opt" onClick={() => answer('a3', 'new')}>
              <span className="quiz-opt-icon">🌱</span>
              <span className="quiz-opt-text">
                <strong>Brand new — I've never really lifted before</strong>
                <span>I'm starting from zero and that's okay</span>
              </span>
            </button>
            <button className="quiz-opt" onClick={() => answer('a3', 'some')}>
              <span className="quiz-opt-icon">🌿</span>
              <span className="quiz-opt-text">
                <strong>A little — I've done some gym stuff but nothing consistent</strong>
                <span>I've been in and out, never had a real plan</span>
              </span>
            </button>
            <button className="quiz-opt" onClick={() => answer('a3', 'trained')}>
              <span className="quiz-opt-icon">🌳</span>
              <span className="quiz-opt-text">
                <strong>I've trained consistently for a year or more</strong>
                <span>I know what I'm doing but want to be smarter about it</span>
              </span>
            </button>
          </div>
          <button className="quiz-back" onClick={() => setStep(2)}>← Back</button>
        </>
      )}

      {step === 'result' && goal && split && (
        <div className="quiz-result show">
          <div className="quiz-result-label">Your recommended goal</div>
          <div className="quiz-result-goal" style={{ color: GOALS[goal].color }}>
            {GOALS[goal].label} — {GOALS[goal].plain}
          </div>
          <div
            className="quiz-result-desc"
            dangerouslySetInnerHTML={{ __html: descs[goal] }}
          />
          <div style={{ marginTop: '12px', background: 'rgba(237,210,134,.06)', border: '1px solid rgba(237,210,134,.15)', padding: '12px 16px', fontSize: '13px', color: 'var(--muted)', fontWeight: 300 }}>
            <strong style={{ color: 'var(--gold)', fontFamily: "'DM Mono',monospace", fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Recommended Split</strong>
            Based on your schedule ({answers.a2} days/week), we recommend the <strong style={{ color: 'var(--text)' }}>{splitLabels[answers.a2!]}</strong>.
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '16px' }}>
            <button className="btn btn-primary" onClick={() => onResult(goal, split)}>{ctaLabel}</button>
          </div>
          <button className="quiz-back" onClick={reset}>← Start Over</button>
        </div>
      )}
    </div>
  );
}
