import { DailyCalculationResult, Transaction, MonthlyBudget, SavingsGoal } from '../types/index.js';

interface AIContext {
  currency: string;
  calculations: DailyCalculationResult;
  budget: MonthlyBudget;
  recentTransactions: Transaction[];
  goals: SavingsGoal[];
}

export interface AIInsight {
  id: string;
  type: 'success' | 'warning' | 'info' | 'tip';
  title: string;
  message: string;
  impactAmount?: number;
}

export class AIService {
  /**
   * Generates proactive financial intelligence insights based on real data
   */
  public static generateInsights(context: AIContext): AIInsight[] {
    const insights: AIInsight[] = [];
    const { calculations, recentTransactions, currency, goals } = context;

    // 1. Category Breakdown Analysis
    const categoryTotals: Record<string, number> = {};
    const expenseTx = recentTransactions.filter((tx) => tx.transactionType === 'expense');
    
    expenseTx.forEach((tx) => {
      categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + Number(tx.amount);
    });

    const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
    const topCategory = sortedCategories[0];

    if (topCategory && topCategory[1] > 0) {
      const percentOfTotal = Math.round((topCategory[1] / (calculations.totalMonthlySpent || 1)) * 100);
      insights.push({
        id: 'insight-top-category',
        type: percentOfTotal > 35 ? 'warning' : 'info',
        title: `Highest Spending: ${topCategory[0]}`,
        message: `You have spent ${currency}${topCategory[1].toLocaleString()} (${percentOfTotal}% of total spend) on ${topCategory[0]} this month. Consider capping this category.`,
        impactAmount: topCategory[1],
      });
    }

    // 2. Daily Budget Health
    if (calculations.isOverspentToday) {
      const overspentAmount = Math.abs(calculations.remainingToday);
      insights.push({
        id: 'insight-overspent-today',
        type: 'warning',
        title: 'Daily Budget Exceeded',
        message: `You are ${currency}${overspentAmount.toLocaleString()} over today's safe spending target. Your safe daily allowance for future days has been automatically adjusted down to ${currency}${calculations.safeDailyLimit.toLocaleString()}.`,
        impactAmount: overspentAmount,
      });
    } else {
      insights.push({
        id: 'insight-healthy-budget',
        type: 'success',
        title: 'On Track Today',
        message: `You have ${currency}${calculations.remainingToday.toLocaleString()} safe spending buffer remaining today. Keep it up!`,
      });
    }

    // 3. Savings Opportunities (Dining & Coffee Micro-transactions)
    const foodAndCoffee = expenseTx
      .filter((tx) => tx.category === 'Food' || tx.category === 'Entertainment')
      .reduce((sum, tx) => sum + Number(tx.amount), 0);

    if (foodAndCoffee > 2000) {
      const potentialMonthlySavings = Math.round(foodAndCoffee * 0.25);
      insights.push({
        id: 'insight-dining-savings',
        type: 'tip',
        title: 'Dining & Entertainment Optimization',
        message: `You spent ${currency}${foodAndCoffee.toLocaleString()} on dining & entertainment. Trimming 20-25% could save you ~${currency}${potentialMonthlySavings.toLocaleString()} this month.`,
        impactAmount: potentialMonthlySavings,
      });
    }

    // 4. Savings Goal Milestone
    if (goals.length > 0) {
      const topGoal = goals[0];
      const needed = Math.max(0, topGoal.targetAmount - topGoal.currentAmount);
      const daysLeft = Math.max(1, Math.ceil((new Date(topGoal.targetDate).getTime() - new Date().getTime()) / 86400000));
      const dailyNeeded = Math.round((needed / daysLeft) * 100) / 100;
      
      insights.push({
        id: 'insight-goal-progress',
        type: 'info',
        title: `Goal: ${topGoal.goalName}`,
        message: `To achieve "${topGoal.goalName}" by ${topGoal.targetDate}, save ${currency}${dailyNeeded.toLocaleString()}/day (${currency}${Math.round(dailyNeeded * 30).toLocaleString()}/month).`,
      });
    }

    return insights;
  }

