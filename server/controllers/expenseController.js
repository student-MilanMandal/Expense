import mongoose from 'mongoose';
import fs from 'fs';
import { expenseService } from '../services/expenseService.js';

/**
 * Controller for Adding Expense Entry
 * POST /api/expenses/addExpense
 */
export const addExpense = async (req, res) => {
  try {
    const { amount, description } = req.body;
    if (!amount || !description) {
      if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Amount and Description are required fields',
      });
    }

    const { expense, budgetAlert } = await expenseService.addExpense(
      req.user._id,
      req.body,
      req.file,
      req.user
    );

    return res.status(201).json({
      success: true,
      message: 'Expense recorded successfully',
      data: expense,
      budgetAlert,
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    console.error('Error in addExpense controller:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to record expense',
    });
  }
};

/**
 * Controller for Fetching All Expenses (Search, Filter, Pagination)
 * GET /api/expenses/getAllExpenses
 */
export const getExpenses = async (req, res) => {
  try {
    const result = await expenseService.getExpenses(req.user._id, req.query);
    return res.status(200).json({
      success: true,
      message: 'Expenses retrieved successfully',
      data: result,
    });
  } catch (error) {
    console.error('Error in getExpenses controller:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch expenses',
    });
  }
};

/**
 * Controller for Fetching Single Expense Entry
 * GET /api/expenses/getExpenseById/:id
 */
export const getExpenseById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid Expense ID format' });
    }

    const expense = await expenseService.getExpenseById(req.user._id, id);
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense record not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Expense retrieved successfully',
      data: expense,
    });
  } catch (error) {
    console.error('Error in getExpenseById controller:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch expense entry',
    });
  }
};

/**
 * Controller for Updating Expense Entry
 * PUT /api/expenses/updateExpense/:id
 */
export const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, message: 'Invalid Expense ID format' });
    }

    const result = await expenseService.updateExpense(req.user._id, id, req.body, req.file, req.user);
    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Expense record not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Expense entry updated successfully',
      data: result.updatedExpense,
      budgetAlert: result.budgetAlert,
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    console.error('Error in updateExpense controller:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update expense entry',
    });
  }
};

/**
 * Controller for Deleting Expense Entry
 * DELETE /api/expenses/deleteExpense/:id
 */
export const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid Expense ID format' });
    }

    const expense = await expenseService.deleteExpense(req.user._id, id);
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense record not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Expense entry deleted successfully',
      data: { id },
    });
  } catch (error) {
    console.error('Error in deleteExpense controller:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete expense entry',
    });
  }
};
