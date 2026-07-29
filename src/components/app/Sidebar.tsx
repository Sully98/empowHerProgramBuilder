import { useState } from 'react';
import { GOALS, MUSCLES, OVERLOAD_METHODS, SPLITS } from '../../data/constants';
import type { DragData, GoalKey, OverloadMethodId, SplitKey } from '../../data/types';

interface CustomExercise {
  n: string;
  eq: string[];
  muscle: string;
  color: string;
}

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

const SPLIT_INFO: Record<SplitKey, string> = {
  upperlower: 'Alternate upper-body and lower-body days. Hits every muscle twice a week with solid recovery — a strong all-around choice for most goals.',
  fullbody: 'Train your entire body each session. Works well on 2–3 days a week and keeps training frequency high for every muscle group.',
  bro: 'One muscle group per day — chest, back, shoulders, legs, arms. High volume per session, but each muscle is only trained once a week.',
  everyother: 'A workout day followed by a rest day, on repeat, instead of a fixed weekly schedule. Flexible if your week is inconsistent.',
};

const GOAL_COLORS: Record<GoalKey, string> = {
  hypertrophy: 'var(--accent)',
  strength:    'var(--gold)',
  power:       '#c17d5a',
  endurance:   '#7aab80',
};

const EQUIPMENT_OPTIONS = [
  { key: 'Barbell',       label: 'Barbell' },
  { key: 'Dumbbell',      label: 'Dumbbell' },
  { key: 'Cable',         label: 'Cable' },
  { key: 'Machine',       label: 'Machine' },
  { key: 'Band',          label: 'Bands' },
  { key: 'Bodyweight',    label: 'Bodyweight' },
  { key: 'Kettlebell',    label: 'Kettlebell' },
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

const EMPTY_FORM = { name: '', muscle: 'chest', eq: new Set<string>() };

export function Sidebar({
  split, goal, blockWeeks, deloadOn, deloadPct, selectedMethods,
  onSetSplit, onSetGoal, onBlockWeeksChange, onToggleDeload, onDeloadPctChange,
  onToggleMethod, onGenerateOverload, onDragStart,
}: SidebarProps) {
  const [availableEquipment, setAvailableEquipment] = useState<Set<string>>(
    () => new Set(['Barbell', 'Dumbbell', 'Cable', 'Machine', 'Band', 'Bodyweight', 'Kettlebell'])
  );
  const [customExercises, setCustomExercises] = useState<CustomExercise[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [customForm, setCustomForm] = useState<{ name: string; muscle: string; eq: Set<string> }>(EMPTY_FORM);
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  const toggleEquipment = (key: string) => {
    setAvailableEquipment(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const exerciseAvailable = (eq: string[]) => eq.length === 0 || eq.some(e => availableEquipment.has(e));

  const toggleSection = (key: string) => {
    setOpenSections(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const openModal = () => {
    setCustomForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const toggleFormEq = (key: string) => {
    setCustomForm(prev => {
      const next = new Set(prev.eq);
      next.has(key) ? next.delete(key) : next.add(key);
      return { ...prev, eq: next };
    });
  };

  const saveCustomExercise = () => {
    const name = customForm.name.trim();
    if (!name || !customForm.muscle) return;
    const muscleKey = customForm.muscle;
    const color = MUSCLES[muscleKey]?.color ?? '#888888';
    setCustomExercises(prev => [...prev, { n: name, eq: [...customForm.eq], muscle: muscleKey, color }]);
    // ensure that muscle group section is open so they see it
    setOpenSections(prev => new Set([...prev, muscleKey]));
    closeModal();
  };

  const removeCustomExercise = (idx: number) => {
    setCustomExercises(prev => prev.filter((_, i) => i !== idx));
  };

  const q = searchQuery.trim().toLowerCase();

  // Build combined exercise list per muscle, filtered by search
  const muscleEntries = Object.entries(MUSCLES).map(([key, muscle]) => {
    const builtIn = muscle.exercises.map((ex, i) => ({ ex, i, isCustom: false as const }));
    const custom = customExercises
      .map((ex, i) => ({ ex, i, isCustom: true as const }))
      .filter(({ ex }) => ex.muscle === key);
    const all = [...builtIn, ...custom];
    const filtered = q ? all.filter(({ ex }) => ex.n.toLowerCase().includes(q)) : all;
    return { key, muscle, filtered };
  });

  // When searching, auto-expand sections with matches; otherwise use openSections
  const isSectionOpen = (key: string, hasMatches: boolean) =>
    q ? hasMatches : openSections.has(key);

  return (
    <aside className="sb">

      {/* Training Split */}
      <div className="sb-sec" id="sb-split">
        <div className="sb-lbl">Training Split</div>
        <div className="split-grid">
          {(Object.keys(SPLITS) as SplitKey[]).map(s => {
            const labels: Record<SplitKey, string> = { upperlower: 'Upper/\nLower', fullbody: 'Full\nBody', bro: 'Bro\nSplit', everyother: 'Every\nOther' };
            return (
              <div key={s} className="split-btn-wrap">
                <button
                  id={`sp-${s}`}
                  className={`split-btn${split === s ? ' active' : ''}`}
                  onClick={() => onSetSplit(s)}
                  style={{ whiteSpace: 'pre-line' }}
                >
                  {labels[s]}
                </button>
                <div className="split-tip">
                  <div className="split-tip-title">{SPLITS[s].label}</div>
                  {SPLIT_INFO[s]}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Training Goal */}
      <div className="sb-sec" id="sb-goal">
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
      <div className="sb-sec" id="sb-block">
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
      <div className="sb-sec" id="sb-overload">
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
      <div className="sb-sec" id="sb-equipment" style={{ background: 'rgba(123,181,178,.04)', borderLeft: '3px solid var(--accent)' }}>
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
      <div className="sb-sec" id="sb-exlibrary" style={{ flex: 1 }}>
        <div className="sb-sec-hdr">
          <span className="sb-lbl">Exercise Library — Drag to Day</span>
          <span className="sb-step">06</span>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: '8px' }}>
          <span style={{
            position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)',
            color: 'var(--muted)', fontSize: '11px', pointerEvents: 'none',
          }}>⌕</span>
          <input
            type="text"
            placeholder="Search exercises..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%', boxSizing: 'border-box',
              background: 'var(--card)', border: '1px solid var(--border2)',
              color: 'var(--text)', fontSize: '11px', padding: '6px 28px 6px 24px',
              outline: 'none', fontFamily: "'DM Sans', sans-serif",
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer',
                fontSize: '12px', lineHeight: 1, padding: '0 2px',
              }}
            >✕</button>
          )}
        </div>

        <div className="mac">
          {muscleEntries.map(({ key, muscle, filtered }) => {
            if (q && filtered.length === 0) return null;
            const open = isSectionOpen(key, filtered.length > 0);
            return (
              <div key={key}>
                <div
                  className={`mhdr${open ? ' open' : ''}`}
                  onClick={() => !q && toggleSection(key)}
                  style={{ cursor: q ? 'default' : 'pointer' }}
                >
                  <span className="mname" style={{ color: muscle.color }}>
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </span>
                  {!q && <span className="mchev">{open ? '▲' : '▼'}</span>}
                </div>
                {open && (
                  <div className="exlist open">
                    {filtered.map(({ ex, i, isCustom }) => {
                      const avail = exerciseAvailable(ex.eq);
                      return (
                        <div
                          key={`${isCustom ? 'c' : 'b'}-${i}`}
                          className="echip"
                          draggable={avail}
                          style={{
                            borderLeftColor: muscle.color,
                            opacity: avail ? 1 : 0.3,
                            cursor: avail ? 'grab' : 'not-allowed',
                          }}
                          title={avail
                            ? (ex.eq.length ? `Equipment: ${ex.eq.join(', ')}` : 'No equipment required')
                            : 'Equipment not available for this exercise'}
                          onDragStart={avail
                            ? () => isCustom
                              ? onDragStart({ src: 'sb', muscle: key, color: muscle.color, customName: ex.n, customEquipment: ex.eq })
                              : onDragStart({ src: 'sb', muscle: key, ei: i, color: muscle.color })
                            : undefined}
                        >
                          <span className="cdot" style={{ background: muscle.color, flexShrink: 0 }}></span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '11px', color: 'var(--muted)', lineHeight: 1.3, display: 'flex', alignItems: 'center', gap: '4px' }}>
                              {ex.n}
                              {isCustom && (
                                <span style={{
                                  fontFamily: "'DM Mono',monospace", fontSize: '7px', letterSpacing: '.5px',
                                  textTransform: 'uppercase', padding: '1px 4px',
                                  background: 'rgba(237,210,134,.1)', border: '1px solid rgba(237,210,134,.2)',
                                  color: 'var(--gold)', flexShrink: 0,
                                }}>Custom</span>
                              )}
                            </div>
                            <div className="eq-tags">
                              {ex.eq.slice(0, 4).map(e => (
                                <span key={e} className={`eq-tag ${EQ_CLASS[e] ?? 'other'}`}>
                                  {EQ_SHORT[e] ?? e.slice(0, 5)}
                                </span>
                              ))}
                              {ex.eq.length === 0 && isCustom && (
                                <span style={{ fontSize: '9px', color: 'var(--muted)' }}>No equipment</span>
                              )}
                            </div>
                          </div>
                          {isCustom ? (
                            <button
                              style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '12px', padding: '0 2px', lineHeight: 1, flexShrink: 0 }}
                              onClick={e => { e.stopPropagation(); removeCustomExercise(i); }}
                              title="Remove custom exercise"
                            >×</button>
                          ) : (
                            <span className="cdrag">⠿</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <button
          className="btn btn-ghost btn-sm"
          style={{ width: '100%', marginTop: '10px', borderStyle: 'dashed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
          onClick={openModal}
        >
          + Add Custom Exercise
          <span style={{
            fontFamily: "'DM Mono',monospace", fontSize: '7px', letterSpacing: '.5px',
            textTransform: 'uppercase', padding: '1px 5px',
            background: 'rgba(237,210,134,.1)', border: '1px solid rgba(237,210,134,.2)',
            color: 'var(--gold)',
          }}>Custom</span>
        </button>
      </div>

      {/* Custom Exercise Modal */}
      {modalOpen && (
        <div
          className="modal-overlay"
          onClick={e => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className="modal-box" style={{ position: 'relative' }}>
            <button
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'var(--muted)', fontSize: '16px', cursor: 'pointer', lineHeight: 1 }}
              onClick={closeModal}
            >✕</button>

            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '26px', fontWeight: 600, marginBottom: '4px' }}>
              Add Custom Exercise
            </div>
            <div style={{ fontFamily: "'DM Mono',monospace", fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '20px' }}>
              It goes straight into your library — drag it onto any day
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: '9px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--muted)' }}>
                Exercise Name
              </div>
              <input
                autoFocus
                style={{ background: 'var(--card)', border: '1px solid var(--border2)', color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", fontSize: '13px', padding: '10px 14px', outline: 'none', width: '100%', boxSizing: 'border-box' }}
                type="text"
                placeholder="e.g. Landmine Press, Nordic Curl..."
                value={customForm.name}
                onChange={e => setCustomForm(prev => ({ ...prev, name: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && saveCustomExercise()}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: '9px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--muted)' }}>
                Muscle Group
              </div>
              <select
                style={{ background: 'var(--card)', border: '1px solid var(--border2)', color: 'var(--text)', fontFamily: "'DM Mono',monospace", fontSize: '10px', letterSpacing: '1px', padding: '10px 14px', outline: 'none', width: '100%', cursor: 'pointer', appearance: 'none' }}
                value={customForm.muscle}
                onChange={e => setCustomForm(prev => ({ ...prev, muscle: e.target.value }))}
              >
                {Object.keys(MUSCLES).map(m => (
                  <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '20px' }}>
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: '9px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--muted)' }}>
                Equipment — select all that apply
              </div>
              <div className="eq-grid">
                {EQUIPMENT_OPTIONS.map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    className={`eq-btn${customForm.eq.has(key) ? ' active' : ''}`}
                    onClick={() => toggleFormEq(key)}
                  >
                    <span className="eq-check">{customForm.eq.has(key) ? '✓' : ''}</span>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className="btn btn-primary btn-sm"
                style={{ flex: 1 }}
                onClick={saveCustomExercise}
              >
                Add to Library →
              </button>
              <button className="btn btn-ghost btn-sm" onClick={closeModal}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </aside>
  );
}
