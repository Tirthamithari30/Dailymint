import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  MonthlyBudget,
  Transaction,
  SavingsGoal,
  DailyCalculationResult,
  AIInsight,
} from '../types';
import { api } from '../services/api';
import { useAuth } from './AuthContext';
import confetti from 'canvas-confetti';

interface FinanceContextType {
  budget: MonthlyBudget | null;
  calculations: DailyCalculationResult | null;
  transactions: Transaction[];
  goals: SavingsGoal[];
  aiInsights: AIInsight[];
  isLoading: boolean;
  refreshData: () => Promise<void>;
  addTransaction: (data: Omit<Transaction, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  editTransaction: (id: string, data: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  saveBudget: (data: {
    monthlyIncome: number;
    fixedExpenses?: number;
    savingsTarget?: number;
    salaryDate?: number;
    rolloverEnabled?: boolean;
  }) => Promise<void>;
  toggleRollover: (enabled: boolean) => Promise<void>;
  addGoal: (data: { goalName: string; targetAmount: number; currentAmount?: number; targetDate: string; icon?: string }) => Promise<void>;
  updateGoal: (id: string, data: Partial<SavingsGoal> & { depositAmount?: number }) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [budget, setBudget] = useState<MonthlyBudget | null>(null);
  const [calculations, setCalculations] = useState<DailyCalculationResult | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshData = useCallback(async () => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const [budgetRes, txRes, goalsRes, insightsRes] = await Promise.allSettled([
        api.getCurrentBudget(),
        api.getTransactions(),
        api.getGoals(),
        api.getAIInsights(),
      ]);

      if (budgetRes.status === 'fulfilled') {
        setBudget(budgetRes.value.budget);
        setCalculations(budgetRes.value.calculations);
      }
      if (txRes.status === 'fulfilled') {
        setTransactions(txRes.value.transactions);
      }
      if (goalsRes.status === 'fulfilled') {
        setGoals(goalsRes.value.goals);
      }
      if (insightsRes.status === 'fulfilled') {
        setAiInsights(insightsRes.value.insights);
      }
    } catch (err) {
      console.error('Failed to refresh financial state:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const addTransaction = async (data: Omit<Transaction, 'id' | 'userId' | 'createdAt'>) => {
    const res = await api.addTransaction(data);
    setTransactions((prev) => [res.transaction, ...prev]);
    setCalculations(res.calculations);

    // If staying within safe budget on income or expense, or celebrating
    if (res.transaction.transactionType === 'income') {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });
    }
  };

  const editTransaction = async (id: string, data: Partial<Transaction>) => {
    const res = await api.editTransaction(id, data);
    setTransactions((prev) => prev.map((t) => (t.id === id ? res.transaction : t)));
    setCalculations(res.calculations);
  };

  const deleteTransaction = async (id: string) => {
    const res = await api.deleteTransaction(id);
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    setCalculations(res.calculations);
  };

  const saveBudget = async (data: {
    monthlyIncome: number;
    fixedExpenses?: number;
    savingsTarget?: number;
    salaryDate?: number;
    rolloverEnabled?: boolean;
  }) => {
    const res = await api.saveBudget(data);
    setBudget(res.budget);
    setCalculations(res.calculations);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const toggleRollover = async (enabled: boolean) => {
    const res = await api.toggleRollover(enabled);
    setBudget(res.budget);
    setCalculations(res.calculations);
  };

  const addGoal = async (data: { goalName: string; targetAmount: number; currentAmount?: number; targetDate: string; icon?: string }) => {
    await api.addGoal(data);
    const res = await api.getGoals();
    setGoals(res.goals);
    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.7 },
    });
  };

  const updateGoal = async (id: string, data: Partial<SavingsGoal> & { depositAmount?: number }) => {
    await api.updateGoal(id, data);
    const res = await api.getGoals();
    setGoals(res.goals);

    if (data.depositAmount && data.depositAmount > 0) {
      confetti({
        particleCount: 45,
        spread: 55,
        origin: { y: 0.8 },
      });
    }
  };

  const deleteGoal = async (id: string) => {
    await api.deleteGoal(id);
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  return (
    <FinanceContext.Provider
      value={{
        budget,
        calculations,
        transactions,
        goals,
        aiInsights,
        isLoading,
        refreshData,
        addTransaction,
        editTransaction,
        deleteTransaction,
        saveBudget,
        toggleRollover,
        addGoal,
        updateGoal,
        deleteGoal,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error('useFinance must be used within a FinanceProvider');
  return ctx;
};
