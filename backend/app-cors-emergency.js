import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Import routes
import trackingRoutes from './routes/tracking.routes.js';
import authRoutes from './routes/auth.routes.js';
import adminRoutes from './routes/admin.routes.js';
import partnerRoutes from './routes/partner.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import fixRoutes from './routes/fix.routes.js';
import uploadsRoutes from './routes/uploads.routes.js';

// Load environment variables
dotenv.config();

const app = express();

// EMERGENCY CORS FIX - Allow everything
app.use((req, res, next) => {
  // Log all requests for debugging
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} from ${req.headers.origin || 'unknown'}`);
  
  // Set CORS headers for ALL requests
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', '*');
  res.header('Access-Control-Allow-Headers', '*');
  res.header('Access-Control-Expose-Headers', '*');
  res.header('Access-Control-Max-Age', '3600');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    console.log(`OPTIONS preflight for ${req.path} from ${req.headers.origin}`);
    return res.status(200).json({
      message: 'CORS preflight successful',
      method: req.method,
      path: req.path,
      origin: req.headers.origin,
      headers: req.headers
    });
  }
  
  next();
});

// Backup CORS middleware
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],
  allowedHeaders: ['*'],
  exposedHeaders: ['*']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Test endpoint first
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'Emergency CORS fix is working!',
    timestamp: new Date().toISOString(),
    origin: req.headers.origin,
    method: req.method,
    path: req.path
  });
});

// Routes
app.use('/api/tracking', trackingRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/partner', partnerRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/fix', fixRoutes);
app.use('/api/uploads', uploadsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Emergency CORS Backend is working!',
    timestamp: new Date().toISOString(),
    cors: 'emergency-mode',
    origin: req.headers.origin
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Courier Tracker API - Emergency CORS Mode',
    status: 'OK',
    cors: 'emergency-enabled',
    timestamp: new Date().toISOString(),
    origin: req.headers.origin
  });
});

// Catch all for debugging
app.use('*', (req, res) => {
  console.log(`Catch-all: ${req.method} ${req.originalUrl} from ${req.headers.origin}`);
  res.status(404).json({
    error: 'Route not found',
    method: req.method,
    path: req.originalUrl,
    origin: req.headers.origin,
    timestamp: new Date().toISOString()
  });
});

// MongoDB connection
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ MongoDB connected (Emergency CORS mode)'))
    .catch(err => console.log('❌ MongoDB error:', err.message));
}

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: err.message,
    origin: req.headers.origin,
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Emergency CORS Server running on port ${PORT}`);
});

export default app;