interface CtaSectionProps {
  onOpenApp: () => void;
}

export function CtaSection({ onOpenApp }: CtaSectionProps) {
  return (
    <div className="cta-sec">
      <div className="ltag" style={{ textAlign: 'center' }}>Ready to build?</div>
      <h2 className="cta-h">Your program.<br /><em>Your strength.</em></h2>
      <p className="cta-sub">Drag, drop, periodize, and print. Takes about 5 minutes.</p>
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button className="btn btn-primary" style={{ fontSize: '12px', padding: '16px 40px' }} onClick={onOpenApp}>
          Build My Program →
        </button>
        <a className="btn btn-ghost" style={{ fontSize: '12px', padding: '16px 40px' }} href="https://empowherstrength.us" target="_blank" rel="noreferrer">
          Visit Our Website
        </a>
      </div>
    </div>
  );
}
