import React from 'react';
import { formatCurrency } from '../../utils/formatters';

interface CircularProgressProps {
  spent: number;
  limit: number;
  remaining: number;
  currency?: string;
  size?: number;
  strokeWidth?: number;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  spent,
  limit,
  remaining,
  currency = '₹',
  size = 280,
  strokeWidth = 20,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Percentage of daily allowance used
  const rawRatio = limit > 0 ? spent / limit : 0;
  const clampedRatio = Math.min(Math.max(rawRatio, 0), 1);
  const strokeDashoffset = circumference - clampedRatio * circumference;

  const isOverspent = remaining < 0;
  const isCaution = !isOverspent && rawRatio > 0.75;

  // Gradient & Glow colors based on status
  const gradientId = isOverspent ? 'dangerGradient' : isCaution ? 'amberGradient' : 'neonGreenGradient';
  const glowColor = isOverspent ? '#EF4444' : isCaution ? '#FBBF24' : '#00FF87';
  const cardBorder = isOverspent ? 'border-red-500/30' : isCaution ? 'border-amber-500/30' : 'border-primary/20';

  return (
    <div className="relative flex flex-col items-center justify-center">
      {/* Ambient background glow */}
      <div
        className="absolute w-56 h-56 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-700"
        style={{ backgroundColor: glowColor }}
      />

      <div className="relative">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90 filter drop-shadow-[0_0_16px_rgba(0,0,0,0.5)]"
        >
          <defs>
            {/* Neon Green Gradient */}
            <linearGradient id="neonGreenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00FF87" />
              <stop offset="100%" stopColor="#05F191" />
            </linearGradient>

            {/* Amber Warning Gradient */}
            <linearGradient id="amberGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FBBF24" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>

            {/* Danger Red Gradient */}
            <linearGradient id="dangerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F43F5E" />
              <stop offset="100%" stopColor="#EF4444" />
            </linearGradient>

            {/* Glow Filter */}
            <filter id="neonGlowFilter" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor={glowColor} floodOpacity="0.7" />
            </filter>
          </defs>

          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#131D33"
            strokeWidth={strokeWidth}
            fill="transparent"
          />

          {/* Active Glowing Progress Ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={`url(#${gradientId})`}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            filter="url(#neonGlowFilter)"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Contents */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 select-none pointer-events-none">
          <span className="text-xs font-semibold tracking-wider uppercase text-slate-400 mb-1">
            {isOverspent ? 'Over Budget By' : 'Remaining Today'}
          </span>

          <span
            className={`text-4xl md:text-5xl font-extrabold tracking-tight transition-colors duration-500 ${
              isOverspent ? 'text-red-400 text-neon-danger' : 'text-slate-50'
            }`}
          >
            {formatCurrency(Math.abs(remaining), currency)}
          </span>

          {/* Status Badge */}
          <div className="mt-2">
            {isOverspent ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-500/15 text-red-400 border border-red-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
                Limit Exceeded
              </span>
            ) : isCaution ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-500/15 text-amber-400 border border-amber-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                75% Spent
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Safe Spending
              </span>
            )}
          </div>

          <div className="mt-3 text-xs text-slate-400">
            Spent <span className="text-slate-200 font-semibold">{formatCurrency(spent, currency)}</span> of{' '}
            <span className="text-slate-200 font-semibold">{formatCurrency(limit, currency)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
