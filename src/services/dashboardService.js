import axiosClient from '../api/axiosClient';

export const dashboardService = {
  getSummary: async (params = {}) => {
    const response = await axiosClient.get('/dashboard/getSummary', { params });
    return response.data;
  },

  getAnalytics: async (params = {}) => {
    const response = await axiosClient.get('/analytics/getSummary', { params });
    return response.data;
  },
};
