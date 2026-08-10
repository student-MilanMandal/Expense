import axiosClient from '../api/axiosClient';

export const loanService = {
  getLoans: async (params = {}) => {
    const response = await axiosClient.get('/loans/getAllLoans', { params });
    return response.data;
  },

  createLoan: async (loanData) => {
    const response = await axiosClient.post('/loans/createLoan', loanData);
    return response.data;
  },

  recordEMIPayment: async (id, paymentData) => {
    const response = await axiosClient.post(`/loans/payEMI/${id}`, paymentData);
    return response.data;
  },

  deleteLoan: async (id) => {
    const response = await axiosClient.delete(`/loans/deleteLoan/${id}`);
    return response.data;
  },
};
