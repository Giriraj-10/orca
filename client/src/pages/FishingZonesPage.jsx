import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Fish,
  Filter,
  MapPin,
  Sparkles,
  ExternalLink,
  Thermometer,
  Waves,
  Wind,
  Compass,
  ArrowRight,
  ShieldCheck,
  Search
} from 'lucide-react';
import { fishingService } from '../services/api';
import { useLocation } from '../context/LocationContext';
import ConfidenceBadge from '../components/common/ConfidenceBadge';
import DisclaimerBanner from '../components/common/DisclaimerBanner';

const FishingZonesPage = () => {
  const { currentRegion, allRegions } = useLocation();
  const navigate = useNavigate();

  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSuitability, setSelectedSuitability] = useState('ALL');
  const [searchFilter, setSearchFilter] = useState('');

  // Custom coordinate analyzer state
  const [customLat, setCustomLat] = useState('');
  const [customLng, setCustomLng] = useState('');
  const [analyzingPoint, setAnalyzingPoint] = useState(false);
  const [customResult, setCustomResult] = useState(null);

  useEffect(() => {
    const fetchZones = async () => {
      setLoading(true);
      try {
        const res = await fishingService.getZones(currentRegion?.lat, currentRegion?.lng);
        setZones(res.data || []);
      } catch (err) {
        console.warn('Fishing zones fetch error:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchZones();
  }, [currentRegion]);

  const handleAnalyzeCustom = async (e) => {
    e.preventDefault();
    if (!customLat || !customLng) return;
    setAnalyzingPoint(true);
    try {
      const res = await fishingService.analyzePoint(parseFloat(customLat), parseFloat(customLng));
      setCustomResult(res.analysis);
    } catch (err) {
      console.warn('Custom analysis error:', err.message);
    } finally {
      setAnalyzingPoint(false);
    }
  };

  const filteredZones = zones.filter((z) => {
    const matchesSuit = selectedSuitability === 'ALL' || z.suitability === selectedSuitability;
    const matchesSearch =
      z.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      z.regionId?.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesSuit && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-gradient-to-r from-ocean-900 via-ocean-850 to-ocean-900 border border-ocean-700/60 rounded-2xl p-5 shadow-xl">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-teal-400 mb-1">
            <Fish className="w-4 h-4" />
            <span>PELAGIC HABITAT & POTENTIAL FISHING ZONES (PFZ)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-100 font-mono tracking-tight">
            Potential Fishing Zones Directory
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Synthesized from satellite thermal fronts, chlorophyll concentration, and surface bathymetry.
          </p>
        </div>

        <button
          onClick={() => navigate('/map')}
          className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 text-ocean-950 font-bold text-xs rounded-xl shadow-md flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <span>View on Map Canvas</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-ocean-900/70 border border-ocean-800 rounded-xl p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex items-center space-x-2 flex-1 min-w-[200px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search zones by name (e.g. Bombay High, Malabar)..."
            className="w-full pl-9 pr-3 py-1.5 bg-ocean-950 border border-ocean-700 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-400">Suitability:</span>
          {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setSelectedSuitability(lvl)}
              className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-semibold transition-colors ${
                selectedSuitability === lvl
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                  : 'bg-ocean-950 border border-ocean-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Potential Fishing Zones */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs">
          Loading synchronized marine fishing zones...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredZones.map((z, idx) => (
            <div
              key={z._id || idx}
              className="bg-ocean-900/80 border border-ocean-800 rounded-2xl p-5 hover:border-cyan-700/60 transition-all flex flex-col justify-between shadow-lg"
            >
              <div>
                {/* Zone Header */}
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-100">{z.name}</h3>
                    <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                      Lat: {z.center?.latitude?.toFixed(4) || z.coordinates?.[1]} | Lng: {z.center?.longitude?.toFixed(4) || z.coordinates?.[0]}
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded font-mono text-xs font-bold border ${
                      z.suitability === 'HIGH'
                        ? 'bg-teal-500/20 text-teal-300 border-teal-500/40'
                        : z.suitability === 'MEDIUM'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    }`}
                  >
                    {z.suitability}
                  </span>
                </div>

                <div className="my-2">
                  <ConfidenceBadge confidence={z.confidence} />
                </div>

                {/* Key Marine Indicators */}
                <div className="grid grid-cols-2 gap-2 my-3 p-2.5 bg-ocean-950/80 rounded-xl border border-ocean-800/80 text-[11px] font-mono">
                  <div className="flex items-center space-x-1.5 text-slate-300">
                    <Thermometer className="w-3.5 h-3.5 text-orange-400" />
                    <span>SST: {z.indicators?.sst || 27.5}°C</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-slate-300">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Chl: {z.indicators?.chlorophyll || 1.8} mg/m³</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-slate-300">
                    <Waves className="w-3.5 h-3.5 text-blue-400" />
                    <span>Wave: {z.indicators?.waveHeight || 1.1} m</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-slate-300">
                    <Wind className="w-3.5 h-3.5 text-sky-400" />
                    <span>Wind: {z.indicators?.windSpeed || 14} km/h</span>
                  </div>
                </div>

                {/* Reasoning */}
                <p className="text-xs text-slate-400 leading-relaxed mb-3">
                  {z.reasoning}
                </p>

                {/* Target Species Pills */}
                {z.targetSpecies && z.targetSpecies.length > 0 && (
                  <div className="mb-3">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                      Pelagic Biomass Indicators:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {z.targetSpecies.map((sp, sIdx) => (
                        <span
                          key={sIdx}
                          className="px-2 py-0.5 rounded text-[10px] bg-ocean-800 text-slate-300 border border-ocean-700 font-mono"
                        >
                          {sp}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Attribution and Action */}
              <div className="pt-3 border-t border-ocean-800 space-y-2">
                <div className="flex flex-wrap items-center justify-between text-[10px] font-mono text-slate-400 gap-1">
                  <span>Source: <strong className="text-teal-300">{z.source || 'INCOIS / EO Derived'}</strong></span>
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${z.isLive ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400 border border-amber-800'}`}>
                    {z.dataMode ? z.dataMode.toUpperCase() : (z.isLive ? 'LIVE' : 'HYBRID')}
                  </span>
                </div>
                {z.isDerived && (
                  <div className="text-[10px] font-mono text-amber-300/90 bg-amber-950/40 px-2 py-1 rounded border border-amber-800/40">
                    ⚠ ORCA DERIVED PFZ SUITABILITY — NOT OFFICIAL INCOIS PFZ ADVISORY
                  </div>
                )}
                {z.advisoryDate && (
                  <div className="text-[10px] font-mono text-slate-400">
                    Advisory Date: {new Date(z.advisoryDate).toLocaleDateString()} | Sector: {z.sector || 'Regional Shelf'}
                  </div>
                )}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-slate-500 font-mono">
                    Retrieved: {z.retrievedAt ? new Date(z.retrievedAt).toLocaleTimeString() : 'Live Feed'}
                  </span>
                  <button
                    onClick={() => navigate('/map')}
                    className="px-3 py-1 bg-cyan-950 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors"
                  >
                    <span>Locate on Map</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dynamic Custom Coordinate Analyzer Tool */}
      <div className="bg-ocean-900/80 border border-cyan-900/60 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center space-x-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
          <Compass className="w-4 h-4" />
          <span>Point-In-Region Fishing Suitability Estimator</span>
        </div>
        <h3 className="text-base font-bold text-slate-100 mb-2">
          Evaluate Custom Coordinates for Pelagic Productivity
        </h3>
        <p className="text-xs text-slate-400 mb-4 max-w-2xl">
          Enter any offshore latitude and longitude along the Indian coast to invoke the Fishing Zone Agent and synthesize dynamic habitat suitability.
        </p>

        <form onSubmit={handleAnalyzeCustom} className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">Latitude (°N)</label>
            <input
              type="number"
              step="any"
              required
              value={customLat}
              onChange={(e) => setCustomLat(e.target.value)}
              placeholder="e.g. 19.125"
              className="px-3 py-2 bg-ocean-950 border border-ocean-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-cyan-400 w-36 font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">Longitude (°E)</label>
            <input
              type="number"
              step="any"
              required
              value={customLng}
              onChange={(e) => setCustomLng(e.target.value)}
              placeholder="e.g. 72.750"
              className="px-3 py-2 bg-ocean-950 border border-ocean-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-cyan-400 w-36 font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={analyzingPoint}
            className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-teal-500 text-ocean-950 font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-50"
          >
            {analyzingPoint ? 'Analyzing Marine Sensors...' : 'Evaluate Coordinates'}
          </button>
        </form>

        {/* Custom Point Result Card */}
        {customResult && (
          <div className="mt-4 p-4 rounded-xl bg-ocean-950 border border-cyan-700/60 text-xs text-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-sm text-cyan-300">
                Evaluation Result: {customResult.overallSuitability} Suitability
              </span>
              <ConfidenceBadge confidence={customResult.overallConfidence} />
            </div>
            <p className="text-slate-300 leading-relaxed mb-2">{customResult.reasoning}</p>
            <div className="text-[10px] text-slate-400 font-mono">
              Sensors Analyzed: SST {customResult.indicatorsAnalyzed?.sst}°C | Chlorophyll {customResult.indicatorsAnalyzed?.chlorophyll} mg/m³ | Waves {customResult.indicatorsAnalyzed?.waveHeight}m
            </div>
          </div>
        )}
      </div>

      <DisclaimerBanner />
    </div>
  );
};

export default FishingZonesPage;
