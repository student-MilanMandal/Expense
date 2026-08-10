import axiosClient from '../api/axiosClient';

export const savingsService = {
  getGoals: async () => {
    const response = await axiosClient.get('/savings/getAllGoals');
    return response.data;
  },

  createGoal: async (goalData) => {
    const response = await axiosClient.post('/savings/createGoal', goalData);
    return response.data;
  },

  addContribution: async (id, amountData) => {
    const response = await axiosClient.put(`/savings/addFunds/${id}`, amountData);
    return response.data;
  },

  deleteGoal: async (id) => {
    const response = await axiosClient.delete(`/savings/deleteGoal/${id}`);
    return response.data;
  },
};
