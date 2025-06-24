import Tracking from '../models/tracking.model.js';
import Shipment from '../models/shipment.model.js';
import razorpay from '../config/razorpay.js';
import crypto from 'crypto';

// Calculate shipping cost based on package details
export const calculateShippingCost = (packageDetails, origin, destination) => {
  const { type, weight, dimensions } = packageDetails;
  
  // Base rates by package type
  const baseRates = {
    'standard': 50,
    'express': 100,
    'fragile': 80,
    'oversized': 120
  };
  
  let baseCost = baseRates[type] || 50;
  
  // Weight-based pricing (per kg)
  const weightCost = weight * 10;
  
  // Volume-based pricing (per cubic cm, converted to reasonable units)
  const volume = (dimensions.length * dimensions.width * dimensions.height) / 1000; // Convert to liters
  const volumeCost = volume * 5;
  
  // Distance-based pricing (simplified - in real app would use actual distance calculation)
  const distanceCost = 20; // Flat rate for now
  
  const totalCost = baseCost + weightCost + volumeCost + distanceCost;
  
  return Math.round(totalCost);
};

// Create Razorpay order for payment (supports both UPI and CARD payments)
export const createPaymentOrder = async (req, res) => {
  try {
    const { trackingId, amount } = req.body;
    
    console.log('Creating payment order for:', { trackingId, amount });
    console.log('Razorpay Key ID:', process.env.RAZORPAY_KEY_ID ? 'Present' : 'Missing');
    
    if (!trackingId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Missing required payment details'
      });
    }

    // Check if Razorpay keys are configured
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error('Razorpay keys not configured');
      return res.status(500).json({
        success: false,
        message: 'Payment gateway not configured. Please contact administrator.'
      });
    }
    
    // Find the tracking record
    const tracking = await Tracking.findOne({ trackingId });
    if (!tracking) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found'
      });
    }
    
    // Create Razorpay order
    const options = {
      amount: amount * 100, // Amount in paise (multiply by 100)
      currency: 'INR',
      receipt: `receipt_${trackingId}_${Date.now()}`,
      notes: {
        trackingId: trackingId,
        shipmentType: tracking.packageDetails.type,
        senderEmail: tracking.sender.email,
        receiverEmail: tracking.receiver.email
      }
    };
    
    console.log('Creating Razorpay order with options:', options);
    const order = await razorpay.orders.create(options);
    console.log('Razorpay order created:', order.id);
    
    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
      trackingId: trackingId
    });
  } catch (error) {
    console.error('Error creating payment order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment order',
      error: error.message
    });
  }
};

// Verify Razorpay payment
export const verifyPayment = async (req, res) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      trackingId 
    } = req.body;
    
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !trackingId) {
      return res.status(400).json({
        success: false,
        message: 'Missing payment verification details'
      });
    }
    
    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');
    
    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }
    
    // Find and update tracking record
    const tracking = await Tracking.findOne({ trackingId });
    if (!tracking) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found'
      });
    }
    
    // Update payment status
    tracking.payment.status = 'Completed';
    tracking.payment.transactionId = razorpay_payment_id;
    tracking.payment.paidAt = new Date();
    
    await tracking.save();
    
    res.json({
      success: true,
      message: 'Payment verified and completed successfully',
      transactionId: razorpay_payment_id,
      paymentStatus: 'Completed'
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed',
      error: error.message
    });
  }
};

// Process UPI payment (Legacy - keeping for backward compatibility)
export const processUPIPayment = async (req, res) => {
  try {
    const { trackingId, upiId, amount } = req.body;
    
    if (!trackingId || !upiId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Missing required payment details'
      });
    }
    
    // Find the tracking record
    const tracking = await Tracking.findOne({ trackingId });
    if (!tracking) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found'
      });
    }
    
    // For UPI, redirect to create payment order
    return createPaymentOrder(req, res);
  } catch (error) {
    console.error('Error processing UPI payment:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during payment processing'
    });
  }
};

// Confirm COD payment (when package is delivered)
export const confirmCODPayment = async (req, res) => {
  try {
    const { trackingId } = req.body;
    
    if (!trackingId) {
      return res.status(400).json({
        success: false,
        message: 'Tracking ID is required'
      });
    }
    
    // Find the tracking record
    const tracking = await Tracking.findOne({ trackingId });
    if (!tracking) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found'
      });
    }
    
    if (tracking.payment.method !== 'COD') {
      return res.status(400).json({
        success: false,
        message: 'This shipment is not a COD order'
      });
    }
    
    // Update payment status to completed (typically done when package is delivered)
    tracking.payment.status = 'Completed';
    tracking.payment.paidAt = new Date();
    
    await tracking.save();
    
    res.json({
      success: true,
      message: 'COD payment confirmed',
      paymentStatus: 'Completed'
    });
  } catch (error) {
    console.error('Error confirming COD payment:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during COD confirmation'
    });
  }
};

// Get payment status
export const getPaymentStatus = async (req, res) => {
  try {
    const { trackingId } = req.params;
    
    const tracking = await Tracking.findOne({ trackingId });
    if (!tracking) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found'
      });
    }
    
    res.json({
      success: true,
      payment: {
        method: tracking.payment.method,
        status: tracking.payment.status,
        amount: tracking.payment.amount,
        transactionId: tracking.payment.transactionId,
        upiId: tracking.payment.upiId,
        paidAt: tracking.payment.paidAt
      }
    });
  } catch (error) {
    console.error('Error fetching payment status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Refund payment (admin only)
export const refundPayment = async (req, res) => {
  try {
    const { trackingId, reason } = req.body;
    
    if (!trackingId) {
      return res.status(400).json({
        success: false,
        message: 'Tracking ID is required'
      });
    }
    
    const tracking = await Tracking.findOne({ trackingId });
    if (!tracking) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found'
      });
    }
    
    if (tracking.payment.status !== 'Completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot refund a payment that is not completed'
      });
    }
    
    if (tracking.payment.method === 'COD') {
      return res.status(400).json({
        success: false,
        message: 'COD payments cannot be refunded through this system'
      });
    }
    
    // Both UPI and CARD payments can be refunded through Razorpay
    if (!['UPI', 'CARD'].includes(tracking.payment.method)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment method for refund'
      });
    }
    
    // Simulate refund processing
    tracking.payment.status = 'Refunded';
    tracking.payment.refundReason = reason;
    tracking.payment.refundedAt = new Date();
    
    await tracking.save();
    
    res.json({
      success: true,
      message: 'Payment refunded successfully',
      paymentStatus: 'Refunded'
    });
  } catch (error) {
    console.error('Error processing refund:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during refund processing'
    });
  }
};