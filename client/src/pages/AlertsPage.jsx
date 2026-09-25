import React, { useState, useEffect } from 'react';
import {
  Bell,
  AlertTriangle,
  Waves,
  Wind,
  ShieldAlert,
  Fish,
  PlusCircle,
  Clock,
  MapPin,
  CheckCircle2
} from 'lucide-react';
import { alertService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';
import DisclaimerBanner from '../components/common/DisclaimerBanner';

const alertTypeIcons = {
  WAVE: Waves,
  WIND: Wind,
  SAFETY: ShieldAlert,
  FISHING_UPDATE: Fish,
  WEATHER: AlertTriangle
};

const AlertsPage = () => {
  const { user } = useAuth();
  const { currentRegion, allRegions } = useLocation();

  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRegion, setFilterRegion] = useState('all');

  // Broadcast Alert Form (for Authority / Administrator)
  const [showBroadcastForm, setShowBroadcastForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState('SAFETY');
  const [newSeverity, setNewSeverity] = useState('MODERATE');
  const [newMessage, setNewMessage] = useState('');
  const [broadcasting, setBroadcasting] = useState(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await alertService.getAlerts(filterRegion);
      setAlerts(res.data || []);
    } catch (err) {
      console.warn('Alerts fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [filterRegion]);

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!newTitle || !newMessage) return;
    setBroadcasting(true);
    try {
      await alertService.createAlert({
        title: newTitle,
        type: newType,
        severity: newSeverity,
        regionId: currentRegion.id,
        regionName: currentRegion.name,
        message: newMessage
      });
      setBroadcastSuccess(true);
      setNewTitle('');
      setNewMessage('');
      fetchAlerts();
      setTimeout(() => setBroadcastSuccess(false), 4000);
    } catch (err) {
      console.warn('Broadcast error:', err.message);
    } finally {
      setBroadcasting(false);
    }
  };

  const isAuthority = user?.role === 'Authority' || user?.role === 'Administrator';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-gradient-to-r from-ocean-900 via-ocean-850 to-ocean-900 border border-ocean-700/60 rounded-2xl p-5 shadow-xl">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-amber-400 mb-1">
            <Bell className="w-4 h-4" />
            <span>EARLY WARNING & MARITIME ADVISORY SYSTEM</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-100 font-mono tracking-tight">
            Active Coastal Bulletins & Warnings
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Automated alerts triggered by wave swell thresholds, gale force gusts, and high-productivity PFZ fronts.
          </p>
        </div>

        {isAuthority && (
          <button
            onClick={() => setShowBroadcastForm(!showBroadcastForm)}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-rose-500 text-ocean-950 font-bold text-xs rounded-xl shadow-md flex items-center space-x-1.5 self-start sm:self-auto transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>{showBroadcastForm ? 'Close Form' : 'Broadcast Safety Advisory'}</span>
          </button>
        )}
      </div>

      {/* Broadcast Form (Authority / Admin) */}
      {showBroadcastForm && isAuthority && (
        <form onSubmit={handleBroadcast} className="bg-ocean-900/90 border border-amber-500/40 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-ocean-800 pb-2">
            <h3 className="text-sm font-bold text-amber-300">Broadcast Coastal Maritime Safety Advisory</h3>
            <span className="text-[10px] font-mono text-purple-300 bg-purple-950 px-2 py-0.5 rounded border border-purple-800">
              Authority Override Active
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-slate-300 mb-1">Advisory Title</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Swell Surge Warning — Veraval Shelf"
                className="w-full px-3 py-2 bg-ocean-950 border border-ocean-700 rounded-xl text-slate-100 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1">Hazard Category</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                className="w-full px-3 py-2 bg-ocean-950 border border-ocean-700 rounded-xl text-slate-100 focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                <option value="SAFETY">Maritime Safety</option>
                <option value="WAVE">High Wave / Swell</option>
                <option value="WIND">Gale / Strong Wind</option>
                <option value="FISHING_UPDATE">Pelagic PFZ Update</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 mb-1">Severity Level</label>
              <select
                value={newSeverity}
                onChange={(e) => setNewSeverity(e.target.value)}
                className="w-full px-3 py-2 bg-ocean-950 border border-ocean-700 rounded-xl text-slate-100 focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                <option value="INFO">Informational</option>
                <option value="MODERATE">Moderate Caution</option>
                <option value="HIGH">High Severity</option>
                <option value="CRITICAL">Critical Warning</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-300 mb-1">Bulletin Content</label>
            <textarea
              required
              rows={3}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Detail wave heights, wind directions, and specific precautions for small artisanal vs commercial trawlers..."
              className="w-full px-3 py-2 bg-ocean-950 border border-ocean-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            {broadcastSuccess && (
              <span className="text-xs text-emerald-400 font-medium flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Bulletin broadcasted successfully to all coastal stations</span>
              </span>
            )}
            <button
              type="submit"
              disabled={broadcasting}
              className="ml-auto px-5 py-2 bg-amber-500 hover:bg-amber-400 text-ocean-950 font-bold text-xs rounded-xl shadow-md transition-colors"
            >
              {broadcasting ? 'Transmitting...' : 'Issue Advisory Bulletin'}
            </button>
          </div>
        </form>
      )}

      {/* Filter by Region */}
      <div className="flex items-center space-x-2 text-xs">
        <MapPin className="w-4 h-4 text-slate-400" />
        <span className="text-slate-400 font-semibold">Filter by Region:</span>
        <select
          value={filterRegion}
          onChange={(e) => setFilterRegion(e.target.value)}
          className="bg-ocean-900 border border-ocean-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
        >
          <option value="all">Pan-Indian Coast (All Regions)</option>
          {allRegions.map((r) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
      </div>

      {/* Alerts Feed List */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs">Loading active maritime bulletins...</div>
      ) : (
        <div className="space-y-4">
          {alerts.map((al, idx) => {
            const IconComp = alertTypeIcons[al.type] || AlertTriangle;
            const isHigh = al.severity === 'HIGH' || al.severity === 'CRITICAL';
            const isMod = al.severity === 'MODERATE';

            return (
              <div
                key={al._id || idx}
                className={`p-5 rounded-2xl border transition-all ${
                  isHigh
                    ? 'bg-rose-950/20 border-rose-800/80'
                    : isMod
                    ? 'bg-amber-950/20 border-amber-800/70'
                    : 'bg-ocean-900/80 border-ocean-800'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`p-2.5 rounded-xl ${
                        isHigh
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                          : isMod
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                          : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                      }`}
                    >
                      <IconComp className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                            isHigh
                              ? 'bg-rose-500/30 text-rose-300'
                              : isMod
                              ? 'bg-amber-500/30 text-amber-300'
                              : 'bg-cyan-500/30 text-cyan-300'
                          }`}
                        >
                          {al.severity} • {al.type}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          Sector: <strong className="text-slate-200">{al.regionName}</strong>
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-100 mt-1">{al.title}</h3>
                    </div>
                  </div>

                  <div className="text-[11px] font-mono text-slate-400 flex items-center space-x-1 shrink-0">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{new Date(al.issuedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} IST</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed pl-12 mt-2">
                  {al.message}
                </p>

                <div className="mt-3 pt-3 border-t border-ocean-800/60 pl-12 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>{al.advisoryDisclaimer}</span>
                  <span className="text-emerald-400">STATUS: ACTIVE</span>
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

export default AlertsPage;
