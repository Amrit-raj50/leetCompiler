import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { isDbConnected } from '../config/db.js';

export const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  req.user = null;
  req.isIntegrated = false;

  if (token) {
    const jwtSecret = process.env.JWT_SECRET || 'leetcompiler_default_secret_key';
    try {
      const decoded = jwt.verify(token, jwtSecret);
      req.userId = decoded.userId || decoded.id || decoded._id;

      if (req.userId && isDbConnected()) {
        const user = await User.findById(req.userId);
        if (user) {
          req.user = user;
          req.isIntegrated = true;
        }
      } else if (req.userId) {
        // If JWT is valid but DB is disabled/mocked
        req.isIntegrated = true;
      }
    } catch (err) {
      console.log('⚠️ Invalid JWT provided, continuing in standalone mode:', err.message);
    }
  }

  next();
};

export const requireAuth = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: JWT token required for integrated mode',
      mode: 'standalone',
    });
  }

  const jwtSecret = process.env.JWT_SECRET || 'leetcompiler_default_secret_key';
  try {
    const decoded = jwt.verify(token, jwtSecret);
    const userId = decoded.userId || decoded.id || decoded._id;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Invalid token payload' });
    }

    if (isDbConnected()) {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, error: 'User account not found' });
      }
      req.user = user;
    }

    req.userId = userId;
    req.isIntegrated = true;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: `Unauthorized: ${err.message}`,
    });
  }
};
