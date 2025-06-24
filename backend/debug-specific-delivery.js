import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Tracking from './models/tracking.model.js';
import Partner from './models/partner.model.js';
import { autoAssignPartner } from './utils/autoAssignPartner.js';

dotenv.config();

async function debugSpecificDelivery() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const trackingId = 'TRK25064288';
    console.log(`🔍 DEBUGGING DELIVERY: ${trackingId}`);
    console.log('='.repeat(50));

    // 1. Find the specific delivery
    console.log('\n1️⃣ FINDING DELIVERY IN DATABASE:');
    const delivery = await Tracking.findOne({ trackingId });
    
    if (!delivery) {
      console.log(`❌ Delivery ${trackingId} NOT FOUND in database!`);
      return;
    }

    console.log(`✅ Delivery found: ${trackingId}`);
    console.log(`📋 Delivery Details:`);
    console.log(`   - Status: ${delivery.status}`);
    console.log(`   - Created: ${delivery.createdAt}`);
    console.log(`   - Updated: ${delivery.updatedAt}`);
    console.log(`   - Assigned Partner: ${delivery.assignedPartner || 'NOT ASSIGNED'}`);
    console.log(`   - Assigned At: ${delivery.assignedAt || 'NOT SET'}`);
    console.log(`   - Partner Earnings: ${delivery.partnerEarnings || 'NOT SET'}`);
    console.log(`   - Sender: ${delivery.sender.name}`);
    console.log(`   - Receiver: ${delivery.receiver.name}`);

    // 2. Check if delivery is assigned
    if (!delivery.assignedPartner) {
      console.log('\n2️⃣ DELIVERY NOT ASSIGNED - ATTEMPTING AUTO-ASSIGNMENT:');
      
      // Check available partners
      const availablePartners = await Partner.find({ status: 'approved' });
      console.log(`📊 Available partners: ${availablePartners.length}`);
      
      availablePartners.forEach(partner => {
        console.log(`👤 ${partner.name} - Online: ${partner.isOnline} - Active: ${partner.isActive}`);
      });

      // Try to assign
      const assignedPartner = await autoAssignPartner(delivery);
      if (assignedPartner) {
        console.log(`✅ Successfully assigned to: ${assignedPartner.name}`);
        
        // Verify assignment
        const updatedDelivery = await Tracking.findOne({ trackingId });
        console.log(`🔍 Post-assignment verification:`);
        console.log(`   - Assigned Partner: ${updatedDelivery.assignedPartner}`);
        console.log(`   - Assigned At: ${updatedDelivery.assignedAt}`);
        console.log(`   - Status: ${updatedDelivery.status}`);
      } else {
        console.log(`❌ Failed to assign delivery`);
      }
    } else {
      console.log('\n2️⃣ DELIVERY IS ALREADY ASSIGNED');
      
      // Find the assigned partner
      const assignedPartner = await Partner.findById(delivery.assignedPartner);
      if (assignedPartner) {
        console.log(`👤 Assigned to: ${assignedPartner.name} (${assignedPartner._id})`);
        console.log(`📊 Partner Status: ${assignedPartner.status}`);
        console.log(`🟢 Partner Online: ${assignedPartner.isOnline}`);
        console.log(`✅ Partner Active: ${assignedPartner.isActive}`);
      } else {
        console.log(`❌ Assigned partner not found in database!`);
      }
    }

    // 3. Test partner queries
    console.log('\n3️⃣ TESTING PARTNER QUERIES:');
    
    const allPartners = await Partner.find({ status: 'approved' });
    
    for (const partner of allPartners) {
      console.log(`\n👤 Testing queries for partner: ${partner.name}`);
      
      // Query 1: Direct ObjectId query
      const partnerObjectId = new mongoose.Types.ObjectId(partner._id);
      const directQuery = await Tracking.find({ assignedPartner: partnerObjectId });
      console.log(`   📦 Direct ObjectId query: ${directQuery.length} deliveries`);
      
      // Query 2: String ID query
      const stringQuery = await Tracking.find({ assignedPartner: partner._id.toString() });
      console.log(`   📦 String ID query: ${stringQuery.length} deliveries`);
      
      // Query 3: Check if our specific delivery is in results
      const hasOurDelivery = directQuery.some(d => d.trackingId === trackingId);
      console.log(`   🎯 Contains ${trackingId}: ${hasOurDelivery ? 'YES' : 'NO'}`);
      
      if (hasOurDelivery) {
        console.log(`   ✅ Partner ${partner.name} CAN see delivery ${trackingId}`);
      }
    }

    // 4. Test API-like query
    console.log('\n4️⃣ TESTING API-LIKE QUERIES:');
    
    if (delivery.assignedPartner) {
      const partnerObjectId = new mongoose.Types.ObjectId(delivery.assignedPartner);
      
      // Simulate the exact query from partner controller
      const apiQuery = { assignedPartner: partnerObjectId };
      const apiResults = await Tracking.find(apiQuery)
        .populate('sender receiver', 'name phone email address')
        .sort({ createdAt: -1 });
      
      console.log(`📡 API-like query results: ${apiResults.length} deliveries`);
      
      const ourDeliveryInAPI = apiResults.find(d => d.trackingId === trackingId);
      if (ourDeliveryInAPI) {
        console.log(`✅ Delivery ${trackingId} FOUND in API results`);
        console.log(`   - Status: ${ourDeliveryInAPI.status}`);
        console.log(`   - Sender: ${ourDeliveryInAPI.sender.name}`);
        console.log(`   - Receiver: ${ourDeliveryInAPI.receiver.name}`);
      } else {
        console.log(`❌ Delivery ${trackingId} NOT FOUND in API results`);
      }

      // Test with status filter
      const statusFilters = ['assigned', 'picked_up', 'in_transit', 'delivered'];
      for (const status of statusFilters) {
        const statusQuery = await Tracking.find({
          assignedPartner: partnerObjectId,
          status: status
        });
        console.log(`   📋 Status '${status}': ${statusQuery.length} deliveries`);
        
        if (statusQuery.some(d => d.trackingId === trackingId)) {
          console.log(`   ✅ ${trackingId} found in '${status}' filter`);
        }
      }
    }

    // 5. Check recent deliveries
    console.log('\n5️⃣ CHECKING RECENT DELIVERIES:');
    
    const recentDeliveries = await Tracking.find({})
      .sort({ createdAt: -1 })
      .limit(10);
    
    console.log(`📅 Recent 10 deliveries:`);
    recentDeliveries.forEach((d, index) => {
      const isOurDelivery = d.trackingId === trackingId;
      console.log(`${index + 1}. ${d.trackingId} - ${d.status} - Partner: ${d.assignedPartner || 'None'} ${isOurDelivery ? '← THIS IS OUR DELIVERY' : ''}`);
    });

    // 6. Final recommendation
    console.log('\n6️⃣ FINAL ANALYSIS:');
    
    const finalDelivery = await Tracking.findOne({ trackingId });
    
    if (!finalDelivery.assignedPartner) {
      console.log(`❌ ISSUE: Delivery ${trackingId} is not assigned to any partner`);
      console.log(`💡 SOLUTION: Run auto-assignment or manually assign to a partner`);
    } else if (!finalDelivery.assignedAt) {
      console.log(`❌ ISSUE: Delivery ${trackingId} has assignedPartner but no assignedAt timestamp`);
      console.log(`💡 SOLUTION: Update assignedAt field`);
    } else {
      const partner = await Partner.findById(finalDelivery.assignedPartner);
      if (!partner) {
        console.log(`❌ ISSUE: Assigned partner not found in database`);
      } else if (partner.status !== 'approved') {
        console.log(`❌ ISSUE: Assigned partner is not approved (status: ${partner.status})`);
      } else if (!partner.isActive) {
        console.log(`❌ ISSUE: Assigned partner is not active`);
      } else {
        console.log(`✅ Delivery ${trackingId} should be visible to partner ${partner.name}`);
        console.log(`💡 If partner can't see it, check frontend issues:`);
        console.log(`   - Partner authentication`);
        console.log(`   - Frontend API calls`);
        console.log(`   - Browser cache`);
        console.log(`   - Network connectivity`);
      }
    }

  } catch (error) {
    console.error('❌ Debug error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

debugSpecificDelivery();