  /**
   * Deterministic local financial assistant response generator
   */
  private static generateLocalResponse(prompt: string, context: AIContext): string {
    const q = prompt.toLowerCase();
    const { currency, calculations, recentTransactions, goals } = context;

    // "How much did I spend today?"
    if (q.includes('spend today') || q.includes('spent today') || q.includes('today\'s spending') || q.includes('todays spend')) {
      const todayTx = recentTransactions.filter(
        (tx) => tx.transactionType === 'expense' && tx.transactionDate === new Date().toISOString().split('T')[0]
      );
      if (todayTx.length === 0) {
        return `You haven't recorded any expenses today! Your remaining safe spending limit for today is **${currency}${calculations.remainingToday.toLocaleString()}**.`;
      }
      const txBreakdown = todayTx.map((t) => `• ${t.title}: ${currency}${t.amount.toLocaleString()} (${t.category})`).join('\n');
      return `Today you have spent a total of **${currency}${calculations.spentToday.toLocaleString()}** across ${todayTx.length} transaction(s):\n\n${txBreakdown}\n\nYour remaining safe allowance for today is **${currency}${calculations.remainingToday.toLocaleString()}**.`;
    }

    // "Where is most of my money going?" / categories
    if (q.includes('where') || q.includes('money going') || q.includes('highest spending') || q.includes('category') || q.includes('categories')) {
      const categoryTotals: Record<string, number> = {};
      const expenseTx = recentTransactions.filter((tx) => tx.transactionType === 'expense');
      expenseTx.forEach((tx) => {
        categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + Number(tx.amount);
      });
      const sorted = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
      if (sorted.length === 0) {
        return `You don't have any recorded expenses yet this month.`;
      }
      const lines = sorted.slice(0, 4).map(([cat, amt]) => {
        const pct = Math.round((amt / (calculations.totalMonthlySpent || 1)) * 100);
        return `• **${cat}**: ${currency}${amt.toLocaleString()} (${pct}%)`;
      });
      return `Here is where your money is going this month (Total spent: **${currency}${calculations.totalMonthlySpent.toLocaleString()}**):\n\n${lines.join('\n')}\n\nYour largest expense category is **${sorted[0][0]}**. Reducing purchases here will give you the fastest boost to your daily limit!`;
    }

    // "How much can I spend tomorrow?" or safe limit
    if (q.includes('tomorrow') || q.includes('safe limit') || q.includes('can i spend')) {
      const safeTomorrow = calculations.safeDailyLimit;
      return `Your adjusted safe daily budget is **${currency}${safeTomorrow.toLocaleString()}**.\n\n` +
        `• Base daily target: **${currency}${calculations.baseDailyLimit.toLocaleString()}**\n` +
        `• Current safe daily limit: **${currency}${calculations.safeDailyLimit.toLocaleString()}**\n` +
        `• Remaining days in month: **${calculations.remainingDaysInMonth} days**\n\n` +
        `If you spend within **${currency}${safeTomorrow.toLocaleString()}** tomorrow, you will remain on track for your monthly savings goal of ${currency}${calculations.savingsTarget.toLocaleString()}.`;
    }

    // "How much did I save this month?"
    if (q.includes('saved') || q.includes('savings') || q.includes('save this month')) {
      const netSavings = Math.max(0, calculations.monthlyIncome - calculations.fixedExpenses - calculations.totalMonthlySpent);
      return `This month, based on your income of **${currency}${calculations.monthlyIncome.toLocaleString()}**, fixed expenses of **${currency}${calculations.fixedExpenses.toLocaleString()}**, and variable spend of **${currency}${calculations.totalMonthlySpent.toLocaleString()}**:\n\n` +
        `• Net Projected Savings: **${currency}${netSavings.toLocaleString()}**\n` +
        `• Target Savings Goal: **${currency}${calculations.savingsTarget.toLocaleString()}**\n` +
        `• Progress: **${calculations.savingsProgressPercent}% achieved**`;
    }

    // "Can I afford X?"
    const amountMatch = q.match(/(\d[\d,]*)/);
    if ((q.includes('afford') || q.includes('buy') || q.includes('dinner') || q.includes('purchase')) && amountMatch) {
      const requestedAmt = parseFloat(amountMatch[1].replace(/,/g, ''));
      if (requestedAmt <= calculations.remainingToday) {
        const after = calculations.remainingToday - requestedAmt;
        return `**Yes, you can comfortably afford this!**\n\nYour remaining daily budget today is **${currency}${calculations.remainingToday.toLocaleString()}**. After spending **${currency}${requestedAmt.toLocaleString()}**, you will still have **${currency}${after.toLocaleString()}** left today.`;
      } else {
        const deficit = requestedAmt - calculations.remainingToday;
        return `**Warning**: Spending **${currency}${requestedAmt.toLocaleString()}** exceeds your remaining daily limit of **${currency}${calculations.remainingToday.toLocaleString()}** by **${currency}${deficit.toLocaleString()}**.\n\n` +
          `If you make this purchase, your safe daily limit for the remaining ${calculations.remainingDaysInMonth} days will drop slightly to balance the month. If it's not urgent, consider delaying it!`;
      }
    }

    // "How can I reduce my expenses?" or general savings tips
    if (q.includes('reduce') || q.includes('cut') || q.includes('tips') || q.includes('advice')) {
      return `Here are 3 tailored recommendations based on your current spending:\n\n` +
        `1. **Cap Food & Quick Commerce**: You have logged dining and grocery orders. Setting a ₹500 cap on quick-commerce deliveries can save ₹2,000–₹4,000/month.\n` +
        `2. **Leverage the 24-Hour Rule**: For non-essential shopping items above ${currency}${calculations.baseDailyLimit.toLocaleString()}, wait 24 hours before buying.\n` +
        `3. **Protect Your Daily Limit**: Treat your safe limit of **${currency}${calculations.safeDailyLimit.toLocaleString()}** as a hard game level. Each unspent rupee rolls over and boosts your future daily allowance!`;
    }

    // Default intelligent response summarizing financial status
    return `Based on your live DailyMint records:\n\n` +
      `• **Monthly Income**: ${currency}${calculations.monthlyIncome.toLocaleString()}\n` +
      `• **Safe Daily Limit Today**: ${currency}${calculations.safeDailyLimit.toLocaleString()}\n` +
      `• **Spent Today**: ${currency}${calculations.spentToday.toLocaleString()}\n` +
      `• **Remaining Today**: ${currency}${calculations.remainingToday.toLocaleString()} (${calculations.isOverspentToday ? '⚠️ Overspent' : '✅ Within safe limit'})\n` +
      `• **Discretionary Balance Left in Month**: ${currency}${calculations.remainingMonthlyBalance.toLocaleString()}\n\n` +
      `You can ask me questions like *"How much did I spend today?"*, *"Where is my money going?"*, or *"Can I afford a ₹1,500 purchase?"*`;
  }

