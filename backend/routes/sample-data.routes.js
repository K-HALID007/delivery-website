import express from 'express';
import User from '../models/user.model.js';
import Tracking from '../models/tracking.model.js';
import Shipment from '../models/shipment.model.js';

const router = express.Router();

// Add sample data for analytics
router.post('/add-sample-data', async (req, res) => {
  try {
    console.log('🔧 Adding sample data for analytics...');

    // Check existing data
    const existingTracking = await Tracking.countDocuments();
    const existingUsers = await User.countDocuments({ role: 'user' });
    const existingShipments = await Shipment.countDocuments();
    
    console.log(`Current data: ${existingTracking} trackings, ${existingUsers} users, ${existingShipments} shipments`);

    let addedUsers = 0, addedTrackings = 0, addedShipments = 0;

    // Add sample users if needed
    if (existingUsers < 5) {
      const sampleUsers = [
        {
          name: 'John Doe',
          email: 'john@example.com',
          password: '$2a$10$dummy.hash.for.testing',
          phone: '+1234567890',
          role: 'user',
          isActive: true,
          isVerified: true,
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        },
        {
          name: 'Jane Smith',
          email: 'jane@example.com',
          password: '$2a$10$dummy.hash.for.testing',
          phone: '+1234567891',
          role: 'user',
          isActive: true,
          isVerified: true,
          createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000)
        },
        {
          name: 'Bob Johnson',
          email: 'bob@example.com',
          password: '$2a$10$dummy.hash.for.testing',
          phone: '+1234567892',
          role: 'user',
          isActive: true,
          isVerified: true,
          createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)
        },
        {
          name: 'Alice Brown',
          email: 'alice@example.com',
          password: '$2a$10$dummy.hash.for.testing',
          phone: '+1234567893',
          role: 'user',
          isActive: true,
          isVerified: true,
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
        },
        {
          name: 'Charlie Wilson',
          email: 'charlie@example.com',
          password: '$2a$10$dummy.hash.for.testing',
          phone: '+1234567894',
          role: 'user',
          isActive: true,
          isVerified: true,
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
        }
      ];

      await User.insertMany(sampleUsers);
      addedUsers = sampleUsers.length;
      console.log(`✅ Added ${addedUsers} sample users`);
    }

    // Add sample tracking data if needed
    if (existingTracking < 10) {
      const statuses = ['Delivered', 'In Transit', 'Processing', 'Out for Delivery', 'Pending'];
      const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad'];
      
      const sampleTrackings = [];
      
      for (let i = 0; i < 20; i++) {
        const daysAgo = Math.floor(Math.random() * 30);
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const origin = cities[Math.floor(Math.random() * cities.length)];
        let destination = cities[Math.floor(Math.random() * cities.length)];
        while (destination === origin) {
          destination = cities[Math.floor(Math.random() * cities.length)];
        }
        
        const tracking = {
          trackingId: `TRK${Date.now()}${i}`,
          sender: {
            name: `Sender ${i + 1}`,
            email: `sender${i + 1}@example.com`,
            phone: `+123456789${i}`
          },
          receiver: {
            name: `Receiver ${i + 1}`,
            email: `receiver${i + 1}@example.com`,
            phone: `+123456788${i}`
          },
          origin: origin,
          destination: destination,
          status: status,
          packageDetails: {
            type: ['Document', 'Electronics', 'Clothing', 'Food'][Math.floor(Math.random() * 4)],
            weight: Math.floor(Math.random() * 10) + 1,
            description: `Sample package ${i + 1}`
          },
          payment: {
            method: 'UPI',
            amount: Math.floor(Math.random() * 500) + 100,
            status: 'Paid'
          },
          revenue: Math.floor(Math.random() * 500) + 100,
          createdAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000)
        };
        
        sampleTrackings.push(tracking);
      }
      
      await Tracking.insertMany(sampleTrackings);
      addedTrackings = sampleTrackings.length;
      console.log(`✅ Added ${addedTrackings} sample trackings`);
    }

    // Add sample shipment data if needed
    if (existingShipments < 5) {
      const statuses = ['Delivered', 'In Transit', 'Processing', 'Out for Delivery', 'Pending'];
      const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad'];
      
      const sampleShipments = [];
      for (let i = 0; i < 10; i++) {
        const daysAgo = Math.floor(Math.random() * 30);
        const shipment = {
          origin: cities[Math.floor(Math.random() * cities.length)],
          destination: cities[Math.floor(Math.random() * cities.length)],
          packageType: ['Document', 'Electronics', 'Clothing', 'Food'][Math.floor(Math.random() * 4)],
          weight: Math.floor(Math.random() * 10) + 1,
          price: Math.floor(Math.random() * 500) + 100,
          status: statuses[Math.floor(Math.random() * statuses.length)],
          senderName: `Sender ${i + 1}`,
          senderEmail: `sender${i + 1}@example.com`,
          receiverName: `Receiver ${i + 1}`,
          receiverEmail: `receiver${i + 1}@example.com`,
          createdAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000)
        };
        
        sampleShipments.push(shipment);
      }
      
      await Shipment.insertMany(sampleShipments);
      addedShipments = sampleShipments.length;
      console.log(`✅ Added ${addedShipments} sample shipments`);
    }

    // Get final counts
    const finalTracking = await Tracking.countDocuments();
    const finalUsers = await User.countDocuments({ role: 'user' });
    const finalShipments = await Shipment.countDocuments();

    res.json({
      success: true,
      message: 'Sample data added successfully',
      added: {
        users: addedUsers,
        trackings: addedTrackings,
        shipments: addedShipments
      },
      totals: {
        users: finalUsers,
        trackings: finalTracking,
        shipments: finalShipments
      }
    });

  } catch (error) {
    console.error('Error adding sample data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add sample data',
      error: error.message
    });
  }
});

export default router;