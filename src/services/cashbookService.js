import axiosClient from '../api/axiosClient';

export const cashbookService = {
  getCashbook: async (params = {}) => {
    const response = await axiosClient.get('/cashbook/getDailySummary', { params });
    return response.data;
  },

  addEntry: async (entryData) => {
    const response = await axiosClient.post('/cashbook/addCashEntry', entryData);
    return response.data;
  },
};
