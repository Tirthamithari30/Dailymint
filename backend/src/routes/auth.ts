import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db, supabase } from '../config/database.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/authMiddleware.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dailymint_super_secret_jwt_key_2026';

// 1. Sign Up
router.post('/signup', async (req, res): Promise<void> => {
  try {
    const { email, password, name, currency = '₹' } = req.body;

    if (!email || !password || !name) {
      res.status(400).json({ error: 'Name, email, and password are required.' });
      return;
    }

    // Check if user already exists
    let existingUser = Array.from(db.users.values()).find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      res.status(400).json({ error: 'An account with this email already exists.' });
      return;
    }

    const userId = `user-${Date.now()}`;
    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = {
      id: userId,
      email: email.toLowerCase(),
      name,
      currency,
      passwordHash,
      createdAt: new Date().toISOString(),
    };

    db.users.set(userId, newUser);

    // Create default starter budget
    const now = new Date();
    const budgetId = `budget-${userId}-${now.getFullYear()}-${now.getMonth() + 1}`;
    db.budgets.set(budgetId, {
      id: budgetId,
      userId,
      monthlyIncome: 0,
      fixedExpenses: 0,
      savingsTarget: 0,
      salaryDate: 1,
      rolloverEnabled: true,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      createdAt: new Date().toISOString(),
    });

    // Default notification settings
    db.notificationSettings.set(userId, {
      id: `notify-${userId}`,
      userId,
      morningReminder: true,
      eveningReminder: true,
      budgetAlerts: true,
      reminderTimeMorning: '08:30:00',
      reminderTimeEvening: '21:30:00',
      createdAt: new Date().toISOString(),
    });

    const token = jwt.sign({ userId, email: newUser.email }, JWT_SECRET, { expiresIn: '30d' });

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        currency: newUser.currency,
        needsOnboarding: true,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to sign up' });
  }
});

// 2. Login
router.post('/login', async (req, res): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const user = Array.from(db.users.values()).find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    if (user.passwordHash) {
      const match = await bcrypt.compare(password, user.passwordHash);
      if (!match) {
        res.status(401).json({ error: 'Invalid email or password.' });
        return;
      }
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });
    
    // Check if budget is set
    const now = new Date();
    const budgetId = `budget-${user.id}-${now.getFullYear()}-${now.getMonth() + 1}`;
    const budget = db.budgets.get(budgetId);
    const needsOnboarding = !budget || budget.monthlyIncome === 0;

    res.json({
      message: 'Logged in successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        currency: user.currency,
        needsOnboarding,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to login' });
  }
});

// 3. 1-Click Demo Login
router.post('/demo', (_req, res): void => {
  const demoUser = db.users.get('demo-user-12345');
  if (!demoUser) {
    db.seedDemoData();
  }
  const token = 'demo-token';
  res.json({
    message: 'Demo session initialized',
    token,
    user: {
      id: 'demo-user-12345',
      email: 'demo@dailymint.app',
      name: 'Alex Vance',
      currency: '₹',
      needsOnboarding: false,
    },
  });
});

// 4. Get Current Profile
router.get('/me', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  const user = db.users.get(req.userId!) || req.user;
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      currency: user.currency || '₹',
    },
  });
});

// 5. Update Profile / Currency
router.put('/profile', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  const user = db.users.get(req.userId!);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  const { name, currency } = req.body;
  if (name) user.name = name;
  if (currency) user.currency = currency;

  db.users.set(req.userId!, user);
  res.json({
    message: 'Profile updated successfully',
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      currency: user.currency,
    },
  });
});

export default router;
