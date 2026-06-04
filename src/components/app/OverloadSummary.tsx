import type { WeekPlan } from '../../data/types';

interface OverloadSummaryProps {
  overloadPlan: WeekPlan[];
  visible: boolean;
  activeWeekView: number;
  deloadPct: number;
  onClose: () => void;
}

export function OverloadSummary({ overloadPlan, visible, activeWeekView, deloadPct, onClose }: OverloadSummaryProps) {
  if (!overloadPlan.length || !visible) return null;

  const activeWp = overloadPlan[activeWeekView - 1];

  return (
    <div className="ol-summary on" id="ol-summary">
      <div className="panel-hdr">
        <div className="ol-sum-ttl">✦ Progressive Overload Plan</div>
        <button className="panel-close" onClick={onClose} title="Close">✕</button>
      </div>
      <div id="ol-sum-body">
        <div className="ol-week-row">
          {overloadPlan.map(wp => {
            const focus = wp.isDeload
              ? `Volume ↓${deloadPct}%`
              : wp.instructions.map(i => i.method).join(' + ');
            return (
              <div key={wp.week} className={`ol-wk-badge${wp.isDeload ? ' deload' : ''}`}>
                <span className="wk-num">{wp.label}</span>
                <span className="wk-desc">{focus}</span>
              </div>
            );
          })}
        </div>
        {activeWp && (
          <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <div style={{ fontFamily: "'DM Mono',monospace", fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '4px' }}>
              {activeWp.label} — Instructions
            </div>
            {activeWp.instructions.map((instr, i) => (
              <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '12px' }}>
                <span style={{ fontFamily: "'DM Mono',monospace", fontSize: '9px', color: 'var(--muted)', width: '80px', flexShrink: 0, textTransform: 'uppercase', letterSpacing: '1px', paddingTop: '2px' }}>
                  {instr.method}
                </span>
                <span style={{ color: 'var(--text)', fontWeight: 300 }}>{instr.detail}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
