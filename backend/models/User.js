import mongoose from 'mongoose';

const savedCodeSchema = new mongoose.Schema({
  questionSlug: {
    type: String,
    required: true,
  },
  language: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  executionTimeMs: {
    type: Number,
  },
  memoryMb: {
    type: Number,
  },
  allPassed: {
    type: Boolean,
    default: false,
  },
  notes: {
    type: String,
    default: '',
  },
  savedAt: {
    type: Date,
    default: Date.now,
  },
});

const revisionSchema = new mongoose.Schema({
  questionSlug: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['unsolved', 'solved', 'reviewing', 'mastered'],
    default: 'solved',
  },
  solvedCount: {
    type: Number,
    default: 1,
  },
  lastSolvedAt: {
    type: Date,
    default: Date.now,
  },
  nextRevisionDate: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
  },
  latestCode: {
    type: String,
  },
  language: {
    type: String,
  },
});

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      sparse: true,
    },
    username: {
      type: String,
    },
    streak: {
      type: Number,
      default: 1,
    },
    lastActiveDate: {
      type: Date,
      default: Date.now,
    },
    revisions: [revisionSchema],
    savedCodes: [savedCodeSchema],
  },
  { timestamps: true, strict: false }
);

export const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
