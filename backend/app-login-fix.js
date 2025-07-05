import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));
app.use(express.json());

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: String,
  address: String,
  city: String,
  state: String,
  postalCode: String,
  country: String,
  role: { type: String, default: 'user' },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Admin Schema
const adminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'admin' },
  createdAt: { type: Date, default: Date.now }
});

const Admin = mongoose.model('Admin', adminSchema);

// Simple hash function (temporary)
function simpleHash(password) {
  return Buffer.from(password).toString('base64');
}

function verifyPassword(password, hash) {
  return simpleHash(password) === hash;
}

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

// User Registration
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone, address, city, state, postalCode, country } = req.body;

    console.log('Registration attempt:', { name, email, phone });

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Hash password (simple method)
    const hashedPassword = simpleHash(password);

    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      address,
      city,
      state,
      postalCode,
      country
    });

    await user.save();
    console.log('User created successfully:', user._id);

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
});

// User Login - FIXED VERSION
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Login attempt for email:', email);
    console.log('MongoDB connection state:', mongoose.connection.readyState);

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      console.error('MongoDB not connected');
      return res.status(500).json({
        success: false,
        message: 'Database connection error'
      });
    }

    // Find user
    console.log('Searching for user with email:', email);
    const user = await User.findOne({ email });
    console.log('User found:', !!user);
    
    if (!user) {
      console.log('User not found for email:', email);
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    console.log('Verifying password...');
    const isValidPassword = verifyPassword(password, user.password);
    console.log('Password valid:', isValidPassword);
    
    if (!isValidPassword) {
      console.log('Invalid password for user:', email);
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    console.log('Login successful for user:', email);
    
    // FIXED: Return user and token at root level (not nested in data)
    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Login error details:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
});

// Admin Login - FIXED VERSION
app.post('/api/auth/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Admin login attempt for email:', email);

    // Find admin
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({
        success: false,
        message: 'Invalid admin credentials'
      });
    }

    // Check password
    const isValidPassword = verifyPassword(password, admin.password);
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        message: 'Invalid admin credentials'
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { adminId: admin._id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    // FIXED: Return user and token at root level
    res.json({
      success: true,
      message: 'Admin login successful',
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      },
      token
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Admin login failed',
      error: error.message
    });
  }
});

// Create test user endpoint
app.post('/api/auth/create-test-user', async (req, res) => {
  try {
    const testUser = {
      name: 'Test User',
      email: 'test@example.com',
      password: simpleHash('password123'),
      phone: '1234567890',
      role: 'user'
    };

    // Check if test user already exists
    const existingUser = await User.findOne({ email: testUser.email });
    if (existingUser) {
      return res.json({
        success: true,
        message: 'Test user already exists',
        user: {
          email: testUser.email,
          password: 'password123'
        }
      });
    }

    const user = new User(testUser);
    await user.save();

    res.json({
      success: true,
      message: 'Test user created successfully',
      user: {
        email: testUser.email,
        password: 'password123'
      }
    });
  } catch (error) {
    console.error('Test user creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create test user',
      error: error.message
    });
  }
});

// Essential API endpoints
app.get('/api/admin/summary', (req, res) => {
  res.json({
    success: true,
    data: {
      totalShipments: 0,
      totalRevenue: 0,
      activePartners: 0,
      pendingDeliveries: 0
    }
  });
});

app.get('/api/admin/shipments/recent', (req, res) => {
  res.json({
    success: true,
    data: []
  });
});

app.get('/api/admin/users', (req, res) => {
  res.json({
    success: true,
    data: []
  });
});

app.get('/api/tracking/user', (req, res) => {
  res.json({
    success: true,
    data: []
  });
});

app.post('/api/tracking/add', (req, res) => {
  res.json({
    success: true,
    message: 'Shipment created successfully',
    data: { trackingId: 'TRK' + Date.now() }
  });
});

app.post('/api/tracking/verify', (req, res) => {
  res.json({
    success: false,
    message: 'Tracking ID not found'
  });
});

app.get('/api/admin/analytics/realtime', (req, res) => {
  res.json({
    success: true,
    data: {
      totalShipments: 0,
      deliveredToday: 0,
      pendingDeliveries: 0,
      revenue: 0
    }
  });
});

app.get('/api/admin/analytics/revenue', (req, res) => {
  res.json({
    success: true,
    data: {
      totalRevenue: 0,
      monthlyRevenue: 0,
      dailyRevenue: 0
    }
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