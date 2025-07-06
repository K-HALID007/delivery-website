import User from '../models/user.model.js';
import Partner from '../models/partner.model.js';
import Shipment from '../models/shipment.model.js';
import Tracking from '../models/tracking.model.js';

// Simple dashboard stats with error handling
export const getDashboardStats = async (req, res) => {
  try {
    console.log('🔍 Starting getDashboardStats...');
    
    // Initialize default values
    let totalUsers = 0;
    let totalPartners = 0;
    let activePartners = 0;
    let pendingPartners = 0;
    let activeShipments = 0;
    let pendingDeliveries = 0;
    let totalRevenue = 0;

    try {
      console.log('📊 Counting users...');
      totalUsers = await User.countDocuments({ role: 'user' }) || 0;
      console.log(`✅ Total users: ${totalUsers}`);
    } catch (error) {
      console.error('❌ Error counting users:', error.message);
    }

    try {
      console.log('�� Counting partners...');
      totalPartners = await Partner.countDocuments() || 0;
      activePartners = await Partner.countDocuments({ status: 'approved', isOnline: true }) || 0;
      pendingPartners = await Partner.countDocuments({ status: 'pending' }) || 0;
      console.log(`✅ Partners - Total: ${totalPartners}, Active: ${activePartners}, Pending: ${pendingPartners}`);
    } catch (error) {
      console.error('❌ Error counting partners:', error.message);
    }

    try {
      console.log('📦 Counting shipments...');
      activeShipments = await Tracking.countDocuments({ 
        status: { $in: ['assigned', 'picked_up', 'in_transit', 'out_for_delivery'] } 
      }) || 0;
      pendingDeliveries = await Tracking.countDocuments({ 
        status: { $in: ['Pending', 'pending'] } 
      }) || 0;
      console.log(`✅ Shipments - Active: ${activeShipments}, Pending: ${pendingDeliveries}`);
    } catch (error) {
      console.error('❌ Error counting shipments:', error.message);
    }

    try {
      console.log('💰 Calculating revenue...');
      const trackingRevenue = await Tracking.aggregate([
        {
          $match: {
            status: 'delivered',
            'payment.amount': { $exists: true, $gt: 0 }
          }
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$payment.amount" }
          }
        }
      ]);
      totalRevenue = trackingRevenue[0]?.totalRevenue || 0;
      console.log(`✅ Total revenue: ${totalRevenue}`);
    } catch (error) {
      console.error('❌ Error calculating revenue:', error.message);
    }

    const result = {
      totalUsers,
      totalPartners,
      activePartners,
      pendingPartners,
      activeShipments,
      pendingDeliveries,
      totalRevenue
    };

    console.log('✅ Dashboard stats completed:', result);
    res.json(result);
  } catch (error) {
    console.error('❌ Error in getDashboardStats:', error);
    res.status(500).json({ 
      message: 'Error fetching dashboard statistics',
      error: error.message,
      details: 'Check server logs for more information'
    });
  }
};

