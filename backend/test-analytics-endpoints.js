import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Tracking from './models/tracking.model.js';
import User from './models/user.model.js';
import Partner from './models/partner.model.js';

dotenv.config();

async function testAnalyticsEndpoints() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('🔍 TESTING ANALYTICS ENDPOINTS');
    console.log('='.repeat(60));

    // 1. Test Real-time Analytics Data
    console.log('\n1️⃣ TESTING REAL-TIME ANALYTICS:');
    
    // Get shipment trends for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const shipmentTrends = await Tracking.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
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
      {
        $sort: { _id: 1 }
      }
    ]);

    console.log(`📈 Shipment Trends (Last 30 days): ${shipmentTrends.length} data points`);
    shipmentTrends.forEach(trend => {
      console.log(`   ${trend._id}: ${trend.count} shipments`);
    });

    // Get user growth for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const userGrowth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
          role: 'user'
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m", date: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    console.log(`📊 User Growth (Last 6 months): ${userGrowth.length} data points`);
    userGrowth.forEach(growth => {
      console.log(`   ${growth._id}: ${growth.count} new users`);
    });

    // Get status distribution
    const statusDistribution = await Tracking.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    console.log(`📋 Status Distribution: ${statusDistribution.length} statuses`);
    statusDistribution.forEach(status => {
      console.log(`   ${status._id}: ${status.count} shipments`);
    });

    // Get regional distribution
    const regionalData = await Tracking.aggregate([
      {
        $group: {
          _id: "$destination",
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      }
    ]);

    console.log(`🗺️ Regional Data (Top 10): ${regionalData.length} regions`);
    regionalData.forEach(region => {
      console.log(`   ${region._id}: ${region.count} shipments`);
    });

    // 2. Test Revenue Analytics
    console.log('\n2️⃣ TESTING REVENUE ANALYTICS:');
    
    const currentDate = new Date();
    const sixMonthsAgoRevenue = new Date();
    sixMonthsAgoRevenue.setMonth(currentDate.getMonth() - 6);
    
    // Get monthly revenue from Tracking
    const monthlyRevenue = await Tracking.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgoRevenue },
          status: 'delivered',
          'payment.amount': { $exists: true, $gt: 0 }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          revenue: { $sum: "$payment.amount" },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      }
    ]);

    console.log(`💰 Monthly Revenue (Last 6 months): ${monthlyRevenue.length} data points`);
    monthlyRevenue.forEach(month => {
      console.log(`   ${month._id.year}-${month._id.month}: ₹${month.revenue} (${month.count} orders)`);
    });

    // Get daily revenue for the last 30 days
    const thirtyDaysAgoRevenue = new Date();
    thirtyDaysAgoRevenue.setDate(currentDate.getDate() - 30);

    const dailyRevenue = await Tracking.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgoRevenue },
          status: 'delivered',
          'payment.amount': { $exists: true, $gt: 0 }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          revenue: { $sum: "$payment.amount" },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    console.log(`💵 Daily Revenue (Last 30 days): ${dailyRevenue.length} data points`);
    dailyRevenue.forEach(day => {
      console.log(`   ${day._id}: ₹${day.revenue} (${day.count} orders)`);
    });

    // Calculate total revenue and average order value
    const totalRevenue = monthlyRevenue.reduce((sum, month) => sum + month.revenue, 0);
    const totalOrders = monthlyRevenue.reduce((sum, month) => sum + month.count, 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    console.log(`📊 Revenue Summary:`);
    console.log(`   Total Revenue: ₹${totalRevenue}`);
    console.log(`   Total Orders: ${totalOrders}`);
    console.log(`   Average Order Value: ₹${averageOrderValue.toFixed(2)}`);

    // 3. Create Real-time Analytics Response
    console.log('\n3️⃣ CREATING REAL-TIME ANALYTICS RESPONSE:');
    
    const realtimeAnalyticsResponse = {
      shipmentTrends,
      userGrowth,
      statusDistribution,
      regionalData
    };

    console.log('📋 Real-time Analytics API Response:');
    console.log(JSON.stringify(realtimeAnalyticsResponse, null, 2));

    // 4. Create Revenue Analytics Response
    console.log('\n4️⃣ CREATING REVENUE ANALYTICS RESPONSE:');
    
    // Generate month labels and data
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyLabels = [];
    const monthlyData = [];

    // Create a map for easier lookup
    const revenueMap = {};
    monthlyRevenue.forEach(month => {
      const key = `${month._id.year}-${month._id.month}`;
      revenueMap[key] = month.revenue;
    });

    // Generate last 6 months data
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
      const monthName = monthNames[date.getMonth()];
      
      monthlyLabels.push(monthName);
      monthlyData.push(revenueMap[key] || 0);
    }

    // Generate daily data for the last 30 days
    const dailyData = [];
    const dailyMap = {};
    dailyRevenue.forEach(day => {
      dailyMap[day._id] = day.revenue;
    });

    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const key = date.toISOString().split('T')[0];
      dailyData.push(dailyMap[key] || 0);
    }

    const revenueAnalyticsResponse = {
      labels: monthlyLabels,
      monthly: monthlyData,
      daily: dailyData,
      totalRevenue,
      averageOrderValue,
      revenueByStatus: statusDistribution.map(status => ({
        status: status._id,
        count: status.count
      }))
    };

    console.log('📋 Revenue Analytics API Response:');
    console.log(JSON.stringify(revenueAnalyticsResponse, null, 2));

    // 5. Test Chart Data Format
    console.log('\n5️⃣ TESTING CHART DATA FORMAT:');
    
    // Chart data for shipment trends
    const chartData = {
      labels: shipmentTrends.map(item => {
        const date = new Date(item._id);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }),
      datasets: [
        {
          label: 'Daily Shipments',
          data: shipmentTrends.map(item => item.count),
          backgroundColor: 'rgba(251, 191, 36, 0.8)',
          borderColor: '#f59e0b',
          borderWidth: 2
        }
      ]
    };

    console.log('📊 Chart Data for Frontend:');
    console.log(JSON.stringify(chartData, null, 2));

    // 6. Check for Empty Data Issues
    console.log('\n6️⃣ CHECKING FOR EMPTY DATA ISSUES:');
    
    if (shipmentTrends.length === 0) {
      console.log('❌ No shipment trends data - this will cause empty charts');
    } else {
      console.log(`✅ Shipment trends data available: ${shipmentTrends.length} points`);
    }

    if (statusDistribution.length === 0) {
      console.log('❌ No status distribution data - this will cause empty charts');
    } else {
      console.log(`✅ Status distribution data available: ${statusDistribution.length} statuses`);
    }

    if (monthlyRevenue.length === 0) {
      console.log('❌ No revenue data - this will cause empty revenue charts');
    } else {
      console.log(`✅ Revenue data available: ${monthlyRevenue.length} months`);
    }

    if (regionalData.length === 0) {
      console.log('❌ No regional data - this will cause empty regional charts');
    } else {
      console.log(`✅ Regional data available: ${regionalData.length} regions`);
    }

    console.log('\n🎉 ANALYTICS ENDPOINTS TEST COMPLETED!');
    console.log('\n📋 SUMMARY:');
    console.log(`✅ Shipment Trends: ${shipmentTrends.length} data points`);
    console.log(`✅ Status Distribution: ${statusDistribution.length} statuses`);
    console.log(`✅ Regional Data: ${regionalData.length} regions`);
    console.log(`✅ Revenue Data: ${monthlyRevenue.length} months`);
    console.log(`✅ User Growth: ${userGrowth.length} months`);

  } catch (error) {
    console.error('❌ Test error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testAnalyticsEndpoints();