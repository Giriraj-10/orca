import React from 'react';
import { Database, Clock, Bot, Activity } from 'lucide-react';

const EvidenceTable = ({ evidence = [], title = 'Reasoning Evidence & Sensor Attribution' }) => {
  if (!evidence || evidence.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 border border-ocean-700/60 rounded-xl overflow-hidden bg-ocean-900/60 shadow-lg">
      <div className="bg-ocean-850 px-4 py-2.5 border-b border-ocean-700/60 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Database className="w-4 h-4 text-cyan-400" />
          <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
            {title}
          </h4>
        </div>
        <span className="text-[11px] font-mono text-cyan-400/80 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
          {evidence.length} Corroborating Signals
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-ocean-900/80 text-slate-400 font-medium border-b border-ocean-800/80">
            <tr>
              <th className="py-2.5 px-3">Data Point</th>
              <th className="py-2.5 px-3">Observed Value</th>
              <th className="py-2.5 px-3 hidden sm:table-cell">Data Source</th>
              <th className="py-2.5 px-3 hidden md:table-cell">Timestamp</th>
              <th className="py-2.5 px-3">Contributing Agent</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ocean-800/50">
            {evidence.map((item, idx) => (
              <tr key={idx} className="hover:bg-ocean-800/30 transition-colors">
                <td className="py-2 px-3 font-medium text-slate-200">
                  <div className="flex items-center space-x-1.5">
                    <Activity className="w-3 h-3 text-cyan-400/70 shrink-0" />
                    <span>{item.dataPoint}</span>
                  </div>
                </td>
                <td className="py-2 px-3 font-mono font-semibold text-cyan-300">
                  {item.value}
                </td>
                <td className="py-2 px-3 text-slate-400 hidden sm:table-cell text-[11px]">
                  {item.source}
                </td>
                <td className="py-2 px-3 text-slate-400 hidden md:table-cell text-[11px]">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>{item.timestamp}</span>
                  </div>
                </td>
                <td className="py-2 px-3">
                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-ocean-800 border border-ocean-700 text-teal-300">
                    <Bot className="w-3 h-3 text-teal-400" />
                    <span>{item.agent}</span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EvidenceTable;
