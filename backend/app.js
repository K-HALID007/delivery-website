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
import uploadsRoutes from './routes/uploads.routes.js';

// Load environment variables
dotenv.config();

// Ensure critical environment variables
if (!process.env.JWT_SECRET) {
  console.log('⚠️ JWT_SECRET missing, using fallback');
  process.env.JWT_SECRET = 'fallback-jwt-secret-for-development-only-not-secure';
}

const app = express();

// EMERGENCY CORS FIX - Simplest possible approach
app.use((req, res, next) => {
  // Log for debugging
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} from ${req.headers.origin || 'no-origin'}`);
  
  // Set the most permissive CORS headers possible
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', '*');
  res.header('Access-Control-Allow-Headers', '*');
  res.header('Access-Control-Expose-Headers', '*');
  res.header('Access-Control-Max-Age', '3600');
  
  // Handle preflight immediately
  if (req.method === 'OPTIONS') {
    console.log(`✅ OPTIONS preflight handled for ${req.path}`);
    return res.status(200).json({
      message: 'CORS preflight OK',
      timestamp: new Date().toISOString()
    });
  }
  
  next();
});

// Simple backup CORS
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],
  allowedHeaders: ['*']
}));

app.use(express.json());

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
    message: 'Backend is working!',
    timestamp: new Date().toISOString()
  });
});

// CORS test endpoint
app.get('/api/cors-test', (req, res) => {
  res.json({
    success: true,
    message: 'CORS is working!',
    origin: req.headers.origin,
    userAgent: req.headers['user-agent'],
    timestamp: new Date().toISOString(),
    headers: req.headers
  });
});

// OPTIONS handler for all routes
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS,PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin,X-Requested-With,Content-Type,Accept,Authorization,Cache-Control,Pragma');
  res.sendStatus(200);
});

app.get('/', (req, res) => {
  res.json({
    message: 'Courier Tracker API is running',
    status: 'OK',
    cors: 'enabled',
    timestamp: new Date().toISOString()
  });
});

// MongoDB connection with better error handling
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ MongoDB connected'))
    .catch(err => {
      console.log('❌ MongoDB error:', err.message);
      // Don't crash the app if MongoDB fails
    });
} else {
  console.log('⚠️ MONGODB_URI not found in environment variables');
}

// Check critical environment variables
console.log('🔍 Environment Check:');
console.log('- MONGODB_URI:', process.env.MONGODB_URI ? 'Present' : 'Missing');
console.log('- JWT_SECRET:', process.env.JWT_SECRET ? 'Present' : 'Missing');
console.log('- NODE_ENV:', process.env.NODE_ENV || 'Not set');

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;