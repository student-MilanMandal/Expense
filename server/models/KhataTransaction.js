import mongoose from 'mongoose';

const khataTransactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'KhataCustomer',
      required: true,
    },
    type: {
      type: String,
      enum: ['CREDIT_GIVEN', 'PAYMENT_RECEIVED'],
      required: [true, 'Transaction type is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than zero'],
    },
    date: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      default: '',
    },
    receiptAttachment: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const KhataTransaction = mongoose.model('KhataTransaction', khataTransactionSchema);
export default KhataTransaction;
