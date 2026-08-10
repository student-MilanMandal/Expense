import axiosClient from '../api/axiosClient';

export const incomeService = {
  getIncomes: async (params = {}) => {
    const response = await axiosClient.get('/income/getAllIncomes', { params });
    return response.data;
  },

  addIncome: async (formData) => {
    const response = await axiosClient.post('/income/addIncome', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  updateIncome: async (id, formData) => {
    const response = await axiosClient.put(`/income/updateIncome/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  deleteIncome: async (id) => {
    const response = await axiosClient.delete(`/income/deleteIncome/${id}`);
    return response.data;
  },
};
