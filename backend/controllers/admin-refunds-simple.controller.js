import Tracking from '../models/tracking.model.js';

// Get all pending refund requests for admin
export const getPendingRefunds = async (req, res) => {
  try {
    console.log('🔍 Admin fetching pending refunds...');
    
    // Find all shipments with refund requests - Exclude cancelled refund requests
    const refunds = await Tracking.find({
      'payment.status': 'Refund Requested',
      'payment.refundCancelledAt': { $exists: false }
    }).sort({ 'payment.refundRequestedAt': -1 });

    console.log(`✅ Found ${refunds.length} pending refunds`);

    // Format refund data for admin dashboard
    const formattedRefunds = refunds.map(tracking => ({
      trackingId: tracking.trackingId,
      customerName: tracking.sender.name,
      customerEmail: tracking.sender.email,
      amount: tracking.payment.expectedRefundAmount || tracking.payment.amount,
      originalAmount: tracking.payment.amount,
      reason: tracking.payment.refundReason,
      category: tracking.payment.refundCategory,
      urgency: tracking.payment.refundUrgency,
      refundMethod: tracking.payment.refundMethod,
      refundRequestedAt: tracking.payment.refundRequestedAt,
      deliveredAt: tracking.deliveredAt,
      origin: tracking.origin,
      destination: tracking.destination,
      paymentMethod: tracking.payment.method,
      // Calculate how long ago the request was made
      hoursAgo: Math.floor((new Date() - new Date(tracking.payment.refundRequestedAt)) / (1000 * 60 * 60))
    }));

    res.json({
      success: true,
      count: formattedRefunds.length,
      refunds: formattedRefunds
    });

  } catch (error) {
    console.error('❌ Error fetching refunds:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch refunds',
      error: error.message
    });
  }
};

// Get refund notifications count for admin bell
export const getRefundNotificationsCount = async (req, res) => {
  try {
    // Count refunds requested in last 24 hours
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const newRefundsCount = await Tracking.countDocuments({
      'payment.status': 'Refund Requested',
      'payment.refundRequestedAt': { $gte: yesterday },
      'payment.refundCancelledAt': { $exists: false }
    });

    const totalPendingCount = await Tracking.countDocuments({
      'payment.status': 'Refund Requested',
      'payment.refundCancelledAt': { $exists: false }
    });

    res.json({
      success: true,
      newRefunds: newRefundsCount,
      totalPending: totalPendingCount,
      hasNewNotifications: newRefundsCount > 0
    });

  } catch (error) {
    console.error('❌ Error fetching notification count:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notification count',
      error: error.message
    });
  }
};