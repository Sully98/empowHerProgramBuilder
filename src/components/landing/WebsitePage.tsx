import '../../landing-v5.css';

interface WebsitePageProps {
  onOpenProgramBuilder: () => void;
}

const TICKER_ITEMS = [
  'Stronger. Not smaller.',
  'Form first · always',
  'Real strength for real women',
  'No pseudoscience · no BS',
  'Personalized · evidence-based',
  "Women's health advocates",
  'Geneva + Online worldwide',
  'From intimidated to confident',
  'Not toned · strong',
];

export function WebsitePage({ onOpenProgramBuilder }: WebsitePageProps) {
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div id="landing">

      {/* ── NAV ── */}
      <nav className="ln-nav">
        <button
          className="ln-nav-logo"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          Empower<em>HER</em> Strength
        </button>
        <div className="ln-nav-links">
          <a href="#about">About</a>
          <a href="#programs">Work with us</a>
          <a href="#guide">Free Guide</a>
          <button className="ln-nav-builder" onClick={onOpenProgramBuilder}>Program Builder</button>
          <button className="ln-nav-pill" onClick={() => scrollTo('programs')}>Start Here →</button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="ln-hero">
        <div className="ln-hero-left">
          <div className="ln-hero-eyebrow">
            <div className="ln-hero-eyebrow-line" />
            <div className="ln-hero-eyebrow-text">EmpowHER Strength LLC</div>
          </div>
          <p className="ln-hero-pre">EmpowHER Strength</p>
          <h1 className="ln-hero-h">
            Stronger.
            <span className="accent">Not smaller.</span>
          </h1>
          <div className="ln-hero-rule">
            <div className="ln-hero-rule-line" />
            <div className="ln-hero-rule-text">strength training for women</div>
            <div className="ln-hero-rule-line" />
          </div>
          <div className="ln-hero-sub">
            <p>For the woman who wants to get stronger but doesn't know where to start.</p>
            <p>For the woman who feels intimidated walking into the gym. The one who's worried she's using the wrong weight, performing exercises incorrectly, or simply has no idea where to begin.</p>
            <p>We're here for you.</p>
            <p><strong>At EmpowHER Strength, Coach Mel and Coach Courtney teach you how to lift with proper form, build genuine confidence, and become truly strong—without the confusion or intimidation.</strong></p>
            <p>Our beginner-friendly programs are designed around your body, your goals, and your pace. You'll get expert coaching, evidence-based women's health education, and clear explanations that help you understand why you're doing what you're doing—not just what to do.</p>
            <p>Because confidence doesn't come from guessing.</p>
            <p>It comes from learning, growing, and realizing you're capable of far more than you ever imagined.</p>
          </div>
          <p style={{ fontFamily: 'var(--serif)', fontSize: '18px', fontStyle: 'italic', fontWeight: 300, color: 'var(--faint)', lineHeight: 1.6, maxWidth: '440px', marginBottom: '32px' }}>
            "We had to figure it out on our own. You shouldn't have to."
          </p>
          <div className="ln-hero-btns">
            <button className="ln-btn ln-btn-teal" onClick={() => scrollTo('programs')}>Start Here →</button>
            <button className="ln-btn ln-btn-gold" onClick={() => scrollTo('guide')}>Get the Free Guide</button>
            <button className="ln-btn ln-btn-ghost" onClick={onOpenProgramBuilder}>Program Builder</button>
          </div>
        </div>

        <div className="ln-hero-right">
          <div className="ln-hero-right-bg" />
          <div className="ln-hero-right-content">
            <div className="ln-hero-stat">
              <div className="ln-hs-num">Strong<em>HER</em></div>
              <div className="ln-hs-label">Build real, functional strength</div>
              <div className="ln-hs-sub">Progressive, structured lifting that builds muscle, improves performance, and makes everyday life feel easier</div>
            </div>
            <div className="ln-hero-stat">
              <div className="ln-hs-num">Smart<em>HER</em></div>
              <div className="ln-hs-label">Understand your training and your body</div>
              <div className="ln-hs-sub">We cut through the noise, debunk the misinformation, and teach you what the research actually says about women and strength</div>
            </div>
            <div className="ln-hero-stat">
              <div className="ln-hs-num">Bold<em>HER</em></div>
              <div className="ln-hs-label">Build confidence that lasts</div>
              <div className="ln-hs-sub">From intimidated to walking into any gym knowing exactly what you're doing and actually enjoying it</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── IS THIS YOU ── */}
      <section className="ln-section alt">
        <div className="ln-inner">
          <div className="ln-eyebrow">
            <div className="ln-eyebrow-line" />
            <div className="ln-eyebrow-text">Have you ever felt like this?</div>
          </div>
          <div className="ln-section-h" style={{ marginBottom: '16px' }}>
            We interviewed women just like you.<br />Here's what they <em>told us.</em>
          </div>
          <p style={{ fontSize: '15px', fontWeight: 300, color: 'var(--muted)', lineHeight: 1.9, maxWidth: '640px', marginBottom: '48px' }}>
            We asked women about their relationship with the gym and strength training. The same things came up over and over again.
          </p>

          <div className="ln-iy-hero-card">
            <div className="ln-iy-hero-num">"</div>
            <div>
              <div className="ln-iy-hero-q">I don't know what to do. I pick up a weight, put it back down, and leave feeling like I wasted my time.</div>
              <div className="ln-iy-hero-body">This was the most common thing women told us. Not laziness. Not lack of motivation. Just not knowing, and not having anyone to show them. <strong>That's exactly the gap we fill.</strong></div>
            </div>
          </div>

          <div className="ln-iy-grid" style={{ marginTop: '3px' }}>
            <div className="ln-iy-card">
              <div className="ln-iy-card-n">"</div>
              <div className="ln-iy-card-q">I feel like everyone is watching me and I'm going to do something wrong.</div>
              <div className="ln-iy-card-d">That feeling is real and incredibly common, especially in a space that has historically not been built for women. You are not imagining it. And you are not alone.</div>
            </div>
            <div className="ln-iy-card">
              <div className="ln-iy-card-n">"</div>
              <div className="ln-iy-card-q">I've been doing cardio and classes for years but I know I should be lifting. I just don't know how.</div>
              <div className="ln-iy-card-d">You are already active. You already show up. You just need someone to teach you the other half, properly, in a way that actually makes sense.</div>
            </div>
            <div className="ln-iy-card">
              <div className="ln-iy-card-n">"</div>
              <div className="ln-iy-card-q">There's so much information online and I don't know what's actually true.</div>
              <div className="ln-iy-card-d">Peptides. Toning programs. Skinny trends. The fitness industry constantly lies to women. We stay on top of the research so you don't have to.</div>
            </div>
            <div className="ln-iy-card">
              <div className="ln-iy-card-n">"</div>
              <div className="ln-iy-card-q">I want to feel strong. Not just look a certain way. Actually feel strong.</div>
              <div className="ln-iy-card-d">That is exactly what we build. Real functional strength that shows up in the gym, in your sport, and in your everyday life.</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHAT WE OFFER ── */}
      <section className="ln-section" id="about">
        <div className="ln-inner">
          <div className="ln-approach-wrap">
            <div>
              <div className="ln-eyebrow">
                <div className="ln-eyebrow-line" />
                <div className="ln-eyebrow-text">What we offer</div>
              </div>
              <div className="ln-section-h" style={{ marginBottom: '20px' }}>
                Three things.<br />Every <em>single</em> time.
              </div>
              <p style={{ fontSize: '15px', fontWeight: 300, color: 'var(--muted)', lineHeight: 1.9, marginBottom: '40px' }}>
                Every program, every session, every piece of feedback we give is built around these three things. Nothing more, nothing less.
              </p>
              <div className="ln-pillar">
                <div className="ln-pillar-num">01</div>
                <div>
                  <div className="ln-pillar-title">Strong<span className="hl">HER</span></div>
                  <div className="ln-pillar-body">Progressive, structured lifting built around your specific goals. Not a generic plan. A real program that gets harder in the right ways so you are always moving forward and always know exactly why.</div>
                </div>
              </div>
              <div className="ln-pillar">
                <div className="ln-pillar-num">02</div>
                <div>
                  <div className="ln-pillar-title">Smart<span className="hl">HER</span></div>
                  <div className="ln-pillar-body">We explain everything. Every exercise, every rep range, every reason. We stay on top of the latest research, debunk the misinformation, and keep you informed about women's health and fitness.</div>
                </div>
              </div>
              <div className="ln-pillar">
                <div className="ln-pillar-num">03</div>
                <div>
                  <div className="ln-pillar-title">Bold<span className="hl">HER</span></div>
                  <div className="ln-pillar-body">When you know you are moving correctly, everything changes. The gym stops being intimidating. You stop second-guessing yourself. Lifting becomes something you actually look forward to.</div>
                </div>
              </div>
            </div>
            <div>
              <div className="ln-quote-block">
                <div className="ln-quote-text">"Their sole focus is helping their clients feel strong and confident. Before jumping into a workout routine, they put effort into understanding your cognitive process. That is what leads to long-term results."</div>
                <div className="ln-quote-attr">- Daniella, EmpowHER client</div>
              </div>
              <div className="ln-quote-block">
                <div className="ln-quote-text">"I had never seen myself as a gym person. I gained the confidence that over time, with good instruction and patience, I can see progress."</div>
                <div className="ln-quote-attr">- Carlotta, EmpowHER client</div>
              </div>
              <div className="ln-quote-block" style={{ borderColor: 'var(--teal)' }}>
                <div className="ln-quote-text">"It is no way I would have come to the gym otherwise. I know it is doing me good so I am grateful."</div>
                <div className="ln-quote-attr">- CERN client</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PROGRAMS ── */}
      <section className="ln-section alt" id="programs">
        <div className="ln-inner">
          <div className="ln-eyebrow">
            <div className="ln-eyebrow-line" />
            <div className="ln-eyebrow-text">Work with us</div>
          </div>
          <div className="ln-section-h" style={{ marginBottom: '12px' }}>
            Start where<br />you <em>are.</em>
          </div>
          <p className="ln-section-lead">Free to get started. Deeper when you are ready. Every option moves you in the same direction.</p>

          <div className="ln-prog-grid">
            <div className="ln-prog-card">
              <div className="ln-prog-card-bg">$0</div>
              <span className="ln-prog-tag ln-tag-free">Free</span>
              <div className="ln-prog-name">The Guide</div>
              <div className="ln-prog-price">$0</div>
              <div className="ln-prog-tagline">Everything you were never taught, in one place.</div>
              <p className="ln-prog-desc">26 pages. No fluff. Myths debunked, form basics explained, progressive overload made simple. A clear picture of what to do when you walk into the gym.</p>
              <div className="ln-prog-includes">
                <div className="ln-prog-inc">The 6 biggest lifting myths debunked</div>
                <div className="ln-prog-inc">How to choose weights, reps and sets</div>
                <div className="ln-prog-inc">Progressive overload in plain English</div>
                <div className="ln-prog-inc">Form basics and how to self-assess</div>
                <div className="ln-prog-inc">Balancing lifting, cardio and real life</div>
              </div>
              <button className="ln-btn ln-btn-ghost" style={{ width: '100%', textAlign: 'center' }} onClick={() => scrollTo('guide')}>Download Free</button>
            </div>

            <div className="ln-prog-card featured">
              <div className="ln-prog-card-bg">FF</div>
              <span className="ln-prog-tag ln-tag-pop">Most popular</span>
              <div className="ln-prog-name">Form Foundations</div>
              <div className="ln-prog-price">$150 <sub>$25/wk</sub></div>
              <div className="ln-prog-tagline">Stop wondering if you're doing it right. Know.</div>
              <p className="ln-prog-desc">6 weeks of real coaching via WhatsApp. You film yourself, we watch and give you honest, specific feedback on your movement. What to fix, why it matters, how to feel it working.</p>
              <div className="ln-prog-includes">
                <div className="ln-prog-inc">Choose a movement focus every 2 weeks</div>
                <div className="ln-prog-inc">Personalized video feedback from a real coach</div>
                <div className="ln-prog-inc">Works for squat, deadlift, bench, OHP and more</div>
                <div className="ln-prog-inc">Klarna available, money-back guarantee</div>
              </div>
              <a href="mailto:melody@empowherstrength.com" className="ln-btn ln-btn-teal" style={{ width: '100%', textAlign: 'center' }}>Start Form Foundations</a>
            </div>

            <div className="ln-prog-card">
              <div className="ln-prog-card-bg">OC</div>
              <span className="ln-prog-tag ln-tag-full">Full Coaching</span>
              <div className="ln-prog-name">Online Coaching</div>
              <div className="ln-prog-price">$400 <sub>$67/wk</sub></div>
              <div className="ln-prog-tagline">A real coach who knows you, built around your life.</div>
              <p className="ln-prog-desc">Custom programming, weekly check-ins, direct access to us. For women who want more than a plan. A coach who adjusts as you grow and is genuinely invested in your results.</p>
              <div className="ln-prog-includes">
                <div className="ln-prog-inc">Custom 6-week program for your goals</div>
                <div className="ln-prog-inc">Initial consultation, we learn you first</div>
                <div className="ln-prog-inc">Weekly form check-ins and adjustments</div>
                <div className="ln-prog-inc">24-hour response guarantee, money-back</div>
              </div>
              <a href="mailto:courtney@empowherstrength.com" className="ln-btn ln-btn-ghost" style={{ width: '100%', textAlign: 'center' }}>Start Online Coaching</a>
            </div>
          </div>

          {/* Program Builder CTA */}
          <div className="ln-builder-card">
            <div className="ln-builder-card-left">
              <div className="ln-builder-tag">Free tool · included with account</div>
              <div className="ln-builder-title">
                Build your own<br /><em>program.</em>
              </div>
              <p className="ln-builder-desc">
                Our free Program Builder lets you create a custom training plan — choose your goal, your split, and your equipment. Generate a personalized week, log your workouts, and track progress over time.
              </p>
            </div>
            <div className="ln-builder-btns">
              <button className="ln-btn ln-btn-teal" onClick={() => window.open('/program-builder', '_blank')}>Open Program Builder →</button>
            </div>
          </div>
        </div>
      </section>

      {/* ── COACHES ── */}
      <section className="ln-section dark">
        <div className="ln-inner">
          <div className="ln-eyebrow">
            <div className="ln-eyebrow-line" />
            <div className="ln-eyebrow-text">Meet your coaches</div>
          </div>
          <div className="ln-section-h" style={{ marginBottom: '12px' }}>
            We have been where<br />you <em>are.</em>
          </div>
          <p className="ln-section-lead">We are not influencers. We do not sell supplements. We figured out strength training ourselves and built EmpowHER Strength so other women would not have to take as long as we did.</p>
          <div className="ln-coaches-grid">
            <div className="ln-coach-card">
              <div className="ln-coach-overline">Geneva, Switzerland · In-person and Online</div>
              <div className="ln-coach-name">Coach Mel</div>
              <div className="ln-coach-location">NASM CPT, Master's in Behavior Science</div>
              <p className="ln-coach-bio">
                Mel is a lifelong martial artist who came to strength training after years of dealing with recurring issues from sparring. Strength training did not just change her physically. <strong>It completely changed what she believed her body was capable of.</strong>
                <br /><br />
                She coaches in-person in Geneva and founded the first women's powerlifting class at CERN, teaching dozens of women how to lift, progress, and build real confidence in the weight room.
              </p>
              <div className="ln-coach-creds">
                <div className="ln-coach-cred">NASM Certified Personal Trainer</div>
                <div className="ln-coach-cred">Master's in Applied Behavior Science</div>
                <div className="ln-coach-cred">5+ years Brazilian Jiu Jitsu</div>
                <div className="ln-coach-cred">Coached athletes ages 3 to 70</div>
              </div>
            </div>
            <div className="ln-coach-card">
              <div className="ln-coach-overline">United States · Online</div>
              <div className="ln-coach-name">Coach Courtney</div>
              <div className="ln-coach-location">NASM CPT, Board Certified in Behavior Science</div>
              <p className="ln-coach-bio">
                Courtney is a former competitive gymnast who trained for 18 years before moving into endurance sports, where she quickly realized that more cardio was not the answer. <strong>Smarter, structured strength training was.</strong>
                <br /><br />
                Her background in behavior science means she understands not just how to build a great program, but why people follow through long term, and what to do when they do not.
              </p>
              <div className="ln-coach-creds">
                <div className="ln-coach-cred">NASM Certified Personal Trainer</div>
                <div className="ln-coach-cred">Board Certified in Behavior Science</div>
                <div className="ln-coach-cred">Master's in Applied Behavior Analysis</div>
                <div className="ln-coach-cred">18 years competitive gymnastics</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="ln-section alt">
        <div className="ln-inner">
          <div className="ln-eyebrow">
            <div className="ln-eyebrow-line" />
            <div className="ln-eyebrow-text">Real women, real results</div>
          </div>
          <div className="ln-section-h gold" style={{ marginBottom: '48px' }}>
            What it feels like<br />to finally get <em>strong.</em>
          </div>
          <div className="ln-testi-intro">
            <div className="ln-testi-featured">
              <div className="qt">"Their sole focus is helping their clients feel strong and confident. <strong>Helping me change my thoughts and relationship with the gym has helped immensely.</strong>"</div>
              <div className="qa">- Daniella</div>
            </div>
            <div className="ln-testi-number-panel">
              <div>
                <div className="ln-tn-n">225</div>
                <div className="ln-tn-l">lb deadlift. Isabelle went from never lifting to competition weight.</div>
              </div>
              <div>
                <div className="ln-tn-n">185</div>
                <div className="ln-tn-l">lb squat. Same client. "Once felt completely unattainable."</div>
              </div>
            </div>
          </div>
          <div className="ln-testi-grid" style={{ marginTop: '3px' }}>
            <div className="ln-tcard">
              <div className="ln-tcard-stars">★★★★★</div>
              <p className="ln-tcard-q">"Courtney helped me hit strength goals I never thought possible. <strong>Weights that once felt completely unattainable.</strong> The confidence boost was everything."</p>
              <div className="ln-tcard-a">- Isabelle</div>
            </div>
            <div className="ln-tcard">
              <div className="ln-tcard-stars">★★★★★</div>
              <p className="ln-tcard-q">"I had never seen myself as a gym person. <strong>I gained the confidence that over time, with good instruction, I can see progress.</strong>"</p>
              <div className="ln-tcard-a">- Carlotta</div>
            </div>
            <div className="ln-tcard">
              <div className="ln-tcard-stars">★★★★★</div>
              <p className="ln-tcard-q">"Don't underestimate the effect that weightlifting can have. <strong>Mel challenges you but also respects your limits.</strong>"</p>
              <div className="ln-tcard-a">- Milou</div>
            </div>
            <div className="ln-tcard">
              <div className="ln-tcard-stars">★★★★★</div>
              <p className="ln-tcard-q">"<strong>The perfect mix of caring and badass.</strong> I cannot imagine better coaches."</p>
              <div className="ln-tcard-a">- Claudia</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FREE GUIDE ── */}
      <section className="ln-section dark" id="guide">
        <div className="ln-inner">
          <div className="ln-guide-grid">
            <div>
              <div className="ln-eyebrow gold">
                <div className="ln-eyebrow-line" />
                <div className="ln-eyebrow-text">Free resource</div>
              </div>
              <div className="ln-section-h gold" style={{ marginBottom: '20px' }}>
                We had to figure it<br />out on our own. <em>You don't.</em>
              </div>
              <p style={{ fontSize: '15px', fontWeight: 300, color: 'var(--muted)', lineHeight: 1.9, marginBottom: '14px' }}>
                26 pages of everything I wish someone had told me when I started. Myths debunked. Form basics. Progressive overload explained. How to structure your week and actually understand what you are doing.
              </p>
              <p style={{ fontSize: '15px', fontWeight: 300, color: 'var(--muted)', lineHeight: 1.9, marginBottom: '36px' }}>
                <strong style={{ color: 'var(--warm)', fontWeight: 400 }}>Read it once. Use it forever.</strong>
              </p>
              <a href="mailto:melody@empowherstrength.com?subject=Free Guide Request" className="ln-btn ln-btn-gold">Get the Free Guide</a>
            </div>
            <div>
              <div style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '20px' }}>What's inside</div>
              <div className="ln-guide-chapter-list">
                {[
                  "The 6 biggest myths about women and lifting, debunked",
                  "How to structure your training week and rest days",
                  "What weight to use and when to go heavier",
                  "Progressive overload explained simply",
                  "Building an effective workout from scratch",
                  "Free weights vs. machines, what actually matters",
                  "Form, intensity, and mind-muscle connection",
                  "Warm-up, recovery, and what the research actually says",
                  "Balancing lifting, cardio, and your real life",
                ].map((chapter, i) => (
                  <div className="ln-gc" key={i}>
                    <div className="ln-gc-n">{String(i + 1).padStart(2, '0')}</div>
                    <div className="ln-gc-title">{chapter}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="ln-fcta">
        <div className="ln-fcta-glow" />
        <h2 className="ln-fcta-h">
          Still not sure?
          <em>Just send us an email.</em>
        </h2>
        <p className="ln-fcta-sub">No pressure. No sales pitch. Tell us where you are and what you are looking for. We will tell you honestly what we think will help most.</p>
        <div className="ln-fcta-btns">
          <a href="mailto:melody@empowherstrength.com" className="ln-btn ln-btn-teal">Email Mel</a>
          <a href="mailto:courtney@empowherstrength.com" className="ln-btn ln-btn-teal">Email Courtney</a>
          <button className="ln-btn ln-btn-ghost" onClick={onOpenProgramBuilder}>Try the Program Builder</button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="ln-footer">
        <div className="ln-footer-brand">Empower<em>HER</em> Strength LLC</div>
        <div className="ln-footer-links">
          <a href="#about">About</a>
          <a href="#programs">Work with us</a>
          <a href="#guide">Free Guide</a>
          <button onClick={onOpenProgramBuilder}>Program Builder</button>
          <a href="mailto:melody@empowherstrength.com">Contact</a>
        </div>
        <div className="ln-footer-contact">
          melody@empowherstrength.com<br />
          courtney@empowherstrength.com<br />
          @empowher_strength
        </div>
      </footer>

    </div>
  );
}
