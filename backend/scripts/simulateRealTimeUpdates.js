import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Tracking from '../models/tracking.model.js';
import { io } from '../app.js';

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB for simulation'))
  .catch(err => console.error('MongoDB connection error:', err));

const statuses = ['Processing', 'In Transit', 'Out for Delivery', 'Delivered', 'Pending'];

async function simulateStatusUpdate() {
  try {
    // Get all tracking entries
    const trackings = await Tracking.find().limit(10);
    
    if (trackings.length === 0) {
      console.log('No tracking entries found to update');
      return;
    }

    // Pick a random tracking entry
    const randomTracking = trackings[Math.floor(Math.random() * trackings.length)];
    
    // Pick a random status (but avoid setting the same status)
    const availableStatuses = statuses.filter(s => s !== randomTracking.status);
    const newStatus = availableStatuses[Math.floor(Math.random() * availableStatuses.length)];
    
    // Update the tracking
    randomTracking.status = newStatus;
    randomTracking.history.push({
      status: newStatus,
      location: randomTracking.currentLocation,
      timestamp: new Date()
    });
    
    await randomTracking.save();
    
    console.log(`Updated tracking ${randomTracking.trackingId} to status: ${newStatus}`);
    
    // Emit real-time update (this would normally be done in the controller)
    // For simulation, we'll just log it
    console.log('Real-time update would be emitted here');
    
  } catch (error) {
    console.error('Error simulating status update:', error);
  }
}

// Simulate updates every 10 seconds
setInterval(simulateStatusUpdate, 10000);

console.log('Real-time simulation started. Updates every 10 seconds...');