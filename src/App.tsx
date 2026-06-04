import { useCallback, useEffect, useRef, useState } from 'react';
import { AuthPage } from './components/auth/AuthPage';
import { DashboardPage } from './components/dashboard/DashboardPage';
import { AppShell } from './components/app/AppShell';
import { LandingPage } from './components/landing/LandingPage';
import { EmailPopup } from './components/shared/EmailPopup';
import { Toast } from './components/shared/Toast';
import { useAuth } from './hooks/useAuth';
import type { SavedProgram } from './data/types';

type View = 'landing' | 'auth' | 'dashboard' | 'app';

export default function App() {
  const { user, loading, signIn, signUp, signOut } = useAuth();
  const [view, setView] = useState<View>('landing');
  const [loadedProgram, setLoadedProgram] = useState<SavedProgram | null>(null);

  // Where to send the user after a successful login
  const postAuthDest = useRef<'dashboard' | 'app'>('dashboard');

  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToastMsg(msg);
    setToastVisible(true);
    toastTimer.current = setTimeout(() => setToastVisible(false), 2200);
  }, []);

  // When Supabase updates the session (login / token refresh), navigate out of auth
  useEffect(() => {
    if (user && view === 'auth') {
      setView(postAuthDest.current);
      window.scrollTo(0, 0);
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  // Builder requires auth — redirect unauthenticated visitors away
  useEffect(() => {
    if (!loading && !user && view === 'app') {
      postAuthDest.current = 'app';
      setView('auth');
      window.scrollTo(0, 0);
    }
  }, [user, loading, view]);

  const goToAuth = (dest: 'dashboard' | 'app' = 'dashboard') => {
    postAuthDest.current = dest;
    setView('auth');
    window.scrollTo(0, 0);
  };

  const openApp = () => {
    if (!user) { goToAuth('app'); return; }
    setLoadedProgram(null);
    setView('app');
    window.scrollTo(0, 0);
  };

  const openLanding   = () => { setView('landing');   window.scrollTo(0, 0); };
  const openDashboard = () => { setView('dashboard'); window.scrollTo(0, 0); };

  const handleLoadProgram = (p: SavedProgram) => {
    setLoadedProgram(p);
    setView('app');
    window.scrollTo(0, 0);
  };

  const handleSignOut = async () => {
    await signOut();
    setView('landing');
  };

  const scrollToSignup = () => {
    setView('landing');
    window.scrollTo(0, 0);
    setTimeout(() => document.getElementById('signup')?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg)' }}>
        <div style={{ fontFamily: "'DM Mono',monospace", fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--muted)' }}>
          Loading…
        </div>
      </div>
    );
  }

  return (
    <>
      {view === 'landing' && (
        <LandingPage
          user={user}
          onOpenApp={user ? openDashboard : () => goToAuth('dashboard')}
          onGoToAuth={() => goToAuth('dashboard')}
          onGoToDashboard={openDashboard}
          showToast={showToast}
        />
      )}

      {view === 'auth' && (
        <AuthPage
          onSignIn={signIn}
          onSignUp={signUp}
          onBack={openLanding}
        />
      )}

      {view === 'dashboard' && user && (
        <DashboardPage
          user={user}
          onNewProgram={openApp}
          onLoadProgram={handleLoadProgram}
          onGoToLanding={openLanding}
          onSignOut={handleSignOut}
        />
      )}

      {view === 'app' && user && (
        <AppShell
          key={loadedProgram?.id ?? 'new'}
          user={user}
          loadedProgram={loadedProgram}
          onCloseApp={openDashboard}
          onGoToDashboard={openDashboard}
          onGetWeeklyTips={scrollToSignup}
          onNeedAuth={() => goToAuth('dashboard')}
          showToast={showToast}
        />
      )}

      <EmailPopup showToast={showToast} />
      <Toast msg={toastMsg} visible={toastVisible} />
    </>
  );
}
