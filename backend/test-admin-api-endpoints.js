import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

// Import models
import User from './models/user.model.js';
import Tracking from './models/tracking.model.js';
import Partner from './models/partner.model.js';

dotenv.config();

async function testAdminAPIEndpoints() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('🔍 TESTING ADMIN API ENDPOINTS DIRECTLY');
    console.log('='.repeat(60));

    // 1. Create admin token for testing
    console.log('\n1️⃣ CREATING ADMIN TOKEN FOR TESTING:');
    
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.log('❌ No admin user found in database');
      console.log('💡 Creating a test admin user...');
      
      const testAdmin = new User({
        name: 'Test Admin',
        email: 'admin@gmail.com',
        password: 'admin123',
        role: 'admin',
        isActive: true
      });
      
      await testAdmin.save();
      console.log('✅ Test admin created');
    } else {
      console.log(`✅ Admin user found: ${adminUser.name} (${adminUser.email})`);
    }

    // Generate token
    const token = jwt.sign(
      { userId: adminUser._id, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    console.log(`🔑 Generated admin token: ${token.substring(0, 50)}...`);

    // 2. Test Summary Endpoint Logic
    console.log('\n2️⃣ TESTING SUMMARY ENDPOINT LOGIC:');
    
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalPartners = await Partner.countDocuments();
    const activePartners = await Partner.countDocuments({ status: 'approved', isOnline: true });
    const pendingPartners = await Partner.countDocuments({ status: 'pending' });
    
    // Test different status queries for active shipments
    console.log('\n📊 Testing shipment status queries:');
    
    const allShipments = await Tracking.find({});
    console.log(`   Total shipments in DB: ${allShipments.length}`);
    
    allShipments.forEach(shipment => {
      console.log(`   - ${shipment.trackingId}: status="${shipment.status}"`);
    });
    
    // Test the exact query used in admin controller
    const activeShipments1 = await Tracking.countDocuments({ 
      status: { $in: ['In Transit', 'Processing', 'Out for Delivery'] } 
    });
    console.log(`   Active shipments (In Transit, Processing, Out for Delivery): ${activeShipments1}`);
    
    // Test with lowercase status
    const activeShipments2 = await Tracking.countDocuments({ 
      status: { $in: ['assigned', 'picked_up', 'in_transit', 'out_for_delivery'] } 
    });
    console.log(`   Active shipments (assigned, picked_up, in_transit, out_for_delivery): ${activeShipments2}`);
    
    const pendingDeliveries1 = await Tracking.countDocuments({ status: 'Pending' });
    console.log(`   Pending deliveries (Pending): ${pendingDeliveries1}`);
    
    const pendingDeliveries2 = await Tracking.countDocuments({ status: 'pending' });
    console.log(`   Pending deliveries (pending): ${pendingDeliveries2}`);

    // 3. Test Revenue Calculation
    console.log('\n3️⃣ TESTING REVENUE CALCULATION:');
    
    console.log('\n📊 Testing different revenue queries:');
    
    // Check all shipments with payment data
    const shipmentsWithPayment = await Tracking.find({ 'payment.amount': { $exists: true } });
    console.log(`   Shipments with payment.amount: ${shipmentsWithPayment.length}`);
    
    shipmentsWithPayment.forEach(shipment => {
      console.log(`   - ${shipment.trackingId}: payment.amount=${shipment.payment?.amount}, status=${shipment.status}`);
    });
    
    // Test revenue query from admin controller
    const revenueResult1 = await Tracking.aggregate([
      {
        $match: {
          status: { $in: ['Delivered', 'In Transit', 'Processing'] }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$revenue" }
        }
      }
    ]);
    console.log(`   Revenue from 'revenue' field (Delivered, In Transit, Processing): ${revenueResult1[0]?.totalRevenue || 0}`);
    
    // Test with payment.amount field
    const revenueResult2 = await Tracking.aggregate([
      {
        $match: {
          status: { $in: ['delivered', 'in_transit', 'processing'] },
          'payment.amount': { $exists: true }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$payment.amount" }
        }
      }
    ]);
    console.log(`   Revenue from 'payment.amount' field (delivered, in_transit, processing): ${revenueResult2[0]?.totalRevenue || 0}`);
    
    // Test with all delivered shipments
    const revenueResult3 = await Tracking.aggregate([
      {
        $match: {
          status: 'delivered',
          'payment.amount': { $exists: true }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$payment.amount" }
        }
      }
    ]);
    console.log(`   Revenue from delivered shipments only: ${revenueResult3[0]?.totalRevenue || 0}`);

    // 4. Create the exact summary response that admin controller should return
    console.log('\n4️⃣ CREATING CORRECT SUMMARY RESPONSE:');
    
    // Use the correct status values and revenue calculation
    const correctActiveShipments = activeShipments2; // Use lowercase statuses
    const correctPendingDeliveries = pendingDeliveries2; // Use lowercase
    const correctTotalRevenue = revenueResult3[0]?.totalRevenue || 0; // Use delivered shipments
    
    const correctSummaryData = {
      totalUsers,
      totalPartners,
      activePartners,
      pendingPartners,
      activeShipments: correctActiveShipments,
      pendingDeliveries: correctPendingDeliveries,
      totalRevenue: correctTotalRevenue
    };

    console.log('📊 CORRECT Summary Data:');
    console.log(JSON.stringify(correctSummaryData, null, 2));

    // 5. Test Recent Shipments Logic
    console.log('\n5️⃣ TESTING RECENT SHIPMENTS LOGIC:');
    
    const recentShipments = await Tracking.find()
      .sort({ createdAt: -1 })
      .limit(10);

    const formattedShipments = recentShipments.map(shipment => ({
      id: shipment.trackingId,
      customer: shipment.sender?.name || '-',
      status: shipment.status,
      origin: shipment.origin,
      destination: shipment.destination,
      currentLocation: shipment.currentLocation,
      date: shipment.createdAt
    }));

    console.log(`📦 Recent Shipments (${formattedShipments.length}):`);
    formattedShipments.forEach((shipment, index) => {
      console.log(`${index + 1}. ${shipment.id} - ${shipment.status} - ${shipment.customer}`);
    });

    // 6. Test Users Logic
    console.log('\n6️⃣ TESTING USERS LOGIC:');
    
    const users = await User.find().select('-password');
    console.log(`👥 Users (${users.length}):`);
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} - ${user.email} - ${user.role} - Active: ${user.isActive}`);
    });

    // 7. Simulate the exact API responses
    console.log('\n7️⃣ SIMULATING EXACT API RESPONSES:');
    
    console.log('\n📋 /api/admin/summary response:');
    console.log(JSON.stringify(correctSummaryData, null, 2));
    
    console.log('\n📋 /api/admin/shipments/recent response:');
    console.log(JSON.stringify(formattedShipments.slice(0, 3), null, 2));
    
    console.log('\n📋 /api/admin/users response:');
    console.log(JSON.stringify(users.slice(0, 2).map(u => ({
      _id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      isActive: u.isActive
    })), null, 2));

    // 8. Check why frontend might be getting 0 values
    console.log('\n8️⃣ DIAGNOSING FRONTEND ZERO VALUES:');
    
    console.log('\n🔍 Possible reasons for zero values in frontend:');
    
    if (correctTotalRevenue === 0) {
      console.log('❌ Revenue is actually 0 because:');
      console.log('   - No shipments have status "delivered"');
      console.log('   - No shipments have payment.amount field');
      console.log('   - Revenue calculation logic is wrong');
    } else {
      console.log(`✅ Revenue should be ${correctTotalRevenue}, not 0`);
    }
    
    if (correctActiveShipments === 0) {
      console.log('❌ Active shipments is 0 because:');
      console.log('   - No shipments have the expected status values');
      console.log('   - Status matching is case-sensitive');
    } else {
      console.log(`✅ Active shipments should be ${correctActiveShipments}, not 0`);
    }

    // 9. Create a fixed admin controller response
    console.log('\n9️⃣ CREATING FIXED ADMIN CONTROLLER RESPONSE:');
    
    // This is what the admin controller should actually return
    const fixedResponse = {
      success: true,
      totalUsers: totalUsers,
      totalPartners: totalPartners,
      activePartners: activePartners,
      pendingPartners: pendingPartners,
      activeShipments: correctActiveShipments,
      pendingDeliveries: correctPendingDeliveries,
      totalRevenue: correctTotalRevenue,
      debug: {
        allShipmentsCount: allShipments.length,
        shipmentsWithPayment: shipmentsWithPayment.length,
        deliveredShipments: await Tracking.countDocuments({ status: 'delivered' }),
        statusBreakdown: await Tracking.aggregate([
          { $group: { _id: '$status', count: { $sum: 1 } } }
        ])
      }
    };

    console.log('🔧 FIXED Admin Controller Response:');
    console.log(JSON.stringify(fixedResponse, null, 2));

    console.log('\n🎉 ADMIN API ENDPOINTS TEST COMPLETED!');
    console.log('\n📋 FINDINGS:');
    console.log(`✅ Total Users: ${totalUsers}`);
    console.log(`✅ Active Shipments: ${correctActiveShipments}`);
    console.log(`✅ Total Revenue: ₹${correctTotalRevenue}`);
    console.log(`✅ Recent Shipments: ${formattedShipments.length}`);
    
    if (correctTotalRevenue === 0) {
      console.log('\n⚠️ REVENUE IS ZERO BECAUSE:');
      console.log('   - Need to check if shipments have payment.amount field');
      console.log('   - Need to check if any shipments are marked as "delivered"');
      console.log('   - Revenue calculation might need to be fixed');
    }

  } catch (error) {
    console.error('❌ Test error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testAdminAPIEndpoints();