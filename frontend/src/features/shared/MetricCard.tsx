// Reusable Metric Card Component
// Used in dashboard summary views

import type { LucideIcon } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { memo } from 'react';

interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  color?: 'blue' | 'amber' | 'green' | 'cyan' | 'red' | 'purple';
  onClick?: () => void;
  href?: string;
  alert?: boolean; // If true, shows as alert (red background)
}

export const MetricCard = memo(function MetricCard({
  icon: Icon,
  label,
  value,
  change,
  changeType = 'neutral',
  color = 'blue',
  onClick,
  href,
  alert = false,
}: MetricCardProps) {
  const colorClasses = {
    blue: 'text-blue-400 bg-blue-950/50 border-blue-900',
    amber: 'text-amber-400 bg-amber-950/50 border-amber-900',
    green: 'text-green-400 bg-green-950/50 border-green-900',
    cyan: 'text-cyan-400 bg-cyan-950/50 border-cyan-900',
    red: 'text-red-400 bg-red-950/50 border-red-900',
    purple: 'text-purple-400 bg-purple-950/50 border-purple-900',
  };

  const changeColors = {
    positive: 'text-green-400',
    negative: 'text-red-400',
    neutral: 'text-slate-400',
  };

  const baseClasses = alert
    ? 'bg-red-950/50 border-red-900 text-red-400'
    : colorClasses[color];

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (href) {
      navigate({ to: href });
    }
  };

  return (
    <div
      className={`bg-slate-900 border rounded-lg p-4 sm:p-5 transition-all ${
        onClick || href ? 'cursor-pointer hover:border-opacity-70 hover:bg-slate-800/50 active:bg-slate-800 touch-manipulation' : ''
        } ${baseClasses}`}
        onClick={handleClick}
        role={onClick || href ? 'button' : undefined}
        aria-label={onClick || href ? `${label}: ${value}` : undefined}
        tabIndex={onClick || href ? 0 : undefined}
      >
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
        {change && (
          <span className={`text-xs sm:text-sm font-bold ${changeColors[changeType]}`}>
            {change}
          </span>
        )}
      </div>
      <div className="text-2xl sm:text-3xl font-black mb-1">{value}</div>
      <div className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-tight">
        {label}
      </div>
    </div>
  );
});
