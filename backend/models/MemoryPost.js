import mongoose from 'mongoose';

const memoryPostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  images: [{
    url: String,
    public_id: String
  }],
  eventDate: Date,
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    text: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

export default mongoose.model('MemoryPost', memoryPostSchema);