import React from 'react';
import { HelpCircle, CheckCircle, AlertCircle } from 'lucide-react';

const ConfidenceBadge = ({ confidence, level = 'High', showTooltip = true }) => {
  const percent = typeof confidence === 'number' ? Math.round(confidence * 100) : 85;

  let colorClasses = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  let dotColor = 'bg-emerald-400';

  if (percent < 70 || level === 'Low') {
    colorClasses = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    dotColor = 'bg-rose-400';
  } else if (percent < 82 || level === 'Medium') {
    colorClasses = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    dotColor = 'bg-amber-400';
  }

  return (
    <div className="relative group inline-flex items-center">
      <div className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${colorClasses}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${dotColor} animate-pulse`} />
        <span>Confidence: {level} ({percent}%)</span>
        {showTooltip && <HelpCircle className="w-3 h-3 ml-0.5 opacity-60 group-hover:opacity-100 cursor-help" />}
      </div>

      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 bg-ocean-900 border border-ocean-700 text-[11px] text-slate-300 rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 text-center">
          Prototype confidence based on data availability and agreement among contributing indicators. Not absolute scientific certainty.
        </div>
      )}
    </div>
  );
};

export default ConfidenceBadge;
