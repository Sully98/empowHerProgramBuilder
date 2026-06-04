import { useEffect, useRef, useState } from 'react';
import { saveSubscriber } from '../landing/EmailSignup';

interface EmailPopupProps {
  showToast: (msg: string) => void;
}

export function EmailPopup({ showToast }: EmailPopupProps) {
  const [visible, setVisible] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
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

  const close = () => {
    setVisible(false);
    localStorage.setItem('empowher_popup_dismissed', 'true');
  };

  const handleSubmit = () => {
    if (!email || !email.includes('@')) { showToast('Please enter a valid email'); return; }
    saveSubscriber(name.trim(), email.trim());
    close();
    showToast('Welcome to EmpowHER Strength! 🎉');
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
        <h2 className="popup-h">Want a free<br /><em>starter program?</em></h2>
        <p className="popup-p">Drop your email and we'll send you a ready-to-use beginner program — built right here in the builder — plus weekly training tips from Melody, straight to your inbox.</p>
        <div className="popup-form">
          <input className="email-field" type="text" placeholder="Your first name" value={name} onChange={e => setName(e.target.value)} />
          <input className="email-field" type="email" placeholder="Your email address" value={email} onChange={e => setEmail(e.target.value)} />
          <button className="email-submit" onClick={handleSubmit}>Send Me the Program →</button>
          <div className="popup-no" onClick={close}>No thanks, I'll figure it out myself</div>
        </div>
      </div>
    </div>
  );
}
