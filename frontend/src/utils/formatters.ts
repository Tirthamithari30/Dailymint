import { Category } from '../types';

export const formatCurrency = (amount: number, currency: string = '₹'): string => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return `${currency}0`;
  }

  const isNegative = amount < 0;
  const absVal = Math.abs(amount);

  let formattedNum: string;
  if (currency === '₹') {
    // Indian Lakh/Crore notation
    formattedNum = absVal.toLocaleString('en-IN', {
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    });
  } else {
    formattedNum = absVal.toLocaleString('en-US', {
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    });
  }

  return `${isNegative ? '-' : ''}${currency}${formattedNum}`;
};

export const formatCurrencyDetailed = (amount: number, currency: string = '₹'): string => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return `${currency}0.00`;
  }
  const isNegative = amount < 0;
  const absVal = Math.abs(amount);

  const formattedNum = absVal.toLocaleString(currency === '₹' ? 'en-IN' : 'en-US', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });

  return `${isNegative ? '-' : ''}${currency}${formattedNum}`;
};

export const getCategoryColor = (category: string) => {
  switch (category) {
    case 'Food':
      return { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20' };
    case 'Groceries':
      return { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' };
    case 'Shopping':
      return { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' };
    case 'Transportation':
      return { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' };
    case 'Entertainment':
      return { bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-500/20' };
    case 'Bills':
      return { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20' };
    case 'Healthcare':
      return { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' };
    case 'Education':
      return { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/20' };
    case 'Travel':
      return { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20' };
    case 'Salary':
    case 'Investment':
      return { bg: 'bg-green-500/10', text: 'text-neon-green', border: 'border-primary/20' };
    default:
      return { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20' };
  }
};
