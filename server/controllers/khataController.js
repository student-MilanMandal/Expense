import mongoose from 'mongoose';
import fs from 'fs';
import { khataService } from '../services/khataService.js';

/**
 * Controller for Adding Khata Customer
 * POST /api/khata/addCustomer
 */
export const createCustomer = async (req, res) => {
  try {
    const { name, mobile } = req.body;
    if (!name || !mobile) {
      return res.status(400).json({
        success: false,
        message: 'Name and Mobile number are required fields',
      });
    }

    const customer = await khataService.createCustomer(req.user._id, req.body, req.user);
    return res.status(201).json({
      success: true,
      message: 'Customer added to Khata Book successfully',
      data: customer,
    });
  } catch (error) {
    console.error('Error in createCustomer controller:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to add customer',
    });
  }
};

/**
 * Controller for Fetching Khata Customers
 * GET /api/khata/getAllCustomers
 */
export const getCustomers = async (req, res) => {
  try {
    const result = await khataService.getCustomers(req.user._id, req.query.search);
    return res.status(200).json({
      success: true,
      message: 'Khata customers retrieved successfully',
      data: result,
    });
  } catch (error) {
    console.error('Error in getCustomers controller:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch customers',
    });
  }
};

/**
 * Controller for Updating Khata Customer Details
 * PUT /api/khata/updateCustomer/:customerId
 */
export const updateCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return res.status(400).json({ success: false, message: 'Invalid Customer ID format' });
    }

    const customer = await khataService.updateCustomer(req.user._id, customerId, req.body);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Customer updated successfully',
      data: customer,
    });
  } catch (error) {
    console.error('Error in updateCustomer controller:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update customer',
    });
  }
};

/**
 * Controller for Adding Khata Transaction & Updating Net Balance
 * POST /api/khata/addTransaction
 */
export const addTransaction = async (req, res) => {
  try {
    let { customerId, type, amount } = req.body;
    if (type === 'CREDIT') type = 'CREDIT_GIVEN';
    if (type === 'DEBIT') type = 'PAYMENT_RECEIVED';

    if (!customerId || !type || !amount) {
      if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Customer ID, Transaction Type, and Amount are required',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, message: 'Invalid Customer ID format' });
    }

    if (!['CREDIT_GIVEN', 'PAYMENT_RECEIVED'].includes(type)) {
      if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Invalid transaction type. Must be CREDIT_GIVEN or PAYMENT_RECEIVED',
      });
    }

    const result = await khataService.addTransaction(req.user._id, req.body, req.file, req.user);
    return res.status(201).json({
      success: true,
      message: 'Transaction recorded and customer balance updated',
      data: result,
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    console.error('Error in addTransaction controller:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to add Khata transaction',
    });
  }
};

/**
 * Controller for Fetching Specific Customer Transaction History
 * GET /api/khata/getCustomerTransactions/:customerId
 */
export const getCustomerTransactions = async (req, res) => {
  try {
    const { customerId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return res.status(400).json({ success: false, message: 'Invalid Customer ID format' });
    }

    const result = await khataService.getCustomerTransactions(req.user._id, customerId);
    if (!result) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Customer transactions retrieved successfully',
      data: result,
    });
  } catch (error) {
    console.error('Error in getCustomerTransactions controller:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch customer transactions',
    });
  }
};

/**
 * Controller for Deleting Customer and Transactions
 * DELETE /api/khata/deleteCustomer/:customerId
 */
export const deleteCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return res.status(400).json({ success: false, message: 'Invalid Customer ID format' });
    }

    const result = await khataService.deleteCustomer(req.user._id, customerId);
    if (!result) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Customer and transaction history deleted successfully',
      data: result,
    });
  } catch (error) {
    console.error('Error in deleteCustomer controller:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete customer',
    });
  }
};
