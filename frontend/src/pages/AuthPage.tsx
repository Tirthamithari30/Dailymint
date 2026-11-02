import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { Sparkles, Mail, Lock, User, ArrowLeft, ArrowRight } from 'lucide-react';

interface AuthPageProps {
  onBackToLanding: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onBackToLanding }) => {
  const { login, signup, demoLogin, isLoading } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currency, setCurrency] = useState('₹');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (mode === 'signup') {
        if (!name.trim()) throw new Error('Please enter your full name.');
        await signup(name, email, password, currency);
      } else {
        await login(email, password);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    }
  };

  const handleDemo = async () => {
    setError(null);
    try {
      await demoLogin();
    } catch (err: any) {
      setError(err.message || 'Failed to initialize demo');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background glow orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[400px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Back button */}
      <button
        onClick={onBackToLanding}
        className="absolute top-6 left-6 flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft size={16} /> Back to home
      </button>

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-primary items-center justify-center shadow-neon mb-3">
            <Sparkles size={24} className="text-black fill-black" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome to <span className="text-neon-green">DailyMint</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {mode === 'login'
              ? 'Sign in to access your daily budget & spending telemetry'
              : 'Create your account to start managing daily limits'}
          </p>
        </div>

        {/* 1-Click Demo Shortcut */}
        <div className="mb-6 p-4 rounded-2xl glass-card border border-primary/30 bg-primary/5 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <Sparkles size={13} className="text-primary" /> Instant Preview
            </div>
            <div className="text-[11px] text-slate-400">Preloaded with realistic transactions</div>
          </div>
          <button
            onClick={handleDemo}
            disabled={isLoading}
            className="px-3.5 py-1.5 rounded-xl bg-primary text-black font-extrabold text-xs hover:bg-primary-hover shadow-neon-sm transition-all active:scale-95 disabled:opacity-50"
          >
            Explore Demo
          </button>
        </div>

        {/* Auth Card */}
        <div className="p-6 sm:p-8 rounded-3xl glass-card border border-surface-border shadow-2xl">
          {/* Tab Switcher */}
          <div className="flex p-1 bg-surface rounded-xl border border-surface-border mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-primary text-black font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setError(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                mode === 'signup'
                  ? 'bg-primary text-black font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Full Name</label>
                <div className="relative flex items-center">
                  <User size={16} className="absolute left-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Vance"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-surface text-sm text-white rounded-xl border border-surface-border focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Email Address</label>
              <div className="relative flex items-center">
                <Mail size={16} className="absolute left-3.5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@example.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-surface text-sm text-white rounded-xl border border-surface-border focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Password</label>
              <div className="relative flex items-center">
                <Lock size={16} className="absolute left-3.5 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-surface text-sm text-white rounded-xl border border-surface-border focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Currency</label>
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
                      className={`p-2 rounded-xl border text-xs font-semibold transition-all ${
                        currency === cur.symbol
                          ? 'bg-primary/20 text-primary border-primary'
                          : 'bg-surface text-slate-400 border-surface-border hover:text-white'
                      }`}
                    >
                      {cur.symbol}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-xs text-red-400">
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              isLoading={isLoading}
              icon={<ArrowRight size={16} />}
            >
              {mode === 'login' ? 'Sign In to Dashboard' : 'Create DailyMint Account'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
