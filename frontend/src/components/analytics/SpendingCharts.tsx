import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  ReferenceLine,
  PieChart,
  Pie,
  AreaChart,
  Area,
} from 'recharts';
import { Transaction, DailyCalculationResult } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { TrendingUp, PieChart as PieIcon, BarChart3, AlertCircle } from 'lucide-react';

interface SpendingChartsProps {
  transactions: Transaction[];
  calculations: DailyCalculationResult;
  currency?: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  Food: '#FB923C',
  Groceries: '#34D399',
  Shopping: '#C084FC',
  Transportation: '#60A5FA',
  Entertainment: '#F472B6',
  Bills: '#FACC15',
  Healthcare: '#F87171',
  Education: '#818CF8',
  Travel: '#22D3EE',
  Salary: '#00FF87',
  Other: '#94A3B8',
};

export const SpendingCharts: React.FC<SpendingChartsProps> = ({
  transactions,
  calculations,
  currency = '₹',
}) => {
  const [activeTab, setActiveTab] = useState<'daily' | 'category' | 'trend'>('daily');

  const expenseTx = transactions.filter((t) => t.transactionType === 'expense');

  // 1. Daily Spending Bar Data (last 14 days)
  const dailyMap: Record<string, number> = {};
  const today = new Date();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    dailyMap[dateStr] = 0;
  }

  expenseTx.forEach((tx) => {
    if (dailyMap[tx.transactionDate] !== undefined) {
      dailyMap[tx.transactionDate] += Number(tx.amount);
    }
  });

  const dailyChartData = Object.entries(dailyMap).map(([date, amount]) => {
    const d = new Date(date);
    const label = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    return {
      date: label,
      rawDate: date,
      amount,
      limit: calculations.safeDailyLimit || calculations.baseDailyLimit,
    };
  });

  // 2. Category Breakdown Donut Data
  const categoryMap: Record<string, number> = {};
  expenseTx.forEach((tx) => {
    categoryMap[tx.category] = (categoryMap[tx.category] || 0) + Number(tx.amount);
  });

  const categoryChartData = Object.entries(categoryMap)
    .map(([name, value]) => ({
      name,
      value,
      color: CATEGORY_COLORS[name] || '#94A3B8',
    }))
    .sort((a, b) => b.value - a.value);

  // 3. Analytics KPI Metrics
  const totalSpend = calculations.totalMonthlySpent;
  const daysPassed = Math.max(1, calculations.currentDay);
  const avgDailySpend = Math.round((totalSpend / daysPassed) * 100) / 100;
  const topCategory = categoryChartData[0] || { name: 'None', value: 0 };
  const utilizationPercent = calculations.availableMonthlyBudget > 0
    ? Math.min(100, Math.round((totalSpend / calculations.availableMonthlyBudget) * 100))
    : 0;

  return (
    <div className="space-y-6">
      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl glass-card border border-surface-border">
          <div className="text-xs text-slate-400 font-medium">Avg. Daily Spend</div>
          <div className="text-lg md:text-xl font-bold text-white mt-1">
            {formatCurrency(avgDailySpend, currency)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Across {daysPassed} day(s)</div>
        </div>

        <div className="p-4 rounded-2xl glass-card border border-surface-border">
          <div className="text-xs text-slate-400 font-medium">Highest Category</div>
          <div className="text-lg md:text-xl font-bold text-primary truncate mt-1">
            {topCategory.name}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {formatCurrency(topCategory.value, currency)} logged
          </div>
        </div>

        <div className="p-4 rounded-2xl glass-card border border-surface-border">
          <div className="text-xs text-slate-400 font-medium">Budget Utilization</div>
          <div
            className={`text-lg md:text-xl font-bold mt-1 ${
              utilizationPercent > 90 ? 'text-red-400' : 'text-slate-100'
            }`}
          >
            {utilizationPercent}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Of discretionary monthly pool
          </div>
        </div>

        <div className="p-4 rounded-2xl glass-card border border-surface-border">
          <div className="text-xs text-slate-400 font-medium">Discretionary Balance</div>
          <div
            className={`text-lg md:text-xl font-bold mt-1 ${
              calculations.remainingMonthlyBalance >= 0 ? 'text-primary' : 'text-red-400'
            }`}
          >
            {formatCurrency(calculations.remainingMonthlyBalance, currency)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Available for remaining days</div>
        </div>
      </div>

      {/* Chart Selector Tabs */}
      <div className="rounded-3xl glass-card border border-surface-border p-5 md:p-7">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-white">Financial Analytics & Trends</h3>
            <p className="text-xs text-slate-400">Detailed visual breakdown of spending behavior</p>
          </div>

          <div className="flex p-1 bg-surface rounded-xl border border-surface-border">
            <button
              onClick={() => setActiveTab('daily')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'daily'
                  ? 'bg-primary text-black font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Daily Spending
            </button>
            <button
              onClick={() => setActiveTab('category')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'category'
                  ? 'bg-primary text-black font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Categories
            </button>
            <button
              onClick={() => setActiveTab('trend')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'trend'
                  ? 'bg-primary text-black font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Spending Curve
            </button>
          </div>
        </div>

        {/* Tab 1: Daily Bar Chart */}
        {activeTab === 'daily' && (
          <div>
            <div className="flex items-center gap-4 text-xs text-slate-400 mb-3 justify-end">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-primary" /> Within Safe Limit
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-red-400" /> Over Daily Limit
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 border-t border-dashed border-primary" /> Daily Target
              </span>
            </div>

            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0E1628',
                      borderColor: '#1E2F52',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                    formatter={(val: number) => [`${currency}${val.toLocaleString()}`, 'Amount Spent']}
                  />
                  <ReferenceLine
                    y={calculations.safeDailyLimit || calculations.baseDailyLimit}
                    stroke="#00FF87"
                    strokeDasharray="4 4"
                    label={{
                      value: 'Target',
                      fill: '#00FF87',
                      fontSize: 10,
                      position: 'top',
                    }}
                  />
                  <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                    {dailyChartData.map((entry, index) => {
                      const isOver = entry.amount > (calculations.safeDailyLimit || calculations.baseDailyLimit);
                      return <Cell key={`cell-${index}`} fill={isOver ? '#EF4444' : '#00FF87'} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Tab 2: Category Donut Chart */}
        {activeTab === 'category' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={3}
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`slice-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0E1628',
                      borderColor: '#1E2F52',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                    formatter={(val: number) => [`${currency}${val.toLocaleString()}`, 'Total Spent']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Category Legend list */}
            <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
              {categoryChartData.map((cat) => {
                const pct = totalSpend > 0 ? Math.round((cat.value / totalSpend) * 100) : 0;
                return (
                  <div
                    key={cat.name}
                    className="flex items-center justify-between p-2 rounded-xl bg-surface/50 border border-surface-border text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span className="font-medium text-slate-200">{cat.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400 font-mono">{pct}%</span>
                      <span className="font-bold text-white font-mono">
                        {formatCurrency(cat.value, currency)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: Cumulative Spending Trend */}
        {activeTab === 'trend' && (
          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#00FF87" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#00FF87" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0E1628',
                    borderColor: '#1E2F52',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  formatter={(val: number) => [`${currency}${val.toLocaleString()}`, 'Daily Spent']}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#00FF87"
                  strokeWidth={2}
                  fill="url(#areaGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};
