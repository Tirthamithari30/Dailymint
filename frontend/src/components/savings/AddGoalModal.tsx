import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Target, Laptop, Shield, Plane, Smartphone, Car, PlusCircle } from 'lucide-react';

interface AddGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    goalName: string;
    targetAmount: number;
    currentAmount?: number;
    targetDate: string;
    icon?: string;
  }) => Promise<void>;
  currency?: string;
}

const ICONS = [
  { id: 'target', label: 'General', icon: <Target size={16} /> },
  { id: 'laptop', label: 'Gadget', icon: <Laptop size={16} /> },
  { id: 'shield', label: 'Emergency', icon: <Shield size={16} /> },
  { id: 'plane', label: 'Travel', icon: <Plane size={16} /> },
  { id: 'smartphone', label: 'Phone', icon: <Smartphone size={16} /> },
  { id: 'car', label: 'Vehicle', icon: <Car size={16} /> },
];

export const AddGoalModal: React.FC<AddGoalModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  currency = '₹',
}) => {
  const [goalName, setGoalName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [icon, setIcon] = useState('target');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalName.trim()) {
      setError('Please provide a goal name.');
      return;
    }
    const target = parseFloat(targetAmount);
    if (!target || target <= 0) {
      setError('Please provide a valid target amount.');
      return;
    }
    if (!targetDate) {
      setError('Please select a target completion date.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSubmit({
        goalName: goalName.trim(),
        targetAmount: target,
        currentAmount: parseFloat(currentAmount) || 0,
        targetDate,
        icon,
      });
      setGoalName('');
      setTargetAmount('');
      setCurrentAmount('');
      setTargetDate('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create goal');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Savings Goal"
      subtitle="Track your savings target and daily milestones"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Goal Name */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Goal Name</label>
          <input
            type="text"
            value={goalName}
            onChange={(e) => setGoalName(e.target.value)}
            placeholder="e.g. MacBook Pro, Japan Trip, Emergency Fund"
            className="w-full px-4 py-2.5 bg-surface text-sm text-white rounded-xl border border-surface-border focus:border-primary focus:outline-none"
            autoFocus
          />
        </div>

        {/* Target Amount */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Target Amount</label>
          <div className="relative flex items-center">
            <span className="absolute left-3.5 text-base font-bold text-slate-400 select-none">
              {currency}
            </span>
            <input
              type="number"
              min="1"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              placeholder="100,000"
              className="w-full pl-9 pr-4 py-2.5 bg-surface text-base font-bold text-white rounded-xl border border-surface-border focus:border-primary focus:outline-none font-mono"
            />
          </div>
        </div>

        {/* Current Initial Savings */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Already Saved (Optional)</label>
          <div className="relative flex items-center">
            <span className="absolute left-3.5 text-base font-bold text-slate-400 select-none">
              {currency}
            </span>
            <input
              type="number"
              min="0"
              value={currentAmount}
              onChange={(e) => setCurrentAmount(e.target.value)}
              placeholder="0"
              className="w-full pl-9 pr-4 py-2.5 bg-surface text-base font-bold text-white rounded-xl border border-surface-border focus:border-primary focus:outline-none font-mono"
            />
          </div>
        </div>

        {/* Target Date */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Target Date</label>
          <input
            type="date"
            value={targetDate}
            min={new Date().toISOString().split('T')[0]}
            onChange={(e) => setTargetDate(e.target.value)}
            className="w-full px-3 py-2 bg-surface text-xs text-white rounded-xl border border-surface-border focus:border-primary focus:outline-none"
          />
        </div>

        {/* Icon Picker */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-2">Category Icon</label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {ICONS.map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={() => setIcon(item.id)}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl border text-xs transition-all ${
                  icon === item.id
                    ? 'bg-primary/15 text-primary border-primary'
                    : 'bg-surface text-slate-400 border-surface-border hover:text-white'
                }`}
              >
                {item.icon}
                <span className="text-[10px]">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-xs text-red-400">
            {error}
          </div>
        )}

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            isLoading={isSubmitting}
            icon={<PlusCircle size={18} />}
          >
            Create Savings Goal
          </Button>
        </div>
      </form>
    </Modal>
  );
};
