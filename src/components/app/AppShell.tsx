import { useCallback, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { upsertProgram } from '../../lib/programs';
import { fetchLogsForWeek, upsertLog } from '../../lib/workoutLogs';
import { useProgramBuilder } from '../../hooks/useProgramBuilder';
import type { Profile, SavedProgram, WorkoutLog, WorkoutLogKey } from '../../data/types';
import { AppHeader } from './AppHeader';
import { AppSocialBanner } from './AppSocialBanner';
import { MainArea } from './MainArea';
import { Sidebar } from './Sidebar';

interface AppShellProps {
  user: User;
  userProfile: Profile | null;
  loadedProgram: SavedProgram | null;
  // When a coach opens a student's program, this is the student
  viewForStudent: Profile | null;
  onCloseApp: () => void;
  onGoToDashboard: () => void;
  onGetWeeklyTips: () => void;
  showToast: (msg: string) => void;
}

export function AppShell({
  user, userProfile, loadedProgram, viewForStudent,
  onCloseApp, onGoToDashboard, onGetWeeklyTips, showToast,
}: AppShellProps) {
  const pb = useProgramBuilder();
  const [isSaving, setIsSaving] = useState(false);
  const [weekLogs, setWeekLogs] = useState<Record<WorkoutLogKey, WorkoutLog>>({});

  // Load program when it changes
  useEffect(() => {
    if (loadedProgram) pb.loadProgram(loadedProgram);
  }, [loadedProgram]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reload workout logs when week or program changes
  const logUserId = viewForStudent?.id ?? user.id;
  useEffect(() => {
    if (!pb.currentProgramId) { setWeekLogs({}); return; }
    fetchLogsForWeek(pb.currentProgramId, logUserId, pb.activeWeekView).then(setWeekLogs);
  }, [pb.currentProgramId, logUserId, pb.activeWeekView]);

  // Determine if the current user is a coach viewing a student's program
  const isCoachView = !!(viewForStudent && userProfile?.role === 'coach');

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const snapshot = pb.getProgramSnapshot();
      const id = await upsertProgram({
        ...snapshot,
        user_id: user.id,
        assigned_to: viewForStudent?.id ?? null,
        created_by: user.id,
        ...(pb.currentProgramId ? { id: pb.currentProgramId } : {}),
      });
      pb.setProgramId(id);
      showToast('Program saved ✓');
    } catch (e) {
      showToast(`Save failed: ${(e as Error).message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogChange = useCallback(async (
    dayIndex: number,
    exerciseName: string,
    field: 'actual_weight' | 'actual_reps',
    value: string
  ) => {
    if (!pb.currentProgramId) return;

    // Optimistic update
    const key = `${dayIndex}_${exerciseName}` as WorkoutLogKey;
    setWeekLogs(prev => ({
      ...prev,
      [key]: { ...(prev[key] ?? {}), [field]: value } as WorkoutLog,
    }));

    // Persist to Supabase
    const current = weekLogs[key];
    await upsertLog(
      pb.currentProgramId,
      logUserId,
      pb.activeWeekView,
      dayIndex,
      exerciseName,
      field === 'actual_weight' ? value : (current?.actual_weight ?? ''),
      field === 'actual_reps'   ? value : (current?.actual_reps   ?? ''),
    );
  }, [pb.currentProgramId, logUserId, pb.activeWeekView, weekLogs]);

  const handlePrint = () => {
    showToast('Printing...');
    setTimeout(() => window.print(), 400);
  };

  const headerTitle = viewForStudent
    ? `${viewForStudent.display_name ?? viewForStudent.email}'s Program`
    : undefined;

  return (
    <div id="app" className="app-shell">
      <AppHeader
        user={user}
        isSaving={isSaving}
        title={headerTitle}
        onClose={onCloseApp}
        onClear={() => pb.clearProg(showToast)}
        onLoadTemplate={() => pb.loadTemplate(showToast)}
        onAnalyze={() => pb.analyzeProg(showToast)}
        onPrint={handlePrint}
        onSave={handleSave}
        onGoToDashboard={onGoToDashboard}
      />
      <AppSocialBanner onGetWeeklyTips={onGetWeeklyTips} />

      <div className="app-body">
        <Sidebar
          split={pb.split}
          goal={pb.goal}
          blockWeeks={pb.blockWeeks}
          deloadOn={pb.deloadOn}
          deloadPct={pb.deloadPct}
          selectedMethods={pb.selectedMethods}
          onSetSplit={pb.setSplit}
          onSetGoal={pb.setGoal}
          onBlockWeeksChange={pb.handleBlockWeeksChange}
          onToggleDeload={pb.handleToggleDeload}
          onDeloadPctChange={pb.handleDeloadPctChange}
          onToggleMethod={pb.toggleMethod}
          onGenerateOverload={() => pb.generateOverload(showToast)}
          onDragStart={pb.handleDragStart}
        />
        <MainArea
          programName={pb.programName}
          split={pb.split}
          goal={pb.goal}
          blockWeeks={pb.blockWeeks}
          deloadOn={pb.deloadOn}
          deloadPct={pb.deloadPct}
          days={pb.days}
          overloadPlan={pb.overloadPlan}
          overloadVisible={pb.overloadVisible}
          selectedMethods={pb.selectedMethods}
          activeWeekView={pb.activeWeekView}
          totalWeeks={pb.totalWeeks}
          isDeloadView={pb.isDeloadView}
          analysis={pb.analysis}
          isCoachView={isCoachView}
          weekLogs={weekLogs}
          onSelectWeek={pb.setActiveWeek}
          onToggleDay={pb.toggleDay}
          onUpdateLabel={pb.updateDayLabel}
          onRemoveExercise={pb.removeExercise}
          onSetsChange={pb.updateExerciseSets}
          onWeightChange={pb.updateExerciseWeight}
          onLogChange={handleLogChange}
          onDragStart={pb.handleDragStart}
          onDrop={pb.handleDrop}
          onProgramNameChange={pb.updateProgramName}
          onDismissOverload={pb.dismissOverloadPlan}
          onDismissAnalysis={pb.dismissAnalysis}
        />
      </div>
    </div>
  );
}
