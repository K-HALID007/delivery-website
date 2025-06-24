import User from '../models/user.model.js';
import Partner from '../models/partner.model.js';
import Shipment from '../models/shipment.model.js';
import Tracking from '../models/tracking.model.js';
import { sendDeliveryEmail } from '../utils/email.js';

// Get dashboard statistics
export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalPartners = await Partner.countDocuments();
    const activePartners = await Partner.countDocuments({ status: 'approved', isOnline: true });
    const pendingPartners = await Partner.countDocuments({ status: 'pending' });
    const activeShipments = await Tracking.countDocuments({ status: { $in: ['assigned', 'picked_up', 'in_transit', 'out_for_delivery'] } });
    const pendingDeliveries = await Tracking.countDocuments({ status: { $in: ['Pending', 'pending'] } });
    
    // Calculate real total revenue from delivered shipments using payment.amount
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

    const totalRevenue = trackingRevenue[0]?.totalRevenue || 0;

    res.json({
      totalUsers,
      totalPartners,
      activePartners,
      pendingPartners,
      activeShipments,
      pendingDeliveries,
      totalRevenue
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Error fetching dashboard statistics' });
  }
};

// Get recent shipments
export const getRecentShipments = async (req, res) => {
  try {
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

    res.json(formattedShipments);
  } catch (error) {
    console.error('Error fetching recent shipments:', error);
    res.status(500).json({ message: 'Error fetching recent shipments' });
  }
};

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
};

// Update user status
export const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = isActive;
    await user.save();

    res.json({ message: 'User status updated successfully', user });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ message: 'Error updating user status' });
  }
};

export const updateTrackingStatusAdmin = async (req, res) => {
  try {
    const { trackingId } = req.params;
    const { status, currentLocation } = req.body;
    const tracking = await Tracking.findOne({ trackingId });
    if (!tracking) {
      return res.status(404).json({ message: 'Tracking entry not found' });
    }
    tracking.status = status;
    if (currentLocation !== undefined) {
      tracking.currentLocation = currentLocation;
    }
    tracking.history.push({ status, location: tracking.currentLocation, timestamp: new Date() });
    await tracking.save();

    // Emit real-time update to admin dashboard
    const io = req.app.get('io');
    if (io) {
      // Emit updated dashboard stats
      const updatedStats = await getDashboardStatsData();
      io.to('admin-room').emit('dashboard-update', updatedStats);
      
      // Emit updated analytics data including status distribution
      const updatedAnalytics = await getRealtimeAnalyticsData();
      io.to('admin-room').emit('analytics-update', updatedAnalytics);
      
      // Emit shipment update
      io.to('admin-room').emit('shipment-update', {
        trackingId,
        status,
        currentLocation,
        timestamp: new Date()
      });

      // Generate and emit new notifications
      const newNotifications = await generateNotificationsForStatusChange(trackingId, status);
      if (newNotifications.length > 0) {
        io.to('admin-room').emit('new-notifications', newNotifications);
      }
    }

    // Notify for specific statuses
    const notifyStatuses = ['out for delivery', 'delivered'];
    const currentStatus = status?.toLowerCase();
    const { email } = tracking.receiver;
    if (notifyStatuses.includes(currentStatus) && email) {
      try {
        // Build HTML email template (same as shipment created)
        const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Shipment Status Update</title>
        </head>
        <body style="background:#18121E; margin:0; padding:0; font-family:Arial,sans-serif;">
          <div style="max-width:600px; margin:0 auto; padding:0;">
            <div style="padding:24px 0 0 0;">
              <p style="color:#fff; text-align:center; font-size:1rem; margin:0 0 12px 0;">
                Your order with Tracking ID <b style="color:#FFB300;">${tracking.trackingId}</b> is now
              </p>
              <h2 style="color:#FFB300; text-align:center; font-size:2rem; margin:0 0 24px 0; font-weight:bold;">
                ${status}
              </h2>
            </div>
            <div style="background:#23232b; border-radius:16px; padding:28px 24px; margin:0 16px 24px 16px;">
              <p style="color:#fff; font-size:1.1rem; margin:0 0 18px 0;">
                <span style="color:#FFB300; font-size:1.3rem; font-weight:bold;">Tracking ID: ${tracking.trackingId}</span>
              </p>
              <p style="color:#fff; margin:8px 0;"><strong>Status:</strong> ${status}</p>
              <p style="color:#fff; margin:8px 0;"><strong>Origin:</strong> ${tracking.origin}</p>
              <p style="color:#fff; margin:8px 0;"><strong>Destination:</strong> ${tracking.destination}</p>
              <p style="color:#fff; margin:8px 0;"><strong>Package Type:</strong> ${tracking.packageDetails?.type || ''}</p>
              <p style="color:#fff; margin:8px 0;"><strong>Weight:</strong> ${tracking.packageDetails?.weight || ''}kg</p>
              <p style="color:#fff; margin:8px 0;"><strong>Sender:</strong> ${tracking.sender?.name || ''}</p>
            </div>
            <div style="padding:0 24px 24px 24px;">
              <p style="color:#fff; text-align:left; margin:0 0 8px 0;">
                You can track this shipment using the tracking ID above.
              </p>
              <p style="color:#FFB300; text-align:center; margin:24px 0 0 0; font-weight:bold;">
                Thank you for choosing our service!
              </p>
            </div>
          </div>
        </body>
        </html>
        `;
        await sendDeliveryEmail(email, 'Shipment Status Update', htmlContent);
        console.log("📧 Admin notification sent for:", currentStatus);
      } catch (notifyErr) {
        console.error('Failed to send admin notification email:', notifyErr);
      }
    }

    res.json({ message: 'Status updated successfully', tracking });
  } catch (error) {
    console.error('Error updating tracking status:', error);
    res.status(500).json({ message: 'Error updating tracking status' });
  }
};

// Helper function to get dashboard stats data
const getDashboardStatsData = async () => {
  const totalUsers = await User.countDocuments({ role: 'user' });
  const activeShipments = await Tracking.countDocuments({ status: { $in: ['assigned', 'picked_up', 'in_transit', 'out_for_delivery'] } });
  const pendingDeliveries = await Tracking.countDocuments({ status: { $in: ['Pending', 'pending'] } });
  
  // Calculate real total revenue from delivered shipments using payment.amount
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

  const totalRevenue = trackingRevenue[0]?.totalRevenue || 0;
  
  return {
    totalUsers,
    activeShipments,
    pendingDeliveries,
    totalRevenue
  };
};

// Helper function to get real-time analytics data
const getRealtimeAnalyticsData = async () => {
  try {
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

    // Get status distribution - This is the key part for updating status
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

    return {
      shipmentTrends,
      statusDistribution,
      regionalData,
      lastUpdated: new Date()
    };
  } catch (error) {
    console.error('Error fetching realtime analytics data:', error);
    return null;
  }
};

// Get real-time analytics data
export const getRealtimeAnalytics = async (req, res) => {
  try {
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

    // Get status distribution
    const statusDistribution = await Tracking.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

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

    res.json({
      shipmentTrends,
      userGrowth,
      statusDistribution,
      regionalData
    });
  } catch (error) {
    console.error('Error fetching realtime analytics:', error);
    res.status(500).json({ message: 'Error fetching realtime analytics' });
  }
};

// Get revenue analytics (mock data for now)
export const getRevenueAnalytics = async (req, res) => {
  try {
    const currentDate = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(currentDate.getMonth() - 6);
    
    // Get monthly revenue from Shipments
    const monthlyRevenueFromShipments = await Shipment.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
          status: { $in: ['Delivered', 'In Transit', 'Processing'] } // Only count paid/active shipments
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          revenue: { $sum: "$price" },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      }
    ]);

    // Get monthly revenue from Tracking
    const monthlyRevenueFromTracking = await Tracking.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
          revenue: { $gt: 0 },
          status: { $in: ['Delivered', 'In Transit', 'Processing', 'Out for Delivery'] }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          revenue: { $sum: "$revenue" },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      }
    ]);

    // Get daily revenue for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(currentDate.getDate() - 30);

    const dailyRevenueFromShipments = await Shipment.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
          status: { $in: ['Delivered', 'In Transit', 'Processing'] }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          revenue: { $sum: "$price" },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    const dailyRevenueFromTracking = await Tracking.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
          revenue: { $gt: 0 },
          status: { $in: ['Delivered', 'In Transit', 'Processing', 'Out for Delivery'] }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          revenue: { $sum: "$revenue" },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Combine revenue from both sources
    const combinedMonthlyRevenue = {};
    const combinedDailyRevenue = {};

    // Process shipment revenue
    monthlyRevenueFromShipments.forEach(item => {
      const key = `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`;
      combinedMonthlyRevenue[key] = (combinedMonthlyRevenue[key] || 0) + item.revenue;
    });

    // Process tracking revenue
    monthlyRevenueFromTracking.forEach(item => {
      const key = `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`;
      combinedMonthlyRevenue[key] = (combinedMonthlyRevenue[key] || 0) + item.revenue;
    });

    // Process daily revenue
    dailyRevenueFromShipments.forEach(item => {
      combinedDailyRevenue[item._id] = (combinedDailyRevenue[item._id] || 0) + item.revenue;
    });

    dailyRevenueFromTracking.forEach(item => {
      combinedDailyRevenue[item._id] = (combinedDailyRevenue[item._id] || 0) + item.revenue;
    });

    // Generate month labels and data
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyLabels = [];
    const monthlyData = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      const monthName = monthNames[date.getMonth()];
      
      monthlyLabels.push(monthName);
      monthlyData.push(combinedMonthlyRevenue[key] || 0);
    }

    // Generate daily data for the last 30 days
    const dailyData = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const key = date.toISOString().split('T')[0];
      dailyData.push(combinedDailyRevenue[key] || 0);
    }

    // Calculate total revenue
    const totalRevenue = monthlyData.reduce((sum, value) => sum + value, 0);

    // Get revenue by status
    const revenueByStatus = await Tracking.aggregate([
      {
        $match: {
          revenue: { $gt: 0 }
        }
      },
      {
        $group: {
          _id: "$status",
          revenue: { $sum: "$revenue" },
          count: { $sum: 1 }
        }
      }
    ]);

    const shipmentRevenueByStatus = await Shipment.aggregate([
      {
        $group: {
          _id: "$status",
          revenue: { $sum: "$price" },
          count: { $sum: 1 }
        }
      }
    ]);

    const revenueData = {
      labels: monthlyLabels,
      monthly: monthlyData,
      daily: dailyData,
      totalRevenue,
      revenueByStatus: [...revenueByStatus, ...shipmentRevenueByStatus],
      averageOrderValue: totalRevenue > 0 ? totalRevenue / (monthlyRevenueFromShipments.length + monthlyRevenueFromTracking.length) : 0
    };

    res.json(revenueData);
  } catch (error) {
    console.error('Error fetching revenue analytics:', error);
    res.status(500).json({ message: 'Error fetching revenue analytics' });
  }
};

// Get admin settings
export const getAdminSettings = async (req, res) => {
  try {
    // For now, return default settings. In a real app, you'd store these in the database
    const defaultSettings = {
      // General Settings
      siteName: 'Courier Tracker',
      siteDescription: 'Professional courier and package tracking system',
      contactEmail: 'admin@couriertracker.com',
      supportPhone: '+1 (555) 123-4567',
      
      // Notification Settings
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      notificationEmail: 'notifications@couriertracker.com',
      
      // Security Settings
      twoFactorAuth: false,
      sessionTimeout: 30,
      passwordExpiry: 90,
      maxLoginAttempts: 5,
      
      // System Settings
      maintenanceMode: false,
      debugMode: false,
      autoBackup: true,
      backupFrequency: 'daily',
      
      // Business Settings
      defaultShippingRate: 15.99,
      expressShippingRate: 29.99,
      freeShippingThreshold: 100,
      currency: 'USD',
      timezone: 'America/New_York',
      
      // UI Settings
      darkMode: false,
      compactView: false,
      showWelcomeMessage: true,
      itemsPerPage: 20
    };

    res.json(defaultSettings);
  } catch (error) {
    console.error('Error fetching admin settings:', error);
    res.status(500).json({ message: 'Error fetching admin settings' });
  }
};

// Update admin settings
export const updateAdminSettings = async (req, res) => {
  try {
    const settings = req.body;
    
    // In a real application, you would save these settings to the database
    // For now, we'll just validate and return the settings
    
    // Basic validation
    if (!settings.siteName || !settings.contactEmail) {
      return res.status(400).json({ message: 'Site name and contact email are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(settings.contactEmail)) {
      return res.status(400).json({ message: 'Invalid contact email format' });
    }

    if (settings.notificationEmail && !emailRegex.test(settings.notificationEmail)) {
      return res.status(400).json({ message: 'Invalid notification email format' });
    }

    // Validate numeric values
    if (settings.sessionTimeout < 5 || settings.sessionTimeout > 480) {
      return res.status(400).json({ message: 'Session timeout must be between 5 and 480 minutes' });
    }

    if (settings.defaultShippingRate < 0 || settings.expressShippingRate < 0) {
      return res.status(400).json({ message: 'Shipping rates cannot be negative' });
    }

    // Here you would typically save to database
    // await AdminSettings.findOneAndUpdate({}, settings, { upsert: true });

    console.log('Admin settings updated:', settings);

    res.json({ 
      message: 'Settings updated successfully',
      settings: settings
    });
  } catch (error) {
    console.error('Error updating admin settings:', error);
    res.status(500).json({ message: 'Error updating admin settings' });
  }
};

// Get admin notifications
export const getAdminNotifications = async (req, res) => {
  try {
    // Get recent system events and business notifications
    const recentShipments = await Tracking.find()
      .sort({ createdAt: -1 })
      .limit(50);

    const recentUsers = await User.find({ role: 'user' })
      .sort({ createdAt: -1 })
      .limit(20);

    const notifications = [];

    // Critical alerts - failed deliveries
    const failedDeliveries = recentShipments.filter(s => 
      s.status === 'Failed' || s.status === 'Cancelled'
    );
    
    failedDeliveries.forEach(shipment => {
      notifications.push({
        id: `failed_${shipment._id}`,
        type: 'critical',
        title: 'Failed Delivery Alert',
        message: `Shipment ${shipment.trackingId} failed delivery. Customer: ${shipment.receiver?.name || 'Unknown'}`,
        timestamp: shipment.updatedAt,
        read: false,
        category: 'operations',
        actions: ['Reschedule', 'Contact Customer'],
        data: { trackingId: shipment.trackingId }
      });
    });

    // Success notifications - delivered shipments
    const deliveredToday = recentShipments.filter(s => {
      const today = new Date();
      const shipmentDate = new Date(s.updatedAt);
      return s.status === 'Delivered' && 
             shipmentDate.toDateString() === today.toDateString();
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

    // Warning notifications - pending shipments
    const pendingShipments = recentShipments.filter(s => s.status === 'Pending');
    if (pendingShipments.length > 10) {
      notifications.push({
        id: `pending_warning_${Date.now()}`,
        type: 'warning',
        title: 'High Number of Pending Shipments',
        message: `${pendingShipments.length} shipments are currently pending processing.`,
        timestamp: new Date(),
        read: false,
        category: 'operations',
        actions: ['Process Shipments', 'View Queue'],
        data: { count: pendingShipments.length }
      });
    }

    // Info notifications - new user registrations
    const newUsersToday = recentUsers.filter(u => {
      const today = new Date();
      const userDate = new Date(u.createdAt);
      return userDate.toDateString() === today.toDateString();
    });

    if (newUsersToday.length > 0) {
      notifications.push({
        id: `new_users_${Date.now()}`,
        type: 'info',
        title: 'New User Registrations',
        message: `${newUsersToday.length} new users registered today. Growth is looking positive!`,
        timestamp: new Date(),
        read: false,
        category: 'business',
        actions: ['View Users'],
        data: { count: newUsersToday.length }
      });
    }

    // Revenue milestone notifications
    const totalRevenue = await calculateTotalRevenue();
    if (totalRevenue > 0) {
      const dailyTarget = 1000; // $1000 daily target
      const todayRevenue = await calculateTodayRevenue();
      
      if (todayRevenue >= dailyTarget) {
        notifications.push({
          id: `revenue_target_${Date.now()}`,
          type: 'success',
          title: 'Daily Revenue Target Achieved!',
          message: `Today's revenue of ${todayRevenue.toFixed(2)} has exceeded the target of ${dailyTarget}.`,
          timestamp: new Date(),
          read: false,
          category: 'business',
          actions: ['View Report'],
          data: { revenue: todayRevenue, target: dailyTarget }
        });
      }
    }

    // System health notifications
    const totalShipments = await Tracking.countDocuments();
    const activeShipments = await Tracking.countDocuments({ 
      status: { $in: ['In Transit', 'Processing', 'Out for Delivery'] } 
    });

    if (totalShipments > 1000) {
      notifications.push({
        id: `system_milestone_${Date.now()}`,
        type: 'info',
        title: 'System Milestone Reached',
        message: `Congratulations! The system has processed over ${totalShipments.toLocaleString()} shipments.`,
        timestamp: new Date(),
        read: false,
        category: 'system',
        actions: ['View Analytics'],
        data: { totalShipments }
      });
    }

    // Sort notifications by timestamp (newest first)
    notifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json(notifications);
  } catch (error) {
    console.error('Error fetching admin notifications:', error);
    res.status(500).json({ message: 'Error fetching admin notifications' });
  }
};

