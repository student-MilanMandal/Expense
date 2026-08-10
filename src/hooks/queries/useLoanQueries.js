import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { loanService } from '../../services/loanService';
import { toast } from 'react-toastify';

export const LOANS_KEY = 'loans';

export const useLoansQuery = (params = {}) => {
  return useQuery({
    queryKey: [LOANS_KEY, params],
    queryFn: () => loanService.getLoans(params),
    staleTime: 1000 * 60 * 5,
  });
};

export const useCreateLoanMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (loanData) => loanService.createLoan(loanData),
    onSuccess: () => {
      toast.success('Loan record added');
      queryClient.invalidateQueries({ queryKey: [LOANS_KEY] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to add loan');
    },
  });
};

export const useRecordEMIPaymentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, paymentData }) => loanService.recordEMIPayment(id, paymentData),
    onSuccess: () => {
      toast.success('EMI payment recorded successfully');
      queryClient.invalidateQueries({ queryKey: [LOANS_KEY] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to record EMI payment');
    },
  });
};

export const useDeleteLoanMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => loanService.deleteLoan(id),
    onSuccess: () => {
      toast.success('Loan record deleted');
      queryClient.invalidateQueries({ queryKey: [LOANS_KEY] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete loan');
    },
  });
};
