import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Cpu,
  Radio,
  Wind,
  Waves,
  Satellite,
  Compass,
  Fish,
  ShieldAlert,
  Layers
} from 'lucide-react';

const agentIcons = {
  'Coordinator Agent': Cpu,
  'Geospatial Agent': Compass,
  'Weather Agent': Wind,
  'Ocean Agent': Waves,
  'Earth Observation Agent': Satellite,
  'Fishing Zone Agent': Fish,
  'Risk Agent': ShieldAlert,
  'Evidence Agent': Layers
};

const AgentExecutionVisualizer = ({ executionSteps = [], agentsUsed = [], isExecuting = false }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!isExecuting && (!agentsUsed || agentsUsed.length === 0) && (!executionSteps || executionSteps.length === 0)) {
    return null;
  }

  const totalTimeMs = agentsUsed.reduce((acc, a) => acc + (a.latencyMs || 0), 0) || 75;

  return (
    <div className="my-4 border border-cyan-900/60 rounded-xl overflow-hidden bg-ocean-950/90 shadow-xl transition-all">
      {/* Header */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-gradient-to-r from-ocean-900 via-ocean-850 to-ocean-900 px-4 py-3 border-b border-cyan-900/40 flex items-center justify-between cursor-pointer hover:bg-ocean-800/40 transition-colors"
      >
        <div className="flex items-center space-x-2.5">
          <div className="relative">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          </div>
          <span className="text-xs font-bold text-cyan-200 uppercase tracking-wider">
            Collaborative Multi-Agent Execution Pipeline
          </span>
          <span className="bg-cyan-950 text-cyan-400 text-[10px] px-2 py-0.5 rounded-full border border-cyan-800/60 font-mono">
            {agentsUsed.length || 7} Agents Active
          </span>
        </div>

        <div className="flex items-center space-x-3 text-xs text-slate-400">
          <div className="flex items-center space-x-1 font-mono text-[11px] text-teal-400">
            <Clock className="w-3.5 h-3.5" />
            <span>{totalTimeMs} ms</span>
          </div>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Workflow Graph Architecture Diagram */}
          <div className="bg-ocean-900/60 border border-ocean-800 rounded-lg p-3">
            <div className="text-[11px] font-semibold text-slate-400 mb-2 flex items-center justify-between">
              <span>ORCHESTRATION TOPOLOGY</span>
              <span className="text-cyan-400 font-mono text-[10px]">Parallel Asynchronous Mesh</span>
            </div>

            {/* Visual Node Flow */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center text-center text-xs">
              {/* Step 1: Input Query */}
              <div className="bg-ocean-850 border border-ocean-700/60 rounded p-2 flex flex-col items-center">
                <Radio className="w-4 h-4 text-cyan-400 mb-1" />
                <span className="font-semibold text-slate-200">Query Parsing</span>
                <span className="text-[10px] text-slate-400">Natural Language</span>
              </div>

              {/* Step 2: Coordinator */}
              <div className="bg-ocean-800/80 border border-cyan-500/40 rounded p-2 flex flex-col items-center shadow-sm">
                <Cpu className="w-4 h-4 text-cyan-300 mb-1" />
                <span className="font-semibold text-cyan-200">Coordinator Agent</span>
                <span className="text-[10px] text-teal-400 font-mono">Intent & Routing</span>
              </div>

              {/* Step 3: Domain Specialists Mesh */}
              <div className="bg-ocean-850 border border-ocean-700/60 rounded p-2 flex flex-col items-center">
                <div className="flex space-x-1 mb-1">
                  <Wind className="w-3.5 h-3.5 text-sky-400" />
                  <Waves className="w-3.5 h-3.5 text-blue-400" />
                  <Satellite className="w-3.5 h-3.5 text-teal-400" />
                  <Fish className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <span className="font-semibold text-slate-200">Domain Agents</span>
                <span className="text-[10px] text-slate-400">Weather, Ocean, EO, PFZ</span>
              </div>

              {/* Step 4: Evidence & Synthesis */}
              <div className="bg-ocean-850 border border-emerald-500/30 rounded p-2 flex flex-col items-center">
                <Layers className="w-4 h-4 text-emerald-400 mb-1" />
                <span className="font-semibold text-emerald-300">Evidence Fusion</span>
                <span className="text-[10px] text-slate-400 font-mono">Verified Synthesis</span>
              </div>
            </div>
          </div>

          {/* Detailed Agent Status Pill Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {agentsUsed.map((agent, i) => {
              const IconComp = agentIcons[agent.name] || Cpu;
              return (
                <div
                  key={i}
                  className="bg-ocean-900/80 border border-ocean-800 rounded-lg p-2.5 flex items-center justify-between hover:border-cyan-700/50 transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 rounded-md bg-ocean-800 text-cyan-400">
                      <IconComp className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-200">{agent.name}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[120px]">{agent.role}</div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end">
                    <span className="inline-flex items-center text-[10px] text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3 h-3 mr-0.5 text-emerald-400" />
                      Done
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {agent.latencyMs ? `${agent.latencyMs}ms` : '<10ms'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentExecutionVisualizer;
