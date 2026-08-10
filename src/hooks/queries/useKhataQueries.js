import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { khataService } from '../../services/khataService';
import { toast } from 'react-toastify';

export const KHATA_CUSTOMERS_KEY = 'khataCustomers';

export const useKhataCustomersQuery = (params = {}) => {
  return useQuery({
    queryKey: [KHATA_CUSTOMERS_KEY, params],
    queryFn: () => khataService.getCustomers(params),
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 60 * 3,
  });
};

export const useAddKhataCustomerMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (customerData) => khataService.addCustomer(customerData),
    onSuccess: () => {
      toast.success('Customer added to Khata Book');
      queryClient.invalidateQueries({ queryKey: [KHATA_CUSTOMERS_KEY] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to add customer');
    },
  });
};

export const useUpdateKhataCustomerMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, customerData }) => khataService.updateCustomer(id, customerData),
    onSuccess: () => {
      toast.success('Customer details updated');
      queryClient.invalidateQueries({ queryKey: [KHATA_CUSTOMERS_KEY] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update customer');
    },
  });
};

export const useDeleteKhataCustomerMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => khataService.deleteCustomer(id),
    onSuccess: () => {
      toast.success('Customer removed from Khata Book');
      queryClient.invalidateQueries({ queryKey: [KHATA_CUSTOMERS_KEY] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete customer');
    },
  });
};

export const useAddKhataTransactionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (txnData) => khataService.addTransaction(txnData),
    onSuccess: () => {
      toast.success('Khata transaction recorded successfully');
      queryClient.invalidateQueries({ queryKey: [KHATA_CUSTOMERS_KEY] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to record transaction');
    },
  });
};
