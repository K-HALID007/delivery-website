const express = require('express');
const cors = require('cors');

const app = express();

// CORS middleware
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['*']
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Courier Tracker Backend is running!',
    status: 'success',
    timestamp: new Date().toISOString()
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Backend health check passed',
    timestamp: new Date().toISOString()
  });
});

// Admin login
app.post('/api/auth/admin/login', (req, res) => {
  const { email, password } = req.body;
  
  console.log('Admin login attempt:', { email, password });
  
  // Valid admin credentials
  const admins = [
    { email: 'admin@primedispatcher.com', password: 'admin123' },
    { email: 'admin@example.com', password: 'admin123' },
    { email: 'admin@admin.com', password: 'admin123' }
  ];
  
  const admin = admins.find(a => a.email === email && a.password === password);
  
  if (admin) {
    res.json({
      success: true,
      message: 'Admin login successful',
      user: {
        name: 'Admin User',
        email: admin.email,
        role: 'admin',
        _id: 'admin-user-id'
      },
      token: 'admin-jwt-token-' + Date.now()
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
      _id: 'admin-user-id'
    },
    token: 'admin-jwt-token-' + Date.now()
  });
});

// User shipments (mock data)
app.get('/api/tracking/user', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Authorization token required'
    });
  }
  
  // Mock shipments data
  res.json([
    {
      _id: 'shipment1',
      trackingId: 'TRK240001',
      status: 'Delivered',
      sender: { name: 'Test User', email: 'user@example.com' },
      receiver: { name: 'Receiver', email: 'receiver@example.com' },
      origin: 'Mumbai',
      destination: 'Delhi',
      currentLocation: 'Delhi',
      createdAt: new Date().toISOString(),
      deliveredAt: new Date().toISOString(),
      payment: { 
        amount: 150, 
        method: 'UPI', 
        status: 'Completed' 
      },
      packageDetails: {
        type: 'standard',
        weight: 1
      }
    }
  ]);
});

// CORS test
app.get('/api/cors-test', (req, res) => {
  res.json({
    success: true,
    message: 'CORS is working perfectly!',
    origin: req.headers.origin || 'No origin',
    timestamp: new Date().toISOString()
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
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

const PORT = process.env.PORT || 3000;

// For Vercel
module.exports = app;

// For local development
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}