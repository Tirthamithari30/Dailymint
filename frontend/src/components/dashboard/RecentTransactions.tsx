import React from 'react';
import { Transaction } from '../../types';
import { formatCurrency, getCategoryColor } from '../../utils/formatters';
import { formatRelativeDate, formatTimeAmPm } from '../../utils/dateUtils';
import {
  Utensils,
  ShoppingBag,
  ShoppingCart,
  Car,
  Tv,
  FileText,
  HeartPulse,
  GraduationCap,
  Plane,
  ArrowDownLeft,
  ArrowUpRight,
  ChevronRight,
  MoreVertical,
  Trash2,
} from 'lucide-react';

interface RecentTransactionsProps {
  transactions: Transaction[];
  currency?: string;
  onViewAll: () => void;
  onDeleteTransaction?: (id: string) => void;
  onEditTransaction?: (tx: Transaction) => void;
}

export const getCategoryIconComponent = (category: string) => {
  switch (category) {
    case 'Food':
      return <Utensils size={16} />;
    case 'Groceries':
      return <ShoppingCart size={16} />;
    case 'Shopping':
      return <ShoppingBag size={16} />;
    case 'Transportation':
      return <Car size={16} />;
    case 'Entertainment':
      return <Tv size={16} />;
    case 'Bills':
      return <FileText size={16} />;
    case 'Healthcare':
      return <HeartPulse size={16} />;
    case 'Education':
      return <GraduationCap size={16} />;
    case 'Travel':
      return <Plane size={16} />;
    default:
      return <ShoppingBag size={16} />;
  }
};

export const RecentTransactions: React.FC<RecentTransactionsProps> = ({
  transactions,
  currency = '₹',
  onViewAll,
  onDeleteTransaction,
  onEditTransaction,
}) => {
  const recent = transactions.slice(0, 5);

  return (
    <div className="rounded-2xl glass-card border border-surface-border p-5 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-white">Recent Transactions</h3>
          <p className="text-xs text-slate-400">Latest activity tracked this month</p>
        </div>
        <button
          onClick={onViewAll}
          className="text-xs font-semibold text-primary hover:text-primary-hover flex items-center gap-1 transition-colors"
        >
          View All <ChevronRight size={14} />
        </button>
      </div>

      {recent.length === 0 ? (
        <div className="py-8 text-center text-slate-400 text-sm">
          No transactions recorded yet. Tap <span className="text-primary font-semibold">+ Add Expense</span> to log your first spend!
        </div>
      ) : (
        <div className="divide-y divide-slate-800/80">
          {recent.map((tx) => {
            const isExpense = tx.transactionType === 'expense';
            const catColors = getCategoryColor(tx.category);

            return (
              <div
                key={tx.id}
                className="py-3.5 flex items-center justify-between gap-3 group hover:bg-slate-800/20 px-2 rounded-xl transition-all"
              >
                {/* Left: Icon & Details */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${catColors.bg} ${catColors.text} ${catColors.border}`}
                  >
                    {isExpense ? getCategoryIconComponent(tx.category) : <ArrowUpRight size={16} />}
                  </div>

                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-100 truncate group-hover:text-white">
                      {tx.title}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span>{tx.category}</span>
                      <span>•</span>
                      <span>{formatRelativeDate(tx.transactionDate)}</span>
                      {tx.transactionTime && (
                        <>
                          <span>•</span>
                          <span>{formatTimeAmPm(tx.transactionTime)}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Amount & Actions */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div
                      className={`text-sm md:text-base font-bold font-mono ${
                        isExpense ? 'text-slate-100' : 'text-primary'
                      }`}
                    >
                      {isExpense ? '-' : '+'}
                      {formatCurrency(tx.amount, currency)}
                    </div>
                    <div className="text-[10px] text-slate-400">{tx.paymentMethod}</div>
                  </div>

                  {onDeleteTransaction && (
                    <button
                      onClick={() => onDeleteTransaction(tx.id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                      title="Delete expense"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
