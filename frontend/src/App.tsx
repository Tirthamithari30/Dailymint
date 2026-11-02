import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { NotificationProvider } from './context/NotificationContext';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { DashboardPage } from './pages/DashboardPage';
import { HistoryPage } from './pages/HistoryPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SavingsPage } from './pages/SavingsPage';
import { AIPage } from './pages/AIPage';
import { ProfilePage } from './pages/ProfilePage';
import { Navbar } from './components/layout/Navbar';
import { BottomNav } from './components/layout/BottomNav';
import { FloatingAddButton } from './components/layout/FloatingAddButton';
import { AddExpenseModal } from './components/transactions/AddExpenseModal';
import { NotificationPanel } from './components/notifications/NotificationPanel';

const AppContent: React.FC = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { budget, calculations, addTransaction, isLoading: financeLoading } = useFinance();

  // Navigation tab state: 'landing' | 'auth' | 'onboarding' | 'dashboard' | 'transactions' | 'analytics' | 'savings' | 'ai' | 'profile'
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [authView, setAuthView] = useState<'landing' | 'auth'>('landing');
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  // 1. Loading Splash
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-neon" />
        <span className="text-xs text-slate-400 font-mono tracking-widest uppercase">Initializing DailyMint...</span>
      </div>
    );
  }

  // 2. Unauthenticated: Show Landing Page or Auth Page
  if (!isAuthenticated) {
    if (authView === 'landing') {
      return (
        <LandingPage
          onGetStarted={() => setAuthView('auth')}
          onExploreDemo={() => setAuthView('auth')}
        />
      );
    }
    return <AuthPage onBackToLanding={() => setAuthView('landing')} />;
  }

  // 3. Needs Onboarding (new user without monthly income)
  const needsOnboarding = user?.needsOnboarding || (budget && budget.monthlyIncome === 0);
  if (needsOnboarding) {
    return <OnboardingPage onComplete={() => setActiveTab('dashboard')} />;
  }

  // 4. Authenticated & Onboarded: App Shell
  const currency = user?.currency || '₹';

  return (
    <div className="min-h-screen bg-background text-slate-100 flex flex-col selection:bg-primary selection:text-black">
      {/* Top Navbar */}
      <Navbar
        currentTab={activeTab}
        onNavigate={(tab) => setActiveTab(tab)}
        onOpenNotifications={() => setIsNotificationOpen(true)}
      />

      {/* Main Screen Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardPage
            onOpenAddExpense={() => setIsAddExpenseOpen(true)}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        )}
        {activeTab === 'transactions' && (
          <HistoryPage onOpenAddExpense={() => setIsAddExpenseOpen(true)} />
        )}
        {activeTab === 'analytics' && <AnalyticsPage />}
        {activeTab === 'savings' && <SavingsPage />}
        {activeTab === 'ai' && <AIPage />}
        {activeTab === 'profile' && <ProfilePage />}
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        currentTab={activeTab}
        onNavigate={(tab) => setActiveTab(tab)}
        onOpenAddExpense={() => setIsAddExpenseOpen(true)}
      />

      {/* Desktop Floating Add Button */}
      <FloatingAddButton onClick={() => setIsAddExpenseOpen(true)} />

      {/* Global Add Expense Modal */}
      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        onSubmit={addTransaction}
        currency={currency}
        remainingToday={calculations?.remainingToday || 0}
      />

      {/* Global Notifications Drawer */}
      <NotificationPanel
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        onOpenSettings={() => setActiveTab('profile')}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <FinanceProvider>
        <NotificationProvider>
          <AppContent />
        </NotificationProvider>
      </FinanceProvider>
    </AuthProvider>
  );
};

export default App;
