import { Router, Response } from 'express';
import { db } from '../config/database.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { BudgetCalculator } from '../services/budgetCalculator.js';
import { NotificationSettings } from '../types/index.js';

const router = Router();

// GET /api/notifications/settings
router.get('/settings', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.userId!;
  let settings = db.notificationSettings.get(userId);

  if (!settings) {
    settings = {
      id: `notify-${userId}`,
      userId,
      morningReminder: true,
      eveningReminder: true,
      budgetAlerts: true,
      reminderTimeMorning: '08:30:00',
      reminderTimeEvening: '21:30:00',
      createdAt: new Date().toISOString(),
    };
    db.notificationSettings.set(userId, settings);
  }

  res.json({ settings });
});

// PUT /api/notifications/settings
router.put('/settings', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.userId!;
  const existing = db.notificationSettings.get(userId) || {
    id: `notify-${userId}`,
    userId,
    morningReminder: true,
    eveningReminder: true,
    budgetAlerts: true,
    reminderTimeMorning: '08:30:00',
    reminderTimeEvening: '21:30:00',
    createdAt: new Date().toISOString(),
  };

  const {
    morningReminder,
    eveningReminder,
    budgetAlerts,
    reminderTimeMorning,
    reminderTimeEvening,
  } = req.body;

  if (morningReminder !== undefined) existing.morningReminder = Boolean(morningReminder);
  if (eveningReminder !== undefined) existing.eveningReminder = Boolean(eveningReminder);
  if (budgetAlerts !== undefined) existing.budgetAlerts = Boolean(budgetAlerts);
  if (reminderTimeMorning !== undefined) existing.reminderTimeMorning = reminderTimeMorning;
  if (reminderTimeEvening !== undefined) existing.reminderTimeEvening = reminderTimeEvening;

  db.notificationSettings.set(userId, existing);
  res.json({ message: 'Notification preferences updated', settings: existing });
});

// GET /api/notifications/feed - Generate smart contextual notification stream
router.get('/feed', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.userId!;
  const user = db.users.get(userId) || { currency: '₹' };
  const currency = user.currency || '₹';

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const budgetId = `budget-${userId}-${year}-${month}`;
  const budget = db.budgets.get(budgetId) || {
    id: budgetId,
    userId,
    monthlyIncome: 100000,
    fixedExpenses: 20000,
    savingsTarget: 15000,
    salaryDate: 1,
    rolloverEnabled: true,
    month,
    year,
    createdAt: now.toISOString(),
  };

  const userTransactions = Array.from(db.transactions.values()).filter((tx) => tx.userId === userId);
  const calculations = BudgetCalculator.calculate(budget, userTransactions, now);

  const notifications = [];

  // Morning briefing
  notifications.push({
    id: 'notif-morning',
    title: 'Daily Safe Budget',
    message: `Good morning! Your safe spending budget today is ${currency}${calculations.safeDailyLimit.toLocaleString()}.`,
    type: 'morning',
    time: '08:30 AM',
    unread: false,
  });

  // If spent money today
  if (calculations.spentToday > 0) {
    if (calculations.isOverspentToday) {
      notifications.unshift({
        id: 'notif-overspend',
        title: 'Budget Alert!',
        message: `You have exceeded your planned daily spending by ${currency}${Math.abs(calculations.remainingToday).toLocaleString()}. Safe daily limit adjusted.`,
        type: 'alert',
        time: 'Just now',
        unread: true,
      });
    } else {
      notifications.unshift({
        id: 'notif-spent',
        title: 'Spending Update',
        message: `You have spent ${currency}${calculations.spentToday.toLocaleString()} today. Your remaining safe budget is ${currency}${calculations.remainingToday.toLocaleString()}.`,
        type: 'info',
        time: '1h ago',
        unread: false,
      });
    }
  }

  // Evening summary
  notifications.push({
    id: 'notif-night',
    title: 'Daily Spending Summary',
    message: calculations.isOverspentToday
      ? `Day closed. You spent ${currency}${calculations.spentToday.toLocaleString()}. Tomorrow's safe limit is ${currency}${calculations.safeDailyLimit.toLocaleString()}.`
      : `Your spending summary is ready. You spent ${currency}${calculations.spentToday.toLocaleString()} today and stayed within your budget!`,
    type: 'summary',
    time: '09:30 PM',
    unread: false,
  });

  res.json({ notifications });
});

export default router;
