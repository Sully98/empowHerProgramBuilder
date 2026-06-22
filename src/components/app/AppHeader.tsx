import type { User } from '@supabase/supabase-js';

interface AppHeaderProps {
  user: User | null;
  isSaving: boolean;
  title?: string;
  onClose: () => void;
  onClear: () => void;
  onLoadTemplate: () => void;
  onAnalyze: () => void;
  onPrint: () => void;
  onExportCsv: () => void;
  onSave: () => void;
  onGoToDashboard: () => void;
}

export function AppHeader({
  user, isSaving, title, onClose, onClear, onLoadTemplate, onAnalyze, onPrint, onExportCsv, onSave, onGoToDashboard,
}: AppHeaderProps) {
  return (
    <header className="app-hdr">
      <div className="app-logo-wrap">
        <div className="app-logo">Empower<em>HER</em> Strength</div>
        <div className="hdr-div"></div>
        <div className="app-logo-tag">{title ?? 'Program Builder'}</div>
      </div>
      <div className="hdr-right">
        <button className="btn btn-ghost btn-sm" onClick={onClose}>← Back</button>
        {user && (
          <button className="btn btn-ghost btn-sm" onClick={onGoToDashboard}>Dashboard</button>
        )}
        <button className="btn btn-ghost btn-sm" onClick={onClear}>Clear</button>
        <button className="btn btn-ghost btn-sm" onClick={onLoadTemplate}>Load Template</button>
        <button className="btn btn-ghost btn-sm" onClick={onAnalyze}>Analyze</button>
        <button className="btn btn-ghost btn-sm" onClick={onSave} disabled={isSaving}>
          {isSaving ? 'Saving…' : user ? '💾 Save' : '💾 Save (Login)'}
        </button>
        <button className="btn btn-ghost btn-sm" onClick={onExportCsv}>↓ XLSX</button>
        <button className="btn btn-primary btn-sm" onClick={onPrint}>⬇ Print PDF</button>
      </div>
    </header>
  );
}
