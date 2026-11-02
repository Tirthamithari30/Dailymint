import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { CircularProgress } from '../components/common/CircularProgress';
import { formatCurrency } from '../utils/formatters';
import { Sparkles, ArrowRight, ShieldCheck, Check, DollarSign, Wallet } from 'lucide-react';

interface OnboardingPageProps {
  onComplete: () => void;
}

export const OnboardingPage: React.FC<OnboardingPageProps> = ({ onComplete }) => {
  const { user, updateUser } = useAuth();
  const { saveBudget } = useFinance();

  const [step, setStep] = useState<number>(1);
  const [monthlyIncome, setMonthlyIncome] = useState<string>('100000');
  const [fixedExpenses, setFixedExpenses] = useState<string>('20000');
  const [savingsTarget, setSavingsTarget] = useState<string>('15000');
  const [salaryDate, setSalaryDate] = useState<number>(1);
  const [currency, setCurrency] = useState<string>(user?.currency || '₹');
  const [rolloverEnabled, setRolloverEnabled] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const numIncome = parseFloat(monthlyIncome) || 0;
  const numFixed = parseFloat(fixedExpenses) || 0;
  const numSavings = parseFloat(savingsTarget) || 0;

  const available = Math.max(0, numIncome - numFixed - numSavings);
  const dailyAllowance = Math.round(available / 30);

  const handleFinish = async () => {
    if (numIncome <= 0) {
      setError('Please provide a valid monthly income.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // Update user currency if changed
      if (user && currency !== user.currency) {
        await updateUser({ currency });
      }

      await saveBudget({
        monthlyIncome: numIncome,
        fixedExpenses: numFixed,
        savingsTarget: numSavings,
        salaryDate,
        rolloverEnabled,
      });

      onComplete();
    } catch (err: any) {
      setError(err.message || 'Failed to save financial configuration');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background glow orbs */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-xl relative z-10">
        {/* Progress Step Bar */}
        <div className="flex items-center justify-between mb-8 px-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step === s
                    ? 'bg-primary text-black shadow-neon-sm ring-2 ring-primary/40'
                    : step > s
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-surface text-slate-400 border border-surface-border'
                }`}
              >
                {step > s ? <Check size={14} /> : s}
              </div>
              <span className={`text-xs font-medium hidden sm:inline ${step === s ? 'text-white' : 'text-slate-400'}`}>
                {s === 1 ? 'Income & Currency' : s === 2 ? 'Expenses & Target' : 'Review & Confirm'}
              </span>
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="p-6 sm:p-8 rounded-3xl glass-card border border-surface-border shadow-2xl">
          {/* STEP 1: Income and Currency */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Let's configure your baseline income
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  How much net income do you receive per month, and in which currency?
                </p>
              </div>

              {/* Currency Picker */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">Select Primary Currency</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { symbol: '₹', label: 'INR (₹)' },
                    { symbol: '$', label: 'USD ($)' },
                    { symbol: '€', label: 'EUR (€)' },
                    { symbol: '£', label: 'GBP (£)' },
                  ].map((cur) => (
                    <button
                      type="button"
                      key={cur.symbol}
                      onClick={() => setCurrency(cur.symbol)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                        currency === cur.symbol
                          ? 'bg-primary/20 text-primary border-primary'
                          : 'bg-surface text-slate-400 border-surface-border hover:text-white'
                      }`}
                    >
                      {cur.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Monthly Income Input */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Monthly Net Salary / Income</label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-2xl font-bold text-slate-400 select-none">
                    {currency}
                  </span>
                  <input
                    type="number"
                    min="1"
                    value={monthlyIncome}
                    onChange={(e) => setMonthlyIncome(e.target.value)}
                    placeholder="100,000"
                    autoFocus
                    className="w-full pl-12 pr-4 py-3.5 bg-surface text-2xl font-extrabold text-white rounded-xl border border-surface-border focus:border-primary focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Salary Date */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Salary Day of Month</label>
                <select
                  value={salaryDate}
                  onChange={(e) => setSalaryDate(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-surface text-sm text-white rounded-xl border border-surface-border focus:border-primary focus:outline-none"
                >
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                    <option key={day} value={day} className="bg-surface text-white">
                      Day {day} of every month
                    </option>
                  ))}
                </select>
              </div>

              <Button
                variant="primary"
                size="lg"
                className="w-full mt-4"
                onClick={() => setStep(2)}
                icon={<ArrowRight size={16} />}
              >
                Continue to Commitments
              </Button>
            </div>
          )}

          {/* STEP 2: Fixed Expenses & Savings Target */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Fixed expenses & savings goals
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  We subtract these first so your daily limit is 100% safe to spend.
                </p>
              </div>

              {/* Fixed Expenses */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Fixed Monthly Expenses (Rent, EMIs, Utilities, Subscriptions)
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-xl font-bold text-slate-400 select-none">
                    {currency}
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={fixedExpenses}
                    onChange={(e) => setFixedExpenses(e.target.value)}
                    placeholder="20,000"
                    className="w-full pl-12 pr-4 py-3 bg-surface text-xl font-bold text-white rounded-xl border border-surface-border focus:border-primary focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Monthly Savings Target */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Monthly Savings Target
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-xl font-bold text-slate-400 select-none">
                    {currency}
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={savingsTarget}
                    onChange={(e) => setSavingsTarget(e.target.value)}
                    placeholder="15,000"
                    className="w-full pl-12 pr-4 py-3 bg-surface text-xl font-bold text-white rounded-xl border border-surface-border focus:border-primary focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Rollover setting toggle */}
              <div className="p-4 rounded-2xl bg-surface/80 border border-surface-border flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">Enable Budget Rollover</div>
                  <div className="text-[11px] text-slate-400">
                    Unspent money today automatically increases future daily allowances.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setRolloverEnabled(!rolloverEnabled)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                    rolloverEnabled ? 'bg-primary justify-end' : 'bg-slate-700 justify-start'
                  }`}
                >
                  <div className="bg-black w-4 h-4 rounded-full shadow-md transform transition-transform" />
                </button>
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="secondary" size="lg" onClick={() => setStep(1)} className="flex-1">
                  Back
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => setStep(3)}
                  className="flex-1"
                  icon={<ArrowRight size={16} />}
                >
                  Preview Daily Limit
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: Live Circular Preview & Confirmation */}
          {step === 3 && (
            <div className="space-y-6 text-center">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Your Personalized Daily Budget
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Here is how much you can safely spend every single day:
                </p>
              </div>

              {/* Visual Circular Gauge */}
              <div className="flex justify-center py-2">
                <CircularProgress
                  spent={0}
                  limit={dailyAllowance}
                  remaining={dailyAllowance}
                  currency={currency}
                  size={240}
                  strokeWidth={18}
                />
              </div>

              {/* Breakdown List */}
              <div className="p-4 rounded-2xl bg-surface/60 border border-surface-border text-xs space-y-2 text-left">
                <div className="flex justify-between text-slate-400">
                  <span>Monthly Income:</span>
                  <span className="font-semibold text-white font-mono">{formatCurrency(numIncome, currency)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Fixed Expenses:</span>
                  <span className="font-semibold text-white font-mono">-{formatCurrency(numFixed, currency)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Savings Target:</span>
                  <span className="font-semibold text-primary font-mono">-{formatCurrency(numSavings, currency)}</span>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-slate-200">
                  <span>Available Discretionary Pool:</span>
                  <span className="text-neon-green font-mono">{formatCurrency(available, currency)}/mo</span>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-xs text-red-400">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button variant="secondary" size="lg" onClick={() => setStep(2)} className="flex-1">
                  Adjust Figures
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleFinish}
                  isLoading={isSubmitting}
                  className="flex-1"
                  icon={<Sparkles size={16} />}
                >
                  Confirm & Launch App
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
