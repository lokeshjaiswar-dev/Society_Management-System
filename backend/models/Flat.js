import mongoose from 'mongoose';

const flatSchema = new mongoose.Schema({
  wing: {
    type: String,
    required: true,
    set: function(wing) {
      if (typeof wing === 'string') {
        return wing.toUpperCase(); // Perfect for single letters
      }
      return wing;
    }
  },
  flatNo: {
    type: String,
    required: true,
    // unique: true
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

flatSchema.index({ wing: 1, flatNo: 1 }, { unique: true });

export default mongoose.model('Flat', flatSchema);