import axiosClient from '../api/axiosClient';

export const khataService = {
  getCustomers: async (params = {}) => {
    const response = await axiosClient.get('/khata/getAllCustomers', { params });
    return response.data;
  },

  addCustomer: async (customerData) => {
    const response = await axiosClient.post('/khata/addCustomer', customerData);
    return response.data;
  },

  updateCustomer: async (customerId, customerData) => {
    const response = await axiosClient.put(`/khata/updateCustomer/${customerId}`, customerData);
    return response.data;
  },

  deleteCustomer: async (customerId) => {
    const response = await axiosClient.delete(`/khata/deleteCustomer/${customerId}`);
    return response.data;
  },

  addTransaction: async (txnData) => {
    const response = await axiosClient.post('/khata/addTransaction', txnData);
    return response.data;
  },

  getCustomerTransactions: async (customerId) => {
    const response = await axiosClient.get(`/khata/getCustomerTransactions/${customerId}`);
    return response.data;
  },
};