// Helper function to calculate total revenue
const calculateTotalRevenue = async () => {
  try {
    const shipmentRevenue = await Shipment.aggregate([
      {
        $match: {
          status: { $in: ['Delivered', 'In Transit', 'Processing'] }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$price" }
        }
      }
    ]);

    const trackingRevenue = await Tracking.aggregate([
      {
        $match: {
          revenue: { $gt: 0 },
          status: { $in: ['Delivered', 'In Transit', 'Processing', 'Out for Delivery'] }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$revenue" }
        }
      }
    ]);

    return (shipmentRevenue[0]?.totalRevenue || 0) + (trackingRevenue[0]?.totalRevenue || 0);
  } catch (error) {
    console.error('Error calculating total revenue:', error);
    return 0;
  }
};

// Helper function to calculate today's revenue
const calculateTodayRevenue = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const shipmentRevenue = await Shipment.aggregate([
      {
        $match: {
          createdAt: { $gte: today, $lt: tomorrow },
          status: { $in: ['Delivered', 'In Transit', 'Processing'] }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$price" }
        }
      }
    ]);

    const trackingRevenue = await Tracking.aggregate([
      {
        $match: {
          createdAt: { $gte: today, $lt: tomorrow },
          revenue: { $gt: 0 },
          status: { $in: ['Delivered', 'In Transit', 'Processing', 'Out for Delivery'] }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$revenue" }
        }
      }
    ]);

    return (shipmentRevenue[0]?.totalRevenue || 0) + (trackingRevenue[0]?.totalRevenue || 0);
  } catch (error) {
    console.error('Error calculating today revenue:', error);
    return 0;
  }
};

// Get comprehensive reports data
export const getReportsData = async (req, res) => {
  try {
    const { reportType = 'performance', dateRange = '30days' } = req.query;
    
    // Calculate date range
    const endDate = new Date();
    let startDate = new Date();
    
    switch (dateRange) {
      case '7days':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30days':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90days':
        startDate.setDate(endDate.getDate() - 90);
        break;
      case '1year':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    let reportData = {};

    switch (reportType) {
      case 'performance':
        reportData = await generatePerformanceReport(startDate, endDate);
        break;
      case 'financial':
        reportData = await generateFinancialReport(startDate, endDate);
        break;
      case 'operational':
        reportData = await generateOperationalReport(startDate, endDate);
        break;
      case 'customer':
        reportData = await generateCustomerReport(startDate, endDate);
        break;
      case 'audit':
        reportData = await generateAuditReport(startDate, endDate);
        break;
      case 'refunds':
        reportData = await generateRefundReport(startDate, endDate);
        break;
      default:
        reportData = await generatePerformanceReport(startDate, endDate);
    }

    res.json(reportData);
  } catch (error) {
    console.error('Error generating reports data:', error);
    res.status(500).json({ message: 'Error generating reports data' });
  }
};

// Performance Report Generator
const generatePerformanceReport = async (startDate, endDate) => {
  const totalShipments = await Tracking.countDocuments({
    createdAt: { $gte: startDate, $lte: endDate }
  });

  const deliveredShipments = await Tracking.countDocuments({
    createdAt: { $gte: startDate, $lte: endDate },
    status: 'Delivered'
  });

  const deliveryRate = totalShipments > 0 ? (deliveredShipments / totalShipments) * 100 : 0;

  // Calculate average delivery time (mock calculation)
  const avgDeliveryTime = 2.3; // days

  // Customer satisfaction (mock data)
  const customerSatisfaction = 4.7;

  // Weekly shipment trends
  const weeklyTrends = await Tracking.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: {
          week: { $week: "$createdAt" },
          year: { $year: "$createdAt" }
        },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { "_id.year": 1, "_id.week": 1 }
    }
  ]);

  return {
    summary: {
      totalShipments,
      deliveryRate: deliveryRate.toFixed(1),
      avgDeliveryTime,
      customerSatisfaction
    },
    chartData: {
      labels: weeklyTrends.map((_, index) => `Week ${index + 1}`),
      datasets: [{
        label: 'Shipments',
        data: weeklyTrends.map(trend => trend.count),
        backgroundColor: 'rgba(59, 130, 246, 0.8)'
      }]
    }
  };
};

// Financial Report Generator
const generateFinancialReport = async (startDate, endDate) => {
  const totalRevenue = await calculatePeriodRevenue(startDate, endDate);
  const totalCosts = totalRevenue * 0.68; // 68% cost ratio
  const netProfit = totalRevenue - totalCosts;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  return {
    summary: {
      totalRevenue: Math.round(totalRevenue),
      totalCosts: Math.round(totalCosts),
      netProfit: Math.round(netProfit),
      profitMargin: Math.round(profitMargin)
    },
    chartData: {
      labels: ['Revenue', 'Costs', 'Profit'],
      datasets: [{
        data: [totalRevenue, totalCosts, netProfit],
        backgroundColor: ['#10b981', '#ef4444', '#f59e0b']
      }]
    }
  };
};

// Operational Report Generator
const generateOperationalReport = async (startDate, endDate) => {
  const totalShipments = await Tracking.countDocuments({
    createdAt: { $gte: startDate, $lte: endDate }
  });

  const onTimeDeliveries = await Tracking.countDocuments({
    createdAt: { $gte: startDate, $lte: endDate },
    status: 'Delivered'
  });

  const failedDeliveries = await Tracking.countDocuments({
    createdAt: { $gte: startDate, $lte: endDate },
    status: { $in: ['Failed', 'Cancelled'] }
  });

  const onTimeRate = totalShipments > 0 ? (onTimeDeliveries / totalShipments) * 100 : 0;
  const failureRate = totalShipments > 0 ? (failedDeliveries / totalShipments) * 100 : 0;
  const delayedRate = 100 - onTimeRate - failureRate;

  return {
    summary: {
      avgDeliveryTime: 2.3,
      onTimeDelivery: onTimeRate.toFixed(1),
      failedDeliveries: failureRate.toFixed(1),
      routeEfficiency: 87.5
    },
    chartData: {
      labels: ['On Time', 'Delayed', 'Failed'],
      datasets: [{
        data: [onTimeRate, delayedRate, failureRate],
        backgroundColor: ['#10b981', '#f59e0b', '#ef4444']
      }]
    }
  };
};

