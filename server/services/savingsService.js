import SavingsGoal from '../models/SavingsGoal.js';
import { parseInputDate } from '../utils/dateUtils.js';

const computeGoalProgress = (goal) => {
  const goalObj = goal.toObject ? goal.toObject() : { ...goal };
  const targetAmount = Number(goalObj.targetAmount) || 0;
  const savedAmount = Number(goalObj.savedAmount) || 0;
  const progressPercentage = targetAmount > 0 ? Math.min(100, Math.round((savedAmount / targetAmount) * 100)) : 0;
  return {
    ...goalObj,
    progressPercentage,
  };
};

export const savingsService = {
  /**
   * Create a new savings goal
   */
  createSavingsGoal: async (userId, payload) => {
    const { title, targetAmount, targetDate, deadline, notes } = payload;
    const goalDeadline = targetDate || deadline;

    const goal = await SavingsGoal.create({
      user: userId,
      title,
      targetAmount: Number(targetAmount),
      savedAmount: 0,
      targetDate: parseInputDate(goalDeadline),
      notes: notes || '',
    });

    return computeGoalProgress(goal);
  },

  /**
   * Fetch all user savings goals with progress percentage
   */
  getSavingsGoals: async (userId) => {
    const goals = await SavingsGoal.find({ user: userId }).sort({ targetDate: 1 });
    return goals.map((goal) => computeGoalProgress(goal));
  },

  /**
   * Add deposit funds to a savings goal
   */
  addFunds: async (userId, goalId, amount) => {
    const goal = await SavingsGoal.findOne({ _id: goalId, user: userId });
    if (!goal) return null;

    goal.savedAmount += Number(amount);
    if (goal.savedAmount >= goal.targetAmount) {
      goal.status = 'COMPLETED';
    }

    await goal.save();
    return computeGoalProgress(goal);
  },

  /**
   * Update savings goal details
   */
  updateSavingsGoal: async (userId, goalId, payload) => {
    const goal = await SavingsGoal.findOne({ _id: goalId, user: userId });
    if (!goal) return null;

    if (payload.title) goal.title = payload.title;
    if (payload.targetAmount) goal.targetAmount = Number(payload.targetAmount);
    if (payload.targetDate || payload.deadline) goal.targetDate = parseInputDate(payload.targetDate || payload.deadline);
    if (payload.notes !== undefined) goal.notes = payload.notes;

    if (goal.savedAmount >= goal.targetAmount) {
      goal.status = 'COMPLETED';
    }

    await goal.save();
    return computeGoalProgress(goal);
  },

  /**
   * Delete savings goal by ID
   */
  deleteSavingsGoal: async (userId, goalId) => {
    return await SavingsGoal.findOneAndDelete({ _id: goalId, user: userId });
  },
};
