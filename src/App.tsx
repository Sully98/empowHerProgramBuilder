import { useCallback, useEffect, useRef, useState } from 'react';
import { AuthPage } from './components/auth/AuthPage';
import { RoleSelectPage } from './components/auth/RoleSelectPage';
import { DashboardPage } from './components/dashboard/DashboardPage';
import { AppShell } from './components/app/AppShell';
import { WebsitePage } from './components/landing/WebsitePage';
import { LandingPage } from './components/landing/LandingPage';
import { EmailPopup } from './components/shared/EmailPopup';
import { Toast } from './components/shared/Toast';
import { useAuth } from './hooks/useAuth';
import { useProfile } from './hooks/useProfile';
import type { GoalKey, Profile, SavedProgram, SplitKey } from './data/types';

type View = 'website' | 'landing' | 'auth' | 'role-select' | 'dashboard' | 'app';

const VIEW_PATHS: Record<View, string> = {
  website: '/',
  landing: '/program-builder',
  auth: '/auth',
  'role-select': '/role-select',
  dashboard: '/dashboard',
  app: '/app',
};
const PATH_VIEWS: Record<string, View> = Object.fromEntries(
  Object.entries(VIEW_PATHS).map(([v, p]) => [p, v as View])
);
const viewFromPath = (path: string): View => PATH_VIEWS[path] ?? 'website';

export default function App() {
  const { user, loading: authLoading, signIn, signUp, signOut } = useAuth();
  const { profile, profileLoading, setRole } = useProfile(user);

  const [view, setViewRaw] = useState<View>(() => viewFromPath(window.location.pathname));
  const setView = useCallback((v: View) => {
    setViewRaw(v);
    const path = VIEW_PATHS[v];
    if (window.location.pathname !== path) {
      window.history.pushState(null, '', path);
    }
  }, []);

  // Sync with browser back/forward navigation
  useEffect(() => {
    const onPopState = () => {
      const v = viewFromPath(window.location.pathname);
      if (v === 'app') setAppShellEverOpened(true);
      setViewRaw(v);
      window.scrollTo(0, 0);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const [loadedProgram, setLoadedProgram] = useState<SavedProgram | null>(null);
  const [viewForStudent, setViewForStudent] = useState<Profile | null>(null);
  const [quizInitial, setQuizInitial] = useState<{ goal: GoalKey; split: SplitKey } | null>(null);
  // Once the app shell has mounted, keep it in the DOM (hidden) so exercises are never lost on navigation
  const [appShellEverOpened, setAppShellEverOpened] = useState(() => viewFromPath(window.location.pathname) === 'app');

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
      setView('landing');  // back to program builder landing, not website
    }
  }, [user, authLoading, view]);

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

  const openWebsite   = () => { setQuizInitial(null); setView('website');   window.scrollTo(0, 0); };
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
    setView('website');
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

      {!isLoading && view === 'website' && (
        <WebsitePage
          onOpenProgramBuilder={openLanding}
        />
      )}

      {!isLoading && view === 'landing' && (
        <LandingPage
          user={user}
          onOpenApp={user ? openDashboard : () => goToAuth('dashboard')}
          onGoToAuth={() => goToAuth('dashboard')}
          onGoToDashboard={openDashboard}
          onOpenAppWithGoal={openAppWithGoal}
          onGoToWebsite={openWebsite}
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
          onGoToLanding={openWebsite}
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
            onGoToWebsite={openWebsite}
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
