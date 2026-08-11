import CashBook from '../models/CashBook.js';
import Income from '../models/Income.js';
import Expense from '../models/Expense.js';
import { parseInputDate } from '../utils/dateUtils.js';

const getStartOfDay = (dateString) => {
  if (!dateString) {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return new Date(`${year}-${month}-${day}T12:00:00.000Z`);
  }
  return parseInputDate(dateString);
};

const getOpeningBalanceForDate = async (userId, targetDate) => {
  const previousRecord = await CashBook.findOne({
    user: userId,
    date: { $lt: targetDate },
  }).sort({ date: -1 });

  if (previousRecord) {
    return previousRecord.closingBalance;
  }

  const [priorIncomeAgg, priorExpenseAgg] = await Promise.all([
    Income.aggregate([
      { $match: { user: userId, date: { $lt: targetDate } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Expense.aggregate([
      { $match: { user: userId, date: { $lt: targetDate } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
  ]);

  const priorInc = priorIncomeAgg.length > 0 ? priorIncomeAgg[0].total : 0;
  const priorExp = priorExpenseAgg.length > 0 ? priorExpenseAgg[0].total : 0;
  const netPrior = priorInc - priorExp;

  if (netPrior > 0) return netPrior;

  const [totalIncAgg, totalExpAgg] = await Promise.all([
    Income.aggregate([
      { $match: { user: userId } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Expense.aggregate([
      { $match: { user: userId } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
  ]);

  const totalInc = totalIncAgg.length > 0 ? totalIncAgg[0].total : 0;
  const totalExp = totalExpAgg.length > 0 ? totalExpAgg[0].total : 0;

  return Math.max(0, totalInc - totalExp);
};

export const cashbookService = {
  /**
   * Add a cash in / cash out entry and re-calculate running balance
   */
  addCashEntry: async (userId, payload, userObj) => {
    let { type, amount, date, notes } = payload;

    if (type === 'CASH_IN') type = 'IN';
    if (type === 'CASH_OUT') type = 'OUT';

    const numAmount = Number(amount);
    const entryDate = getStartOfDay(date);

    let cashBook = await CashBook.findOne({ user: userId, date: entryDate });

    if (!cashBook) {
      const openingBalance = await getOpeningBalanceForDate(userId, entryDate);
      cashBook = new CashBook({
        user: userId,
        date: entryDate,
        openingBalance,
        cashIn: 0,
        cashOut: 0,
        closingBalance: openingBalance,
        entries: [],
      });
    }

    cashBook.entries.push({
      type,
      amount: numAmount,
      notes: notes || '',
      date: new Date(),
    });

    if (type === 'IN') {
      cashBook.cashIn = (cashBook.cashIn || 0) + numAmount;
    } else if (type === 'OUT') {
      cashBook.cashOut = (cashBook.cashOut || 0) + numAmount;
    }

    cashBook.closingBalance = (cashBook.openingBalance || 0) + (cashBook.cashIn || 0) - (cashBook.cashOut || 0);
    await cashBook.save();

    const resObj = cashBook.toObject ? cashBook.toObject() : { ...cashBook };
    resObj.totalCashIn = cashBook.cashIn;
    resObj.totalCashOut = cashBook.cashOut;

    return resObj;
  },

  /**
   * Get daily cashbook summary for a given date
   */
  getDailySummary: async (userId, dateQuery) => {
    const targetDate = getStartOfDay(dateQuery);

    let cashBook = await CashBook.findOne({ user: userId, date: targetDate });

    if (!cashBook) {
      const openingBalance = await getOpeningBalanceForDate(userId, targetDate);
      return {
        date: targetDate,
        openingBalance,
        cashIn: 0,
        cashOut: 0,
        totalCashIn: 0,
        totalCashOut: 0,
        closingBalance: openingBalance,
        entries: [],
      };
    }

    const resObj = cashBook.toObject ? cashBook.toObject() : { ...cashBook };
    resObj.totalCashIn = cashBook.cashIn || 0;
    resObj.totalCashOut = cashBook.cashOut || 0;
    return resObj;
  },

  /**
   * Update / Override Opening Balance for a specific date
   */
  updateOpeningBalance: async (userId, payload) => {
    const { openingBalance, date } = payload;
    const targetDate = getStartOfDay(date);
    const numOpening = Number(openingBalance) || 0;

    let cashBook = await CashBook.findOne({ user: userId, date: targetDate });
    if (!cashBook) {
      cashBook = new CashBook({
        user: userId,
        date: targetDate,
        openingBalance: numOpening,
        cashIn: 0,
        cashOut: 0,
        closingBalance: numOpening,
        entries: [],
      });
    } else {
      cashBook.openingBalance = numOpening;
      cashBook.closingBalance = cashBook.openingBalance + (cashBook.cashIn || 0) - (cashBook.cashOut || 0);
    }

    await cashBook.save();

    const resObj = cashBook.toObject ? cashBook.toObject() : { ...cashBook };
    resObj.totalCashIn = cashBook.cashIn || 0;
    resObj.totalCashOut = cashBook.cashOut || 0;
    return resObj;
  },

  /**
   * Get CashBook history entries across dates
   */
  getCashBookHistory: async (userId, queryParams) => {
    const limit = Number(queryParams.limit) || 30;
    const history = await CashBook.find({ user: userId }).sort({ date: -1 }).limit(limit);
    return history.map((doc) => {
      const obj = doc.toObject ? doc.toObject() : { ...doc };
      obj.totalCashIn = doc.cashIn || 0;
      obj.totalCashOut = doc.cashOut || 0;
      return obj;
    });
  },

  /**
   * Delete cash entry from CashBook document
   */
  deleteCashEntry: async (userId, dateQuery, entryId) => {
    const targetDate = getStartOfDay(dateQuery);
    const cashBook = await CashBook.findOne({ user: userId, date: targetDate });

    if (!cashBook) return null;

    const entry = cashBook.entries.id(entryId);
    if (!entry) return null;

    if (entry.type === 'IN') {
      cashBook.cashIn = Math.max(0, (cashBook.cashIn || 0) - entry.amount);
    } else if (entry.type === 'OUT') {
      cashBook.cashOut = Math.max(0, (cashBook.cashOut || 0) - entry.amount);
    }

    entry.deleteOne();
    cashBook.closingBalance = (cashBook.openingBalance || 0) + (cashBook.cashIn || 0) - (cashBook.cashOut || 0);
    await cashBook.save();

    const resObj = cashBook.toObject ? cashBook.toObject() : { ...cashBook };
    resObj.totalCashIn = cashBook.cashIn || 0;
    resObj.totalCashOut = cashBook.cashOut || 0;
    return resObj;
  },
};
