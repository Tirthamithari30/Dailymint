import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { AIChatDrawer } from '../components/ai/AIChatDrawer';
import { Bot, Sparkles } from 'lucide-react';

export const AIPage: React.FC = () => {
  const { user } = useAuth();
  const { aiInsights } = useFinance();
  const currency = user?.currency || '₹';

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      <div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary/20 text-primary flex items-center justify-center border border-primary/30">
            <Bot size={18} />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">AI Financial Assistant</h2>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Trained on your real spending logs to give honest, actionable financial advice
        </p>
      </div>

      <AIChatDrawer currency={currency} insights={aiInsights} />
    </div>
  );
};
