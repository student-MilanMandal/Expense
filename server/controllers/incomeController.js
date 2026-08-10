import mongoose from 'mongoose';
import fs from 'fs';
import { incomeService } from '../services/incomeService.js';

/**
 * Controller for Adding Income Entry
 * POST /api/income/addIncome
 */
export const addIncome = async (req, res) => {
  try {
    const { amount, source } = req.body;

    if (!amount || !source) {
      if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Amount and Source are required fields',
      });
    }

    const income = await incomeService.addIncome(
      req.user._id,
      req.body,
      req.file,
      req.user?.email,
      req.user?.name
    );

    return res.status(201).json({
      success: true,
      message: 'Income added successfully',
      data: income,
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    console.error('Error in addIncome controller:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to add income',
    });
  }
};

/**
 * Controller for Fetching Incomes (Search, Filter, Pagination)
 * GET /api/income/getAllIncomes
 */
export const getIncomes = async (req, res) => {
  try {
    const result = await incomeService.getIncomes(req.user._id, req.query);
    return res.status(200).json({
      success: true,
      message: 'Incomes retrieved successfully',
      data: result,
    });
  } catch (error) {
    console.error('Error in getIncomes controller:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch incomes',
    });
  }
};

/**
 * Controller for Fetching Single Income Entry
 * GET /api/income/getIncomeById/:id
 */
export const getIncomeById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid Income ID format' });
    }

    const income = await incomeService.getIncomeById(req.user._id, id);
    if (!income) {
      return res.status(404).json({
        success: false,
        message: 'Income record not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Income retrieved successfully',
      data: income,
    });
  } catch (error) {
    console.error('Error in getIncomeById controller:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch income entry',
    });
  }
};

/**
 * Controller for Updating Income Entry
 * PUT /api/income/updateIncome/:id
 */
export const updateIncome = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, message: 'Invalid Income ID format' });
    }

    const updatedIncome = await incomeService.updateIncome(req.user._id, id, req.body, req.file);
    if (!updatedIncome) {
      return res.status(404).json({
        success: false,
        message: 'Income record not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Income entry updated successfully',
      data: updatedIncome,
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    console.error('Error in updateIncome controller:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update income entry',
    });
  }
};

/**
 * Controller for Deleting Income Entry
 * DELETE /api/income/deleteIncome/:id
 */
export const deleteIncome = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid Income ID format' });
    }

    const income = await incomeService.deleteIncome(req.user._id, id);
    if (!income) {
      return res.status(404).json({
        success: false,
        message: 'Income record not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Income entry deleted successfully',
      data: { id },
    });
  } catch (error) {
    console.error('Error in deleteIncome controller:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete income entry',
    });
  }
};
