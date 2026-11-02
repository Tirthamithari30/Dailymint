import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { SavingsGoal } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { Plus, Minus, ArrowRight } from 'lucide-react';

interface DepositModalProps {
  goal: SavingsGoal | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, data: { depositAmount: number }) => Promise<void>;
  currency?: string;
}

export const DepositModal: React.FC<DepositModalProps> = ({
  goal,
  isOpen,
  onClose,
  onUpdate,
  currency = '₹',
}) => {
  const [amount, setAmount] = useState('');
  const [mode, setMode] = useState<'deposit' | 'withdraw'>('deposit');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!goal) return null;

  const numAmount = parseFloat(amount) || 0;
  const newProjectedAmount =
    mode === 'deposit'
      ? goal.currentAmount + numAmount
      : Math.max(0, goal.currentAmount - numAmount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || numAmount <= 0) {
      setError('Please enter a valid amount.');
      return;
    }
    if (mode === 'withdraw' && numAmount > goal.currentAmount) {
      setError('Cannot withdraw more than current saved balance.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onUpdate(goal.id, {
        depositAmount: mode === 'deposit' ? numAmount : -numAmount,
      });
      setAmount('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${mode === 'deposit' ? 'Add Funds to' : 'Withdraw from'} ${goal.goalName}`}
      subtitle={`Current balance: ${formatCurrency(goal.currentAmount, currency)} of ${formatCurrency(goal.targetAmount, currency)}`}
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Mode switcher */}
        <div className="flex p-1 bg-surface rounded-xl border border-surface-border">
          <button
            type="button"
            onClick={() => setMode('deposit')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              mode === 'deposit'
                ? 'bg-primary/20 text-primary border border-primary/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Deposit (+)
          </button>
          <button
            type="button"
            onClick={() => setMode('withdraw')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              mode === 'withdraw'
                ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Withdraw (-)
          </button>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Amount</label>
          <div className="relative flex items-center">
            <span className="absolute left-3.5 text-base font-bold text-slate-400 select-none">
              {currency}
            </span>
            <input
              type="number"
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              autoFocus
              className="w-full pl-9 pr-4 py-2.5 bg-surface text-lg font-bold text-white rounded-xl border border-surface-border focus:border-primary focus:outline-none font-mono"
            />
          </div>
        </div>

        {/* Projection */}
        {numAmount > 0 && (
          <div className="p-3 rounded-xl bg-surface/60 border border-surface-border text-xs flex items-center justify-between">
            <span className="text-slate-400">New Saved Balance:</span>
            <span className="font-bold text-primary font-mono">
              {formatCurrency(newProjectedAmount, currency)}
            </span>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-xs text-red-400">
            {error}
          </div>
        )}

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="md"
            className="w-full"
            isLoading={isSubmitting}
          >
            Confirm {mode === 'deposit' ? 'Deposit' : 'Withdrawal'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
