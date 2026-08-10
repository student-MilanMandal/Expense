import mongoose from 'mongoose';
import Income from '../models/Income.js';
import Expense from '../models/Expense.js';
import SavingsGoal from '../models/SavingsGoal.js';
import Budget from '../models/Budget.js';
import { getPeriodDateRange } from '../utils/dateUtils.js';

const ESSENTIAL_CATEGORIES = [
  'food',
  'food & dining',
  'groceries',
  'grocery',
  'utilities',
  'utility',
  'bills',
  'bill',
  'bills & utilities',
  'rent',
  'housing',
  'healthcare',
  'health',
  'medical',
  'medicine',
  'education',
  'school',
  'college',
  'transport',
  'transportation',
  'fuel',
  'gas',
  'electricity',
  'water',
  'internet',
  'recharge',
  'emi',
  'loan',
];

export const analyticsService = {
  /**
   * Compute monthly Income vs Expense analytics
   */
  getIncomeVsExpense: async (userId) => {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const [incomeAgg, expenseAgg, essentialAgg] = await Promise.all([
      Income.aggregate([
        {
          $match: {
            user: userObjectId,
            date: { $gte: startOfMonth, $lte: endOfMonth },
          },
        },
        {
          $group: {
            _id: null,
            totalIncome: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
      ]),
      Expense.aggregate([
        {
          $match: {
            user: userObjectId,
            date: { $gte: startOfMonth, $lte: endOfMonth },
          },
        },
        {
          $group: {
            _id: null,
            totalExpense: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
      ]),
      Expense.aggregate([
        {
          $match: {
            user: userObjectId,
            date: { $gte: startOfMonth, $lte: endOfMonth },
          },
        },
        {
          $group: {
            _id: { $toLower: '$category' },
            totalAmount: { $sum: '$amount' },
          },
        },
      ]),
    ]);

    const totalIncome = incomeAgg.length > 0 ? incomeAgg[0].totalIncome : 0;
    const totalExpense = expenseAgg.length > 0 ? expenseAgg[0].totalExpense : 0;
    const netSavings = totalIncome - totalExpense;

    const essentialExpense = essentialAgg
      .filter((item) => {
        const cat = item._id || '';
        return ESSENTIAL_CATEGORIES.some((ess) => cat.includes(ess) || ess.includes(cat));
      })
      .reduce((sum, item) => sum + item.totalAmount, 0);

    const essentialRatio = totalExpense > 0 ? Math.round((essentialExpense / totalExpense) * 100) : 0;

    // Calculate Category Budget Metrics
    const userBudgets = await Budget.find({ user: userObjectId });
    let totalBudgetLimit = 0;
    let totalBudgetSpent = 0;

    if (userBudgets.length > 0) {
      totalBudgetLimit = userBudgets.reduce((sum, b) => sum + (b.amount || b.limit || 0), 0);

      await Promise.all(
        userBudgets.map(async (b) => {
          const { startDate: sDate, endDate: eDate } = getPeriodDateRange(
            b.period || 'monthly',
            b.startDate,
            b.endDate
          );
          const agg = await Expense.aggregate([
            {
              $match: {
                user: userObjectId,
                category: b.category,
                date: { $gte: sDate, $lte: eDate },
              },
            },
            {
              $group: {
                _id: null,
                spent: { $sum: '$amount' },
              },
            },
          ]);
          const spent = agg.length > 0 ? agg[0].spent : 0;
          totalBudgetSpent += spent;
        })
      );
    }

    const isBudgetExceeded = totalBudgetLimit > 0 && totalBudgetSpent > totalBudgetLimit;
    const budgetControlPct = totalBudgetLimit > 0
      ? (isBudgetExceeded ? 0 : Math.max(0, Math.min(100, Math.round(((totalBudgetLimit - totalBudgetSpent) / totalBudgetLimit) * 100))))
      : 0;

    return {
      month: now.toLocaleString('default', { month: 'long', year: 'numeric' }),
      totalIncome,
      totalExpense,
      netSavings,
      incomeCount: incomeAgg.length > 0 ? incomeAgg[0].count : 0,
      expenseCount: expenseAgg.length > 0 ? expenseAgg[0].count : 0,
      essentialExpense,
      essentialRatio,
      totalBudgetLimit,
      totalBudgetSpent,
      isBudgetExceeded,
      budgetControlPct,
    };
  },

  /**
   * Compute category spending breakdown for doughnut charts
   */
  getCategorySpending: async (userId) => {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const categoryAgg = await Expense.aggregate([
      {
        $match: {
          user: userObjectId,
          date: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: '$category',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { totalAmount: -1 } },
    ]);

    const grandTotal = categoryAgg.reduce((sum, item) => sum + item.totalAmount, 0);

    const formattedData = categoryAgg.map((item) => ({
      category: item._id,
      totalAmount: item.totalAmount,
      percentage: grandTotal > 0 ? Math.round((item.totalAmount / grandTotal) * 100) : 0,
      count: item.count,
    }));

    return {
      grandTotal,
      categories: formattedData,
    };
  },

  /**
   * Compute savings progress and trend metrics
   */
  getSavingsTrend: async (userId) => {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const savingsAgg = await SavingsGoal.aggregate([
      { $match: { user: userObjectId } },
      {
        $group: {
          _id: '$status',
          totalTarget: { $sum: '$targetAmount' },
          totalSaved: { $sum: '$savedAmount' },
          goalCount: { $sum: 1 },
        },
      },
    ]);

    const totalSavedAcrossAll = savingsAgg.reduce((sum, item) => sum + item.totalSaved, 0);
    const totalTargetAcrossAll = savingsAgg.reduce((sum, item) => sum + item.totalTarget, 0);
    const overallProgress = totalTargetAcrossAll > 0 ? Math.round((totalSavedAcrossAll / totalTargetAcrossAll) * 100) : 0;

    return {
      totalSaved: totalSavedAcrossAll,
      totalTarget: totalTargetAcrossAll,
      overallProgress,
      breakdownByStatus: savingsAgg.map((s) => ({
        status: s._id,
        saved: s.totalSaved,
        target: s.totalTarget,
        goalsCount: s.goalCount,
      })),
    };
  },
};
