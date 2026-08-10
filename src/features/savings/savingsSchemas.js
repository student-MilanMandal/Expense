import { z } from 'zod';

export const savingsSchema = z.object({
  title: z.string().min(1, 'Goal title is required'),
  targetAmount: z.coerce.number().min(1, 'Target amount must be greater than 0'),
  targetDate: z.string().min(1, 'Target deadline date is required'),
  category: z.string().default('General'),
  initialContribution: z.coerce.number().min(0).default(0),
});
