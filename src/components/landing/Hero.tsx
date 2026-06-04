interface HeroProps {
  onOpenApp: () => void;
  onScrollToMission: () => void;
}

export function Hero({ onOpenApp, onScrollToMission }: HeroProps) {
  return (
    <div className="hero">
      <div className="hero-eyebrow">
        <div className="hero-brand">EmpowHER Strength LLC</div>
        <div className="hero-divider"></div>
        <div className="hero-tagline">Program Builder</div>
      </div>
      <h1 className="hero-h1">Strength starts with</h1>
      <div className="hero-h1-sub">a plan.</div>
      <p className="hero-p">
        A <strong>research-backed, drag-and-drop program builder</strong> built to make strength training accessible,
        approachable, and effective for everyone. Hand-selected exercises, evidence-based rep ranges, and a progressive
        overload system — all in one printable plan.
      </p>
      <div className="hero-btns">
        <button className="btn btn-primary" onClick={onOpenApp}>Build My Program →</button>
        <button className="btn btn-ghost" onClick={onScrollToMission}>Our Mission</button>
      </div>
    </div>
  );
}
