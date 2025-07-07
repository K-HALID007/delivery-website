import express from 'express';
import cors from 'cors';

const app = express();

// Simple CORS
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['*']
}));

app.use(express.json());

// Test endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Minimal backend is working!',
    timestamp: new Date().toISOString()
  });
});

// Simple admin login without database
app.post('/api/auth/admin/login', (req, res) => {
  const { email, password } = req.body;
  
  // Hardcoded admin credentials for testing
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
        role: 'admin'
      },
      token: 'fake-jwt-token-for-testing'
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
});

// Create first admin (always works)
app.post('/api/auth/admin/first', (req, res) => {
  const { name, email, password } = req.body;
  
  res.json({
    success: true,
    message: 'First admin created successfully',
    user: {
      name: name || 'Admin User',
      email: email || 'admin@primedispatcher.com',
      role: 'admin'
    },
    token: 'fake-jwt-token-for-testing'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Minimal Courier Tracker API',
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    message: 'Server error',
    error: err.message 
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Minimal server running on port ${PORT}`);
});

export default app;