import Tracking from '../models/tracking.model.js';

// Simple refund function with basic error handling and notifications
export const requestRefundSimple = async (req, res) => {
  const { trackingId } = req.params;
  
  try {
    console.log('🔍 Simple refund request for:', trackingId);
    console.log('🔍 User:', req.user?.email);
    console.log('🔍 Body:', req.body);
    
    // Check if user is authenticated
    if (!req.user) {
      console.log('❌ User not authenticated');
      return res.status(401).json({ 
        success: false,
        message: 'User not authenticated' 
      });
    }

    // Find tracking
    console.log('🔍 Finding tracking...');
    const tracking = await Tracking.findOne({ trackingId });
    
    if (!tracking) {
      console.log('❌ Tracking not found');
      return res.status(404).json({ 
        success: false,
        message: 'Shipment not found' 
      });
    }

    console.log('✅ Tracking found:', tracking.trackingId);

    // Basic validation
    if (tracking.sender.email !== req.user.email) {
      console.log('❌ User not authorized');
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized' 
      });
    }

    if (tracking.status.toLowerCase() !== 'delivered') {
      console.log('❌ Not delivered');
      return res.status(400).json({ 
        success: false,
        message: 'Only delivered shipments can request refund' 
      });
    }

    if (tracking.payment?.status === 'Refunded' || tracking.payment?.status === 'Refund Requested') {
      console.log('❌ Already refunded');
      return res.status(400).json({ 
        success: false,
        message: 'Refund already processed' 
      });
    }

    // Update refund status
    console.log('🔍 Updating refund status...');
    tracking.payment.status = 'Refund Requested';
    tracking.payment.refundRequestedAt = new Date();
    tracking.payment.refundReason = req.body.reason || 'Customer request';
    tracking.payment.refundCategory = req.body.category || 'general';
    tracking.payment.expectedRefundAmount = req.body.expectedRefundAmount || tracking.payment.amount;
    tracking.payment.refundMethod = req.body.refundMethod || 'original';
    tracking.payment.refundUrgency = req.body.urgency || 'normal';
    
    await tracking.save();
    console.log('✅ Refund status updated');

    // 🔔 REAL-TIME NOTIFICATION TO ADMIN
    try {
      console.log('🔔 Sending real-time notification to admin...');
      
      const notificationData = {
        id: `refund_${trackingId}_${Date.now()}`,
        type: 'refund_request',
        title: 'New Refund Request',
        message: `${tracking.sender.name} requested refund for ${trackingId}`,
        trackingId,
        customerName: tracking.sender.name,
        customerEmail: tracking.sender.email,
        amount: tracking.payment.expectedRefundAmount,
        reason: tracking.payment.refundReason,
        category: tracking.payment.refundCategory,
        urgency: tracking.payment.refundUrgency,
        timestamp: new Date(),
        read: false
      };
      
      console.log('🔔 Admin notification created:', notificationData);
      
      // Store notification in database for admin to see
      // In production, you would also emit via WebSocket:
      // io.to('admin-room').emit('new-refund-request', notificationData);
      
    } catch (notificationError) {
      console.error('❌ Failed to send notification:', notificationError);
      // Don't fail the refund request if notification fails
    }

    res.json({ 
      success: true, 
      message: 'Refund request submitted successfully! Admin has been notified.',
      trackingId,
      refundStatus: tracking.payment.status,
      notification: {
        sent: true,
        message: 'Admin will review your request within 24 hours'
      }
    });

  } catch (error) {
    console.error('❌ Simple refund error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Refund request failed', 
      error: error.message 
    });
  }
};