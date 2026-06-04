interface AppSocialBannerProps {
  onGetWeeklyTips: () => void;
}

export function AppSocialBanner({ onGetWeeklyTips }: AppSocialBannerProps) {
  return (
    <div className="app-social-banner">
      <div className="asb-text">Built by <strong>EmpowHER Strength LLC</strong> · Evidence-based training for everyone</div>
      <div className="asb-links">
        <a className="asb-link ig" href="https://instagram.com/empowher_strength" target="_blank" rel="noreferrer">📸 @empowher_strength</a>
        <a className="asb-link" href="https://empowherstrength.us" target="_blank" rel="noreferrer">🌐 empowherstrength.us</a>
        <button className="asb-link" onClick={onGetWeeklyTips} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>✉ Get Weekly Tips</button>
      </div>
    </div>
  );
}
