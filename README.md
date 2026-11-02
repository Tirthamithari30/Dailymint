# DailyMint — Premium AI-Powered Personal Finance & Daily Budget Tracker

> **"Know your daily limit. Control your spending. Save more money."**

DailyMint is a high-end fintech personal finance application inspired by modern financial technology products (dark obsidian aesthetic, neon green `#00FF87` accents, glowing circular progress gauges, and real-time spending limits). DailyMint divides monthly income into dynamic safe daily limits and adapts in real time to every transaction.

---

## 🚀 Key Features

1. **Smart Daily Budget Engine**:
   - **Base Daily Target**: Monthly discretionary pool divided evenly across the month.
   - **Adjusted Safe Daily Limit**: Dynamically recalculates remaining safe allowance based on actual past spending and remaining days in the month.
   - **Budget Rollover Support**: Optional toggle to roll over unspent money to boost future daily allowances.
   - **Precise Calendar Calculation**: Fully accounts for month lengths (28, 29, 30, 31 days) including leap years.

2. **Glowing Circular Progress Centerpiece**:
   - SVG neon gauge with dynamic multi-tier status:
     - **Safe (Neon Green)**: Within normal safe daily allowance.
     - **Caution (Amber)**: 75%+ of daily budget consumed.
     - **Limit Exceeded (Crimson Red)**: Instant visual pulse and overspending alert.

3. **Transaction Management**:
   - Instant addition with quick amount chips (+₹100, +₹500, +₹1,000, etc.).
   - 10 financial categories with custom icons and color-coded tags.
   - Multiple payment methods: UPI, Credit Card, Debit Card, Cash, Net Banking.
   - Duplicate submission protection (prevents double-tap errors).
   - Real-time audit history with daily, weekly, and monthly filtering + instant search.

4. **Interactive Financial Analytics**:
   - Recharts visual suite:
     - Daily Spending Bar Chart with safe target reference line.
     - Category Breakdown Donut Chart with percentages.
     - Spending Curve Area Chart.
   - Key telemetry: Average Daily Spend, Highest Category, Discretionary Pool Utilization %.
   - 1-Click CSV transaction export.

5. **Savings Goals Tracker**:
   - Target amount vs current saved balance.
   - Automatic calculation of daily and monthly velocity required to reach the goal by target date.
   - Deposit and withdrawal support with celebratory confetti triggers.

6. **AI Financial Assistant**:
   - Real-data synthesis: Analyzes actual recorded transactions and ledger balances.
   - Pre-baked quick prompts for instant answers:
     - *"How much did I spend today?"*
     - *"Where is most of my money going?"*
     - *"How much can I spend tomorrow?"*
     - *"Can I afford a ₹1,500 purchase tonight?"*
   - Backend proxy with support for Google Gemini API or intelligent deterministic local financial heuristics.

7. **Smart Notification System**:
   - Contextual morning budget briefing.
   - Post-spending remaining balance updates.
   - Immediate overspending alerts.
   - Night spending wrap-up summary.
   - Web Push Notification support via Service Worker.

8. **Progressive Web App (PWA)**:
   - Web App Manifest (`manifest.json`) and Service Worker (`sw.js`).
   - Mobile-first responsive layout with native bottom navigation and floating quick-add button.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React, Recharts, Canvas Confetti
- **Backend**: Node.js, Express, TypeScript, Zod, JWT, bcryptjs
- **Database & Auth**: Supabase PostgreSQL with Row Level Security (RLS) + instant in-memory fallback for offline/demo evaluation
- **AI**: Gemini API proxy / Intelligent Financial Intelligence Engine

---

## ⚡ Quick Start

### 1. Prerequisites
- Node.js v18+ (tested on v22)
- npm v10+

### 2. Start Backend API Server
```bash
cd backend
npm install
npm run dev
```
The backend API starts on **http://localhost:5000**.

### 3. Start Frontend App
```bash
cd frontend
npm install
npm run dev
```
The frontend starts on **http://localhost:3000** (with automated proxy to `/api` on port 5000).

### 4. 1-Click Demo Evaluation
On the landing page or login page, click **"Explore Demo Account"** to immediately test the app with realistic preloaded data (Salary: ₹1,00,000, daily limit, transactions, savings goals, and AI assistant).

---

## 🗄️ Supabase PostgreSQL Setup (Optional for Cloud DB)

To connect DailyMint to your live Supabase cloud database:
1. Create a Supabase project at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** in the Supabase Dashboard and run the contents of [`supabase/schema.sql`](file:///d:/Dailymint/supabase/schema.sql).
3. Copy your project URL and service role key into `backend/.env`:
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```
4. Restart the backend server.
