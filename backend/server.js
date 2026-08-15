import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import compilerRoutes from './routes/compiler.js';
import { connectDB } from './config/db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Connect to MongoDB if configured (optional for integrated mode)
connectDB();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Sanitize double slashes in URLs (e.g. //run -> /run)
app.use((req, res, next) => {
  req.url = req.url.replace(/\/{2,}/g, '/');
  next();
});

// Request Logger
app.use((req, res, next) => {
  const authHeader = req.headers['authorization'];
  const hasToken = authHeader?.startsWith('Bearer ');
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url} (${hasToken ? '🔑 JWT Present' : '🔓 Standalone'})`);
  next();
});

// Mount Routes on /api/compiler, /api, and root / for maximum compatibility
app.use('/api/compiler', compilerRoutes);
app.use('/api', compilerRoutes);
app.use('/', compilerRoutes);

// Root Health/Info route
app.get('/', (req, res) => {
  res.json({
    name: 'LeetCompiler Dual-Mode Backend API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: 'GET /api/compiler/health',
      run: 'POST /api/compiler/run',
      save: 'POST /api/compiler/save',
      saved: 'GET /api/compiler/saved'
    }
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    error: err.message || 'Internal Server Error'
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`⚡ LeetCompiler backend server is running on http://localhost:${PORT}`);
  console.log(`🚀 [Ready]: POST http://localhost:${PORT}/api/compiler/run`);
});
