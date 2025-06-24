import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Tracking from './models/tracking.model.js';
import Partner from './models/partner.model.js';

dotenv.config();

async function fixAssignments() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find deliveries that have assignedPartner but missing assignedAt
    const deliveriesNeedingFix = await Tracking.find({
      assignedPartner: { $exists: true, $ne: null },
      $or: [
        { assignedAt: { $exists: false } },
        { assignedAt: null }
      ]
    });

    console.log(`🔧 Found ${deliveriesNeedingFix.length} deliveries needing assignedAt fix`);

    if (deliveriesNeedingFix.length > 0) {
      for (const delivery of deliveriesNeedingFix) {
        // Set assignedAt to the creation date or a reasonable timestamp
        const assignedAt = delivery.createdAt || new Date();
        
        await Tracking.findByIdAndUpdate(delivery._id, {
          assignedAt: assignedAt
        });

        console.log(`✅ Fixed ${delivery.trackingId} - set assignedAt to ${assignedAt}`);
      }
    }

    // Now let's test partner deliveries query
    const allPartners = await Partner.find({ status: 'approved' });
    console.log(`\n📊 Testing partner deliveries for ${allPartners.length} approved partners:`);

    for (const partner of allPartners) {
      const partnerDeliveries = await Tracking.find({ 
        assignedPartner: partner._id 
      }).sort({ createdAt: -1 });

      console.log(`\n👤 Partner: ${partner.name} (${partner._id})`);
      console.log(`📦 Total assigned deliveries: ${partnerDeliveries.length}`);
      
      if (partnerDeliveries.length > 0) {
        console.log('📋 Recent deliveries:');
        partnerDeliveries.slice(0, 5).forEach(delivery => {
          console.log(`  - ${delivery.trackingId}: Status=${delivery.status}, AssignedAt=${delivery.assignedAt || 'NOT SET'}`);
        });

        // Test the exact query used in partner controller
        const mongoose = await import('mongoose');
        const partnerObjectId = new mongoose.Types.ObjectId(partner._id);
        
        const controllerQuery = await Tracking.find({ assignedPartner: partnerObjectId });
        console.log(`🔍 Controller query result: ${controllerQuery.length} deliveries`);
        
        if (controllerQuery.length !== partnerDeliveries.length) {
          console.log(`⚠️ MISMATCH: Direct query found ${partnerDeliveries.length}, ObjectId query found ${controllerQuery.length}`);
        }
      }
    }

    // Test creating a new delivery and assigning it
    console.log('\n🧪 Testing new delivery creation and assignment...');
    
    const testDelivery = new Tracking({
      trackingId: `TEST${Date.now()}`,
      sender: {
        name: 'Test Sender',
        email: 'sender@test.com',
        phone: '1234567890'
      },
      receiver: {
        name: 'Test Receiver',
        email: 'receiver@test.com',
        phone: '0987654321'
      },
      origin: 'Test Origin',
      destination: 'Test Destination',
      status: 'Pending',
      packageDetails: {
        type: 'Document',
        weight: 1,
        dimensions: { length: 10, width: 10, height: 5 },
        description: 'Test package'
      },
      payment: {
        method: 'COD',
        amount: 100
      }
    });

    await testDelivery.save();
    console.log(`✅ Created test delivery: ${testDelivery.trackingId}`);

    // Try to assign it
    const { autoAssignPartner } = await import('./utils/autoAssignPartner.js');
    const assignedPartner = await autoAssignPartner(testDelivery);
    
    if (assignedPartner) {
      console.log(`✅ Successfully assigned test delivery to ${assignedPartner.name}`);
      
      // Verify the assignment
      const updatedDelivery = await Tracking.findOne({ trackingId: testDelivery.trackingId });
      console.log(`🔍 Verification:`);
      console.log(`  - Assigned Partner: ${updatedDelivery.assignedPartner}`);
      console.log(`  - Assigned At: ${updatedDelivery.assignedAt}`);
      console.log(`  - Status: ${updatedDelivery.status}`);
      
      // Test if partner can see this delivery
      const partnerCanSee = await Tracking.find({ 
        assignedPartner: new mongoose.Types.ObjectId(assignedPartner._id)
      });
      console.log(`🔍 Partner can see ${partnerCanSee.length} deliveries (should include the test delivery)`);
      
      // Clean up test delivery
      await Tracking.findByIdAndDelete(testDelivery._id);
      console.log(`🗑️ Cleaned up test delivery`);
    } else {
      console.log(`❌ Failed to assign test delivery`);
    }

  } catch (error) {
    console.error('❌ Fix error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

fixAssignments();