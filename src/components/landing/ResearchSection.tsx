import { useState } from 'react';
import { GOALS } from '../../data/constants';
import type { GoalKey } from '../../data/types';

const GOAL_TABS: { key: GoalKey; color: string }[] = [
  { key: 'hypertrophy', color: 'var(--accent)' },
  { key: 'strength',    color: 'var(--gold)' },
  { key: 'power',       color: '#c17d5a' },
  { key: 'endurance',   color: '#7aab80' },
];

export function ResearchSection() {
  const [activeGoal, setActiveGoal] = useState<GoalKey>('hypertrophy');
  const d = GOALS[activeGoal];

  return (
    <div className="lsec" id="research">
      <div className="ltag">The Research</div>
      <h2 className="lh2">What the science <em>actually says.</em></h2>
      <div className="prose">
        <p>All set, rep, and volume prescriptions are drawn from the <strong>ACSM Position Stand on Progression Models in Resistance Training</strong> and updated by peer-reviewed meta-analyses. Select a goal below to see the research behind it.</p>
      </div>

      <div className="goal-tabs" id="landing-goal-tabs">
        {GOAL_TABS.map(({ key, color }) => (
          <button
            key={key}
            className={`gtab${activeGoal === key ? ' active' : ''}`}
            data-g={key}
            onClick={() => setActiveGoal(key)}
          >
            <span className="gdot" style={{ background: color }}></span>
            {GOALS[key].label}
          </button>
        ))}
      </div>

      <div className="rcards">
        <div className="rcard">
          <div className="rcard-tag">Training Parameters</div>
          <h3 style={{ color: d.color }}>{d.label}</h3>
          <p><strong>Sets:</strong> {d.sets} per exercise</p>
          <p><strong>Reps:</strong> {d.reps} per set</p>
          <p><strong>Load:</strong> {d.load}</p>
          <p><strong>Rest:</strong> {d.rest}</p>
          <p><strong>Weekly Volume:</strong> {d.wkTarget}</p>
          <div className="rcite">ACSM Position Stand — Ratamess et al. (2009)</div>
        </div>
        {d.research.map((r, i) => (
          <div key={i} className="rcard">
            <div className="rcard-tag">Research Finding</div>
            <h3>{r.h}</h3>
            <p dangerouslySetInnerHTML={{ __html: r.t }} />
            <div className="rcite">{r.cite}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
