require('dotenv').config();

const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');

const { initSocket } = require('./socket');
const { initFollowupWorker } = require('./queues/followupWorker');
const { isReady: isRedisReady } = require('./config/redis');

// Route imports
const authRoutes = require('./routes/authRoutes');
const propertyRoutes = require('./routes/propertyRoutes');
const leadRoutes = require('./routes/leadRoutes');
const activityRoutes = require('./routes/activityRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/estateiq';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

// ── Middleware ───────────────────────────────────────────────────
app.use(cors({
  origin: CLIENT_URL,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Socket.io Setup ──────────────────────────────────────────────
initSocket(server, {
  origin: CLIENT_URL,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  credentials: true
});

// ── API Routes ───────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  const redisStatus = isRedisReady() ? 'connected' : 'disconnected';

  res.status(200).json({
    status: 'healthy',
    service: 'estateiq-core-server',
    port: PORT,
    database: {
      mongodb: mongoStatus,
      redis: redisStatus
    },
    timestamp: new Date().toISOString()
  });
});

// ── 404 Handler ──────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// ── Global Error Handler ─────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// ── Database & Server Start ──────────────────────────────────────
async function startServer() {
  try {
    // 1. Connect MongoDB
    console.log(`[MongoDB] Connecting to ${MONGODB_URI} …`);
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('[MongoDB] Connected successfully ✓');

    // 2. Initialize BullMQ Follow-up Worker
    initFollowupWorker();

    // 3. Start HTTP + Socket Server
    server.listen(PORT, () => {
      console.log(`[EstateIQ Server] 🚀 Core CRM Backend running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('[MongoDB] Connection failed:', err.message);
    console.warn('[EstateIQ Server] Starting server in fallback mode (database reconnecting in background) …');

    initFollowupWorker();

    server.listen(PORT, () => {
      console.log(`[EstateIQ Server] ⚠️ Running on http://localhost:${PORT} (MongoDB pending)`);
    });
  }
}

startServer();

module.exports = { app, server };
