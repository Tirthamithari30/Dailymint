import React from 'react';
import { DailyCalculationResult } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { Wallet, Landmark, ArrowDownRight, PiggyBank } from 'lucide-react';

interface MonthlyOverviewProps {
  calculations: DailyCalculationResult;
  currency?: string;
  onEditBudget?: () => void;
}

export const MonthlyOverview: React.FC<MonthlyOverviewProps> = ({
  calculations,
  currency = '₹',
  onEditBudget,
}) => {
  const {
    monthlyIncome,
    fixedExpenses,
    totalMonthlySpent,
    remainingMonthlyBalance,
    savingsTarget,
    savingsProgressPercent,
  } = calculations;

  return (
    <div className="space-y-4">
      {/* 4 Overview Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Monthly Income */}
        <div className="p-4 rounded-2xl glass-card border border-surface-border hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Monthly Income</span>
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Wallet size={16} />
            </div>
          </div>
          <div className="text-lg md:text-xl font-bold text-white">
            {formatCurrency(monthlyIncome, currency)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Starting monthly pool</div>
        </div>

        {/* Card 2: Fixed Expenses */}
        <div className="p-4 rounded-2xl glass-card border border-surface-border hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Fixed Expenses</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <Landmark size={16} />
            </div>
          </div>
          <div className="text-lg md:text-xl font-bold text-slate-200">
            {formatCurrency(fixedExpenses, currency)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Rent, EMI, Utilities</div>
        </div>

        {/* Card 3: Total Spent */}
        <div className="p-4 rounded-2xl glass-card border border-surface-border hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Month-to-Date Spent</span>
            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400">
              <ArrowDownRight size={16} />
            </div>
          </div>
          <div className="text-lg md:text-xl font-bold text-slate-100">
            {formatCurrency(totalMonthlySpent, currency)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Discretionary expenses</div>
        </div>

        {/* Card 4: Discretionary Balance */}
        <div className="p-4 rounded-2xl glass-card border border-surface-border hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Remaining Balance</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <PiggyBank size={16} />
            </div>
          </div>
          <div
            className={`text-lg md:text-xl font-bold ${
              remainingMonthlyBalance >= 0 ? 'text-primary' : 'text-red-400'
            }`}
          >
            {formatCurrency(remainingMonthlyBalance, currency)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Safe to spend this month</div>
        </div>
      </div>

      {/* Savings Goal Progress Strip */}
      {savingsTarget > 0 && (
        <div className="p-4 rounded-2xl glass-card border border-surface-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:w-auto">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <span className="text-primary">★</span>
              <span>Monthly Savings Target: {formatCurrency(savingsTarget, currency)}</span>
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              {savingsProgressPercent}% of monthly savings goal secured so far
            </div>
          </div>

          <div className="w-full sm:w-64 flex items-center gap-3">
            <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-primary rounded-full transition-all duration-700"
                style={{ width: `${Math.min(100, Math.max(0, savingsProgressPercent))}%` }}
              />
            </div>
            <span className="text-xs font-bold text-primary shrink-0">{savingsProgressPercent}%</span>
          </div>
        </div>
      )}
    </div>
  );
};
