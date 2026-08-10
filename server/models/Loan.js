import mongoose from 'mongoose';

const paymentHistorySchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  notes: {
    type: String,
    default: '',
  },
});

const loanSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['LENT', 'BORROWED'],
      required: [true, 'Loan type is required (LENT or BORROWED)'],
    },
    personName: {
      type: String,
      required: [true, 'Please specify person name'],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Please specify principal loan amount'],
      min: [1, 'Amount must be greater than zero'],
    },
    interestRate: {
      type: Number,
      default: 0,
    },
    emiAmount: {
      type: Number,
      default: 0,
    },
    dueDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['PENDING', 'PARTIAL', 'PAID'],
      default: 'PENDING',
    },
    notes: {
      type: String,
      default: '',
    },
    paymentHistory: [paymentHistorySchema],
  },
  {
    timestamps: true,
  }
);

const Loan = mongoose.model('Loan', loanSchema);
export default Loan;
