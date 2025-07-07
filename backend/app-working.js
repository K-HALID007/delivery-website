// Super simple working backend for Vercel
const express = require('express');
const cors = require('cors');

const app = express();

// Enable CORS for all routes
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['*']
}));

// Parse JSON
app.use(express.json());

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Courier Tracker API is working!',
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Backend is working!',
    timestamp: new Date().toISOString()
  });
});

// Admin login endpoint
app.post('/api/auth/admin/login', (req, res) => {
  console.log('Admin login request:', req.body);
  
  const { email, password } = req.body;
  
  // Hardcoded admin credentials
  const validCredentials = [
    { email: 'admin@primedispatcher.com', password: 'admin123' },
    { email: 'admin@example.com', password: 'admin123' },
    { email: 'admin@admin.com', password: 'admin123' }
  ];
  
  const validAdmin = validCredentials.find(
    cred => cred.email === email && cred.password === password
  );
  
  if (validAdmin) {
    res.json({
      success: true,
      message: 'Admin login successful',
      user: {
        name: 'Admin User',
        email: email,
        role: 'admin',
        _id: 'admin-123'
      },
      token: 'admin-token-' + Date.now()
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }
});

// Create first admin
app.post('/api/auth/admin/first', (req, res) => {
  const { name, email, password } = req.body;
  
  res.json({
    success: true,
    message: 'First admin created successfully',
    user: {
      name: name || 'Admin User',
      email: email || 'admin@primedispatcher.com',
      role: 'admin',
      _id: 'admin-123'
    },
    token: 'admin-token-' + Date.now()
  });
});

// User tracking endpoint (mock)
app.get('/api/tracking/user', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: 'Authorization header required'
    });
  }
  
  // Mock response
  res.json([
    {
      _id: 'track1',
      trackingId: 'TRK240001',
      status: 'Delivered',
      sender: { name: 'John Doe', email: 'john@example.com' },
      receiver: { name: 'Jane Smith', email: 'jane@example.com' },
      origin: 'Mumbai',
      destination: 'Delhi',
      createdAt: new Date().toISOString(),
      payment: { amount: 150, method: 'UPI', status: 'Completed' }
    }
  ]);
});

// CORS test endpoint
app.get('/api/cors-test', (req, res) => {
  res.json({
    success: true,
    message: 'CORS is working!',
    origin: req.headers.origin,
    timestamp: new Date().toISOString()
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    success: false,
    message: 'Server error',
    error: err.message 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;