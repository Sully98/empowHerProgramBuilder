export function SocialBar() {
  return (
    <div className="social-bar">
      <span className="social-bar-lbl">Find us</span>
      <div className="social-links">
        <a className="social-link ig" href="https://instagram.com/empowher_strength" target="_blank" rel="noreferrer">
          <span className="social-icon">📸</span> @empowher_strength
        </a>
        <a className="social-link" href="https://empowherstrength.us" target="_blank" rel="noreferrer">
          <span className="social-icon">🌐</span> empowherstrength.us
        </a>
      </div>
      <span style={{ marginLeft: 'auto', fontFamily: "'DM Mono',monospace", fontSize: '9px', color: 'var(--muted)', letterSpacing: '1px' }}>
        Follow along for daily training content
      </span>
    </div>
  );
}
