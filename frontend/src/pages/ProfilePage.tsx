import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useFinance } from '../context/FinanceContext';
import { useNotifications } from '../context/NotificationContext';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { formatCurrency } from '../utils/formatters';
import {
  User,
  Mail,
  Coins,
  Bell,
  RefreshCw,
  LogOut,
  Sliders,
  CheckCircle,
  Shield,
  HelpCircle,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, updateUser, logout } = useAuth();
  const { budget, calculations, saveBudget, toggleRollover } = useFinance();
  const { settings, updateSettings } = useNotifications();

  const [name, setName] = useState(user?.name || '');
  const [currency, setCurrency] = useState(user?.currency || '₹');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Budget Adjust Modal State
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [monthlyIncome, setMonthlyIncome] = useState(budget?.monthlyIncome.toString() || '100000');
  const [fixedExpenses, setFixedExpenses] = useState(budget?.fixedExpenses.toString() || '20000');
  const [savingsTarget, setSavingsTarget] = useState(budget?.savingsTarget.toString() || '15000');
  const [isSavingBudget, setIsSavingBudget] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsUpdatingProfile(true);
      await updateUser({ name, currency });
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleSaveBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSavingBudget(true);
      await saveBudget({
        monthlyIncome: parseFloat(monthlyIncome) || 0,
        fixedExpenses: parseFloat(fixedExpenses) || 0,
        savingsTarget: parseFloat(savingsTarget) || 0,
        rolloverEnabled: budget?.rolloverEnabled !== false,
      });
      setIsBudgetModalOpen(false);
    } finally {
      setIsSavingBudget(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Account & Preferences</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Manage your profile, currency, daily limits, and smart notification timing
        </p>
      </div>

      {/* Profile Card */}
      <div className="p-6 sm:p-8 rounded-3xl glass-card border border-surface-border">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-primary flex items-center justify-center text-2xl font-black text-black shadow-neon-sm">
            {user ? user.name[0].toUpperCase() : 'U'}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{user?.name}</h3>
            <p className="text-xs text-slate-400">{user?.email}</p>
            <span className="inline-flex items-center gap-1 mt-1 text-[11px] font-semibold text-primary">
              <Shield size={12} /> Authenticated Session
            </span>
          </div>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 bg-surface text-sm text-white rounded-xl border border-surface-border focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Primary Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-4 py-2.5 bg-surface text-sm text-white rounded-xl border border-surface-border focus:border-primary focus:outline-none"
              >
                <option value="₹" className="bg-surface text-white">INR (₹) - Indian Rupee</option>
                <option value="$" className="bg-surface text-white">USD ($) - US Dollar</option>
                <option value="€" className="bg-surface text-white">EUR (€) - Euro</option>
                <option value="£" className="bg-surface text-white">GBP (£) - British Pound</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            {profileSuccess ? (
              <span className="text-xs text-primary flex items-center gap-1 font-semibold">
                <CheckCircle size={14} /> Profile preferences saved!
              </span>
            ) : <span />}

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isUpdatingProfile}
            >
              Save Profile Changes
            </Button>
          </div>
        </form>
      </div>

      {/* Monthly Baseline Budget Section */}
      <div className="p-6 sm:p-8 rounded-3xl glass-card border border-surface-border flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h3 className="text-base font-bold text-white mb-1">Monthly Baseline Budget</h3>
          <p className="text-xs text-slate-400 max-w-md">
            Currently configured as{' '}
            <strong className="text-white font-mono">{formatCurrency(budget?.monthlyIncome || 0, currency)}</strong>{' '}
            monthly income with{' '}
            <strong className="text-white font-mono">{formatCurrency(budget?.fixedExpenses || 0, currency)}</strong>{' '}
            in fixed expenses.
          </p>
        </div>

        <button
          onClick={() => {
            setMonthlyIncome(budget?.monthlyIncome.toString() || '100000');
            setFixedExpenses(budget?.fixedExpenses.toString() || '20000');
            setSavingsTarget(budget?.savingsTarget.toString() || '15000');
            setIsBudgetModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-surface-elevated hover:bg-slate-700 text-xs font-bold text-white border border-surface-border hover:border-primary/40 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Sliders size={14} className="text-primary" />
          <span>Adjust Monthly Budget</span>
        </button>
      </div>

      {/* Budget Rollover Setting */}
      <div className="p-6 sm:p-8 rounded-3xl glass-card border border-surface-border flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <RefreshCw size={16} className="text-primary" />
            <h3 className="text-sm font-bold text-white">Smart Budget Rollover</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-md">
            When enabled, money you don't spend today rolls over to increase your future safe daily allowance.
            If disabled, a strict daily target is maintained every day.
          </p>
        </div>

        <button
          type="button"
          onClick={() => toggleRollover(budget?.rolloverEnabled === false)}
          className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
            budget?.rolloverEnabled !== false ? 'bg-primary justify-end' : 'bg-slate-700 justify-start'
          }`}
        >
          <div className="bg-black w-4 h-4 rounded-full shadow-md" />
        </button>
      </div>

      {/* Notifications Configuration */}
      <div className="p-6 sm:p-8 rounded-3xl glass-card border border-surface-border space-y-5">
        <div>
          <div className="flex items-center gap-2">
            <Bell size={18} className="text-primary" />
            <h3 className="text-base font-bold text-white">Notification Preferences</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure automated daily alerts and spending limit reminders
          </p>
        </div>

        <div className="space-y-4">
          {/* Morning briefing toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-surface/60 border border-surface-border">
            <div>
              <div className="text-xs font-bold text-white">Morning Daily Allowance Briefing</div>
              <div className="text-[11px] text-slate-400">
                Receive your safe spending target as you start your morning
              </div>
            </div>
            <button
              type="button"
              onClick={() => updateSettings({ morningReminder: !settings?.morningReminder })}
              className={`w-11 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                settings?.morningReminder ? 'bg-primary justify-end' : 'bg-slate-700 justify-start'
              }`}
            >
              <div className="bg-black w-4 h-4 rounded-full shadow-md" />
            </button>
          </div>

          {/* Overspending alerts toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-surface/60 border border-surface-border">
            <div>
              <div className="text-xs font-bold text-white">Overspending Real-Time Warning</div>
              <div className="text-[11px] text-slate-400">
                Instant alert whenever a transaction exceeds your safe daily budget
              </div>
            </div>
            <button
              type="button"
              onClick={() => updateSettings({ budgetAlerts: !settings?.budgetAlerts })}
              className={`w-11 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                settings?.budgetAlerts ? 'bg-primary justify-end' : 'bg-slate-700 justify-start'
              }`}
            >
              <div className="bg-black w-4 h-4 rounded-full shadow-md" />
            </button>
          </div>

          {/* Evening recap toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-surface/60 border border-surface-border">
            <div>
              <div className="text-xs font-bold text-white">Evening Spending Wrap-Up</div>
              <div className="text-[11px] text-slate-400">
                End-of-day summary of total spent and whether you stayed within budget
              </div>
            </div>
            <button
              type="button"
              onClick={() => updateSettings({ eveningReminder: !settings?.eveningReminder })}
              className={`w-11 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                settings?.eveningReminder ? 'bg-primary justify-end' : 'bg-slate-700 justify-start'
              }`}
            >
              <div className="bg-black w-4 h-4 rounded-full shadow-md" />
            </button>
          </div>
        </div>
      </div>

      {/* Logout button */}
      <div className="p-6 rounded-3xl glass-card border border-surface-border flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-white">Sign Out</h4>
          <p className="text-xs text-slate-400">Sign out of your active DailyMint session on this device</p>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold transition-all"
        >
          <LogOut size={15} />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Adjust Monthly Budget Modal */}
      <Modal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        title="Adjust Monthly Financial Parameters"
        subtitle="Recalculates your base and safe daily allowances"
        maxWidth="md"
      >
        <form onSubmit={handleSaveBudget} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Monthly Income</label>
            <input
              type="number"
              min="1"
              value={monthlyIncome}
              onChange={(e) => setMonthlyIncome(e.target.value)}
              required
              className="w-full px-3 py-2 bg-surface text-base font-bold text-white rounded-xl border border-surface-border focus:border-primary focus:outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Fixed Expenses</label>
            <input
              type="number"
              min="0"
              value={fixedExpenses}
              onChange={(e) => setFixedExpenses(e.target.value)}
              required
              className="w-full px-3 py-2 bg-surface text-base font-bold text-white rounded-xl border border-surface-border focus:border-primary focus:outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Monthly Savings Target</label>
            <input
              type="number"
              min="0"
              value={savingsTarget}
              onChange={(e) => setSavingsTarget(e.target.value)}
              required
              className="w-full px-3 py-2 bg-surface text-base font-bold text-white rounded-xl border border-surface-border focus:border-primary focus:outline-none font-mono"
            />
          </div>

          <div className="pt-2">
            <Button type="submit" variant="primary" size="md" className="w-full" isLoading={isSavingBudget}>
              Save & Recalculate
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
