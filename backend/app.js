import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { createServer } from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/auth.routes.js';
import adminRoutes from './routes/admin.routes.js';
import partnerRoutes from './routes/partner.routes.js';
import trackingRoutes from './routes/tracking.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import uploadsRoutes from './routes/uploads.routes.js';
import debugRoutes from './routes/debug.routes.js';
import geminiRoutes from './routes/gemini.routes.js';
import complaintRoutes from './routes/complaint.routes.js';
import healthRoutes from './routes/health.routes.js';
import sampleDataRoutes from './routes/sample-data.routes.js';
import assignmentService from './services/assignmentService.js';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));
app.use(express.json());

// Serve static files from uploads directory
app.use('/api/uploads', express.static('uploads'));

// MongoDB connection with improved configuration
mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 30000, // 30 seconds
  socketTimeoutMS: 45000, // 45 seconds
  maxPoolSize: 10,
  minPoolSize: 5,
  maxIdleTimeMS: 30000,
  waitQueueTimeoutMS: 5000,
  retryWrites: true,
  retryReads: true
})
  .then(() => {
    console.log('✅ Connected to MongoDB');
    console.log('🔗 Database connection established successfully');
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    console.error('🚨 Please check your internet connection and MongoDB Atlas cluster status');
  });

// Handle MongoDB connection events
mongoose.connection.on('connected', () => {
  console.log('🟢 Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('🔴 Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('🟡 Mongoose disconnected from MongoDB');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('🔒 MongoDB connection closed through app termination');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during graceful shutdown:', err);
    process.exit(1);
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Admin client connected:', socket.id);
  
  socket.on('join-admin', () => {
    socket.join('admin-room');
    console.log('Admin joined admin room');
  });
  
  socket.on('disconnect', () => {
    console.log('Admin client disconnected:', socket.id);
  });
});

// Make io available to routes
app.set('io', io);

// Routes
app.use('/api', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/partner', partnerRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/uploads', uploadsRoutes);
app.use('/api/debug', debugRoutes);
app.use('/api/gemini', geminiRoutes);
app.use('/api/complaint', complaintRoutes);
app.use('/api/sample-data', sampleDataRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  
  // 🚀 Start automatic partner assignment service after DB connection
  console.log('🤖 Starting automatic partner assignment service...');
  
  // Wait for database connection before starting assignment service
  if (mongoose.connection.readyState === 1) {
    assignmentService.start(2); // Check every 2 minutes for unassigned deliveries
  } else {
    mongoose.connection.once('connected', () => {
      console.log('🔗 Database connected, starting assignment service...');
      assignmentService.start(2); // Check every 2 minutes for unassigned deliveries
    });
  }
});

export { io }; 