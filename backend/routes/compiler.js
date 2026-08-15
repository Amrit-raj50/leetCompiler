import express from 'express';
import { runCode } from '../services/compilerService.js';
import { updateRevisionStatus, saveUserCode, getSavedCodes } from '../services/revisionService.js';
import { optionalAuth, requireAuth } from '../middleware/auth.js';
import { isDbConnected } from '../config/db.js';

const router = express.Router();

// Status & Health Check
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'LeetCompiler Dual-Mode Runner & Code Storage',
    dbConnected: isDbConnected(),
    modes: ['standalone', 'integrated'],
    timestamp: new Date().toISOString(),
  });
});

/**
 * ⚡ Route 1: Dual-Mode Dynamic Runner (POST /api/compiler/run)
 */
router.post('/run', optionalAuth, async (req, res) => {
  const { code, language, questionSlug = 'scratchpad', testCases } = req.body;

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid "code" parameter in request body' });
  }

  try {
    const result = await runCode(code, language, questionSlug, testCases);

    let revisionUpdate = null;
    let message = '🔓 Running in standalone mode. No data saved.';

    if (req.isIntegrated) {
      if (result.allPassed) {
        if (req.userId && questionSlug) {
          revisionUpdate = await updateRevisionStatus(req.userId, questionSlug, code, language);
        }
        message = '✅ Passed! Revision marked as solved in your account!';
      } else {
        message = '❌ Tests failed. Revision not marked as solved.';
      }
    }

    return res.json({
      success: true,
      mode: req.isIntegrated ? 'integrated' : 'standalone',
      message,
      revisionUpdate,
      ...result,
    });
  } catch (error) {
    console.error('Compiler run error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal compiler error',
    });
  }
});

/**
 * 💾 Route 2: Explicitly Save Code to MongoDB (POST /api/compiler/save)
 */
router.post('/save', optionalAuth, async (req, res) => {
  const { code, language, questionSlug = 'scratchpad', executionTimeMs, memoryMb, allPassed, notes } = req.body;

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ success: false, error: 'Code is required to save' });
  }

  try {
    const saveResult = await saveUserCode({
      userId: req.userId || 'anonymous',
      questionSlug,
      language: language || 'javascript',
      code,
      executionTimeMs,
      memoryMb,
      allPassed,
      notes,
    });

    return res.json({
      ...saveResult,
      mode: req.isIntegrated ? 'integrated' : 'standalone',
    });
  } catch (error) {
    console.error('Save code error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to save code to database',
    });
  }
});

/**
 * 📂 Route 3: Retrieve Saved Code Snippets (GET /api/compiler/saved & GET /api/compiler/saved/:questionSlug)
 */
router.get('/saved', optionalAuth, async (req, res) => {
  try {
    const result = await getSavedCodes(req.userId, req.query.questionSlug);
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/saved/:questionSlug', optionalAuth, async (req, res) => {
  try {
    const result = await getSavedCodes(req.userId, req.params.questionSlug);
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 🔐 Route 4: Strict Integrated Runner (POST /api/compiler/run-integrated)
 */
router.post('/run-integrated', requireAuth, async (req, res) => {
  const { code, language, questionSlug = 'two-sum', testCases } = req.body;

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid "code" parameter' });
  }

  try {
    const result = await runCode(code, language, questionSlug, testCases);
    let revisionUpdate = null;

    if (result.allPassed) {
      revisionUpdate = await updateRevisionStatus(req.userId, questionSlug, code, language);
    }

    return res.json({
      success: true,
      mode: 'integrated',
      message: result.allPassed
        ? '✅ Passed! Revision marked as solved in your account!'
        : '❌ Tests failed. Revision not marked as solved.',
      revisionUpdate,
      ...result,
    });
  } catch (error) {
    console.error('Compiler run-integrated error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal compiler error',
    });
  }
});

export default router;
