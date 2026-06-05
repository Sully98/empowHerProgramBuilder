import { useState } from 'react';

interface InviteModalProps {
  onInvite: (email: string) => Promise<void>;
  onClose: () => void;
}

export function InviteModal({ onInvite, onClose }: InviteModalProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) { setError('Enter a valid email address.'); return; }
    setLoading(true); setError('');
    try {
      await onInvite(email);
      setSent(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-box">
        <button className="popup-close" onClick={onClose}>✕</button>
        <div className="popup-tag">Add to your roster</div>
        <h2 className="popup-h">Invite an <em>athlete</em></h2>

        {sent ? (
          <div className="auth-info" style={{ marginTop: '16px' }}>
            Invite sent to <strong>{email}</strong>. They'll be added to your roster when they log in.
            <div style={{ marginTop: '12px' }}>
              <button className="btn btn-ghost btn-sm" onClick={() => { setSent(false); setEmail(''); }}>Invite another</button>
              <button className="btn btn-primary btn-sm" style={{ marginLeft: '8px' }} onClick={onClose}>Done</button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="popup-form" style={{ marginTop: '20px' }}>
            <p className="popup-p">
              Enter your athlete's email address. When they log in, they'll be automatically added to your roster.
            </p>
            <input
              className="email-field"
              type="email"
              placeholder="athlete@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoFocus
            />
            {error && <div className="auth-error">{error}</div>}
            <button className="email-submit" type="submit" disabled={loading}>
              {loading ? 'Sending…' : 'Send Invite →'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
