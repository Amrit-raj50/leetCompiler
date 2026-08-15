import mongoose from 'mongoose';

const FeedbackSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: 'Anonymous Coder',
      trim: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
      default: 5,
    },
    mode: {
      type: String,
      enum: ['integrated', 'standalone'],
      default: 'standalone',
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
    device: {
      type: String,
      default: 'Desktop / Laptop',
    },
  },
  {
    timestamps: true,
  }
);

export const Feedback = mongoose.model('Feedback', FeedbackSchema);
