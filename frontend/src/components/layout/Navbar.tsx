import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { getGreeting, formatDisplayDate } from '../../utils/dateUtils';
import { Bell, Sparkles, User as UserIcon, LogOut, Settings as SettingsIcon } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  onOpenNotifications: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onNavigate,
  onOpenNotifications,
}) => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();

  return (
    <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-xl border-b border-surface-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('dashboard')}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-primary flex items-center justify-center shadow-neon-sm">
            <Sparkles size={18} className="text-black fill-black" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-extrabold tracking-tight text-white flex items-center gap-1">
              DAILY<span className="text-neon-green">MINT</span>
            </span>
            <span className="text-[10px] text-slate-400 -mt-1 tracking-wider uppercase">
              Financial Intelligence
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-surface-card/60 p-1.5 rounded-2xl border border-surface-border">
          {[
            { id: 'dashboard', label: 'Dashboard' },
            { id: 'transactions', label: 'Transactions' },
            { id: 'analytics', label: 'Analytics' },
            { id: 'savings', label: 'Savings Goals' },
            { id: 'ai', label: 'AI Advisor' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                currentTab === item.id
                  ? 'bg-primary text-black font-bold shadow-neon-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Right Section: User & Notifications */}
        <div className="flex items-center gap-3">
          {/* Greeting info on larger screens */}
          {user && (
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-bold text-slate-200">
                {getGreeting()}, {user.name.split(' ')[0]}
              </span>
              <span className="text-[10px] text-slate-400">{formatDisplayDate()}</span>
            </div>
          )}

          {/* Notification Bell */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-xl text-slate-400 hover:text-white bg-surface-card border border-surface-border hover:border-slate-700 transition-colors"
            title="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-black text-[10px] font-black flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* User Profile / Settings Menu */}
          <button
            onClick={() => onNavigate('profile')}
            className={`p-1.5 rounded-xl border flex items-center gap-2 transition-all ${
              currentTab === 'profile'
                ? 'bg-primary/20 border-primary text-primary'
                : 'bg-surface-card border-surface-border text-slate-300 hover:border-slate-700'
            }`}
            title="Profile & Settings"
          >
            <div className="w-7 h-7 rounded-lg bg-surface-elevated text-primary font-bold text-xs flex items-center justify-center border border-primary/20">
              {user ? user.name[0].toUpperCase() : 'U'}
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
