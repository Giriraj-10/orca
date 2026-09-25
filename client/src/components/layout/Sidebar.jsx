import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Bot,
  Map,
  Fish,
  Waves,
  ShieldAlert,
  Database,
  Bell,
  Settings,
  Activity,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'AI Marine Assistant', path: '/assistant', icon: Bot, badge: 'AI' },
  { name: 'Explore Map', path: '/map', icon: Map },
  { name: 'Fishing Zones', path: '/fishing-zones', icon: Fish },
  { name: 'Marine Conditions', path: '/conditions', icon: Waves },
  { name: 'Risk Analysis', path: '/risk', icon: ShieldAlert },
  { name: 'Data Sources', path: '/data-sources', icon: Database },
  { name: 'Alerts', path: '/alerts', icon: Bell },
  { name: 'System Telemetry', path: '/admin', icon: Activity },
  { name: 'Settings', path: '/settings', icon: Settings },
];

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-40 bg-ocean-950/95 border-r border-ocean-800/80 transition-all duration-300 flex flex-col backdrop-blur-md ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-ocean-800/80">
        <NavLink to="/dashboard" className="flex items-center space-x-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-teal-400 flex items-center justify-center shadow-lg shadow-cyan-900/40 shrink-0">
            <span className="font-extrabold text-white text-lg tracking-wider font-mono">OR</span>
          </div>
          {!isCollapsed && (
            <div className="flex flex-col truncate">
              <span className="font-extrabold text-base tracking-wider text-slate-100 font-mono">
                ORCA
              </span>
              <span className="text-[10px] text-cyan-400 font-medium tracking-tight truncate">
                Marine Intelligence
              </span>
            </div>
          )}
        </NavLink>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-ocean-850 transition-colors"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const IconComp = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-950/90 to-ocean-850 text-cyan-300 border border-cyan-700/50 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-ocean-900/60'
                }`
              }
              title={isCollapsed ? item.name : undefined}
            >
              <IconComp className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${isCollapsed ? 'mx-auto' : 'mr-3'}`} />
              {!isCollapsed && (
                <div className="flex-1 flex items-center justify-between truncate">
                  <span className="truncate">{item.name}</span>
                  {item.badge && (
                    <span className="ml-2 text-[10px] font-semibold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-1.5 py-0.2 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Multi-Agent Indicator Footer */}
      {!isCollapsed && (
        <div className="p-3 m-3 bg-ocean-900/60 border border-ocean-800/80 rounded-xl">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Agent Orchestration</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-tight">
            8 autonomous specialized agents collaborating in real-time.
          </p>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
