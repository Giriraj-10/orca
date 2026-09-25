import React from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

const DisclaimerBanner = ({ compact = false }) => {
  if (compact) {
    return (
      <div className="bg-ocean-900/80 border-t border-ocean-800 px-4 py-2 text-xs text-slate-400 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>
            <strong>Scientific & Safety Notice:</strong> ORCA is a decision-support prototype. Not a substitute for official INCOIS/IMD advisories.
          </span>
        </div>
        <span className="hidden md:inline text-slate-500 font-mono">v1.0.0 SIH-Edition</span>
      </div>
    );
  }

  return (
    <div className="bg-ocean-900/90 border border-ocean-700/60 rounded-lg p-3 my-3 text-xs text-slate-300 flex items-start space-x-3 shadow-sm">
      <div className="p-1.5 bg-amber-500/10 rounded-md shrink-0 mt-0.5">
        <AlertTriangle className="w-4 h-4 text-amber-400" />
      </div>
      <div className="leading-relaxed">
        <p className="font-semibold text-slate-200 mb-0.5">Maritime Safety & Regulatory Disclaimer</p>
        <p className="text-slate-400">
          ORCA is a research and decision-support prototype developed for Smart India Hackathon. Marine conditions and fishing suitability estimates are generated from available datasets and model heuristics. They should not be treated as official navigation, weather, fisheries or safety advisories. Always verify with official INCOIS, IMD, and Coast Guard broadcasts before venturing into open seas.
        </p>
      </div>
    </div>
  );
};

export default DisclaimerBanner;
