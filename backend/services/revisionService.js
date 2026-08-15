import { User } from '../models/User.js';
import { SavedSnippet } from '../models/SavedSnippet.js';
import { isDbConnected } from '../config/db.js';

export const updateRevisionStatus = async (userId, questionSlug, latestCode = '', language = '') => {
  if (!isDbConnected() || !userId || !questionSlug) {
    return { success: false, reason: 'Database not connected or invalid user/question' };
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return { success: false, reason: 'User not found' };
    }

    const existingRevision = user.revisions.find((r) => r.questionSlug === questionSlug);
    const now = new Date();

    if (existingRevision) {
      existingRevision.status = 'solved';
      existingRevision.solvedCount = (existingRevision.solvedCount || 0) + 1;
      existingRevision.lastSolvedAt = now;
      if (latestCode) existingRevision.latestCode = latestCode;
      if (language) existingRevision.language = language;
      const intervalDays = Math.min(14, Math.pow(2, existingRevision.solvedCount));
      existingRevision.nextRevisionDate = new Date(now.getTime() + intervalDays * 24 * 60 * 60 * 1000);
    } else {
      user.revisions.push({
        questionSlug,
        status: 'solved',
        solvedCount: 1,
        lastSolvedAt: now,
        nextRevisionDate: new Date(now.getTime() + 24 * 60 * 60 * 1000),
        latestCode,
        language,
      });
    }

    // Update streak if active on a new day
    const lastActive = user.lastActiveDate ? new Date(user.lastActiveDate) : null;
    if (lastActive) {
      const diffHours = (now - lastActive) / (1000 * 60 * 60);
      if (diffHours >= 20 && diffHours <= 48) {
        user.streak = (user.streak || 0) + 1;
      } else if (diffHours > 48) {
        user.streak = 1;
      }
    }
    user.lastActiveDate = now;

    await user.save();
    return {
      success: true,
      streak: user.streak,
      questionSlug,
      status: 'solved',
    };
  } catch (error) {
    console.error('Error updating revision status:', error);
    return { success: false, error: error.message };
  }
};

export const saveUserCode = async ({ userId, questionSlug, language, code, executionTimeMs, memoryMb, allPassed, notes = '' }) => {
  if (!isDbConnected()) {
    return { success: false, reason: 'Database not connected' };
  }

  try {
    const snippetData = {
      userId: userId || 'anonymous',
      questionSlug,
      language,
      code,
      executionTimeMs,
      memoryMb,
      allPassed: !!allPassed,
      notes,
    };

    // 1. Save to SavedSnippet collection
    const snippet = await SavedSnippet.create(snippetData);

    // 2. If user exists, also push to user's savedCodes array
    if (userId && userId !== 'anonymous') {
      const user = await User.findById(userId);
      if (user) {
        user.savedCodes = user.savedCodes || [];
        user.savedCodes.unshift({
          questionSlug,
          language,
          code,
          executionTimeMs,
          memoryMb,
          allPassed,
          notes,
          savedAt: new Date(),
        });
        // Limit saved codes history to 50
        if (user.savedCodes.length > 50) {
          user.savedCodes = user.savedCodes.slice(0, 50);
        }
        await user.save();
      }
    }

    return {
      success: true,
      snippetId: snippet._id,
      savedAt: snippet.createdAt,
      message: 'Code saved successfully to database',
    };
  } catch (error) {
    console.error('Error saving user code:', error);
    return { success: false, error: error.message };
  }
};

export const getSavedCodes = async (userId, questionSlug) => {
  if (!isDbConnected()) {
    return { success: false, snippets: [], reason: 'Database not connected' };
  }

  try {
    const query = {};
    if (userId && userId !== 'anonymous') {
      query.userId = userId;
    }
    if (questionSlug) {
      query.questionSlug = questionSlug;
    }

    const snippets = await SavedSnippet.find(query).sort({ createdAt: -1 }).limit(20);
    return {
      success: true,
      snippets,
    };
  } catch (error) {
    console.error('Error getting saved codes:', error);
    return { success: false, error: error.message, snippets: [] };
  }
};
