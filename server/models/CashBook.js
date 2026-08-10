import mongoose from 'mongoose';

const cashEntrySubSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['IN', 'OUT'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      default: 'Daily Operations',
    },
    notes: {
      type: String,
      default: '',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const cashBookSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: () => new Date().setHours(0, 0, 0, 0),
    },
    openingBalance: {
      type: Number,
      default: 0,
    },
    cashIn: {
      type: Number,
      default: 0,
    },
    cashOut: {
      type: Number,
      default: 0,
    },
    closingBalance: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      default: '',
    },
    entries: [cashEntrySubSchema],
  },
  {
    timestamps: true,
  }
);

cashBookSchema.index({ user: 1, date: 1 }, { unique: true });

const CashBook = mongoose.model('CashBook', cashBookSchema);
export default CashBook;
