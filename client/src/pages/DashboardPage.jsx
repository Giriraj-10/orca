import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Thermometer,
  Sparkles,
  Waves,
  Wind,
  Compass,
  Fish,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Bot,
  Activity,
  Layers,
  MapPin,
  RefreshCw
} from 'lucide-react';
import { useLocation } from '../context/LocationContext';
import { useAuth } from '../context/AuthContext';
import { marineService, alertService } from '../services/api';
import RiskBadge from '../components/common/RiskBadge';
import ConfidenceBadge from '../components/common/ConfidenceBadge';
import DisclaimerBanner from '../components/common/DisclaimerBanner';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';

const DashboardPage = () => {
  const { currentRegion } = useLocation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [conditions, setConditions] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quickQuery, setQuickQuery] = useState('');

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [condRes, alertRes] = await Promise.all([
        marineService.getConditions(currentRegion.lat, currentRegion.lng, currentRegion.id),
        alertService.getAlerts(currentRegion.id)
      ]);
      setConditions(condRes.currentConditions);
      setAlerts(alertRes.data || []);
    } catch (err) {
      console.warn('Dashboard fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [currentRegion]);

  const handleQuickAsk = (e) => {
    e.preventDefault();
    if (quickQuery.trim()) {
      navigate('/assistant', { state: { initialQuery: quickQuery } });
    }
  };

  // Synthetic trend array for Recharts based on current metrics
  const mockTrendData = [
    { time: '04:00', sst: (conditions?.sst || 27.5) - 0.4, chl: (conditions?.chlorophyll || 1.8) - 0.15, wave: 0.9, wind: 11 },
    { time: '07:00', sst: (conditions?.sst || 27.5) - 0.2, chl: (conditions?.chlorophyll || 1.8) + 0.1, wave: 1.0, wind: 13 },
    { time: '10:00', sst: (conditions?.sst || 27.5) + 0.1, chl: (conditions?.chlorophyll || 1.8) + 0.25, wave: (conditions?.waveHeight || 1.1), wind: (conditions?.windSpeed || 14) },
    { time: '13:00', sst: (conditions?.sst || 27.5) + 0.5, chl: (conditions?.chlorophyll || 1.8) + 0.05, wave: 1.2, wind: 16 },
    { time: '16:00', sst: (conditions?.sst || 27.5) + 0.3, chl: (conditions?.chlorophyll || 1.8) - 0.1, wave: 1.1, wind: 15 },
    { time: '19:00', sst: (conditions?.sst || 27.5), chl: (conditions?.chlorophyll || 1.8), wave: 1.0, wind: 12 },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner: Region & Quick Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-gradient-to-r from-ocean-900 via-ocean-850 to-ocean-900 border border-ocean-700/60 rounded-2xl p-4 sm:p-6 shadow-xl">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 mb-1">
            <MapPin className="w-3.5 h-3.5" />
            <span>OPERATIONAL SECTOR: {currentRegion.name.toUpperCase()} ({currentRegion.sea})</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-100 font-mono tracking-tight">
            Marine Intelligence Overview
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Logged in as <span className="text-slate-200 font-semibold">{user?.name}</span> ({user?.role})
          </p>
        </div>

        {/* Quick Conversational Prompt Input */}
        <form onSubmit={handleQuickAsk} className="flex items-center w-full lg:w-96 relative">
          <input
            type="text"
            value={quickQuery}
            onChange={(e) => setQuickQuery(e.target.value)}
            placeholder="Ask ORCA AI (e.g. Find fishing zones near Mumbai)..."
            className="w-full pl-9 pr-24 py-2.5 bg-ocean-950/90 border border-cyan-800/60 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors shadow-inner"
          />
          <Bot className="w-4 h-4 text-cyan-400 absolute left-3 top-3" />
          <button
            type="submit"
            className="absolute right-1.5 top-1.5 px-3 py-1 bg-cyan-500 hover:bg-cyan-400 text-ocean-950 text-xs font-bold rounded-lg transition-colors flex items-center space-x-1"
          >
            <span>Ask</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </form>
      </div>

      {/* Top 6 KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
        {/* Metric 1: SST */}
        <div className="bg-ocean-900/70 border border-ocean-800 rounded-xl p-4 flex flex-col justify-between hover:border-cyan-700/50 transition-all">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Sea Temp (SST)</span>
            <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-400">
              <Thermometer className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-slate-100">
              {loading ? '--' : `${conditions?.sst || 27.6}°C`}
            </div>
            <div className="text-[10px] text-cyan-400 mt-1 font-mono">Thermal Layer</div>
          </div>
        </div>

        {/* Metric 2: Chlorophyll-a */}
        <div className="bg-ocean-900/70 border border-ocean-800 rounded-xl p-4 flex flex-col justify-between hover:border-cyan-700/50 transition-all">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Chlorophyll-a</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-emerald-300">
              {loading ? '--' : `${conditions?.chlorophyll || 1.85}`}
              <span className="text-xs font-normal text-slate-400 ml-1">mg/m³</span>
            </div>
            <div className="text-[10px] text-emerald-400 mt-1 font-mono">Satellite OCM-3</div>
          </div>
        </div>

        {/* Metric 3: Wave Height */}
        <div className="bg-ocean-900/70 border border-ocean-800 rounded-xl p-4 flex flex-col justify-between hover:border-cyan-700/50 transition-all">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Wave Height</span>
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
              <Waves className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-slate-100">
              {loading ? '--' : `${conditions?.waveHeight || 1.1} m`}
            </div>
            <div className="text-[10px] text-slate-400 mt-1 truncate">
              {conditions?.seaCondition || 'Moderate'}
            </div>
          </div>
        </div>

        {/* Metric 4: Surface Wind */}
        <div className="bg-ocean-900/70 border border-ocean-800 rounded-xl p-4 flex flex-col justify-between hover:border-cyan-700/50 transition-all">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Surface Wind</span>
            <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400">
              <Wind className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-slate-100">
              {loading ? '--' : `${conditions?.windSpeed || 14.5}`}
              <span className="text-xs font-normal text-slate-400 ml-1">km/h</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1 font-mono">
              Dir: {conditions?.windDirection || 'WSW'}
            </div>
          </div>
        </div>

        {/* Metric 5: Fishing Suitability */}
        <div className="bg-ocean-900/70 border border-ocean-800 rounded-xl p-4 flex flex-col justify-between hover:border-cyan-700/50 transition-all">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Fishing Zone</span>
            <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400">
              <Fish className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-bold font-mono text-cyan-300">
              {loading ? '--' : (conditions?.fishingSuitability || 'HIGH')}
            </div>
            <div className="text-[10px] text-teal-400 mt-1 font-mono">
              Conf: {Math.round((conditions?.fishingConfidence || 0.88) * 100)}%
            </div>
          </div>
        </div>

        {/* Metric 6: Assessed Risk */}
        <div className="bg-ocean-900/70 border border-ocean-800 rounded-xl p-4 flex flex-col justify-between hover:border-cyan-700/50 transition-all">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Marine Risk</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-lg font-bold font-mono">
              <RiskBadge riskLevel={conditions?.riskLevel || 'LOW'} score={conditions?.riskScore || 20} />
            </div>
            <div className="text-[10px] text-slate-400 mt-1 truncate">
              {conditions?.tideStatus || 'Ebb Tide (+0.8m)'}
            </div>
          </div>
        </div>
      </div>

      {/* Middle Section: Interactive Map Preview + Suggested Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Card */}
        <div className="lg:col-span-2 bg-ocean-900/70 border border-ocean-800 rounded-2xl p-5 shadow-xl flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-slate-200">Interactive Marine Map Preview</h3>
            </div>
            <NavLink
              to="/map"
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
            >
              <span>Full Map & Layers</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </NavLink>
          </div>

          {/* Interactive Map Visual Banner */}
          <div className="relative flex-1 min-h-[260px] rounded-xl overflow-hidden border border-ocean-800 bg-ocean-950 flex flex-col items-center justify-center p-6 text-center group">
            <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#19335f_1px,transparent_1px)] [background-size:16px_16px]" />
            <div className="w-16 h-16 rounded-2xl bg-cyan-950/80 border border-cyan-800/60 flex items-center justify-center text-cyan-400 mb-3 shadow-xl group-hover:scale-110 transition-transform">
              <Compass className="w-8 h-8 animate-pulse-subtle" />
            </div>
            <h4 className="text-base font-bold text-slate-100 z-10">
              Leaflet Geospatial Canvas Ready
            </h4>
            <p className="text-xs text-slate-400 max-w-md mt-1 z-10">
              Real-time SST gradients, chlorophyll isotherms, high wave risk polygons, and potential fishing hotspots around {currentRegion.name}.
            </p>
            <NavLink
              to="/map"
              className="mt-4 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded-xl text-xs font-semibold z-10 transition-colors"
            >
              Launch Interactive Map View
            </NavLink>
          </div>
        </div>

        {/* Right Side: Suggested Marine Questions & Assistant Teaser */}
        <div className="bg-ocean-900/70 border border-ocean-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Bot className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-slate-200">AI Marine Assistant</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Collaborative multi-agent reasoning on demand. Select a recommended query to see agents execute:
            </p>

            <div className="space-y-2">
              {[
                `Find potential fishing zones near ${currentRegion.name.split(' ')[0]}`,
                'Is it safe to go fishing tomorrow morning?',
                'Show areas with favorable sea conditions',
                'Compare Mumbai and Goa marine conditions',
                'What is the SST and chlorophyll concentration here?'
              ].map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => navigate('/assistant', { state: { initialQuery: prompt } })}
                  className="w-full text-left p-2.5 rounded-xl bg-ocean-950/80 hover:bg-ocean-800 border border-ocean-800 hover:border-cyan-800/80 text-xs text-slate-300 hover:text-cyan-200 transition-all flex items-center justify-between group"
                >
                  <span className="truncate mr-2 font-mono text-[11px]">{prompt}</span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 text-cyan-400 shrink-0 transition-all" />
                </button>
              ))}
            </div>
          </div>

          <NavLink
            to="/assistant"
            className="mt-4 w-full py-2.5 bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-500 hover:to-teal-400 text-ocean-950 font-bold text-xs rounded-xl text-center shadow-md transition-all flex items-center justify-center space-x-1"
          >
            <span>Open Conversational Assistant</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </NavLink>
        </div>
      </div>

      {/* Marine Trends Section: Recharts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend 1: SST vs Chlorophyll */}
        <div className="bg-ocean-900/70 border border-ocean-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-200">Diurnal SST vs Chlorophyll-a</h3>
              <p className="text-[11px] text-slate-400">Synchronized satellite and in-situ cycle</p>
            </div>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
              EO Simulation
            </span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockTrendData}>
                <defs>
                  <linearGradient id="sstColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="chlColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#112344" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0c1a33', borderColor: '#19335f', borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="sst" name="SST (°C)" stroke="#06b6d4" fillOpacity={1} fill="url(#sstColor)" />
                <Area type="monotone" dataKey="chl" name="Chlorophyll (mg/m³)" stroke="#10b981" fillOpacity={1} fill="url(#chlColor)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Trend 2: Wave Height vs Surface Wind Speed */}
        <div className="bg-ocean-900/70 border border-ocean-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-200">Wave Height vs Surface Wind</h3>
              <p className="text-[11px] text-slate-400">Hydrodynamic sea state correlation</p>
            </div>
            <span className="text-[10px] font-mono text-teal-400 bg-teal-950/60 px-2 py-0.5 rounded border border-teal-800/40">
              Buoy Network
            </span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#112344" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0c1a33', borderColor: '#19335f', borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="wave" name="Wave Height (m)" stroke="#38bdf8" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="wind" name="Wind Speed (km/h)" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Active Maritime Alerts Ticker */}
      {alerts.length > 0 && (
        <div className="bg-ocean-900/70 border border-ocean-800 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
            <AlertTriangle className="w-4 h-4" />
            <span>Active Coastal Maritime Bulletins ({alerts.length})</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {alerts.slice(0, 2).map((a, i) => (
              <div key={i} className="p-3 rounded-xl bg-ocean-950/80 border border-ocean-800 text-xs text-slate-300">
                <div className="font-semibold text-slate-200 mb-1">{a.title}</div>
                <p className="text-slate-400 text-[11px]">{a.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mandatory Scientific Disclaimer Banner */}
      <DisclaimerBanner />
    </div>
  );
};

export default DashboardPage;
