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

// Request Logger
app.use((req, res, next) => {
  const authHeader = req.headers['authorization'];
  const hasToken = authHeader?.startsWith('Bearer ');
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url} (${hasToken ? '🔑 JWT Present' : '🔓 Standalone'})`);
  next();
});

// Routes
app.use('/api/compiler', compilerRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    name: 'LeetCompiler Dual-Mode Backend API',
    version: '1.0.0',
    modes: {
      standalone: 'POST /api/compiler/run (no JWT required, public code execution)',
      integrated: 'POST /api/compiler/run or /run-integrated (with JWT, updates MongoDB revision)'
    },
    endpoints: {
      health: 'GET /api/compiler/health',
      run: 'POST /api/compiler/run',
      runIntegrated: 'POST /api/compiler/run-integrated'
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
  console.log(`🚀 [Standalone Mode]: POST http://localhost:${PORT}/api/compiler/run`);
  console.log(`🔐 [Integrated Mode]: POST http://localhost:${PORT}/api/compiler/run (with Authorization header)`);
});
