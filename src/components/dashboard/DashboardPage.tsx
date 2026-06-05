import type { User } from '@supabase/supabase-js';
import { CoachDashboard } from '../coach/CoachDashboard';
import type { Profile, SavedProgram } from '../../data/types';
import { StudentDashboard } from './StudentDashboard';

interface DashboardPageProps {
  user: User;
  profile: Profile;
  onNewProgram: () => void;
  onLoadProgram: (p: SavedProgram) => void;
  onLoadProgramForStudent: (p: SavedProgram, student: Profile) => void;
  onGoToLanding: () => void;
  onSignOut: () => void;
}

export function DashboardPage({
  user, profile, onNewProgram, onLoadProgram, onLoadProgramForStudent, onGoToLanding, onSignOut,
}: DashboardPageProps) {
  if (profile.role === 'coach') {
    return (
      <CoachDashboard
        user={user}
        coachProfile={profile}
        onNewProgram={onNewProgram}
        onLoadProgram={onLoadProgram}
        onLoadProgramForStudent={onLoadProgramForStudent}
        onGoToLanding={onGoToLanding}
        onSignOut={onSignOut}
      />
    );
  }

  return (
    <StudentDashboard
      user={user}
      profile={profile}
      onNewProgram={onNewProgram}
      onLoadProgram={onLoadProgram}
      onGoToLanding={onGoToLanding}
      onSignOut={onSignOut}
    />
  );
}
