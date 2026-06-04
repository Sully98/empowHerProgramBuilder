const STEPS = [
  { n: '01', t: 'Pick Your Split',       d: 'Upper/Lower, Full Body, Bro Split, or Every Other Day. Your training week is laid out automatically.' },
  { n: '02', t: 'Choose Your Goal',      d: 'Power, Strength, Hypertrophy, or Endurance — each one sets research-backed rep ranges and volume targets.' },
  { n: '03', t: 'Set Block Length',      d: 'Type any number of weeks for your training block. A deload week is automatically added at the end.' },
  { n: '04', t: 'Pick Overload Methods', d: 'Choose from 7 evidence-based progressive overload types — or combine them. The builder generates your week-by-week plan.' },
  { n: '05', t: 'Drag Your Exercises',   d: 'Open any muscle group and drag exercises onto your days. Every exercise includes equipment alternatives.' },
  { n: '06', t: 'Check Your Volume',     d: 'The volume tracker shows weekly sets per muscle group and flags anything below the recommended minimum for your goal.' },
  { n: '07', t: 'Print & Go',            d: 'Hit Print PDF — your full program plus a week-by-week progression table prints ready to use at the gym.' },
];

export function HowItWorks() {
  return (
    <div className="lsec alt" id="how">
      <div className="ltag">How It Works</div>
      <h2 className="lh2">Seven steps to your <em>program.</em></h2>
      <div className="how-grid">
        {STEPS.map(s => (
          <div key={s.n} className="how-card">
            <div className="how-n">{s.n}</div>
            <div className="how-t">{s.t}</div>
            <div className="how-d">{s.d}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
