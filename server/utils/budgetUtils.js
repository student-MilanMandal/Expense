/**
 * Computes status metrics for a budget against actual spent amount
 */
export const calculateBudgetMetrics = (budget, totalSpent) => {
  const amount = Number(budget.amount) || 0;
  const spent = Number(totalSpent) || 0;
  const remainingBudget = amount - spent;
  const isOverspent = spent > amount;
  const spentPercentage = amount > 0 ? Math.round((spent / amount) * 100) : 0;
  const alertThreshold = Number(budget.alertThreshold) || 80;
  const isWarning = spentPercentage >= alertThreshold && !isOverspent;

  return {
    _id: budget._id,
    category: budget.category,
    amount,
    budgetAmount: amount,
    period: budget.period,
    startDate: budget.startDate,
    endDate: budget.endDate,
    alertThreshold,
    spent,
    totalSpent: spent,
    remainingBudget,
    spentPercentage,
    isOverspent,
    isWarning,
  };
};
