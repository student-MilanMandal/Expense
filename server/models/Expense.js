import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: [true, 'Please add an expense amount'],
      min: [0, 'Amount must be positive'],
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      enum: [
        'Food',
        'Grocery',
        'Shopping',
        'EMI',
        'Electricity',
        'Gas',
        'Water',
        'Internet',
        'Mobile Recharge',
        'Fuel',
        'Travel',
        'Entertainment',
        'Education',
        'Medical',
        'Rent',
        'Insurance',
        'Investment',
        'Misc',
      ],
      default: 'Misc',
    },
    date: {
      type: Date,
      default: Date.now,
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
      trim: true,
    },
    paymentMethod: {
      type: String,
      enum: ['Cash', 'Credit Card', 'Debit Card', 'UPI', 'Net Banking', 'Other'],
      default: 'UPI',
    },
    notes: {
      type: String,
      default: '',
    },
    receiptUrl: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

expenseSchema.index({ user: 1, date: -1 });
expenseSchema.index({ user: 1, category: 1 });

const Expense = mongoose.model('Expense', expenseSchema);
export default Expense;
