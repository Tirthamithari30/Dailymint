import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { SavingsGoal } from '../types';
import { GoalCard } from '../components/savings/GoalCard';
import { AddGoalModal } from '../components/savings/AddGoalModal';
import { DepositModal } from '../components/savings/DepositModal';
import { formatCurrency } from '../utils/formatters';
import { Plus, PiggyBank, Sparkles, Target } from 'lucide-react';

export const SavingsPage: React.FC = () => {
  const { user } = useAuth();
  const { goals, addGoal, updateGoal, deleteGoal } = useFinance();
  const currency = user?.currency || '₹';

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedGoalForDeposit, setSelectedGoalForDeposit] = useState<SavingsGoal | null>(null);

  const totalSaved = goals.reduce((sum, g) => sum + Number(g.currentAmount), 0);
  const totalTarget = goals.reduce((sum, g) => sum + Number(g.targetAmount), 0);
  const overallProgress = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Savings Goals</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Turn safe daily discipline into long-term financial freedom
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-black font-extrabold text-xs hover:bg-primary-hover shadow-neon-sm self-start sm:self-auto transition-all active:scale-95"
        >
          <Plus size={16} strokeWidth={3} />
          <span>New Savings Goal</span>
        </button>
      </div>

      {/* Aggregate Overview Card */}
      <div className="p-6 rounded-3xl glass-card border border-surface-border bg-gradient-to-r from-surface-card via-surface-elevated to-surface-card flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-card-glow">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/15 text-primary flex items-center justify-center border border-primary/30 shadow-neon-sm">
            <PiggyBank size={28} />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Saved Across Goals
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono mt-0.5">
              {formatCurrency(totalSaved, currency)}
              <span className="text-sm font-normal text-slate-400"> of {formatCurrency(totalTarget, currency)}</span>
            </div>
          </div>
        </div>

        <div className="w-full sm:w-64">
          <div className="flex justify-between text-xs font-bold mb-1.5">
            <span className="text-slate-400">Overall Target Achieved</span>
            <span className="text-neon-green font-mono">{overallProgress}%</span>
          </div>
          <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-primary rounded-full transition-all duration-700"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Goals Grid */}
      {goals.length === 0 ? (
        <div className="p-12 text-center rounded-3xl glass-card border border-surface-border">
          <Target size={40} className="mx-auto text-slate-600 mb-3" />
          <h3 className="text-base font-bold text-white mb-1">No savings goals yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
            Set your sights on a MacBook, emergency fund, or dream vacation. We'll tell you exactly how much to save daily.
          </p>
          <button
            onClick={() => setIsAddOpen(true)}
            className="px-4 py-2 rounded-xl bg-primary text-black font-bold text-xs hover:bg-primary-hover shadow-neon-sm"
          >
            Create Your First Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              currency={currency}
              onDeposit={(g) => setSelectedGoalForDeposit(g)}
              onDelete={deleteGoal}
            />
          ))}
        </div>
      )}

      {/* Add Goal Modal */}
      <AddGoalModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSubmit={addGoal}
        currency={currency}
      />

      {/* Deposit/Withdraw Modal */}
      {selectedGoalForDeposit && (
        <DepositModal
          goal={selectedGoalForDeposit}
          isOpen={!!selectedGoalForDeposit}
          onClose={() => setSelectedGoalForDeposit(null)}
          onUpdate={updateGoal}
          currency={currency}
        />
      )}
    </div>
  );
};
