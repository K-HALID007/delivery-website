const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

// Environment variables
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://ks0903525:khalid@cluster0.4kfjdbl.mongodb.net/courier-tracker?retryWrites=true&w=majority&appName=Cluster0';
const JWT_SECRET = process.env.JWT_SECRET || 'mysupersecretkey123';

// CORS Configuration - Most permissive
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  
  // Set CORS headers
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS,PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin,X-Requested-With,Content-Type,Accept,Authorization,Cache-Control,Pragma');
  res.header('Access-Control-Max-Age', '3600');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    console.log(`✅ OPTIONS handled for ${req.path}`);
    return res.status(200).end();
  }
  
  next();
});

// Additional CORS middleware
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['*']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple User Schema (inline)
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  address: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String
  },
  isActive: { type: Boolean, default: true },
  lastLogin: Date,
  createdAt: { type: Date, default: Date.now }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Tracking Schema
const trackingSchema = new mongoose.Schema({
  trackingId: { type: String, required: true, unique: true },
  sender: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true }
  },
  receiver: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true }
  },
  packageDetails: {
    type: { type: String, required: true },
    weight: { type: Number, required: true },
    dimensions: {
      length: Number,
      width: Number,
      height: Number
    },
    description: String,
    value: Number
  },
  origin: { type: String, required: true },
  destination: { type: String, required: true },
  currentLocation: { type: String, default: function() { return this.origin; } },
  status: {
    type: String,
    enum: ['Pending', 'Picked Up', 'In Transit', 'Out for Delivery', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },
  payment: {
    amount: { type: Number, required: true },
    method: { type: String, enum: ['Cash', 'UPI', 'Card', 'Net Banking'], required: true },
    status: { type: String, enum: ['Pending', 'Completed', 'Failed'], default: 'Pending' },
    transactionId: String
  },
  estimatedDelivery: Date,
  actualDelivery: Date,
  deliveredAt: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  partnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Partner' },
  statusHistory: [{
    status: String,
    location: String,
    timestamp: { type: Date, default: Date.now },
    notes: String
  }]
});

// Partner Schema
const partnerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  address: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String
  },
  vehicleType: { type: String, enum: ['bike', 'car', 'truck', 'van'], required: true },
  vehicleNumber: { type: String, required: true },
  licenseNumber: { type: String, required: true },
  workingHours: { type: String, enum: ['morning', 'evening', 'night', 'flexible'], default: 'flexible' },
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  rating: { type: Number, default: 0 },
  totalDeliveries: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

// Hash password for partners too
partnerSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

partnerSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Initialize models
let User, Tracking, Partner;
try {
  User = mongoose.model('User');
} catch {
  User = mongoose.model('User', userSchema);
}

try {
  Tracking = mongoose.model('Tracking');
} catch {
  Tracking = mongoose.model('Tracking', trackingSchema);
}

try {
  Partner = mongoose.model('Partner');
} catch {
  Partner = mongoose.model('Partner', partnerSchema);
}

// MongoDB connection
let isConnected = false;
async function connectDB() {
  if (isConnected) return;
  
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    isConnected = true;
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.log('❌ MongoDB error:', error.message);
  }
}

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Courier Tracker API is running',
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Backend is working!',
    timestamp: new Date().toISOString(),
    mongodb: isConnected ? 'connected' : 'disconnected'
  });
});

app.get('/api/cors-test', (req, res) => {
  res.json({
    success: true,
    message: 'CORS is working!',
    origin: req.headers.origin || 'No origin',
    timestamp: new Date().toISOString()
  });
});

