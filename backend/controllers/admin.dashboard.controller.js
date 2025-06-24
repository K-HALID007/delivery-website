import Tracking from '../models/tracking.model.js';
import User from '../models/user.model.js';
import Partner from '../models/partner.model.js';

// Get comprehensive admin dashboard data
export const getAdminDashboard = async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));
    
    // Refund Statistics
    const refundStats = {
      pending: await Tracking.countDocuments({ 'payment.status': 'Refund Requested' }),
      approved: await Tracking.countDocuments({ 'payment.status': 'Refunded' }),
      rejected: await Tracking.countDocuments({ 'payment.status': 'Refund Rejected' }),
      todayRequests: await Tracking.countDocuments({
        'payment.status': 'Refund Requested',
        'payment.refundRequestedAt': { $gte: startOfDay, $lte: endOfDay }
      })
    };

    // Refund Amount Statistics
    const refundAmounts = await Tracking.aggregate([
      {
        $match: { 'payment.status': 'Refund Requested' }
      },
      {
        $group: {
          _id: null,
          totalPendingAmount: { $sum: '$payment.expectedRefundAmount' },
          avgRefundAmount: { $avg: '$payment.expectedRefundAmount' }
        }
      }
    ]);

    // Refund by Category
    const refundByCategory = await Tracking.aggregate([
      {
        $match: { 'payment.status': 'Refund Requested' }
      },
      {
        $group: {
          _id: '$payment.refundCategory',
          count: { $sum: 1 },
          totalAmount: { $sum: '$payment.expectedRefundAmount' }
        }
      }
    ]);

    // Refund by Urgency
    const refundByUrgency = await Tracking.aggregate([
      {
        $match: { 'payment.status': 'Refund Requested' }
      },
      {
        $group: {
          _id: '$payment.refundUrgency',
          count: { $sum: 1 }
        }
      }
    ]);

    // Recent Refund Requests (last 10)
    const recentRefunds = await Tracking.find({
      'payment.status': 'Refund Requested'
    })
    .populate('assignedPartner', 'name email')
    .sort({ 'payment.refundRequestedAt': -1 })
    .limit(10)
    .select('trackingId sender payment assignedPartner')
    .lean();

    // Partner Performance (partners with most refund requests)
    const partnerRefundStats = await Tracking.aggregate([
      {
        $match: {
          'payment.status': { $in: ['Refund Requested', 'Refunded', 'Refund Rejected'] },
          assignedPartner: { $exists: true }
        }
      },
      {
        $group: {
          _id: '$assignedPartner',
          refundCount: { $sum: 1 },
          totalRefundAmount: { $sum: '$payment.expectedRefundAmount' }
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
        $sort: { refundCount: -1 }
      },
      {
        $limit: 10
      }
    ]);

    // Refund Trends (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const refundTrends = await Tracking.aggregate([
      {
        $match: {
          'payment.refundRequestedAt': { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$payment.refundRequestedAt" }
          },
          count: { $sum: 1 },
          totalAmount: { $sum: '$payment.expectedRefundAmount' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Overall System Stats
    const systemStats = {
      totalUsers: await User.countDocuments({ role: 'user' }),
      totalPartners: await Partner.countDocuments(),
      activePartners: await Partner.countDocuments({ status: 'approved', isOnline: true }),
      totalShipments: await Tracking.countDocuments(),
      deliveredShipments: await Tracking.countDocuments({ status: 'Delivered' }),
      activeShipments: await Tracking.countDocuments({ 
        status: { $in: ['In Transit', 'Processing', 'Out for Delivery'] } 
      })
    };

    res.json({
      success: true,
      dashboard: {
        refundStats,
        refundAmounts: refundAmounts[0] || { totalPendingAmount: 0, avgRefundAmount: 0 },
        refundByCategory,
        refundByUrgency,
        recentRefunds: recentRefunds.map(refund => ({
          trackingId: refund.trackingId,
          customerName: refund.sender?.name || 'Unknown',
          customerEmail: refund.sender?.email || 'Unknown',
          amount: refund.payment.expectedRefundAmount,
          reason: refund.payment.refundReason,
          category: refund.payment.refundCategory,
          urgency: refund.payment.refundUrgency,
          requestedAt: refund.payment.refundRequestedAt,
          partnerName: refund.assignedPartner?.name || 'Unassigned',
          hasImages: refund.payment.refundImages && refund.payment.refundImages.length > 0
        })),
        partnerRefundStats,
        refundTrends,
        systemStats
      }
    });
  } catch (error) {
    console.error('Error fetching admin dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin dashboard data',
      error: error.message
    });
  }
};

// Get refund analytics for admin
export const getRefundAnalytics = async (req, res) => {
  try {
    const { period = '30days' } = req.query;
    
    let startDate = new Date();
    switch (period) {
      case '7days':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30days':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90days':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case '1year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }

    // Refund resolution time analysis
    const resolvedRefunds = await Tracking.find({
      $or: [
        { 'payment.status': 'Refunded' },
        { 'payment.status': 'Refund Rejected' }
      ],
      'payment.refundRequestedAt': { $gte: startDate }
    }).select('payment').lean();

    const resolutionTimes = resolvedRefunds.map(refund => {
      const requestedAt = new Date(refund.payment.refundRequestedAt);
      const resolvedAt = new Date(refund.payment.refundedAt || refund.payment.refundRejectedAt);
      return Math.ceil((resolvedAt - requestedAt) / (1000 * 60 * 60 * 24)); // days
    });

    const avgResolutionTime = resolutionTimes.length > 0 
      ? resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length 
      : 0;

    // Refund success rate
    const totalProcessed = resolvedRefunds.length;
    const approved = resolvedRefunds.filter(r => r.payment.status === 'Refunded').length;
    const successRate = totalProcessed > 0 ? (approved / totalProcessed) * 100 : 0;

    res.json({
      success: true,
      analytics: {
        period,
        totalProcessed,
        approved,
        rejected: totalProcessed - approved,
        successRate: Math.round(successRate * 10) / 10,
        avgResolutionTime: Math.round(avgResolutionTime * 10) / 10,
        resolutionTimeDistribution: {
          sameDay: resolutionTimes.filter(t => t === 0).length,
          oneDay: resolutionTimes.filter(t => t === 1).length,
          twoDays: resolutionTimes.filter(t => t === 2).length,
          threePlus: resolutionTimes.filter(t => t >= 3).length
        }
      }
    });
  } catch (error) {
    console.error('Error fetching refund analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch refund analytics',
      error: error.message
    });
  }
};