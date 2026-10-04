import 'dotenv/config';
import express from 'express';
import cors from 'cors';

// Import routes
import authRoutes from './routes/auth.routes.js';
import trackingRoutes from './routes/tracking.routes.js';
import adminRoutes from './routes/admin.routes.js';
import partnerRoutes from './routes/partner.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import complaintRoutes from './routes/complaint.routes.js';
import geminiRoutes from './routes/gemini.routes.js';
import uploadsRoutes from './routes/uploads.routes.js';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';

const app = express();

const allowedOrigins = new Set([
  'http://localhost:3000',
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL.replace(/\/$/, '')] : []),
  ...(process.env.CORS_ORIGINS || '').split(',').map((origin) => origin.trim().replace(/\/$/, '')).filter(Boolean)
]);

// Fallback JWT Secret for development
// 🛡️ Robust & Standards-Compliant CORS Configuration
// Reflects origin dynamically to satisfy W3C spec with credentials: true
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  if (origin && allowedOrigins.has(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
  } else if (!origin) {
    res.header('Access-Control-Allow-Origin', '*');
  }

  res.header(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, PATCH, OPTIONS'
  );
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma, X-Client-Version'
  );
  res.header('Access-Control-Max-Age', '86400');

  // Handle preflight immediately
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  next();
});

// Standard CORS middleware as second layer
app.use(cors({
  origin: (origin, callback) => callback(null, !origin || allowedOrigins.has(origin)),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization', 'Cache-Control', 'Pragma', 'X-Client-Version']
}));

// Preserve the exact payload bytes used by Cashfree's webhook signature.
app.use('/api/payment/webhook', express.raw({ type: 'application/json' }));

// Body parsers
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Root & Health check
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Prime Dispatcher API is active and running',
    version: '2.0.0',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    message: 'Backend server is operational',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/partner', partnerRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/complaint', complaintRoutes);
app.use('/api/gemini', geminiRoutes);
app.use('/api/uploads', uploadsRoutes);

// 404 for undefined routes under /api
app.use('/api/*', notFoundHandler);

// Global Error Handler
app.use(errorHandler);

export default app;
