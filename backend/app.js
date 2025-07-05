import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));
app.use(express.json());

// Simple health check route
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Backend is working!',
    timestamp: new Date().toISOString()
  });
});

// Basic test route
app.get('/', (req, res) => {
  res.json({
    message: 'Courier Tracker API is running',
    status: 'OK'
  });
});

// Basic auth routes (temporary for testing)
app.post('/api/auth/register', (req, res) => {
  res.json({
    success: true,
    message: 'Registration endpoint working',
    data: { userId: '123', token: 'test-token' }
  });
});

app.post('/api/auth/login', (req, res) => {
  res.json({
    success: true,
    message: 'Login endpoint working',
    data: { userId: '123', token: 'test-token' }
  });
});

app.post('/api/auth/admin/login', (req, res) => {
  res.json({
    success: true,
    message: 'Admin login endpoint working',
    data: { adminId: '123', token: 'admin-test-token' }
  });
});

// MongoDB connection (simplified)
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