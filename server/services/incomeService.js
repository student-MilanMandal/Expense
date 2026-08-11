import fs from 'fs';
import Income from '../models/Income.js';
import { uploadImageToCloudinary } from '../config/cloudinary.js';
import { parseInputDate } from '../utils/dateUtils.js';

export const incomeService = {
  /**
   * Create new income entry with optional receipt file attachment and notification
   */
  addIncome: async (userId, payload, file, userEmail, userName) => {
    const { amount, source, category, date, notes, paymentMethod } = payload;

    let attachment = '';
    if (file) {
      attachment = await uploadImageToCloudinary(file, 'Expense tracker');
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    }

    const expDate = parseInputDate(date);

    const income = await Income.create({
      user: userId,
      amount: Number(amount),
      source,
      category: category || 'Others',
      date: expDate,
      notes: notes || '',
      paymentMethod: paymentMethod || 'Bank Transfer',
      attachment,
    });

    // Routine income emails disabled to preserve free email quotas (OTP and critical alerts only)

    return income;
  },

  /**
   * Fetch paginated and filtered income records for a user
   */
  getIncomes: async (userId, queryParams) => {
    const page = Number(queryParams.page) || 1;
    const limit = Number(queryParams.limit) || 10;
    const skip = (page - 1) * limit;

    const query = { user: userId };

    if (queryParams.search) {
      const searchRegex = new RegExp(queryParams.search, 'i');
      query.$or = [{ source: searchRegex }, { notes: searchRegex }];
    }

    if (queryParams.category && queryParams.category !== 'All') {
      query.category = queryParams.category;
    }

    if (queryParams.startDate || queryParams.endDate) {
      query.date = {};
      if (queryParams.startDate) query.date.$gte = new Date(queryParams.startDate);
      if (queryParams.endDate) {
        const end = new Date(queryParams.endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    const totalRecords = await Income.countDocuments(query);
    const incomes = await Income.find(query)
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalStats = await Income.aggregate([
      { $match: query },
      { $group: { _id: null, totalAmount: { $sum: '$amount' } } },
    ]);
    const totalAmount = totalStats.length > 0 ? totalStats[0].totalAmount : 0;

    return {
      incomes,
      page,
      pages: Math.ceil(totalRecords / limit),
      totalRecords,
      totalAmount,
    };
  },

  /**
   * Fetch single income document by ID
   */
  getIncomeById: async (userId, incomeId) => {
    return await Income.findOne({ _id: incomeId, user: userId });
  },

  /**
   * Update income document and update optional receipt attachment
   */
  updateIncome: async (userId, incomeId, payload, file) => {
    const income = await Income.findOne({ _id: incomeId, user: userId });
    if (!income) {
      if (file && fs.existsSync(file.path)) fs.unlinkSync(file.path);
      return null;
    }

    if (payload.amount !== undefined) income.amount = Number(payload.amount);
    if (payload.source) income.source = payload.source;
    if (payload.category) income.category = payload.category;
    if (payload.date) income.date = parseInputDate(payload.date);
    if (payload.paymentMethod) income.paymentMethod = payload.paymentMethod;
    if (payload.notes !== undefined) income.notes = payload.notes;

    if (file) {
      income.attachment = await uploadImageToCloudinary(file, 'Expense tracker');
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    }

    return await income.save();
  },

  /**
   * Delete income document
   */
  deleteIncome: async (userId, incomeId) => {
    return await Income.findOneAndDelete({ _id: incomeId, user: userId });
  },
};
