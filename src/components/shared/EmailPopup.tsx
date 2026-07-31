import { useEffect, useRef, useState } from 'react';
import { saveSubscriber } from '../landing/EmailSignup';

interface EmailPopupProps {
  showToast: (msg: string) => void;
  openSignal?: number;
}

export function EmailPopup({ showToast, openSignal }: EmailPopupProps) {
  const [visible, setVisible] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const shown = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (shown.current) return;
      const subs = JSON.parse(localStorage.getItem('empowher_subs') || '[]');
      const dismissed = localStorage.getItem('empowher_popup_dismissed');
      if (!subs.length && !dismissed) {
        setVisible(true);
        shown.current = true;
      }
    }, 45000);
    return () => clearTimeout(timer);
  }, []);

  // Let other parts of the app (e.g. the "Get the Free Guide" buttons) force this open.
  useEffect(() => {
    if (!openSignal) return;
    setVisible(true);
    shown.current = true;
  }, [openSignal]);

  const close = () => {
    setVisible(false);
    localStorage.setItem('empowher_popup_dismissed', 'true');
  };

  const handleSubmit = async () => {
    if (!email || !email.includes('@')) { showToast('Please enter a valid email'); return; }
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    saveSubscriber(trimmedName, trimmedEmail);
    setSending(true);
    try {
      const res = await fetch('/api/send-guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmedName, email: trimmedEmail }),
      });
      if (!res.ok) throw new Error('send failed');
      close();
      showToast('Check your inbox — your guide is on the way! 🎉');
    } catch {
      close();
      showToast("Saved! We'll follow up by email shortly.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className={`popup-overlay${visible ? ' show' : ''}`}
      id="email-popup"
      onClick={e => { if (e.target === e.currentTarget) close(); }}
    >
      <div className="popup-box">
        <button className="popup-close" onClick={close}>✕</button>
        <div className="popup-tag">Free from EmpowHER Strength</div>
        <h2 className="popup-h">Want the free<br /><em>training guide?</em></h2>
        <p className="popup-p">26 pages on form, myths, and how to actually structure your training. Drop your email and we'll send it straight to your inbox, plus weekly training tips from Melody.</p>
        <div className="popup-form">
          <input className="email-field" type="text" placeholder="Your first name" value={name} onChange={e => setName(e.target.value)} />
          <input className="email-field" type="email" placeholder="Your email address" value={email} onChange={e => setEmail(e.target.value)} />
          <button className="email-submit" onClick={handleSubmit} disabled={sending}>
            {sending ? 'Sending…' : 'Send Me the Guide →'}
          </button>
          <div className="popup-no" onClick={close}>No thanks, I'll figure it out myself</div>
        </div>
      </div>
    </div>
  );
}
