import { analyticsService } from '../services/analyticsService.js';

/**
 * Controller for Fetching Monthly Income Vs Expense Analytics
 * GET /api/analytics/getIncomeVsExpense
 */
export const getIncomeVsExpense = async (req, res) => {
  try {
    const data = await analyticsService.getIncomeVsExpense(req.user._id);
    return res.status(200).json({
      success: true,
      message: 'Income vs Expense analytics computed successfully',
      data,
    });
  } catch (error) {
    console.error('Error in getIncomeVsExpense controller:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to compute Income vs Expense analytics',
    });
  }
};

/**
 * Controller for Category Spending Breakdown Aggregation
 * GET /api/analytics/getCategorySpending
 */
export const getCategorySpending = async (req, res) => {
  try {
    const data = await analyticsService.getCategorySpending(req.user._id);
    return res.status(200).json({
      success: true,
      message: 'Category spending analytics computed successfully',
      data,
    });
  } catch (error) {
    console.error('Error in getCategorySpending controller:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to compute Category spending analytics',
    });
  }
};

/**
 * Controller for Aggregating Total Saved Amount Trends Across Goals
 * GET /api/analytics/getSavingsTrend
 */
export const getSavingsTrend = async (req, res) => {
  try {
    const data = await analyticsService.getSavingsTrend(req.user._id);
    return res.status(200).json({
      success: true,
      message: 'Savings trend analytics computed successfully',
      data,
    });
  } catch (error) {
    console.error('Error in getSavingsTrend controller:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to compute Savings trend analytics',
    });
  }
};
