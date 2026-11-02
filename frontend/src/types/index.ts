export interface User {
  id: string;
  email: string;
  name: string;
  currency: string;
  needsOnboarding?: boolean;
}

export interface MonthlyBudget {
  id: string;
  userId: string;
  monthlyIncome: number;
  fixedExpenses: number;
  savingsTarget: number;
  salaryDate: number;
  rolloverEnabled: boolean;
  month: number;
  year: number;
  createdAt?: string;
}

export type TransactionType = 'expense' | 'income';

export type Category = 
  | 'Food' 
  | 'Groceries' 
  | 'Shopping' 
  | 'Transportation' 
  | 'Entertainment' 
  | 'Bills' 
  | 'Healthcare' 
  | 'Education' 
  | 'Travel' 
  | 'Salary' 
  | 'Investment' 
  | 'Other';

export type PaymentMethod = 'UPI' | 'Credit Card' | 'Debit Card' | 'Cash' | 'Net Banking' | 'Other';

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  transactionType: TransactionType;
  category: Category;
  title: string;
  description?: string;
  paymentMethod: PaymentMethod;
  transactionDate: string; // YYYY-MM-DD
  transactionTime: string; // HH:mm:ss
  createdAt: string;
}

export interface SavingsGoal {
  id: string;
  userId: string;
  goalName: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  icon?: string;
  daysRemaining?: number;
  amountRemaining?: number;
  dailyNeeded?: number;
  monthlyNeeded?: number;
  progressPercent?: number;
  isCompleted?: boolean;
  createdAt?: string;
}

export interface NotificationSettings {
  id: string;
  userId: string;
  morningReminder: boolean;
  eveningReminder: boolean;
  budgetAlerts: boolean;
  reminderTimeMorning: string;
  reminderTimeEvening: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'morning' | 'alert' | 'info' | 'summary';
  time: string;
  unread: boolean;
}

export interface DailyCalculationResult {
  monthlyIncome: number;
  fixedExpenses: number;
  savingsTarget: number;
  availableMonthlyBudget: number;
  daysInMonth: number;
  currentDay: number;
  remainingDaysInMonth: number;
  baseDailyLimit: number;
  safeDailyLimit: number;
  spentToday: number;
  remainingToday: number;
  totalMonthlySpent: number;
  remainingMonthlyBalance: number;
  isOverspentToday: boolean;
  rolloverEnabled: boolean;
  savingsProgressPercent: number;
}

export interface AIInsight {
  id: string;
  type: 'success' | 'warning' | 'info' | 'tip';
  title: string;
  message: string;
  impactAmount?: number;
}
