import fs from 'fs';
import Expense from '../models/Expense.js';
import Budget from '../models/Budget.js';
import Income from '../models/Income.js';
import mailSender from '../utils/mailSender.js';
import { budgetAlertTemplate, expenseSummaryAlertTemplate } from '../mail/templates/emailTemplates.js';
import { uploadImageToCloudinary } from '../config/cloudinary.js';
import { parseInputDate, getPeriodDateRange } from '../utils/dateUtils.js';

/**
 * Checks budget threshold for a category and triggers non-blocking email alert
 */
const checkBudgetAndSendAlert = async (userId, category, date, userObj) => {
  try {
    const activeBudget = await Budget.findOne({ user: userId, category });
    if (!activeBudget) return null;

    const { startDate: sDate, endDate: eDate } = getPeriodDateRange(activeBudget.period, activeBudget.startDate, activeBudget.endDate);

    const expSum = await Expense.aggregate([
      {
        $match: {
          user: userId,
          category,
          date: { $gte: sDate, $lte: eDate },
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const totalSpent = expSum.length > 0 ? expSum[0].total : 0;
    const percent = activeBudget.amount > 0 ? Math.round((totalSpent / activeBudget.amount) * 100) : 0;

    if (percent >= (activeBudget.alertThreshold || 80)) {
      const isExceeded = percent >= 100;

      if (userObj && userObj.email) {
        const subject = isExceeded
          ? `🚨 CRITICAL: Budget Limit Exceeded for ${category}`
          : `⚠️ WARNING: High Spending Alert for ${category}`;

        const htmlBody = budgetAlertTemplate({
          userName: userObj.name,
          category,
          period: activeBudget.period,
          totalSpent,
          budgetLimit: activeBudget.amount,
          alertThreshold: activeBudget.alertThreshold,
          percent,
          isExceeded,
        });

        mailSender(userObj.email, subject, htmlBody).catch((err) =>
          console.error('Email alert error:', err)
        );
      }

      return {
        isExceeded,
        category,
        percent,
        spent: totalSpent,
        limit: activeBudget.amount,
      };
    }
  } catch (err) {
    console.error('Error in checkBudgetAndSendAlert:', err);
  }
  return null;
};

/**
 * Calculates user overall net income vs expense balance and triggers email summary
 */
const sendExpenseSummaryMail = async (userId, expenseRecord, userObj) => {
  try {
    if (!userObj || !userObj.email) return;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    const monthName = now.toLocaleString('default', { month: 'long', year: 'numeric' });

    const [monthlyIncAgg, monthlyExpAgg, overallIncAgg, overallExpAgg] = await Promise.all([
      Income.aggregate([
        {
          $match: {
            user: userId,
            date: { $gte: startOfMonth, $lte: endOfMonth },
          },
        },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Expense.aggregate([
        {
          $match: {
            user: userId,
            date: { $gte: startOfMonth, $lte: endOfMonth },
          },
        },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Income.aggregate([
        { $match: { user: userId } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Expense.aggregate([
        { $match: { user: userId } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ]);

    const monthlyIncome = monthlyIncAgg.length > 0 ? monthlyIncAgg[0].total : 0;
    const monthlyExpenses = monthlyExpAgg.length > 0 ? monthlyExpAgg[0].total : 0;
    const monthlyBalance = monthlyIncome - monthlyExpenses;

    const overallIncome = overallIncAgg.length > 0 ? overallIncAgg[0].total : 0;
    const overallExpenses = overallExpAgg.length > 0 ? overallExpAgg[0].total : 0;
    const overallBalance = overallIncome - overallExpenses;

    const isIncomeCrossed = (monthlyIncome > 0 && monthlyExpenses > monthlyIncome) || overallBalance < 0;

    const subject = isIncomeCrossed
      ? `🚨 CRITICAL ALERT: Expenses crossed income! (${monthName})`
      : `💸 New Expense Logged: ₹${Number(expenseRecord.amount).toLocaleString('en-IN')} (${expenseRecord.description})`;

    const htmlBody = expenseSummaryAlertTemplate({
      userName: userObj.name,
      amount: expenseRecord.amount,
      category: expenseRecord.category,
      description: expenseRecord.description,
      date: expenseRecord.date,
      paymentMethod: expenseRecord.paymentMethod,
      monthName,
      monthlyIncome,
      monthlyExpenses,
      monthlyBalance,
      overallIncome,
      overallExpenses,
      overallBalance,
      isIncomeCrossed,
    });

    if (isIncomeCrossed) {
      mailSender(userObj.email, subject, htmlBody).catch((err) =>
        console.error('Expense summary email error:', err)
      );
    }
  } catch (err) {
    console.error('Error in sendExpenseSummaryMail:', err);
  }
};

export const expenseService = {
  /**
   * Add new expense document with optional receipt and budget check
   */
  addExpense: async (userId, payload, file, userObj) => {
    const { amount, category, date, description, paymentMethod, notes } = payload;

    let receiptUrl = '';
    if (file) {
      receiptUrl = await uploadImageToCloudinary(file, 'Expense tracker');
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    }

    const expCategory = category || 'Misc';
    const expDate = parseInputDate(date);

    const expense = await Expense.create({
      user: userId,
      amount: Number(amount),
      category: expCategory,
      date: expDate,
      description,
      paymentMethod: paymentMethod || 'UPI',
      notes: notes || '',
      receiptUrl,
    });

    const budgetAlert = await checkBudgetAndSendAlert(userId, expCategory, expDate, userObj);
    sendExpenseSummaryMail(userId, expense, userObj);

    return { expense, budgetAlert };
  },

  /**
   * Get paginated and filtered list of user expenses
   */
  getExpenses: async (userId, queryParams) => {
    const page = Number(queryParams.page) || 1;
    const limit = Number(queryParams.limit) || 10;
    const skip = (page - 1) * limit;

    const query = { user: userId };

    if (queryParams.search) {
      const searchRegex = new RegExp(queryParams.search, 'i');
      query.$or = [{ description: searchRegex }, { notes: searchRegex }];
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

    const totalRecords = await Expense.countDocuments(query);
    const expenses = await Expense.find(query)
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalStats = await Expense.aggregate([
      { $match: query },
      { $group: { _id: null, totalAmount: { $sum: '$amount' } } },
    ]);
    const totalAmount = totalStats.length > 0 ? totalStats[0].totalAmount : 0;

    return {
      expenses,
      page,
      pages: Math.ceil(totalRecords / limit),
      totalRecords,
      totalAmount,
    };
  },

  /**
   * Get single expense document by ID
   */
  getExpenseById: async (userId, expenseId) => {
    return await Expense.findOne({ _id: expenseId, user: userId });
  },

  /**
   * Update expense document with optional receipt replacement
   */
  updateExpense: async (userId, expenseId, payload, file, userObj) => {
    const expense = await Expense.findOne({ _id: expenseId, user: userId });
    if (!expense) {
      if (file && fs.existsSync(file.path)) fs.unlinkSync(file.path);
      return null;
    }

    if (payload.amount !== undefined) expense.amount = Number(payload.amount);
    if (payload.category) expense.category = payload.category;
    if (payload.date) expense.date = parseInputDate(payload.date);
    if (payload.description) expense.description = payload.description;
    if (payload.paymentMethod) expense.paymentMethod = payload.paymentMethod;
    if (payload.notes !== undefined) expense.notes = payload.notes;

    if (file) {
      expense.receiptUrl = await uploadImageToCloudinary(file, 'Expense tracker');
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    }

    const updatedExpense = await expense.save();
    const budgetAlert = await checkBudgetAndSendAlert(userId, updatedExpense.category, updatedExpense.date, userObj);
    sendExpenseSummaryMail(userId, updatedExpense, userObj);

    return { updatedExpense, budgetAlert };
  },

  /**
   * Delete expense document
   */
  deleteExpense: async (userId, expenseId) => {
    return await Expense.findOneAndDelete({ _id: expenseId, user: userId });
  },
};
