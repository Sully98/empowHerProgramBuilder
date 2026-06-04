import { useRef } from 'react';
import type { User } from '@supabase/supabase-js';
import { CtaSection } from './CtaSection';
import { EmailSignup } from './EmailSignup';
import { Hero } from './Hero';
import { HowItWorks } from './HowItWorks';
import { MissionSection } from './MissionSection';
import { MissionStrip } from './MissionStrip';
import { ResearchSection } from './ResearchSection';
import { SiteFooter } from './SiteFooter';
import { SocialBar } from './SocialBar';

interface LandingPageProps {
  user: User | null;
  onOpenApp: () => void;
  onGoToAuth: () => void;
  onGoToDashboard: () => void;
  showToast: (msg: string) => void;
}

export function LandingPage({ user, onOpenApp, onGoToAuth, onGoToDashboard, showToast }: LandingPageProps) {
  const missionRef = useRef<HTMLDivElement>(null);

  const scrollToMission = () => missionRef.current?.scrollIntoView({ behavior: 'smooth' });
  const scrollToSignup  = () => document.getElementById('signup')?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div id="landing">
      {/* Top nav */}
      <div className="landing-nav">
        <div className="ln-brand">Empower<em>HER</em> Strength</div>
        <div className="ln-actions">
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
