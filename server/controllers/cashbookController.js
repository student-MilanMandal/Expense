import mongoose from 'mongoose';
import { cashbookService } from '../services/cashbookService.js';

/**
 * Controller for Adding Cash In / Cash Out Entry
 * POST /api/cashbook/addCashEntry
 */
export const addCashEntry = async (req, res) => {
  try {
    let { type, amount } = req.body;
    if (type === 'CASH_IN') type = 'IN';
    if (type === 'CASH_OUT') type = 'OUT';

    if (!type || !amount || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid Type (IN/OUT) and positive Amount are required',
      });
    }

    if (!['IN', 'OUT'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid cash type. Must be IN or OUT',
      });
    }

    const cashBook = await cashbookService.addCashEntry(req.user._id, req.body, req.user);
    return res.status(201).json({
      success: true,
      message: `Cash ${type === 'IN' ? 'In' : 'Out'} entry recorded successfully`,
      data: cashBook,
    });
  } catch (error) {
    console.error('Error in addCashEntry controller:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to record cash entry',
    });
  }
};

/**
 * Controller for Fetching Daily Summary & Entries
 * GET /api/cashbook/getDailySummary
 */
export const getDailySummary = async (req, res) => {
  try {
    const cashBook = await cashbookService.getDailySummary(req.user._id, req.query.date);
    return res.status(200).json({
      success: true,
      message: 'Daily cashbook summary retrieved successfully',
      data: cashBook,
    });
  } catch (error) {
    console.error('Error in getDailySummary controller:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch cashbook summary',
    });
  }
};

/**
 * Controller for Updating / Setting Opening Balance
 * PUT /api/cashbook/updateOpeningBalance
 */
export const updateOpeningBalance = async (req, res) => {
  try {
    const cashBook = await cashbookService.updateOpeningBalance(req.user._id, req.body);
    return res.status(200).json({
      success: true,
      message: 'Opening balance updated successfully',
      data: cashBook,
    });
  } catch (error) {
    console.error('Error in updateOpeningBalance controller:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update opening balance',
    });
  }
};

/**
 * Controller for Fetching CashBook History Across Days
 * GET /api/cashbook/getCashBookHistory
 */
export const getCashBookHistory = async (req, res) => {
  try {
    const history = await cashbookService.getCashBookHistory(req.user._id, req.query);
    return res.status(200).json({
      success: true,
      message: 'Cashbook history retrieved successfully',
      data: history,
    });
  } catch (error) {
    console.error('Error in getCashBookHistory controller:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch cashbook history',
    });
  }
};

/**
 * Controller for Deleting a Single Cash Entry from CashBook
 * DELETE /api/cashbook/deleteCashEntry/:entryId
 */
export const deleteCashEntry = async (req, res) => {
  try {
    const { entryId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(entryId)) {
      return res.status(400).json({ success: false, message: 'Invalid Cash Entry ID format' });
    }

    const cashBook = await cashbookService.deleteCashEntry(req.user._id, req.query.date, entryId);
    if (!cashBook) {
      return res.status(404).json({ success: false, message: 'Cash entry or record not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Cash entry deleted and balance recalculated',
      data: cashBook,
    });
  } catch (error) {
    console.error('Error in deleteCashEntry controller:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete cash entry',
    });
  }
};
