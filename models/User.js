import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxlength: 60,
    minlength: 2
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: true
  },
  address: {
    type: String,
    maxlength: 400
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'store_owner'],
    default: 'user'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for faster email lookups
userSchema.index({ email: 1 });

export default mongoose.model('User', userSchema);