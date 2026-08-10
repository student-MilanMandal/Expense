import mongoose from 'mongoose';

const incomeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: [true, 'Please add an income amount'],
      min: [0, 'Amount must be positive'],
    },
    source: {
      type: String,
      required: [true, 'Please add an income source'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please specify a category'],
      enum: ['Salary', 'Freelancing', 'Business', 'Investment', 'Bonus', 'Rental', 'Gifts', 'Others'],
      default: 'Others',
    },
    date: {
      type: Date,
      default: Date.now,
    },
    paymentMethod: {
      type: String,
      enum: ['Cash', 'Bank Transfer', 'UPI', 'Cheque', 'Card', 'Other'],
      default: 'Bank Transfer',
    },
    notes: {
      type: String,
      default: '',
    },
    attachment: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

incomeSchema.index({ user: 1, date: -1 });
incomeSchema.index({ user: 1, category: 1 });

const Income = mongoose.model('Income', incomeSchema);
export default Income;
