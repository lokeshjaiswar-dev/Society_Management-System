import mongoose from 'mongoose';

const flatSchema = new mongoose.Schema({
  wing: {
    type: String,
    required: true
  },
  flatNo: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['occupied', 'vacant'],
    default: 'vacant'
  },
  ownerName: {
    type: String,
    default: ''
  },
  residentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isTenant: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

export default mongoose.model('Flat', flatSchema);