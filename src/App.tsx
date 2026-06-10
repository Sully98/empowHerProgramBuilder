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
import type { GoalKey, Profile, SavedProgram, SplitKey } from './data/types';

type View = 'landing' | 'auth' | 'role-select' | 'dashboard' | 'app';

export default function App() {
  const { user, loading: authLoading, signIn, signUp, signOut } = useAuth();
  const { profile, profileLoading, setRole } = useProfile(user);

  const [view, setViewRaw] = useState<View>('landing');
  const setView = useCallback((v: View) => {
    setViewRaw(v);
    // Persist which view is active so a dev-mode HMR reload can return the user here
    if (v === 'app' || v === 'dashboard') {
      sessionStorage.setItem('empowher_last_view', v);
    } else {
      sessionStorage.removeItem('empowher_last_view');
    }
  }, []);
  const [loadedProgram, setLoadedProgram] = useState<SavedProgram | null>(null);
  const [viewForStudent, setViewForStudent] = useState<Profile | null>(null);
  const [quizInitial, setQuizInitial] = useState<{ goal: GoalKey; split: SplitKey } | null>(null);
  // Once the app shell has mounted, keep it in the DOM (hidden) so exercises are never lost on navigation
  const [appShellEverOpened, setAppShellEverOpened] = useState(false);

  const postAuthDest = useRef<'dashboard' | 'app'>('dashboard');
  const pendingQuiz = useRef<{ goal: GoalKey; split: SplitKey } | null>(null);

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
        if (pendingQuiz.current) {
          setQuizInitial(pendingQuiz.current);
          pendingQuiz.current = null;
        }
        setView(postAuthDest.current);
      }
      window.scrollTo(0, 0);
    }
  }, [user, profile, profileLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  // After role is set: navigate to destination
  useEffect(() => {
    if (view === 'role-select' && profile?.role) {
      if (pendingQuiz.current) {
        setQuizInitial(pendingQuiz.current);
        pendingQuiz.current = null;
      }
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

  // After a dev-mode HMR page reload, restore the user to wherever they were
  const viewRestoredRef = useRef(false);
  useEffect(() => {
    if (viewRestoredRef.current) return;
    if (authLoading || profileLoading) return;
    if (!user || !profile?.role) return;
    const saved = sessionStorage.getItem('empowher_last_view') as View | null;
    if (saved === 'app' || saved === 'dashboard') {
      viewRestoredRef.current = true;
      if (saved === 'app') {
        setAppShellEverOpened(true);
        setViewRaw('app');
      } else {
        setViewRaw('dashboard');
      }
    }
  }, [authLoading, profileLoading, user, profile?.role]); // eslint-disable-line react-hooks/exhaustive-deps

  const goToAuth = (dest: 'dashboard' | 'app' = 'dashboard') => {
    postAuthDest.current = dest;
    setView('auth');
    window.scrollTo(0, 0);
  };

  const openApp = () => {
    if (!user) { goToAuth('app'); return; }
    pendingQuiz.current = null;
    setQuizInitial(null);
    setLoadedProgram(null);
    setViewForStudent(null);
    setAppShellEverOpened(true);
    setView('app');
    window.scrollTo(0, 0);
  };

  const openAppWithGoal = (goal: GoalKey, split: SplitKey) => {
    pendingQuiz.current = { goal, split };
    if (!user) { goToAuth('app'); return; }
    setQuizInitial({ goal, split });
    pendingQuiz.current = null;
    setLoadedProgram(null);
    setViewForStudent(null);
    setAppShellEverOpened(true);
    setView('app');
    window.scrollTo(0, 0);
  };

  const openLanding   = () => { setQuizInitial(null); setView('landing');   window.scrollTo(0, 0); };
  const openDashboard = () => { setQuizInitial(null); setView('dashboard'); window.scrollTo(0, 0); };

  const handleLoadProgram = (p: SavedProgram) => {
    setLoadedProgram(p);
    setViewForStudent(null);
    setAppShellEverOpened(true);
    setView('app');
    window.scrollTo(0, 0);
  };

  // Coach opens a student's program
  const handleLoadProgramForStudent = (p: SavedProgram, student: Profile) => {
    setLoadedProgram(p.id ? p : null);
    setViewForStudent(student);
    setAppShellEverOpened(true);
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

  // Keep a stable user reference for AppShell so that a brief null emitted by
  // Supabase's onAuthStateChange during token refresh doesn't unmount it and
  // wipe in-memory exercise state.
  const appShellUserRef = useRef<typeof user>(null);
  if (user) appShellUserRef.current = user;
  const appShellUser = appShellUserRef.current;

  return (
    <>
      {/* Loading overlay — rendered on top so nothing underneath unmounts */}
      {isLoading && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
          <div style={{ fontFamily: "'DM Mono',monospace", fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--muted)' }}>
            Loading…
          </div>
        </div>
      )}

      {!isLoading && view === 'landing' && (
        <LandingPage
          user={user}
          onOpenApp={user ? openDashboard : () => goToAuth('dashboard')}
          onGoToAuth={() => goToAuth('dashboard')}
          onGoToDashboard={openDashboard}
          onOpenAppWithGoal={openAppWithGoal}
          showToast={showToast}
        />
      )}

      {!isLoading && view === 'auth' && (
        <AuthPage
          onSignIn={signIn}
          onSignUp={signUp}
          onBack={openLanding}
        />
      )}

      {!isLoading && view === 'role-select' && (
        <RoleSelectPage onSelect={handleRoleSelect} />
      )}

      {!isLoading && view === 'dashboard' && user && profile && (
        <DashboardPage
          user={user}
          profile={profile}
          onNewProgram={openApp}
          onOpenAppWithGoal={openAppWithGoal}
          onLoadProgram={handleLoadProgram}
          onLoadProgramForStudent={handleLoadProgramForStudent}
          onGoToLanding={openLanding}
          onSignOut={handleSignOut}
        />
      )}

      {/* AppShell stays mounted once opened — uses stable user ref so a brief
          null from Supabase token refresh doesn't cause an unmount/remount */}
      {appShellEverOpened && appShellUser && (
        <div style={{ display: view === 'app' ? undefined : 'none' }}>
          <AppShell
            key={`${loadedProgram?.id ?? 'new'}-${viewForStudent?.id ?? 'self'}`}
            user={appShellUser}
            userProfile={profile}
            loadedProgram={loadedProgram}
            viewForStudent={viewForStudent}
            initialGoal={quizInitial?.goal}
            initialSplit={quizInitial?.split}
            onCloseApp={openDashboard}
            onGoToDashboard={openDashboard}
            onGetWeeklyTips={scrollToSignup}
            showToast={showToast}
          />
        </div>
      )}

      <EmailPopup showToast={showToast} />
      <Toast msg={toastMsg} visible={toastVisible} />
    </>
  );
}
