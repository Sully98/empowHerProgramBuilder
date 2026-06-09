import { useState } from 'react';
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

const EQUIPMENT_OPTIONS = [
  { key: 'Barbell',      label: 'Barbell' },
  { key: 'Dumbbell',     label: 'Dumbbell' },
  { key: 'Cable',        label: 'Cable' },
  { key: 'Machine',      label: 'Machine' },
  { key: 'Band',         label: 'Bands' },
  { key: 'Bodyweight',   label: 'Bodyweight' },
  { key: 'Kettlebell',   label: 'Kettlebell' },
  { key: 'Smith Machine', label: 'Smith' },
];

const EQ_CLASS: Record<string, string> = {
  Barbell: 'bb', Dumbbell: 'db', Cable: 'cable', Machine: 'machine',
  Band: 'band', Bodyweight: 'bw', Kettlebell: 'kb', 'Smith Machine': 'machine',
};

const EQ_SHORT: Record<string, string> = {
  Barbell: 'BB', Dumbbell: 'DB', Machine: 'Mach', Bodyweight: 'BW',
  Kettlebell: 'KB', Band: 'Band', Cable: 'Cable', 'Smith Machine': 'Smith',
};

export function Sidebar({
  split, goal, blockWeeks, deloadOn, deloadPct, selectedMethods,
  onSetSplit, onSetGoal, onBlockWeeksChange, onToggleDeload, onDeloadPctChange,
  onToggleMethod, onGenerateOverload, onDragStart,
}: SidebarProps) {
  const [availableEquipment, setAvailableEquipment] = useState<Set<string>>(
    () => new Set(['Barbell', 'Dumbbell', 'Cable', 'Machine', 'Band', 'Bodyweight', 'Kettlebell'])
  );

  const toggleEquipment = (key: string) => {
    setAvailableEquipment(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const exerciseAvailable = (eq: string[]) => eq.length === 0 || eq.some(e => availableEquipment.has(e));

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
        <div className="sb-sec-hdr">
          <span className="sb-lbl">Progressive Overload</span>
          <span className="sb-step">04</span>
        </div>
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

      {/* Available Equipment */}
      <div className="sb-sec" style={{ background: 'rgba(123,181,178,.04)', borderLeft: '3px solid var(--accent)' }}>
        <div className="sb-sec-hdr">
          <span className="sb-lbl">Available Equipment</span>
          <span className="sb-step">05</span>
        </div>
        <div className="eq-grid">
          {EQUIPMENT_OPTIONS.map(({ key, label }) => {
            const active = availableEquipment.has(key);
            return (
              <button
                key={key}
                type="button"
                className={`eq-btn${active ? ' active' : ''}`}
                onClick={() => toggleEquipment(key)}
              >
                <span className="eq-check">{active ? '✓' : ''}</span>
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Exercise Library */}
      <div className="sb-sec" style={{ flex: 1 }}>
        <div className="sb-sec-hdr">
          <span className="sb-lbl">Exercise Library — Drag to Day</span>
          <span className="sb-step">06</span>
        </div>
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
                {muscle.exercises.map((ex, i) => {
                  const avail = exerciseAvailable(ex.eq);
                  return (
                    <div
                      key={i}
                      className="echip"
                      draggable={avail}
                      style={{
                        borderLeftColor: muscle.color,
                        opacity: avail ? 1 : 0.3,
                        cursor: avail ? 'grab' : 'not-allowed',
                      }}
                      title={avail ? `Equipment: ${ex.eq.join(', ')}` : 'Equipment not available for this exercise'}
                      onDragStart={avail ? () => onDragStart({ src: 'sb', muscle: key, ei: i, color: muscle.color }) : undefined}
                    >
                      <span className="cdot" style={{ background: muscle.color, flexShrink: 0 }}></span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '11px', color: 'var(--muted)', lineHeight: 1.3 }}>{ex.n}</div>
                        <div className="eq-tags">
                          {ex.eq.slice(0, 4).map(e => (
                            <span key={e} className={`eq-tag ${EQ_CLASS[e] ?? 'other'}`}>
                              {EQ_SHORT[e] ?? e.slice(0, 5)}
                            </span>
                          ))}
                        </div>
                      </div>
                      <span className="cdrag">⠿</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

    </aside>
  );
}
