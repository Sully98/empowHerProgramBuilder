import { useRef } from 'react';
import type { User } from '@supabase/supabase-js';
import { CtaSection } from './CtaSection';
import { EmailSignup } from './EmailSignup';
import { Hero } from './Hero';
import { HowItWorks } from './HowItWorks';
import { MissionSection } from './MissionSection';
import { MissionStrip } from './MissionStrip';
import { QuizSection } from './QuizSection';
import { ResearchSection } from './ResearchSection';
import { SiteFooter } from './SiteFooter';
import { SocialBar } from './SocialBar';
import type { GoalKey, SplitKey } from '../../data/types';

interface LandingPageProps {
  user: User | null;
  onOpenApp: () => void;
  onGoToAuth: () => void;
  onGoToDashboard: () => void;
  onOpenAppWithGoal: (goal: GoalKey, split: SplitKey) => void;
  onGoToWebsite: () => void;
  showToast: (msg: string) => void;
}

export function LandingPage({ user, onOpenApp, onGoToAuth, onGoToDashboard, onOpenAppWithGoal, onGoToWebsite, showToast }: LandingPageProps) {
  const missionRef = useRef<HTMLDivElement>(null);

  const scrollToMission = () => missionRef.current?.scrollIntoView({ behavior: 'smooth' });
  const scrollToSignup  = () => document.getElementById('signup')?.scrollIntoView({ behavior: 'smooth' });
  const scrollToQuiz    = () => document.getElementById('quiz-sec')?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div id="landing">
      {/* Top nav */}
      <div className="landing-nav">
        <button className="ln-brand" onClick={onGoToWebsite} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Empower<em>HER</em> Strength</button>
        <div className="ln-actions">
          <button className="btn btn-ghost btn-sm" onClick={scrollToQuiz}>Take the Quiz →</button>
          {user ? (
            <button className="btn btn-ghost btn-sm" onClick={onGoToDashboard}>My Dashboard</button>
          ) : (
            <button className="btn btn-ghost btn-sm" onClick={onGoToAuth}>Log In</button>
          )}
        </div>
      </div>

      <Hero onOpenApp={onOpenApp} onScrollToMission={scrollToMission} />
      <MissionStrip />
      <MissionSection sectionRef={missionRef} />
      <HowItWorks />
      <QuizSection onResult={onOpenAppWithGoal} isLoggedIn={!!user} />
      <ResearchSection />
      <EmailSignup showToast={showToast} />
      <SocialBar />
      <CtaSection onOpenApp={onOpenApp} />
      <SiteFooter />

      {/* Used by AppSocialBanner "Get Weekly Tips" */}
      <span id="signup-anchor" style={{ display: 'none' }} onClick={scrollToSignup} />
    </div>
  );
}
