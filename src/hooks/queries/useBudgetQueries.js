import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { budgetService } from '../../services/budgetService';
import { toast } from 'react-toastify';

export const BUDGETS_KEY = 'budgets';

export const useBudgetsQuery = (params = {}) => {
  return useQuery({
    queryKey: [BUDGETS_KEY, params],
    queryFn: () => budgetService.getBudgets(params),
    staleTime: 1000 * 60 * 5,
  });
};

export const useCreateBudgetMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (budgetData) => budgetService.createBudget(budgetData),
    onSuccess: () => {
      toast.success('Budget cap configured successfully');
      queryClient.invalidateQueries({ queryKey: [BUDGETS_KEY] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create budget');
    },
  });
};

export const useDeleteBudgetMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => budgetService.deleteBudget(id),
    onSuccess: () => {
      toast.success('Budget removed successfully');
      queryClient.invalidateQueries({ queryKey: [BUDGETS_KEY] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete budget');
    },
  });
};
