import { z } from 'zod';

export const budgetSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  amount: z.coerce.number().min(1, 'Budget limit must be greater than 0'),
  period: z.enum(['monthly', 'weekly']),
  alertThreshold: z.coerce.number().min(50).max(100).default(80),
});
