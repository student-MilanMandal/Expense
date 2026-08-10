import mongoose from 'mongoose';
import { savingsService } from '../services/savingsService.js';

/**
 * Controller for Creating Savings Goal
 * POST /api/savings/createGoal
 */
export const createSavingsGoal = async (req, res) => {
  try {
    const { title, targetAmount, targetDate, deadline } = req.body;
    const goalDeadline = targetDate || deadline;

    if (!title || !targetAmount || Number(targetAmount) <= 0 || !goalDeadline) {
      return res.status(400).json({
        success: false,
        message: 'Title, positive Target Amount, and Deadline date are required',
      });
    }

    const goal = await savingsService.createSavingsGoal(req.user._id, req.body);
    return res.status(201).json({
      success: true,
      message: 'Savings goal created successfully',
      data: goal,
    });
  } catch (error) {
    console.error('Error in createSavingsGoal controller:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create savings goal',
    });
  }
};

/**
 * Controller for Fetching All Savings Goals
 * GET /api/savings/getAllGoals
 */
export const getSavingsGoals = async (req, res) => {
  try {
    const goals = await savingsService.getSavingsGoals(req.user._id);
    return res.status(200).json({
      success: true,
      message: 'Savings goals retrieved successfully',
      data: goals,
    });
  } catch (error) {
    console.error('Error in getSavingsGoals controller:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch savings goals',
    });
  }
};

/**
 * Controller for Adding Deposit / Funds to Goal
 * POST /api/savings/addFunds/:id
 */
export const addFunds = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid Goal ID format' });
    }

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid deposit amount is required',
      });
    }

    const goal = await savingsService.addFunds(req.user._id, id, amount);
    if (!goal) {
      return res.status(404).json({ success: false, message: 'Savings goal not found' });
    }

    return res.status(200).json({
      success: true,
      message: `Successfully added ₹${Number(amount).toLocaleString('en-IN')} to goal "${goal.title}"`,
      data: goal,
    });
  } catch (error) {
    console.error('Error in addFunds controller:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to add funds to savings goal',
    });
  }
};

/**
 * Controller for Updating Savings Goal Details
 * PUT /api/savings/updateGoal/:id
 */
export const updateSavingsGoal = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid Goal ID format' });
    }

    const goal = await savingsService.updateSavingsGoal(req.user._id, id, req.body);
    if (!goal) {
      return res.status(404).json({ success: false, message: 'Savings goal not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Savings goal updated successfully',
      data: goal,
    });
  } catch (error) {
    console.error('Error in updateSavingsGoal controller:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update savings goal',
    });
  }
};

/**
 * Controller for Deleting Savings Goal
 * DELETE /api/savings/deleteGoal/:id
 */
export const deleteSavingsGoal = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid Goal ID format' });
    }

    const goal = await savingsService.deleteSavingsGoal(req.user._id, id);
    if (!goal) {
      return res.status(404).json({ success: false, message: 'Savings goal not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Savings goal deleted',
      data: { id },
    });
  } catch (error) {
    console.error('Error in deleteSavingsGoal controller:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete savings goal',
    });
  }
};
