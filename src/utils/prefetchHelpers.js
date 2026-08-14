/**
 * User Intent Prefetching Helper for TanStack Query & Route Components
 * Prefetches server state & lazy JS chunks when user hovers or focuses navigation links.
 */

import { incomeService } from '../services/incomeService';
import { expenseService } from '../services/expenseService';
import { budgetService } from '../services/budgetService';
import { savingsService } from '../services/savingsService';
import { loanService } from '../services/loanService';
import { khataService } from '../services/khataService';
import { cashbookService } from '../services/cashbookService';
import { dashboardService } from '../services/dashboardService';

// Track already prefetched paths to prevent duplicate network calls
const prefetchedPaths = new Set();

/**
 * Prefetch component code and query data based on user hover/focus
 * @param {import('@tanstack/react-query').QueryClient} queryClient
 * @param {string} path - e.g. '/incomes', '/expenses', '/dashboard'
 */
export const prefetchRoute = (queryClient, path) => {
  if (!path || !queryClient) return;

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  switch (path) {
    case '/dashboard':
      // Prefetch component
      import('../pages/Dashboard');
      // Prefetch data
      queryClient.prefetchQuery({
        queryKey: ['dashboardSummary', currentYear, currentMonth],
        queryFn: () => dashboardService.getSummary({ year: currentYear, month: currentMonth }),
        staleTime: 60 * 1000,
      });
      break;

    case '/incomes':
      import('../pages/Incomes');
      queryClient.prefetchQuery({
        queryKey: ['incomes', 1, 10, ''],
        queryFn: () => incomeService.getAllIncomes({ page: 1, limit: 10 }),
        staleTime: 60 * 1000,
      });
      break;

    case '/expenses':
      import('../pages/Expenses');
      queryClient.prefetchQuery({
        queryKey: ['expenses', 1, 10, ''],
        queryFn: () => expenseService.getAllExpenses({ page: 1, limit: 10 }),
        staleTime: 60 * 1000,
      });
      break;

    case '/budgets':
      import('../pages/Budgets');
      queryClient.prefetchQuery({
        queryKey: ['budgets'],
        queryFn: () => budgetService.getBudgetStatus(),
        staleTime: 60 * 1000,
      });
      break;

    case '/savings':
      import('../pages/SavingsGoals');
      queryClient.prefetchQuery({
        queryKey: ['savingsGoals'],
        queryFn: () => savingsService.getAllGoals(),
        staleTime: 60 * 1000,
      });
      break;

    case '/loans':
      import('../pages/Loans');
      queryClient.prefetchQuery({
        queryKey: ['loans', ''],
        queryFn: () => loanService.getAllLoans(),
        staleTime: 60 * 1000,
      });
      break;

    case '/khata':
      import('../pages/KhataBook');
      queryClient.prefetchQuery({
        queryKey: ['khataCustomers', ''],
        queryFn: () => khataService.getAllCustomers(),
        staleTime: 60 * 1000,
      });
      break;

    case '/cashbook':
      import('../pages/CashBook');
      queryClient.prefetchQuery({
        queryKey: ['cashbookDaily', `${currentYear}-${String(currentMonth).padStart(2, '0')}`],
        queryFn: () => cashbookService.getDailySummary(),
        staleTime: 60 * 1000,
      });
      break;

    case '/analytics':
      import('../pages/Analytics');
      queryClient.prefetchQuery({
        queryKey: ['analyticsSummary'],
        queryFn: () => dashboardService.getAnalyticsSummary(),
        staleTime: 60 * 1000,
      });
      break;

    case '/reports':
      import('../pages/Reports');
      break;

    case '/history':
      import('../pages/TransactionHistory');
      break;

    case '/settings':
      import('../pages/ProfileSettings');
      break;

    default:
      break;
  }
};
