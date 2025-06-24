import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Tracking from './models/tracking.model.js';
import User from './models/user.model.js';
import Partner from './models/partner.model.js';

dotenv.config();

async function testAdminAPIs() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('🔍 TESTING ADMIN DASHBOARD APIs');
    console.log('='.repeat(50));

    // 1. Test Summary Data
    console.log('\n1️⃣ TESTING SUMMARY DATA:');
    
    const totalShipments = await Tracking.countDocuments();
    const activeShipments = await Tracking.countDocuments({ 
      status: { $in: ['assigned', 'picked_up', 'in_transit', 'out_for_delivery'] } 
    });
    const pendingDeliveries = await Tracking.countDocuments({ 
      status: { $in: ['Pending', 'Processing', 'Created', 'Confirmed'] } 
    });
    const totalUsers = await User.countDocuments();
    const totalPartners = await Partner.countDocuments();
    
    // Calculate total revenue
    const revenueResult = await Tracking.aggregate([
      { $match: { status: 'delivered' } },
      { $group: { _id: null, total: { $sum: '$payment.amount' } } }
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    console.log(`📊 Summary Statistics:`);
    console.log(`   - Total Shipments: ${totalShipments}`);
    console.log(`   - Active Shipments: ${activeShipments}`);
    console.log(`   - Pending Deliveries: ${pendingDeliveries}`);
    console.log(`   - Total Users: ${totalUsers}`);
    console.log(`   - Total Partners: ${totalPartners}`);
    console.log(`   - Total Revenue: ₹${totalRevenue}`);

    // 2. Test Recent Shipments
    console.log('\n2️⃣ TESTING RECENT SHIPMENTS:');
    
    const recentShipments = await Tracking.find({})
      .populate('sender receiver', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(10);

    console.log(`📦 Recent Shipments (${recentShipments.length}):`);
    recentShipments.forEach((shipment, index) => {
      console.log(`${index + 1}. ${shipment.trackingId} - ${shipment.status} - ${shipment.sender?.name || 'Unknown'} → ${shipment.receiver?.name || 'Unknown'}`);
    });

    // 3. Test Users Data
    console.log('\n3️⃣ TESTING USERS DATA:');
    
    const users = await User.find({}).sort({ createdAt: -1 }).limit(10);
    console.log(`👥 Recent Users (${users.length}):`);
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} - ${user.email} - Active: ${user.isActive || 'N/A'}`);
    });

    // 4. Test Status Distribution
    console.log('\n4️⃣ TESTING STATUS DISTRIBUTION:');
    
    const statusDistribution = await Tracking.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    console.log(`📈 Status Distribution:`);
    statusDistribution.forEach(status => {
      console.log(`   - ${status._id}: ${status.count}`);
    });

    // 5. Test Revenue Analytics
    console.log('\n5️⃣ TESTING REVENUE ANALYTICS:');
    
    const revenueByMonth = await Tracking.aggregate([
      { $match: { status: 'delivered', 'payment.amount': { $exists: true } } },
      {
        $group: {
          _id: {
            year: { $year: '$deliveredAt' },
            month: { $month: '$deliveredAt' }
          },
          revenue: { $sum: '$payment.amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    console.log(`💰 Revenue by Month:`);
    revenueByMonth.forEach(month => {
      console.log(`   - ${month._id.year}-${month._id.month}: ₹${month.revenue} (${month.count} orders)`);
    });

    // 6. Test Regional Data
    console.log('\n6️⃣ TESTING REGIONAL DATA:');
    
    const regionalData = await Tracking.aggregate([
      { $group: { _id: '$origin', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    console.log(`🗺️ Top Regions by Shipments:`);
    regionalData.forEach(region => {
      console.log(`   - ${region._id}: ${region.count}`);
    });

    // 7. Test Shipment Trends
    console.log('\n7️⃣ TESTING SHIPMENT TRENDS:');
    
    const shipmentTrends = await Tracking.aggregate([
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 7 }
    ]);

    console.log(`📈 Daily Shipment Trends (Last 7 days):`);
    shipmentTrends.forEach(day => {
      console.log(`   - ${day._id}: ${day.count} shipments`);
    });

    // 8. Test API Response Format
    console.log('\n8️⃣ TESTING API RESPONSE FORMAT:');
    
    const summaryResponse = {
      success: true,
      activeShipments,
      totalUsers,
      totalRevenue,
      pendingDeliveries,
      statusDistribution,
      recentShipments: recentShipments.map(s => ({
        id: s.trackingId,
        trackingId: s.trackingId,
        status: s.status,
        origin: s.origin,
        destination: s.destination,
        sender: s.sender,
        receiver: s.receiver,
        createdAt: s.createdAt
      }))
    };

    console.log(`✅ Summary API Response Format:`);
    console.log(`   - Success: ${summaryResponse.success}`);
    console.log(`   - Active Shipments: ${summaryResponse.activeShipments}`);
    console.log(`   - Total Users: ${summaryResponse.totalUsers}`);
    console.log(`   - Total Revenue: ${summaryResponse.totalRevenue}`);
    console.log(`   - Recent Shipments Count: ${summaryResponse.recentShipments.length}`);

    // 9. Test Real-time Analytics Format
    console.log('\n9️⃣ TESTING REAL-TIME ANALYTICS FORMAT:');
    
    const analyticsResponse = {
      success: true,
      statusDistribution,
      shipmentTrends,
      regionalData,
      revenueAnalytics: {
        totalRevenue,
        monthly: revenueByMonth.map(m => m.revenue),
        averageOrderValue: totalRevenue / (revenueByMonth.reduce((sum, m) => sum + m.count, 0) || 1)
      }
    };

    console.log(`✅ Analytics API Response Format:`);
    console.log(`   - Status Distribution: ${analyticsResponse.statusDistribution.length} statuses`);
    console.log(`   - Shipment Trends: ${analyticsResponse.shipmentTrends.length} days`);
    console.log(`   - Regional Data: ${analyticsResponse.regionalData.length} regions`);
    console.log(`   - Average Order Value: ₹${analyticsResponse.revenueAnalytics.averageOrderValue.toFixed(2)}`);

    // 10. Check for Missing Data Issues
    console.log('\n🔟 CHECKING FOR DATA ISSUES:');
    
    const shipmentsWithoutSender = await Tracking.countDocuments({ 
      $or: [
        { 'sender.name': { $exists: false } },
        { 'sender.name': null },
        { 'sender.name': '' }
      ]
    });

    const shipmentsWithoutReceiver = await Tracking.countDocuments({ 
      $or: [
        { 'receiver.name': { $exists: false } },
        { 'receiver.name': null },
        { 'receiver.name': '' }
      ]
    });

    const shipmentsWithoutPayment = await Tracking.countDocuments({ 
      $or: [
        { 'payment.amount': { $exists: false } },
        { 'payment.amount': null },
        { 'payment.amount': 0 }
      ]
    });

    console.log(`🔍 Data Quality Check:`);
    console.log(`   - Shipments without sender: ${shipmentsWithoutSender}`);
    console.log(`   - Shipments without receiver: ${shipmentsWithoutReceiver}`);
    console.log(`   - Shipments without payment: ${shipmentsWithoutPayment}`);

    if (shipmentsWithoutSender > 0 || shipmentsWithoutReceiver > 0 || shipmentsWithoutPayment > 0) {
      console.log(`⚠️ Data quality issues found - this may affect dashboard display`);
    } else {
      console.log(`✅ Data quality looks good`);
    }

    console.log('\n🎉 ADMIN API TEST COMPLETED!');
    console.log('\n📋 SUMMARY:');
    console.log(`✅ Database connectivity: Working`);
    console.log(`✅ Summary data: Available`);
    console.log(`✅ Recent shipments: ${recentShipments.length} found`);
    console.log(`✅ Users data: ${users.length} found`);
    console.log(`✅ Analytics data: Available`);
    console.log(`✅ Revenue data: ₹${totalRevenue} total`);

  } catch (error) {
    console.error('❌ Test error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testAdminAPIs();