import express from 'express';
import { CashfreeService } from '../services/cashfree.service.js';
import Tracking from '../models/tracking.model.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Create payment session
router.post('/create-session', verifyToken, async (req, res) => {
  try {
    const { shipmentData, amount } = req.body;
    const user = req.user;

    if (!shipmentData || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Shipment data and amount are required'
      });
    }

    // Generate unique order ID
    const orderId = `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const orderData = {
      orderId,
      amount: parseFloat(amount),
      customerDetails: {
        customerId: user.id,
        name: shipmentData.sender.name,
        email: shipmentData.sender.email,
        phone: shipmentData.sender.phone
      },
      returnUrl: `${process.env.FRONTEND_URL}/payment/success?orderId=${orderId}`
    };

    const paymentSession = await CashfreeService.createPaymentSession(orderData);

    if (!paymentSession.success) {
      return res.status(400).json({
        success: false,
        message: paymentSession.error
      });
    }

    // Store shipment data temporarily with order ID
    const tempShipmentData = {
      ...shipmentData,
      orderId,
      userId: user.id,
      amount,
      paymentStatus: 'PENDING',
      createdAt: new Date()
    };

    // Store in a temporary collection or cache (for now, we'll use a simple in-memory store)
    // In production, you might want to use Redis or a temporary database collection
    global.pendingShipments = global.pendingShipments || new Map();
    global.pendingShipments.set(orderId, tempShipmentData);

    res.json({
      success: true,
      data: {
        paymentSessionId: paymentSession.paymentSessionId,
        orderId: paymentSession.orderId,
        amount: amount
      }
    });

  } catch (error) {
    console.error('Payment session creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment session',
      error: error.message
    });
  }
});

// Verify payment and create shipment
router.post('/verify/:orderId', verifyToken, async (req, res) => {
  try {
    const { orderId } = req.params;
    const user = req.user;

    // Verify payment with Cashfree
    const paymentVerification = await CashfreeService.verifyPayment(orderId);

    if (!paymentVerification.success) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed',
        error: paymentVerification.error
      });
    }

    if (paymentVerification.status !== 'SUCCESS') {
      return res.status(400).json({
        success: false,
        message: 'Payment not successful',
        status: paymentVerification.status
      });
    }

    // Get shipment data from temporary storage
    global.pendingShipments = global.pendingShipments || new Map();
    const shipmentData = global.pendingShipments.get(orderId);

    if (!shipmentData) {
      return res.status(404).json({
        success: false,
        message: 'Shipment data not found for this order'
      });
    }

    // Verify user ownership
    if (shipmentData.userId !== user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to this order'
      });
    }

    // Generate tracking ID
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const trackingId = `TRK${year}${month}${random}`;

    // Create shipment with payment information
    const newTracking = new Tracking({
      trackingId,
      sender: {
        ...shipmentData.sender,
        email: user.email // Ensure sender email matches authenticated user
      },
      receiver: shipmentData.receiver,
      currentLocation: shipmentData.currentLocation || 'Not Updated',
      status: shipmentData.status || 'Pending',
      origin: shipmentData.origin,
      destination: shipmentData.destination,
      packageDetails: shipmentData.packageDetails,
      history: [{
        status: shipmentData.status || 'Pending',
        location: shipmentData.currentLocation || 'Not Updated',
        timestamp: new Date()
      }],
      revenue: parseFloat(shipmentData.amount),
      payment: {
        method: 'ONLINE',
        status: 'SUCCESS',
        amount: parseFloat(shipmentData.amount),
        transactionId: paymentVerification.paymentId,
        orderId: orderId,
        paymentMethod: paymentVerification.method
      }
    });

    await newTracking.save();

    // Clean up temporary data
    global.pendingShipments.delete(orderId);

    // Auto-assign to partner (if available)
    try {
      const { autoAssignPartner } = await import('../utils/autoAssignPartner.js');
      const assignedPartner = await autoAssignPartner(newTracking);
      if (assignedPartner) {
        console.log(`✅ Auto-assigned delivery ${trackingId} to partner: ${assignedPartner.name}`);
      }
    } catch (assignError) {
      console.error('❌ Error in auto-assignment:', assignError);
    }

    res.json({
      success: true,
      message: 'Payment verified and shipment created successfully',
      data: {
        trackingId: newTracking.trackingId,
        orderId: orderId,
        paymentId: paymentVerification.paymentId,
        amount: paymentVerification.amount
      }
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment and create shipment',
      error: error.message
    });
  }
});

// Get payment status
router.get('/status/:orderId', verifyToken, async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const orderStatus = await CashfreeService.getOrderStatus(orderId);
    
    if (!orderStatus.success) {
      return res.status(400).json({
        success: false,
        message: orderStatus.error
      });
    }

    res.json({
      success: true,
      data: orderStatus.data
    });

  } catch (error) {
    console.error('Payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment status',
      error: error.message
    });
  }
});

// Webhook endpoint for Cashfree notifications
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const signature = req.headers['x-webhook-signature'];
    const timestamp = req.headers['x-webhook-timestamp'];
    const rawBody = req.body;

    // Verify webhook signature
    const isValid = CashfreeService.verifyWebhookSignature(rawBody, signature, timestamp);
    
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid webhook signature'
      });
    }

    const webhookData = JSON.parse(rawBody);
    console.log('Cashfree webhook received:', webhookData);

    // Handle different webhook events
    if (webhookData.type === 'PAYMENT_SUCCESS_WEBHOOK') {
      const { order_id, payment_status, cf_payment_id } = webhookData.data;
      
      // Update shipment payment status if needed
      const tracking = await Tracking.findOne({ 'payment.orderId': order_id });
      if (tracking && payment_status === 'SUCCESS') {
        tracking.payment.status = 'SUCCESS';
        tracking.payment.transactionId = cf_payment_id;
        await tracking.save();
        console.log(`Payment confirmed for tracking: ${tracking.trackingId}`);
      }
    }

    res.json({ success: true });

  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({
      success: false,
      message: 'Webhook processing failed'
    });
  }
});

export default router;