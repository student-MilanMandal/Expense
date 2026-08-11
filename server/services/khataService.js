import fs from 'fs';
import KhataCustomer from '../models/KhataCustomer.js';
import KhataTransaction from '../models/KhataTransaction.js';
import { uploadImageToCloudinary } from '../config/cloudinary.js';
import { parseInputDate } from '../utils/dateUtils.js';

export const khataService = {
  /**
   * Create a new Khata customer
   */
  createCustomer: async (userId, payload, userObj) => {
    const { name, mobile, address } = payload;

    const existingCustomer = await KhataCustomer.findOne({ user: userId, mobile });
    if (existingCustomer) {
      throw new Error('Customer with this mobile number already exists in your Khata Book');
    }

    const customer = await KhataCustomer.create({
      user: userId,
      name,
      mobile,
      address: address || '',
      totalCreditGiven: 0,
      totalPaymentReceived: 0,
      netBalance: 0,
    });

    // Routine khata customer creation email disabled to preserve free email quotas

    return customer;
  },

  /**
   * Get all Khata customers with optional search filter
   */
  getCustomers: async (userId, searchQuery) => {
    const query = { user: userId };
    if (searchQuery) {
      const searchRegex = new RegExp(searchQuery, 'i');
      query.$or = [{ name: searchRegex }, { mobile: searchRegex }];
    }

    const customers = await KhataCustomer.find(query).sort({ updatedAt: -1 });

    const totalCreditGiven = customers.reduce((sum, c) => sum + (c.totalCreditGiven || 0), 0);
    const totalPaymentReceived = customers.reduce((sum, c) => sum + (c.totalPaymentReceived || 0), 0);
    const totalNetBalance = customers.reduce((sum, c) => sum + (c.netBalance || 0), 0);

    return {
      customers,
      summary: {
        totalCreditGiven,
        totalPaymentReceived,
        totalNetBalance,
      },
    };
  },

  /**
   * Update Khata customer details
   */
  updateCustomer: async (userId, customerId, payload) => {
    const customer = await KhataCustomer.findOne({ _id: customerId, user: userId });
    if (!customer) return null;

    if (payload.name) customer.name = payload.name;
    if (payload.mobile) customer.mobile = payload.mobile;
    if (payload.address !== undefined) customer.address = payload.address;

    return await customer.save();
  },

  /**
   * Record a new Khata transaction (Credit Given or Payment Received) and update net balance
   */
  addTransaction: async (userId, payload, file, userObj) => {
    let { customerId, type, amount, date, notes, description } = payload;

    if (type === 'CREDIT') type = 'CREDIT_GIVEN';
    if (type === 'DEBIT') type = 'PAYMENT_RECEIVED';

    const txnNotes = notes || description || '';

    const customer = await KhataCustomer.findOne({ _id: customerId, user: userId });
    if (!customer) {
      if (file && fs.existsSync(file.path)) fs.unlinkSync(file.path);
      throw new Error('Customer not found');
    }

    let receiptAttachment = '';
    if (file) {
      receiptAttachment = await uploadImageToCloudinary(file, 'Expense tracker');
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    }

    const numAmount = Number(amount);

    const transaction = await KhataTransaction.create({
      user: userId,
      customer: customerId,
      type,
      amount: numAmount,
      date: parseInputDate(date),
      notes: txnNotes,
      receiptAttachment,
    });

    if (type === 'CREDIT_GIVEN') {
      customer.totalCreditGiven += numAmount;
      customer.netBalance += numAmount;
    } else if (type === 'PAYMENT_RECEIVED') {
      customer.totalPaymentReceived += numAmount;
      customer.netBalance -= numAmount;
    }

    await customer.save();

    // Routine khata transaction email disabled to preserve free email quotas

    return { transaction, updatedCustomer: customer };
  },

  /**
   * Fetch transaction history for a customer
   */
  getCustomerTransactions: async (userId, customerId) => {
    const customer = await KhataCustomer.findOne({ _id: customerId, user: userId });
    if (!customer) return null;

    const transactions = await KhataTransaction.find({ user: userId, customer: customerId }).sort({
      date: -1,
      createdAt: -1,
    });

    return { customer, transactions };
  },

  /**
   * Delete a customer and associated transaction history
   */
  deleteCustomer: async (userId, customerId) => {
    const customer = await KhataCustomer.findOneAndDelete({ _id: customerId, user: userId });
    if (!customer) return null;

    await KhataTransaction.deleteMany({ user: userId, customer: customerId });
    return { id: customerId };
  },
};
