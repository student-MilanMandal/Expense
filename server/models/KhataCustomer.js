import mongoose from 'mongoose';

const khataCustomerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Please add customer name'],
      trim: true,
    },
    mobile: {
      type: String,
      required: [true, 'Please add customer mobile number'],
      trim: true,
    },
    address: {
      type: String,
      default: '',
    },
    totalCreditGiven: {
      type: Number,
      default: 0,
    },
    totalPaymentReceived: {
      type: Number,
      default: 0,
    },
    netBalance: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const KhataCustomer = mongoose.model('KhataCustomer', khataCustomerSchema);
export default KhataCustomer;
