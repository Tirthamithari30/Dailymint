import {
  User,
  MonthlyBudget,
  Transaction,
  SavingsGoal,
  NotificationSettings,
  DailyCalculationResult,
  NotificationItem,
  AIInsight,
} from '../types';

const API_BASE = '/api';

const getHeaders = () => {
  const token = localStorage.getItem('dailymint_token') || 'demo-token';
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

export const api = {
  // Auth
  async signup(data: { name: string; email: string; password: string; currency?: string }) {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Signup failed');
    }
    return res.json();
  },

  async login(data: { email: string; password: string }) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Login failed');
    }
    return res.json();
  },

  async demoLogin() {
    const res = await fetch(`${API_BASE}/auth/demo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Demo login failed');
    return res.json();
  },

  async getProfile(): Promise<{ user: User }> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to get user profile');
    return res.json();
  },

  async updateProfile(data: { name?: string; currency?: string }) {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update profile');
    return res.json();
  },

  // Budget
  async getCurrentBudget(): Promise<{ budget: MonthlyBudget; calculations: DailyCalculationResult }> {
    const res = await fetch(`${API_BASE}/budget/current`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to get current budget');
    return res.json();
  },

  async saveBudget(data: {
    monthlyIncome: number;
    fixedExpenses?: number;
    savingsTarget?: number;
    salaryDate?: number;
    rolloverEnabled?: boolean;
  }): Promise<{ budget: MonthlyBudget; calculations: DailyCalculationResult }> {
    const res = await fetch(`${API_BASE}/budget`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to save budget');
    return res.json();
  },

  async toggleRollover(rolloverEnabled: boolean) {
    const res = await fetch(`${API_BASE}/budget/rollover`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ rolloverEnabled }),
    });
    if (!res.ok) throw new Error('Failed to toggle rollover');
    return res.json();
  },

  // Transactions
  async getTransactions(params?: {
    timeframe?: string;
    category?: string;
    paymentMethod?: string;
    type?: string;
    search?: string;
    limit?: number;
  }): Promise<{ transactions: Transaction[]; totalCount: number }> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') query.append(k, String(v));
      });
    }
    const res = await fetch(`${API_BASE}/transactions?${query.toString()}`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to get transactions');
    return res.json();
  },

  async addTransaction(data: Omit<Transaction, 'id' | 'userId' | 'createdAt'>): Promise<{
    transaction: Transaction;
    calculations: DailyCalculationResult;
  }> {
    const res = await fetch(`${API_BASE}/transactions`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to add transaction');
    }
    return res.json();
  },

  async editTransaction(id: string, data: Partial<Transaction>): Promise<{
    transaction: Transaction;
    calculations: DailyCalculationResult;
  }> {
    const res = await fetch(`${API_BASE}/transactions/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update transaction');
    return res.json();
  },

  async deleteTransaction(id: string): Promise<{ deletedId: string; calculations: DailyCalculationResult }> {
    const res = await fetch(`${API_BASE}/transactions/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete transaction');
    return res.json();
  },

  // Goals
  async getGoals(): Promise<{ goals: SavingsGoal[] }> {
    const res = await fetch(`${API_BASE}/goals`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to get savings goals');
    return res.json();
  },

  async addGoal(data: { goalName: string; targetAmount: number; currentAmount?: number; targetDate: string; icon?: string }) {
    const res = await fetch(`${API_BASE}/goals`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to add goal');
    return res.json();
  },

  async updateGoal(id: string, data: Partial<SavingsGoal> & { depositAmount?: number }) {
    const res = await fetch(`${API_BASE}/goals/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update goal');
    return res.json();
  },

  async deleteGoal(id: string) {
    const res = await fetch(`${API_BASE}/goals/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete goal');
    return res.json();
  },

  // AI Assistant
  async sendAIChat(prompt: string): Promise<{ prompt: string; reply: string; timestamp: string }> {
    const res = await fetch(`${API_BASE}/ai/chat`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ prompt }),
    });
    if (!res.ok) throw new Error('Failed to get response from AI assistant');
    return res.json();
  },

  async getAIInsights(): Promise<{ insights: AIInsight[] }> {
    const res = await fetch(`${API_BASE}/ai/insights`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch AI insights');
    return res.json();
  },

  // Notifications
  async getNotificationSettings(): Promise<{ settings: NotificationSettings }> {
    const res = await fetch(`${API_BASE}/notifications/settings`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch notification settings');
    return res.json();
  },

  async updateNotificationSettings(data: Partial<NotificationSettings>) {
    const res = await fetch(`${API_BASE}/notifications/settings`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update notification settings');
    return res.json();
  },

  async getNotificationFeed(): Promise<{ notifications: NotificationItem[] }> {
    const res = await fetch(`${API_BASE}/notifications/feed`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to get notification feed');
    return res.json();
  },
};
