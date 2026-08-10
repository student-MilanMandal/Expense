import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      required: [true, 'Please select a category for budget'],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Please set budget limit amount'],
      min: [1, 'Budget limit must be greater than zero'],
    },
    period: {
      type: String,
      enum: ['weekly', 'monthly'],
      default: 'monthly',
    },
    startDate: {
      type: Date,
      default: function () {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), 1);
      },
    },
    endDate: {
      type: Date,
      default: function () {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      },
    },
    alertThreshold: {
      type: Number,
      default: 80, // % threshold warning
      min: 1,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

budgetSchema.index({ user: 1, category: 1, period: 1 }, { unique: true });

const Budget = mongoose.model('Budget', budgetSchema);
export default Budget;
