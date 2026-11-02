-- ==============================================================================
-- DailyMint: Premium AI-Powered Personal Finance & Daily Budget Tracker Schema
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table (Augments Supabase Auth)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    currency TEXT DEFAULT '₹',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Monthly Budgets Table
CREATE TABLE IF NOT EXISTS public.monthly_budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    monthly_income NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (monthly_income >= 0),
    fixed_expenses NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (fixed_expenses >= 0),
    savings_target NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (savings_target >= 0),
    salary_date INT NOT NULL DEFAULT 1 CHECK (salary_date BETWEEN 1 AND 31),
    rollover_enabled BOOLEAN NOT NULL DEFAULT true,
    month INT NOT NULL CHECK (month BETWEEN 1 AND 12),
    year INT NOT NULL CHECK (year >= 2020),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, month, year)
);

-- 3. Transactions Table
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('expense', 'income')),
    category TEXT NOT NULL CHECK (category IN (
        'Food', 'Groceries', 'Shopping', 'Transportation', 
        'Entertainment', 'Bills', 'Healthcare', 'Education', 
        'Travel', 'Salary', 'Investment', 'Other'
    )),
    title TEXT NOT NULL,
    description TEXT,
    payment_method TEXT NOT NULL DEFAULT 'UPI' CHECK (payment_method IN (
        'UPI', 'Credit Card', 'Debit Card', 'Cash', 'Net Banking', 'Other'
    )),
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    transaction_time TIME NOT NULL DEFAULT CURRENT_TIME,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Savings Goals Table
CREATE TABLE IF NOT EXISTS public.savings_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    goal_name TEXT NOT NULL,
    target_amount NUMERIC(12, 2) NOT NULL CHECK (target_amount > 0),
    current_amount NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (current_amount >= 0),
    target_date DATE NOT NULL,
    icon TEXT DEFAULT 'target',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Notification Settings Table
CREATE TABLE IF NOT EXISTS public.notification_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    morning_reminder BOOLEAN NOT NULL DEFAULT true,
    evening_reminder BOOLEAN NOT NULL DEFAULT true,
    budget_alerts BOOLEAN NOT NULL DEFAULT true,
    reminder_time_morning TIME NOT NULL DEFAULT '08:30:00',
    reminder_time_evening TIME NOT NULL DEFAULT '21:30:00',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for lightning fast queries
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON public.transactions(user_id, transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_budgets_user_period ON public.monthly_budgets(user_id, year, month);
CREATE INDEX IF NOT EXISTS idx_goals_user ON public.savings_goals(user_id);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies (Allow access if auth.uid() matches user_id or id)
CREATE POLICY "Users can manage their own profile" 
    ON public.users FOR ALL 
    USING (auth.uid() = id);

CREATE POLICY "Users can manage their own budgets" 
    ON public.monthly_budgets FOR ALL 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own transactions" 
    ON public.transactions FOR ALL 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own savings goals" 
    ON public.savings_goals FOR ALL 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their notification settings" 
    ON public.notification_settings FOR ALL 
    USING (auth.uid() = user_id);
