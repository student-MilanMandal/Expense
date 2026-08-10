import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { expenseService } from '../../services/expenseService';
import { toast } from 'react-toastify';

export const EXPENSES_QUERY_KEY = 'expenses';

export const useExpensesQuery = (params = {}) => {
  return useQuery({
    queryKey: [EXPENSES_QUERY_KEY, params],
    queryFn: () => expenseService.getExpenses(params),
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 60 * 3,
  });
};

export const useAddExpenseMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData) => expenseService.addExpense(formData),
    onSuccess: () => {
      toast.success('Expense recorded successfully');
      queryClient.invalidateQueries({ queryKey: [EXPENSES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to record expense');
    },
  });
};

export const useUpdateExpenseMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, formData }) => expenseService.updateExpense(id, formData),
    onSuccess: () => {
      toast.success('Expense entry updated successfully');
      queryClient.invalidateQueries({ queryKey: [EXPENSES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update expense');
    },
  });
};

export const useDeleteExpenseMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => expenseService.deleteExpense(id),
    onSuccess: () => {
      toast.success('Expense deleted successfully');
      queryClient.invalidateQueries({ queryKey: [EXPENSES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete expense');
    },
  });
};
