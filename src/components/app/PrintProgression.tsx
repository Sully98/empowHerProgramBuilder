import { applyDeloadRows, getWkDisplayRows } from '../../hooks/useProgramBuilder';
import type { Day, OverloadMethodId, SetRow, WeekPlan } from '../../data/types';

interface PrintProgressionProps {
  overloadPlan: WeekPlan[];
  days: Day[];
  selectedMethods: Set<OverloadMethodId>;
  deloadPct: number;
}

export function PrintProgression({ overloadPlan, days, selectedMethods, deloadPct }: PrintProgressionProps) {
  if (!overloadPlan.length) return null;

  const allEx: Array<{ name: string; muscle: string; setRows: SetRow[] }> = [];
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
                  <th>Set</th>
                  <th>Reps</th>
                  <th>Target Weight</th>
                  <th>Focus / Notes</th>
                  <th>Actual Weight</th>
                  <th>Reps Completed</th>
                </tr>
              </thead>
              <tbody>
                {allEx.map((ex, i) => {
                  const rows = wp.isDeload
                    ? applyDeloadRows(ex.setRows, deloadPct)
                    : getWkDisplayRows(ex.setRows, wp.week, overloadPlan, selectedMethods);
                  const notes = wp.instructions
                    .filter(instr => ['Tempo', 'Rest'].includes(instr.method))
                    .map(instr => instr.detail).join(' | ') || '—';
                  return rows.map((row, si) => (
                    <tr key={`${i}-${si}`}>
                      {si === 0 && <td rowSpan={rows.length}>{ex.name}</td>}
                      {si === 0 && <td rowSpan={rows.length}>{ex.muscle}</td>}
                      <td>{si + 1}</td>
                      <td>{row.reps}</td>
                      <td style={{ minWidth: '80px' }}>{row.weight || '—'}</td>
                      {si === 0 && <td rowSpan={rows.length}>{notes}</td>}
                      <td style={{ minWidth: '80px' }}>&nbsp;</td>
                      <td style={{ minWidth: '80px' }}>&nbsp;</td>
                    </tr>
                  ));
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
