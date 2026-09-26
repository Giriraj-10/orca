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
  RefreshCw,
  Search,
  Clock,
  CheckCircle2,
  Radio
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
  const {
    currentRegion,
    allRegions,
    selectRegionById,
    searchAndSetLocation,
    useBrowserGeolocation,
    isGpsActive,
    searching,
    timeFilter,
    setTimeFilter,
    targetDate
  } = useLocation();

  const { user } = useAuth();
  const navigate = useNavigate();

  const [conditions, setConditions] = useState(null);
  const [hourlyForecast, setHourlyForecast] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quickQuery, setQuickQuery] = useState('');
  const [locationSearchInput, setLocationSearchInput] = useState('');
  const [dataMeta, setDataMeta] = useState({ isLive: true, source: 'Open-Meteo', dataMode: 'live' });

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [condRes, forecastRes, alertRes] = await Promise.all([
        marineService.getConditions(currentRegion.lat, currentRegion.lng, currentRegion.id, targetDate),
        marineService.getForecast(currentRegion.lat, currentRegion.lng),
        alertService.getAlerts(currentRegion.lat, currentRegion.lng, 100)
      ]);

      setConditions(condRes.currentConditions);
      setHourlyForecast(forecastRes.hourlyForecast || []);
      setAlerts(alertRes.data || []);
      setDataMeta({
        isLive: condRes.isLive,
        dataMode: condRes.dataMode || 'hybrid',
        source: condRes.sources?.marine || 'Open-Meteo Marine API',
        retrievedAt: condRes.retrievedAt
      });
    } catch (err) {
      console.warn('Dashboard fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [currentRegion, targetDate]);

  const handleQuickAsk = (e) => {
    e.preventDefault();
    if (quickQuery.trim()) {
      navigate('/assistant', { state: { initialQuery: quickQuery } });
    }
  };

  const handleLocationSearch = async (e) => {
    e.preventDefault();
    if (locationSearchInput.trim()) {
      await searchAndSetLocation(locationSearchInput.trim());
      setLocationSearchInput('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Dynamic Geocoding Search, Time Selector & Quick AI Prompt */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-gradient-to-r from-ocean-900 via-ocean-850 to-ocean-900 border border-ocean-700/60 rounded-2xl p-4 sm:p-6 shadow-xl">
        <div className="space-y-2">
          {/* Location Badge & Live Status */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-cyan-950 border border-cyan-700/50 text-cyan-300">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span>{currentRegion.name.toUpperCase()} [{currentRegion.lat.toFixed(2)}°N, {currentRegion.lng.toFixed(2)}°E]</span>
            </div>

            {/* Live Data Badge */}
            <div className={`flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
              dataMeta.isLive
                ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40'
                : 'bg-amber-950/80 text-amber-300 border-amber-500/40'
            }`}>
              <Radio className={`w-3 h-3 ${dataMeta.isLive ? 'animate-pulse text-emerald-400' : 'text-amber-400'}`} />
              <span>{dataMeta.isLive ? 'LIVE API DATA' : dataMeta.dataMode === 'hybrid' ? 'HYBRID (CACHE/FALLBACK)' : 'DEMO MODE'}</span>
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-100 font-mono tracking-tight">
            Live Marine Telemetry & Ecosystem Intelligence
          </h2>

          {/* Time Selector Chips */}
          <div className="flex items-center space-x-1 pt-1 overflow-x-auto">
            <Clock className="w-3.5 h-3.5 text-slate-400 mr-1 shrink-0" />
            <span className="text-[11px] font-mono text-slate-400 mr-1 shrink-0">Forecast Time:</span>
            {[
              { id: 'now', label: 'Now' },
              { id: 'today', label: 'Today (14:00)' },
              { id: 'tomorrow_morning', label: 'Tomorrow AM (06:00)' },
              { id: 'tomorrow_afternoon', label: 'Tomorrow PM (14:00)' }
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setTimeFilter(t.id)}
                className={`px-2.5 py-0.5 rounded-lg text-[11px] font-mono font-medium transition-all ${
                  timeFilter === t.id
                    ? 'bg-cyan-500 text-ocean-950 font-bold shadow'
                    : 'bg-ocean-950/80 text-slate-300 hover:text-white border border-ocean-700/60'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right Section: Geocoding Search & AI Prompt */}
        <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 w-full lg:w-96">
          {/* Dynamic Geocoding Search Input */}
          <form onSubmit={handleLocationSearch} className="flex items-center relative w-full">
            <input
              type="text"
              value={locationSearchInput}
              onChange={(e) => setLocationSearchInput(e.target.value)}
              placeholder="Search Indian port or coordinate (e.g. Kochi, Veraval, 15.4, 73.8)..."
              className="w-full pl-9 pr-20 py-2 bg-ocean-950/90 border border-ocean-700 rounded-xl text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-400 transition-colors shadow-inner"
            />
            <Search className="w-4 h-4 text-cyan-400 absolute left-3 top-2.5" />
            <button
              type="submit"
              disabled={searching}
              className="absolute right-1.5 top-1 px-2.5 py-1 bg-ocean-800 hover:bg-ocean-700 text-cyan-300 text-xs font-semibold rounded-lg transition-colors border border-cyan-800/50"
            >
              {searching ? 'Locating...' : 'Locate'}
            </button>
          </form>

          {/* Quick Conversational Prompt Input */}
          <form onSubmit={handleQuickAsk} className="flex items-center relative w-full">
            <input
              type="text"
              value={quickQuery}
              onChange={(e) => setQuickQuery(e.target.value)}
              placeholder="Ask ORCA AI (e.g. Is it safe to fish tomorrow?)..."
              className="w-full pl-9 pr-20 py-2 bg-ocean-950/90 border border-cyan-800/60 rounded-xl text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-400 transition-colors shadow-inner"
            />
            <Bot className="w-4 h-4 text-cyan-400 absolute left-3 top-2.5" />
            <button
              type="submit"
              className="absolute right-1.5 top-1 px-3 py-1 bg-cyan-500 hover:bg-cyan-400 text-ocean-950 text-xs font-bold rounded-lg transition-colors flex items-center space-x-1"
            >
              <span>Ask</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </form>
        </div>
      </div>

      {/* Top 6 KPI Metric Cards Fed from Live Data */}
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
              {loading ? '--' : `${conditions?.sst || 28.0}°C`}
            </div>
            <div className="text-[10px] text-cyan-400 mt-1 font-mono truncate" title="Open-Meteo Marine Hydrodynamics">
              Open-Meteo Marine API
            </div>
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
            <div className="text-2xl font-bold font-mono text-slate-100">
              {loading ? '--' : `${conditions?.chlorophyll || 1.8} mg/m³`}
            </div>
            <div className="text-[10px] text-emerald-400 mt-1 font-mono truncate">
              Satellite / Coastal Front
            </div>
          </div>
        </div>

        {/* Metric 3: Wave Height */}
        <div className="bg-ocean-900/70 border border-ocean-800 rounded-xl p-4 flex flex-col justify-between hover:border-cyan-700/50 transition-all">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Wave Swell</span>
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
              <Waves className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-slate-100">
              {loading ? '--' : `${conditions?.waveHeight || 1.1} m`}
            </div>
            <div className="text-[10px] text-blue-400 mt-1 font-mono truncate">
              {conditions?.seaCondition || 'Moderate Swell'}
            </div>
          </div>
        </div>

        {/* Metric 4: Wind Speed */}
        <div className="bg-ocean-900/70 border border-ocean-800 rounded-xl p-4 flex flex-col justify-between hover:border-cyan-700/50 transition-all">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Surface Wind</span>
            <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400">
              <Wind className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-slate-100">
              {loading ? '--' : `${conditions?.windSpeed || 14} km/h`}
            </div>
            <div className="text-[10px] text-sky-400 mt-1 font-mono">
              Vector: {conditions?.windDirection || 'W'}
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
            <div className="text-lg font-bold font-mono text-slate-100 flex items-center">
              {loading ? '--' : (
                <span className={conditions?.fishingSuitability === 'HIGH' ? 'text-teal-300' : 'text-amber-300'}>
                  {conditions?.fishingSuitability || 'MEDIUM'}
                </span>
              )}
            </div>
            <div className="text-[10px] text-teal-400 mt-1 font-mono">
              Conf: {loading ? '--' : `${Math.round((conditions?.fishingConfidence || 0.84) * 100)}%`}
            </div>
          </div>
        </div>

        {/* Metric 6: Seaworthiness Risk */}
        <div className="bg-ocean-900/70 border border-ocean-800 rounded-xl p-4 flex flex-col justify-between hover:border-cyan-700/50 transition-all">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Risk Score</span>
            <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-lg font-bold font-mono text-slate-100">
              {loading ? '--' : <RiskBadge level={conditions?.riskLevel || 'LOW'} />}
            </div>
            <div className="text-[10px] text-slate-400 mt-1 font-mono">
              Index: {loading ? '--' : `${conditions?.riskScore || 22}/100`}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Dynamic Live Forecast Charts (Consuming Real Hourly Data) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Sea Surface Temperature & Significant Wave Swell */}
        <div className="bg-ocean-900/80 border border-ocean-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-200 font-mono flex items-center space-x-2">
                <Thermometer className="w-4 h-4 text-orange-400" />
                <span>24-Hour Sea Temperature & Wave Swell Trend</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Live hourly forecasts from Open-Meteo Marine Hydrodynamics
              </p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-ocean-800 text-cyan-400 border border-ocean-700">
              HOURLY
            </span>
          </div>

          <div className="h-64 w-full">
            {hourlyForecast.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourlyForecast}>
                  <defs>
                    <linearGradient id="sstGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="waveGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10 }} />
                  <YAxis yAxisId="left" stroke="#f97316" tick={{ fontSize: 10 }} domain={['dataMin - 1', 'dataMax + 1']} />
                  <YAxis yAxisId="right" orientation="right" stroke="#06b6d4" tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#030712', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '11px' }}
                    itemStyle={{ color: '#f8fafc' }}
                  />
                  <Area yAxisId="left" type="monotone" dataKey="sst" name="SST (°C)" stroke="#f97316" strokeWidth={2} fillOpacity={1} fill="url(#sstGradient)" />
                  <Area yAxisId="right" type="monotone" dataKey="waveHeight" name="Wave (m)" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#waveGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                Loading live hydrodynamic timeseries...
              </div>
            )}
          </div>
        </div>

        {/* Chart 2: Surface Wind Velocity & Atmospheric Temperature */}
        <div className="bg-ocean-900/80 border border-ocean-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-200 font-mono flex items-center space-x-2">
                <Wind className="w-4 h-4 text-sky-400" />
                <span>24-Hour Wind Speed & Air Temperature</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Live atmospheric parameters from Open-Meteo High-Resolution Weather Model
              </p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-ocean-800 text-sky-400 border border-ocean-700">
              NUMERICAL MESH
            </span>
          </div>

          <div className="h-64 w-full">
            {hourlyForecast.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={hourlyForecast}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10 }} />
                  <YAxis yAxisId="left" stroke="#38bdf8" tick={{ fontSize: 10 }} />
                  <YAxis yAxisId="right" orientation="right" stroke="#10b981" tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#030712', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '11px' }}
                    itemStyle={{ color: '#f8fafc' }}
                  />
                  <Line yAxisId="left" type="monotone" dataKey="windSpeed" name="Wind (km/h)" stroke="#38bdf8" strokeWidth={2} dot={false} />
                  <Line yAxisId="right" type="monotone" dataKey="temp" name="Air Temp (°C)" stroke="#10b981" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                Loading live meteorological timeseries...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 3: Active Safety Bulletins & Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Maritime Alerts */}
        <div className="lg:col-span-2 bg-ocean-900/80 border border-ocean-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-200 font-mono flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Live Coastal Safety Bulletins & Hazards ({alerts.length})</span>
            </h3>
            <NavLink to="/alerts" className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center space-x-1">
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </NavLink>
          </div>

          <div className="space-y-3">
            {alerts.length === 0 ? (
              <div className="p-4 rounded-xl bg-ocean-950 border border-ocean-800 text-xs text-slate-400">
                No active severe weather warnings for {currentRegion.name}. Sea conditions are within safe operational thresholds.
              </div>
            ) : (
              alerts.slice(0, 3).map((a, idx) => (
                <div
                  key={a.id || idx}
                  className={`p-3.5 rounded-xl border flex items-start space-x-3 transition-colors ${
                    a.severity === 'HIGH' || a.severity === 'SEVERE'
                      ? 'bg-rose-950/20 border-rose-800/60 text-rose-200'
                      : a.severity === 'MODERATE' || a.severity === 'WARNING'
                      ? 'bg-amber-950/20 border-amber-800/60 text-amber-200'
                      : 'bg-emerald-950/20 border-emerald-800/60 text-emerald-200'
                  }`}
                >
                  <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${
                    a.severity === 'HIGH' ? 'text-rose-400' : a.severity === 'MODERATE' ? 'text-amber-400' : 'text-emerald-400'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-100">{a.title}</span>
                      <span className="text-[10px] font-mono text-slate-400">{a.type}</span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">{a.description}</p>
                    <div className="text-[10px] font-mono text-slate-500 mt-1">Source: {a.source || 'IMD / Synoptic Network'}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right 1 Col: Quick Feature Navigation */}
        <div className="bg-ocean-900/80 border border-ocean-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-200 font-mono mb-3">
              Explore Live Modules
            </h3>
            <div className="space-y-2.5">
              <NavLink
                to="/map"
                className="flex items-center justify-between p-3 rounded-xl bg-ocean-950 border border-ocean-800 hover:border-cyan-600 transition-all text-xs"
              >
                <div className="flex items-center space-x-2 text-slate-200">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <span>Interactive Marine GIS Map</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </NavLink>

              <NavLink
                to="/fishing-zones"
                className="flex items-center justify-between p-3 rounded-xl bg-ocean-950 border border-ocean-800 hover:border-teal-600 transition-all text-xs"
              >
                <div className="flex items-center space-x-2 text-slate-200">
                  <Fish className="w-4 h-4 text-teal-400" />
                  <span>Potential Fishing Zones (PFZs)</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </NavLink>

              <NavLink
                to="/risk"
                className="flex items-center justify-between p-3 rounded-xl bg-ocean-950 border border-ocean-800 hover:border-rose-600 transition-all text-xs"
              >
                <div className="flex items-center space-x-2 text-slate-200">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  <span>Seaworthiness & Hazard Analysis</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </NavLink>

              <NavLink
                to="/conditions"
                className="flex items-center justify-between p-3 rounded-xl bg-ocean-950 border border-ocean-800 hover:border-blue-600 transition-all text-xs"
              >
                <div className="flex items-center space-x-2 text-slate-200">
                  <TrendingUp className="w-4 h-4 text-blue-400" />
                  <span>Cross-Location Benchmark</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </NavLink>
            </div>
          </div>

          <DisclaimerBanner />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
