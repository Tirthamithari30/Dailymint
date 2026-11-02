import React from 'react';
import { CircularProgress } from '../common/CircularProgress';
import { formatCurrency } from '../../utils/formatters';
import { DailyCalculationResult } from '../../types';
import { ShieldCheck, TrendingDown, Calendar, RefreshCw } from 'lucide-react';

interface DailyBudgetCardProps {
  calculations: DailyCalculationResult;
  currency?: string;
  onOpenAddExpense: () => void;
}

export const DailyBudgetCard: React.FC<DailyBudgetCardProps> = ({
  calculations,
  currency = '₹',
  onOpenAddExpense,
}) => {
  const {
    baseDailyLimit,
    safeDailyLimit,
    spentToday,
    remainingToday,
    remainingDaysInMonth,
    daysInMonth,
    currentDay,
    rolloverEnabled,
  } = calculations;

  return (
    <div className="relative overflow-hidden rounded-3xl glass-card border border-surface-border p-6 md:p-8 bg-gradient-to-b from-surface-card/90 via-surface/80 to-surface-card/90 shadow-card-glow">
      {/* Top Banner with rollover & day badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-primary animate-pulse" />
          <span className="text-xs font-semibold tracking-wider uppercase text-slate-300">
            Daily Spending Engine
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-800/80 text-slate-300 border border-slate-700/60">
            <Calendar size={13} className="text-primary" />
            Day {currentDay} of {daysInMonth} ({remainingDaysInMonth} days left)
          </span>

          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
              rolloverEnabled
                ? 'bg-primary/10 text-primary border-primary/30'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            <RefreshCw size={11} className={rolloverEnabled ? 'animate-spin-slow' : ''} />
            {rolloverEnabled ? 'Rollover Active' : 'Strict Mode'}
          </span>
        </div>
      </div>

      {/* Main Circular Gauge Display */}
      <div className="my-4 flex justify-center">
        <CircularProgress
          spent={spentToday}
          limit={safeDailyLimit > 0 ? safeDailyLimit : baseDailyLimit}
          remaining={remainingToday}
          currency={currency}
          size={290}
          strokeWidth={22}
        />
      </div>

      {/* Dynamic Telemetry Metrics Footer */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 mt-6 border-t border-slate-800/90 text-center">
        {/* Metric 1: Original Target */}
        <div className="p-3.5 rounded-2xl bg-surface/60 border border-surface-border/60 hover:border-slate-700 transition-colors">
          <div className="text-xs text-slate-400 font-medium mb-1">Original Daily Target</div>
          <div className="text-base font-bold text-slate-200">
            {formatCurrency(baseDailyLimit, currency)}
            <span className="text-[11px] font-normal text-slate-400"> /day</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Fixed baseline for month</div>
        </div>

        {/* Metric 2: Smart Safe Limit */}
        <div className="p-3.5 rounded-2xl bg-primary/5 border border-primary/20 hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-center gap-1 text-xs text-primary font-medium mb-1">
            <ShieldCheck size={13} />
            <span>Safe Daily Budget</span>
          </div>
          <div className="text-base font-bold text-neon-green">
            {formatCurrency(safeDailyLimit, currency)}
            <span className="text-[11px] font-normal text-primary/70"> /day</span>
          </div>
          <div className="text-[11px] text-slate-300 mt-0.5">
            {safeDailyLimit >= baseDailyLimit ? '✨ Surplus accumulated' : '⚡ Adjusted for month balance'}
          </div>
        </div>

        {/* Metric 3: Spent Today */}
        <div className="p-3.5 rounded-2xl bg-surface/60 border border-surface-border/60 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-center gap-1 text-xs text-slate-400 font-medium mb-1">
            <TrendingDown size={13} className="text-orange-400" />
            <span>Total Spent Today</span>
          </div>
          <div className="text-base font-bold text-slate-100">
            {formatCurrency(spentToday, currency)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {remainingToday >= 0 ? `${formatCurrency(remainingToday, currency)} safe to spend` : 'Exceeded daily limit'}
          </div>
        </div>
      </div>
    </div>
  );
};
