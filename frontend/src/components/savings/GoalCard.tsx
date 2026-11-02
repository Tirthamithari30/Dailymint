import React from 'react';
import { SavingsGoal } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { Laptop, Shield, Plane, Target, Calendar, PlusCircle, Trash2, CheckCircle2 } from 'lucide-react';

interface GoalCardProps {
  goal: SavingsGoal;
  currency?: string;
  onDeposit: (goal: SavingsGoal) => void;
  onDelete: (id: string) => void;
}

const getGoalIcon = (iconName?: string) => {
  switch (iconName) {
    case 'laptop':
      return <Laptop size={20} className="text-blue-400" />;
    case 'shield':
      return <Shield size={20} className="text-emerald-400" />;
    case 'plane':
      return <Plane size={20} className="text-purple-400" />;
    default:
      return <Target size={20} className="text-primary" />;
  }
};

export const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  currency = '₹',
  onDeposit,
  onDelete,
}) => {
  const percent = goal.progressPercent || Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
  const isCompleted = goal.isCompleted || goal.currentAmount >= goal.targetAmount;

  return (
    <div className="rounded-3xl glass-card border border-surface-border p-6 hover:border-slate-700 transition-all group flex flex-col justify-between">
      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-surface-elevated flex items-center justify-center border border-surface-border shadow-sm">
              {getGoalIcon(goal.icon)}
            </div>
            <div>
              <h4 className="text-base font-bold text-white group-hover:text-primary transition-colors">
                {goal.goalName}
              </h4>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                <Calendar size={12} className="text-slate-400" />
                <span>Target: {new Date(goal.targetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onDelete(goal.id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            title="Delete goal"
          >
            <Trash2 size={16} />
          </button>
        </div>

        {/* Amount Saved vs Target */}
        <div className="my-4">
          <div className="flex items-baseline justify-between mb-1.5">
            <span className="text-xs text-slate-400 font-medium">Progress</span>
            <span className="text-sm font-bold text-primary font-mono">{percent}%</span>
          </div>

          {/* Progress bar */}
          <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${
                isCompleted
                  ? 'bg-gradient-to-r from-emerald-400 to-primary shadow-neon'
                  : 'bg-gradient-to-r from-emerald-500 to-primary'
              }`}
              style={{ width: `${percent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs mt-2 text-slate-400">
            <span>Saved: <strong className="text-white font-mono">{formatCurrency(goal.currentAmount, currency)}</strong></span>
            <span>Target: <strong className="text-white font-mono">{formatCurrency(goal.targetAmount, currency)}</strong></span>
          </div>
        </div>

        {/* Smart savings calculation requirement */}
        {!isCompleted && goal.daysRemaining && (
          <div className="p-3.5 rounded-2xl bg-surface/60 border border-surface-border/60 text-xs space-y-1 mb-4">
            <div className="flex justify-between text-slate-400">
              <span>Daily savings needed:</span>
              <span className="font-bold text-primary font-mono">
                {formatCurrency(goal.dailyNeeded || 0, currency)}/day
              </span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Monthly commitment:</span>
              <span className="font-semibold text-slate-200 font-mono">
                {formatCurrency(goal.monthlyNeeded || 0, currency)}/mo
              </span>
            </div>
            <div className="text-[11px] text-slate-400 pt-0.5">
              {goal.daysRemaining} days remaining to target date
            </div>
          </div>
        )}

        {isCompleted && (
          <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-400 flex items-center gap-2 mb-4">
            <CheckCircle2 size={16} />
            <span className="font-semibold">Goal achieved! You saved the full amount.</span>
          </div>
        )}
      </div>

      {/* Action: Deposit funds */}
      <button
        onClick={() => onDeposit(goal)}
        className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-surface-elevated hover:bg-slate-700 text-slate-200 border border-surface-border hover:border-primary/40 flex items-center justify-center gap-2 transition-all active:scale-95"
      >
        <PlusCircle size={15} className="text-primary" />
        <span>Add / Withdraw Funds</span>
      </button>
    </div>
  );
};
