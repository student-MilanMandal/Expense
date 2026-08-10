import { z } from 'zod';

export const incomeSchema = z.object({
  amount: z.coerce.number().min(0.01, 'Amount must be greater than 0'),
  source: z.string().min(1, 'Income source is required').trim(),
  category: z.string().min(1, 'Category is required'),
  date: z.string().min(1, 'Date is required'),
  paymentMethod: z.string().min(1, 'Payment method is required'),
  notes: z.string().optional(),
});