// Customer Report Generator
const generateCustomerReport = async (startDate, endDate) => {
  const totalCustomers = await User.countDocuments({ role: 'user' });
  const newCustomers = await User.countDocuments({
    role: 'user',
    createdAt: { $gte: startDate, $lte: endDate }
  });

  const returningCustomers = totalCustomers - newCustomers;
  const retentionRate = 85.5; // Mock retention rate
  const avgOrderValue = await calculateAverageOrderValue(startDate, endDate);

  // Get detailed refund data for customer report with comprehensive information
  const refundData = await Tracking.find({
    $or: [
      { 'payment.refundRequestedAt': { $gte: startDate, $lte: endDate } },
      { 'payment.refundedAt': { $gte: startDate, $lte: endDate } },
      { 'payment.refundRejectedAt': { $gte: startDate, $lte: endDate } },
      { 'payment.status': { $in: ['Refund Requested', 'Refunded', 'Refund Rejected'] } }
    ]
  })
  .populate('assignedPartner', 'name email phone vehicleType vehicleNumber location')
  .populate('sender', 'name email phone')
  .populate('receiver', 'name email phone')
  .sort({ 'payment.refundRequestedAt': -1 })
  .lean();

  // Group refunds by customer with complete comprehensive details
  const customerRefundMap = {};
  refundData.forEach(refund => {
    const customerEmail = refund.sender?.email;
    if (!customerEmail) return;

    if (!customerRefundMap[customerEmail]) {
      customerRefundMap[customerEmail] = {
        customerInfo: {
          name: refund.sender.name,
          email: refund.sender.email,
          phone: refund.sender.phone,
          totalOrders: 0,
          joinedDate: refund.sender.createdAt
        },
        refundRequests: [],
        totalRefundRequests: 0,
        totalRefundAmount: 0,
        approvedRefunds: 0,
        rejectedRefunds: 0,
        pendingRefunds: 0,
        avgProcessingTime: 0,
        refundCategories: {},
        refundReasons: {}
      };
    }

    const customer = customerRefundMap[customerEmail];
    customer.totalRefundRequests++;
    customer.totalRefundAmount += (refund.payment.expectedRefundAmount || refund.payment.amount || 0);

    // Count by status with detailed tracking
    const refundStatus = refund.payment.status;
    if (refundStatus === 'Refunded') {
      customer.approvedRefunds++;
    } else if (refundStatus === 'Refund Rejected') {
      customer.rejectedRefunds++;
    } else if (refundStatus === 'Refund Requested') {
      customer.pendingRefunds++;
    }

    // Track refund categories and reasons
    if (refund.payment.refundCategory) {
      customer.refundCategories[refund.payment.refundCategory] = 
        (customer.refundCategories[refund.payment.refundCategory] || 0) + 1;
    }
    if (refund.payment.refundReason) {
      customer.refundReasons[refund.payment.refundReason] = 
        (customer.refundReasons[refund.payment.refundReason] || 0) + 1;
    }

    // Calculate processing time if completed
    let processingTime = null;
    if (refund.payment.refundedAt && refund.payment.refundRequestedAt) {
      processingTime = Math.ceil(
        (new Date(refund.payment.refundedAt) - new Date(refund.payment.refundRequestedAt)) / (1000 * 60 * 60 * 24)
      );
    } else if (refund.payment.refundRejectedAt && refund.payment.refundRequestedAt) {
      processingTime = Math.ceil(
        (new Date(refund.payment.refundRejectedAt) - new Date(refund.payment.refundRequestedAt)) / (1000 * 60 * 60 * 24)
      );
    }

    // Add complete comprehensive refund details
    customer.refundRequests.push({
      trackingId: refund.trackingId,
      orderDetails: {
        orderId: refund._id,
        orderDate: refund.createdAt,
        deliveryDate: refund.deliveredAt,
        orderStatus: refund.status,
        estimatedDelivery: refund.estimatedDelivery,
        actualDeliveryTime: refund.deliveredAt ? 
          Math.ceil((new Date(refund.deliveredAt) - new Date(refund.createdAt)) / (1000 * 60 * 60 * 24)) : null
      },
      shipmentInfo: {
        origin: refund.origin,
        destination: refund.destination,
        distance: refund.distance,
        packageType: refund.packageDetails?.type,
        packageWeight: refund.packageDetails?.weight,
        packageDimensions: refund.packageDetails?.dimensions,
        packageDescription: refund.packageDetails?.description,
        packageValue: refund.packageDetails?.value,
        specialInstructions: refund.specialInstructions,
        deliveryInstructions: refund.deliveryInstructions,
        priority: refund.priority
      },
      customerInfo: {
        sender: {
          name: refund.sender?.name,
          email: refund.sender?.email,
          phone: refund.sender?.phone,
          address: refund.senderAddress
        },
        receiver: {
          name: refund.receiver?.name,
          email: refund.receiver?.email,
          phone: refund.receiver?.phone,
          address: refund.receiverAddress
        }
      },
      partnerInfo: refund.assignedPartner ? {
        partnerId: refund.assignedPartner._id,
        name: refund.assignedPartner.name,
        email: refund.assignedPartner.email,
        phone: refund.assignedPartner.phone,
        vehicleType: refund.assignedPartner.vehicleType,
        vehicleNumber: refund.assignedPartner.vehicleNumber,
        location: refund.assignedPartner.location,
        rating: refund.partnerRating,
        feedback: refund.partnerFeedback
      } : {
        partnerId: null,
        name: 'Unassigned',
        status: 'No partner assigned'
      },
      paymentInfo: {
        method: refund.payment.method,
        originalAmount: refund.payment.amount,
        expectedRefundAmount: refund.payment.expectedRefundAmount,
        actualRefundAmount: refund.payment.actualRefundAmount,
        transactionId: refund.payment.transactionId,
        upiId: refund.payment.upiId,
        bankDetails: refund.payment.bankDetails,
        paymentStatus: refund.payment.paymentStatus,
        paymentDate: refund.payment.paymentDate,
        refundTransactionId: refund.payment.refundTransactionId
      },
      refundDetails: {
        // Basic refund information
        reason: refund.payment.refundReason,
        category: refund.payment.refundCategory,
        description: refund.payment.refundDescription,
        refundMethod: refund.payment.refundMethod,
        urgency: refund.payment.refundUrgency,
        
        // Status and approval information
        status: refund.payment.status,
        statusDisplay: refund.payment.status === 'Refund Requested' ? 'Under Review' :
                     refund.payment.status === 'Refunded' ? 'Approved & Processed' :
                     refund.payment.status === 'Refund Rejected' ? 'Rejected' :
                     refund.payment.status,
        
        // Timestamps
        requestedAt: refund.payment.refundRequestedAt,
        approvedAt: refund.payment.refundedAt,
        rejectedAt: refund.payment.refundRejectedAt,
        processedAt: refund.payment.refundProcessedAt,
        
        // Admin responses and notes
        adminResponse: refund.payment.adminResponse,
        adminNotes: refund.payment.adminNotes,
        internalNotes: refund.payment.internalNotes,
        approvedBy: refund.payment.approvedBy,
        rejectedBy: refund.payment.rejectedBy,
        
        // Processing information
        processingTime: processingTime,
        processingTimeDisplay: processingTime ? 
          `${processingTime} day${processingTime !== 1 ? 's' : ''}` : 'Pending',
        
        // Evidence and documentation
        hasImages: (refund.payment.refundImages && refund.payment.refundImages.length > 0) || true, // Always true for demo
        imageCount: refund.payment.refundImages ? refund.payment.refundImages.length : 2, // Default to 2 for demo
        images: refund.payment.refundImages ? refund.payment.refundImages.map(img => ({
          filename: img.filename,
          originalName: img.originalName,
          imageUrl: `/api/uploads/refunds/${img.filename}`,
          uploadedAt: img.uploadedAt,
          fileSize: img.fileSize,
          mimeType: img.mimeType
        })) : [
          // Add mock images for testing if no real images exist
          {
            filename: 'refund-1750324640990-139354349.png',
            originalName: 'evidence1.png',
            imageUrl: '/api/uploads/refunds/refund-1750324640990-139354349.png',
            uploadedAt: new Date(),
            fileSize: 125000,
            mimeType: 'image/png'
          },
          {
            filename: 'refund-1750324644160-42641806.png',
            originalName: 'evidence2.png',
            imageUrl: '/api/uploads/refunds/refund-1750324644160-42641806.png',
            uploadedAt: new Date(),
            fileSize: 98000,
            mimeType: 'image/png'
          }
        ],
        
        // Additional documentation
        hasDocuments: refund.payment.supportingDocuments && refund.payment.supportingDocuments.length > 0,
        documents: refund.payment.supportingDocuments || [],
        
        // Quality and satisfaction
        customerSatisfactionScore: refund.customerSatisfactionScore,
        issueResolutionRating: refund.issueResolutionRating,
        
        // Financial impact
        refundImpact: {
          customerRefund: refund.payment.expectedRefundAmount || refund.payment.amount,
          partnerPenalty: refund.partnerPenalty || 0,
          companyLoss: (refund.payment.expectedRefundAmount || refund.payment.amount) + (refund.partnerEarnings || 0),
          processingCost: refund.processingCost || 5 // Estimated processing cost
        }
      },
      timeline: (refund.statusHistory || refund.history || []).map(event => ({
        status: event.status,
        location: event.location,
        timestamp: event.timestamp,
        description: event.description,
        updatedBy: event.updatedBy,
        notes: event.notes
      })),
      financialDetails: {
        revenue: refund.revenue,
        partnerEarnings: refund.partnerEarnings,
        companyProfit: refund.revenue - (refund.partnerEarnings || 0),
        refundAmount: refund.payment.expectedRefundAmount || refund.payment.amount,
        netLoss: (refund.payment.expectedRefundAmount || refund.payment.amount) + (refund.partnerEarnings || 0),
        impactPercentage: refund.revenue > 0 ? 
          (((refund.payment.expectedRefundAmount || refund.payment.amount) / refund.revenue) * 100).toFixed(2) : 0
      },
      qualityMetrics: {
        onTimeDelivery: refund.deliveredAt && refund.estimatedDelivery ? 
          new Date(refund.deliveredAt) <= new Date(refund.estimatedDelivery) : null,
        deliveryRating: refund.deliveryRating,
        serviceRating: refund.serviceRating,
        overallRating: refund.overallRating,
        customerFeedback: refund.customerFeedback,
        issueCategory: refund.issueCategory,
        resolutionSatisfaction: refund.resolutionSatisfaction
      }
    });
  });

  // Convert map to array
  const detailedRefundData = Object.values(customerRefundMap);

  // Get customer satisfaction data based on refunds
  const customerSatisfactionData = await Tracking.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: '$sender.email',
        customerName: { $first: '$sender.name' },
        totalOrders: { $sum: 1 },
        deliveredOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'Delivered'] }, 1, 0] }
        },
        refundRequests: {
          $sum: { $cond: [{ $eq: ['$payment.status', 'Refund Requested'] }, 1, 0] }
        },
        approvedRefunds: {
          $sum: { $cond: [{ $eq: ['$payment.status', 'Refunded'] }, 1, 0] }
        },
        rejectedRefunds: {
          $sum: { $cond: [{ $eq: ['$payment.status', 'Refund Rejected'] }, 1, 0] }
        },
        totalSpent: { $sum: '$payment.amount' },
        totalRefunded: { $sum: '$payment.expectedRefundAmount' }
      }
    },
    {
      $addFields: {
        satisfactionScore: {
          $cond: [
            { $gt: ['$totalOrders', 0] },
            {
              $multiply: [
                {
                  $divide: [
                    { $subtract: ['$deliveredOrders', '$refundRequests'] },
                    '$totalOrders'
                  ]
                },
                100
              ]
            },
            0
          ]
        },
        refundRate: {
          $cond: [
            { $gt: ['$totalOrders', 0] },
            {
              $multiply: [
                { $divide: ['$refundRequests', '$totalOrders'] },
                100
              ]
            },
            0
          ]
        }
      }
    },
    {
      $sort: { refundRate: -1 }
    }
  ]);

  // Get top customers with issues
  const problematicCustomers = customerSatisfactionData
    .filter(customer => customer.refundRate > 20) // More than 20% refund rate
    .slice(0, 10);

  // Get loyal customers (no refunds, multiple orders)
  const loyalCustomers = customerSatisfactionData
    .filter(customer => customer.refundRequests === 0 && customer.totalOrders >= 3)
    .slice(0, 10);

  // Refund trends by customer behavior
  const refundTrends = await Tracking.aggregate([
    {
      $match: {
        'payment.refundRequestedAt': { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$payment.refundRequestedAt" }
        },
        uniqueCustomers: { $addToSet: '$sender.email' },
        totalRefunds: { $sum: 1 },
        totalAmount: { $sum: '$payment.expectedRefundAmount' }
      }
    },
    {
      $addFields: {
        uniqueCustomerCount: { $size: '$uniqueCustomers' }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);

  // Customer Table Data for Admin Reports
  const customerTableData = detailedRefundData.map((customer, index) => ({
    id: index + 1,
    customerId: `CUST-${String(index + 1).padStart(4, '0')}`,
    name: customer.customerInfo.name,
    email: customer.customerInfo.email,
    phone: customer.customerInfo.phone,
    totalRefunds: customer.totalRefundRequests,
    approvedRefunds: customer.approvedRefunds,
    rejectedRefunds: customer.rejectedRefunds,
    pendingRefunds: customer.pendingRefunds,
    totalAmount: Math.round(customer.totalRefundAmount || 0),
    status: customer.pendingRefunds > 0 ? 'Has Pending' : 
            customer.rejectedRefunds > 0 ? 'Has Rejected' : 'All Approved',
    lastRefundDate: customer.refundRequests.length > 0 ? 
      new Date(customer.refundRequests[0].refundDetails.requestedAt).toLocaleDateString() : 'No Refunds',
    approvalRate: customer.totalRefundRequests > 0 
      ? Math.round((customer.approvedRefunds / customer.totalRefundRequests) * 100) + '%'
      : '0%',
    // All refund details for view details modal
    refundDetails: customer.refundRequests.map(refund => ({
      trackingId: refund.trackingId,
      orderDate: new Date(refund.orderDetails.orderDate).toLocaleDateString(),
      deliveryDate: refund.orderDetails.deliveryDate ? 
        new Date(refund.orderDetails.deliveryDate).toLocaleDateString() : 'Not Delivered',
      
      // Shipment Info
      origin: refund.shipmentInfo.origin,
      destination: refund.shipmentInfo.destination,
      packageType: refund.shipmentInfo.packageType,
      packageWeight: refund.shipmentInfo.packageWeight + ' kg',
      packageDescription: refund.shipmentInfo.packageDescription,
      
      // Partner Info
      partnerName: refund.partnerInfo.name || 'Unassigned',
      partnerPhone: refund.partnerInfo.phone || 'N/A',
      vehicleInfo: refund.partnerInfo.vehicleType && refund.partnerInfo.vehicleNumber ? 
        `${refund.partnerInfo.vehicleType} - ${refund.partnerInfo.vehicleNumber}` : 'N/A',
      
      // Payment Info
      originalAmount: '₹' + refund.paymentInfo.originalAmount,
      refundAmount: '₹' + refund.paymentInfo.expectedRefundAmount,
      paymentMethod: refund.paymentInfo.method,
      transactionId: refund.paymentInfo.transactionId,
      
      // Refund Info
      refundReason: refund.refundDetails.reason,
      refundCategory: refund.refundDetails.category,
      refundDescription: refund.refundDetails.description,
      refundStatus: refund.refundDetails.status,
      refundStatusDisplay: refund.refundDetails.statusDisplay,
      
      // Dates
      requestedAt: new Date(refund.refundDetails.requestedAt).toLocaleString(),
      approvedAt: refund.refundDetails.approvedAt ? 
        new Date(refund.refundDetails.approvedAt).toLocaleString() : null,
      rejectedAt: refund.refundDetails.rejectedAt ? 
        new Date(refund.refundDetails.rejectedAt).toLocaleString() : null,
      processingTime: refund.refundDetails.processingTimeDisplay,
      
      // Admin Info
      adminResponse: refund.refundDetails.adminResponse || 'No response yet',
      adminNotes: refund.refundDetails.adminNotes || 'No notes',
      
      // Evidence
      hasImages: refund.refundDetails.hasImages,
      imageCount: refund.refundDetails.imageCount,
      images: refund.refundDetails.images || [],
      
      // Financial Impact
      revenue: '₹' + (refund.financialDetails.revenue || 0),
      partnerEarnings: '₹' + (refund.financialDetails.partnerEarnings || 0),
      companyLoss: '₹' + (refund.financialDetails.netLoss || 0)
    }))
  }));

  return {
    // Main table data for admin reports
    tableData: customerTableData,
    customers: customerTableData, // Alias for compatibility
    
    summary: {
      totalCustomers,
      newCustomers,
      retentionRate,
      avgOrderValue: avgOrderValue.toFixed(2),
      customersWithRefunds: detailedRefundData.length,
      totalRefundRequests: detailedRefundData.reduce((sum, customer) => sum + customer.totalRefundRequests, 0),
      totalApprovedRefunds: detailedRefundData.reduce((sum, customer) => sum + customer.approvedRefunds, 0),
      totalRejectedRefunds: detailedRefundData.reduce((sum, customer) => sum + customer.rejectedRefunds, 0),
      totalPendingRefunds: detailedRefundData.reduce((sum, customer) => sum + customer.pendingRefunds, 0),
      totalRefundAmount: detailedRefundData.reduce((sum, customer) => sum + customer.totalRefundAmount, 0),
      avgRefundRate: customerSatisfactionData.length > 0 
        ? (customerSatisfactionData.reduce((sum, customer) => sum + customer.refundRate, 0) / customerSatisfactionData.length).toFixed(2)
        : 0
    },
    chartData: {
      labels: ['New', 'Returning', 'Inactive'],
      datasets: [{
        data: [newCustomers, returningCustomers, Math.round(totalCustomers * 0.1)],
        backgroundColor: ['#3b82f6', '#10b981', '#6b7280']
      }]
    },
    
    refundAnalysis: {
      customerRefundData: detailedRefundData.map(customer => ({
        customerInfo: customer.customerInfo,
        refundSummary: {
          totalRefundRequests: customer.totalRefundRequests,
          totalRefundAmount: Math.round(customer.totalRefundAmount || 0),
          approvedRefunds: customer.approvedRefunds,
          rejectedRefunds: customer.rejectedRefunds,
          pendingRefunds: customer.pendingRefunds,
          approvalRate: customer.totalRefundRequests > 0 
            ? Math.round((customer.approvedRefunds / customer.totalRefundRequests) * 100 * 10) / 10 
            : 0,
          rejectionRate: customer.totalRefundRequests > 0 
            ? Math.round((customer.rejectedRefunds / customer.totalRefundRequests) * 100 * 10) / 10 
            : 0,
          avgProcessingTime: customer.refundRequests
            .filter(r => r.refundDetails.processingTime)
            .reduce((sum, r, _, arr) => sum + r.refundDetails.processingTime / arr.length, 0) || 0
        },
        detailedRefunds: customer.refundRequests.map(refund => ({
          // Order and Tracking Information
          trackingId: refund.trackingId,
          orderDetails: refund.orderDetails,
          
          // Complete Shipment Information
          shipmentInfo: refund.shipmentInfo,
          
          // Customer Information (Sender & Receiver)
          customerInfo: refund.customerInfo,
          
          // Partner Information with Performance Data
          partnerInfo: refund.partnerInfo,
          
          // Complete Payment Information
          paymentInfo: refund.paymentInfo,
          
          // Comprehensive Refund Details
          refundDetails: {
            // Basic Information
            reason: refund.refundDetails.reason,
            category: refund.refundDetails.category,
            description: refund.refundDetails.description,
            urgency: refund.refundDetails.urgency,
            refundMethod: refund.refundDetails.refundMethod,
            
            // Status Information
            status: refund.refundDetails.status,
            statusDisplay: refund.refundDetails.statusDisplay,
            
            // Timeline Information
            requestedAt: refund.refundDetails.requestedAt,
            approvedAt: refund.refundDetails.approvedAt,
            rejectedAt: refund.refundDetails.rejectedAt,
            processedAt: refund.refundDetails.processedAt,
            processingTime: refund.refundDetails.processingTime,
            processingTimeDisplay: refund.refundDetails.processingTimeDisplay,
            
            // Admin Information
            adminResponse: refund.refundDetails.adminResponse,
            adminNotes: refund.refundDetails.adminNotes,
            internalNotes: refund.refundDetails.internalNotes,
            approvedBy: refund.refundDetails.approvedBy,
            rejectedBy: refund.refundDetails.rejectedBy,
            
            // Evidence and Documentation
            hasImages: refund.refundDetails.hasImages,
            imageCount: refund.refundDetails.imageCount,
            images: refund.refundDetails.images,
            hasDocuments: refund.refundDetails.hasDocuments,
            documents: refund.refundDetails.documents,
            
            // Quality Metrics
            customerSatisfactionScore: refund.refundDetails.customerSatisfactionScore,
            issueResolutionRating: refund.refundDetails.issueResolutionRating,
            
            // Financial Impact
            refundImpact: refund.refundDetails.refundImpact
          },
          
          // Complete Timeline
          timeline: refund.timeline,
          
          // Financial Analysis
          financialDetails: refund.financialDetails,
          
          // Quality and Performance Metrics
          qualityMetrics: refund.qualityMetrics,
          
          // Additional Analysis
          riskAssessment: {
            riskLevel: customer.totalRefundRequests > 5 ? 'High' : 
                      customer.totalRefundRequests > 2 ? 'Medium' : 'Low',
            riskFactors: [
              ...(customer.totalRefundRequests > 5 ? ['Frequent refund requests'] : []),
              ...(refund.refundDetails.urgency === 'High' ? ['High urgency claims'] : []),
              ...(refund.qualityMetrics.deliveryRating && refund.qualityMetrics.deliveryRating < 3 ? ['Poor delivery ratings'] : []),
              ...(refund.financialDetails.impactPercentage > 50 ? ['High financial impact'] : [])
            ],
            recommendedActions: [
              ...(customer.totalRefundRequests > 3 ? ['Monitor customer closely'] : []),
              ...(refund.partnerInfo.partnerId && customer.refundRequests.filter(r => r.partnerInfo.partnerId === refund.partnerInfo.partnerId).length > 1 ? ['Review partner performance'] : []),
              ...(refund.refundDetails.category === 'Damage' ? ['Improve packaging guidelines'] : []),
              ...(refund.refundDetails.category === 'Delay' ? ['Optimize delivery routes'] : [])
            ]
          }
        }))
      })),
      problematicCustomers: problematicCustomers.map(customer => ({
        customerName: customer.customerName,
        customerEmail: customer._id,
        totalOrders: customer.totalOrders,
        refundRequests: customer.refundRequests,
        refundRate: Math.round(customer.refundRate * 10) / 10,
        totalSpent: Math.round(customer.totalSpent),
        totalRefunded: Math.round(customer.totalRefunded || 0),
        satisfactionScore: Math.round(customer.satisfactionScore * 10) / 10
      })),
      loyalCustomers: loyalCustomers.map(customer => ({
        customerName: customer.customerName,
        customerEmail: customer._id,
        totalOrders: customer.totalOrders,
        totalSpent: Math.round(customer.totalSpent),
        satisfactionScore: Math.round(customer.satisfactionScore * 10) / 10
      })),
      refundTrends: refundTrends.map(trend => ({
        date: trend._id,
        uniqueCustomers: trend.uniqueCustomerCount,
        totalRefunds: trend.totalRefunds,
        totalAmount: Math.round(trend.totalAmount || 0)
      }))
    }
  };
};

// Audit Report Generator
const generateAuditReport = async (startDate, endDate) => {
  const totalLogs = await Tracking.countDocuments({
    createdAt: { $gte: startDate, $lte: endDate }
  });

  const errorLogs = await Tracking.countDocuments({
    createdAt: { $gte: startDate, $lte: endDate },
    status: { $in: ['Failed', 'Cancelled'] }
  });

  // Mock recent events
  const recentEvents = await Tracking.find({
    createdAt: { $gte: startDate, $lte: endDate }
  })
  .sort({ createdAt: -1 })
  .limit(10)
  .select('trackingId status createdAt sender')
  .lean();

  const formattedEvents = recentEvents.map(event => ({
    time: event.createdAt.toISOString(),
    event: `Shipment ${event.status.toLowerCase()}`,
    user: event.sender?.email || 'system@courier.com',
    status: event.status === 'Failed' ? 'Failed' : 'Success'
  }));

  return {
    summary: {
      totalLogs,
      errorLogs,
      securityEvents: 12,
      systemUptime: 99.8
    },
    recentEvents: formattedEvents
  };
};

// Helper functions
const calculatePeriodRevenue = async (startDate, endDate) => {
  const shipmentRevenue = await Shipment.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        status: { $in: ['Delivered', 'In Transit', 'Processing'] }
      }
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$price" }
      }
    }
  ]);

  const trackingRevenue = await Tracking.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        revenue: { $gt: 0 },
        status: { $in: ['Delivered', 'In Transit', 'Processing', 'Out for Delivery'] }
      }
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$revenue" }
      }
    }
  ]);

  return (shipmentRevenue[0]?.totalRevenue || 0) + (trackingRevenue[0]?.totalRevenue || 0);
};

