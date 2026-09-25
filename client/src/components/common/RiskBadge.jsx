import React from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon } from 'lucide-react';

const RiskBadge = ({ riskLevel = 'LOW', score }) => {
  const norm = (riskLevel || 'LOW').toUpperCase();

  let badgeConfig = {
    color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40',
    icon: ShieldCheck,
    label: 'LOW RISK',
    subtext: 'Benign coastal sea state'
  };

  if (norm === 'MODERATE') {
    badgeConfig = {
      color: 'bg-amber-500/15 text-amber-400 border-amber-500/40',
      icon: AlertTriangle,
      label: 'MODERATE RISK',
      subtext: 'Exercise caution for small craft'
    };
  } else if (norm === 'HIGH' || norm === 'CRITICAL') {
    badgeConfig = {
      color: 'bg-rose-500/20 text-rose-400 border-rose-500/50',
      icon: AlertOctagon,
      label: 'HIGH RISK',
      subtext: 'Adverse swells & fresh winds'
    };
  }

  const IconComponent = badgeConfig.icon;

  return (
    <div className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg border font-mono text-xs font-semibold ${badgeConfig.color}`}>
      <IconComponent className="w-4 h-4 shrink-0" />
      <span>{badgeConfig.label}</span>
      {score !== undefined && (
        <span className="opacity-75 font-normal">({score}/100)</span>
      )}
    </div>
  );
};

export default RiskBadge;
