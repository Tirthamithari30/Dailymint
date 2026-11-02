import { MonthlyBudget, Transaction, DailyCalculationResult } from '../types/index.js';

export class BudgetCalculator {
  /**
   * Returns the exact number of days in a month (accounting for leap years)
   */
  public static getDaysInMonth(year: number, month: number): number {
    return new Date(year, month, 0).getDate();
  }

  /**
   * Computes the complete real-time budget telemetry
   */
  public static calculate(
    budget: MonthlyBudget,
    transactions: Transaction[],
    targetDate: Date = new Date()
  ): DailyCalculationResult {
    const year = targetDate.getFullYear();
    const month = targetDate.getMonth() + 1; // 1-indexed
    const currentDay = targetDate.getDate();
    const daysInMonth = this.getDaysInMonth(year, month);
    const todayStr = targetDate.toISOString().split('T')[0];

    const monthlyIncome = Number(budget.monthlyIncome) || 0;
    const fixedExpenses = Number(budget.fixedExpenses) || 0;
    const savingsTarget = Number(budget.savingsTarget) || 0;
    const rolloverEnabled = budget.rolloverEnabled !== false;

    // Available monthly discretionary pool
    const availableMonthlyBudget = Math.max(0, monthlyIncome - fixedExpenses - savingsTarget);

    // Filter transactions for this month and year
    const monthlyTransactions = transactions.filter((tx) => {
      const txDate = new Date(tx.transactionDate);
      return (
        txDate.getFullYear() === year &&
        txDate.getMonth() + 1 === month
      );
    });

    // Expenses this month
    const totalMonthlySpent = monthlyTransactions
      .filter((tx) => tx.transactionType === 'expense')
      .reduce((sum, tx) => sum + Number(tx.amount), 0);

    // Expenses today
    const spentToday = monthlyTransactions
      .filter(
        (tx) => tx.transactionType === 'expense' && tx.transactionDate === todayStr
      )
      .reduce((sum, tx) => sum + Number(tx.amount), 0);

    // Base daily limit (divided evenly across all month days)
    const baseDailyLimit = Math.round((availableMonthlyBudget / (daysInMonth || 30)) * 100) / 100;

    // Remaining days in month including today
    const remainingDaysInMonth = Math.max(1, daysInMonth - currentDay + 1);

    // Expenses incurred prior to today in current month
    const expensesPriorToToday = Math.max(0, totalMonthlySpent - spentToday);

    // Remaining monthly budget available starting this morning
    const remainingBudgetForRemainingDays = Math.max(0, availableMonthlyBudget - expensesPriorToToday);

    // Smart adjusted safe daily limit
    let safeDailyLimit: number;
    if (rolloverEnabled) {
      safeDailyLimit = Math.round((remainingBudgetForRemainingDays / remainingDaysInMonth) * 100) / 100;
    } else {
      safeDailyLimit = baseDailyLimit;
    }

    // Remaining budget for today
    const remainingToday = Math.round((safeDailyLimit - spentToday) * 100) / 100;
    const isOverspentToday = remainingToday < 0;

    // Monthly remaining discretionary balance
    const remainingMonthlyBalance = Math.round((availableMonthlyBudget - totalMonthlySpent) * 100) / 100;

    // Savings progress percent
    const netCurrentSavings = Math.max(0, monthlyIncome - fixedExpenses - totalMonthlySpent);
    const savingsProgressPercent = savingsTarget > 0 
      ? Math.min(100, Math.round((netCurrentSavings / savingsTarget) * 100))
      : 100;

    return {
      monthlyIncome,
      fixedExpenses,
      savingsTarget,
      availableMonthlyBudget,
      daysInMonth,
      currentDay,
      remainingDaysInMonth,
      baseDailyLimit,
      safeDailyLimit,
      spentToday: Math.round(spentToday * 100) / 100,
      remainingToday,
      totalMonthlySpent: Math.round(totalMonthlySpent * 100) / 100,
      remainingMonthlyBalance,
      isOverspentToday,
      rolloverEnabled,
      savingsProgressPercent,
    };
  }
}