// User Login
app.post('/api/auth/login', async (req, res) => {
  try {
    await connectDB();
    
    const { email, password } = req.body;
    console.log('Login attempt:', email);

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign(
      { userId: user._id, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const userData = user.toObject();
    delete userData.password;

    res.json({
      message: 'Login successful',
      user: userData,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
});

// Admin Login
app.post('/api/auth/admin/login', async (req, res) => {
  try {
    await connectDB();
    
    const { email, password } = req.body;
    console.log('Admin login attempt:', email);

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized as admin' });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign(
      { userId: user._id, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const userData = user.toObject();
    delete userData.password;

    res.json({
      message: 'Admin login successful',
      user: userData,
      token
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Error logging in as admin', error: error.message });
  }
});

// User Registration
app.post('/api/auth/register', async (req, res) => {
  try {
    await connectDB();
    
    const { name, email, password, phone, address, city, state, postalCode, country } = req.body;
    console.log('Registration attempt:', email);

    // Basic validation
    if (!name || !email || !password || !phone) {
      return res.status(400).json({ message: 'Name, email, password, and phone are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email address' });
    }

    // Create new user
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: password,
      phone: phone.trim(),
      address: {
        street: address || '',
        city: city || '',
        state: state || '',
        postalCode: postalCode || '',
        country: country || 'India'
      },
      role: 'user'
    });

    await user.save();

    const token = jwt.sign(
      { userId: user._id, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const userData = user.toObject();
    delete userData.password;

    res.status(201).json({
      message: 'User registered successfully',
      user: userData,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({ message: 'User already exists with this email address' });
    }

    res.status(500).json({ 
      message: 'Error registering user. Please try again.',
      error: error.message 
    });
  }
});

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization token required' });
  }
  
  const token = authHeader.substring(7);
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Middleware to verify admin role
const verifyAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Admin Dashboard - Get Statistics
app.get('/api/admin/dashboard', verifyToken, verifyAdmin, async (req, res) => {
  try {
    await connectDB();
    
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const totalShipments = await Tracking.countDocuments();
    const pendingShipments = await Tracking.countDocuments({ status: 'Pending' });
    const deliveredShipments = await Tracking.countDocuments({ status: 'Delivered' });
    const totalPartners = await Partner.countDocuments();
    const activePartners = await Partner.countDocuments({ isActive: true });
    
    // Recent shipments
    const recentShipments = await Tracking.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('userId', 'name email')
      .populate('partnerId', 'name email');
    
    // Revenue calculation (sum of completed payments)
    const revenueResult = await Tracking.aggregate([
      { $match: { 'payment.status': 'Completed' } },
      { $group: { _id: null, total: { $sum: '$payment.amount' } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;
    
    res.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          activeUsers,
          totalShipments,
          pendingShipments,
          deliveredShipments,
          totalPartners,
          activePartners,
          totalRevenue
        },
        recentShipments
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Error fetching dashboard data', error: error.message });
  }
});

// Admin - Get All Users
app.get('/api/admin/users', verifyToken, verifyAdmin, async (req, res) => {
  try {
    await connectDB();
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await User.countDocuments();
    
    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

// Admin - Get All Shipments
app.get('/api/admin/shipments', verifyToken, verifyAdmin, async (req, res) => {
  try {
    await connectDB();
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status;
    
    let query = {};
    if (status && status !== 'all') {
      query.status = status;
    }
    
    const shipments = await Tracking.find(query)
      .populate('userId', 'name email')
      .populate('partnerId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Tracking.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        shipments,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get shipments error:', error);
    res.status(500).json({ message: 'Error fetching shipments', error: error.message });
  }
});

// Admin - Get All Partners
app.get('/api/admin/partners', verifyToken, verifyAdmin, async (req, res) => {
  try {
    await connectDB();
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const partners = await Partner.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Partner.countDocuments();
    
    res.json({
      success: true,
      data: {
        partners,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get partners error:', error);
    res.status(500).json({ message: 'Error fetching partners', error: error.message });
  }
});

// Admin - Update Shipment Status
app.put('/api/admin/shipments/:id/status', verifyToken, verifyAdmin, async (req, res) => {
  try {
    await connectDB();
    
    const { status, location, notes } = req.body;
    const shipmentId = req.params.id;
    
    const shipment = await Tracking.findById(shipmentId);
    if (!shipment) {
      return res.status(404).json({ message: 'Shipment not found' });
    }
    
    // Update status
    shipment.status = status;
    shipment.currentLocation = location || shipment.currentLocation;
    shipment.updatedAt = new Date();
    
    // Add to status history
    shipment.statusHistory.push({
      status,
      location: location || shipment.currentLocation,
      timestamp: new Date(),
      notes: notes || `Status updated to ${status}`
    });
    
    // If delivered, set delivery date
    if (status === 'Delivered') {
      shipment.deliveredAt = new Date();
      shipment.actualDelivery = new Date();
      shipment.payment.status = 'Completed';
    }
    
    await shipment.save();
    
    res.json({
      success: true,
      message: 'Shipment status updated successfully',
      data: shipment
    });
  } catch (error) {
    console.error('Update shipment error:', error);
    res.status(500).json({ message: 'Error updating shipment', error: error.message });
  }
});

// Admin - Toggle User Status
app.put('/api/admin/users/:id/toggle-status', verifyToken, verifyAdmin, async (req, res) => {
  try {
    await connectDB();
    
    const userId = req.params.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.isActive = !user.isActive;
    await user.save();
    
    const userData = user.toObject();
    delete userData.password;
    
    res.json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      data: userData
    });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({ message: 'Error updating user status', error: error.message });
  }
});

// User - Get My Shipments
app.get('/api/tracking/user', verifyToken, async (req, res) => {
  try {
    await connectDB();
    
    const userId = req.user.userId;
    const shipments = await Tracking.find({ userId })
      .populate('partnerId', 'name phone')
      .sort({ createdAt: -1 });
    
    res.json(shipments);
  } catch (error) {
    console.error('Get user shipments error:', error);
    res.status(500).json({ message: 'Error fetching shipments', error: error.message });
  }
});

// Public - Track Shipment by ID
app.get('/api/tracking/:trackingId', async (req, res) => {
  try {
    await connectDB();
    
    const trackingId = req.params.trackingId;
    const shipment = await Tracking.findOne({ trackingId })
      .populate('partnerId', 'name phone')
      .select('-userId');
    
    if (!shipment) {
      return res.status(404).json({ message: 'Shipment not found' });
    }
    
    res.json({
      success: true,
      data: shipment
    });
  } catch (error) {
    console.error('Track shipment error:', error);
    res.status(500).json({ message: 'Error tracking shipment', error: error.message });
  }
});

// Error handling
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

module.exports = app;