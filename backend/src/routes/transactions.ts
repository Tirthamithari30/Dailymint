import { Router, Response } from 'express';
import { db } from '../config/database.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { BudgetCalculator } from '../services/budgetCalculator.js';
import { Transaction } from '../types/index.js';

const router = Router();

// GET /api/transactions - Fetch filtered transactions
router.get('/', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.userId!;
  const { category, paymentMethod, type, search, timeframe, limit } = req.query;

  let transactions = Array.from(db.transactions.values())
    .filter((tx) => tx.userId === userId)
    .sort((a, b) => {
      const dateA = new Date(`${a.transactionDate}T${a.transactionTime || '00:00:00'}`).getTime();
      const dateB = new Date(`${b.transactionDate}T${b.transactionTime || '00:00:00'}`).getTime();
      return dateB - dateA;
    });

  // Timeframe filter
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  if (timeframe === 'daily') {
    transactions = transactions.filter((tx) => tx.transactionDate === todayStr);
  } else if (timeframe === 'weekly') {
    const oneWeekAgo = new Date(now.getTime() - 7 * 86400000).toISOString().split('T')[0];
    transactions = transactions.filter((tx) => tx.transactionDate >= oneWeekAgo);
  } else if (timeframe === 'monthly') {
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    transactions = transactions.filter((tx) => {
      const d = new Date(tx.transactionDate);
      return d.getFullYear() === currentYear && d.getMonth() + 1 === currentMonth;
    });
  }

  // Category filter
  if (category && category !== 'All') {
    transactions = transactions.filter((tx) => tx.category.toLowerCase() === (category as string).toLowerCase());
  }

  // Payment Method filter
  if (paymentMethod && paymentMethod !== 'All') {
    transactions = transactions.filter((tx) => tx.paymentMethod.toLowerCase() === (paymentMethod as string).toLowerCase());
  }

  // Type filter (expense or income)
  if (type && type !== 'All') {
    transactions = transactions.filter((tx) => tx.transactionType === type);
  }

  // Search filter
  if (search) {
    const s = (search as string).toLowerCase();
    transactions = transactions.filter(
      (tx) => tx.title.toLowerCase().includes(s) || (tx.description && tx.description.toLowerCase().includes(s))
    );
  }

  if (limit) {
    transactions = transactions.slice(0, Number(limit));
  }

  res.json({
    totalCount: transactions.length,
    transactions,
  });
});

// POST /api/transactions - Add new transaction
router.post('/', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.userId!;
  const {
    amount,
    transactionType = 'expense',
    category,
    title,
    description,
    paymentMethod = 'UPI',
    transactionDate,
    transactionTime,
  } = req.body;

  if (!amount || Number(amount) <= 0 || !title || !category) {
    res.status(400).json({ error: 'Valid amount, title, and category are required.' });
    return;
  }

  const now = new Date();
  const dateStr = transactionDate || now.toISOString().split('T')[0];
  const timeStr = transactionTime || now.toTimeString().split(' ')[0];

  // Prevent duplicate submissions within 10 seconds
  const recentDuplicates = Array.from(db.transactions.values()).filter(
    (tx) =>
      tx.userId === userId &&
      tx.title.toLowerCase() === title.trim().toLowerCase() &&
      Number(tx.amount) === Number(amount) &&
      tx.category === category &&
      tx.transactionDate === dateStr &&
      Math.abs(new Date(tx.createdAt).getTime() - now.getTime()) < 10000
  );

  if (recentDuplicates.length > 0) {
    res.status(409).json({ error: 'Duplicate transaction detected. Please wait a moment before resubmitting.' });
    return;
  }

  const newTx: Transaction = {
    id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    userId,
    amount: Number(amount),
    transactionType,
    category,
    title: title.trim(),
    description: description ? description.trim() : undefined,
    paymentMethod,
    transactionDate: dateStr,
    transactionTime: timeStr,
    createdAt: now.toISOString(),
  };

  db.transactions.set(newTx.id, newTx);

  // Recalculate and return real-time metrics
  const budgetId = `budget-${userId}-${now.getFullYear()}-${now.getMonth() + 1}`;
  const budget = db.budgets.get(budgetId) || {
    id: budgetId,
    userId,
    monthlyIncome: 0,
    fixedExpenses: 0,
    savingsTarget: 0,
    salaryDate: 1,
    rolloverEnabled: true,
    month: now.getMonth() + 1,
    year: now.getFullYear(),
    createdAt: now.toISOString(),
  };

  const allUserTx = Array.from(db.transactions.values()).filter((tx) => tx.userId === userId);
  const calculations = BudgetCalculator.calculate(budget, allUserTx, now);

  res.status(201).json({
    message: 'Transaction recorded successfully',
    transaction: newTx,
    calculations,
  });
});

// PUT /api/transactions/:id - Edit transaction
router.put('/:id', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.userId!;
  const { id } = req.params;
  const existing = db.transactions.get(id);

  if (!existing || existing.userId !== userId) {
    res.status(404).json({ error: 'Transaction not found.' });
    return;
  }

  const { amount, transactionType, category, title, description, paymentMethod, transactionDate } = req.body;

  if (amount !== undefined) existing.amount = Number(amount);
  if (transactionType !== undefined) existing.transactionType = transactionType;
  if (category !== undefined) existing.category = category;
  if (title !== undefined) existing.title = title.trim();
  if (description !== undefined) existing.description = description.trim();
  if (paymentMethod !== undefined) existing.paymentMethod = paymentMethod;
  if (transactionDate !== undefined) existing.transactionDate = transactionDate;

  db.transactions.set(id, existing);

  // Recalculate
  const now = new Date();
  const budgetId = `budget-${userId}-${now.getFullYear()}-${now.getMonth() + 1}`;
  const budget = db.budgets.get(budgetId)!;
  const allUserTx = Array.from(db.transactions.values()).filter((tx) => tx.userId === userId);
  const calculations = BudgetCalculator.calculate(budget, allUserTx, now);

  res.json({
    message: 'Transaction updated successfully',
    transaction: existing,
    calculations,
  });
});

// DELETE /api/transactions/:id - Delete transaction
router.delete('/:id', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.userId!;
  const { id } = req.params;
  const existing = db.transactions.get(id);

  if (!existing || existing.userId !== userId) {
    res.status(404).json({ error: 'Transaction not found.' });
    return;
  }

  db.transactions.delete(id);

  // Recalculate
  const now = new Date();
  const budgetId = `budget-${userId}-${now.getFullYear()}-${now.getMonth() + 1}`;
  const budget = db.budgets.get(budgetId)!;
  const allUserTx = Array.from(db.transactions.values()).filter((tx) => tx.userId === userId);
  const calculations = BudgetCalculator.calculate(budget, allUserTx, now);

  res.json({
    message: 'Transaction deleted successfully',
    deletedId: id,
    calculations,
  });
});

export default router;
