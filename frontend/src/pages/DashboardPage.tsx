import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { DailyBudgetCard } from '../components/dashboard/DailyBudgetCard';
import { MonthlyOverview } from '../components/dashboard/MonthlyOverview';
import { RecentTransactions } from '../components/dashboard/RecentTransactions';
import { Button } from '../components/common/Button';
import { Plus, Bot, Receipt, BarChart3, Sparkles } from 'lucide-react';

interface DashboardPageProps {
  onOpenAddExpense: () => void;
  onNavigate: (tab: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onOpenAddExpense,
  onNavigate,
}) => {
  const { user } = useAuth();
  const { calculations, transactions, deleteTransaction, isLoading } = useFinance();

  const currency = user?.currency || '₹';

  if (isLoading || !calculations) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-slate-400 font-mono tracking-wider">Syncing live ledger...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Quick Action Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={onOpenAddExpense}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-black font-extrabold text-xs hover:bg-primary-hover shadow-neon-sm shrink-0 transition-transform active:scale-95"
        >
          <Plus size={15} strokeWidth={3} />
          <span>Add Expense</span>
        </button>

        <button
          onClick={() => onNavigate('ai')}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface-card border border-surface-border text-slate-200 hover:border-primary/40 hover:text-white font-semibold text-xs shrink-0 transition-all"
        >
          <Bot size={15} className="text-primary" />
          <span>Ask AI Copilot</span>
        </button>

        <button
          onClick={() => onNavigate('transactions')}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface-card border border-surface-border text-slate-200 hover:border-slate-600 hover:text-white font-semibold text-xs shrink-0 transition-all"
        >
          <Receipt size={15} className="text-blue-400" />
          <span>All Expenses</span>
        </button>

        <button
          onClick={() => onNavigate('analytics')}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface-card border border-surface-border text-slate-200 hover:border-slate-600 hover:text-white font-semibold text-xs shrink-0 transition-all"
        >
          <BarChart3 size={15} className="text-amber-400" />
          <span>Analytics</span>
        </button>
      </div>

      {/* Main Daily Budget Circular Gauge Card */}
      <DailyBudgetCard
        calculations={calculations}
        currency={currency}
        onOpenAddExpense={onOpenAddExpense}
      />

      {/* Monthly Financial Overview Cards */}
      <MonthlyOverview
        calculations={calculations}
        currency={currency}
      />

      {/* Recent Transactions Section */}
      <RecentTransactions
        transactions={transactions}
        currency={currency}
        onViewAll={() => onNavigate('transactions')}
        onDeleteTransaction={deleteTransaction}
      />
    </div>
  );
};
