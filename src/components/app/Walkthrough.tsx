import { useEffect, useState } from 'react';

interface TourStep {
  target?: string;
  title: string;
  body: string;
}

const STEPS: TourStep[] = [
  {
    title: 'Welcome to the Program Builder',
    body: "Let's walk through the basics. Building a full training program only takes a few steps — this will take about a minute.",
  },
  {
    target: '#sb-split',
    title: '1. Pick a Training Split',
    body: 'Choose how training days are organized across the week — Upper/Lower, Full Body, Bro Split, or Every Other Day.',
  },
  {
    target: '#sb-goal',
    title: '2. Choose a Goal',
    body: 'Hypertrophy, strength, power, or endurance. This shapes rep ranges and how the program progresses week to week.',
  },
  {
    target: '#sb-block',
    title: '3. Set Block Length',
    body: 'Decide how many weeks the training block runs, and whether to add a deload week at the end.',
  },
  {
    target: '#sb-overload',
    title: '4. Progressive Overload',
    body: 'Pick how the program should progress each week — more weight, more reps, etc. — then hit Generate Plan.',
  },
  {
    target: '#sb-equipment',
    title: '5. Available Equipment',
    body: "Tell us what's available. Exercises that need equipment you don't have get grayed out in the library below.",
  },
  {
    target: '#sb-exlibrary',
    title: '6. Exercise Library',
    body: 'Search or browse by muscle group, then drag any exercise onto a day on the right to add it to your program.',
  },
  {
    target: '#days-grid',
    title: 'Your Training Days',
    body: 'This is where it comes together. Drop exercises here, click a day to mark it a rest day, and edit sets/reps/weight inline.',
  },
  {
    target: '#prog-title',
    title: 'Name Your Program',
    body: "Give it a name so you can find it again later — it's saved along with everything else.",
  },
  {
    target: '#hdr-save',
    title: 'Save, Export, Print',
    body: 'Save anytime. When it\'s ready, export to XLSX or print a clean PDF to hand off or take to the gym.',
  },
];

interface WalkthroughProps {
  onFinish: () => void;
}

export function Walkthrough({ onFinish }: WalkthroughProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);

  const step = STEPS[stepIndex];
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === STEPS.length - 1;

  useEffect(() => {
    if (!step.target) { setRect(null); return; }

    const el = document.querySelector(step.target);
    if (!el) { setRect(null); return; }

    el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });

    const update = () => setRect(el.getBoundingClientRect());
    update();
    const raf = requestAnimationFrame(update);
    const timer = setTimeout(update, 350); // after scroll settles

    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [stepIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onFinish();
      if (e.key === 'ArrowRight' && !isLast) setStepIndex(i => i + 1);
      if (e.key === 'ArrowLeft' && !isFirst) setStepIndex(i => i - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isFirst, isLast, onFinish]);

  const PAD = 8;
  const spotStyle = rect ? {
    top: rect.top - PAD,
    left: rect.left - PAD,
    width: rect.width + PAD * 2,
    height: rect.height + PAD * 2,
  } : null;

  // Position tooltip near the spotlight, clamped to viewport; centered when there's no target.
  let tipStyle: React.CSSProperties;
  if (spotStyle) {
    const TIP_W = 320;
    const spaceBelow = window.innerHeight - (spotStyle.top + spotStyle.height);
    const placeBelow = spaceBelow > 180 || spotStyle.top < 180;
    const top = placeBelow ? spotStyle.top + spotStyle.height + 14 : undefined;
    const bottom = !placeBelow ? window.innerHeight - spotStyle.top + 14 : undefined;
    const left = Math.min(Math.max(spotStyle.left, 16), window.innerWidth - TIP_W - 16);
    tipStyle = { position: 'fixed', top, bottom, left, width: TIP_W };
  } else {
    tipStyle = { position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 340 };
  }

  return (
    <div className="wt-overlay" style={{ background: spotStyle ? 'transparent' : 'rgba(10,10,10,.78)' }}>
      {spotStyle && <div className="wt-spot" style={spotStyle} />}
      <div className="wt-tip" style={tipStyle}>
        <div className="wt-tip-hdr">
          <span className="wt-tip-step">{stepIndex + 1} / {STEPS.length}</span>
          <button className="wt-tip-close" onClick={onFinish} aria-label="Close walkthrough">✕</button>
        </div>
        <div className="wt-tip-title">{step.title}</div>
        <div className="wt-tip-body">{step.body}</div>
        <div className="wt-tip-nav">
          <button className="btn btn-ghost btn-sm" onClick={onFinish}>Skip</button>
          <div style={{ display: 'flex', gap: '8px' }}>
            {!isFirst && (
              <button className="btn btn-ghost btn-sm" onClick={() => setStepIndex(i => i - 1)}>← Back</button>
            )}
            {isLast ? (
              <button className="btn btn-primary btn-sm" onClick={onFinish}>Done</button>
            ) : (
              <button className="btn btn-primary btn-sm" onClick={() => setStepIndex(i => i + 1)}>Next →</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
