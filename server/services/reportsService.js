import Income from '../models/Income.js';
import Expense from '../models/Expense.js';
import KhataTransaction from '../models/KhataTransaction.js';
import CashBook from '../models/CashBook.js';

const getReportDateRange = (period, customStart, customEnd) => {
  const now = new Date();
  let startDate = new Date();
  let endDate = new Date();

  if (period === 'daily') {
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
  } else if (period === 'weekly') {
    const day = now.getDay();
    const diffToMonday = now.getDate() - day + (day === 0 ? -6 : 1);
    startDate = new Date(now.setDate(diffToMonday));
    startDate.setHours(0, 0, 0, 0);
    endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);
  } else if (period === 'monthly') {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  } else if (period === 'yearly') {
    startDate = new Date(now.getFullYear(), 0, 1);
    endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
  } else if (customStart || customEnd) {
    if (customStart) startDate = new Date(customStart);
    if (customEnd) {
      endDate = new Date(customEnd);
      endDate.setHours(23, 59, 59, 999);
    }
  } else {
    startDate.setDate(now.getDate() - 30);
    startDate.setHours(0, 0, 0, 0);
  }

  return { startDate, endDate };
};

export const reportsService = {
  /**
   * Generate structured CSV/PDF report payload for Income, Expense, Khata, or Cashbook
   */
  generateReport: async (userId, userObj, payload, queryParams) => {
    const type = (payload.type || queryParams.type || 'expense').toLowerCase();
    const period = (payload.period || queryParams.period || 'monthly').toLowerCase();
    const customStart = payload.startDate || queryParams.startDate;
    const customEnd = payload.endDate || queryParams.endDate;

    const { startDate, endDate } = getReportDateRange(period, customStart, customEnd);

    let columns;
    let rows;
    let summary;

    if (type === 'income') {
      columns = [
        { key: 'date', label: 'Date' },
        { key: 'source', label: 'Income Source' },
        { key: 'category', label: 'Category' },
        { key: 'amount', label: 'Amount' },
        { key: 'paymentMethod', label: 'Payment Method' },
        { key: 'notes', label: 'Notes' },
      ];

      const records = await Income.find({
        user: userId,
        date: { $gte: startDate, $lte: endDate },
      }).sort({ date: -1 });

      const totalAmount = records.reduce((sum, r) => sum + r.amount, 0);

      rows = records.map((r) => ({
        id: r._id,
        date: new Date(r.date).toLocaleDateString(),
        source: r.source,
        category: r.category,
        amount: r.amount,
        paymentMethod: r.paymentMethod,
        notes: r.notes || '-',
      }));

      summary = {
        totalRecords: records.length,
        totalIncome: totalAmount,
      };
    } else if (type === 'expense') {
      columns = [
        { key: 'date', label: 'Date' },
        { key: 'description', label: 'Description' },
        { key: 'category', label: 'Category' },
        { key: 'amount', label: 'Amount' },
        { key: 'paymentMethod', label: 'Payment Method' },
        { key: 'notes', label: 'Notes' },
      ];

      const records = await Expense.find({
        user: userId,
        date: { $gte: startDate, $lte: endDate },
      }).sort({ date: -1 });

      const totalAmount = records.reduce((sum, r) => sum + r.amount, 0);

      rows = records.map((r) => ({
        id: r._id,
        date: new Date(r.date).toLocaleDateString(),
        description: r.description,
        category: r.category,
        amount: r.amount,
        paymentMethod: r.paymentMethod,
        notes: r.notes || '-',
      }));

      summary = {
        totalRecords: records.length,
        totalExpense: totalAmount,
      };
    } else if (type === 'khata') {
      columns = [
        { key: 'date', label: 'Date' },
        { key: 'customerName', label: 'Customer Name' },
        { key: 'type', label: 'Type' },
        { key: 'amount', label: 'Amount' },
        { key: 'notes', label: 'Notes' },
      ];

      const records = await KhataTransaction.find({
        user: userId,
        date: { $gte: startDate, $lte: endDate },
      })
        .populate('customer', 'name mobile')
        .sort({ date: -1 });

      let totalCreditGiven = 0;
      let totalPaymentReceived = 0;

      rows = records.map((r) => {
        if (r.type === 'CREDIT_GIVEN') totalCreditGiven += r.amount;
        if (r.type === 'PAYMENT_RECEIVED') totalPaymentReceived += r.amount;

        return {
          id: r._id,
          date: new Date(r.date).toLocaleDateString(),
          customerName: r.customer ? `${r.customer.name} (${r.customer.mobile})` : 'Unknown',
          type: r.type === 'CREDIT_GIVEN' ? 'You Gave' : 'You Got',
          amount: r.amount,
          notes: r.notes || '-',
        };
      });

      summary = {
        totalRecords: records.length,
        totalCreditGiven,
        totalPaymentReceived,
        netBalance: totalCreditGiven - totalPaymentReceived,
      };
    } else if (type === 'cashbook') {
      columns = [
        { key: 'date', label: 'Date' },
        { key: 'openingBalance', label: 'Opening Balance' },
        { key: 'cashIn', label: 'Cash In' },
        { key: 'cashOut', label: 'Cash Out' },
        { key: 'closingBalance', label: 'Closing Balance' },
        { key: 'notes', label: 'Notes' },
      ];

      const records = await CashBook.find({
        user: userId,
        date: { $gte: startDate, $lte: endDate },
      }).sort({ date: -1 });

      const totalCashIn = records.reduce((sum, r) => sum + (r.cashIn || 0), 0);
      const totalCashOut = records.reduce((sum, r) => sum + (r.cashOut || 0), 0);

      rows = records.map((r) => ({
        id: r._id,
        date: new Date(r.date).toLocaleDateString(),
        openingBalance: r.openingBalance,
        cashIn: r.cashIn,
        cashOut: r.cashOut,
        closingBalance: r.closingBalance,
        notes: r.notes || '-',
      }));

      summary = {
        totalRecords: records.length,
        totalCashIn,
        totalCashOut,
        netCashFlow: totalCashIn - totalCashOut,
      };
    } else {
      throw new Error('Invalid report type. Must be income, expense, khata, or cashbook');
    }

    return {
      reportMetaData: {
        title: `${type.toUpperCase()} REPORT`,
        period: period.toUpperCase(),
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        generatedAt: new Date().toISOString(),
        currency: userObj?.currency || 'INR',
        user: {
          name: userObj?.name,
          email: userObj?.email,
        },
      },
      columns,
      rows,
      summary,
    };
  },
};
