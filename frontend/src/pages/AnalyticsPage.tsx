import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { SpendingCharts } from '../components/analytics/SpendingCharts';
import { Button } from '../components/common/Button';
import { formatCurrency } from '../utils/formatters';
import { Download, Sparkles, TrendingUp } from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const { user } = useAuth();
  const { transactions, calculations } = useFinance();
  const currency = user?.currency || '₹';

  const exportCSV = () => {
    if (transactions.length === 0) {
      alert('No transactions to export.');
      return;
    }

    const headers = ['ID', 'Date', 'Time', 'Title', 'Type', 'Category', 'Amount', 'PaymentMethod', 'Description'];
    const rows = transactions.map((t) => [
      t.id,
      t.transactionDate,
      t.transactionTime || '',
      `"${t.title.replace(/"/g, '""')}"`,
      t.transactionType,
      t.category,
      t.amount,
      t.paymentMethod,
      `"${(t.description || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `DailyMint_Transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!calculations) {
    return (
      <div className="flex justify-center items-center py-20 text-xs text-slate-400">
        Loading analytics...
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Analytics & Intelligence</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Deep dive into spending velocity, category distributions, and safe runway
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-card border border-surface-border text-slate-200 hover:border-slate-600 hover:text-white font-semibold text-xs self-start sm:self-auto transition-all"
        >
          <Download size={15} />
          <span>Export CSV Report</span>
        </button>
      </div>

      {/* Main Charts Suite */}
      <SpendingCharts
        transactions={transactions}
        calculations={calculations}
        currency={currency}
      />
    </div>
  );
};
