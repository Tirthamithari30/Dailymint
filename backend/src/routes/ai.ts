import { Router, Response } from 'express';
import { db } from '../config/database.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { BudgetCalculator } from '../services/budgetCalculator.js';
import { AIService } from '../services/aiService.js';

const router = Router();

// Helper to assemble full user financial context
const getUserFinancialContext = (userId: string) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const user = db.users.get(userId) || { currency: '₹' };
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
  const goals = Array.from(db.goals.values()).filter((g) => g.userId === userId);

  return {
    currency: user.currency || '₹',
    budget,
    calculations,
    recentTransactions: userTransactions,
    goals,
  };
};

// POST /api/ai/chat - Chat with AI Financial Assistant
router.post('/chat', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      res.status(400).json({ error: 'Valid prompt string is required.' });
      return;
    }

    const context = getUserFinancialContext(userId);
    const reply = await AIService.answerQuestion(prompt, context);

    res.json({
      prompt,
      reply,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'AI assistant error' });
  }
});

// GET /api/ai/insights - Proactive financial insights
router.get('/insights', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.userId!;
  const context = getUserFinancialContext(userId);
  const insights = AIService.generateInsights(context);

  res.json({ insights });
});

export default router;
