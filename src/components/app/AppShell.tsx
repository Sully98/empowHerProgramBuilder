import { useCallback, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import * as XLSX from 'xlsx';
import { upsertProgram } from '../../lib/programs';
import { fetchLogsForWeek, upsertLog } from '../../lib/workoutLogs';
import { applyDeload, getWkDisplaySets, getWkDisplayWeight, useProgramBuilder } from '../../hooks/useProgramBuilder';
import type { GoalKey, Profile, SavedProgram, SplitKey, WorkoutLog, WorkoutLogKey } from '../../data/types';
import { GOALS, SPLITS } from '../../data/constants';
import { AppHeader } from './AppHeader';
import { AppSocialBanner } from './AppSocialBanner';
import { MainArea } from './MainArea';
import { Sidebar } from './Sidebar';

interface AppShellProps {
  user: User;
  userProfile: Profile | null;
  loadedProgram: SavedProgram | null;
  viewForStudent: Profile | null;
  initialGoal?: GoalKey;
  initialSplit?: SplitKey;
  onCloseApp: () => void;
  onGoToDashboard: () => void;
  onGetWeeklyTips: () => void;
  showToast: (msg: string) => void;
}

export function AppShell({
  user, userProfile, loadedProgram, viewForStudent,
  initialGoal, initialSplit,
  onCloseApp, onGoToDashboard, onGetWeeklyTips, showToast,
}: AppShellProps) {
  const pb = useProgramBuilder();

  useEffect(() => {
    if (!loadedProgram && (initialGoal || initialSplit)) {
      if (initialGoal) pb.setGoal(initialGoal);
      if (initialSplit) pb.setSplit(initialSplit);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
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

  const buildProgramData = () => {
    const { overloadPlan, days, selectedMethods, deloadPct, programName, split, goal, blockWeeks, deloadOn } = pb;
    const goalLabel = GOALS[goal]?.label ?? goal;
    const splitLabel = SPLITS[split]?.label ?? split;
    const weekCount = blockWeeks + (deloadOn ? 1 : 0);
    const activeDays = days.filter(d => !d.isRest);
    return { overloadPlan, days, activeDays, selectedMethods, deloadPct, programName, split, goal, blockWeeks, deloadOn, goalLabel, splitLabel, weekCount };
  };

  const handleExportXlsx = () => {
    const { overloadPlan, activeDays, selectedMethods, deloadPct, programName, goalLabel, splitLabel, weekCount, deloadOn } = buildProgramData();

    const COLS = ['Week', 'Day', 'Exercise', 'Muscle Group', 'Sets × Reps', 'Target Weight', 'Actual Weight', 'Actual Reps', 'Focus / Notes', 'Comments'];
    const COL_WIDTHS = [22, 18, 28, 14, 13, 14, 14, 12, 38, 32];

    // Theme colours (matching website)
    const DARK   = '1A1A1A';
    const CREAM  = 'F8F2DD';
    const TEAL   = '7BB5B2';
    const GOLD   = 'EDD286';
    const CARD   = '202020';
    const BORDER = '2A2A2A';
    const MUTED  = '8A8070';

    const headerFill = { patternType: 'solid' as const, fgColor: { rgb: DARK } };
    const cardFill   = { patternType: 'solid' as const, fgColor: { rgb: CARD } };
    const weekFill   = { patternType: 'solid' as const, fgColor: { rgb: '141414' } };
    const whiteFill  = { patternType: 'solid' as const, fgColor: { rgb: 'FFFFFF' } };
    const evenFill   = { patternType: 'solid' as const, fgColor: { rgb: '1E1E1E' } };
    const oddFill    = { patternType: 'solid' as const, fgColor: { rgb: '1A1A1A' } };

    const border = { top: { style: 'thin', color: { rgb: BORDER } }, bottom: { style: 'thin', color: { rgb: BORDER } }, left: { style: 'thin', color: { rgb: BORDER } }, right: { style: 'thin', color: { rgb: BORDER } } };

    const cell = (v: string, opts: Record<string, unknown> = {}): XLSX.CellObject => ({
      v, t: 's',
      s: { font: { name: 'DM Sans', sz: 10, color: { rgb: CREAM } }, alignment: { vertical: 'center', wrapText: true }, border, ...opts },
    });

    const wsData: XLSX.CellObject[][] = [];

    // Title row
    wsData.push([
      cell(`EmpowHER Strength — ${programName || 'My Program'}`, { font: { name: 'Georgia', sz: 14, bold: true, color: { rgb: GOLD } }, fill: headerFill }),
      cell(`${splitLabel} · ${goalLabel} · ${weekCount}-Week Block${deloadOn ? ' + Deload' : ''}`, { font: { name: 'Courier New', sz: 9, color: { rgb: MUTED } }, fill: headerFill }),
      ...Array(8).fill(cell('', { fill: headerFill })),
    ]);

    // Column header row
    wsData.push(COLS.map(h => cell(h, {
      font: { name: 'Courier New', sz: 8, bold: true, color: { rgb: TEAL } },
      fill: weekFill,
    })));

    const pushWeekRows = (wp: typeof overloadPlan[0] | null) => {
      const isNoplan = wp === null;
      const instrNote = wp ? wp.instructions.map(i => `${i.method}: ${i.detail}`).join(' | ') : '';

      if (wp) {
        // Week header row
        wsData.push([
          cell(wp.label + (wp.isDeload ? '  ·  DELOAD' : ''), {
            font: { name: 'Georgia', sz: 12, bold: true, color: { rgb: wp.isDeload ? GOLD : CREAM } },
            fill: weekFill,
          }),
          cell(instrNote, { font: { name: 'Courier New', sz: 8, color: { rgb: MUTED } }, fill: weekFill }),
          ...Array(8).fill(cell('', { fill: weekFill })),
        ]);
      }

      for (const day of activeDays) {
        if (day.exercises.length === 0) continue;

        // Day sub-header
        wsData.push([
          cell(''),
          cell(day.label, { font: { name: 'Courier New', sz: 9, bold: true, color: { rgb: TEAL } }, fill: cardFill }),
          ...Array(8).fill(cell('', { fill: cardFill })),
        ]);

        day.exercises.forEach((ex, i) => {
          const sets = isNoplan ? ex.sets : wp!.isDeload
            ? applyDeload(ex.sets, deloadPct)
            : getWkDisplaySets(ex.sets, wp!.week, overloadPlan, selectedMethods);
          const weight = isNoplan ? (ex.weight ?? '') : (getWkDisplayWeight(ex.weight, wp!.week, overloadPlan, selectedMethods) ?? '');
          const focusNotes = isNoplan ? '' : wp!.instructions.filter(j => ['Tempo', 'Rest', 'Rep Quality'].includes(j.method)).map(j => j.detail).join(' | ') || '';
          const rowFill = i % 2 === 0 ? evenFill : oddFill;

          wsData.push([
            cell('', { fill: rowFill }),
            cell('', { fill: rowFill }),
            cell(ex.name, { font: { name: 'DM Sans', sz: 10, bold: true, color: { rgb: CREAM } }, fill: rowFill }),
            cell(ex.muscle, { font: { name: 'Courier New', sz: 8, color: { rgb: TEAL } }, fill: rowFill }),
            cell(sets, { font: { name: 'DM Sans', sz: 10, bold: true, color: { rgb: CREAM } }, fill: rowFill }),
            cell(weight, { font: { name: 'DM Sans', sz: 10, color: { rgb: GOLD } }, fill: rowFill }),
            cell('', { fill: whiteFill }),  // Actual Weight — white for pen
            cell('', { fill: whiteFill }),  // Actual Reps — white for pen
            cell(focusNotes, { font: { name: 'Courier New', sz: 8, color: { rgb: MUTED } }, fill: rowFill }),
            cell('', { fill: whiteFill }),  // Comments — white for pen
          ]);
        });

        wsData.push(Array(10).fill(cell('', { fill: { patternType: 'solid', fgColor: { rgb: DARK } } })));
      }
    };

    if (overloadPlan.length > 0) {
      overloadPlan.forEach(wp => pushWeekRows(wp));
    } else {
      pushWeekRows(null);
    }

    const ws = XLSX.utils.aoa_to_sheet(wsData as unknown as unknown[][]);
    ws['!cols'] = COL_WIDTHS.map(w => ({ wch: w }));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, programName || 'Program');
    XLSX.writeFile(wb, `${(programName || 'program').replace(/\s+/g, '-').toLowerCase()}.xlsx`);
    showToast('XLSX exported ✓');
  };

  const handlePrint = () => {
    const { overloadPlan, activeDays, selectedMethods, deloadPct, programName, goalLabel, splitLabel, weekCount, deloadOn } = buildProgramData();

    const weeksHtml = overloadPlan.length > 0 ? overloadPlan.map(wp => {
      const instrHtml = wp.instructions.map(instr =>
        `<span class="instr-item"><strong>${instr.method}:</strong> ${instr.detail}</span>`
      ).join('');

      const daysHtml = activeDays.map(day => {
        if (day.exercises.length === 0) return '';
        const focusNotes = wp.instructions
          .filter(i => ['Tempo', 'Rest', 'Rep Quality'].includes(i.method))
          .map(i => i.detail).join(' | ') || '—';
        const rowsHtml = day.exercises.map((ex, i) => {
          const sets = wp.isDeload
            ? applyDeload(ex.sets, deloadPct)
            : getWkDisplaySets(ex.sets, wp.week, overloadPlan, selectedMethods);
          const weight = getWkDisplayWeight(ex.weight, wp.week, overloadPlan, selectedMethods);
          return `<tr class="${i % 2 === 0 ? 'r-even' : 'r-odd'}">
            <td class="ex-name">${ex.name}</td>
            <td class="muscle">${ex.muscle}</td>
            <td class="sets">${sets}</td>
            <td class="weight">${weight ?? '—'}</td>
            <td class="notes">${focusNotes}</td>
            <td class="writeable"></td>
            <td class="writeable"></td>
            <td class="writeable comments"></td>
          </tr>`;
        }).join('');

        return `<div class="day-block">
          <div class="day-header">${day.label}</div>
          <table>
            <thead><tr>
              <th style="width:20%">Exercise</th>
              <th style="width:9%">Muscle</th>
              <th style="width:9%">Sets × Reps</th>
              <th style="width:9%">Target Wt</th>
              <th style="width:14%">Focus / Notes</th>
              <th style="width:9%">Actual Wt</th>
              <th style="width:9%">Actual Reps</th>
              <th style="width:21%">Comments</th>
            </tr></thead>
            <tbody>${rowsHtml}</tbody>
          </table>
        </div>`;
      }).join('');

      return `<div class="week-block${wp.isDeload ? ' deload' : ''}">
        <div class="week-header">
          <span class="week-title">${wp.label}</span>
          ${wp.isDeload ? '<span class="deload-badge">DELOAD</span>' : ''}
        </div>
        ${instrHtml ? `<div class="week-instrs">${instrHtml}</div>` : ''}
        ${daysHtml}
      </div>`;
    }).join('') : (() => {
      const daysHtml = activeDays.map(day => {
        if (day.exercises.length === 0) return '';
        const rowsHtml = day.exercises.map((ex, i) => `<tr class="${i % 2 === 0 ? 'r-even' : 'r-odd'}">
          <td class="ex-name">${ex.name}</td>
          <td class="muscle">${ex.muscle}</td>
          <td class="sets">${ex.sets}</td>
          <td class="weight">${ex.weight ?? '—'}</td>
          <td class="notes">—</td>
          <td class="writeable"></td>
          <td class="writeable"></td>
          <td class="writeable comments"></td>
        </tr>`).join('');
        return `<div class="day-block">
          <div class="day-header">${day.label}</div>
          <table>
            <thead><tr>
              <th style="width:20%">Exercise</th><th style="width:9%">Muscle</th>
              <th style="width:9%">Sets × Reps</th><th style="width:9%">Target Wt</th>
              <th style="width:14%">Focus / Notes</th><th style="width:9%">Actual Wt</th>
              <th style="width:9%">Actual Reps</th><th style="width:21%">Comments</th>
            </tr></thead>
            <tbody>${rowsHtml}</tbody>
          </table>
        </div>`;
      }).join('');
      return `<div class="week-block"><div class="week-header"><span class="week-title">Program — No Overload Plan</span></div>${daysHtml}</div>`;
    })();

    const totalEx = activeDays.reduce((a, d) => a + d.exercises.length, 0);
    const totalSets = activeDays.reduce((a, d) => a + d.exercises.reduce((b, e) => {
      const m = e.sets.match(/^(\d+)/); return b + (m ? parseInt(m[1]) : 0);
    }, 0), 0);

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${programName || 'My Program'} — EmpowHER Strength</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      background: #1a1a1a;
      color: #f8f2dd;
      font-family: 'DM Sans', sans-serif;
      font-size: 11px;
      padding: 32px 36px;
    }

    /* ── Doc header ── */
    .doc-header {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: 20px;
      padding-bottom: 20px;
      margin-bottom: 22px;
      border-bottom: 1px solid #363636;
    }
    .brand-title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 34px;
      font-weight: 700;
      letter-spacing: -0.5px;
      line-height: 1;
      color: #f8f2dd;
    }
    .brand-title em { color: #7bb5b2; font-style: normal; }
    .brand-tag {
      font-family: 'DM Mono', monospace;
      font-size: 8px;
      letter-spacing: 3px;
      text-transform: uppercase;
      color: #8a8070;
      margin-top: 6px;
    }
    .prog-meta { text-align: right; }
    .prog-name {
      font-family: 'Cormorant Garamond', serif;
      font-size: 24px;
      font-weight: 600;
      color: #edd286;
    }
    .prog-details {
      font-family: 'DM Mono', monospace;
      font-size: 8px;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #8a8070;
      margin-top: 5px;
    }

    /* ── Stats strip ── */
    .stats-row {
      display: flex;
      margin-bottom: 24px;
      border: 1px solid #2a2a2a;
      background: #141414;
    }
    .stat {
      flex: 1;
      padding: 14px 12px;
      border-right: 1px solid #2a2a2a;
      text-align: center;
    }
    .stat:last-child { border-right: none; }
    .stat-num {
      font-family: 'Cormorant Garamond', serif;
      font-size: 28px;
      font-weight: 600;
      color: #f8f2dd;
      line-height: 1;
    }
    .stat-num.gold { color: #edd286; }
    .stat-num.teal { color: #7bb5b2; }
    .stat-lbl {
      font-family: 'DM Mono', monospace;
      font-size: 7px;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #8a8070;
      margin-top: 4px;
    }

    /* ── Week blocks ── */
    .week-block {
      margin-bottom: 24px;
      border: 1px solid #2a2a2a;
    }
    .week-block.deload { border-color: #7bb5b2; }
    .week-header {
      background: #141414;
      border-bottom: 2px solid #7bb5b2;
      padding: 11px 16px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .week-block.deload .week-header { border-bottom-color: #edd286; }
    .week-title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 20px;
      font-weight: 600;
      color: #f8f2dd;
    }
    .deload-badge {
      font-family: 'DM Mono', monospace;
      font-size: 7px;
      letter-spacing: 2px;
      text-transform: uppercase;
      background: rgba(237,210,134,0.15);
      color: #edd286;
      padding: 2px 8px;
      border: 1px solid rgba(237,210,134,0.3);
    }
    .week-instrs {
      background: #202020;
      border-bottom: 1px solid #2a2a2a;
      padding: 8px 16px;
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
    }
    .instr-item {
      font-family: 'DM Mono', monospace;
      font-size: 8px;
      letter-spacing: 0.5px;
      color: #8a8070;
    }
    .instr-item strong { color: #7bb5b2; }

    /* ── Day sub-header ── */
    .day-block { border-top: 1px solid #2a2a2a; }
    .day-block:first-of-type { border-top: none; }
    .day-header {
      background: #202020;
      border-left: 3px solid #7bb5b2;
      padding: 7px 16px;
      font-family: 'DM Mono', monospace;
      font-size: 9px;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #7bb5b2;
    }
    .week-block.deload .day-header { border-left-color: #edd286; color: #edd286; }

    /* ── Table ── */
    table { width: 100%; border-collapse: collapse; }
    thead tr { background: #252525; }
    th {
      font-family: 'DM Mono', monospace;
      font-size: 7px;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: #8a8070;
      padding: 7px 10px;
      text-align: left;
      border-bottom: 1px solid #2a2a2a;
      font-weight: 500;
    }
    td {
      padding: 8px 10px;
      border-bottom: 1px solid #252525;
      vertical-align: middle;
    }
    tr.r-even td { background: #1e1e1e; }
    tr.r-odd  td { background: #1a1a1a; }
    .ex-name { font-weight: 500; color: #f8f2dd; font-size: 11px; }
    .muscle {
      font-family: 'DM Mono', monospace;
      font-size: 8px;
      letter-spacing: 1px;
      text-transform: uppercase;
      color: #7bb5b2;
    }
    .sets { font-weight: 600; color: #f8f2dd; }
    .weight { color: #edd286; font-weight: 500; }
    .notes { color: #8a8070; font-size: 10px; }
    .writeable { background: #ffffff !important; }
    .comments { min-width: 120px; }

    /* ── Footer ── */
    .doc-footer {
      margin-top: 28px;
      padding-top: 14px;
      border-top: 1px solid #2a2a2a;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .footer-brand {
      font-family: 'DM Mono', monospace;
      font-size: 7px;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #8a8070;
    }
    .footer-accent { color: #7bb5b2; }

    @media print {
      * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      body { padding: 16px 20px; }
      .week-block { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="doc-header">
    <div>
      <div class="brand-title">Empower<em>HER</em> Strength</div>
      <div class="brand-tag">Program Builder · Built by Real Coaches · Evidence-Based Training</div>
    </div>
    <div class="prog-meta">
      <div class="prog-name">${programName || 'My Program'}</div>
      <div class="prog-details">${splitLabel} · ${goalLabel} · ${weekCount}-Week Block${deloadOn ? ' + Deload' : ''}</div>
    </div>
  </div>

  <div class="stats-row">
    <div class="stat">
      <div class="stat-num">${activeDays.length}</div>
      <div class="stat-lbl">Days / Week</div>
    </div>
    <div class="stat">
      <div class="stat-num">${totalEx}</div>
      <div class="stat-lbl">Exercises</div>
    </div>
    <div class="stat">
      <div class="stat-num">${totalSets}</div>
      <div class="stat-lbl">Total Sets</div>
    </div>
    <div class="stat">
      <div class="stat-num teal">${overloadPlan.length}</div>
      <div class="stat-lbl">Weeks Planned</div>
    </div>
    <div class="stat">
      <div class="stat-num gold">${deloadPct}%</div>
      <div class="stat-lbl">Deload Volume</div>
    </div>
  </div>

  ${weeksHtml}

  <div class="doc-footer">
    <span class="footer-brand">EmpowHER Strength LLC · empowherstrength.us</span>
    <span class="footer-brand"><span class="footer-accent">@empowher_strength</span> on Instagram</span>
    <span class="footer-brand">Built by Real Coaches · Evidence-Based Programming</span>
  </div>
</body>
</html>`;

    const win = window.open('', '_blank');
    if (!win) { showToast('Allow pop-ups to export PDF'); return; }
    win.document.write(html);
    win.document.close();
    win.addEventListener('load', () => setTimeout(() => win.print(), 300));
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
        onExportCsv={handleExportXlsx}
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
