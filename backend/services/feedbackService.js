import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Feedback } from '../models/Feedback.js';
import { isDbConnected } from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const README_PATH = path.join(__dirname, '..', '..', 'README.md');

/**
 * Saves feedback to DB and appends to the README.md feedback section
 */
export const saveFeedbackAndSyncReadme = async ({
  name = 'Anonymous Coder',
  rating = 5,
  mode = 'standalone',
  comment,
  device = 'Web'
}) => {
  let savedDoc = null;

  if (isDbConnected()) {
    try {
      savedDoc = await Feedback.create({
        name: name || 'Anonymous Coder',
        rating: Number(rating) || 5,
        mode,
        comment,
        device
      });
    } catch (err) {
      console.error('Error saving feedback to MongoDB:', err.message);
    }
  }

  // Format star rating
  const stars = '⭐'.repeat(Math.max(1, Math.min(5, Number(rating) || 5)));
  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  const entryMarkdown = `| **${name || 'Anonymous Coder'}** | ${stars} | \`${mode}\` | "${comment.replace(/\n/g, ' ')}" | _${dateStr}_ |\n`;

  // Update README.md file
  try {
    let readmeContent = await fs.readFile(README_PATH, 'utf8');

    const feedbackSectionHeader = '## 💬 Community & User Feedback';
    if (!readmeContent.includes(feedbackSectionHeader)) {
      readmeContent += `\n\n---\n\n${feedbackSectionHeader}\n\n*Real-time feedback submitted by developers on every 10th execution:*\n\n| Developer | Rating | Mode | Feedback / Comments | Date |\n|---|---|---|---|---|\n`;
    }

    // Append new feedback entry right after table header
    const tableHeader = '| Developer | Rating | Mode | Feedback / Comments | Date |\n|---|---|---|---|---|\n';
    if (readmeContent.includes(tableHeader)) {
      readmeContent = readmeContent.replace(tableHeader, `${tableHeader}${entryMarkdown}`);
    } else {
      readmeContent += entryMarkdown;
    }

    await fs.writeFile(README_PATH, readmeContent, 'utf8');
  } catch (fsErr) {
    console.error('Error updating README.md with feedback:', fsErr.message);
  }

  return {
    success: true,
    message: 'Thank you for your feedback! It has been recorded and added to the project README.',
    feedback: savedDoc
  };
};

/**
 * Fetches recent feedback entries
 */
export const getRecentFeedbacks = async (limit = 20) => {
  if (isDbConnected()) {
    try {
      return await Feedback.find().sort({ createdAt: -1 }).limit(limit);
    } catch (err) {
      console.error('Error fetching feedbacks:', err);
    }
  }
  return [];
};
