import Tracking from '../models/tracking.model.js';

// Debug endpoint to check refund functionality
export const debugRefund = async (req, res) => {
  const { trackingId } = req.params;
  
  try {
    console.log(`🔍 Debug refund request for: ${trackingId}`);
    
    // Check if tracking exists
    const tracking = await Tracking.findOne({ trackingId });
    
    if (!tracking) {
      return res.json({
        success: false,
        message: 'Tracking not found',
        trackingId,
        found: false
      });
    }
    
    // Return tracking info for debugging
    return res.json({
      success: true,
      message: 'Tracking found',
      trackingId,
      found: true,
      data: {
        status: tracking.status,
        paymentStatus: tracking.payment?.status,
        senderEmail: tracking.sender?.email,
        deliveredAt: tracking.deliveredAt,
        createdAt: tracking.createdAt,
        hasPayment: !!tracking.payment,
        paymentMethod: tracking.payment?.method
      }
    });
    
  } catch (error) {
    console.error('❌ Debug error:', error);
    return res.status(500).json({
      success: false,
      message: 'Debug error',
      error: error.message,
      stack: error.stack
    });
  }
};

// Check specific tracking ID
export const checkTracking = async (req, res) => {
  const { trackingId } = req.params;
  
  try {
    const tracking = await Tracking.findOne({ trackingId });
    
    res.json({
      exists: !!tracking,
      trackingId,
      data: tracking ? {
        _id: tracking._id,
        status: tracking.status,
        sender: tracking.sender,
        receiver: tracking.receiver,
        payment: tracking.payment,
        createdAt: tracking.createdAt,
        deliveredAt: tracking.deliveredAt
      } : null
    });
    
  } catch (error) {
    res.status(500).json({
      error: error.message,
      trackingId
    });
  }
};