const calculateAverageOrderValue = async (startDate, endDate) => {
  const revenue = await calculatePeriodRevenue(startDate, endDate);
  const orderCount = await Tracking.countDocuments({
    createdAt: { $gte: startDate, $lte: endDate }
  });

  return orderCount > 0 ? revenue / orderCount : 0;
};

// Refund Report Generator
const generateRefundReport = async (startDate, endDate) => {
  // Get all refund requests in the date range
  const refundRequests = await Tracking.find({
    'payment.refundRequestedAt': { $gte: startDate, $lte: endDate }
  }).populate('assignedPartner', 'name email vehicleType vehicleNumber');

  // Get approved refunds
  const approvedRefunds = await Tracking.find({
    'payment.refundedAt': { $gte: startDate, $lte: endDate },
    'payment.status': 'Refunded'
  }).populate('assignedPartner', 'name email vehicleType vehicleNumber');

  // Get rejected refunds
  const rejectedRefunds = await Tracking.find({
    'payment.refundRejectedAt': { $gte: startDate, $lte: endDate },
    'payment.status': 'Completed'
  }).populate('assignedPartner', 'name email vehicleType vehicleNumber');

  // Get pending refunds
  const pendingRefunds = await Tracking.find({
    'payment.status': 'Refund Requested'
  }).populate('assignedPartner', 'name email vehicleType vehicleNumber');

  // Calculate refund statistics
  const totalRefundRequests = refundRequests.length;
  const totalApproved = approvedRefunds.length;
  const totalRejected = rejectedRefunds.length;
  const totalPending = pendingRefunds.length;
  
  const approvalRate = totalRefundRequests > 0 ? (totalApproved / totalRefundRequests) * 100 : 0;
  const rejectionRate = totalRefundRequests > 0 ? (totalRejected / totalRefundRequests) * 100 : 0;

  // Calculate total refund amounts
  const totalRefundAmount = approvedRefunds.reduce((sum, refund) => {
    return sum + (refund.payment.expectedRefundAmount || refund.payment.amount || 0);
  }, 0);

  const avgRefundAmount = totalApproved > 0 ? totalRefundAmount / totalApproved : 0;

  // Refund reasons breakdown
  const refundReasons = await Tracking.aggregate([
    {
      $match: {
        'payment.refundRequestedAt': { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: '$payment.refundCategory',
        count: { $sum: 1 },
        totalAmount: { $sum: '$payment.expectedRefundAmount' }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);

  // Daily refund trends
  const dailyTrends = await Tracking.aggregate([
    {
      $match: {
        'payment.refundRequestedAt': { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$payment.refundRequestedAt" }
        },
        requests: { $sum: 1 },
        totalAmount: { $sum: '$payment.expectedRefundAmount' }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);

  // Partner-wise refund analysis
  const partnerRefunds = await Tracking.aggregate([
    {
      $match: {
        'payment.refundRequestedAt': { $gte: startDate, $lte: endDate },
        assignedPartner: { $exists: true }
      }
    },
    {
      $lookup: {
        from: 'partners',
        localField: 'assignedPartner',
        foreignField: '_id',
        as: 'partner'
      }
    },
    {
      $unwind: '$partner'
    },
    {
      $group: {
        _id: '$assignedPartner',
        partnerName: { $first: '$partner.name' },
        partnerEmail: { $first: '$partner.email' },
        vehicleType: { $first: '$partner.vehicleType' },
        refundCount: { $sum: 1 },
        totalRefundAmount: { $sum: '$payment.expectedRefundAmount' },
        approvedCount: {
          $sum: {
            $cond: [{ $eq: ['$payment.status', 'Refunded'] }, 1, 0]
          }
        }
      }
    },
    {
      $sort: { refundCount: -1 }
    },
    {
      $limit: 10
    }
  ]);

  // Recent refund activities
  const recentActivities = [
    ...approvedRefunds.slice(0, 5).map(refund => ({
      type: 'approved',
      trackingId: refund.trackingId,
      amount: refund.payment.expectedRefundAmount || refund.payment.amount,
      reason: refund.payment.refundReason,
      date: refund.payment.refundedAt,
      customerName: refund.sender?.name || 'Unknown',
      partnerName: refund.assignedPartner?.name || 'Unassigned'
    })),
    ...rejectedRefunds.slice(0, 5).map(refund => ({
      type: 'rejected',
      trackingId: refund.trackingId,
      amount: refund.payment.expectedRefundAmount || refund.payment.amount,
      reason: refund.payment.refundReason,
      date: refund.payment.refundRejectedAt,
      customerName: refund.sender?.name || 'Unknown',
      partnerName: refund.assignedPartner?.name || 'Unassigned'
    })),
    ...pendingRefunds.slice(0, 5).map(refund => ({
      type: 'pending',
      trackingId: refund.trackingId,
      amount: refund.payment.expectedRefundAmount || refund.payment.amount,
      reason: refund.payment.refundReason,
      date: refund.payment.refundRequestedAt,
      customerName: refund.sender?.name || 'Unknown',
      partnerName: refund.assignedPartner?.name || 'Unassigned'
    }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);

  return {
    summary: {
      totalRefundRequests,
      totalApproved,
      totalRejected,
      totalPending,
      approvalRate: Math.round(approvalRate * 10) / 10,
      rejectionRate: Math.round(rejectionRate * 10) / 10,
      totalRefundAmount: Math.round(totalRefundAmount),
      avgRefundAmount: Math.round(avgRefundAmount * 100) / 100
    },
    chartData: {
      // Refund status distribution
      statusDistribution: {
        labels: ['Approved', 'Rejected', 'Pending'],
        datasets: [{
          data: [totalApproved, totalRejected, totalPending],
          backgroundColor: ['#10b981', '#ef4444', '#f59e0b']
        }]
      },
      // Daily trends
      dailyTrends: {
        labels: dailyTrends.map(trend => trend._id),
        datasets: [{
          label: 'Refund Requests',
          data: dailyTrends.map(trend => trend.requests),
          backgroundColor: 'rgba(239, 68, 68, 0.8)',
          borderColor: '#ef4444'
        }]
      },
      // Refund reasons
      reasonsBreakdown: {
        labels: refundReasons.map(reason => reason._id || 'Other'),
        datasets: [{
          data: refundReasons.map(reason => reason.count),
          backgroundColor: ['#ef4444', '#f59e0b', '#8b5cf6', '#06b6d4', '#84cc16']
        }]
      }
    },
    details: {
      refundReasons,
      partnerRefunds,
      recentActivities,
      pendingRefunds: pendingRefunds.map(refund => ({
        trackingId: refund.trackingId,
        customerName: refund.sender?.name || 'Unknown',
        customerEmail: refund.sender?.email || 'Unknown',
        amount: refund.payment.expectedRefundAmount || refund.payment.amount,
        reason: refund.payment.refundReason,
        category: refund.payment.refundCategory,
        description: refund.payment.refundDescription,
        requestedAt: refund.payment.refundRequestedAt,
        urgency: refund.payment.refundUrgency,
        partnerName: refund.assignedPartner?.name || 'Unassigned',
        partnerEmail: refund.assignedPartner?.email || 'N/A',
        hasImages: refund.payment.refundImages && refund.payment.refundImages.length > 0,
        imageCount: refund.payment.refundImages ? refund.payment.refundImages.length : 0,
        images: refund.payment.refundImages ? refund.payment.refundImages.map(image => ({
          ...image,
          imageUrl: `/api/uploads/refunds/${image.filename}`
        })) : []
      }))
    }
  };
};

// Helper function to generate notifications for status changes
const generateNotificationsForStatusChange = async (trackingId, status) => {
  const newNotifications = [];
  
  try {
    const tracking = await Tracking.findOne({ trackingId });
    if (!tracking) return newNotifications;

    const timestamp = new Date();
    
    // Generate different types of notifications based on status
    switch (status.toLowerCase()) {
      case 'delivered':
        newNotifications.push({
          id: `delivered_${trackingId}_${timestamp.getTime()}`,
          type: 'success',
          title: 'Delivery Completed',
          message: `Package ${trackingId} has been successfully delivered to ${tracking.receiver?.name || 'customer'}.`,
          timestamp,
          read: false,
          category: 'operations',
          actions: ['View Details', 'Send Feedback Request'],
          data: { trackingId, customerName: tracking.receiver?.name }
        });
        break;
        
      case 'failed':
      case 'cancelled':
        newNotifications.push({
          id: `failed_${trackingId}_${timestamp.getTime()}`,
          type: 'critical',
          title: 'Delivery Failed',
          message: `Package ${trackingId} delivery failed. Immediate attention required.`,
          timestamp,
          read: false,
          category: 'operations',
          actions: ['Reschedule', 'Contact Customer', 'Investigate'],
          data: { trackingId, reason: 'Delivery attempt failed' }
        });
        break;
        
      case 'out for delivery':
        newNotifications.push({
          id: `out_for_delivery_${trackingId}_${timestamp.getTime()}`,
          type: 'info',
          title: 'Package Out for Delivery',
          message: `Package ${trackingId} is now out for delivery to ${tracking.destination}.`,
          timestamp,
          read: false,
          category: 'operations',
          actions: ['Track Route', 'Notify Customer'],
          data: { trackingId, destination: tracking.destination }
        });
        break;
        
      case 'in transit':
        newNotifications.push({
          id: `in_transit_${trackingId}_${timestamp.getTime()}`,
          type: 'info',
          title: 'Package In Transit',
          message: `Package ${trackingId} is now in transit from ${tracking.origin} to ${tracking.destination}.`,
          timestamp,
          read: false,
          category: 'operations',
          actions: ['View Route', 'Update ETA'],
          data: { trackingId, origin: tracking.origin, destination: tracking.destination }
        });
        break;
        
      case 'processing':
        newNotifications.push({
          id: `processing_${trackingId}_${timestamp.getTime()}`,
          type: 'info',
          title: 'Package Processing',
          message: `Package ${trackingId} is being processed at our facility.`,
          timestamp,
          read: false,
          category: 'operations',
          actions: ['View Details', 'Expedite'],
          data: { trackingId }
        });
        break;
    }
    
    return newNotifications;
  } catch (error) {
    console.error('Error generating notifications for status change:', error);
    return newNotifications;
  }
};

// Enhanced WebSocket notification system
export const emitRealtimeNotification = (io, notificationType, data) => {
  if (!io) return;
  
  const timestamp = new Date();
  
  switch (notificationType) {
    case 'new_shipment':
      io.to('admin-room').emit('new-notification', {
        id: `new_shipment_${data.trackingId}_${timestamp.getTime()}`,
        type: 'info',
        title: 'New Shipment Created',
        message: `New shipment ${data.trackingId} has been created by ${data.senderName || 'customer'}.`,
        timestamp,
        read: false,
        category: 'business',
        actions: ['View Shipment', 'Process'],
        data: { trackingId: data.trackingId, senderName: data.senderName }
      });
      break;
      
    case 'user_registration':
      io.to('admin-room').emit('new-notification', {
        id: `user_reg_${data.userId}_${timestamp.getTime()}`,
        type: 'info',
        title: 'New User Registration',
        message: `New user ${data.email} has registered on the platform.`,
        timestamp,
        read: false,
        category: 'business',
        actions: ['View Profile', 'Send Welcome'],
        data: { userId: data.userId, email: data.email }
      });
      break;
      
    case 'revenue_milestone':
      io.to('admin-room').emit('new-notification', {
        id: `revenue_milestone_${timestamp.getTime()}`,
        type: 'success',
        title: 'Revenue Milestone Achieved',
        message: `Daily revenue target of ${data.target} has been reached! Current: ${data.current}`,
        timestamp,
        read: false,
        category: 'business',
        actions: ['View Analytics', 'Generate Report'],
        data: { target: data.target, current: data.current }
      });
      break;
      
    case 'system_alert':
      io.to('admin-room').emit('new-notification', {
        id: `system_alert_${timestamp.getTime()}`,
        type: data.severity || 'warning',
        title: data.title || 'System Alert',
        message: data.message,
        timestamp,
        read: false,
        category: 'system',
        actions: data.actions || ['Investigate'],
        data: data.additionalData || {}
      });
      break;
      
    case 'bulk_status_update':
      io.to('admin-room').emit('new-notification', {
        id: `bulk_update_${timestamp.getTime()}`,
        type: 'info',
        title: 'Bulk Status Update',
        message: `${data.count} shipments have been updated to ${data.status} status.`,
        timestamp,
        read: false,
        category: 'operations',
        actions: ['View Updated Shipments'],
        data: { count: data.count, status: data.status }
      });
      break;
  }
};

// Enhanced real-time dashboard updates
export const emitDashboardUpdate = async (io, updateType, data = {}) => {
  if (!io) return;
  
  try {
    switch (updateType) {
      case 'stats':
        const updatedStats = await getDashboardStatsData();
        io.to('admin-room').emit('dashboard-stats-update', {
          ...updatedStats,
          lastUpdated: new Date()
        });
        break;
        
      case 'analytics':
        const updatedAnalytics = await getRealtimeAnalyticsData();
        io.to('admin-room').emit('analytics-update', {
          ...updatedAnalytics,
          lastUpdated: new Date()
        });
        break;
        
      case 'shipments':
        const recentShipments = await Tracking.find()
          .sort({ createdAt: -1 })
          .limit(10)
          .lean();
          
        const formattedShipments = recentShipments.map(shipment => ({
          id: shipment.trackingId,
          customer: shipment.sender?.name || '-',
          status: shipment.status,
          origin: shipment.origin,
          destination: shipment.destination,
          currentLocation: shipment.currentLocation,
          date: shipment.createdAt
        }));
        
        io.to('admin-room').emit('recent-shipments-update', {
          shipments: formattedShipments,
          lastUpdated: new Date()
        });
        break;
        
      case 'revenue':
        const revenueData = await calculateTodayRevenue();
        io.to('admin-room').emit('revenue-update', {
          todayRevenue: revenueData,
          lastUpdated: new Date()
        });
        break;
        
      case 'notifications':
        const notifications = await generateSystemNotifications();
        io.to('admin-room').emit('notifications-update', {
          notifications,
          lastUpdated: new Date()
        });
        break;
    }
  } catch (error) {
    console.error('Error emitting dashboard update:', error);
  }
};

// Generate system-wide notifications
const generateSystemNotifications = async () => {
  const notifications = [];
  const timestamp = new Date();
  
  try {
    // Check for high-priority alerts
    const failedDeliveries = await Tracking.countDocuments({ 
      status: { $in: ['Failed', 'Cancelled'] },
      updatedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
    });
    
    if (failedDeliveries > 5) {
      notifications.push({
        id: `high_failures_${timestamp.getTime()}`,
        type: 'critical',
        title: 'High Failure Rate Alert',
        message: `${failedDeliveries} deliveries have failed in the last 24 hours. Immediate attention required.`,
        timestamp,
        read: false,
        category: 'operations',
        actions: ['View Failed Deliveries', 'Generate Report', 'Contact Operations'],
        data: { failureCount: failedDeliveries }
      });
    }
    
    // Check for pending shipments
    const pendingShipments = await Tracking.countDocuments({ status: 'Pending' });
    if (pendingShipments > 20) {
      notifications.push({
        id: `high_pending_${timestamp.getTime()}`,
        type: 'warning',
        title: 'High Pending Queue',
        message: `${pendingShipments} shipments are pending processing. Consider increasing processing capacity.`,
        timestamp,
        read: false,
        category: 'operations',
        actions: ['Process Queue', 'Assign Resources', 'View Details'],
        data: { pendingCount: pendingShipments }
      });
    }
    
    // Check for revenue milestones
    const todayRevenue = await calculateTodayRevenue();
    const dailyTarget = 1000;
    
    if (todayRevenue >= dailyTarget && todayRevenue < dailyTarget * 1.1) {
      notifications.push({
        id: `revenue_target_met_${timestamp.getTime()}`,
        type: 'success',
        title: 'Daily Revenue Target Achieved',
        message: `Today's revenue of ${todayRevenue.toFixed(2)} has met the daily target of ${dailyTarget}.`,
        timestamp,
        read: false,
        category: 'business',
        actions: ['View Revenue Report', 'Set New Target'],
        data: { revenue: todayRevenue, target: dailyTarget }
      });
    } else if (todayRevenue >= dailyTarget * 1.5) {
      notifications.push({
        id: `revenue_exceeded_${timestamp.getTime()}`,
        type: 'success',
        title: 'Exceptional Revenue Performance',
        message: `Today's revenue of ${todayRevenue.toFixed(2)} has exceeded expectations by ${((todayRevenue / dailyTarget - 1) * 100).toFixed(1)}%!`,
        timestamp,
        read: false,
        category: 'business',
        actions: ['Celebrate', 'Analyze Success Factors', 'Plan Scaling'],
        data: { revenue: todayRevenue, target: dailyTarget, percentage: ((todayRevenue / dailyTarget - 1) * 100).toFixed(1) }
      });
    }
    
    // Check for new user registrations
    const newUsersToday = await User.countDocuments({
      role: 'user',
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });
    
    if (newUsersToday >= 10) {
      notifications.push({
        id: `user_growth_${timestamp.getTime()}`,
        type: 'info',
        title: 'Strong User Growth',
        message: `${newUsersToday} new users registered today. Platform growth is accelerating!`,
        timestamp,
        read: false,
        category: 'business',
        actions: ['View User Analytics', 'Send Welcome Campaign'],
        data: { newUsers: newUsersToday }
      });
    }
    
    return notifications;
  } catch (error) {
    console.error('Error generating system notifications:', error);
    return notifications;
  }
};

// WebSocket event handlers for admin actions
export const handleAdminWebSocketEvents = (io, socket) => {
  // Join admin room for real-time updates
  socket.on('join-admin-room', () => {
    socket.join('admin-room');
    console.log(`Admin ${socket.id} joined admin room`);
  });
  
  // Leave admin room
  socket.on('leave-admin-room', () => {
    socket.leave('admin-room');
    console.log(`Admin ${socket.id} left admin room`);
  });
  
  // Mark notification as read
  socket.on('mark-notification-read', (notificationId) => {
    socket.to('admin-room').emit('notification-read', { notificationId });
  });
  
  // Request dashboard refresh
  socket.on('request-dashboard-refresh', async () => {
    await emitDashboardUpdate(io, 'stats');
    await emitDashboardUpdate(io, 'analytics');
    await emitDashboardUpdate(io, 'shipments');
  });
  
  // Bulk status update
  socket.on('bulk-status-update', async (data) => {
    try {
      const { trackingIds, newStatus } = data;
      
      // Update multiple shipments
      await Tracking.updateMany(
        { trackingId: { $in: trackingIds } },
        { 
          status: newStatus,
          $push: { 
            history: { 
              status: newStatus, 
              location: 'Bulk Update', 
              timestamp: new Date() 
            } 
          }
        }
      );
      
      // Emit bulk update notification
      emitRealtimeNotification(io, 'bulk_status_update', {
        count: trackingIds.length,
        status: newStatus
      });
      
      // Refresh dashboard
      await emitDashboardUpdate(io, 'stats');
      await emitDashboardUpdate(io, 'analytics');
      await emitDashboardUpdate(io, 'shipments');
      
    } catch (error) {
      console.error('Error handling bulk status update:', error);
      socket.emit('bulk-update-error', { message: 'Failed to update shipments' });
    }
  });
  
  // Emergency alert broadcast
  socket.on('broadcast-emergency-alert', (alertData) => {
    emitRealtimeNotification(io, 'system_alert', {
      severity: 'critical',
      title: alertData.title || 'Emergency Alert',
      message: alertData.message,
      actions: ['Acknowledge', 'Take Action'],
      additionalData: alertData
    });
  });
  
  // Performance monitoring request
  socket.on('request-performance-metrics', async () => {
    try {
      const metrics = {
        activeConnections: io.engine.clientsCount,
        memoryUsage: process.memoryUsage(),
        uptime: process.uptime(),
        timestamp: new Date()
      };
      
      socket.emit('performance-metrics', metrics);
    } catch (error) {
      console.error('Error getting performance metrics:', error);
    }
  });
};

// Partner Management Functions

// Get all partners
export const getAllPartners = async (req, res) => {
  try {
    const { status, page = 1, limit = 10, search } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (status) {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { vehicleNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const partners = await Partner.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Partner.countDocuments(query);

    res.json({
      success: true,
      partners,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: partners.length,
        totalRecords: total
      }
    });

  } catch (error) {
    console.error('Error fetching partners:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching partners'
    });
  }
};

// Get partner details
export const getPartnerDetails = async (req, res) => {
  try {
    const { partnerId } = req.params;

    const partner = await Partner.findById(partnerId).select('-password');
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    // Get partner's delivery history
    const deliveries = await Tracking.find({ assignedPartner: partnerId })
      .populate('sender receiver', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(10);

    // Get partner's earnings
    const earnings = await Tracking.aggregate([
      {
        $match: {
          assignedPartner: partner._id,
          status: 'delivered'
        }
      },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: '$partnerEarnings' },
          totalDeliveries: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      partner,
      deliveries,
      earnings: earnings[0] || { totalEarnings: 0, totalDeliveries: 0 }
    });

  } catch (error) {
    console.error('Error fetching partner details:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching partner details'
    });
  }
};

// Update partner status
export const updatePartnerStatus = async (req, res) => {
  try {
    const { partnerId } = req.params;
    const { status, notes } = req.body;

    const partner = await Partner.findById(partnerId);
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    const oldStatus = partner.status;
    partner.status = status;

    // If approving partner, set as active
    if (status === 'approved') {
      partner.isActive = true;
      partner.isVerified = true;
      partner.verifiedAt = new Date();
      partner.verifiedBy = req.userId; // Admin who approved
    } else if (status === 'rejected' || status === 'suspended') {
      partner.isActive = false;
      partner.isOnline = false;
    }

    // Add admin note
    if (notes) {
      partner.adminNotes.push({
        note: notes,
        addedBy: req.userId,
        addedAt: new Date()
      });
    }

    await partner.save();

    // Send notification email to partner
    try {
      let emailSubject = '';
      let emailContent = '';

      switch (status) {
        case 'approved':
          emailSubject = '🎉 Welcome to Prime Dispatcher - Application Approved!';
          emailContent = `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8">
              <title>Application Approved</title>
            </head>
            <body style="background:#f8fafc; margin:0; padding:0; font-family:Arial,sans-serif;">
              <div style="max-width:600px; margin:0 auto; padding:20px;">
                <div style="background:#ffffff; border-radius:12px; padding:32px; box-shadow:0 4px 6px rgba(0,0,0,0.1);">
                  <div style="text-align:center; margin-bottom:24px;">
                    <h1 style="color:#10b981; font-size:28px; margin:0;">🎉 Congratulations!</h1>
                    <h2 style="color:#374151; font-size:20px; margin:8px 0;">Your Application Has Been Approved</h2>
                  </div>
                  
                  <div style="background:#f0fdf4; border-left:4px solid #10b981; padding:16px; margin:20px 0; border-radius:4px;">
                    <p style="color:#166534; margin:0; font-weight:bold;">✅ You are now an official Prime Dispatcher Partner!</p>
                  </div>
                  
                  <p style="color:#374151; font-size:16px; line-height:1.6;">Dear ${partner.name},</p>
                  
                  <p style="color:#374151; font-size:16px; line-height:1.6;">
                    We're excited to inform you that your delivery partner application has been <strong>approved</strong>! 
                    You can now start accepting delivery requests and earning with Prime Dispatcher.
                  </p>
                  
                  <div style="background:#fef3c7; border-radius:8px; padding:20px; margin:24px 0;">
                    <h3 style="color:#92400e; margin:0 0 12px 0;">🚀 Next Steps:</h3>
                    <ul style="color:#92400e; margin:0; padding-left:20px;">
                      <li style="margin:8px 0;">Login to your partner dashboard at <a href="${process.env.FRONTEND_URL}/partner" style="color:#d97706;">Partner Portal</a></li>
                      <li style="margin:8px 0;">Complete your profile setup and upload required documents</li>
                      <li style="margin:8px 0;">Set your availability and preferred working zones</li>
                      <li style="margin:8px 0;">Start accepting delivery requests and earn money!</li>
                    </ul>
                  </div>
                  
                  <div style="background:#eff6ff; border-radius:8px; padding:20px; margin:24px 0;">
                    <h3 style="color:#1e40af; margin:0 0 12px 0;">📱 Your Partner Credentials:</h3>
                    <p style="color:#1e40af; margin:4px 0;"><strong>Email:</strong> ${partner.email}</p>
                    <p style="color:#1e40af; margin:4px 0;"><strong>Partner ID:</strong> ${partner._id}</p>
                    <p style="color:#1e40af; margin:4px 0;"><strong>Vehicle:</strong> ${partner.vehicleType} - ${partner.vehicleNumber}</p>
                  </div>
                  
                  <div style="text-align:center; margin:32px 0;">
                    <a href="${process.env.FRONTEND_URL}/partner" 
                       style="background:#10b981; color:#ffffff; padding:12px 24px; text-decoration:none; border-radius:6px; font-weight:bold; display:inline-block;">
                      🚀 Access Partner Dashboard
                    </a>
                  </div>
                  
                  <div style="border-top:1px solid #e5e7eb; padding-top:20px; margin-top:32px;">
                    <p style="color:#6b7280; font-size:14px; margin:0;">
                      Need help? Contact our support team at <a href="mailto:support@primedispatcher.com" style="color:#10b981;">support@primedispatcher.com</a>
                    </p>
                    <p style="color:#10b981; font-size:16px; font-weight:bold; margin:16px 0 0 0;">
                      Welcome to the Prime Dispatcher family! 🚛💨
                    </p>
                    <p style="color:#6b7280; font-size:14px; margin:8px 0 0 0;">
                      Best regards,<br>Prime Dispatcher Team
                    </p>
                  </div>
                </div>
              </div>
            </body>
            </html>
          `;
          break;

        case 'rejected':
          emailSubject = 'Prime Dispatcher - Application Status Update';
          emailContent = `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8">
              <title>Application Status Update</title>
            </head>
            <body style="background:#f8fafc; margin:0; padding:0; font-family:Arial,sans-serif;">
              <div style="max-width:600px; margin:0 auto; padding:20px;">
                <div style="background:#ffffff; border-radius:12px; padding:32px; box-shadow:0 4px 6px rgba(0,0,0,0.1);">
                  <div style="text-align:center; margin-bottom:24px;">
                    <h1 style="color:#dc2626; font-size:24px; margin:0;">Application Status Update</h1>
                  </div>
                  
                  <p style="color:#374151; font-size:16px; line-height:1.6;">Dear ${partner.name},</p>
                  
                  <p style="color:#374151; font-size:16px; line-height:1.6;">
                    Thank you for your interest in becoming a delivery partner with Prime Dispatcher.
                  </p>
                  
                  <div style="background:#fef2f2; border-left:4px solid #dc2626; padding:16px; margin:20px 0; border-radius:4px;">
                    <p style="color:#991b1b; margin:0; font-weight:bold;">
                      After careful review, we are unable to approve your application at this time.
                    </p>
                  </div>
                  
                  ${notes ? `
                  <div style="background:#fffbeb; border-radius:8px; padding:20px; margin:24px 0;">
                    <h3 style="color:#92400e; margin:0 0 12px 0;">📝 Feedback:</h3>
                    <p style="color:#92400e; margin:0;">${notes}</p>
                  </div>
                  ` : ''}
                  
                  <div style="background:#f0f9ff; border-radius:8px; padding:20px; margin:24px 0;">
                    <h3 style="color:#1e40af; margin:0 0 12px 0;">🔄 Next Steps:</h3>
                    <ul style="color:#1e40af; margin:0; padding-left:20px;">
                      <li style="margin:8px 0;">Review the feedback provided above</li>
                      <li style="margin:8px 0;">Address any mentioned concerns</li>
                      <li style="margin:8px 0;">You may reapply after making necessary improvements</li>
                      <li style="margin:8px 0;">Contact support if you need clarification</li>
                    </ul>
                  </div>
                  
                  <div style="text-align:center; margin:32px 0;">
                    <a href="${process.env.FRONTEND_URL}/partner" 
                       style="background:#3b82f6; color:#ffffff; padding:12px 24px; text-decoration:none; border-radius:6px; font-weight:bold; display:inline-block;">
                      Apply Again
                    </a>
                  </div>
                  
                  <div style="border-top:1px solid #e5e7eb; padding-top:20px; margin-top:32px;">
                    <p style="color:#6b7280; font-size:14px; margin:0;">
                      Questions? Contact us at <a href="mailto:support@primedispatcher.com" style="color:#3b82f6;">support@primedispatcher.com</a>
                    </p>
                    <p style="color:#6b7280; font-size:14px; margin:8px 0 0 0;">
                      Best regards,<br>Prime Dispatcher Team
                    </p>
                  </div>
                </div>
              </div>
            </body>
            </html>
          `;
          break;

        case 'suspended':
          emailSubject = 'Prime Dispatcher - Account Suspended';
          emailContent = `
            <h2>Account Suspension Notice</h2>
            <p>Dear ${partner.name},</p>
            <p>Your delivery partner account has been temporarily suspended.</p>
            ${notes ? `<p><strong>Reason:</strong> ${notes}</p>` : ''}
            <p>Please contact our support team for more information.</p>
            <p>Best regards,<br>Prime Dispatcher Team</p>
          `;
          break;
      }

      if (emailSubject && emailContent) {
        await sendDeliveryEmail(partner.email, emailSubject, emailContent);
        console.log(`✅ Partner ${status} email sent successfully to: ${partner.email}`);
      }
    } catch (emailError) {
      console.error(`❌ Failed to send partner ${status} email to ${partner.email}:`, emailError);
    }

    res.json({
      success: true,
      message: `Partner status updated to ${status}`,
      partner: {
        id: partner._id,
        name: partner.name,
        email: partner.email,
        status: partner.status,
        isActive: partner.isActive
      }
    });

  } catch (error) {
    console.error('Error updating partner status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating partner status'
    });
  }
};

// Assign delivery to partner
export const assignDeliveryToPartner = async (req, res) => {
  try {
    const { trackingId, partnerId } = req.body;

    const tracking = await Tracking.findOne({ trackingId });
    if (!tracking) {
      return res.status(404).json({
        success: false,
        message: 'Tracking record not found'
      });
    }

    const partner = await Partner.findById(partnerId);
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    if (partner.status !== 'approved' || !partner.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Partner is not available for assignments'
      });
    }

    // Assign partner to delivery
    tracking.assignedPartner = partnerId;
    tracking.status = 'assigned';
    tracking.statusHistory.push({
      status: 'assigned',
      timestamp: new Date(),
      notes: `Assigned to partner: ${partner.name}`
    });

    await tracking.save();

    // Update partner stats
    partner.totalDeliveries += 1;
    await partner.save();

    res.json({
      success: true,
      message: 'Delivery assigned to partner successfully',
      tracking: {
        trackingId: tracking.trackingId,
        status: tracking.status,
        assignedPartner: {
          id: partner._id,
          name: partner.name,
          vehicleType: partner.vehicleType,
          vehicleNumber: partner.vehicleNumber
        }
      }
    });

  } catch (error) {
    console.error('Error assigning delivery to partner:', error);
    res.status(500).json({
      success: false,
      message: 'Error assigning delivery to partner'
    });
  }
};

// Get partner performance analytics
export const getPartnerAnalytics = async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    let startDate = new Date();
    if (period === 'week') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === 'month') {
      startDate.setMonth(startDate.getMonth() - 1);
    } else if (period === 'year') {
      startDate.setFullYear(startDate.getFullYear() - 1);
    }

    // Partner status distribution
    const statusDistribution = await Partner.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Top performing partners
    const topPartners = await Partner.find({ status: 'approved' })
      .sort({ rating: -1, completedDeliveries: -1 })
      .limit(10)
      .select('name email rating completedDeliveries totalEarnings vehicleType');

    // Partner registrations over time
    const registrationTrends = await Partner.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
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

    // Vehicle type distribution
    const vehicleDistribution = await Partner.aggregate([
      {
        $match: { status: 'approved' }
      },
      {
        $group: {
          _id: '$vehicleType',
          count: { $sum: 1 }
        }
      }
    ]);

    // Average ratings and performance
    const performanceStats = await Partner.aggregate([
      {
        $match: { status: 'approved' }
      },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          avgCompletionRate: { $avg: { $divide: ['$completedDeliveries', '$totalDeliveries'] } },
          totalEarnings: { $sum: '$totalEarnings' },
          totalDeliveries: { $sum: '$totalDeliveries' }
        }
      }
    ]);

    res.json({
      success: true,
      analytics: {
        statusDistribution,
        topPartners,
        registrationTrends,
        vehicleDistribution,
        performanceStats: performanceStats[0] || {
          avgRating: 0,
          avgCompletionRate: 0,
          totalEarnings: 0,
          totalDeliveries: 0
        }
      }
    });

  } catch (error) {
    console.error('Error fetching partner analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching partner analytics'
    });
  }
};

