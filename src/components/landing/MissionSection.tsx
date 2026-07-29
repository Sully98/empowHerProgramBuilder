interface MissionSectionProps {
  sectionRef: React.RefObject<HTMLDivElement | null>;
}

export function MissionSection({ sectionRef }: MissionSectionProps) {
  return (
    <div className="lsec" id="mission" ref={sectionRef}>
      <div className="ltag">Our Mission</div>
      <h2 className="lh2">Strength is for <em>everyone.</em></h2>
      <div className="prose">
        <p>EmpowHER Strength was built on a simple belief: that strength training should be <strong>accessible, understandable, and not intimidating</strong> — no matter your background, experience level, or where you train.</p>
        <p>Too often, training knowledge is locked behind jargon, gym culture gatekeeping, or programs that assume you already know what you're doing. This tool exists to change that.</p>
      </div>

      <div className="mission-cols">
        <div className="mission-col">
          <h3>Stay <em>in the know.</em></h3>
          <p>Every rep range, every set count, every volume target in this builder is sourced from peer-reviewed research. We cite our sources so you understand the why behind every recommendation — not just the what.</p>
        </div>
        <div className="mission-col">
          <h3>Make it <em>simple.</em></h3>
          <p>Drag an exercise onto a day. Pick your goal. Set your block length. The builder handles the rest — auto-generating your progressive overload plan, flagging your volume, and formatting a printable program ready for the gym.</p>
        </div>
        <div className="mission-col">
          <h3>Get <em>stronger.</em></h3>
          <p>The exercises in this library are hand-selected for their effectiveness, adaptability across equipment, and appropriateness across all experience levels. Every single one can be done with a barbell, dumbbell, cable, or machine equivalent.</p>
        </div>
        <div className="mission-col">
          <h3>Built by <em>Melody.</em></h3>
          <p>This isn't AI-generated programming or a template someone copied from a forum. The exercise selection, rep ranges, and methodology reflect real coaching philosophy — built to help real people get real results.</p>
        </div>
      </div>

    </div>
  );
}
