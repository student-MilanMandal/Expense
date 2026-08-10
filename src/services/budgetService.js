import axiosClient from '../api/axiosClient';

export const budgetService = {
  getBudgets: async (params = {}) => {
    const response = await axiosClient.get('/budgets/getBudgetStatus', { params });
    return response.data;
  },

  createBudget: async (budgetData) => {
    const response = await axiosClient.post('/budgets/createBudget', budgetData);
    return response.data;
  },

  updateBudget: async (id, budgetData) => {
    const response = await axiosClient.put(`/budgets/updateBudget/${id}`, budgetData);
    return response.data;
  },

  deleteBudget: async (id) => {
    const response = await axiosClient.delete(`/budgets/deleteBudget/${id}`);
    return response.data;
  },
};
