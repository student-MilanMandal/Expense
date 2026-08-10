import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { incomeService } from '../../services/incomeService';
import { toast } from 'react-toastify';

export const INCOMES_QUERY_KEY = 'incomes';

export const useIncomesQuery = (params = {}) => {
  return useQuery({
    queryKey: [INCOMES_QUERY_KEY, params],
    queryFn: () => incomeService.getIncomes(params),
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 60 * 3,
  });
};

export const useAddIncomeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData) => incomeService.addIncome(formData),
    onSuccess: () => {
      toast.success('Income logged successfully');
      queryClient.invalidateQueries({ queryKey: [INCOMES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to record income');
    },
  });
};

export const useUpdateIncomeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, formData }) => incomeService.updateIncome(id, formData),
    onSuccess: () => {
      toast.success('Income record updated successfully');
      queryClient.invalidateQueries({ queryKey: [INCOMES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update income');
    },
  });
};

export const useDeleteIncomeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => incomeService.deleteIncome(id),
    onSuccess: () => {
      toast.success('Income record deleted successfully');
      queryClient.invalidateQueries({ queryKey: [INCOMES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete income');
    },
  });
};
