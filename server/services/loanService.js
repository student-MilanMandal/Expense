import Loan from '../models/Loan.js';
import { parseInputDate } from '../utils/dateUtils.js';

const computeLoanMetrics = (loan) => {
  const loanObj = loan.toObject ? loan.toObject() : { ...loan };
  const totalPaid = (loanObj.paymentHistory || []).reduce((sum, p) => sum + (p.amount || 0), 0);
  const remainingBalance = Math.max(0, loanObj.amount - totalPaid);
  const isOverdue = loanObj.dueDate && new Date(loanObj.dueDate) < new Date() && loanObj.status !== 'PAID';

  return {
    ...loanObj,
    totalPaid,
    remainingBalance,
    isOverdue,
  };
};

export const loanService = {
  /**
   * Create new Loan record (LENT or BORROWED)
   */
  createLoan: async (userId, payload, userObj) => {
    const { type, personName, totalAmount, amount, dueDate, emiAmount, interestRate, notes } = payload;
    const loanAmount = totalAmount || amount;

    const loan = await Loan.create({
      user: userId,
      type,
      personName,
      amount: Number(loanAmount),
      dueDate: dueDate ? parseInputDate(dueDate) : null,
      emiAmount: Number(emiAmount) || 0,
      interestRate: Number(interestRate) || 0,
      notes: notes || '',
      status: 'PENDING',
      paymentHistory: [],
    });

    // Routine loan creation email disabled to preserve free email quotas

    return computeLoanMetrics(loan);
  },

  /**
   * Fetch all user loans with calculated payment stats
   */
  getLoans: async (userId, typeFilter) => {
    const query = { user: userId };
    if (typeFilter && typeFilter !== 'All') {
      query.type = typeFilter;
    }

    const loans = await Loan.find(query).sort({ createdAt: -1 });
    return loans.map((loan) => computeLoanMetrics(loan));
  },

  /**
   * Record EMI or loan payment towards a loan
   */
  payEMI: async (userId, loanId, payload, userObj) => {
    const { amount, date, notes } = payload;
    const payAmount = Number(amount);

    const loan = await Loan.findOne({ _id: loanId, user: userId });
    if (!loan) return null;

    loan.paymentHistory.push({
      amount: payAmount,
      date: date ? parseInputDate(date) : new Date(),
      notes: notes || '',
    });

    const totalPaid = loan.paymentHistory.reduce((sum, p) => sum + (p.amount || 0), 0);
    if (totalPaid >= loan.amount) {
      loan.status = 'PAID';
    } else if (totalPaid > 0) {
      loan.status = 'PARTIAL';
    }

    await loan.save();

    const computed = computeLoanMetrics(loan);

    // Routine EMI payment email disabled to preserve free email quotas

    return computed;
  },

  /**
   * Update Loan details
   */
  updateLoan: async (userId, loanId, payload) => {
    const loan = await Loan.findOne({ _id: loanId, user: userId });
    if (!loan) return null;

    if (payload.personName) loan.personName = payload.personName;
    if (payload.type) loan.type = payload.type;
    if (payload.amount || payload.totalAmount) loan.amount = Number(payload.amount || payload.totalAmount);
    if (payload.dueDate) loan.dueDate = parseInputDate(payload.dueDate);
    if (payload.emiAmount !== undefined) loan.emiAmount = Number(payload.emiAmount);
    if (payload.interestRate !== undefined) loan.interestRate = Number(payload.interestRate);
    if (payload.notes !== undefined) loan.notes = payload.notes;

    await loan.save();
    return computeLoanMetrics(loan);
  },

  /**
   * Delete loan document by ID
   */
  deleteLoan: async (userId, loanId) => {
    return await Loan.findOneAndDelete({ _id: loanId, user: userId });
  },
};
