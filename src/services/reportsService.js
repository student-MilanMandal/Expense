import axiosClient from '../api/axiosClient';

export const reportsService = {
  getSummaryReport: async (params = {}) => {
    const response = await axiosClient.get('/reports/generateReport', { params });
    return response.data;
  },

  exportCSV: async (params = {}) => {
    const response = await axiosClient.get('/reports/generateReport', {
      params: { ...params, format: 'csv' },
      responseType: 'blob',
    });
    return response.data;
  },
};
