import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Compass,
  Cpu,
  Waves,
  Satellite,
  Fish,
  ShieldAlert,
  ArrowRight,
  Database,
  BarChart3,
  CheckCircle2,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import DisclaimerBanner from '../components/common/DisclaimerBanner';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-ocean-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navigation */}
      <nav className="border-b border-ocean-800/80 bg-ocean-950/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-teal-400 flex items-center justify-center shadow-lg shadow-cyan-900/40">
            <span className="font-extrabold text-white text-lg font-mono">OR</span>
          </div>
          <div>
            <h1 className="text-xl font-bold font-mono tracking-wider text-slate-100">ORCA</h1>
            <p className="text-[10px] text-cyan-400 font-semibold tracking-tight uppercase">
              Smart India Hackathon Prototype
            </p>
          </div>
        </div>

        <div className="hidden md:flex items-center space-x-6 text-sm text-slate-300">
          <a href="#problem" className="hover:text-cyan-300 transition-colors">The Challenge</a>
          <a href="#how-it-works" className="hover:text-cyan-300 transition-colors">Architecture</a>
          <a href="#multi-agent" className="hover:text-cyan-300 transition-colors">Agents</a>
          <a href="#data-sources" className="hover:text-cyan-300 transition-colors">Earth Observation</a>
        </div>

        <div className="flex items-center space-x-3">
          <NavLink
            to="/login"
            className="text-xs sm:text-sm font-semibold text-slate-300 hover:text-white px-3 py-2 rounded-lg transition-colors"
          >
            Sign In
          </NavLink>
          <NavLink
            to="/dashboard"
            className="text-xs sm:text-sm font-semibold bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-ocean-950 px-4 py-2 rounded-xl shadow-md shadow-cyan-500/20 transition-all font-mono flex items-center space-x-1.5"
          >
            <span>Launch Platform</span>
            <ArrowRight className="w-4 h-4" />
          </NavLink>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 py-20 lg:py-28 overflow-hidden flex flex-col items-center text-center">
        {/* Ambient background glowing orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-700/60 text-cyan-300 text-xs font-mono mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>MARINE ECOSYSTEM REASONING WITH COLLABORATIVE AGENTS</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-400 max-w-5xl tracking-tight leading-[1.15]">
          Intelligent Marine Reasoning Through Collaborative AI Agents
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-3xl leading-relaxed">
          ORCA integrates Satellite Earth Observation, Sea Surface Temperature, Chlorophyll-a concentration, ocean hydrodynamic models, and synoptic weather data. Autonomous specialized agents collaboratively reason to provide verified, transparent insights for fishermen, researchers, and maritime authorities.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-wrap gap-4 justify-center items-center">
          <NavLink
            to="/dashboard"
            className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-ocean-950 font-bold text-sm sm:text-base shadow-xl shadow-cyan-500/25 transition-all flex items-center space-x-2"
          >
            <span>Open Marine Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </NavLink>
          <NavLink
            to="/assistant"
            className="px-6 py-3.5 rounded-xl bg-ocean-900/80 hover:bg-ocean-800 text-slate-200 border border-ocean-700 font-semibold text-sm sm:text-base transition-all flex items-center space-x-2"
          >
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>Test Multi-Agent Reasoning</span>
          </NavLink>
        </div>

        {/* Live System Capabilities Bar */}
        <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl w-full text-left">
          <div className="p-4 rounded-xl bg-ocean-900/60 border border-ocean-800/80">
            <div className="text-cyan-400 font-mono text-xl font-bold">100% Offline</div>
            <div className="text-xs text-slate-400 mt-1">Self-contained resilient Demo Mode with Indian coastal baselines</div>
          </div>
          <div className="p-4 rounded-xl bg-ocean-900/60 border border-ocean-800/80">
            <div className="text-teal-400 font-mono text-xl font-bold">8 Agents</div>
            <div className="text-xs text-slate-400 mt-1">Coordinator, Weather, Ocean, EO, PFZ, Geospatial, Risk, Evidence</div>
          </div>
          <div className="p-4 rounded-xl bg-ocean-900/60 border border-ocean-800/80">
            <div className="text-sky-400 font-mono text-xl font-bold">Traceable</div>
            <div className="text-xs text-slate-400 mt-1">Full sensor attribution and verifiable evidence panel on every query</div>
          </div>
          <div className="p-4 rounded-xl bg-ocean-900/60 border border-ocean-800/80">
            <div className="text-emerald-400 font-mono text-xl font-bold">SIH Ready</div>
            <div className="text-xs text-slate-400 mt-1">Tested for Mumbai, Goa, Kochi, Chennai, Vizag, Odisha, Veraval, Port Blair</div>
          </div>
        </div>
      </section>

      {/* The Problem Section */}
      <section id="problem" className="px-6 py-16 bg-ocean-900/40 border-y border-ocean-800/60">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-xs font-bold text-cyan-400 uppercase tracking-widest font-mono">The Marine Data Challenge</h2>
            <p className="text-3xl font-extrabold text-slate-100 mt-2">
              Fragmented Data Leaves Coastal Stakeholders in the Dark
            </p>
            <p className="text-slate-400 text-sm mt-3">
              Traditional oceanographic and meteorological systems operate in silos. Fishermen and coastal managers are forced to navigate complex raw charts with zero transparent reasoning.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-ocean-900/70 border border-ocean-800">
              <div className="w-10 h-10 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center mb-4">
                <Satellite className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-200 mb-2">Inaccessible EO Telemetry</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Raw multispectral chlorophyll and thermal gradient arrays require specialized remote sensing expertise to interpret, preventing practical utilization by local coastal communities.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-ocean-900/70 border border-ocean-800">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-200 mb-2">Opaque Safety Advisories</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Safety bulletins often fail to explain the contributing hydro-meteorological forces (swell period, wave-wind cross chop), making risk comprehension difficult for small vessel captains.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-ocean-900/70 border border-ocean-800">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-4">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-200 mb-2">Hallucinating AI Models</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Generic LLMs hallucinate inaccurate maritime coordinates and ocean temperatures. ORCA solves this through grounded multi-agent evidence fusion.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Multi-Agent Architecture */}
      <section id="multi-agent" className="px-6 py-20 max-w-6xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-xs font-bold text-teal-400 uppercase tracking-widest font-mono">Specialized Intelligence</h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-slate-100 mt-2">
            Meet the 8 Collaborative ORCA Agents
          </p>
          <p className="text-slate-400 text-sm mt-3">
            Each agent is an autonomous software component dedicated to a specific oceanographic, remote sensing, or spatial domain.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { name: 'Coordinator Agent', desc: 'Parses natural language, classifies intent, and delegates tasks asynchronously.', icon: Cpu, color: 'text-cyan-400' },
            { name: 'Weather Agent', desc: 'Evaluates wind speed, direction, squalls, atmospheric pressure, and visibility.', icon: Waves, color: 'text-sky-400' },
            { name: 'Ocean Agent', desc: 'Tracks Sea Surface Temperature (SST), swell wave height, tidal status, and currents.', icon: Waves, color: 'text-blue-400' },
            { name: 'EO Agent', desc: 'Analyzes satellite radiometer feeds for chlorophyll-a and ocean thermal gradients.', icon: Satellite, color: 'text-teal-400' },
            { name: 'Fishing Zone Agent', desc: 'Synthesizes environmental thresholds into potential fishing zone (PFZ) suitability.', icon: Fish, color: 'text-emerald-400' },
            { name: 'Geospatial Agent', desc: 'Resolves coastal points, computes Haversine distances, and handles spatial indexing.', icon: Compass, color: 'text-amber-400' },
            { name: 'Risk Agent', desc: 'Scores seaworthiness and vessel hazard levels based on multi-vector ocean telemetry.', icon: ShieldAlert, color: 'text-rose-400' },
            { name: 'Evidence Agent', desc: 'Audits data lineage, sensor timestamps, and aggregates verified citations.', icon: Database, color: 'text-purple-400' },
          ].map((agent, i) => {
            const IconComp = agent.icon;
            return (
              <div key={i} className="p-5 rounded-2xl bg-ocean-900/60 border border-ocean-800 hover:border-cyan-700/60 transition-all">
                <div className={`p-2.5 rounded-xl bg-ocean-800 w-fit mb-3 ${agent.color}`}>
                  <IconComp className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-200">{agent.name}</h4>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">{agent.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer CTA & Notice */}
      <section className="mt-auto border-t border-ocean-800/80 bg-ocean-950 py-12 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold font-mono text-slate-100">Ready to Experience ORCA?</h3>
            <p className="text-xs text-slate-400 mt-1">Explore interactive maps, collaborative agents, and real-time marine reasoning.</p>
          </div>
          <NavLink
            to="/dashboard"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-ocean-950 font-bold text-sm shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-teal-400 transition-all"
          >
            Launch Prototype Dashboard
          </NavLink>
        </div>

        <div className="max-w-5xl mx-auto mt-8">
          <DisclaimerBanner />
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