// Bulk partner actions
export const bulkPartnerActions = async (req, res) => {
  try {
    const { partnerIds, action, data } = req.body;

    if (!partnerIds || !Array.isArray(partnerIds) || partnerIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Partner IDs are required'
      });
    }

    let updateData = {};
    let emailNotifications = [];

    switch (action) {
      case 'approve':
        updateData = {
          status: 'approved',
          isActive: true,
          isVerified: true,
          verifiedAt: new Date(),
          verifiedBy: req.userId
        };
        break;

      case 'reject':
        updateData = {
          status: 'rejected',
          isActive: false
        };
        break;

      case 'suspend':
        updateData = {
          status: 'suspended',
          isActive: false,
          isOnline: false
        };
        break;

      case 'activate':
        updateData = {
          isActive: true
        };
        break;

      case 'deactivate':
        updateData = {
          isActive: false,
          isOnline: false
        };
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid action'
        });
    }

    // Update partners
    const result = await Partner.updateMany(
      { _id: { $in: partnerIds } },
      updateData
    );

    // Get updated partners for email notifications
    const updatedPartners = await Partner.find({ _id: { $in: partnerIds } })
      .select('name email status');

    // Send email notifications (async)
    updatedPartners.forEach(async (partner) => {
      try {
        let emailSubject = '';
        let emailContent = '';

        switch (action) {
          case 'approve':
            emailSubject = 'Welcome to Prime Dispatcher - Application Approved!';
            emailContent = `
              <h2>Congratulations! Your application has been approved.</h2>
              <p>Dear ${partner.name},</p>
              <p>You can now start accepting delivery requests and earning with Prime Dispatcher.</p>
            `;
            break;

          case 'reject':
            emailSubject = 'Prime Dispatcher - Application Update';
            emailContent = `
              <h2>Application Status Update</h2>
              <p>Dear ${partner.name},</p>
              <p>Your application has been reviewed. Please contact support for more information.</p>
            `;
            break;

          case 'suspend':
            emailSubject = 'Prime Dispatcher - Account Suspended';
            emailContent = `
              <h2>Account Suspension Notice</h2>
              <p>Dear ${partner.name},</p>
              <p>Your account has been temporarily suspended. Please contact support.</p>
            `;
            break;
        }

        if (emailSubject && emailContent) {
          await sendDeliveryEmail(partner.email, emailSubject, emailContent);
        }
      } catch (emailError) {
        console.error(`Failed to send email to ${partner.email}:`, emailError);
      }
    });

    res.json({
      success: true,
      message: `Bulk ${action} completed successfully`,
      modifiedCount: result.modifiedCount,
      affectedPartners: updatedPartners.length
    });

  } catch (error) {
    console.error('Error performing bulk partner action:', error);
    res.status(500).json({
      success: false,
      message: 'Error performing bulk action'
    });
  }
};

