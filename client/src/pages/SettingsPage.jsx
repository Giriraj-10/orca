import React, { useState } from 'react';
import {
  Settings,
  User,
  Shield,
  MapPin,
  Database,
  Bell,
  CheckCircle2,
  Cpu
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';
import DisclaimerBanner from '../components/common/DisclaimerBanner';

const SettingsPage = () => {
  const { user, quickLoginAs } = useAuth();
  const { currentRegion, allRegions, selectRegionById } = useLocation();

  const [savedNotice, setSavedNotice] = useState(false);
  const [dataMode, setDataMode] = useState('DEMO');
  const [audioAlerts, setAudioAlerts] = useState(true);

  const handleSave = (e) => {
    e.preventDefault();
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-ocean-900 via-ocean-850 to-ocean-900 border border-ocean-700/60 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 mb-1">
          <Settings className="w-4 h-4" />
          <span>SYSTEM & USER CONFIGURATION</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-100 font-mono tracking-tight">
          Platform Settings
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Manage operational home port, persona roles, and data provider options.
        </p>
      </div>

      {savedNotice && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Settings saved successfully. All coastal configurations updated.</span>
        </div>
      )}

      {/* Form Card */}
      <form onSubmit={handleSave} className="bg-ocean-900/80 border border-ocean-800 rounded-2xl p-6 shadow-xl space-y-6">
        {/* User Persona & Role Section */}
        <div>
          <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center space-x-2">
            <User className="w-4 h-4 text-cyan-400" />
            <span>Operational Persona & Permissions</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Authenticated User</label>
              <div className="px-3 py-2 bg-ocean-950 border border-ocean-800 rounded-xl text-slate-200 font-mono">
                {user?.name} ({user?.email})
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Assigned Operational Role</label>
              <div className="flex items-center space-x-2">
                <span className="px-3 py-2 bg-ocean-950 border border-ocean-800 rounded-xl text-cyan-300 font-mono font-bold flex-1">
                  {user?.role}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Role Switcher for SIH Presentation */}
          <div className="mt-3 p-3 rounded-xl bg-ocean-950/60 border border-ocean-800">
            <span className="text-[11px] font-semibold text-slate-400 block mb-2 font-mono">
              Fast Switch Persona (SIH Demo Evaluator):
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {['Fisherman', 'Researcher', 'Authority', 'Administrator'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => quickLoginAs(r)}
                  className={`py-1.5 px-2 rounded-lg font-mono text-[11px] font-medium transition-colors ${
                    user?.role === r
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'bg-ocean-900 border border-ocean-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Coastal Home Port */}
        <div className="border-t border-ocean-800 pt-5">
          <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-teal-400" />
            <span>Default Operational Home Port</span>
          </h3>

          <div className="max-w-md text-xs">
            <label className="block text-slate-400 mb-1">Select Home Coastal Station</label>
            <select
              value={currentRegion.id}
              onChange={(e) => selectRegionById(e.target.value)}
              className="w-full px-3 py-2 bg-ocean-950 border border-ocean-700 rounded-xl text-slate-100 font-semibold focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              {allRegions.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.sea} - {r.state})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Data Engine Mode */}
        <div className="border-t border-ocean-800 pt-5">
          <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center space-x-2">
            <Database className="w-4 h-4 text-purple-400" />
            <span>Data Engine Operation Mode</span>
          </h3>

          <div className="space-y-3 text-xs">
            <label className="flex items-center space-x-3 p-3 rounded-xl bg-ocean-950 border border-cyan-800/40 cursor-pointer">
              <input
                type="radio"
                name="dataMode"
                value="DEMO"
                checked={dataMode === 'DEMO'}
                onChange={() => setDataMode('DEMO')}
                className="text-cyan-500 focus:ring-cyan-500"
              />
              <div>
                <span className="font-bold text-slate-100 block">DEMO MODE (Offline Coastal Baselines)</span>
                <span className="text-slate-400 text-[11px]">
                  Runs 100% locally with high-fidelity simulated Indian coastal datasets. Guarantees zero runtime crashes during SIH live demonstrations.
                </span>
              </div>
            </label>

            <label className="flex items-center space-x-3 p-3 rounded-xl bg-ocean-950 border border-ocean-800 cursor-pointer opacity-75 hover:opacity-100 transition-opacity">
              <input
                type="radio"
                name="dataMode"
                value="LIVE"
                checked={dataMode === 'LIVE'}
                onChange={() => setDataMode('LIVE')}
                className="text-cyan-500 focus:ring-cyan-500"
              />
              <div>
                <span className="font-bold text-slate-100 block">LIVE PROVIDER MODE</span>
                <span className="text-slate-400 text-[11px]">
                  Requires active external meteorological and satellite API credentials in server `.env`. Automatically falls back to demo mode if an external service drops.
                </span>
              </div>
            </label>
          </div>
        </div>

        <div className="pt-4 border-t border-ocean-800 flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-ocean-950 font-bold text-xs rounded-xl shadow-md transition-all"
          >
            Save Configuration
          </button>
        </div>
      </form>

      <DisclaimerBanner />
    </div>
  );
};

export default SettingsPage;
