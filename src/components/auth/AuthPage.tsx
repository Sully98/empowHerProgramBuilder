import { useState } from 'react';
import type { AuthError } from '@supabase/supabase-js';

interface AuthPageProps {
  onSignIn: (email: string, password: string) => Promise<AuthError | null>;
  onSignUp: (email: string, password: string) => Promise<AuthError | null>;
  onBack: () => void;
}

type Tab = 'login' | 'signup';

export function AuthPage({ onSignIn, onSignUp, onBack }: AuthPageProps) {
  const [tab, setTab] = useState<Tab>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  const switchTab = (t: Tab) => { setTab(t); setError(''); setInfo(''); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');

    if (!email || !password) { setError('Email and password are required.'); return; }
    if (tab === 'signup' && password !== confirmPassword) { setError('Passwords do not match.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }

    setLoading(true);
    const err = tab === 'login' ? await onSignIn(email, password) : await onSignUp(email, password);
    setLoading(false);

    if (err) {
      setError(err.message);
    } else if (tab === 'signup') {
      setInfo('Check your inbox to confirm your email, then log in.');
      setTab('login');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <button className="auth-back" onClick={onBack}>← Back to site</button>

        <div className="auth-brand">
          <div className="auth-brand-name">Empower<em>HER</em> Strength</div>
          <div className="auth-brand-tag">Program Builder</div>
        </div>

        <div className="auth-tabs">
          <button className={`auth-tab${tab === 'login' ? ' active' : ''}`} onClick={() => switchTab('login')}>
            Log In
          </button>
          <button className={`auth-tab${tab === 'signup' ? ' active' : ''}`} onClick={() => switchTab('signup')}>
            Sign Up
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="auth-field-group">
            <label className="auth-label">Email</label>
            <input
              className="auth-input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className="auth-field-group">
            <label className="auth-label">Password</label>
            <input
              className="auth-input"
              type="password"
              placeholder="Min. 6 characters"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
            />
          </div>

          {tab === 'signup' && (
            <div className="auth-field-group">
              <label className="auth-label">Confirm Password</label>
              <input
                className="auth-input"
                type="password"
                placeholder="Repeat your password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>
          )}

          {error && <div className="auth-error">{error}</div>}
          {info  && <div className="auth-info">{info}</div>}

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? 'Please wait…' : tab === 'login' ? 'Log In →' : 'Create Account →'}
          </button>
        </form>

        <p className="auth-footer-note">
          {tab === 'login'
            ? "Don't have an account? "
            : 'Already have an account? '}
          <span className="auth-switch-link" onClick={() => switchTab(tab === 'login' ? 'signup' : 'login')}>
            {tab === 'login' ? 'Sign up' : 'Log in'}
          </span>
        </p>
      </div>
    </div>
  );
}
