import mongoose from 'mongoose';

const maintenanceSchema = new mongoose.Schema({
  residentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  wing: {
    type: String,
    required: true
  },
  flatNo: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  month: {
    type: String,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'overdue'],
    default: 'pending'
  },
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpayOrderDetails: mongoose.Schema.Types.Mixed, // ADD THIS
  paymentDate: Date,
  paymentStatus: { // ADD THIS FIELD
    type: String,
    enum: ['authorized', 'captured', 'failed', 'pending'],
    default: 'pending'
  }
}, {
  timestamps: true
});

export default mongoose.model('Maintenance', maintenanceSchema);