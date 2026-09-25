import React, { useState, useEffect } from 'react';
import {
  Database,
  Satellite,
  Waves,
  Wind,
  Cpu,
  CheckCircle2,
  Clock,
  Radio,
  ExternalLink,
  Layers
} from 'lucide-react';
import { dataService } from '../services/api';
import DisclaimerBanner from '../components/common/DisclaimerBanner';

const categoryIcons = {
  'Earth Observation': Satellite,
  'Oceanographic': Waves,
  'Weather': Wind,
  'Geospatial': Radio,
  'AI Reasoning': Cpu
};

const DataSourcesPage = () => {
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSources = async () => {
      setLoading(true);
      try {
        const res = await dataService.getSources();
        setSources(res.data || []);
      } catch (err) {
        console.warn('Data sources fetch error:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSources();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-ocean-900 via-ocean-850 to-ocean-900 border border-ocean-700/60 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 mb-1">
          <Database className="w-4 h-4" />
          <span>DATA LINEAGE & SCIENTIFIC TRANSPARENCY</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-100 font-mono tracking-tight">
          Integrated Marine Data Sources
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Full attribution of satellite remote sensing, in-situ ocean buoys, and numerical weather model feeds.
        </p>
      </div>

      {/* Architecture Transparency Banner */}
      <div className="p-4 rounded-xl bg-ocean-900/60 border border-ocean-800 text-xs text-slate-300 flex items-start space-x-3">
        <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 shrink-0 mt-0.5">
          <Layers className="w-4 h-4" />
        </div>
        <div>
          <div className="font-bold text-slate-100 mb-0.5">Offline-First Provider Architecture</div>
          <p className="text-slate-400 leading-relaxed">
            All data sources in ORCA implement standard Provider Interfaces (`BaseWeatherProvider`, `BaseOceanProvider`, `BaseEarthObservationProvider`). During hackathon demonstrations, the system runs with realistic simulated coastal datasets. When real API credentials are configured, the system automatically transitions to live feeds without codebase modification.
          </p>
        </div>
      </div>

      {/* Sources Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs">Loading data source manifests...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sources.map((src, idx) => {
            const IconComp = categoryIcons[src.category] || Database;
            return (
              <div
                key={src._id || idx}
                className="bg-ocean-900/80 border border-ocean-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between hover:border-cyan-700/60 transition-all"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2.5">
                      <div className="p-2 rounded-xl bg-ocean-850 border border-ocean-750 text-cyan-400">
                        <IconComp className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block">
                          {src.category}
                        </span>
                        <h3 className="text-sm font-bold text-slate-100">{src.name}</h3>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold">
                        {src.status}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 font-semibold">
                        {src.mode}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    {src.description}
                  </p>

                  <div className="p-3 rounded-xl bg-ocean-950/80 border border-ocean-850 space-y-1 text-[11px] font-mono mb-3">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Provider:</span>
                      <span className="text-slate-200 truncate max-w-[200px]">{src.provider}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Coverage:</span>
                      <span className="text-slate-200">{src.coverage}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Frequency:</span>
                      <span className="text-slate-200">{src.updateFrequency}</span>
                    </div>
                  </div>

                  {src.parameters && src.parameters.length > 0 && (
                    <div className="mb-2">
                      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                        Measured Parameters:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {src.parameters.map((p, pIdx) => (
                          <span
                            key={pIdx}
                            className="px-2 py-0.5 rounded text-[10px] bg-ocean-800 text-cyan-300 border border-ocean-700 font-mono"
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-ocean-800 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>Last Synced: {new Date(src.lastSync).toLocaleTimeString()}</span>
                  </div>
                  <span className="text-emerald-400">Operational</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <DisclaimerBanner />
    </div>
  );
};

export default DataSourcesPage;
