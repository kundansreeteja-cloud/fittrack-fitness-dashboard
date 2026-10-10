require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const workoutRoutes = require('./routes/workoutRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// DB connection state
let dbConnected = false;

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: dbConnected ? 'connected' : 'disconnected',
    version: '1.0.0',
  });
});

// DB guard middleware — reject API calls if DB is not connected
app.use('/api/workouts', (req, res, next) => {
  if (!dbConnected) {
    return res.status(503).json({
      success: false,
      message: 'Database is unavailable. Please check your MongoDB connection and try again.',
    });
  }
  next();
});

// API Routes
app.use('/api/workouts', workoutRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

// Start server regardless of DB state so health check always works
const startServer = async () => {
  dbConnected = await connectDB();

  if (!dbConnected) {
    console.warn('⚠️  WARNING: Server started WITHOUT database connection.');
    console.warn('    Workout API endpoints will return 503 until MongoDB is available.');
    console.warn('    Set MONGODB_URI in your .env file and restart to connect.');
  }

  app.listen(PORT, () => {
    console.log(`\n🚀 FitTrack API running on http://localhost:${PORT}`);
    console.log(`   Health: http://localhost:${PORT}/api/health`);
    console.log(`   DB:     ${dbConnected ? '✅ Connected' : '❌ Disconnected'}\n`);
  });
};

startServer();
