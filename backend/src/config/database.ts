import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { User, MonthlyBudget, Transaction, SavingsGoal, NotificationSettings } from '../types/index.js';

let supabase: SupabaseClient | null = null;

if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
  try {
    supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    console.log('✅ Connected to Supabase PostgreSQL database.');
  } catch (err) {
    console.warn('⚠️ Supabase connection failed, falling back to in-memory store:', err);
  }
} else {
  console.log('ℹ️ Running in Local In-Memory Store mode (Supabase credentials not set). Full demo data enabled.');
}

// In-Memory Data Store (Used when Supabase is not configured or in demo mode)
class MockDatabase {
  users: Map<string, User & { passwordHash?: string }> = new Map();
  budgets: Map<string, MonthlyBudget> = new Map();
  transactions: Map<string, Transaction> = new Map();
  goals: Map<string, SavingsGoal> = new Map();
  notificationSettings: Map<string, NotificationSettings> = new Map();

  constructor() {
    this.seedDemoData();
  }

  seedDemoData() {
    const demoUserId = 'demo-user-12345';
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const todayStr = now.toISOString().split('T')[0];

    // Seed Demo User
    this.users.set(demoUserId, {
      id: demoUserId,
      email: 'demo@dailymint.app',
      name: 'Alex Vance',
      currency: '₹',
      createdAt: new Date(now.getTime() - 60 * 86400000).toISOString(),
    });

    // Seed Budget (₹1,00,000 income, ₹20,000 fixed expenses, ₹15,000 savings target)
    const budgetId = `budget-${demoUserId}-${currentYear}-${currentMonth}`;
    this.budgets.set(budgetId, {
      id: budgetId,
      userId: demoUserId,
      monthlyIncome: 100000,
      fixedExpenses: 20000,
      savingsTarget: 15000,
      salaryDate: 1,
      rolloverEnabled: true,
      month: currentMonth,
      year: currentYear,
      createdAt: new Date().toISOString(),
    });

    // Helper to format date offset from today
    const getDateStr = (offsetDays: number) => {
      const d = new Date(now);
      d.setDate(d.getDate() - offsetDays);
      return d.toISOString().split('T')[0];
    };

    // Seed Transactions
    const demoTxData: Array<Omit<Transaction, 'id' | 'userId' | 'createdAt'>> = [
      // Today's transactions
      {
        title: 'Morning Specialty Coffee',
        amount: 250,
        transactionType: 'expense',
        category: 'Food',
        description: 'Blue Tokai cold brew at cafe',
        paymentMethod: 'UPI',
        transactionDate: todayStr,
        transactionTime: '08:45:00',
      },
      {
        title: 'Zepto Quick Groceries',
        amount: 420,
        transactionType: 'expense',
        category: 'Groceries',
        description: 'Milk, bread, Greek yogurt, fruits',
        paymentMethod: 'UPI',
        transactionDate: todayStr,
        transactionTime: '11:15:00',
      },
      {
        title: 'Auto Rickshaw to Office',
        amount: 140,
        transactionType: 'expense',
        category: 'Transportation',
        description: 'Morning commute via Ola Auto',
        paymentMethod: 'UPI',
        transactionDate: todayStr,
        transactionTime: '09:20:00',
      },
      // Previous days this month
      {
        title: 'Weekend Groceries at Nature Basket',
        amount: 1850,
        transactionType: 'expense',
        category: 'Groceries',
        description: 'Weekly produce and organic pantry items',
        paymentMethod: 'Credit Card',
        transactionDate: getDateStr(1),
        transactionTime: '18:30:00',
      },
      {
        title: 'Swiggy Dinner with Friends',
        amount: 980,
        transactionType: 'expense',
        category: 'Food',
        description: 'Wood fired pizza and pasta',
        paymentMethod: 'UPI',
        transactionDate: getDateStr(2),
        transactionTime: '20:45:00',
      },
      {
        title: 'Zara Casual Wardrobe',
        amount: 2490,
        transactionType: 'expense',
        category: 'Shopping',
        description: 'Linen shirts on seasonal discount',
        paymentMethod: 'Credit Card',
        transactionDate: getDateStr(3),
        transactionTime: '16:10:00',
      },
      {
        title: 'Uber to Airport',
        amount: 850,
        transactionType: 'expense',
        category: 'Transportation',
        description: 'Cab ride for weekend visit',
        paymentMethod: 'UPI',
        transactionDate: getDateStr(4),
        transactionTime: '06:00:00',
      },
      {
        title: 'Netflix & Spotify Premium',
        amount: 799,
        transactionType: 'expense',
        category: 'Entertainment',
        description: 'Monthly streaming subscriptions',
        paymentMethod: 'Credit Card',
        transactionDate: getDateStr(5),
        transactionTime: '12:00:00',
      },
      {
        title: 'Electricity & Wifi Bill',
        amount: 2300,
        transactionType: 'expense',
        category: 'Bills',
        description: 'Airtel Xstream Fiber & Tata Power',
        paymentMethod: 'Net Banking',
        transactionDate: getDateStr(7),
        transactionTime: '10:00:00',
      },
      {
        title: 'Pharmacy & Multivitamins',
        amount: 650,
        transactionType: 'expense',
        category: 'Healthcare',
        description: 'Supplements and pain relief',
        paymentMethod: 'UPI',
        transactionDate: getDateStr(9),
        transactionTime: '14:20:00',
      },
      {
        title: 'Freelance Design Consulting',
        amount: 15000,
        transactionType: 'income',
        category: 'Salary',
        description: 'Side project design sprint milestone',
        paymentMethod: 'Net Banking',
        transactionDate: getDateStr(8),
        transactionTime: '15:00:00',
      }
    ];

    demoTxData.forEach((tx, idx) => {
      const id = `tx-demo-${idx + 1}`;
      this.transactions.set(id, {
        ...tx,
        id,
        userId: demoUserId,
        createdAt: new Date().toISOString(),
      });
    });

    // Seed Savings Goals
    const goal1Id = 'goal-laptop-1';
    this.goals.set(goal1Id, {
      id: goal1Id,
      userId: demoUserId,
      goalName: 'MacBook Pro M4',
      targetAmount: 180000,
      currentAmount: 110000,
      targetDate: new Date(now.getFullYear(), now.getMonth() + 4, 15).toISOString().split('T')[0],
      icon: 'laptop',
      createdAt: new Date().toISOString(),
    });

    const goal2Id = 'goal-emergency-2';
    this.goals.set(goal2Id, {
      id: goal2Id,
      userId: demoUserId,
      goalName: '6-Month Emergency Fund',
      targetAmount: 300000,
      currentAmount: 195000,
      targetDate: new Date(now.getFullYear(), now.getMonth() + 8, 30).toISOString().split('T')[0],
      icon: 'shield',
      createdAt: new Date().toISOString(),
    });

    const goal3Id = 'goal-trip-3';
    this.goals.set(goal3Id, {
      id: goal3Id,
      userId: demoUserId,
      goalName: 'Japan Cherry Blossom Trip',
      targetAmount: 250000,
      currentAmount: 85000,
      targetDate: new Date(now.getFullYear() + 1, 3, 10).toISOString().split('T')[0],
      icon: 'plane',
      createdAt: new Date().toISOString(),
    });

    // Seed Notification Settings
    this.notificationSettings.set(demoUserId, {
      id: `notify-${demoUserId}`,
      userId: demoUserId,
      morningReminder: true,
      eveningReminder: true,
      budgetAlerts: true,
      reminderTimeMorning: '08:30:00',
      reminderTimeEvening: '21:30:00',
      createdAt: new Date().toISOString(),
    });
  }
}

export const db = new MockDatabase();
export { supabase };
