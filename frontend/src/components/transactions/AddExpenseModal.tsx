import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Category, PaymentMethod, TransactionType } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import {
  Utensils,
  ShoppingCart,
  ShoppingBag,
  Car,
  Tv,
  FileText,
  HeartPulse,
  GraduationCap,
  Plane,
  Sparkles,
  HelpCircle,
  PlusCircle,
} from 'lucide-react';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    amount: number;
    transactionType: TransactionType;
    category: Category;
    title: string;
    description?: string;
    paymentMethod: PaymentMethod;
    transactionDate: string;
    transactionTime: string;
  }) => Promise<void>;
  currency?: string;
  remainingToday?: number;
}

const CATEGORIES: { label: Category; icon: React.ReactNode }[] = [
  { label: 'Food', icon: <Utensils size={15} /> },
  { label: 'Groceries', icon: <ShoppingCart size={15} /> },
  { label: 'Shopping', icon: <ShoppingBag size={15} /> },
  { label: 'Transportation', icon: <Car size={15} /> },
  { label: 'Entertainment', icon: <Tv size={15} /> },
  { label: 'Bills', icon: <FileText size={15} /> },
  { label: 'Healthcare', icon: <HeartPulse size={15} /> },
  { label: 'Education', icon: <GraduationCap size={15} /> },
  { label: 'Travel', icon: <Plane size={15} /> },
  { label: 'Other', icon: <HelpCircle size={15} /> },
];

const PAYMENT_METHODS: PaymentMethod[] = ['UPI', 'Credit Card', 'Debit Card', 'Cash', 'Net Banking'];

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  currency = '₹',
  remainingToday = 0,
}) => {
  const [amount, setAmount] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [category, setCategory] = useState<Category>('Food');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [transactionType, setTransactionType] = useState<TransactionType>('expense');
  const [description, setDescription] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState<string>(new Date().toTimeString().substring(0, 5));
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const numAmount = parseFloat(amount) || 0;
  const simulatedRemaining = remainingToday - (transactionType === 'expense' ? numAmount : -numAmount);

  const handleQuickAdd = (val: number) => {
    setAmount((prev) => {
      const current = parseFloat(prev) || 0;
      return (current + val).toString();
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || numAmount <= 0) {
      setError('Please enter a valid amount greater than 0.');
      return;
    }
    if (!title.trim()) {
      setError('Please enter a description or merchant name.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSubmit({
        amount: numAmount,
        transactionType,
        category,
        title: title.trim(),
        description: description.trim() || undefined,
        paymentMethod,
        transactionDate: date,
        transactionTime: `${time}:00`,
      });

      // Reset
      setAmount('');
      setTitle('');
      setDescription('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to record expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={transactionType === 'expense' ? 'Record Expense' : 'Record Income'}
      subtitle="Instantly update your safe daily spending allowance"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Type Switcher */}
        <div className="flex p-1 bg-surface rounded-xl border border-surface-border">
          <button
            type="button"
            onClick={() => setTransactionType('expense')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              transactionType === 'expense'
                ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Expense (-)
          </button>
          <button
            type="button"
            onClick={() => setTransactionType('income')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              transactionType === 'income'
                ? 'bg-primary/15 text-primary border border-primary/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Income (+)
          </button>
        </div>

        {/* Amount Input with Currency */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Amount</label>
          <div className="relative flex items-center">
            <span className="absolute left-4 text-2xl font-bold text-slate-400 select-none">
              {currency}
            </span>
            <input
              type="number"
              step="any"
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              autoFocus
              className="w-full pl-12 pr-4 py-3.5 bg-surface text-2xl font-extrabold text-white rounded-xl border border-surface-border focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary font-mono"
            />
          </div>

          {/* Quick Amount Chips */}
          <div className="flex flex-wrap gap-2 mt-2.5">
            {[100, 250, 500, 1000, 2000].map((val) => (
              <button
                type="button"
                key={val}
                onClick={() => handleQuickAdd(val)}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-surface border border-surface-border text-slate-300 hover:text-primary hover:border-primary/40 transition-all active:scale-95"
              >
                +{currency}{val}
              </button>
            ))}
          </div>
        </div>

        {/* Impact Live Preview */}
        {numAmount > 0 && transactionType === 'expense' && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
              simulatedRemaining >= 0
                ? 'bg-primary/10 border-primary/20 text-slate-200'
                : 'bg-red-500/10 border-red-500/30 text-red-300'
            }`}
          >
            <span>Remaining daily limit after this:</span>
            <span className="font-bold text-sm">
              {formatCurrency(simulatedRemaining, currency)}
            </span>
          </div>
        )}

        {/* Title / Merchant */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Expense Name / Merchant</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Zepto Groceries, Coffee, Swiggy, Uber"
            className="w-full px-4 py-2.5 bg-surface text-sm text-white rounded-xl border border-surface-border focus:border-primary focus:outline-none"
          />
        </div>

        {/* Category Grid */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-2">Category</label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {CATEGORIES.map((cat) => {
              const isSelected = category === cat.label;
              return (
                <button
                  type="button"
                  key={cat.label}
                  onClick={() => setCategory(cat.label)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-primary/15 text-primary border-primary shadow-sm'
                      : 'bg-surface text-slate-400 border-surface-border hover:text-white hover:border-slate-700'
                  }`}
                >
                  <span className={isSelected ? 'text-primary' : 'text-slate-400'}>{cat.icon}</span>
                  <span className="truncate">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Payment Method */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-2">Payment Method</label>
          <div className="flex flex-wrap gap-2">
            {PAYMENT_METHODS.map((method) => {
              const isSelected = paymentMethod === method;
              return (
                <button
                  type="button"
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-primary text-black font-bold border-primary'
                      : 'bg-surface text-slate-400 border-surface-border hover:text-white'
                  }`}
                >
                  {method}
                </button>
              );
            })}
          </div>
        </div>

        {/* Date and Time Row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 bg-surface text-xs text-white rounded-xl border border-surface-border focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Time</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-3 py-2 bg-surface text-xs text-white rounded-xl border border-surface-border focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-xs text-red-400">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            isLoading={isSubmitting}
            icon={<PlusCircle size={18} />}
          >
            {transactionType === 'expense' ? 'Add Expense' : 'Add Income'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
