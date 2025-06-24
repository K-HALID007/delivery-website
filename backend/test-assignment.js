import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Tracking from './models/tracking.model.js';
import Partner from './models/partner.model.js';
import { autoAssignPartner } from './utils/autoAssignPartner.js';

dotenv.config();

async function testAssignment() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check all partners
    const allPartners = await Partner.find({});
    console.log(`📊 Total partners: ${allPartners.length}`);
    
    allPartners.forEach(partner => {
      console.log(`👤 Partner: ${partner.name} - Status: ${partner.status} - Online: ${partner.isOnline} - ID: ${partner._id}`);
    });

    // Check all deliveries
    const allDeliveries = await Tracking.find({}).sort({ createdAt: -1 }).limit(10);
    console.log(`📦 Recent deliveries: ${allDeliveries.length}`);
    
    allDeliveries.forEach(delivery => {
      console.log(`📋 Delivery: ${delivery.trackingId} - Status: ${delivery.status} - Assigned: ${delivery.assignedPartner || 'None'} - Created: ${delivery.createdAt}`);
    });

    // Find unassigned deliveries
    const unassignedDeliveries = await Tracking.find({
      $or: [
        { assignedPartner: { $exists: false } },
        { assignedPartner: null }
      ]
    });

    console.log(`🔍 Unassigned deliveries: ${unassignedDeliveries.length}`);
    
    if (unassignedDeliveries.length > 0) {
      console.log('📋 Unassigned delivery details:');
      unassignedDeliveries.forEach(delivery => {
        console.log(`  - ${delivery.trackingId}: Status=${delivery.status}, Created=${delivery.createdAt}`);
      });

      // Try to assign the first unassigned delivery
      const testDelivery = unassignedDeliveries[0];
      console.log(`🔄 Attempting to assign delivery: ${testDelivery.trackingId}`);
      
      const assignedPartner = await autoAssignPartner(testDelivery);
      if (assignedPartner) {
        console.log(`✅ Successfully assigned ${testDelivery.trackingId} to ${assignedPartner.name}`);
        
        // Verify the assignment
        const updatedDelivery = await Tracking.findOne({ trackingId: testDelivery.trackingId });
        console.log(`🔍 Verification - Assigned Partner: ${updatedDelivery.assignedPartner}`);
      } else {
        console.log(`❌ Failed to assign ${testDelivery.trackingId}`);
      }
    }

    // Check partner deliveries for the first partner
    if (allPartners.length > 0) {
      const firstPartner = allPartners[0];
      const partnerDeliveries = await Tracking.find({ assignedPartner: firstPartner._id });
      console.log(`📦 Partner ${firstPartner.name} has ${partnerDeliveries.length} assigned deliveries`);
      
      if (partnerDeliveries.length > 0) {
        console.log('📋 Partner delivery details:');
        partnerDeliveries.forEach(delivery => {
          console.log(`  - ${delivery.trackingId}: Status=${delivery.status}, Assigned=${delivery.assignedAt}`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Test error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testAssignment();