// Simple notifications with error handling
export const getAdminNotifications = async (req, res) => {
  try {
    console.log('🔔 Starting getAdminNotifications...');
    
    const notifications = [];
    
    try {
      // Get recent shipments for notifications
      console.log('📦 Fetching recent shipments...');
      const recentShipments = await Tracking.find()
        .sort({ createdAt: -1 })
        .limit(20)
        .lean();
      
      console.log(`✅ Found ${recentShipments.length} recent shipments`);

      // Create notifications from recent activities
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Failed deliveries
      const failedToday = recentShipments.filter(s => 
        s.status === 'Failed' || s.status === 'Cancelled'
      );
      
      if (failedToday.length > 0) {
        notifications.push({
          id: `failed_deliveries_${Date.now()}`,
          type: 'critical',
          title: 'Failed Deliveries Alert',
          message: `${failedToday.length} deliveries failed today. Immediate attention required.`,
          timestamp: new Date(),
          read: false,
          category: 'operations',
          actions: ['View Details', 'Reschedule'],
          data: { count: failedToday.length }
        });
      }

      // Delivered today
      const deliveredToday = recentShipments.filter(s => {
        const shipmentDate = new Date(s.updatedAt);
        return s.status === 'Delivered' && shipmentDate >= today;
      });

      if (deliveredToday.length > 0) {
        notifications.push({
          id: `delivered_today_${Date.now()}`,
          type: 'success',
          title: 'Daily Deliveries Completed',
          message: `${deliveredToday.length} shipments successfully delivered today.`,
          timestamp: new Date(),
          read: false,
          category: 'business',
          actions: ['View Report'],
          data: { count: deliveredToday.length }
        });
      }

      // Pending shipments warning
      const pendingShipments = recentShipments.filter(s => s.status === 'Pending');
      if (pendingShipments.length > 5) {
        notifications.push({
          id: `pending_warning_${Date.now()}`,
          type: 'warning',
          title: 'High Number of Pending Shipments',
          message: `${pendingShipments.length} shipments are currently pending processing.`,
          timestamp: new Date(),
          read: false,
          category: 'operations',
          actions: ['Process Queue', 'View Details'],
          data: { count: pendingShipments.length }
        });
      }

    } catch (error) {
      console.error('❌ Error processing shipment notifications:', error.message);
    }

    try {
      // Get new users
      console.log('👥 Fetching new users...');
      const newUsersToday = await User.countDocuments({
        role: 'user',
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      });

      if (newUsersToday > 0) {
        notifications.push({
          id: `new_users_${Date.now()}`,
          type: 'info',
          title: 'New User Registrations',
          message: `${newUsersToday} new users registered today.`,
          timestamp: new Date(),
          read: false,
          category: 'business',
          actions: ['View Users'],
          data: { count: newUsersToday }
        });
      }

      console.log(`✅ Found ${newUsersToday} new users today`);
    } catch (error) {
      console.error('❌ Error fetching new users:', error.message);
    }

    // Add default notifications if none exist
    if (notifications.length === 0) {
      notifications.push({
        id: `system_status_${Date.now()}`,
        type: 'info',
        title: 'System Status',
        message: 'All systems are running normally. No critical alerts at this time.',
        timestamp: new Date(),
        read: false,
        category: 'system',
        actions: ['View Dashboard'],
        data: {}
      });
    }

    console.log(`✅ Generated ${notifications.length} notifications`);
    res.json(notifications);
  } catch (error) {
    console.error('❌ Error in getAdminNotifications:', error);
    res.status(500).json({ 
      message: 'Error fetching admin notifications',
      error: error.message,
      details: 'Check server logs for more information'
    });
  }
};

// Simple recent shipments with error handling
export const getRecentShipments = async (req, res) => {
  try {
    console.log('🚚 Starting getRecentShipments...');
    
    const recentShipments = await Tracking.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    console.log(`✅ Found ${recentShipments.length} recent shipments`);

    const formattedShipments = recentShipments.map(shipment => ({
      id: shipment.trackingId || shipment._id,
      trackingId: shipment.trackingId,
      customer: shipment.sender?.name || 'Unknown',
      status: shipment.status || 'Unknown',
      origin: shipment.origin || 'Unknown',
      destination: shipment.destination || 'Unknown',
      currentLocation: shipment.currentLocation || shipment.destination,
      date: shipment.createdAt || new Date(),
      updatedAt: shipment.updatedAt || shipment.createdAt
    }));

    console.log('✅ Recent shipments formatted successfully');
    res.json(formattedShipments);
  } catch (error) {
    console.error('❌ Error in getRecentShipments:', error);
    res.status(500).json({ 
      message: 'Error fetching recent shipments',
      error: error.message,
      details: 'Check server logs for more information'
    });
  }
};

// Simple users list with error handling
export const getAllUsers = async (req, res) => {
  try {
    console.log('👥 Starting getAllUsers...');
    
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    console.log(`✅ Found ${users.length} users`);
    res.json(users);
  } catch (error) {
    console.error('❌ Error in getAllUsers:', error);
    res.status(500).json({ 
      message: 'Error fetching users',
      error: error.message,
      details: 'Check server logs for more information'
    });
  }
};