// Delivery Management Functions

// Get all deliveries for admin
export const getAllDeliveries = async (req, res) => {
  try {
    const { status, page = 1, limit = 20, search, partnerId } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    
    // Filter by status
    if (status && status !== 'all') {
      if (status === 'in_transit') {
        query.status = { $in: ['in_transit', 'in transit', 'picked_up', 'out_for_delivery', 'out for delivery'] };
      } else if (status === 'failed') {
        query.status = { $in: ['failed', 'cancelled'] };
      } else {
        query.status = { $regex: new RegExp(status, 'i') };
      }
    }

    // Filter by partner
    if (partnerId) {
      query.assignedPartner = partnerId;
    }

    // Search functionality
    if (search) {
      query.$or = [
        { trackingId: { $regex: search, $options: 'i' } },
        { 'sender.name': { $regex: search, $options: 'i' } },
        { 'receiver.name': { $regex: search, $options: 'i' } },
        { origin: { $regex: search, $options: 'i' } },
        { destination: { $regex: search, $options: 'i' } }
      ];
    }

    const deliveries = await Tracking.find(query)
      .populate('assignedPartner', 'name email phone vehicleType vehicleNumber rating isOnline')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Tracking.countDocuments(query);

    // Get delivery statistics
    const stats = {
      total: await Tracking.countDocuments(),
      pending: await Tracking.countDocuments({ status: { $regex: /pending/i } }),
      assigned: await Tracking.countDocuments({ status: { $regex: /assigned/i } }),
      in_transit: await Tracking.countDocuments({ 
        status: { $in: ['in_transit', 'in transit', 'picked_up', 'out_for_delivery', 'out for delivery'] }
      }),
      delivered: await Tracking.countDocuments({ status: { $regex: /delivered/i } }),
      failed: await Tracking.countDocuments({ status: { $in: ['failed', 'cancelled'] } })
    };

    res.json({
      success: true,
      deliveries,
      stats,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: deliveries.length,
        totalRecords: total
      }
    });

  } catch (error) {
    console.error('Error fetching deliveries:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching deliveries'
    });
  }
};

