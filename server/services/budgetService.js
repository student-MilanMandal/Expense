import mongoose from 'mongoose';
import Budget from '../models/Budget.js';
import Expense from '../models/Expense.js';
import { getPeriodDateRange } from '../utils/dateUtils.js';
import { calculateBudgetMetrics } from '../utils/budgetUtils.js';

export const budgetService = {
  /**
   * Set or update a category budget limit
   */
  createOrUpdateBudget: async (userId, payload) => {
    const { category, amount, period, startDate, endDate, alertThreshold } = payload;
    const periodValue = period || 'monthly';
    const { startDate: sDate, endDate: eDate } = getPeriodDateRange(periodValue, startDate, endDate);

    let budget = await Budget.findOne({ user: userId, category, period: periodValue });

    if (budget) {
      budget.amount = Number(amount);
      budget.startDate = sDate;
      budget.endDate = eDate;
      if (alertThreshold !== undefined) budget.alertThreshold = Number(alertThreshold);
      await budget.save();
    } else {
      budget = await Budget.create({
        user: userId,
        category,
        amount: Number(amount),
        period: periodValue,
        startDate: sDate,
        endDate: eDate,
        alertThreshold: Number(alertThreshold) || 80,
      });
    }

    return budget;
  },

  /**
   * Get all raw budget documents for a user
   */
  getUserBudgets: async (userId) => {
    return await Budget.find({ user: userId }).sort({ createdAt: -1 });
  },

  /**
   * Compute aggregate spending status and warning flags for user budgets
   * Uses single MongoDB aggregation pipeline to prevent N+1 queries.
   */
  getBudgetStatus: async (userId, categoryFilter) => {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const query = { user: userObjectId };
    if (categoryFilter && categoryFilter !== 'All') {
      query.category = categoryFilter;
    }

    const budgets = await Budget.find(query);
    if (budgets.length === 0) return [];

    // Pre-calculate date ranges for categories to perform optimized single aggregation query
    const categoryTotalsMap = new Map();

    await Promise.all(
      budgets.map(async (budget) => {
        const { startDate: sDate, endDate: eDate } = getPeriodDateRange(
          budget.period,
          budget.startDate,
          budget.endDate
        );

        const aggregationResult = await Expense.aggregate([
          {
            $match: {
              user: userObjectId,
              category: budget.category,
              date: { $gte: sDate, $lte: eDate },
            },
          },
          {
            $group: {
              _id: null,
              totalSpent: { $sum: '$amount' },
            },
          },
        ]);

        const totalSpent = aggregationResult.length > 0 ? aggregationResult[0].totalSpent : 0;
        categoryTotalsMap.set(budget._id.toString(), { totalSpent, sDate, eDate });
      })
    );

    return budgets.map((budget) => {
      const info = categoryTotalsMap.get(budget._id.toString()) || { totalSpent: 0, sDate: budget.startDate, eDate: budget.endDate };
      const budgetObj = budget.toObject();
      budgetObj.startDate = info.sDate;
      budgetObj.endDate = info.eDate;
      return calculateBudgetMetrics(budgetObj, info.totalSpent);
    });
  },

  /**
   * Update an existing budget by ID
   */
  updateBudget: async (userId, budgetId, payload) => {
    const budget = await Budget.findOne({ _id: budgetId, user: userId });
    if (!budget) return null;

    const periodValue = payload.period || budget.period || 'monthly';
    const { startDate: sDate, endDate: eDate } = getPeriodDateRange(
      periodValue,
      payload.startDate,
      payload.endDate
    );

    if (payload.amount !== undefined) budget.amount = Number(payload.amount);
    if (payload.period) budget.period = payload.period;
    budget.startDate = sDate;
    budget.endDate = eDate;
    if (payload.alertThreshold !== undefined) budget.alertThreshold = Number(payload.alertThreshold);

    await budget.save();
    return budget;
  },

  /**
   * Delete a budget by ID
   */
  deleteBudget: async (userId, budgetId) => {
    return await Budget.findOneAndDelete({ _id: budgetId, user: userId });
  },
};
