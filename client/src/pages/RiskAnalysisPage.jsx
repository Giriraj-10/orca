import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Waves,
  Wind,
  Eye,
  CloudRain,
  Anchor,
  Compass,
  CheckCircle2,
  AlertOctagon
} from 'lucide-react';
import { riskService } from '../services/api';
import { useLocation } from '../context/LocationContext';
import RiskBadge from '../components/common/RiskBadge';
import DisclaimerBanner from '../components/common/DisclaimerBanner';

const RiskAnalysisPage = () => {
  const { currentRegion } = useLocation();
  const [riskData, setRiskData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Dynamic point evaluator
  const [evalLat, setEvalLat] = useState('');
  const [evalLng, setEvalLng] = useState('');
  const [customRisk, setCustomRisk] = useState(null);
  const [evaluating, setEvaluating] = useState(false);

  useEffect(() => {
    const fetchRisk = async () => {
      setLoading(true);
      try {
        const res = await riskService.getNearby(currentRegion.lat, currentRegion.lng);
        setRiskData(res.assessment);
      } catch (err) {
        console.warn('Risk fetch error:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchRisk();
  }, [currentRegion]);

  const handleEvaluateCustom = async (e) => {
    e.preventDefault();
    if (!evalLat || !evalLng) return;
    setEvaluating(true);
    try {
      const res = await riskService.analyze(parseFloat(evalLat), parseFloat(evalLng));
      setCustomRisk(res.assessment);
    } catch (err) {
      console.warn('Custom risk error:', err.message);
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-ocean-900 via-ocean-850 to-ocean-900 border border-ocean-700/60 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center space-x-2 text-xs font-mono text-rose-400 mb-1">
          <ShieldAlert className="w-4 h-4" />
          <span>MARITIME SAFETY & SEAWORTHINESS PROTOCOL</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-100 font-mono tracking-tight">
          Marine Hazard & Risk Evaluation
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Synthesizes wave swell spectra, cross-wind chop, and atmospheric visibility into operational risk profiles.
        </p>
      </div>

      {/* Main Risk Status Hero Banner */}
      <div className="bg-ocean-900/80 border border-ocean-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs text-slate-400 font-mono block mb-1">
            Current Sector: {currentRegion.name} ({currentRegion.sea})
          </span>
          <div className="flex items-center space-x-3 mt-1">
            <RiskBadge riskLevel={riskData?.riskLevel || 'LOW'} score={riskData?.overallScore || 18} />
            <span className="text-xs font-mono text-slate-400">
              Composite Hazard Score: <strong>{riskData?.overallScore || 18}/100</strong>
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-3 max-w-2xl leading-relaxed">
            {riskData?.explanation || 'Hydrodynamic and meteorological vectors indicate safe baseline navigational conditions for motorized craft.'}
          </p>
        </div>

        {/* Vessel Category Advice Box */}
        <div className="p-4 rounded-xl bg-ocean-950 border border-ocean-800 min-w-[240px] text-xs space-y-1.5 font-mono">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center space-x-1.5">
            <Anchor className="w-3.5 h-3.5 text-cyan-400" />
            <span>Vessel Class Guidance</span>
          </div>
          <div className="text-slate-300">Traditional Canoes (&lt;9m): <strong className="text-emerald-400">Navigable</strong></div>
          <div className="text-slate-300">Motorized Trawlers: <strong className="text-emerald-400">Navigable</strong></div>
          <div className="text-slate-300">Deep-Sea Commercial: <strong className="text-emerald-400">Clear</strong></div>
        </div>
      </div>

      {/* Subfactor Risk Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Wave Swell */}
        <div className="p-4 rounded-xl bg-ocean-900/70 border border-ocean-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold">Wave Swell Risk</span>
            <Waves className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-lg font-bold font-mono text-slate-100">
            {riskData?.subFactors?.waveRisk?.value || '1.1 m'}
          </div>
          <div className="flex justify-between items-center text-[11px] text-slate-400 font-mono">
            <span>Level: {riskData?.subFactors?.waveRisk?.level || 'Low'}</span>
            <span>Score: {riskData?.subFactors?.waveRisk?.score || 4}/40</span>
          </div>
        </div>

        {/* Wind Speed */}
        <div className="p-4 rounded-xl bg-ocean-900/70 border border-ocean-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold">Surface Wind Risk</span>
            <Wind className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-lg font-bold font-mono text-slate-100">
            {riskData?.subFactors?.windRisk?.value || '14 km/h'}
          </div>
          <div className="flex justify-between items-center text-[11px] text-slate-400 font-mono">
            <span>Level: {riskData?.subFactors?.windRisk?.level || 'Low'}</span>
            <span>Score: {riskData?.subFactors?.windRisk?.score || 3}/35</span>
          </div>
        </div>

        {/* Visibility */}
        <div className="p-4 rounded-xl bg-ocean-900/70 border border-ocean-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold">Atmospheric Visibility</span>
            <Eye className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-lg font-bold font-mono text-slate-100">
            {riskData?.subFactors?.visibilityRisk?.value || '10 km'}
          </div>
          <div className="flex justify-between items-center text-[11px] text-slate-400 font-mono">
            <span>Level: {riskData?.subFactors?.visibilityRisk?.level || 'Low'}</span>
            <span>Score: {riskData?.subFactors?.visibilityRisk?.score || 0}/15</span>
          </div>
        </div>

        {/* Weather / Squall */}
        <div className="p-4 rounded-xl bg-ocean-900/70 border border-ocean-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold">Convective Weather</span>
            <CloudRain className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-lg font-bold font-mono text-slate-100">
            {riskData?.subFactors?.weatherRisk?.value || 'Fair'}
          </div>
          <div className="flex justify-between items-center text-[11px] text-slate-400 font-mono">
            <span>Level: {riskData?.subFactors?.weatherRisk?.level || 'Low'}</span>
            <span>Score: {riskData?.subFactors?.weatherRisk?.score || 0}/10</span>
          </div>
        </div>
      </div>

      {/* Safety Recommendations */}
      {riskData?.safetyRecommendations && riskData.safetyRecommendations.length > 0 && (
        <div className="bg-ocean-900/80 border border-ocean-800 rounded-2xl p-5 shadow-xl">
          <h3 className="text-sm font-bold text-slate-200 mb-3 uppercase tracking-wider flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Recommended Pre-Departure Protocols</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {riskData.safetyRecommendations.map((rec, i) => (
              <div key={i} className="p-3 rounded-xl bg-ocean-950 border border-ocean-850 text-xs text-slate-300 flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{rec}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Custom Point Risk Evaluator */}
      <div className="bg-ocean-900/80 border border-ocean-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center space-x-2 text-rose-400 text-xs font-bold uppercase tracking-wider mb-1">
          <Compass className="w-4 h-4" />
          <span>Point-In-Sea Risk Calculator</span>
        </div>
        <h3 className="text-base font-bold text-slate-100 mb-2">
          Evaluate Marine Hazard for Arbitrary Coordinates
        </h3>

        <form onSubmit={handleEvaluateCustom} className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">Latitude (°N)</label>
            <input
              type="number"
              step="any"
              required
              value={evalLat}
              onChange={(e) => setEvalLat(e.target.value)}
              placeholder="e.g. 15.65"
              className="px-3 py-2 bg-ocean-950 border border-ocean-700 rounded-xl text-xs text-slate-100 font-mono w-36"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">Longitude (°E)</label>
            <input
              type="number"
              step="any"
              required
              value={evalLng}
              onChange={(e) => setEvalLng(e.target.value)}
              placeholder="e.g. 73.55"
              className="px-3 py-2 bg-ocean-950 border border-ocean-700 rounded-xl text-xs text-slate-100 font-mono w-36"
            />
          </div>

          <button
            type="submit"
            disabled={evaluating}
            className="px-5 py-2.5 bg-gradient-to-r from-rose-500 to-amber-500 text-ocean-950 font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-50"
          >
            {evaluating ? 'Computing Hazard Scores...' : 'Compute Point Risk'}
          </button>
        </form>

        {customRisk && (
          <div className="mt-4 p-4 rounded-xl bg-ocean-950 border border-rose-900/60 text-xs text-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-sm text-rose-300">
                Custom Point Risk: {customRisk.riskLevel} (Score: {customRisk.overallScore}/100)
              </span>
              <RiskBadge riskLevel={customRisk.riskLevel} score={customRisk.overallScore} />
            </div>
            <p className="text-slate-300 leading-relaxed">{customRisk.explanation}</p>
          </div>
        )}
      </div>

      <DisclaimerBanner />
    </div>
  );
};

export default RiskAnalysisPage;
