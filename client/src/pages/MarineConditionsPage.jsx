import React, { useState, useEffect } from 'react';
import {
  Waves,
  Thermometer,
  Wind,
  Sparkles,
  ArrowRightLeft,
  Compass,
  ShieldAlert,
  Fish,
  BarChart2,
  RefreshCw,
  Info
} from 'lucide-react';
import { marineService } from '../services/api';
import { useLocation } from '../context/LocationContext';
import RiskBadge from '../components/common/RiskBadge';
import ConfidenceBadge from '../components/common/ConfidenceBadge';
import DisclaimerBanner from '../components/common/DisclaimerBanner';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid
} from 'recharts';

const MarineConditionsPage = () => {
  const { currentRegion, allRegions } = useLocation();

  // Single region conditions
  const [conditions, setConditions] = useState(null);
  const [loading, setLoading] = useState(true);

  // Comparison feature state
  const [locA, setLocA] = useState('mumbai');
  const [locB, setLocB] = useState('goa');
  const [comparison, setComparison] = useState(null);
  const [comparing, setComparing] = useState(false);

  useEffect(() => {
    const fetchConditions = async () => {
      setLoading(true);
      try {
        const res = await marineService.getConditions(currentRegion.lat, currentRegion.lng, currentRegion.id);
        setConditions(res.currentConditions);
      } catch (err) {
        console.warn('Conditions fetch error:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchConditions();
  }, [currentRegion]);

  const handleRunComparison = async () => {
    setComparing(true);
    try {
      const res = await marineService.compare(locA, locB);
      setComparison(res);
    } catch (err) {
      console.warn('Comparison error:', err.message);
    } finally {
      setComparing(false);
    }
  };

  useEffect(() => {
    handleRunComparison();
  }, [locA, locB]);

  const comparisonChartData = comparison
    ? [
        { metric: 'SST (°C)', [comparison.locationA.name]: comparison.locationA.metrics.sst, [comparison.locationB.name]: comparison.locationB.metrics.sst },
        { metric: 'Chlorophyll (mg/m³)', [comparison.locationA.name]: comparison.locationA.metrics.chlorophyll, [comparison.locationB.name]: comparison.locationB.metrics.chlorophyll },
        { metric: 'Wave Height (m)', [comparison.locationA.name]: comparison.locationA.metrics.waveHeight, [comparison.locationB.name]: comparison.locationB.metrics.waveHeight },
        { metric: 'Wind Speed (x10 km/h)', [comparison.locationA.name]: comparison.locationA.metrics.windSpeed / 10, [comparison.locationB.name]: comparison.locationB.metrics.windSpeed / 10 },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-ocean-900 via-ocean-850 to-ocean-900 border border-ocean-700/60 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 mb-1">
          <Waves className="w-4 h-4" />
          <span>HYDRODYNAMICS, OCEANOGRAPHY & METEOROLOGY</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-100 font-mono tracking-tight">
          Marine Conditions & Comparative Analysis
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Comprehensive ocean state metrics and side-by-side coastal sector benchmarking.
        </p>
      </div>

      {/* SECTION 1: Current Sector In-Depth Metrics */}
      <div className="bg-ocean-900/80 border border-ocean-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-200">
            Current Environmental Baseline: {currentRegion.name} ({currentRegion.sea})
          </h3>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
            Real-Time Simulated In-Situ
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-ocean-950 border border-ocean-850">
            <span className="text-slate-400 text-[11px] block">Sea Surface Temp (SST)</span>
            <span className="text-lg font-bold font-mono text-cyan-300 mt-1 block">
              {loading ? '--' : `${conditions?.sst || 27.6}°C`}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-ocean-950 border border-ocean-850">
            <span className="text-slate-400 text-[11px] block">Chlorophyll-a Density</span>
            <span className="text-lg font-bold font-mono text-emerald-400 mt-1 block">
              {loading ? '--' : `${conditions?.chlorophyll || 1.85} mg/m³`}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-ocean-950 border border-ocean-850">
            <span className="text-slate-400 text-[11px] block">Wave Swell Height</span>
            <span className="text-lg font-bold font-mono text-slate-100 mt-1 block">
              {loading ? '--' : `${conditions?.waveHeight || 1.1} m`}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-ocean-950 border border-ocean-850">
            <span className="text-slate-400 text-[11px] block">Surface Wind Velocity</span>
            <span className="text-lg font-bold font-mono text-slate-100 mt-1 block">
              {loading ? '--' : `${conditions?.windSpeed || 14.5} km/h (${conditions?.windDirection || 'WSW'})`}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-ocean-950 border border-ocean-850">
            <span className="text-slate-400 text-[11px] block">Tidal Cycle</span>
            <span className="text-sm font-bold font-mono text-teal-300 mt-1 block">
              {loading ? '--' : (conditions?.tideStatus || 'Ebb Tide (+0.8m)')}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-ocean-950 border border-ocean-850">
            <span className="text-slate-400 text-[11px] block">Atmospheric Visibility</span>
            <span className="text-sm font-bold font-mono text-slate-200 mt-1 block">
              {loading ? '--' : `${conditions?.visibility || 9.5} km`}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-ocean-950 border border-ocean-850">
            <span className="text-slate-400 text-[11px] block">Fishing Zone Suitability</span>
            <span className="text-sm font-bold font-mono text-cyan-300 mt-1 block">
              {loading ? '--' : (conditions?.fishingSuitability || 'HIGH')}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-ocean-950 border border-ocean-850">
            <span className="text-slate-400 text-[11px] block">Maritime Risk Level</span>
            <span className="mt-1 block">
              <RiskBadge riskLevel={conditions?.riskLevel || 'LOW'} score={conditions?.riskScore || 20} />
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 2: Interactive Location Comparison Tool */}
      <div className="bg-ocean-900/80 border border-cyan-900/60 rounded-2xl p-5 sm:p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-ocean-800 pb-4">
          <div>
            <div className="flex items-center space-x-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-0.5">
              <ArrowRightLeft className="w-4 h-4" />
              <span>Multi-Location Spatial Comparison Engine</span>
            </div>
            <h3 className="text-base font-bold text-slate-100">
              Benchmarking Coastal Regions ({comparison?.distanceBetweenKm || 400} km separation)
            </h3>
          </div>

          {/* Location Selectors */}
          <div className="flex items-center space-x-2">
            <select
              value={locA}
              onChange={(e) => setLocA(e.target.value)}
              className="bg-ocean-950 border border-cyan-800/80 rounded-xl px-3 py-1.5 text-xs text-slate-100 font-semibold focus:outline-none focus:border-cyan-400 cursor-pointer"
            >
              {allRegions.map((r) => (
                <option key={r.id} value={r.id}>
                  Location A: {r.name}
                </option>
              ))}
            </select>

            <span className="text-xs text-slate-500 font-bold font-mono">VS</span>

            <select
              value={locB}
              onChange={(e) => setLocB(e.target.value)}
              className="bg-ocean-950 border border-teal-800/80 rounded-xl px-3 py-1.5 text-xs text-slate-100 font-semibold focus:outline-none focus:border-teal-400 cursor-pointer"
            >
              {allRegions.map((r) => (
                <option key={r.id} value={r.id}>
                  Location B: {r.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Side-by-Side Cards */}
        {comparison && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card Location A */}
            <div className="p-4 rounded-xl bg-ocean-950/90 border border-cyan-800/60 space-y-3">
              <div className="flex items-center justify-between border-b border-ocean-800 pb-2">
                <div>
                  <h4 className="text-sm font-bold text-cyan-300">{comparison.locationA.name}</h4>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {comparison.locationA.sea} • {comparison.locationA.state}
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                  Target Sector A
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="text-slate-400">SST: <strong className="text-slate-100">{comparison.locationA.metrics.sst}°C</strong></div>
                <div className="text-slate-400">Chlorophyll: <strong className="text-emerald-400">{comparison.locationA.metrics.chlorophyll} mg/m³</strong></div>
                <div className="text-slate-400">Wave Height: <strong className="text-blue-300">{comparison.locationA.metrics.waveHeight} m</strong></div>
                <div className="text-slate-400">Surface Wind: <strong className="text-slate-100">{comparison.locationA.metrics.windSpeed} km/h</strong></div>
              </div>

              <div className="pt-2 border-t border-ocean-800 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">
                  Suitability: <strong className="text-teal-400">{comparison.locationA.metrics.fishingSuitability}</strong>
                </span>
                <RiskBadge riskLevel={comparison.locationA.metrics.riskLevel} score={comparison.locationA.metrics.riskScore} />
              </div>
            </div>

            {/* Card Location B */}
            <div className="p-4 rounded-xl bg-ocean-950/90 border border-teal-800/60 space-y-3">
              <div className="flex items-center justify-between border-b border-ocean-800 pb-2">
                <div>
                  <h4 className="text-sm font-bold text-teal-300">{comparison.locationB.name}</h4>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {comparison.locationB.sea} • {comparison.locationB.state}
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-950 text-teal-400 border border-teal-800">
                  Target Sector B
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="text-slate-400">SST: <strong className="text-slate-100">{comparison.locationB.metrics.sst}°C</strong></div>
                <div className="text-slate-400">Chlorophyll: <strong className="text-emerald-400">{comparison.locationB.metrics.chlorophyll} mg/m³</strong></div>
                <div className="text-slate-400">Wave Height: <strong className="text-blue-300">{comparison.locationB.metrics.waveHeight} m</strong></div>
                <div className="text-slate-400">Surface Wind: <strong className="text-slate-100">{comparison.locationB.metrics.windSpeed} km/h</strong></div>
              </div>

              <div className="pt-2 border-t border-ocean-800 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">
                  Suitability: <strong className="text-teal-400">{comparison.locationB.metrics.fishingSuitability}</strong>
                </span>
                <RiskBadge riskLevel={comparison.locationB.metrics.riskLevel} score={comparison.locationB.metrics.riskScore} />
              </div>
            </div>
          </div>
        )}

        {/* Comparative Analysis Narrative */}
        {comparison && (
          <div className="p-4 rounded-xl bg-ocean-950/80 border border-ocean-800 text-xs text-slate-300 space-y-2">
            <div className="font-semibold text-slate-200 flex items-center space-x-1.5">
              <Info className="w-4 h-4 text-cyan-400" />
              <span>Comparative Synthesis & Criteria Breakdown:</span>
            </div>
            <p className="leading-relaxed text-slate-400">{comparison.analysisSummary}</p>
            <p className="text-[11px] text-slate-500 italic">{comparison.disclaimer}</p>
          </div>
        )}

        {/* Comparative Bar Chart */}
        {comparison && (
          <div className="bg-ocean-950/80 border border-ocean-800 rounded-xl p-4">
            <h4 className="text-xs font-bold text-slate-300 mb-3 uppercase tracking-wider font-mono">
              Comparative Metrics Visualization
            </h4>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#112344" />
                  <XAxis dataKey="metric" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#0c1a33', borderColor: '#19335f', borderRadius: 8, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                  <Bar dataKey={comparison.locationA.name} fill="#06b6d4" radius={[4, 4, 0, 0]} />
                  <Bar dataKey={comparison.locationB.name} fill="#14b8a6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      <DisclaimerBanner />
    </div>
  );
};

export default MarineConditionsPage;