  /**
   * Main chat completion proxy
   */
  public static async answerQuestion(prompt: string, context: AIContext): Promise<string> {
    const geminiKey = process.env.GEMINI_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    // If Gemini API key is configured, call Gemini
    if (geminiKey) {
      try {
        const systemPrompt = `You are DailyMint AI, a premium personal finance assistant.
You have access to the user's REAL financial records:
- Currency: ${context.currency}
- Monthly Income: ${context.calculations.monthlyIncome}
- Fixed Expenses: ${context.calculations.fixedExpenses}
- Savings Target: ${context.calculations.savingsTarget}
- Safe Daily Spending Limit: ${context.calculations.safeDailyLimit}
- Spent Today: ${context.calculations.spentToday}
- Remaining Today: ${context.calculations.remainingToday}
- Total Spent This Month: ${context.calculations.totalMonthlySpent}
- Remaining Days in Month: ${context.calculations.remainingDaysInMonth}
- Recent Transactions: ${JSON.stringify(context.recentTransactions.slice(0, 15))}
- Goals: ${JSON.stringify(context.goals)}

CRITICAL INSTRUCTIONS:
- NEVER invent or hallucinate financial numbers. Use only the exact figures provided above.
- Be concise, friendly, encouraging, and razor-sharp like a top-tier fintech advisor.
- Highlight specific rupee/currency amounts in bold.
- Advise the user clearly whether they are within their daily limits.`;

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  role: 'user',
                  parts: [{ text: `${systemPrompt}\n\nUser Question: ${prompt}` }],
                },
              ],
            }),
          }
        );

        if (response.ok) {
          const data = (await response.json()) as any;
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) return text;
        }
      } catch (err) {
        console.warn('Gemini API call failed, using intelligent local engine:', err);
      }
    }

    // Default to our high-accuracy financial intelligence engine
    return this.generateLocalResponse(prompt, context);
  }
}
