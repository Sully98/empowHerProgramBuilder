export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-brand">Empower<span>HER</span> Strength LLC</div>
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
        <a className="footer-by" href="https://instagram.com/empowher_strength" target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: 'var(--muted)' }}>
          📸 @empowher_strength
        </a>
        <a className="footer-by" href="https://empowherstrength.us" target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: 'var(--muted)' }}>
          🌐 empowherstrength.us
        </a>
      </div>
      <div className="footer-copy">© 2025 EmpowHER Strength LLC · Built by Melody · All rights reserved</div>
    </footer>
  );
}
