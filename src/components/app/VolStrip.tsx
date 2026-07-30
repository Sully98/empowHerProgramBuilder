import { GOALS, MUSCLES } from '../../data/constants';
import type { Day, GoalKey } from '../../data/types';

interface VolStripProps {
  days: Day[];
  goal: GoalKey;
}

export function VolStrip({ days, goal }: VolStripProps) {
  const g = GOALS[goal];
  const counts: Record<string, number> = {};
  days.forEach(d => {
    if (!d.isRest) d.exercises.forEach(e => {
      counts[e.muscle] = (counts[e.muscle] || 0) + e.setRows.length;
    });
  });

  if (!Object.keys(counts).length) {
    return (
      <div className="vol-strip" id="vol-strip">
        <span className="vol-empty">Add exercises to see weekly volume</span>
      </div>
    );
  }

  return (
    <div className="vol-strip" id="vol-strip">
      {Object.entries(MUSCLES).map(([key, muscle]) => {
        if (!counts[key]) return null;
        const s = counts[key];
        const good = s >= g.wkMin;
        return (
          <div
            key={key}
            className={`vbadge ${good ? 'good' : 'low'}`}
            title={good ? `✓ On target (min ${g.wkMin} sets/wk)` : `⚠ Below ${g.wkMin} sets/wk minimum`}
          >
            <span className="vdot" style={{ background: muscle.color }}></span>
            <span className="vname">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
            <span className="vcount">{s}/wk</span>
          </div>
        );
      })}
    </div>
  );
}
