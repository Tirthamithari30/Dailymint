import React, { useState } from 'react';
import { Button } from '../components/common/Button';
import { formatCurrency } from '../utils/formatters';
import {
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Bot,
  Bell,
  ArrowRight,
  Zap,
  CheckCircle2,
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onExploreDemo: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onGetStarted,
  onExploreDemo,
}) => {
  const [demoSalary, setDemoSalary] = useState<number>(100000);
  const [fixedExpenses, setFixedExpenses] = useState<number>(25000);
  const [savingsTarget, setSavingsTarget] = useState<number>(15000);

  const available = Math.max(0, demoSalary - fixedExpenses - savingsTarget);
  const dailyBudget = Math.round(available / 30);

  return (
    <div className="min-h-screen bg-background text-slate-100 flex flex-col justify-between overflow-hidden relative">
      {/* Ambient background neon orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-primary/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 -right-40 w-[500px] h-[400px] bg-blue-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Header */}
      <header className="relative z-10 max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-primary flex items-center justify-center shadow-neon">
            <Sparkles size={20} className="text-black fill-black" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-white">
            DAILY<span className="text-neon-green">MINT</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onExploreDemo}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-surface-elevated text-slate-200 hover:text-white border border-surface-border hover:border-primary/40 transition-all"
          >
            Live Demo
          </button>
          <Button variant="primary" size="sm" onClick={onGetStarted}>
            Sign In / Sign Up
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 max-w-5xl mx-auto px-6 py-12 text-center flex-1 flex flex-col items-center justify-center">
        {/* Fintech Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-xs font-semibold text-primary mb-6 shadow-sm">
          <Zap size={14} />
          <span>The Intelligent Daily Money Management System</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white max-w-4xl leading-[1.1] mb-6">
          Know your daily limit. <br />
          <span className="bg-gradient-to-r from-emerald-400 via-primary to-neon-green bg-clip-text text-transparent">
            Control your spending.
          </span>{' '}
          <br />
          Save more money.
        </h1>

        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mb-8 leading-relaxed">
          Stop wondering where your monthly salary vanished. DailyMint automatically transforms your
          monthly income into an intelligent, adaptive safe daily spending allowance.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-14">
          <Button
            variant="primary"
            size="lg"
            onClick={onGetStarted}
            icon={<ArrowRight size={18} />}
          >
            Get Started Free
          </Button>
          <button
            onClick={onExploreDemo}
            className="px-6 py-3.5 rounded-xl font-bold text-slate-200 bg-surface-elevated border border-surface-border hover:border-slate-600 hover:bg-slate-800 transition-all text-base flex items-center gap-2"
          >
            <Sparkles size={16} className="text-primary" />
            <span>Explore Demo Account</span>
          </button>
        </div>

        {/* Interactive Live Calculator Widget */}
        <div className="w-full max-w-2xl p-6 sm:p-8 rounded-3xl glass-card border border-surface-border shadow-2xl relative text-left">
          <div className="flex items-center justify-between border-b border-surface-border pb-4 mb-6">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Instant Daily Limit Calculator
              </h2>
              <p className="text-xs text-slate-400">See your real daily spending power in seconds</p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-primary/15 text-primary border border-primary/30">
              Interactive
            </span>
          </div>

          <div className="space-y-5">
            {/* Salary Slider */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-2">
                <span className="text-slate-400">Monthly Salary:</span>
                <span className="text-white font-mono text-sm">{formatCurrency(demoSalary)}</span>
              </div>
              <input
                type="range"
                min="20000"
                max="300000"
                step="5000"
                value={demoSalary}
                onChange={(e) => setDemoSalary(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Fixed Expenses Slider */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-2">
                <span className="text-slate-400">Fixed Expenses (Rent, Bills):</span>
                <span className="text-slate-300 font-mono text-sm">{formatCurrency(fixedExpenses)}</span>
              </div>
              <input
                type="range"
                min="5000"
                max="150000"
                step="2500"
                value={fixedExpenses}
                onChange={(e) => setFixedExpenses(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Savings Goal Slider */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-2">
                <span className="text-slate-400">Monthly Savings Target:</span>
                <span className="text-slate-300 font-mono text-sm">{formatCurrency(savingsTarget)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="100000"
                step="2500"
                value={savingsTarget}
                onChange={(e) => setSavingsTarget(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Output Result Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-surface-elevated to-primary/10 border border-primary/30 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                  Your Safe Daily Spending Limit
                </span>
                <div className="text-3xl sm:text-4xl font-extrabold text-neon-green font-mono mt-1">
                  {formatCurrency(dailyBudget)}
                  <span className="text-sm font-normal text-slate-300"> / day</span>
                </div>
              </div>
              <button
                onClick={onGetStarted}
                className="px-4 py-2.5 rounded-xl bg-primary text-black font-extrabold text-xs hover:bg-primary-hover shadow-neon-sm"
              >
                Start Tracking
              </button>
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl w-full mt-16 text-left">
          <div className="p-6 rounded-3xl glass-card border border-surface-border">
            <div className="w-10 h-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center mb-4">
              <ShieldCheck size={20} />
            </div>
            <h3 className="text-base font-bold text-white mb-1.5">Smart Safe Daily Limit</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Dynamically recalibrates based on real-time spending. Overspent yesterday? Your future days adapt automatically.
            </p>
          </div>

          <div className="p-6 rounded-3xl glass-card border border-surface-border">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center mb-4">
              <Bot size={20} />
            </div>
            <h3 className="text-base font-bold text-white mb-1.5">AI Financial Copilot</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Ask questions on your actual financial logs: "Where did my money go?" or "Can I afford dinner tonight?"
            </p>
          </div>

          <div className="p-6 rounded-3xl glass-card border border-surface-border">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center mb-4">
              <Bell size={20} />
            </div>
            <h3 className="text-base font-bold text-white mb-1.5">Smart Spending Alerts</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Morning budget briefings, post-transaction balance updates, and evening wrap-up summaries.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-surface-border py-6 px-6 text-center text-xs text-slate-400">
        © 2026 DailyMint. Know your daily limit. Control your spending. Save more money.
      </footer>
    </div>
  );
};
