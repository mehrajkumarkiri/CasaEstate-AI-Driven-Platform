require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');
const errorHandler = require('./src/middleware/errorHandler');

// Route imports
const projectRoutes = require('./src/routes/projectRoutes');
const unitRoutes = require('./src/routes/unitRoutes');
const bookingRoutes = require('./src/routes/bookingRoutes');
const ledgerRoutes = require('./src/routes/ledgerRoutes');
const authRoutes = require('./src/routes/authRoutes');
const negotiationRoutes = require('./src/routes/negotiationRoutes');
const milestoneRoutes = require('./src/routes/milestoneRoutes');
const aiRoutes = require('./src/routes/aiRoutes');

const app = express();

// Connect to MongoDB (non-blocking; app works with mock data if unavailable)
connectDB();

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], allowedHeaders: ['Content-Type', 'Authorization'] }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logger in development
if (process.env.NODE_ENV === 'development') {
  app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
  });
}

// Root redirect / welcome endpoint to resolve "Route not found" error on backend base URL
app.get('/', (_req, res) => {
  res.json({
    status: 'operational',
    message: 'Welcome to BuildFlow AI — Construction Management API',
    documentation: '/api/v1/health'
  });
});

// ─── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/units', unitRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/ledger', ledgerRoutes);
app.use('/api/v1/negotiations', negotiationRoutes);
app.use('/api/v1/milestones', milestoneRoutes);
app.use('/api/v1/ai', aiRoutes);

// Health check
app.get('/api/v1/health', (_req, res) => {
  res.json({ status: 'operational', timestamp: new Date().toISOString(), version: '1.0.0' });
});

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🏗️  BuildFlow AI — Construction API running on http://localhost:${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}\n`);
});

module.exports = app;
