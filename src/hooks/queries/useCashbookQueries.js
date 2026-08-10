import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cashbookService } from '../../services/cashbookService';
import { toast } from 'react-toastify';

export const CASHBOOK_KEY = 'cashbook';

export const useCashbookQuery = (params = {}) => {
  return useQuery({
    queryKey: [CASHBOOK_KEY, params],
    queryFn: () => cashbookService.getCashbook(params),
    staleTime: 1000 * 60 * 3,
  });
};

export const useAddCashbookEntryMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (entryData) => cashbookService.addEntry(entryData),
    onSuccess: () => {
      toast.success('Cash entry recorded successfully');
      queryClient.invalidateQueries({ queryKey: [CASHBOOK_KEY] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to record cash entry');
    },
  });
};
