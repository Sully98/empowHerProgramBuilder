import { useCallback, useEffect, useRef, useState } from 'react';
import { AuthPage } from './components/auth/AuthPage';
import { RoleSelectPage } from './components/auth/RoleSelectPage';
import { DashboardPage } from './components/dashboard/DashboardPage';
import { AppShell } from './components/app/AppShell';
import { LandingPage } from './components/landing/LandingPage';
import { EmailPopup } from './components/shared/EmailPopup';
import { Toast } from './components/shared/Toast';
import { useAuth } from './hooks/useAuth';
import { useProfile } from './hooks/useProfile';
import type { Profile, SavedProgram } from './data/types';

type View = 'landing' | 'auth' | 'role-select' | 'dashboard' | 'app';

export default function App() {
  const { user, loading: authLoading, signIn, signUp, signOut } = useAuth();
  const { profile, profileLoading, setRole } = useProfile(user);

  const [view, setView] = useState<View>('landing');
  const [loadedProgram, setLoadedProgram] = useState<SavedProgram | null>(null);
  const [viewForStudent, setViewForStudent] = useState<Profile | null>(null);

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

  // After auth success: show role-select if first time, else go to destination
  useEffect(() => {
    if (user && view === 'auth' && !profileLoading) {
      if (!profile?.role) {
        setView('role-select');
      } else {
        setView(postAuthDest.current);
      }
      window.scrollTo(0, 0);
    }
  }, [user, profile, profileLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  // After role is set: navigate to destination
  useEffect(() => {
    if (view === 'role-select' && profile?.role) {
      setView(postAuthDest.current);
      window.scrollTo(0, 0);
    }
  }, [profile?.role]); // eslint-disable-line react-hooks/exhaustive-deps

  // Guard: if no user and on a protected view, redirect
  useEffect(() => {
    if (!authLoading && !user && (view === 'dashboard' || view === 'app' || view === 'role-select')) {
      setView('landing');
    }
  }, [user, authLoading, view]);

  const goToAuth = (dest: 'dashboard' | 'app' = 'dashboard') => {
    postAuthDest.current = dest;
    setView('auth');
    window.scrollTo(0, 0);
  };

  const openApp = () => {
    if (!user) { goToAuth('app'); return; }
    setLoadedProgram(null);
    setViewForStudent(null);
    setView('app');
    window.scrollTo(0, 0);
  };

  const openLanding   = () => { setView('landing');   window.scrollTo(0, 0); };
  const openDashboard = () => { setView('dashboard'); window.scrollTo(0, 0); };

  const handleLoadProgram = (p: SavedProgram) => {
    setLoadedProgram(p);
    setViewForStudent(null);
    setView('app');
    window.scrollTo(0, 0);
  };

  // Coach opens a student's program
  const handleLoadProgramForStudent = (p: SavedProgram, student: Profile) => {
    setLoadedProgram(p.id ? p : null);
    setViewForStudent(student);
    setView('app');
    window.scrollTo(0, 0);
  };

  const handleSignOut = async () => {
    await signOut();
    setView('landing');
  };

  const handleRoleSelect = async (role: 'coach' | 'user') => {
    await setRole(role);
    // navigation handled by the profile?.role effect above
  };

  const scrollToSignup = () => {
    setView('landing');
    window.scrollTo(0, 0);
    setTimeout(() => document.getElementById('signup')?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const isLoading = authLoading || (!!user && profileLoading);

  if (isLoading) {
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

      {view === 'role-select' && (
        <RoleSelectPage onSelect={handleRoleSelect} />
      )}

      {view === 'dashboard' && user && profile && (
        <DashboardPage
          user={user}
          profile={profile}
          onNewProgram={openApp}
          onLoadProgram={handleLoadProgram}
          onLoadProgramForStudent={handleLoadProgramForStudent}
          onGoToLanding={openLanding}
          onSignOut={handleSignOut}
        />
      )}

      {view === 'app' && user && (
        <AppShell
          key={`${loadedProgram?.id ?? 'new'}-${viewForStudent?.id ?? 'self'}`}
          user={user}
          userProfile={profile}
          loadedProgram={loadedProgram}
          viewForStudent={viewForStudent}
          onCloseApp={openDashboard}
          onGoToDashboard={openDashboard}
          onGetWeeklyTips={scrollToSignup}
          showToast={showToast}
        />
      )}

      <EmailPopup showToast={showToast} />
      <Toast msg={toastMsg} visible={toastVisible} />
    </>
  );
}
