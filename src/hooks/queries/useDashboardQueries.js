import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../../services/dashboardService';
import axiosClient from '../../api/axiosClient';

export const DASHBOARD_QUERY_KEY = 'dashboard';
export const ANALYTICS_QUERY_KEY = 'analytics';

export const useDashboardQuery = (params = {}) => {
  return useQuery({
    queryKey: [DASHBOARD_QUERY_KEY, params],
    queryFn: () => dashboardService.getSummary(params),
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 60 * 3,
  });
};

export const useAnalyticsQuery = (params = {}) => {
  return useQuery({
    queryKey: [ANALYTICS_QUERY_KEY, params],
    queryFn: async () => {
      const [incRes, catRes, savRes] = await Promise.all([
        axiosClient.get('/analytics/getIncomeVsExpense', { params }),
        axiosClient.get('/analytics/getCategorySpending', { params }),
        axiosClient.get('/analytics/getSavingsTrend', { params }),
      ]);
      return {
        data: {
          incVsExp: incRes.data?.success ? incRes.data.data : null,
          catSpending: catRes.data?.success ? catRes.data.data : null,
          savingsTrend: savRes.data?.success ? savRes.data.data : null,
        },
      };
    },
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 60 * 3,
  });
};
