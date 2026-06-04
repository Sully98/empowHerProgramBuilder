interface WeekTabsProps {
  blockWeeks: number;
  deloadOn: boolean;
  activeWeekView: number;
  onSelectWeek: (w: number) => void;
}

export function WeekTabs({ blockWeeks, deloadOn, activeWeekView, onSelectWeek }: WeekTabsProps) {
  const totalWeeks = blockWeeks + (deloadOn ? 1 : 0);

  return (
    <div className="week-tabs-wrap" id="week-tabs">
      <span style={{ fontFamily: "'DM Mono',monospace", fontSize: '9px', color: 'var(--muted)', letterSpacing: '2px', textTransform: 'uppercase', marginRight: '4px' }}>
        View Week:
      </span>
      {Array.from({ length: totalWeeks }, (_, i) => i + 1).map(w => {
        const isDeload = deloadOn && w === totalWeeks;
        return (
          <button
            key={w}
            className={`week-tab${w === activeWeekView ? ' active' : ''}${isDeload ? ' deload-tab' : ''}`}
            onClick={() => onSelectWeek(w)}
          >
            {isDeload ? 'Deload' : `Wk ${w}`}
          </button>
        );
      })}
    </div>
  );
}
