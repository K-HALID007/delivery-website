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

const app = express();

// AGGRESSIVE CORS FIX - Allow all origins temporarily to fix deployment issue
app.use((req, res, next) => {
  // Set CORS headers for all requests
  const origin = req.headers.origin;
  const allowedOrigins = [
    'https://primedispatcher.vercel.app',
    'https://delivery-backend100.vercel.app',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5000'
  ];
  
  // Allow the origin if it's in our list, or allow all for now
  if (allowedOrigins.includes(origin) || !origin) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*'); // Temporary: allow all
  }
  
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin,X-Requested-With,Content-Type,Accept,Authorization,Cache-Control,Pragma,X-HTTP-Method-Override');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Length,X-JSON');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
  
  // Handle preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    console.log(`OPTIONS request from origin: ${origin} for path: ${req.path}`);
    res.status(200).end();
    return;
  }
  
  console.log(`${req.method} request from origin: ${origin} for path: ${req.path}`);
  next();
});

// Backup CORS using cors middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'https://primedispatcher.vercel.app',
      'https://delivery-backend100.vercel.app',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5000'
    ];
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Temporarily allow all origins to fix deployment
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'Pragma',
    'X-HTTP-Method-Override'
  ],
  optionsSuccessStatus: 200
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

// MongoDB connection
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ MongoDB connected'))
    .catch(err => console.log('❌ MongoDB error:', err.message));
}

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