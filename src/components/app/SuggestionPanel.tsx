import type { AnalysisResult } from '../../data/types';

interface SuggestionPanelProps {
  analysis: AnalysisResult | null;
  panelRef: React.RefObject<HTMLDivElement | null>;
  onClose: () => void;
}

export function SuggestionPanel({ analysis, panelRef, onClose }: SuggestionPanelProps) {
  if (!analysis) return null;

  return (
    <div className="sug-panel on" id="sug-panel" ref={panelRef}>
      <div className="panel-hdr">
        <div className="sug-ttl">✦ Program Analysis</div>
        <button className="panel-close" onClick={onClose} title="Close">✕</button>
      </div>
      <div className="sug-body" dangerouslySetInnerHTML={{ __html: analysis.html }} />
      <div className="sug-tips">
        {analysis.tips.map((tip, i) => (
          <div key={i} className="stip">{tip}</div>
        ))}
      </div>
    </div>
  );
}
