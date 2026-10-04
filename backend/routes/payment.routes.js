import express from 'express';
import { CashfreeService } from '../services/cashfree.service.js';
import PaymentOrder from '../models/paymentOrder.model.js';
import Tracking from '../models/tracking.model.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { calculateShippingCost } from '../utils/pricing.js';
import { autoAssignPartner } from '../utils/autoAssignPartner.js';

const router = express.Router();

const createTrackingId = () => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `TRK${year}${month}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
};

const fulfillPaidOrder = async (order, payment) => {
  if (order.trackingId) return order.trackingId;

  const existingTracking = await Tracking.findOne({ 'payment.orderId': order.orderId });
  if (existingTracking) {
    order.status = 'paid';
    order.paymentId = payment.paymentId || existingTracking.payment.transactionId;
    order.trackingId = existingTracking.trackingId;
    await order.save();
    return order.trackingId;
  }

  const shipmentData = order.shipmentData;
  const initialStatus = 'Pending';
  const tracking = new Tracking({
    trackingId: createTrackingId(),
    sender: shipmentData.sender,
    receiver: shipmentData.receiver,
    currentLocation: shipmentData.currentLocation || 'Not Updated',
    status: initialStatus,
    origin: shipmentData.origin,
    destination: shipmentData.destination,
    packageDetails: shipmentData.packageDetails,
    history: [{ status: initialStatus, location: shipmentData.currentLocation || 'Not Updated', timestamp: new Date() }],
    revenue: order.amount,
    payment: {
      method: 'ONLINE', status: 'Completed', amount: order.amount,
      transactionId: payment.paymentId, orderId: order.orderId, paidAt: new Date()
    }
  });
  try {
    await tracking.save();
  } catch (error) {
    if (error.code !== 11000) throw error;
    const concurrentTracking = await Tracking.findOne({ 'payment.orderId': order.orderId });
    if (!concurrentTracking) throw error;
    order.status = 'paid';
    order.paymentId = payment.paymentId || concurrentTracking.payment.transactionId;
    order.trackingId = concurrentTracking.trackingId;
    await order.save();
    return order.trackingId;
  }

  order.status = 'paid';
  order.paymentId = payment.paymentId;
  order.trackingId = tracking.trackingId;
  await order.save();

  try {
    await autoAssignPartner(tracking);
  } catch (assignmentError) {
    console.error('Auto-assignment failed for paid shipment:', assignmentError);
  }
  return tracking.trackingId;
};

router.post('/create-session', verifyToken, async (req, res) => {
  try {
    const { shipmentData } = req.body;
    if (!shipmentData?.sender?.name || !shipmentData?.sender?.phone || !shipmentData?.receiver?.name ||
        !shipmentData?.receiver?.email || !shipmentData?.receiver?.phone || !shipmentData?.packageDetails ||
        !shipmentData?.origin || !shipmentData?.destination) {
      return res.status(400).json({ success: false, message: 'Complete sender, receiver, route, and package details are required' });
    }
    if (!process.env.FRONTEND_URL) {
      return res.status(503).json({ success: false, message: 'Payment return URL is not configured' });
    }

    let amount;
    try {
      amount = calculateShippingCost(shipmentData.packageDetails);
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }

    const orderId = `ORDER_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    const safeShipmentData = {
      ...shipmentData,
      sender: { name: shipmentData.sender.name, phone: shipmentData.sender.phone, email: req.user.email }
    };
    const order = await PaymentOrder.create({ orderId, userId: req.user._id, amount, shipmentData: safeShipmentData });
    const paymentSession = await CashfreeService.createPaymentSession({
      orderId,
      amount,
      customerDetails: {
        customerId: String(req.user._id),
        name: safeShipmentData.sender.name,
        email: req.user.email,
        phone: safeShipmentData.sender.phone
      },
      returnUrl: `${process.env.FRONTEND_URL.replace(/\/$/, '')}/payment/success?orderId=${orderId}`
    });

    if (!paymentSession.success) {
      order.status = 'failed';
      await order.save();
      return res.status(502).json({ success: false, message: paymentSession.error || 'Payment provider could not create a session' });
    }

    order.paymentSessionId = paymentSession.paymentSessionId;
    await order.save();
    res.json({ success: true, data: { paymentSessionId: order.paymentSessionId, orderId, amount } });
  } catch (error) {
    console.error('Payment session creation error:', error);
    res.status(500).json({ success: false, message: 'Failed to create payment session' });
  }
});

router.post('/verify/:orderId', verifyToken, async (req, res) => {
  try {
    const order = await PaymentOrder.findOne({ orderId: req.params.orderId, userId: req.user._id });
    if (!order) return res.status(404).json({ success: false, message: 'Payment order not found' });
    if (order.trackingId) {
      return res.json({ success: true, message: 'Shipment already created', data: { trackingId: order.trackingId, orderId: order.orderId, paymentId: order.paymentId, amount: order.amount } });
    }

    const verification = await CashfreeService.verifyPayment(order.orderId);
    if (!verification.success || verification.status !== 'SUCCESS') {
      return res.status(400).json({ success: false, message: verification.error || 'Payment has not completed successfully', status: verification.status });
    }
    if (Math.round(Number(verification.amount) * 100) !== Math.round(order.amount * 100)) {
      return res.status(400).json({ success: false, message: 'Verified payment amount does not match the order' });
    }

    const trackingId = await fulfillPaidOrder(order, verification);

    res.json({ success: true, message: 'Payment verified and shipment created', data: { trackingId, orderId: order.orderId, paymentId: verification.paymentId, amount: order.amount } });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ success: false, message: 'Failed to verify payment and create shipment' });
  }
});

router.get('/status/:orderId', verifyToken, async (req, res) => {
  try {
    const order = await PaymentOrder.findOne({ orderId: req.params.orderId, userId: req.user._id }).select('orderId amount status trackingId');
    if (!order) return res.status(404).json({ success: false, message: 'Payment order not found' });
    res.json({ success: true, data: order });
  } catch (error) {
    console.error('Payment status error:', error);
    res.status(500).json({ success: false, message: 'Failed to get payment status' });
  }
});

router.post('/webhook', async (req, res) => {
  try {
    const signature = req.headers['x-webhook-signature'];
    const timestamp = req.headers['x-webhook-timestamp'];
    if (!Buffer.isBuffer(req.body) || !CashfreeService.verifyWebhookSignature(signature, timestamp, req.body)) {
      return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
    }
    const event = JSON.parse(req.body.toString('utf8'));
    const orderId = event.data?.order?.order_id || event.data?.order_id;
    const payment = event.data?.payment || event.data || {};
    if (orderId && payment.payment_status === 'SUCCESS') {
      const order = await PaymentOrder.findOne({ orderId });
      if (order && Math.round(Number(payment.payment_amount) * 100) === Math.round(order.amount * 100)) {
        await fulfillPaidOrder(order, { paymentId: payment.cf_payment_id });
      }
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ success: false, message: 'Webhook processing failed' });
  }
});

export default router;
