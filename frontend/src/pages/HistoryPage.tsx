import React, { useState, useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { Transaction, Category, PaymentMethod } from '../types';
import { formatCurrency, getCategoryColor } from '../utils/formatters';
import { formatRelativeDate, formatTimeAmPm } from '../utils/dateUtils';
import { getCategoryIconComponent } from '../components/dashboard/RecentTransactions';
import { Modal } from '../components/common/Modal';
import { Button } from '../components/common/Button';
import {
  Search,
  Filter,
  Plus,
  Trash2,
  Edit2,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  X,
} from 'lucide-react';

interface HistoryPageProps {
  onOpenAddExpense: () => void;
}

const CATEGORIES = [
  'All',
  'Food',
  'Groceries',
  'Shopping',
  'Transportation',
  'Entertainment',
  'Bills',
  'Healthcare',
  'Education',
  'Travel',
  'Salary',
  'Other',
];

const PAYMENT_METHODS = ['All', 'UPI', 'Credit Card', 'Debit Card', 'Cash', 'Net Banking'];

export const HistoryPage: React.FC<HistoryPageProps> = ({ onOpenAddExpense }) => {
  const { user } = useAuth();
  const { transactions, deleteTransaction, editTransaction } = useFinance();
  const currency = user?.currency || '₹';

  const [timeframe, setTimeframe] = useState<'all' | 'daily' | 'weekly' | 'monthly'>('all');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedMethod, setSelectedMethod] = useState('All');

  // Edit Modal State
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editCategory, setEditCategory] = useState<Category>('Food');
  const [editMethod, setEditMethod] = useState<PaymentMethod>('UPI');
  const [isSaving, setIsSaving] = useState(false);

  // Filter logic
  const filtered = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    return transactions.filter((tx) => {
      // Timeframe
      if (timeframe === 'daily' && tx.transactionDate !== todayStr) return false;
      if (timeframe === 'weekly') {
        const oneWeekAgo = new Date(now.getTime() - 7 * 86400000).toISOString().split('T')[0];
        if (tx.transactionDate < oneWeekAgo) return false;
      }
      if (timeframe === 'monthly') {
        const d = new Date(tx.transactionDate);
        if (d.getFullYear() !== now.getFullYear() || d.getMonth() !== now.getMonth()) return false;
      }

      // Search
      if (search.trim()) {
        const s = search.toLowerCase();
        const matchesTitle = tx.title.toLowerCase().includes(s);
        const matchesDesc = tx.description?.toLowerCase().includes(s);
        if (!matchesTitle && !matchesDesc) return false;
      }

      // Category
      if (selectedCategory !== 'All' && tx.category !== selectedCategory) return false;

      // Method
      if (selectedMethod !== 'All' && tx.paymentMethod !== selectedMethod) return false;

      return true;
    });
  }, [transactions, timeframe, search, selectedCategory, selectedMethod]);

  const totalFilteredExpense = filtered
    .filter((t) => t.transactionType === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const openEdit = (tx: Transaction) => {
    setEditingTx(tx);
    setEditTitle(tx.title);
    setEditAmount(tx.amount.toString());
    setEditCategory(tx.category);
    setEditMethod(tx.paymentMethod);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTx) return;

    try {
      setIsSaving(true);
      await editTransaction(editingTx.id, {
        title: editTitle.trim(),
        amount: parseFloat(editAmount) || editingTx.amount,
        category: editCategory,
        paymentMethod: editMethod,
      });
      setEditingTx(null);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Transaction History</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Comprehensive audit log of all recorded expenditures
          </p>
        </div>

        <button
          onClick={onOpenAddExpense}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-black font-extrabold text-xs hover:bg-primary-hover shadow-neon-sm self-start sm:self-auto transition-all active:scale-95"
        >
          <Plus size={16} strokeWidth={3} />
          <span>Record Expense</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="p-4 rounded-3xl glass-card border border-surface-border space-y-4">
        {/* Timeframe switch */}
        <div className="flex p-1 bg-surface rounded-xl border border-surface-border w-full sm:w-auto self-start">
          {[
            { id: 'all', label: 'All Time' },
            { id: 'daily', label: 'Today' },
            { id: 'weekly', label: 'Last 7 Days' },
            { id: 'monthly', label: 'This Month' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTimeframe(tab.id as any)}
              className={`flex-1 sm:flex-initial px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                timeframe === tab.id
                  ? 'bg-primary text-black font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Dropdown Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search bar */}
          <div className="relative flex items-center">
            <Search size={16} className="absolute left-3.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title or merchant..."
              className="w-full pl-10 pr-8 py-2 bg-surface text-xs text-white rounded-xl border border-surface-border focus:border-primary focus:outline-none"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 text-slate-400 hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-surface text-xs text-white rounded-xl border border-surface-border focus:border-primary focus:outline-none"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat} className="bg-surface text-white">
                Category: {cat}
              </option>
            ))}
          </select>

          {/* Payment Method Dropdown */}
          <select
            value={selectedMethod}
            onChange={(e) => setSelectedMethod(e.target.value)}
            className="px-3 py-2 bg-surface text-xs text-white rounded-xl border border-surface-border focus:border-primary focus:outline-none"
          >
            {PAYMENT_METHODS.map((m) => (
              <option key={m} value={m} className="bg-surface text-white">
                Payment: {m}
              </option>
            ))}
          </select>
        </div>

        {/* Filter Summary Strip */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
          <span>
            Found <strong className="text-white">{filtered.length}</strong> transaction(s)
          </span>
          <span>
            Total Filtered Expense:{' '}
            <strong className="text-primary font-mono font-bold">
              {formatCurrency(totalFilteredExpense, currency)}
            </strong>
          </span>
        </div>
      </div>

      {/* Transaction List */}
      <div className="rounded-3xl glass-card border border-surface-border overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm">
            No transactions match the selected filters.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {filtered.map((tx) => {
              const isExpense = tx.transactionType === 'expense';
              const catColors = getCategoryColor(tx.category);

              return (
                <div
                  key={tx.id}
                  className="p-4 sm:px-6 flex items-center justify-between gap-4 hover:bg-slate-800/20 transition-all group"
                >
                  {/* Left: Category Icon & Metadata */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${catColors.bg} ${catColors.text} ${catColors.border}`}
                    >
                      {isExpense ? getCategoryIconComponent(tx.category) : <ArrowUpRight size={18} />}
                    </div>

                    <div className="min-w-0">
                      <div className="text-sm font-bold text-slate-100 truncate group-hover:text-white">
                        {tx.title}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-0.5">
                        <span className="font-medium text-slate-300">{tx.category}</span>
                        <span>•</span>
                        <span>{formatRelativeDate(tx.transactionDate)}</span>
                        {tx.transactionTime && (
                          <>
                            <span>•</span>
                            <span>{formatTimeAmPm(tx.transactionTime)}</span>
                          </>
                        )}
                        <span>•</span>
                        <span className="px-1.5 py-0.5 rounded bg-surface border border-surface-border text-[10px]">
                          {tx.paymentMethod}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Amount & Actions */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div
                        className={`text-base font-extrabold font-mono ${
                          isExpense ? 'text-slate-100' : 'text-primary'
                        }`}
                      >
                        {isExpense ? '-' : '+'}
                        {formatCurrency(tx.amount, currency)}
                      </div>
                      <div className="text-[10px] text-slate-400 capitalize">
                        {tx.transactionType}
                      </div>
                    </div>

                    {/* Edit & Delete Buttons */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEdit(tx)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                        title="Edit transaction"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => deleteTransaction(tx.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                        title="Delete transaction"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Transaction Modal */}
      {editingTx && (
        <Modal
          isOpen={!!editingTx}
          onClose={() => setEditingTx(null)}
          title="Edit Transaction"
          subtitle="Modify entry details"
          maxWidth="sm"
        >
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Title / Merchant</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                required
                className="w-full px-3 py-2 bg-surface text-sm text-white rounded-xl border border-surface-border focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Amount</label>
              <input
                type="number"
                step="any"
                min="1"
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
                required
                className="w-full px-3 py-2 bg-surface text-base font-bold text-white rounded-xl border border-surface-border focus:border-primary focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Category</label>
              <select
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value as Category)}
                className="w-full px-3 py-2 bg-surface text-xs text-white rounded-xl border border-surface-border focus:border-primary focus:outline-none"
              >
                {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                  <option key={c} value={c} className="bg-surface text-white">
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Payment Method</label>
              <select
                value={editMethod}
                onChange={(e) => setEditMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 bg-surface text-xs text-white rounded-xl border border-surface-border focus:border-primary focus:outline-none"
              >
                {PAYMENT_METHODS.filter((m) => m !== 'All').map((m) => (
                  <option key={m} value={m} className="bg-surface text-white">
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-2">
              <Button type="submit" variant="primary" size="md" className="w-full" isLoading={isSaving}>
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
