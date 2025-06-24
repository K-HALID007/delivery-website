import mongoose from 'mongoose';
import Tracking from '../models/tracking.model.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const fixCODPayments = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find all delivered COD orders with pending payment status
    const deliveredCODOrders = await Tracking.find({
      status: { $regex: /delivered/i },
      'payment.method': 'COD',
      'payment.status': 'Pending'
    });

    console.log(`🔍 Found ${deliveredCODOrders.length} delivered COD orders with pending payment status`);

    if (deliveredCODOrders.length === 0) {
      console.log('✅ No COD orders need fixing');
      return;
    }

    // Update each order
    let updatedCount = 0;
    for (const order of deliveredCODOrders) {
      try {
        order.payment.status = 'Completed';
        order.payment.paidAt = order.deliveredAt || new Date();
        await order.save();
        
        console.log(`✅ Fixed COD payment for order: ${order.trackingId}`);
        updatedCount++;
      } catch (error) {
        console.error(`❌ Failed to fix order ${order.trackingId}:`, error.message);
      }
    }

    console.log(`\n🎉 Successfully updated ${updatedCount} out of ${deliveredCODOrders.length} COD orders`);

    // Show summary of fixed orders
    if (updatedCount > 0) {
      console.log('\n📋 Summary of fixed orders:');
      const fixedOrders = await Tracking.find({
        trackingId: { $in: deliveredCODOrders.map(o => o.trackingId) },
        'payment.method': 'COD',
        'payment.status': 'Completed'
      }).select('trackingId payment.status payment.paidAt status');

      fixedOrders.forEach(order => {
        console.log(`   - ${order.trackingId}: Payment ${order.payment.status}, Paid at: ${order.payment.paidAt}`);
      });
    }

  } catch (error) {
    console.error('❌ Error fixing COD payments:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
};

// Run the script
fixCODPayments();