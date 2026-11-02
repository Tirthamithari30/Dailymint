import { Router, Response } from 'express';
import { db } from '../config/database.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { BudgetCalculator } from '../services/budgetCalculator.js';
import { MonthlyBudget } from '../types/index.js';

const router = Router();

// GET /api/budget/current - Current budget & real-time daily metrics
router.get('/current', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.userId!;
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const budgetId = `budget-${userId}-${year}-${month}`;
  let budget = db.budgets.get(budgetId);

  // If no budget exists for this month, check previous month or create starter
  if (!budget) {
    const userBudgets = Array.from(db.budgets.values())
      .filter((b) => b.userId === userId)
      .sort((a, b) => b.year - a.year || b.month - a.month);

    const prevBudget = userBudgets[0];
    budget = {
      id: budgetId,
      userId,
      monthlyIncome: prevBudget ? prevBudget.monthlyIncome : 0,
      fixedExpenses: prevBudget ? prevBudget.fixedExpenses : 0,
      savingsTarget: prevBudget ? prevBudget.savingsTarget : 0,
      salaryDate: prevBudget ? prevBudget.salaryDate : 1,
      rolloverEnabled: prevBudget ? prevBudget.rolloverEnabled : true,
      month,
      year,
      createdAt: new Date().toISOString(),
    };
    db.budgets.set(budgetId, budget);
  }

  // Get user transactions
  const userTransactions = Array.from(db.transactions.values()).filter(
    (tx) => tx.userId === userId
  );

  // Run dynamic calculation
  const calculations = BudgetCalculator.calculate(budget, userTransactions, now);

  res.json({
    budget,
    calculations,
  });
});

// POST /api/budget - Setup or update monthly budget
router.post('/', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.userId!;
  const { monthlyIncome, fixedExpenses = 0, savingsTarget = 0, salaryDate = 1, rolloverEnabled = true } = req.body;

  if (monthlyIncome === undefined || Number(monthlyIncome) < 0) {
    res.status(400).json({ error: 'Valid monthly income is required.' });
    return;
  }

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const budgetId = `budget-${userId}-${year}-${month}`;

  const budget: MonthlyBudget = {
    id: budgetId,
    userId,
    monthlyIncome: Number(monthlyIncome),
    fixedExpenses: Number(fixedExpenses),
    savingsTarget: Number(savingsTarget),
    salaryDate: Number(salaryDate),
    rolloverEnabled: Boolean(rolloverEnabled),
    month,
    year,
    createdAt: new Date().toISOString(),
  };

  db.budgets.set(budgetId, budget);

  // Re-calculate
  const userTransactions = Array.from(db.transactions.values()).filter(
    (tx) => tx.userId === userId
  );
  const calculations = BudgetCalculator.calculate(budget, userTransactions, now);

  res.json({
    message: 'Monthly budget configured successfully',
    budget,
    calculations,
  });
});

// PUT /api/budget/rollover - Toggle rollover
router.put('/rollover', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.userId!;
  const { rolloverEnabled } = req.body;

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const budgetId = `budget-${userId}-${year}-${month}`;

  const budget = db.budgets.get(budgetId);
  if (!budget) {
    res.status(404).json({ error: 'Monthly budget not found' });
    return;
  }

  budget.rolloverEnabled = Boolean(rolloverEnabled);
  db.budgets.set(budgetId, budget);

  const userTransactions = Array.from(db.transactions.values()).filter(
    (tx) => tx.userId === userId
  );
  const calculations = BudgetCalculator.calculate(budget, userTransactions, now);

  res.json({
    message: `Budget rollover ${budget.rolloverEnabled ? 'enabled' : 'disabled'}`,
    budget,
    calculations,
  });
});

export default router;
