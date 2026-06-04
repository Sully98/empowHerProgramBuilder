import { useState } from 'react';

interface EmailSignupProps {
  showToast: (msg: string) => void;
}

function saveSubscriber(name: string, email: string) {
  const subs = JSON.parse(localStorage.getItem('empowher_subs') || '[]');
  if (!subs.find((s: { email: string }) => s.email === email)) {
    subs.push({ name, email, date: new Date().toISOString() });
    localStorage.setItem('empowher_subs', JSON.stringify(subs));
  }
}

export function EmailSignup({ showToast }: EmailSignupProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!email || !email.includes('@')) { showToast('Please enter a valid email'); return; }
    saveSubscriber(name.trim(), email.trim());
    setSubmitted(true);
  };

  return (
    <div className="email-sec" id="signup">
      <div className="email-left">
        <div className="ltag">Stay in the loop</div>
        <h2 className="email-h">Training tips,<br /><em>straight to you.</em></h2>
        <p className="email-p">Join the EmpowHER Strength community. Get weekly evidence-based training tips, new program templates, and be first to know when new features drop — no spam, ever.</p>
        <div className="email-perks">
          <div className="email-perk"><span className="email-perk-dot"></span>Weekly training tips from Melody</div>
          <div className="email-perk"><span className="email-perk-dot"></span>Free program templates straight to your inbox</div>
          <div className="email-perk"><span className="email-perk-dot"></span>Early access to new builder features</div>
          <div className="email-perk"><span className="email-perk-dot"></span>Research breakdowns in plain English</div>
        </div>
      </div>
      <div className="email-right">
        {!submitted ? (
          <div className="email-form">
            <input className="email-field" type="text" placeholder="Your first name" value={name} onChange={e => setName(e.target.value)} />
            <input className="email-field" type="email" placeholder="Your email address" value={email} onChange={e => setEmail(e.target.value)} />
            <button className="email-submit" onClick={handleSubmit}>Get Weekly Tips →</button>
            <div className="email-note">No spam. Unsubscribe any time. We respect your inbox.</div>
          </div>
        ) : (
          <div className="email-success show">
            <div className="email-success-h">You're in! 🎉</div>
            <div className="email-success-p">Welcome to EmpowHER Strength. Check your inbox for a welcome note from Melody.</div>
          </div>
        )}
      </div>
    </div>
  );
}

export { saveSubscriber };
