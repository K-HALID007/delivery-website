import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Tracking from './models/tracking.model.js';
import User from './models/user.model.js';
import Partner from './models/partner.model.js';

dotenv.config();

async function testAdminDashboardData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('🔍 TESTING ADMIN DASHBOARD DATA ENDPOINTS');
    console.log('='.repeat(60));

    // 1. Test Summary Endpoint Data
    console.log('\n1️⃣ TESTING SUMMARY ENDPOINT DATA:');
    
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalPartners = await Partner.countDocuments();
    const activePartners = await Partner.countDocuments({ status: 'approved', isOnline: true });
    const pendingPartners = await Partner.countDocuments({ status: 'pending' });
    const activeShipments = await Tracking.countDocuments({ 
      status: { $in: ['assigned', 'picked_up', 'in_transit', 'out_for_delivery'] } 
    });
    const pendingDeliveries = await Tracking.countDocuments({ status: 'Pending' });
    
    // Calculate total revenue
    const revenueResult = await Tracking.aggregate([
      { $match: { status: 'delivered', 'payment.amount': { $exists: true } } },
      { $group: { _id: null, total: { $sum: '$payment.amount' } } }
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    const summaryData = {
      totalUsers,
      totalPartners,
      activePartners,
      pendingPartners,
      activeShipments,
      pendingDeliveries,
      totalRevenue
    };

    console.log('📊 Summary Data (what admin dashboard should receive):');
    console.log(JSON.stringify(summaryData, null, 2));

    // 2. Test Recent Shipments Data
    console.log('\n2️⃣ TESTING RECENT SHIPMENTS DATA:');
    
    const recentShipments = await Tracking.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const formattedShipments = recentShipments.map(shipment => ({
      id: shipment.trackingId,
      trackingId: shipment.trackingId,
      customer: shipment.sender?.name || '-',
      status: shipment.status,
      origin: shipment.origin,
      destination: shipment.destination,
      currentLocation: shipment.currentLocation,
      date: shipment.createdAt,
      sender: shipment.sender,
      receiver: shipment.receiver
    }));

    console.log(`📦 Recent Shipments Data (${formattedShipments.length} shipments):`);
    formattedShipments.forEach((shipment, index) => {
      console.log(`${index + 1}. ${shipment.trackingId} - ${shipment.status}`);
      console.log(`   Customer: ${shipment.customer}`);
      console.log(`   Route: ${shipment.origin} → ${shipment.destination}`);
      console.log(`   Date: ${shipment.date}`);
    });

    // 3. Test Users Data
    console.log('\n3️⃣ TESTING USERS DATA:');
    
    const users = await User.find().select('-password').lean();
    console.log(`👥 Users Data (${users.length} users):`);
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} - ${user.email}`);
      console.log(`   Role: ${user.role} | Active: ${user.isActive}`);
    });

    // 4. Test Analytics Data
    console.log('\n4️⃣ TESTING ANALYTICS DATA:');
    
    // Status distribution
    const statusDistribution = await Tracking.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    console.log('📈 Status Distribution:');
    statusDistribution.forEach(status => {
      console.log(`   ${status._id}: ${status.count}`);
    });

    // Shipment trends (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const shipmentTrends = await Tracking.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    console.log('📊 Shipment Trends (Last 7 days):');
    shipmentTrends.forEach(trend => {
      console.log(`   ${trend._id}: ${trend.count} shipments`);
    });

    // 5. Test API Response Format
    console.log('\n5️⃣ TESTING API RESPONSE FORMATS:');
    
    console.log('\n📋 Summary API Response Format:');
    console.log(JSON.stringify({
      success: true,
      ...summaryData
    }, null, 2));

    console.log('\n📋 Recent Shipments API Response Format:');
    console.log(JSON.stringify(formattedShipments.slice(0, 3), null, 2));

    console.log('\n📋 Users API Response Format:');
    console.log(JSON.stringify(users.slice(0, 2).map(u => ({
      _id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      isActive: u.isActive,
      createdAt: u.createdAt
    })), null, 2));

    // 6. Check for Data Issues
    console.log('\n6️⃣ CHECKING FOR DATA DISPLAY ISSUES:');
    
    // Check if shipments have required fields
    const shipmentsWithMissingData = await Tracking.find({
      $or: [
        { trackingId: { $exists: false } },
        { status: { $exists: false } },
        { 'sender.name': { $exists: false } }
      ]
    });

    console.log(`🔍 Shipments with missing data: ${shipmentsWithMissingData.length}`);
    
    if (shipmentsWithMissingData.length > 0) {
      console.log('⚠️ Found shipments with missing required fields:');
      shipmentsWithMissingData.forEach(shipment => {
        console.log(`   - ${shipment._id}: Missing fields detected`);
      });
    }

    // Check if users have required fields
    const usersWithMissingData = await User.find({
      $or: [
        { name: { $exists: false } },
        { email: { $exists: false } },
        { role: { $exists: false } }
      ]
    });

    console.log(`🔍 Users with missing data: ${usersWithMissingData.length}`);

    // 7. Test Real API Calls (simulate what frontend does)
    console.log('\n7️⃣ SIMULATING FRONTEND API CALLS:');
    
    console.log('\n🌐 Simulating Summary API Call:');
    try {
      const summaryResponse = {
        totalUsers,
        totalPartners,
        activePartners,
        pendingPartners,
        activeShipments,
        pendingDeliveries,
        totalRevenue
      };
      console.log('✅ Summary API would return:', summaryResponse);
    } catch (error) {
      console.log('❌ Summary API would fail:', error.message);
    }

    console.log('\n🌐 Simulating Recent Shipments API Call:');
    try {
      console.log(`✅ Recent Shipments API would return ${formattedShipments.length} shipments`);
      if (formattedShipments.length === 0) {
        console.log('⚠️ No shipments found - this is why admin dashboard shows empty');
      }
    } catch (error) {
      console.log('❌ Recent Shipments API would fail:', error.message);
    }

    console.log('\n🌐 Simulating Users API Call:');
    try {
      console.log(`✅ Users API would return ${users.length} users`);
      if (users.length === 0) {
        console.log('⚠️ No users found - this is why admin dashboard shows empty');
      }
    } catch (error) {
      console.log('❌ Users API would fail:', error.message);
    }

    // 8. Generate Test Data if Empty
    if (formattedShipments.length === 0) {
      console.log('\n8️⃣ GENERATING TEST DATA (shipments are empty):');
      
      // This would be done in a separate script, just showing what's needed
      console.log('💡 To fix empty shipments, you need to:');
      console.log('   1. Create some test shipments');
      console.log('   2. Ensure they have proper sender/receiver data');
      console.log('   3. Set appropriate status values');
    }

    if (users.length === 0) {
      console.log('\n8️⃣ GENERATING TEST DATA (users are empty):');
      console.log('💡 To fix empty users, you need to:');
      console.log('   1. Create some test users');
      console.log('   2. Ensure they have proper role assignments');
      console.log('   3. Set isActive status');
    }

    console.log('\n🎉 ADMIN DASHBOARD DATA TEST COMPLETED!');
    console.log('\n📋 SUMMARY:');
    console.log(`✅ Total Shipments: ${recentShipments.length}`);
    console.log(`✅ Total Users: ${users.length}`);
    console.log(`✅ Total Revenue: ₹${totalRevenue}`);
    console.log(`✅ Active Shipments: ${activeShipments}`);
    
    if (recentShipments.length === 0) {
      console.log('\n❌ ISSUE FOUND: No shipments in database');
      console.log('💡 This is why admin dashboard shows empty shipments');
    }
    
    if (users.length === 0) {
      console.log('\n❌ ISSUE FOUND: No users in database');
      console.log('💡 This is why admin dashboard shows empty users');
    }

  } catch (error) {
    console.error('❌ Test error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testAdminDashboardData();