// Get delivery details
export const getDeliveryDetails = async (req, res) => {
  try {
    const { trackingId } = req.params;

    const delivery = await Tracking.findOne({ trackingId })
      .populate('assignedPartner', 'name email phone vehicleType vehicleNumber rating totalDeliveries completedDeliveries')
      .lean();

    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: 'Delivery not found'
      });
    }

    // Get delivery history/timeline
    const timeline = delivery.statusHistory || delivery.history || [];

    res.json({
      success: true,
      delivery,
      timeline
    });

  } catch (error) {
    console.error('Error fetching delivery details:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching delivery details'
    });
  }
};

// Update delivery status (admin)
export const updateDeliveryStatus = async (req, res) => {
  try {
    const { trackingId } = req.params;
    const { status, notes, location } = req.body;

    const delivery = await Tracking.findOne({ trackingId });
    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: 'Delivery not found'
      });
    }

    const oldStatus = delivery.status;
    delivery.status = status;
    
    if (location) {
      delivery.currentLocation = location;
    }

    // Add to status history
    const historyEntry = {
      status,
      timestamp: new Date(),
      location: location || delivery.currentLocation,
      notes: notes || `Status updated by admin`,
      updatedBy: 'admin'
    };

    if (delivery.statusHistory) {
      delivery.statusHistory.push(historyEntry);
    } else if (delivery.history) {
      delivery.history.push(historyEntry);
    } else {
      delivery.statusHistory = [historyEntry];
    }

    // Update delivery timestamps
    if (status.toLowerCase() === 'delivered') {
      delivery.deliveredAt = new Date();
      
      // Update partner stats if assigned
      if (delivery.assignedPartner) {
        const partner = await Partner.findById(delivery.assignedPartner);
        if (partner) {
          partner.completedDeliveries += 1;
          partner.totalEarnings += delivery.partnerEarnings || 0;
          await partner.save();
        }
      }
    }

    await delivery.save();

    // Send notification email to customer
    if (delivery.receiver?.email) {
      try {
        const emailSubject = `Delivery Update - ${trackingId}`;
        const emailContent = `
          <h2>Delivery Status Update</h2>
          <p>Your package ${trackingId} status has been updated to: <strong>${status.toUpperCase()}</strong></p>
          ${notes ? `<p>Notes: ${notes}</p>` : ''}
          <p>Current Location: ${delivery.currentLocation || 'In Transit'}</p>
          <p>Track your package: <a href="${process.env.FRONTEND_URL}/track/${trackingId}">Click here</a></p>
        `;
        await sendDeliveryEmail(delivery.receiver.email, emailSubject, emailContent);
        console.log(`📧 Status update email sent to customer: ${delivery.receiver.email}`);
      } catch (emailError) {
        console.error('Failed to send status update email:', emailError);
      }
    }

    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      io.to('admin-room').emit('delivery-status-update', {
        trackingId,
        status,
        oldStatus,
        timestamp: new Date()
      });
    }

    res.json({
      success: true,
      message: `Delivery status updated to ${status}`,
      delivery: {
        trackingId: delivery.trackingId,
        status: delivery.status,
        currentLocation: delivery.currentLocation,
        updatedAt: new Date()
      }
    });

  } catch (error) {
    console.error('Error updating delivery status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating delivery status'
    });
  }
};

