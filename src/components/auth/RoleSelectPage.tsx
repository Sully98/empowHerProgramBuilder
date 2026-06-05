interface RoleSelectPageProps {
  onSelect: (role: 'coach' | 'user') => Promise<void>;
}

export function RoleSelectPage({ onSelect }: RoleSelectPageProps) {
  return (
    <div className="auth-page">
      <div className="role-card">
        <div className="auth-brand">
          <div className="auth-brand-name">Empower<em>HER</em> Strength</div>
          <div className="auth-brand-tag">One quick question</div>
        </div>

        <h2 className="role-question">How will you use the<br />Program Builder?</h2>

        <div className="role-options">
          <button className="role-option" onClick={() => onSelect('coach')}>
            <div className="role-option-icon">🏋️</div>
            <div className="role-option-body">
              <div className="role-option-title">I'm a Coach</div>
              <div className="role-option-desc">I build and assign programs to my athletes. I want to track their progress and logged weights.</div>
            </div>
            <div className="role-option-arrow">→</div>
          </button>

          <button className="role-option" onClick={() => onSelect('user')}>
            <div className="role-option-icon">💪</div>
            <div className="role-option-body">
              <div className="role-option-title">I'm an Athlete / Individual</div>
              <div className="role-option-desc">I train for myself. I may have a coach who assigns me programs, or I build my own.</div>
            </div>
            <div className="role-option-arrow">→</div>
          </button>
        </div>

        <p className="role-footer-note">You can change this later from your dashboard.</p>
      </div>
    </div>
  );
}
