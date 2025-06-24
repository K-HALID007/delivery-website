import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Tracking from '../models/tracking.model.js';
import Shipment from '../models/shipment.model.js';

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB for adding sample revenue'))
  .catch(err => console.error('MongoDB connection error:', err));

async function addSampleRevenue() {
  try {
    console.log('Adding sample revenue data...');

    // Update existing tracking entries with revenue
    const trackingEntries = await Tracking.find({ revenue: { $lte: 0 } }).limit(20);
    
    for (const tracking of trackingEntries) {
      // Generate random revenue based on package weight and type
      const basePrice = 10;
      const weightMultiplier = tracking.packageDetails?.weight || 1;
      const typeMultiplier = tracking.packageDetails?.type === 'Express' ? 2 : 
                           tracking.packageDetails?.type === 'Standard' ? 1.5 : 1;
      
      const revenue = Math.round((basePrice + (weightMultiplier * 2) + Math.random() * 50) * typeMultiplier);
      
      tracking.revenue = revenue;
      await tracking.save();
      
      console.log(`Updated tracking ${tracking.trackingId} with revenue: $${revenue}`);
    }

    // Create some sample shipments with prices
    const sampleShipments = [
      {
        trackingNumber: 'TRK24001',
        customer: new mongoose.Types.ObjectId(),
        status: 'Delivered',
        origin: 'New York',
        destination: 'Los Angeles',
        price: 125.50,
        weight: 2.5,
        description: 'Electronics package'
      },
      {
        trackingNumber: 'TRK24002',
        customer: new mongoose.Types.ObjectId(),
        status: 'In Transit',
        origin: 'Chicago',
        destination: 'Miami',
        price: 89.99,
        weight: 1.8,
        description: 'Clothing items'
      },
      {
        trackingNumber: 'TRK24003',
        customer: new mongoose.Types.ObjectId(),
        status: 'Processing',
        origin: 'Seattle',
        destination: 'Boston',
        price: 156.75,
        weight: 3.2,
        description: 'Books and documents'
      },
      {
        trackingNumber: 'TRK24004',
        customer: new mongoose.Types.ObjectId(),
        status: 'Delivered',
        origin: 'Dallas',
        destination: 'Denver',
        price: 67.25,
        weight: 1.1,
        description: 'Small electronics'
      },
      {
        trackingNumber: 'TRK24005',
        customer: new mongoose.Types.ObjectId(),
        status: 'Delivered',
        origin: 'Phoenix',
        destination: 'Portland',
        price: 198.00,
        weight: 4.5,
        description: 'Home appliances'
      }
    ];

    for (const shipmentData of sampleShipments) {
      try {
        const existingShipment = await Shipment.findOne({ trackingNumber: shipmentData.trackingNumber });
        if (!existingShipment) {
          const shipment = new Shipment(shipmentData);
          await shipment.save();
          console.log(`Created shipment ${shipment.trackingNumber} with price: $${shipment.price}`);
        } else {
          console.log(`Shipment ${shipmentData.trackingNumber} already exists`);
        }
      } catch (error) {
        console.log(`Skipping shipment ${shipmentData.trackingNumber}: ${error.message}`);
      }
    }

    // Update some shipments with different dates for better analytics
    const existingShipments = await Shipment.find().limit(10);
    for (let i = 0; i < existingShipments.length; i++) {
      const shipment = existingShipments[i];
      const daysAgo = Math.floor(Math.random() * 180); // Random date within last 6 months
      const newDate = new Date();
      newDate.setDate(newDate.getDate() - daysAgo);
      
      shipment.createdAt = newDate;
      await shipment.save();
      console.log(`Updated shipment ${shipment.trackingNumber} date to ${newDate.toDateString()}`);
    }

    console.log('Sample revenue data added successfully!');
    console.log('\nRevenue Summary:');
    
    // Show summary
    const totalTrackingRevenue = await Tracking.aggregate([
      { $match: { revenue: { $gt: 0 } } },
      { $group: { _id: null, total: { $sum: '$revenue' }, count: { $sum: 1 } } }
    ]);

    const totalShipmentRevenue = await Shipment.aggregate([
      { $group: { _id: null, total: { $sum: '$price' }, count: { $sum: 1 } } }
    ]);

    console.log(`Tracking Revenue: $${totalTrackingRevenue[0]?.total || 0} from ${totalTrackingRevenue[0]?.count || 0} entries`);
    console.log(`Shipment Revenue: $${totalShipmentRevenue[0]?.total || 0} from ${totalShipmentRevenue[0]?.count || 0} entries`);
    console.log(`Total Revenue: $${(totalTrackingRevenue[0]?.total || 0) + (totalShipmentRevenue[0]?.total || 0)}`);

  } catch (error) {
    console.error('Error adding sample revenue:', error);
  } finally {
    mongoose.connection.close();
  }
}

addSampleRevenue();