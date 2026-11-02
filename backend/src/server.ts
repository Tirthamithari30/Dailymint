import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import budgetRoutes from './routes/budget.js';
import transactionRoutes from './routes/transactions.js';
import goalRoutes from './routes/goals.js';
import aiRoutes from './routes/ai.js';
import notificationRoutes from './routes/notifications.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend Vite development server & production
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);

app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'DailyMint API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  console.log(`🚀 DailyMint API Server running on port ${PORT}`);
  console.log(`📡 Health endpoint: http://localhost:${PORT}/api/health`);
});
