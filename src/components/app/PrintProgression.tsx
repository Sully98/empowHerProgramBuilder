import { applyDeload, getWkDisplaySets, getWkDisplayWeight } from '../../hooks/useProgramBuilder';
import type { Day, OverloadMethodId, WeekPlan } from '../../data/types';

interface PrintProgressionProps {
  overloadPlan: WeekPlan[];
  days: Day[];
  selectedMethods: Set<OverloadMethodId>;
  deloadPct: number;
}

export function PrintProgression({ overloadPlan, days, selectedMethods, deloadPct }: PrintProgressionProps) {
  if (!overloadPlan.length) return null;

  const allEx: Array<{ name: string; muscle: string; sets: string; weight?: string }> = [];
  days.forEach(d => {
    if (!d.isRest) d.exercises.forEach(e => {
      if (!allEx.find(x => x.name === e.name)) allEx.push(e);
    });
  });

  return (
    <div className="print-prog-section" id="print-prog">
      <div>
        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '28px', fontWeight: 600, marginBottom: '4px', color: '#1a1a1a' }}>
          EmpowHER Strength LLC — Program Builder
        </div>
        <div style={{ fontFamily: 'monospace', fontSize: '10px', color: '#888', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '20px' }}>
          Built by Real Coaches · Evidence-Based Training
        </div>
      </div>

      {overloadPlan.map(wp => (
        <div key={wp.week} className="print-week-block">
          <div className="print-week-title">
            {wp.label}
            {wp.isDeload && <span className="deload-badge"> DELOAD</span>}
          </div>
          <div style={{ marginBottom: '10px', fontSize: '11px', color: '#555', lineHeight: 1.6 }}>
            {wp.instructions.map((instr, i) => (
              <span key={i} style={{ marginRight: '14px' }}>
                <strong>{instr.method}:</strong> {instr.detail}
              </span>
            ))}
          </div>
          {allEx.length > 0 && (
            <table className="print-week-table">
              <thead>
                <tr>
                  <th>Exercise</th>
                  <th>Muscle</th>
                  <th>Sets × Reps</th>
                  <th>Focus / Notes</th>
                  <th>Actual Weight</th>
                  <th>Reps Completed</th>
                </tr>
              </thead>
              <tbody>
                {allEx.map((ex, i) => {
                  const sets = wp.isDeload
                    ? applyDeload(ex.sets, deloadPct)
                    : getWkDisplaySets(ex.sets, wp.week, overloadPlan, selectedMethods);
                  const weight = getWkDisplayWeight(ex.weight, wp.week, overloadPlan, selectedMethods);
                  const notes = wp.instructions
                    .filter(instr => ['Tempo', 'Rest'].includes(instr.method))
                    .map(instr => instr.detail).join(' | ') || '—';
                  return (
                    <tr key={i}>
                      <td>{ex.name}</td>
                      <td>{ex.muscle}</td>
                      <td>{sets}</td>
                      <td>{notes}</td>
                      <td style={{ minWidth: '80px' }}>{weight ?? '—'}</td>
                      <td style={{ minWidth: '80px' }}>&nbsp;</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      ))}

      <div className="print-footer">
        EmpowHER Strength LLC · Built by Real Coaches · empowherstrength.us · @empowher_strength on Instagram · Evidence-based programming for everyone
      </div>
    </div>
  );
}
