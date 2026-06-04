import { GOALS, MUSCLES, OVERLOAD_METHODS, SPLITS } from '../../data/constants';
import type { DragData, GoalKey, OverloadMethodId, SplitKey } from '../../data/types';

interface SidebarProps {
  split: SplitKey;
  goal: GoalKey;
  blockWeeks: number;
  deloadOn: boolean;
  deloadPct: number;
  selectedMethods: Set<OverloadMethodId>;
  onSetSplit: (s: SplitKey) => void;
  onSetGoal: (g: GoalKey) => void;
  onBlockWeeksChange: (n: number) => void;
  onToggleDeload: () => void;
  onDeloadPctChange: (n: number) => void;
  onToggleMethod: (id: OverloadMethodId) => void;
  onGenerateOverload: () => void;
  onDragStart: (data: DragData) => void;
}

const GOAL_COLORS: Record<GoalKey, string> = {
  hypertrophy: 'var(--accent)',
  strength:    'var(--gold)',
  power:       '#c17d5a',
  endurance:   '#7aab80',
};

export function Sidebar({
  split, goal, blockWeeks, deloadOn, deloadPct, selectedMethods,
  onSetSplit, onSetGoal, onBlockWeeksChange, onToggleDeload, onDeloadPctChange,
  onToggleMethod, onGenerateOverload, onDragStart,
}: SidebarProps) {
  const openAccordion = (el: HTMLElement) => {
    const hdr = el.closest('.mhdr') as HTMLElement | null;
    const list = hdr?.nextElementSibling as HTMLElement | null;
    if (hdr && list) {
      hdr.classList.toggle('open');
      list.classList.toggle('open');
    }
  };

  return (
    <aside className="sb">

      {/* Training Split */}
      <div className="sb-sec">
        <div className="sb-lbl">Training Split</div>
        <div className="split-grid">
          {(Object.keys(SPLITS) as SplitKey[]).map(s => {
            const labels: Record<SplitKey, string> = { upperlower: 'Upper/\nLower', fullbody: 'Full\nBody', bro: 'Bro\nSplit', everyother: 'Every\nOther' };
            return (
              <button
                key={s}
                id={`sp-${s}`}
                className={`split-btn${split === s ? ' active' : ''}`}
                onClick={() => onSetSplit(s)}
                style={{ whiteSpace: 'pre-line' }}
              >
                {labels[s]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Training Goal */}
      <div className="sb-sec">
        <div className="sb-lbl">Training Goal</div>
        <div className="goal-mini">
          {(Object.keys(GOALS) as GoalKey[]).map(g => (
            <button
              key={g}
              className={`gmini${goal === g ? ' active' : ''}`}
              data-g={g}
              style={goal === g ? { background: GOAL_COLORS[g], borderColor: GOAL_COLORS[g], color: ['power'].includes(g) ? 'var(--text)' : 'var(--dark)', fontWeight: 600 } : undefined}
              onClick={() => onSetGoal(g)}
            >
              {GOALS[g].label}
            </button>
          ))}
        </div>
      </div>

      {/* Block Length */}
      <div className="sb-sec">
        <div className="sb-lbl">Block Length + Deload</div>
        <div className="block-row">
          <span className="block-lbl">Training Weeks</span>
          <input
            className="block-input"
            type="number"
            min={1}
            max={52}
            value={blockWeeks}
            onChange={e => onBlockWeeksChange(parseInt(e.target.value) || 1)}
          />
        </div>
        <div className="deload-row">
          <div className={`deload-toggle${deloadOn ? ' on' : ''}`} onClick={onToggleDeload}></div>
          <span className="block-lbl">Deload Week</span>
          <input
            className="deload-pct"
            type="number"
            min={30}
            max={80}
            value={deloadPct}
            onChange={e => onDeloadPctChange(parseInt(e.target.value) || 50)}
          />
          <span style={{ fontFamily: "'DM Mono',monospace", fontSize: '9px', color: 'var(--muted)' }}>%</span>
        </div>
      </div>

      {/* Progressive Overload */}
      <div className="sb-sec">
        <div className="sb-lbl">Progressive Overload</div>
        <div className="ol-methods">
          {OVERLOAD_METHODS.map(m => {
            const sel = selectedMethods.has(m.id);
            return (
              <div key={m.id} className={`ol-method${sel ? ' selected' : ''}`} onClick={() => onToggleMethod(m.id)}>
                <div className="ol-check">{sel ? '✓' : ''}</div>
                <div className="ol-info">
                  <div className="ol-name">{m.icon} {m.name}</div>
                  <div className="ol-desc">{m.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
        <button className="btn btn-ghost btn-sm" style={{ width: '100%', marginTop: '8px' }} onClick={onGenerateOverload}>
          Generate Plan
        </button>
      </div>

      {/* Exercise Library */}
      <div className="sb-sec" style={{ flex: 1 }}>
        <div className="sb-lbl">Exercise Library — Drag to Day</div>
        <div className="mac">
          {Object.entries(MUSCLES).map(([key, muscle]) => (
            <div key={key}>
              <div className="mhdr" onClick={e => openAccordion(e.currentTarget)}>
                <span className="mname" style={{ color: muscle.color }}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </span>
                <span className="mchev">▼</span>
              </div>
              <div className="exlist">
                {muscle.exercises.map((ex, i) => (
                  <div
                    key={i}
                    className="echip"
                    draggable
                    style={{ borderLeftColor: muscle.color }}
                    title={`Equipment alternatives: ${ex.a}`}
                    onDragStart={() => onDragStart({ src: 'sb', muscle: key, ei: i, color: muscle.color })}
                  >
                    <span className="cdot" style={{ background: muscle.color }}></span>
                    <span>{ex.n}</span>
                    <span className="cdrag">⠿</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

    </aside>
  );
}
