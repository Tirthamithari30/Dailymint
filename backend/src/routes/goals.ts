import { Router, Response } from 'express';
import { db } from '../config/database.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { SavingsGoal } from '../types/index.js';

const router = Router();

// GET /api/goals - List all goals with progress and daily breakdown
router.get('/', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.userId!;
  const now = new Date();

  const goals = Array.from(db.goals.values())
    .filter((g) => g.userId === userId)
    .map((g) => {
      const targetDate = new Date(g.targetDate);
      const diffMs = targetDate.getTime() - now.getTime();
      const daysRemaining = Math.max(1, Math.ceil(diffMs / 86400000));
      const monthsRemaining = Math.max(0.5, daysRemaining / 30);
      const amountRemaining = Math.max(0, g.targetAmount - g.currentAmount);
      
      const dailyNeeded = Math.round((amountRemaining / daysRemaining) * 100) / 100;
      const monthlyNeeded = Math.round((amountRemaining / monthsRemaining) * 100) / 100;
      const progressPercent = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));

      return {
        ...g,
        daysRemaining,
        amountRemaining,
        dailyNeeded,
        monthlyNeeded,
        progressPercent,
        isCompleted: g.currentAmount >= g.targetAmount,
      };
    });

  res.json({ goals });
});

// POST /api/goals - Create new savings goal
router.post('/', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.userId!;
  const { goalName, targetAmount, currentAmount = 0, targetDate, icon = 'target' } = req.body;

  if (!goalName || !targetAmount || Number(targetAmount) <= 0 || !targetDate) {
    res.status(400).json({ error: 'Goal name, valid target amount, and target date are required.' });
    return;
  }

  const newGoal: SavingsGoal = {
    id: `goal-${Date.now()}`,
    userId,
    goalName: goalName.trim(),
    targetAmount: Number(targetAmount),
    currentAmount: Number(currentAmount),
    targetDate,
    icon,
    createdAt: new Date().toISOString(),
  };

  db.goals.set(newGoal.id, newGoal);
  res.status(201).json({ message: 'Savings goal created', goal: newGoal });
});

// PUT /api/goals/:id - Edit or update saved amount (deposit/withdraw)
router.put('/:id', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.userId!;
  const { id } = req.params;
  const goal = db.goals.get(id);

  if (!goal || goal.userId !== userId) {
    res.status(404).json({ error: 'Savings goal not found' });
    return;
  }

  const { goalName, targetAmount, currentAmount, targetDate, icon, depositAmount } = req.body;

  if (goalName !== undefined) goal.goalName = goalName.trim();
  if (targetAmount !== undefined) goal.targetAmount = Number(targetAmount);
  if (currentAmount !== undefined) goal.currentAmount = Number(currentAmount);
  if (targetDate !== undefined) goal.targetDate = targetDate;
  if (icon !== undefined) goal.icon = icon;

  if (depositAmount !== undefined) {
    goal.currentAmount = Math.max(0, goal.currentAmount + Number(depositAmount));
  }

  db.goals.set(id, goal);
  res.json({ message: 'Goal updated successfully', goal });
});

// DELETE /api/goals/:id - Delete goal
router.delete('/:id', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.userId!;
  const { id } = req.params;
  const goal = db.goals.get(id);

  if (!goal || goal.userId !== userId) {
    res.status(404).json({ error: 'Savings goal not found' });
    return;
  }

  db.goals.delete(id);
  res.json({ message: 'Goal deleted successfully', deletedId: id });
});

export default router;
