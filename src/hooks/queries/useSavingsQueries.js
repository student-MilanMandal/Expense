import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { savingsService } from '../../services/savingsService';
import { toast } from 'react-toastify';

export const SAVINGS_KEY = 'savings';

export const useSavingsQuery = () => {
  return useQuery({
    queryKey: [SAVINGS_KEY],
    queryFn: () => savingsService.getGoals(),
    staleTime: 1000 * 60 * 5,
  });
};

export const useCreateSavingsGoalMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (goalData) => savingsService.createGoal(goalData),
    onSuccess: () => {
      toast.success('Savings Goal created successfully');
      queryClient.invalidateQueries({ queryKey: [SAVINGS_KEY] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create savings goal');
    },
  });
};

export const useContributeSavingsGoalMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, amount }) => savingsService.addContribution(id, { amount }),
    onSuccess: () => {
      toast.success('Contribution added to savings goal');
      queryClient.invalidateQueries({ queryKey: [SAVINGS_KEY] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to add contribution');
    },
  });
};

export const useDeleteSavingsGoalMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => savingsService.deleteGoal(id),
    onSuccess: () => {
      toast.success('Savings goal deleted');
      queryClient.invalidateQueries({ queryKey: [SAVINGS_KEY] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete goal');
    },
  });
};
