import mongoose from 'mongoose';
import { budgetService } from '../services/budgetService.js';

/**
 * Controller for Creating or Setting Budget Limit
 * POST /api/budgets/createBudget
 */
export const createBudget = async (req, res) => {
  try {
    const { category, amount } = req.body;
    if (!category || amount === undefined || amount === null || Number(amount) < 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid Category and positive Amount are required',
      });
    }

    const budget = await budgetService.createOrUpdateBudget(req.user._id, req.body);
    return res.status(200).json({
      success: true,
      message: 'Budget set successfully',
      data: budget,
    });
  } catch (error) {
    console.error('Error in createBudget controller:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to set budget',
    });
  }
};

/**
 * Controller for Fetching All User Budgets
 * GET /api/budgets
 */
export const getBudgets = async (req, res) => {
  try {
    const budgets = await budgetService.getUserBudgets(req.user._id);
    return res.status(200).json({
      success: true,
      message: 'Budgets retrieved successfully',
      data: budgets,
    });
  } catch (error) {
    console.error('Error in getBudgets controller:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch budgets',
    });
  }
};

/**
 * Controller for Calculating Aggregated Budget Status & Overspent Flags
 * GET /api/budgets/getBudgetStatus
 */
export const getBudgetStatus = async (req, res) => {
  try {
    const categoryFilter = req.query.category;
    const budgetStatuses = await budgetService.getBudgetStatus(req.user._id, categoryFilter);

    return res.status(200).json({
      success: true,
      message: 'Budget status calculated successfully',
      data: budgetStatuses,
    });
  } catch (error) {
    console.error('Error in getBudgetStatus controller:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to calculate budget status',
    });
  }
};

/**
 * Controller for Updating Budget
 * PUT /api/budgets/updateBudget/:id
 */
export const updateBudget = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid Budget ID format' });
    }

    const budget = await budgetService.updateBudget(req.user._id, id, req.body);
    if (!budget) {
      return res.status(404).json({ success: false, message: 'Budget not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Budget updated successfully',
      data: budget,
    });
  } catch (error) {
    console.error('Error in updateBudget controller:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update budget',
    });
  }
};

/**
 * Controller for Deleting Budget
 * DELETE /api/budgets/deleteBudget/:id
 */
export const deleteBudget = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid Budget ID format' });
    }

    const budget = await budgetService.deleteBudget(req.user._id, id);
    if (!budget) {
      return res.status(404).json({ success: false, message: 'Budget not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Budget deleted successfully',
      data: { id },
    });
  } catch (error) {
    console.error('Error in deleteBudget controller:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete budget',
    });
  }
};
