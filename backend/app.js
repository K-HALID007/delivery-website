import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

// Import routes
import trackingRoutes from './routes/tracking.routes.js';
import authRoutes from './routes/auth.routes.js';
import adminRoutes from './routes/admin.routes.js';
import partnerRoutes from './routes/partner.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import fixRoutes from './routes/fix.routes.js';

// Load environment variables
dotenv.config();

const app = express();

// Production-grade CORS configuration
const isProduction = process.env.NODE_ENV === 'production';

const allowedOrigins = isProduction 
  ? [
      process.env.FRONTEND_URL,
      "https://primedispatcher.vercel.app"
    ]
  : [
      process.env.FRONTEND_URL,
      "https://primedispatcher.vercel.app",
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "http://localhost:5173"
    ];

app.use(cors({
  origin: function (origin, callback) {
    // Allow server-to-server requests (no origin)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log(`❌ CORS blocked origin: ${origin} | Environment: ${process.env.NODE_ENV || 'development'}`);
      callback(new Error('Access denied by CORS policy'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200 // For legacy browser support
}));

// Security middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security headers
app.use((req, res, next) => {
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  res.header('X-XSS-Protection', '1; mode=block');
  if (isProduction) {
    res.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  next();
});

// Request logging for production monitoring
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`${timestamp} | ${req.method} ${req.path} | Origin: ${req.get('origin') || 'none'} | IP: ${req.ip}`);
  next();
});

// Routes
app.use('/api/tracking', trackingRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/partner', partnerRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/fix', fixRoutes);

// Health check with detailed info
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Courier Tracker API is operational',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

app.get('/', (req, res) => {
  res.json({
    message: 'Courier Tracker API',
    status: 'operational',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// MongoDB connection with production settings
const mongoOptions = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  bufferMaxEntries: 0,
  retryWrites: true,
  w: 'majority'
};

if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI, mongoOptions)
    .then(() => {
      console.log('✅ MongoDB connected successfully');
      console.log(`📊 Database: ${mongoose.connection.name}`);
    })
    .catch(err => {
      console.error('❌ MongoDB connection error:', err.message);
      process.exit(1);
    });
} else {
  console.error('❌ MONGODB_URI environment variable is required');
  process.exit(1);
}

// MongoDB connection event handlers
mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB disconnected');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🔄 Graceful shutdown initiated...');
  await mongoose.connection.close();
  console.log('✅ MongoDB connection closed');
  process.exit(0);
});

// Production error handling
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.stack);
  
  // Don't leak error details in production
  const errorResponse = isProduction 
    ? { 
        success: false,
        message: 'Internal server error',
        timestamp: new Date().toISOString()
      }
    : { 
        success: false,
        message: err.message,
        stack: err.stack,
        timestamp: new Date().toISOString()
      };
  
  res.status(500).json(errorResponse);
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Courier Tracker API running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔒 CORS allowed origins: ${allowedOrigins.join(', ')}`);
  console.log(`⏰ Started at: ${new Date().toISOString()}`);
});

export default app;