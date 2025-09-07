import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  store_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound index to prevent duplicate ratings
ratingSchema.index({ user_id: 1, store_id: 1 }, { unique: true });

// Virtuals for population (optional if using populate directly)
ratingSchema.virtual('user', {
  ref: 'User',
  localField: 'user_id',
  foreignField: '_id',
  justOne: true
});

ratingSchema.virtual('store', {
  ref: 'Store',
  localField: 'store_id',
  foreignField: '_id',
  justOne: true
});

export default mongoose.model('Rating', ratingSchema);