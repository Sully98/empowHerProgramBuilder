import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { upsertProgram } from '../../lib/programs';
import { useProgramBuilder } from '../../hooks/useProgramBuilder';
import type { SavedProgram } from '../../data/types';
import { AppHeader } from './AppHeader';
import { AppSocialBanner } from './AppSocialBanner';
import { MainArea } from './MainArea';
import { Sidebar } from './Sidebar';

interface AppShellProps {
  user: User | null;
  loadedProgram: SavedProgram | null;
  onCloseApp: () => void;
  onGoToDashboard: () => void;
  onGetWeeklyTips: () => void;
  onNeedAuth: () => void;
  showToast: (msg: string) => void;
}

export function AppShell({ user, loadedProgram, onCloseApp, onGoToDashboard, onGetWeeklyTips, onNeedAuth, showToast }: AppShellProps) {
  const pb = useProgramBuilder();
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (loadedProgram) pb.loadProgram(loadedProgram);
  }, [loadedProgram]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = async () => {
    if (!user) { onNeedAuth(); return; }
    setIsSaving(true);
    try {
      const snapshot = pb.getProgramSnapshot();
      const id = await upsertProgram({
        ...snapshot,
        user_id: user.id,
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

  const handlePrint = () => {
    showToast('Printing...');
    setTimeout(() => window.print(), 400);
  };

  return (
    <div id="app" className="app-shell">
      <AppHeader
        user={user}
        isSaving={isSaving}
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
          onSelectWeek={pb.setActiveWeek}
          onToggleDay={pb.toggleDay}
          onUpdateLabel={pb.updateDayLabel}
          onRemoveExercise={pb.removeExercise}
          onSetsChange={pb.updateExerciseSets}
          onWeightChange={pb.updateExerciseWeight}
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
