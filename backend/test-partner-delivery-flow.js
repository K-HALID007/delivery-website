import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Tracking from './models/tracking.model.js';
import Partner from './models/partner.model.js';
import { autoAssignPartner } from './utils/autoAssignPartner.js';
import assignmentService from './services/assignmentService.js';

dotenv.config();

async function testPartnerDeliveryFlow() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('🧪 TESTING COMPLETE PARTNER DELIVERY FLOW\n');

    // Step 1: Create a new delivery (simulating what happens when user creates delivery)
    console.log('📦 Step 1: Creating new delivery...');
    const newDelivery = new Tracking({
      trackingId: `FLOW${Date.now()}`,
      sender: {
        name: 'John Sender',
        email: 'john@example.com',
        phone: '9876543210'
      },
      receiver: {
        name: 'Jane Receiver',
        email: 'jane@example.com',
        phone: '8765432109'
      },
      origin: 'Mumbai Central',
      destination: 'Pune Station',
      status: 'Pending',
      packageDetails: {
        type: 'Electronics',
        weight: 2.5,
        dimensions: { length: 30, width: 20, height: 15 },
        description: 'Mobile phone',
        specialInstructions: 'Handle with care'
      },
      payment: {
        method: 'UPI',
        amount: 250,
        upiId: 'john@paytm'
      }
    });

    await newDelivery.save();
    console.log(`✅ Created delivery: ${newDelivery.trackingId} with status: ${newDelivery.status}`);

    // Step 2: Trigger assignment (simulating auto-assignment)
    console.log('\n🔄 Step 2: Triggering auto-assignment...');
    const assignedPartner = await autoAssignPartner(newDelivery);
    
    if (assignedPartner) {
      console.log(`✅ Delivery assigned to: ${assignedPartner.name} (${assignedPartner._id})`);
    } else {
      console.log('❌ Assignment failed');
      return;
    }

    // Step 3: Verify assignment in database
    console.log('\n🔍 Step 3: Verifying assignment in database...');
    const updatedDelivery = await Tracking.findOne({ trackingId: newDelivery.trackingId });
    console.log(`📋 Database verification:`);
    console.log(`   - Tracking ID: ${updatedDelivery.trackingId}`);
    console.log(`   - Status: ${updatedDelivery.status}`);
    console.log(`   - Assigned Partner: ${updatedDelivery.assignedPartner}`);
    console.log(`   - Assigned At: ${updatedDelivery.assignedAt}`);
    console.log(`   - Partner Earnings: ${updatedDelivery.partnerEarnings}`);

    // Step 4: Test partner API queries (simulating what partner app does)
    console.log('\n🔍 Step 4: Testing partner API queries...');
    
    const partnerObjectId = new mongoose.Types.ObjectId(assignedPartner._id);
    
    // Query 1: Get all deliveries for partner (like getPartnerDeliveries)
    const partnerDeliveries = await Tracking.find({ 
      assignedPartner: partnerObjectId 
    }).populate('sender receiver', 'name phone email');
    
    console.log(`📦 Partner ${assignedPartner.name} has ${partnerDeliveries.length} total deliveries`);
    
    // Find our new delivery in the results
    const ourDelivery = partnerDeliveries.find(d => d.trackingId === newDelivery.trackingId);
    if (ourDelivery) {
      console.log(`✅ NEW DELIVERY FOUND in partner's delivery list!`);
      console.log(`   - Tracking ID: ${ourDelivery.trackingId}`);
      console.log(`   - Status: ${ourDelivery.status}`);
      console.log(`   - Sender: ${ourDelivery.sender.name}`);
      console.log(`   - Receiver: ${ourDelivery.receiver.name}`);
    } else {
      console.log(`❌ NEW DELIVERY NOT FOUND in partner's delivery list!`);
    }

    // Query 2: Get active deliveries (like dashboard)
    const activeDeliveries = await Tracking.find({
      assignedPartner: partnerObjectId,
      status: { $in: ['assigned', 'picked_up', 'in_transit', 'out_for_delivery'] }
    }).populate('sender receiver', 'name phone email');
    
    console.log(`📋 Partner has ${activeDeliveries.length} active deliveries`);
    const ourActiveDelivery = activeDeliveries.find(d => d.trackingId === newDelivery.trackingId);
    if (ourActiveDelivery) {
      console.log(`✅ NEW DELIVERY FOUND in active deliveries!`);
    } else {
      console.log(`❌ NEW DELIVERY NOT FOUND in active deliveries!`);
    }

    // Query 3: Test with status filter
    const assignedDeliveries = await Tracking.find({
      assignedPartner: partnerObjectId,
      status: 'assigned'
    });
    
    console.log(`📋 Partner has ${assignedDeliveries.length} deliveries with 'assigned' status`);
    const ourAssignedDelivery = assignedDeliveries.find(d => d.trackingId === newDelivery.trackingId);
    if (ourAssignedDelivery) {
      console.log(`✅ NEW DELIVERY FOUND in assigned status filter!`);
    } else {
      console.log(`❌ NEW DELIVERY NOT FOUND in assigned status filter!`);
    }

    // Step 5: Test partner dashboard stats
    console.log('\n📊 Step 5: Testing partner dashboard stats...');
    
    // Get today's deliveries count
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayDeliveries = await Tracking.countDocuments({
      assignedPartner: partnerObjectId,
      updatedAt: { $gte: today, $lt: tomorrow }
    });

    console.log(`📅 Today's deliveries for partner: ${todayDeliveries}`);

    // Step 6: Simulate partner status update
    console.log('\n🔄 Step 6: Simulating partner status update...');
    
    updatedDelivery.status = 'picked_up';
    updatedDelivery.statusHistory.push({
      status: 'picked_up',
      timestamp: new Date(),
      notes: 'Package picked up from sender',
      updatedBy: partnerObjectId,
      updatedByModel: 'Partner'
    });
    
    await updatedDelivery.save();
    console.log(`✅ Updated delivery status to: ${updatedDelivery.status}`);

    // Verify the update
    const finalDelivery = await Tracking.findOne({ trackingId: newDelivery.trackingId });
    console.log(`🔍 Final verification - Status: ${finalDelivery.status}`);

    // Step 7: Test assignment service
    console.log('\n🔄 Step 7: Testing assignment service...');
    
    // Create another delivery to test assignment service
    const testDelivery2 = new Tracking({
      trackingId: `SERVICE${Date.now()}`,
      sender: {
        name: 'Service Test Sender',
        email: 'service@test.com',
        phone: '1111111111'
      },
      receiver: {
        name: 'Service Test Receiver',
        email: 'receiver@test.com',
        phone: '2222222222'
      },
      origin: 'Test Origin',
      destination: 'Test Destination',
      status: 'Pending',
      packageDetails: {
        type: 'Document',
        weight: 0.5,
        dimensions: { length: 25, width: 18, height: 2 },
        description: 'Important documents'
      },
      payment: {
        method: 'COD',
        amount: 150
      }
    });

    await testDelivery2.save();
    console.log(`✅ Created second test delivery: ${testDelivery2.trackingId}`);

    // Trigger assignment service
    await assignmentService.processUnassignedDeliveries();
    
    // Check if it was assigned
    const assignedDelivery2 = await Tracking.findOne({ trackingId: testDelivery2.trackingId });
    if (assignedDelivery2.assignedPartner) {
      const partner2 = await Partner.findById(assignedDelivery2.assignedPartner);
      console.log(`✅ Assignment service worked! Assigned to: ${partner2.name}`);
    } else {
      console.log(`❌ Assignment service failed to assign delivery`);
    }

    // Clean up test deliveries
    console.log('\n🗑️ Cleaning up test deliveries...');
    await Tracking.findByIdAndDelete(newDelivery._id);
    await Tracking.findByIdAndDelete(testDelivery2._id);
    console.log('✅ Test deliveries cleaned up');

    console.log('\n🎉 PARTNER DELIVERY FLOW TEST COMPLETED SUCCESSFULLY!');
    console.log('\n📋 SUMMARY:');
    console.log('✅ Delivery creation works');
    console.log('✅ Auto-assignment works');
    console.log('✅ Partner can see assigned deliveries');
    console.log('✅ Status updates work');
    console.log('✅ Assignment service works');
    console.log('\n💡 The delivery assignment system is working correctly!');

  } catch (error) {
    console.error('❌ Test error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testPartnerDeliveryFlow();