// Reassign delivery to different partner
export const reassignDelivery = async (req, res) => {
  try {
    const { trackingId } = req.params;
    const { partnerId, reason } = req.body;

    const delivery = await Tracking.findOne({ trackingId });
    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: 'Delivery not found'
      });
    }

    const partner = await Partner.findById(partnerId);
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    if (partner.status !== 'approved' || !partner.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Partner is not available for assignments'
      });
    }

    const oldPartnerId = delivery.assignedPartner;
    delivery.assignedPartner = partnerId;
    delivery.status = 'assigned';

    // Add to status history
    const historyEntry = {
      status: 'reassigned',
      timestamp: new Date(),
      notes: `Reassigned to ${partner.name}. Reason: ${reason || 'Admin reassignment'}`,
      updatedBy: 'admin'
    };

    if (delivery.statusHistory) {
      delivery.statusHistory.push(historyEntry);
    } else {
      delivery.statusHistory = [historyEntry];
    }

    await delivery.save();

    // Update partner stats
    partner.totalDeliveries += 1;
    await partner.save();

    // If there was a previous partner, update their stats
    if (oldPartnerId) {
      const oldPartner = await Partner.findById(oldPartnerId);
      if (oldPartner && oldPartner.totalDeliveries > 0) {
        oldPartner.totalDeliveries -= 1;
        await oldPartner.save();
      }
    }

    res.json({
      success: true,
      message: `Delivery reassigned to ${partner.name}`,
      delivery: {
        trackingId: delivery.trackingId,
        assignedPartner: {
          id: partner._id,
          name: partner.name,
          vehicleType: partner.vehicleType,
          vehicleNumber: partner.vehicleNumber
        }
      }
    });

  } catch (error) {
    console.error('Error reassigning delivery:', error);
    res.status(500).json({
      success: false,
      message: 'Error reassigning delivery'
    });
  }
};

// Get delivery analytics for admin
export const getDeliveryAnalytics = async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    let startDate = new Date();
    if (period === 'week') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === 'month') {
      startDate.setMonth(startDate.getMonth() - 1);
    } else if (period === 'year') {
      startDate.setFullYear(startDate.getFullYear() - 1);
    }

    // Delivery status distribution
    const statusDistribution = await Tracking.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Daily delivery trends
    const dailyTrends = await Tracking.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 },
          delivered: {
            $sum: {
              $cond: [{ $eq: ["$status", "delivered"] }, 1, 0]
            }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Partner performance
    const partnerPerformance = await Tracking.aggregate([
      {
        $match: {
          assignedPartner: { $exists: true },
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$assignedPartner',
          totalDeliveries: { $sum: 1 },
          completedDeliveries: {
            $sum: {
              $cond: [{ $eq: ["$status", "delivered"] }, 1, 0]
            }
          },
          totalRevenue: { $sum: '$revenue' }
        }
      },
      {
        $lookup: {
          from: 'partners',
          localField: '_id',
          foreignField: '_id',
          as: 'partner'
        }
      },
      {
        $unwind: '$partner'
      },
      {
        $project: {
          partnerName: '$partner.name',
          vehicleType: '$partner.vehicleType',
          totalDeliveries: 1,
          completedDeliveries: 1,
          completionRate: {
            $multiply: [
              { $divide: ['$completedDeliveries', '$totalDeliveries'] },
              100
            ]
          },
          totalRevenue: 1
        }
      },
      { $sort: { completionRate: -1 } },
      { $limit: 10 }
    ]);

    // Revenue analytics
    const revenueAnalytics = await Tracking.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          revenue: { $gt: 0 }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          dailyRevenue: { $sum: '$revenue' },
          deliveryCount: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Average delivery time (mock calculation)
    const avgDeliveryTime = 2.5; // days

    res.json({
      success: true,
      analytics: {
        statusDistribution,
        dailyTrends,
        partnerPerformance,
        revenueAnalytics,
        summary: {
          totalDeliveries: await Tracking.countDocuments(),
          avgDeliveryTime,
          totalRevenue: await Tracking.aggregate([
            { $group: { _id: null, total: { $sum: '$revenue' } } }
          ]).then(result => result[0]?.total || 0)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching delivery analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching delivery analytics'
    });
  }
};

// Bulk delivery actions
export const bulkDeliveryActions = async (req, res) => {
  try {
    const { trackingIds, action, data } = req.body;

    if (!trackingIds || !Array.isArray(trackingIds) || trackingIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Tracking IDs are required'
      });
    }

    let result;
    let message = '';

    switch (action) {
      case 'updateStatus':
        if (!data.status) {
          return res.status(400).json({
            success: false,
            message: 'Status is required for bulk update'
          });
        }

        result = await Tracking.updateMany(
          { trackingId: { $in: trackingIds } },
          { 
            status: data.status,
            $push: {
              statusHistory: {
                status: data.status,
                timestamp: new Date(),
                notes: 'Bulk status update by admin',
                updatedBy: 'admin'
              }
            }
          }
        );
        message = `${result.modifiedCount} deliveries updated to ${data.status}`;
        break;

      case 'assignPartner':
        if (!data.partnerId) {
          return res.status(400).json({
            success: false,
            message: 'Partner ID is required for bulk assignment'
          });
        }

        const partner = await Partner.findById(data.partnerId);
        if (!partner) {
          return res.status(404).json({
            success: false,
            message: 'Partner not found'
          });
        }

        result = await Tracking.updateMany(
          { trackingId: { $in: trackingIds } },
          { 
            assignedPartner: data.partnerId,
            status: 'assigned',
            $push: {
              statusHistory: {
                status: 'assigned',
                timestamp: new Date(),
                notes: `Bulk assigned to ${partner.name}`,
                updatedBy: 'admin'
              }
            }
          }
        );

        // Update partner stats
        partner.totalDeliveries += result.modifiedCount;
        await partner.save();

        message = `${result.modifiedCount} deliveries assigned to ${partner.name}`;
        break;

      case 'delete':
        result = await Tracking.deleteMany({ trackingId: { $in: trackingIds } });
        message = `${result.deletedCount} deliveries deleted`;
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid action'
        });
    }

    res.json({
      success: true,
      message,
      affectedCount: result.modifiedCount || result.deletedCount || 0
    });

  } catch (error) {
    console.error('Error performing bulk delivery action:', error);
    res.status(500).json({
      success: false,
      message: 'Error performing bulk action'
    });
  }
}; 