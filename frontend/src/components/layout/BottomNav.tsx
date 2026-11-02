import React from 'react';
import { Home, Receipt, BarChart2, PiggyBank, Bot, User } from 'lucide-react';

interface BottomNavProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  onOpenAddExpense: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onNavigate,
  onOpenAddExpense,
}) => {
  const tabs = [
    { id: 'dashboard', label: 'Home', icon: <Home size={19} /> },
    { id: 'transactions', label: 'History', icon: <Receipt size={19} /> },
    { id: 'add', label: '', icon: null }, // Spacer for middle floating button
    { id: 'analytics', label: 'Analytics', icon: <BarChart2 size={19} /> },
    { id: 'savings', label: 'Savings', icon: <PiggyBank size={19} /> },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface/90 backdrop-blur-2xl border-t border-surface-border px-3 py-2 pb-safe">
      <div className="flex items-center justify-around relative">
        {tabs.map((tab, idx) => {
          if (tab.id === 'add') {
            return (
              <div key="floating-spacer" className="w-12 flex justify-center">
                {/* Floating center '+' trigger */}
                <button
                  onClick={onOpenAddExpense}
                  className="absolute -top-5 w-12 h-12 rounded-full bg-primary text-black font-extrabold flex items-center justify-center shadow-neon hover:scale-105 active:scale-95 transition-all border-4 border-background"
                  aria-label="Add Expense"
                >
                  <span className="text-2xl font-bold -mt-0.5">+</span>
                </button>
              </div>
            );
          }

          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
                isActive ? 'text-primary' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className={isActive ? 'text-neon-green scale-110 transition-transform' : ''}>
                {tab.icon}
              </div>
              <span className={`text-[10px] font-semibold ${isActive ? 'text-primary' : 'text-slate-400'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
