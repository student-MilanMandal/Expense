import { z } from 'zod';

export const expenseSchema = z.object({
  amount: z.coerce.number().min(0.01, 'Amount must be greater than 0'),
  description: z.string().min(1, 'Description is required').trim(),
  category: z.string().min(1, 'Category is required'),
  date: z.string().min(1, 'Date is required'),
  paymentMethod: z.string().min(1, 'Payment method is required'),
  notes: z.string().optional(),
});
