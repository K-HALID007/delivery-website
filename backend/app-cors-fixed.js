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

// Middleware - Fixed CORS to allow multiple origins
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || "http://localhost:3000",
    "https://primedispatcher.vercel.app",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "null" // Allow local file access for debugging
  ],
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/tracking', trackingRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/partner', partnerRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/fix', fixRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Backend is working!',
    timestamp: new Date().toISOString()
  });
});

app.get('/', (req, res) => {
  res.json({
    message: 'Courier Tracker API is running',
    status: 'OK'
  });
});

// Auth endpoints are now handled by authRoutes

// Admin endpoints are now handled by adminRoutes
// Tracking endpoints are now handled by trackingRoutes

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