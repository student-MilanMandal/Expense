import axiosClient from '../api/axiosClient';

export const expenseService = {
  getExpenses: async (params = {}) => {
    const response = await axiosClient.get('/expenses/getAllExpenses', { params });
    return response.data;
  },

  getExpenseById: async (id) => {
    const response = await axiosClient.get(`/expenses/getExpenseById/${id}`);
    return response.data;
  },

  addExpense: async (formData) => {
    const response = await axiosClient.post('/expenses/addExpense', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  updateExpense: async (id, formData) => {
    const response = await axiosClient.put(`/expenses/updateExpense/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  deleteExpense: async (id) => {
    const response = await axiosClient.delete(`/expenses/deleteExpense/${id}`);
    return response.data;
  },
};