// Simple analytics with error handling
export const getRealtimeAnalytics = async (req, res) => {
  try {
    console.log('📈 Starting getRealtimeAnalytics...');
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    let shipmentTrends = [];
    let statusDistribution = [];
    let regionalData = [];
    let userGrowth = [];

    try {
      console.log('📊 Getting shipment trends...');
      shipmentTrends = await Tracking.aggregate([
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
      console.log(`✅ Found ${shipmentTrends.length} shipment trend data points`);
    } catch (error) {
      console.error('❌ Error getting shipment trends:', error.message);
    }

    try {
      console.log('📊 Getting status distribution...');
      statusDistribution = await Tracking.aggregate([
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
      console.log(`✅ Found ${statusDistribution.length} status categories`);
    } catch (error) {
      console.error('❌ Error getting status distribution:', error.message);
    }

    try {
      console.log('📊 Getting regional data...');
      regionalData = await Tracking.aggregate([
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
      console.log(`✅ Found ${regionalData.length} regional data points`);
    } catch (error) {
      console.error('❌ Error getting regional data:', error.message);
    }

    try {
      console.log('📊 Getting user growth...');
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      userGrowth = await User.aggregate([
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
      console.log(`✅ Found ${userGrowth.length} user growth data points`);
    } catch (error) {
      console.error('❌ Error getting user growth:', error.message);
    }

    const result = {
      shipmentTrends,
      userGrowth,
      statusDistribution,
      regionalData,
      lastUpdated: new Date()
    };

    console.log('✅ Analytics data compiled successfully');
    res.json(result);
  } catch (error) {
    console.error('❌ Error in getRealtimeAnalytics:', error);
    res.status(500).json({ 
      message: 'Error fetching realtime analytics',
      error: error.message,
      details: 'Check server logs for more information'
    });
  }
};

// Simple revenue analytics with error handling
export const getRevenueAnalytics = async (req, res) => {
  try {
    console.log('💰 Starting getRevenueAnalytics...');
    
    const currentDate = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(currentDate.getMonth() - 6);
    
    let totalRevenue = 0;
    let monthlyData = [];
    let dailyData = [];
    let revenueByStatus = [];

    try {
      console.log('💰 Calculating total revenue...');
      const revenueResult = await Tracking.aggregate([
        {
          $match: {
            status: 'delivered',
            'payment.amount': { $exists: true, $gt: 0 }
          }
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$payment.amount" }
          }
        }
      ]);
      totalRevenue = revenueResult[0]?.totalRevenue || 0;
      console.log(`✅ Total revenue: ${totalRevenue}`);
    } catch (error) {
      console.error('❌ Error calculating total revenue:', error.message);
    }

    try {
      console.log('💰 Getting monthly revenue...');
      const monthlyRevenue = await Tracking.aggregate([
        {
          $match: {
            createdAt: { $gte: sixMonthsAgo },
            'payment.amount': { $gt: 0 }
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

      // Generate month labels and data
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthlyLabels = [];
      monthlyData = [];

      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthName = monthNames[date.getMonth()];
        monthlyLabels.push(monthName);
        
        const monthRevenue = monthlyRevenue.find(m => 
          m._id.year === date.getFullYear() && m._id.month === (date.getMonth() + 1)
        );
        monthlyData.push(monthRevenue?.revenue || 0);
      }

      console.log(`✅ Monthly revenue data: ${monthlyData.length} months`);
    } catch (error) {
      console.error('❌ Error getting monthly revenue:', error.message);
      monthlyData = [0, 0, 0, 0, 0, 0]; // Fallback data
    }

    try {
      console.log('💰 Getting revenue by status...');
      revenueByStatus = await Tracking.aggregate([
        {
          $match: {
            'payment.amount': { $gt: 0 }
          }
        },
        {
          $group: {
            _id: "$status",
            revenue: { $sum: "$payment.amount" },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { revenue: -1 }
        }
      ]);
      console.log(`✅ Revenue by status: ${revenueByStatus.length} categories`);
    } catch (error) {
      console.error('❌ Error getting revenue by status:', error.message);
    }

    // Get real daily data for the last 30 days
    try {
      console.log('💰 Getting daily revenue...');
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const dailyRevenue = await Tracking.aggregate([
        {
          $match: {
            createdAt: { $gte: thirtyDaysAgo },
            'payment.amount': { $gt: 0 }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
            },
            revenue: { $sum: "$payment.amount" }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ]);
      
      // Fill in missing days with 0
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateString = date.toISOString().split('T')[0];
        
        const dayRevenue = dailyRevenue.find(d => d._id === dateString);
        dailyData.push(dayRevenue?.revenue || 0);
      }
      
      console.log(`✅ Daily revenue data: ${dailyData.length} days`);
    } catch (error) {
      console.error('❌ Error getting daily revenue:', error.message);
      // Fallback to zeros if error
      for (let i = 29; i >= 0; i--) {
        dailyData.push(0);
      }
    }

    const result = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      monthly: monthlyData.length > 0 ? monthlyData : [0, 0, 0, 0, 0, 0],
      daily: dailyData,
      totalRevenue,
      revenueByStatus,
      averageOrderValue: totalRevenue > 0 && monthlyData.length > 0 ? 
        totalRevenue / monthlyData.reduce((sum, val) => sum + (val > 0 ? 1 : 0), 0) : 0
    };

    console.log('✅ Revenue analytics compiled successfully');
    res.json(result);
  } catch (error) {
    console.error('❌ Error in getRevenueAnalytics:', error);
    res.status(500).json({ 
      message: 'Error fetching revenue analytics',
      error: error.message,
      details: 'Check server logs for more information'
    });
  }
};

export default {
  getDashboardStats,
  getAdminNotifications,
  getRecentShipments,
  getAllUsers,
  getRealtimeAnalytics,
  getRevenueAnalytics
};