import { z } from 'zod';

export const loanSchema = z.object({
  personName: z.string().min(1, 'Person name is required'),
  type: z.enum(['LENT', 'BORROWED']),
  amount: z.coerce.number().min(1, 'Amount must be greater than 0'),
  interestRate: z.coerce.number().min(0).default(0),
  dueDate: z.string().min(1, 'Due date is required'),
  notes: z.string().optional(),
});
