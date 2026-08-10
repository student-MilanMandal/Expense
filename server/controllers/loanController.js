import mongoose from 'mongoose';
import { loanService } from '../services/loanService.js';

/**
 * Controller for Creating Loan Record (LENT / BORROWED)
 * POST /api/loans/createLoan
 */
export const createLoan = async (req, res) => {
  try {
    const { type, personName, totalAmount, amount } = req.body;
    const loanAmount = totalAmount || amount;

    if (!type || !personName || !loanAmount || Number(loanAmount) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Type (LENT/BORROWED), Person Name, and positive Amount are required',
      });
    }

    const loan = await loanService.createLoan(req.user._id, req.body, req.user);
    return res.status(201).json({
      success: true,
      message: 'Loan record created successfully',
      data: loan,
    });
  } catch (error) {
    console.error('Error in createLoan controller:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create loan record',
    });
  }
};

/**
 * Controller for Fetching All Loans
 * GET /api/loans/getAllLoans
 */
export const getLoans = async (req, res) => {
  try {
    const loans = await loanService.getLoans(req.user._id, req.query.type);
    return res.status(200).json({
      success: true,
      message: 'Loans retrieved successfully',
      data: loans,
    });
  } catch (error) {
    console.error('Error in getLoans controller:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch loans',
    });
  }
};

/**
 * Controller for Paying EMI / Installment towards a Loan
 * POST /api/loans/payEMI/:id
 */
export const payEMI = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid Loan ID format' });
    }

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid payment amount is required',
      });
    }

    const loan = await loanService.payEMI(req.user._id, id, req.body, req.user);
    if (!loan) {
      return res.status(404).json({ success: false, message: 'Loan record not found' });
    }

    return res.status(200).json({
      success: true,
      message: `Payment of ₹${Number(amount).toLocaleString('en-IN')} recorded successfully`,
      data: loan,
    });
  } catch (error) {
    console.error('Error in payEMI controller:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to record loan payment',
    });
  }
};

/**
 * Controller for Updating Loan Record
 * PUT /api/loans/updateLoan/:id
 */
export const updateLoan = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid Loan ID format' });
    }

    const loan = await loanService.updateLoan(req.user._id, id, req.body);
    if (!loan) {
      return res.status(404).json({ success: false, message: 'Loan record not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Loan record updated successfully',
      data: loan,
    });
  } catch (error) {
    console.error('Error in updateLoan controller:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update loan record',
    });
  }
};

/**
 * Controller for Deleting Loan Record
 * DELETE /api/loans/deleteLoan/:id
 */
export const deleteLoan = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid Loan ID format' });
    }

    const loan = await loanService.deleteLoan(req.user._id, id);
    if (!loan) {
      return res.status(404).json({ success: false, message: 'Loan record not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Loan record deleted',
      data: { id },
    });
  } catch (error) {
    console.error('Error in deleteLoan controller:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete loan record',
    });
  }
};
