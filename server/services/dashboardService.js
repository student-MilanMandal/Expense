import Income from '../models/Income.js';
import Expense from '../models/Expense.js';
import Budget from '../models/Budget.js';

export const dashboardService = {
  /**
   * Compile full dashboard metrics, cards, charts, and recent activity
   */
  getDashboardSummary: async (userId, yearQuery, monthQuery) => {
    const now = new Date();
    const targetYear = yearQuery ? parseInt(yearQuery, 10) : now.getFullYear();
    const targetMonth = monthQuery ? parseInt(monthQuery, 10) - 1 : now.getMonth();

    const startOfMonth = new Date(targetYear, targetMonth, 1, 0, 0, 0, 0);
    const endOfMonth = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59, 999);

    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const [
      totalIncomeAgg,
      totalExpenseAgg,
      monthIncomeAgg,
      monthExpenseAgg,
      todayExpenseAgg,
      activeBudgetsCount,
      categorySpending,
    ] = await Promise.all([
      Income.aggregate([
        { $match: { user: userId } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Expense.aggregate([
        { $match: { user: userId } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Income.aggregate([
        { $match: { user: userId, date: { $gte: startOfMonth, $lte: endOfMonth } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Expense.aggregate([
        { $match: { user: userId, date: { $gte: startOfMonth, $lte: endOfMonth } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Expense.aggregate([
        { $match: { user: userId, date: { $gte: startOfToday, $lte: endOfToday } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Budget.countDocuments({ user: userId }),
      Expense.aggregate([
        { $match: { user: userId, date: { $gte: startOfMonth, $lte: endOfMonth } } },
        { $group: { _id: '$category', total: { $sum: '$amount' } } },
        { $sort: { total: -1 } },
      ]),
    ]);

    const totalIncome = totalIncomeAgg.length > 0 ? totalIncomeAgg[0].total : 0;
    const totalExpense = totalExpenseAgg.length > 0 ? totalExpenseAgg[0].total : 0;
    const currentBalance = totalIncome - totalExpense;

    const monthlyIncome = monthIncomeAgg.length > 0 ? monthIncomeAgg[0].total : 0;
    const monthlyExpense = monthExpenseAgg.length > 0 ? monthExpenseAgg[0].total : 0;
    const monthlySavings = monthlyIncome - monthlyExpense;

    const todayExpenses = todayExpenseAgg.length > 0 ? todayExpenseAgg[0].total : 0;

    // 6-month historical income vs expense chart
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const [monthlyIncomeChart, monthlyExpenseChart] = await Promise.all([
      Income.aggregate([
        { $match: { user: userId, date: { $gte: sixMonthsAgo } } },
        {
          $group: {
            _id: { month: { $month: '$date' }, year: { $year: '$date' } },
            income: { $sum: '$amount' },
          },
        },
      ]),
      Expense.aggregate([
        { $match: { user: userId, date: { $gte: sixMonthsAgo } } },
        {
          $group: {
            _id: { month: { $month: '$date' }, year: { $year: '$date' } },
            expense: { $sum: '$amount' },
          },
        },
      ]),
    ]);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const incomeVsExpenseChart = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() - i);
      const mNum = d.getMonth() + 1;
      const yNum = d.getFullYear();

      const incItem = monthlyIncomeChart.find((x) => x._id.month === mNum && x._id.year === yNum);
      const expItem = monthlyExpenseChart.find((x) => x._id.month === mNum && x._id.year === yNum);

      incomeVsExpenseChart.push({
        month: months[d.getMonth()],
        income: incItem ? incItem.income : 0,
        expense: expItem ? expItem.expense : 0,
      });
    }

    // Combined recent activity
    const [recentIncomes, recentExpenses, userBudgets] = await Promise.all([
      Income.find({ user: userId }).sort({ date: -1 }).limit(5),
      Expense.find({ user: userId }).sort({ date: -1 }).limit(5),
      Budget.find({ user: userId }),
    ]);

    const combinedActivities = [
      ...recentIncomes.map((i) => ({
        id: i._id,
        type: 'INCOME',
        title: i.source,
        category: i.category,
        amount: i.amount,
        date: i.date,
        paymentMethod: i.paymentMethod,
      })),
      ...recentExpenses.map((e) => ({
        id: e._id,
        type: 'EXPENSE',
        title: e.description,
        category: e.category,
        amount: e.amount,
        date: e.date,
        paymentMethod: e.paymentMethod,
      })),
    ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);

    const budgetsWithSpent = await Promise.all(
      userBudgets.map(async (b) => {
        const spentAgg = await Expense.aggregate([
          {
            $match: {
              user: userId,
              category: b.category,
              date: { $gte: startOfMonth, $lte: endOfMonth },
            },
          },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]);
        const spent = spentAgg.length > 0 ? spentAgg[0].total : 0;
        return {
          id: b._id,
          category: b.category,
          amount: b.amount,
          spent,
          percentage: b.amount > 0 ? Math.min(100, Math.round((spent / b.amount) * 100)) : 0,
        };
      })
    );

    const startOfWeek = new Date(now);
    const dayOfWeek = startOfWeek.getDay();
    const diffToMon = startOfWeek.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    startOfWeek.setDate(diffToMon);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(now);
    endOfWeek.setHours(23, 59, 59, 999);

    const weekExpenseAgg = await Expense.aggregate([
      { $match: { user: userId, date: { $gte: startOfWeek, $lte: endOfWeek } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const thisWeekSpending = weekExpenseAgg.length > 0 ? weekExpenseAgg[0].total : 0;

    const grandCategoryTotal = categorySpending.reduce((sum, c) => sum + c.total, 0);
    const topCategoryObj = categorySpending.length > 0 ? {
      category: categorySpending[0]._id,
      totalAmount: categorySpending[0].total,
      percentage: grandCategoryTotal > 0 ? Math.round((categorySpending[0].total / grandCategoryTotal) * 100) : 0,
    } : null;

    let insightMessage = 'Keep logging your expenses to get personalized spending insights.';
    if (topCategoryObj) {
      insightMessage = `You spent the most on ${topCategoryObj.category} (₹${topCategoryObj.totalAmount.toLocaleString('en-IN')}) this month (${topCategoryObj.percentage}% of total outgoings).`;
    }

    return {
      cards: {
        totalIncome,
        totalExpense,
        currentBalance,
        monthlyIncome,
        monthlySavings,
        todayExpenses,
        activeBudgets: activeBudgetsCount,
        thisMonthExpense: monthlyExpense,
        thisWeekSpending,
        selectedMonth: targetMonth + 1,
        selectedYear: targetYear,
      },
      widgets: {
        topCategory: topCategoryObj,
        insightMessage,
        upcomingBills: userBudgets.map((b) => ({
          id: b._id,
          title: `${b.category} Budget Limit`,
          amount: b.amount,
          category: b.category,
        })),
      },
      charts: {
        incomeVsExpense: incomeVsExpenseChart,
        categorySpending: categorySpending.map((c) => ({ category: c._id, total: c.total })),
      },
      recentActivities: combinedActivities,
      budgets: budgetsWithSpent,
    };
  },
};
