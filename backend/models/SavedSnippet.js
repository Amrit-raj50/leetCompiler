import mongoose from 'mongoose';

const savedSnippetSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      index: true,
    },
    questionSlug: {
      type: String,
      required: true,
      index: true,
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
    title: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

export const SavedSnippet = mongoose.models.SavedSnippet || mongoose.model('SavedSnippet', savedSnippetSchema);
export default SavedSnippet;
