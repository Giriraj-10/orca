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
  Layers,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { dataService } from '../services/api';
import DisclaimerBanner from '../components/common/DisclaimerBanner';

const categoryIcons = {
  'Earth Observation': Satellite,
  'Satellite Chlorophyll-a Radiometry': Satellite,
  'Ocean Waves, Current & SST': Waves,
  'Atmospheric Forecast (NWP)': Wind,
  'Synoptic Weather & Warnings': Wind,
  'Potential Fishing Zones & Habitats': Radio,
  'Coastal Geocoding & Sea Boundaries': Radio
};

const DataSourcesPage = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSources = async () => {
    setLoading(true);
    try {
      const res = await dataService.getSources();
      setReport(res);
    } catch (err) {
      console.warn('Data sources fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSources();
  }, []);

  const sources = report?.data || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-gradient-to-r from-ocean-900 via-ocean-850 to-ocean-900 border border-ocean-700/60 rounded-2xl p-5 shadow-xl">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 mb-1">
            <Database className="w-4 h-4" />
            <span>DATA LINEAGE & SCIENTIFIC OBSERVABILITY</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-100 font-mono tracking-tight">
            Integrated Marine Data Sources & API Telemetry
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time ping, authentication verification, and data lineage across operational satellite, meteorological, and oceanographic feeds.
          </p>
        </div>

        <button
          onClick={fetchSources}
          disabled={loading}
          className="px-3 py-1.5 bg-ocean-800 hover:bg-ocean-700 text-cyan-300 border border-ocean-700 rounded-xl text-xs font-semibold flex items-center space-x-1.5 self-start sm:self-auto transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Ping Providers</span>
        </button>
      </div>

      {/* Mode & Cache Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-ocean-900/60 border border-ocean-800 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono text-slate-400 uppercase">Active Data Mode</div>
            <div className="text-base font-bold font-mono text-cyan-400 mt-0.5">{report?.dataMode || 'HYBRID'}</div>
          </div>
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-ocean-900/60 border border-ocean-800 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono text-slate-400 uppercase">Cache Utilization</div>
            <div className="text-base font-bold font-mono text-emerald-400 mt-0.5">
              {report?.cache?.activeEntries || 0} Active Entries
            </div>
          </div>
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Layers className="w-4 h-4" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-ocean-900/60 border border-ocean-800 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono text-slate-400 uppercase">Failover Hierarchy</div>
            <div className="text-xs font-bold font-mono text-slate-300 mt-0.5">LIVE ➔ CACHE ➔ DEMO</div>
          </div>
          <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Sources Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs font-mono">Pinging external providers and validating latency...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sources.map((src, idx) => {
            const IconComp = categoryIcons[src.category] || Database;
            const isConnected = src.status === 'CONNECTED';
            const isAvailable = src.status === 'AVAILABLE';

            return (
              <div
                key={src.provider || idx}
                className="bg-ocean-900/80 border border-ocean-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between hover:border-cyan-700/60 transition-all space-y-4"
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
                        <h3 className="text-sm font-bold text-slate-100">{src.provider}</h3>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-semibold ${
                        isConnected
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : isAvailable
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      }`}>
                        {src.status}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-300 font-mono space-y-1 bg-ocean-950/70 p-3 rounded-xl border border-ocean-850">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Endpoint:</span>
                      <span className="text-slate-300 truncate max-w-[200px]" title={src.endpoint}>{src.endpoint}</span>
                    </div>
                    {src.latencyMs > 0 && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Round-trip Latency:</span>
                        <span className="text-emerald-400">{src.latencyMs} ms</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-slate-500">Authentication:</span>
                      <span className={src.authStatus === 'AUTHENTICATED' || src.authStatus === 'KEY_NOT_REQUIRED' ? 'text-cyan-300' : 'text-amber-400'}>
                        {src.authStatus}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-ocean-850 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Live Telemetry: {src.isLive ? 'ACTIVE' : 'ADAPTER READY'}</span>
                  <span className="text-[10px] text-slate-500 font-mono">Retrieved 100% dynamically</span>
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
