import axiosClient from '../api/axiosClient';

export const authService = {
  login: async (credentials) => {
    const response = await axiosClient.post('/auth/login', credentials);
    return response.data;
  },

  register: async (userData) => {
    const response = await axiosClient.post('/auth/register', userData);
    return response.data;
  },

  sendOTP: async (email) => {
    const response = await axiosClient.post('/auth/send-otp', { email });
    return response.data;
  },

  verifyOTP: async (otpData) => {
    const response = await axiosClient.post('/auth/verify-otp', otpData);
    return response.data;
  },

  resetPassword: async (resetData) => {
    const response = await axiosClient.post('/auth/reset-password', resetData);
    return response.data;
  },

  changePassword: async (passwordData) => {
    const response = await axiosClient.post('/auth/changePassword', passwordData);
    return response.data;
  },

  updateProfile: async (formData) => {
    const response = await axiosClient.put('/auth/updateProfile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getProfile: async () => {
    const response = await axiosClient.get('/auth/me');
    return response.data;
  },
};
