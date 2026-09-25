import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  MapPin,
  Crosshair,
  Bell,
  Shield,
  User as UserIcon,
  LogOut,
  ChevronDown,
  Database,
  Radio
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';

const Topbar = ({ isSidebarCollapsed }) => {
  const { user, logout, quickLoginAs } = useAuth();
  const { currentRegion, allRegions, selectRegionById, useBrowserGeolocation, isGpsActive } = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);

  const getRoleColor = (role) => {
    switch (role) {
      case 'Authority': return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'Researcher': return 'bg-teal-500/20 text-teal-300 border-teal-500/40';
      case 'Administrator': return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      default: return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'; // Fisherman
    }
  };

  return (
    <header
      className={`fixed top-0 right-0 h-16 z-30 bg-ocean-950/90 border-b border-ocean-800/80 backdrop-blur-md transition-all duration-300 flex items-center justify-between px-4 sm:px-6 ${
        isSidebarCollapsed ? 'left-20' : 'left-64'
      }`}
    >
      {/* Left: Mode Badge & Coastal Region Selector */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Status Mode Badge */}
        <div className="hidden sm:flex items-center space-x-2 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 text-xs font-mono shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>DEMO MODE — Simulated Datasets</span>
        </div>

        {/* Region Selector */}
        <div className="flex items-center space-x-2 bg-ocean-900 border border-ocean-700/70 rounded-xl px-2.5 py-1.5 shadow-sm">
          <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
          <select
            value={currentRegion.id.startsWith('custom') || currentRegion.id === 'gps_device' ? '' : currentRegion.id}
            onChange={(e) => selectRegionById(e.target.value)}
            className="bg-transparent text-xs font-semibold text-slate-200 focus:outline-none cursor-pointer pr-1"
          >
            {allRegions.map((r) => (
              <option key={r.id} value={r.id} className="bg-ocean-900 text-slate-100">
                {r.name} ({r.sea})
              </option>
            ))}
          </select>

          {/* GPS Quick Locator */}
          <button
            onClick={useBrowserGeolocation}
            className={`p-1 rounded-md text-xs transition-colors ${
              isGpsActive ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-cyan-300'
            }`}
            title="Use device GPS location"
          >
            <Crosshair className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Right: Notifications, Role Switcher, Profile */}
      <div className="flex items-center space-x-3">
        {/* Alerts Bell */}
        <NavLink
          to="/alerts"
          className="relative p-2 rounded-xl text-slate-400 hover:text-cyan-300 hover:bg-ocean-900 transition-colors"
          title="Maritime Alerts"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-400 rounded-full animate-ping" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full" />
        </NavLink>

        {/* User Persona Profile */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-2 p-1.5 sm:px-3 rounded-xl bg-ocean-900/80 border border-ocean-700/60 hover:border-cyan-600 transition-all text-left"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-600 to-teal-500 flex items-center justify-center text-xs font-bold text-white shadow-sm">
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <div className="hidden md:flex flex-col">
              <span className="text-xs font-semibold text-slate-200 truncate max-w-[130px]">
                {user?.name || 'Fisherman User'}
              </span>
              <span className={`text-[10px] font-mono px-1 rounded-sm border inline-block w-fit mt-0.5 ${getRoleColor(user?.role)}`}>
                {user?.role || 'Fisherman'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {/* User Dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl bg-ocean-900 border border-ocean-700 shadow-2xl py-2 z-50 text-xs">
              <div className="px-3 py-2 border-b border-ocean-800">
                <p className="font-semibold text-slate-200">{user?.name}</p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
              </div>

              {/* SIH Fast Switcher */}
              <div className="px-3 py-2 border-b border-ocean-800">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  SIH Quick Role Switch:
                </p>
                <div className="grid grid-cols-2 gap-1 text-[11px]">
                  {['Fisherman', 'Researcher', 'Authority', 'Administrator'].map((role) => (
                    <button
                      key={role}
                      onClick={() => {
                        quickLoginAs(role);
                        setShowUserMenu(false);
                      }}
                      className={`px-2 py-1 rounded text-left transition-colors ${
                        user?.role === role
                          ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                          : 'text-slate-300 hover:bg-ocean-800'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  logout();
                  setShowUserMenu(false);
                }}
                className="w-full flex items-center px-3 py-2 text-rose-400 hover:bg-ocean-800 transition-colors"
              >
                <LogOut className="w-4 h-4 mr-2" />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
