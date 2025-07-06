import Tracking from '../models/tracking.model.js';

// Debug version of requestRefund with detailed logging
export const requestRefundDebug = async (req, res) => {
  const { trackingId } = req.params;
  
  try {
    console.log('🔍 REFUND DEBUG - Starting request for:', trackingId);
    console.log('🔍 REFUND DEBUG - User:', req.user?.email);
    console.log('🔍 REFUND DEBUG - Body:', req.body);
    
    // Basic validation
    if (!trackingId) {
      console.log('❌ REFUND DEBUG - No tracking ID provided');
      return res.status(400).json({ 
        success: false, 
        message: 'Tracking ID is required' 
      });
    }

    // Get the authenticated user
    const user = req.user;
    if (!user) {
      console.log('❌ REFUND DEBUG - User not authenticated');
      return res.status(401).json({ 
        success: false,
        message: 'User not authenticated' 
      });
    }

    console.log('✅ REFUND DEBUG - User authenticated:', user.email);

    // Find the tracking record
    console.log('🔍 REFUND DEBUG - Looking for tracking record...');
    const tracking = await Tracking.findOne({ trackingId });
    
    if (!tracking) {
      console.log('❌ REFUND DEBUG - Tracking not found:', trackingId);
      return res.status(404).json({ 
        success: false,
        message: 'Shipment not found' 
      });
    }

    console.log('✅ REFUND DEBUG - Tracking found:', {
      trackingId: tracking.trackingId,
      status: tracking.status,
      senderEmail: tracking.sender?.email,
      paymentStatus: tracking.payment?.status
    });

    // Check if user is authorized (must be sender)
    if (tracking.sender.email !== user.email) {
      console.log('❌ REFUND DEBUG - User not authorized:', {
        userEmail: user.email,
        senderEmail: tracking.sender.email
      });
      return res.status(403).json({ 
        success: false,
        message: 'You can only request refund for shipments that you have sent' 
      });
    }

    console.log('✅ REFUND DEBUG - User authorized');

    // Check if shipment is delivered
    if (tracking.status.toLowerCase() !== 'delivered') {
      console.log('❌ REFUND DEBUG - Shipment not delivered:', tracking.status);
      return res.status(400).json({ 
        success: false,
        message: 'Refund can only be requested for delivered shipments',
        currentStatus: tracking.status
      });
    }

    console.log('✅ REFUND DEBUG - Shipment is delivered');

    // Check if refund already requested or processed
    if (tracking.payment?.status === 'Refunded' || tracking.payment?.status === 'Refund Requested') {
      console.log('❌ REFUND DEBUG - Refund already processed:', tracking.payment.status);
      return res.status(400).json({ 
        success: false,
        message: 'Refund has already been requested or processed for this shipment',
        currentRefundStatus: tracking.payment.status
      });
    }

    console.log('✅ REFUND DEBUG - Refund eligible');

    // Extract refund data
    const { reason, category, description, expectedRefundAmount, refundMethod, urgency } = req.body;
    
    console.log('🔍 REFUND DEBUG - Refund data:', {
      reason, category, description, expectedRefundAmount, refundMethod, urgency
    });

    // Update payment status
    console.log('🔍 REFUND DEBUG - Updating payment status...');
    tracking.payment.status = 'Refund Requested';
    tracking.payment.refundRequestedAt = new Date();
    tracking.payment.refundReason = reason;
    tracking.payment.refundCategory = category;
    tracking.payment.refundDescription = description;
    tracking.payment.expectedRefundAmount = expectedRefundAmount;
    tracking.payment.refundMethod = refundMethod;
    tracking.payment.refundUrgency = urgency;

    console.log('🔍 REFUND DEBUG - Saving tracking...');
    await tracking.save();
    console.log('✅ REFUND DEBUG - Tracking saved successfully');

    res.json({ 
      success: true, 
      message: 'Refund request submitted successfully', 
      trackingId,
      refundStatus: tracking.payment.status,
      debug: 'Debug version - simplified flow'
    });

  } catch (error) {
    console.error('❌ REFUND DEBUG ERROR:', {
      message: error.message,
      stack: error.stack,
      trackingId,
      userEmail: req.user?.email,
      timestamp: new Date().toISOString()
    });
    
    res.status(500).json({ 
      success: false, 
      message: 'Failed to request refund', 
      error: error.message,
      stack: error.stack,
      trackingId
    });
  }
};