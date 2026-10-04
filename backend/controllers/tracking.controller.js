import Tracking from '../models/tracking.model.js';
import { sendSMS } from '../utils/sms.js';
import { sendDeliveryEmail } from '../utils/email.js';
import { 
  getShipmentCreatedSenderEmail, 
  getShipmentCreatedReceiverEmail, 
  getShipmentStatusUpdateEmail 
} from '../utils/emailTemplates.js';
import { generateInvoicePDF } from '../utils/invoice.js';
import Shipment from '../models/shipment.model.js';
import User from '../models/user.model.js';
import { autoAssignPartner } from '../utils/autoAssignPartner.js';
import { calculateShippingCost } from '../utils/pricing.js';
import { normalizeShipmentStatus } from '../utils/shipmentLifecycle.js';
import { generateTrackingId } from '../utils/trackingId.js';

const publicTrackingView = (tracking) => ({
  trackingId: tracking.trackingId,
  status: tracking.status,
  currentLocation: tracking.currentLocation,
  origin: tracking.origin,
  destination: tracking.destination,
  history: (tracking.history || []).map(({ status, location, timestamp }) => ({ status, location, timestamp })),
  createdAt: tracking.createdAt,
  updatedAt: tracking.updatedAt
});

// ✔ Verify tracking ID
export const verifyTracking = async (req, res) => {
  const { trackingId } = req.body;
  console.log('Verifying trackingId:', trackingId);
  try {
    const tracking = await Tracking.findOne({ trackingId });
    if (!tracking) {
      console.log('Tracking ID not found in DB:', trackingId);
      return res.status(404).json({ message: 'Tracking ID not found' });
    }
    res.json(publicTrackingView(tracking));
  } catch (err) {
    console.error("❌ Error verifying tracking:", err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// ✔ Create new tracking entry
export const addTracking = async (req, res) => {
  try {
    const { sender, receiver, currentLocation, origin, destination, packageDetails, payment } = req.body;

    // Get the authenticated user
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Use an unguessable public reference; the older 4-digit suffix was enumerable.
    const trackingId = generateTrackingId();
    
    // Debug log
    console.log('Saving new trackingId:', trackingId);
    console.log('Authenticated user:', user.email);

    // Validate payment information
    if (!payment || !payment.method) {
      return res.status(400).json({
        success: false,
        message: 'Payment method is required'
      });
    }

    if (payment.method !== 'COD') {
      return res.status(400).json({
        success: false,
        message: 'Online payments must be completed through the payment checkout'
      });
    }
    let shippingCost;
    try {
      shippingCost = calculateShippingCost(packageDetails);
    } catch (pricingError) {
      return res.status(400).json({ success: false, message: pricingError.message });
    }
    
    const revenue = shippingCost; // Use calculated cost instead of fixed price

    // Ensure sender email matches the authenticated user
    const senderData = {
      ...sender,
      email: user.email // Always use the authenticated user's email as sender
    };

    // Create new tracking
    const newTrack = new Tracking({
      trackingId,
      sender: senderData,
      receiver,
      currentLocation: currentLocation || 'Not Updated',
      status: 'pending',
      origin,
      destination,
      packageDetails,
      history: [{
        status: 'pending',
        location: currentLocation || 'Not Updated',
        timestamp: new Date()
      }],
      revenue,
      payment: {
        method: payment.method,
        status: 'Pending', // payment status is separately capitalized
        amount: shippingCost,
        upiId: undefined,
        transactionId: undefined
      }
    });

    // Save to database
    await newTrack.save();

    // 🚀 AUTO-ASSIGN TO PARTNER
    try {
      const assignedPartner = await autoAssignPartner(newTrack);
      if (assignedPartner) {
        console.log(`✅ Auto-assigned delivery ${trackingId} to partner: ${assignedPartner.name}`);
      } else {
        console.log(`⚠️ No available partner for delivery ${trackingId} - will remain unassigned`);
      }
    } catch (assignError) {
      console.error('❌ Error in auto-assignment:', assignError);
      // Continue with delivery creation even if assignment fails
    }

    // Ensure the new tracking is readable before responding
    let confirm = null, confirmAttempts = 0;
    while (confirmAttempts < 5) {
      confirm = await Tracking.findOne({ trackingId });
      if (confirm) break;
      await new Promise(res => setTimeout(res, 500));
      confirmAttempts++;
    }

    // 📧 Generate PDF invoice & send professional shipment creation email notifications
    try {
      // 1. Generate PDF Invoice Attachment
      let pdfBuffer = null;
      try {
        pdfBuffer = await generateInvoicePDF({
          trackingId,
          sender: senderData,
          receiver,
          origin,
          destination,
          packageDetails,
          payment,
          shippingCost
        });
      } catch (pdfErr) {
        console.error('⚠️ Failed to generate invoice PDF:', pdfErr.message);
      }

      const emailAttachments = pdfBuffer ? [{
        filename: `Prime_Dispatcher_Invoice_${trackingId}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf'
      }] : [];

      // 2. Send email to sender with attached PDF invoice
      const senderHtml = getShipmentCreatedSenderEmail({
        trackingId,
        senderName: senderData.name,
        receiverName: receiver.name,
        origin,
        destination,
        packageDetails,
        paymentMethod: payment.method,
        shippingCost
      });

      await sendDeliveryEmail(
        senderData.email,
        `Booking Confirmed & Tax Invoice - Waybill #${trackingId}`,
        senderHtml,
        emailAttachments
      );

      // 3. Send email to receiver with consignment details & attached waybill
      const receiverHtml = getShipmentCreatedReceiverEmail({
        trackingId,
        senderName: senderData.name,
        receiverName: receiver.name,
        origin,
        destination,
        packageDetails,
        paymentMethod: payment.method,
        shippingCost
      });

      await sendDeliveryEmail(
        receiver.email,
        `Incoming Consignment Scheduled - Tracking #${trackingId}`,
        receiverHtml,
        emailAttachments
      );

      console.log('✅ Shipment creation emails with attached PDF invoice sent successfully');
    } catch (emailError) {
      console.error('❌ Failed to send shipment creation emails:', emailError.message);
      // Don't fail the shipment creation if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Shipment created successfully',
      newTrack,
      payment: {
        method: payment.method,
        amount: shippingCost,
        status: newTrack.payment.status
      }
    });
  } catch (error) {
    console.error('Error creating shipment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create shipment',
      error: error.message
    });
  }
};

// ✔ Update tracking status and notify (SMS + Email)
export const updateTracking = async (req, res) => {
  const { trackingId } = req.params;
  const { status: requestedStatus, currentLocation } = req.body;

  try {
    const tracking = await Tracking.findOne({ trackingId });
    if (!tracking) {
      return res.status(404).json({ message: 'Tracking ID not found' });
    }

    const status = requestedStatus ? normalizeShipmentStatus(requestedStatus) : null;
    if (requestedStatus && !status) {
      return res.status(400).json({ success: false, message: 'Invalid shipment status' });
    }
    const oldStatus = tracking.status;
    const oldCanonicalStatus = normalizeShipmentStatus(oldStatus);
    const oldLocation = tracking.currentLocation;
    const statusChanged = Boolean(status && status !== oldCanonicalStatus);
    const locationChanged = Boolean(currentLocation && currentLocation !== oldLocation);
    if (!statusChanged && !locationChanged) {
      return res.json({ success: true, message: 'Shipment is already up to date', data: publicTrackingView(tracking) });
    }

    const now = new Date();
    const creditPartner = statusChanged && status === 'delivered' && tracking.assignedPartner && !tracking.deliveredAt;
    const partnerEarningsAmount = creditPartner
      ? (tracking.partnerEarnings || Math.round((tracking.revenue || 0) * 0.7))
      : null;
    const update = {
      $set: {
        ...(statusChanged ? { status } : {}),
        ...(locationChanged ? { currentLocation } : {}),
        ...(statusChanged && status === 'delivered' && !tracking.deliveredAt ? { deliveredAt: now } : {}),
        ...(creditPartner ? { partnerEarnings: partnerEarningsAmount } : {}),
        ...(statusChanged && status === 'delivered' && tracking.payment.method === 'COD' && tracking.payment.status === 'Pending'
          ? { 'payment.status': 'Completed', 'payment.paidAt': now }
          : {})
      }
    };
    if (statusChanged) {
      update.$push = {
        history: { status, location: currentLocation || oldLocation, timestamp: now },
        statusHistory: { status, location: currentLocation || oldLocation, timestamp: now, updatedBy: req.userId, updatedByModel: 'Admin' }
      };
    }
    const updatedTracking = await Tracking.findOneAndUpdate(
      { _id: tracking._id, status: oldStatus },
      update,
      { new: true, runValidators: true }
    );
    if (!updatedTracking) {
      return res.status(409).json({ success: false, message: 'Shipment changed. Refresh and try again.' });
    }

    // Handle partner earnings when order is delivered
    if (creditPartner) {
      // Update partner's total earnings and delivery stats
      const Partner = (await import('../models/partner.model.js')).default;
      await Partner.findByIdAndUpdate(
        tracking.assignedPartner,
        { 
          $inc: { 
            totalEarnings: partnerEarningsAmount,
            completedDeliveries: 1
          }
        }
      );
      
      console.log(`✅ Partner earnings credited: ₹${partnerEarningsAmount} for delivery ${trackingId}`);

    }

    Object.assign(tracking, updatedTracking.toObject());

    // 📧 Send email notifications for status updates
    try {
      if (statusChanged || locationChanged) {
        // Email to sender
        const senderUpdateHtml = getShipmentStatusUpdateEmail({
          trackingId,
          recipientName: tracking.sender.name,
          oldStatus,
          status,
          oldLocation,
          currentLocation
        });

        await sendDeliveryEmail(
          tracking.sender.email,
          `Shipment Update: ${status || 'In Transit'} - Waybill #${trackingId}`,
          senderUpdateHtml
        );

        // Email to receiver
        const receiverUpdateHtml = getShipmentStatusUpdateEmail({
          trackingId,
          recipientName: tracking.receiver.name,
          oldStatus,
          status,
          oldLocation,
          currentLocation
        });

        await sendDeliveryEmail(
          tracking.receiver.email,
          `Delivery Update: ${status || 'In Transit'} - Waybill #${trackingId}`,
          receiverUpdateHtml
        );

        console.log('✅ Status update emails sent successfully');
      }
    } catch (emailError) {
      console.error('❌ Failed to send status update emails:', emailError.message);
      // Don't fail the update if email fails
    }

    // 📱 Send SMS notifications for specific statuses
    const notifyStatuses = ['out_for_delivery', 'delivered'];
    const currentStatus = status;
    const { phone } = tracking.receiver;

    if (notifyStatuses.includes(currentStatus)) {
      try {
        if (phone) await sendSMS(phone, trackingId, status);
        console.log("📱 SMS notification sent for:", currentStatus);
      } catch (notifyErr) {
        console.error('❌ SMS notification error:', notifyErr.message);
      }
    }

    res.json({ message: 'Tracking updated successfully', tracking });
  } catch (err) {
    console.error("❌ Error updating tracking:", err.message);
    res.status(500).json({ message: 'Error updating tracking info' });
  }
};

// ✔ Search by receiver email
export const getTrackingByEmail = async (req, res) => {
  const email = String(req.params.email || '').trim().toLowerCase();
  if (req.user.role !== 'admin' && email !== req.user.email.toLowerCase()) {
    return res.status(403).json({ message: 'You can only search shipments linked to your account' });
  }

  try {
    const results = await Tracking.find({ "receiver.email": email }).sort({ createdAt: -1 });

    if (!results.length) {
      return res.status(404).json({ message: 'No tracking records found for this email' });
    }

    res.json({ count: results.length, data: results.map(publicTrackingView) });
  } catch (err) {
    console.error("❌ Error fetching by email:", err.message);
    res.status(500).json({ message: 'Server error while fetching tracking by email' });
  }
};

// Get user's shipments
export const getUserShipments = async (req, res) => {
  try {
    // Get user's email from the request
    const user = req.user;
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('Fetching shipments for user:', user.email);

    // Find all shipments where the user is either sender or receiver
    const shipments = await Tracking.find({
      $or: [
        { 'sender.email': user.email },
        { 'receiver.email': user.email }
      ]
    }).sort({ createdAt: -1 });

    console.log(`Found ${shipments.length} shipments for user ${user.email}`);
    
    if (shipments.length > 0) {
      console.log('Shipment sender emails:', shipments.map(s => s.sender?.email));
      console.log('Shipment receiver emails:', shipments.map(s => s.receiver?.email));
    }

    if (!shipments.length) {
      return res.status(200).json({ message: 'No shipments found', shipments: [] });
    }

    res.json(shipments);
  } catch (error) {
    console.error('Error fetching user shipments:', error);
    res.status(500).json({ message: 'Error fetching user shipments', error: error.message });
  }
};

// ✔ Cancel a shipment by tracking ID (with partner earnings protection)
export const cancelTracking = async (req, res) => {
  const { trackingId } = req.params;
  const { reason } = req.body;
  
  try {
    // Get the authenticated user
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Find the tracking record
    const tracking = await Tracking.findOne({ trackingId }).populate('assignedPartner');
    if (!tracking) {
      return res.status(404).json({ message: 'Shipment not found' });
    }

    // Check if user is authorized to cancel (must be sender)
    if (tracking.sender.email !== user.email) {
      return res.status(403).json({ 
        message: 'You can only cancel shipments that you have sent' 
      });
    }

    // Check if shipment is already delivered - CANNOT CANCEL DELIVERED ORDERS
    if (tracking.status.toLowerCase() === 'delivered') {
      return res.status(400).json({ 
        message: 'Cannot cancel delivered shipments. Partner earnings are protected.',
        error: 'DELIVERED_ORDER_CANNOT_BE_CANCELLED'
      });
    }

    // Check if shipment is already cancelled
    if (tracking.status.toLowerCase() === 'cancelled') {
      return res.status(400).json({ 
        message: 'Shipment is already cancelled' 
      });
    }

    const oldStatus = tracking.status;
    const cancellationClaim = await Tracking.findOneAndUpdate(
      { _id: tracking._id, status: oldStatus },
      { $set: { status: 'cancelled' } },
      { new: true }
    );
    if (!cancellationClaim) {
      return res.status(409).json({ success: false, message: 'Shipment changed. Refresh and try again.' });
    }

    // Update status to cancelled
    tracking.status = 'cancelled';
    tracking.currentLocation = 'Cancelled';

    // Add cancellation to history
    tracking.history.push({
      status: 'cancelled',
      location: 'Cancelled',
      timestamp: new Date(),
      description: reason || 'Order cancelled by customer'
    });

    // Add to status history with more details
    tracking.statusHistory.push({
      status: 'cancelled',
      timestamp: new Date(),
      location: 'Cancelled',
      notes: reason || 'Order cancelled by customer',
      updatedBy: user._id,
      updatedByModel: 'User'
    });

    // Handle partner earnings protection
    let partnerEarningsProtected = false;
    if (tracking.assignedPartner) {
      // If partner has already picked up the order, they should get partial compensation
      if (tracking.pickedUpAt) {
        // Partner gets 50% of earnings for pickup effort
        const partialEarnings = Math.round(tracking.partnerEarnings * 0.5);
        
        // Update partner's total earnings
        const Partner = (await import('../models/partner.model.js')).default;
        await Partner.findByIdAndUpdate(
          tracking.assignedPartner._id,
          { $inc: { totalEarnings: partialEarnings } }
        );
        
        tracking.partnerEarnings = partialEarnings;
        partnerEarningsProtected = true;
        
        console.log(`✅ Protected partner earnings: ₹${partialEarnings} for pickup effort`);
      } else {
        // If not picked up yet, no earnings for partner
        tracking.partnerEarnings = 0;
      }
      
      // Update partner's delivery stats
      const Partner = (await import('../models/partner.model.js')).default;
      await Partner.findByIdAndUpdate(
        tracking.assignedPartner._id,
        { $inc: { cancelledDeliveries: 1 } }
      );
    }

    // Handle payment refund logic
    if (tracking.payment.status === 'Completed') {
      tracking.payment.status = 'Refunded';
      tracking.payment.refundedAt = new Date();
    } else if (tracking.payment.method === 'COD') {
      // COD orders don't need refund processing
      tracking.payment.status = 'Cancelled';
    }

    await tracking.save();

    // Send cancellation email notifications
    try {
      // Email to sender (customer)
      await sendDeliveryEmail(
        tracking.sender.email,
        `Order Cancelled - Tracking ID: ${trackingId}`,
        `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ef4444;">Order Cancelled Successfully</h2>
          <p>Hello ${tracking.sender.name},</p>
          <p>Your order has been cancelled as requested:</p>
          <div style="background: #fef2f2; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #ef4444;">
            <p><strong>Tracking ID:</strong> ${trackingId}</p>
            <p><strong>Previous Status:</strong> ${oldStatus}</p>
            <p><strong>Current Status:</strong> Cancelled</p>
            <p><strong>Reason:</strong> ${reason || 'Customer request'}</p>
            <p><strong>Cancelled At:</strong> ${new Date().toLocaleString()}</p>
          </div>
          ${tracking.payment.status === 'Refunded' ? 
            '<p style="color: #10b981;"><strong>Refund Status:</strong> Your payment will be refunded within 3-5 business days.</p>' : 
            tracking.payment.method === 'COD' ? 
            '<p><strong>Payment:</strong> No payment was processed for this COD order.</p>' : 
            '<p><strong>Payment:</strong> No charges were applied as payment was not completed.</p>'
          }
          ${partnerEarningsProtected ? 
            '<p style="color: #f59e0b;"><strong>Note:</strong> Partial delivery charges may apply as the order was already picked up by our partner.</p>' : 
            ''
          }
          <p>We apologize for any inconvenience. Thank you for using our courier service!</p>
        </div>
        `
      );

      // Email to receiver
      await sendDeliveryEmail(
        tracking.receiver.email,
        `Shipment Cancelled - Tracking ID: ${trackingId}`,
        `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ef4444;">Incoming Shipment Cancelled</h2>
          <p>Hello ${tracking.receiver.name},</p>
          <p>The shipment that was being sent to you has been cancelled:</p>
          <div style="background: #fef2f2; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #ef4444;">
            <p><strong>Tracking ID:</strong> ${trackingId}</p>
            <p><strong>From:</strong> ${tracking.sender.name}</p>
            <p><strong>Status:</strong> Cancelled</p>
            <p><strong>Cancelled At:</strong> ${new Date().toLocaleString()}</p>
          </div>
          <p>You will not receive this shipment. If you have any questions, please contact the sender.</p>
          <p>Thank you for using our courier service!</p>
        </div>
        `
      );

      console.log('✅ Cancellation emails sent successfully');
    } catch (emailError) {
      console.error('❌ Failed to send cancellation emails:', emailError.message);
    }

    res.json({ 
      success: true, 
      message: 'Order cancelled successfully', 
      tracking,
      partnerEarningsProtected,
      refundStatus: tracking.payment.status
    });
  } catch (error) {
    console.error('Error cancelling shipment:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to cancel shipment', 
      error: error.message 
    });
  }
};

// ✔ Request refund for delivered shipment
export const requestRefund = async (req, res) => {
  const { trackingId } = req.params;
  
  // Handle both JSON and FormData
  let reason, category, description, expectedRefundAmount, refundMethod, urgency, shipmentDetails;
  
  if (req.body.reason) {
    // Regular JSON request
    ({ reason, category, description, expectedRefundAmount, refundMethod, urgency, shipmentDetails } = req.body);
  } else {
    // FormData request
    reason = req.body.reason;
    category = req.body.category;
    description = req.body.description;
    expectedRefundAmount = parseFloat(req.body.expectedRefundAmount);
    refundMethod = req.body.refundMethod;
    urgency = req.body.urgency;
    shipmentDetails = req.body.shipmentDetails ? JSON.parse(req.body.shipmentDetails) : null;
  }
  
  try {
    // Get the authenticated user
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Find the tracking record
    const tracking = await Tracking.findOne({ trackingId }).populate('assignedPartner');
    if (!tracking) {
      return res.status(404).json({ message: 'Shipment not found' });
    }

    // Check if user is authorized (must be sender)
    if (tracking.sender.email !== user.email) {
      return res.status(403).json({ 
        message: 'You can only request refund for shipments that you have sent' 
      });
    }

    // Check if shipment is delivered
    if (tracking.status.toLowerCase() !== 'delivered') {
      return res.status(400).json({ 
        message: 'Refund can only be requested for delivered shipments' 
      });
    }

    // Check if refund already requested or processed
    if (tracking.payment.status === 'Refunded' || tracking.payment.status === 'Refund Requested') {
      return res.status(400).json({ 
        message: 'Refund has already been requested or processed for this shipment' 
      });
    }

    // Update payment status to refund requested with detailed info
    tracking.payment.status = 'Refund Requested';
    tracking.payment.refundRequestedAt = new Date();
    tracking.payment.refundReason = reason;
    tracking.payment.refundCategory = category;
    tracking.payment.refundDescription = description;
    tracking.payment.expectedRefundAmount = expectedRefundAmount;
    tracking.payment.refundMethod = refundMethod;
    tracking.payment.refundUrgency = urgency;

    // Handle uploaded images
    if (req.files && req.files.length > 0) {
      tracking.payment.refundImages = req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        uploadedAt: new Date()
      }));
      console.log(`✅ ${req.files.length} refund images uploaded for ${trackingId}`);
    }

    // Add to status history
    tracking.statusHistory.push({
      status: 'Refund Requested',
      timestamp: new Date(),
      location: tracking.currentLocation,
      notes: `Refund requested: ${reason}`,
      updatedBy: user._id,
      updatedByModel: 'User'
    });

    await tracking.save();

    // Emit real-time notification to admin
    const io = req.app.get('io');
    if (io) {
      io.to('admin-room').emit('new-refund-request', {
        trackingId,
        customerInfo: {
          name: tracking.sender.name,
          email: tracking.sender.email,
          phone: tracking.sender.phone
        },
        shipmentInfo: {
          origin: tracking.origin,
          destination: tracking.destination,
          deliveredAt: tracking.deliveredAt,
          packageType: tracking.packageDetails?.type
        },
        refundInfo: {
          amount: expectedRefundAmount,
          originalAmount: tracking.payment.amount,
          reason,
          category,
          urgency,
          description,
          refundMethod,
          hasImages: req.files && req.files.length > 0,
          imageCount: req.files ? req.files.length : 0
        },
        partnerInfo: {
          name: tracking.assignedPartner?.name || 'Unassigned',
          email: tracking.assignedPartner?.email || 'N/A'
        },
        requestedAt: new Date()
      });

      // Also emit general notification
      const imageText = req.files && req.files.length > 0 ? ` (${req.files.length} images attached)` : '';
      io.to('admin-room').emit('new-notification', {
        id: `refund_request_${trackingId}_${Date.now()}`,
        type: 'warning',
        title: 'New Refund Request',
        message: `Customer ${tracking.sender.name} has requested a refund for shipment ${trackingId}. Amount: ₹${expectedRefundAmount}${imageText}`,
        timestamp: new Date(),
        read: false,
        category: 'refunds',
        actions: ['Review Request', 'View Details'],
        data: { trackingId, amount: expectedRefundAmount, reason, category, hasImages: req.files && req.files.length > 0 }
      });
    }

    // Notify partner about refund request
    if (tracking.assignedPartner) {
      try {
        const Partner = (await import('../models/partner.model.js')).default;
        const partner = await Partner.findById(tracking.assignedPartner);
        
        if (partner && partner.email) {
          await sendDeliveryEmail(
            partner.email,
            `Refund Request - Delivery Issue Reported - ${trackingId}`,
            `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #f59e0b;">Refund Request Notification</h2>
              <p>Hello ${partner.name},</p>
              <p>A refund request has been submitted for a delivery you completed:</p>
              <div style="background: #fffbeb; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #f59e0b;">
                <p><strong>Tracking ID:</strong> ${trackingId}</p>
                <p><strong>Delivery Date:</strong> ${new Date(tracking.deliveredAt || tracking.createdAt).toLocaleDateString()}</p>
                <p><strong>Issue Category:</strong> ${category}</p>
                <p><strong>Customer Issue:</strong> ${description}</p>
                <p><strong>Refund Amount:</strong> ₹${expectedRefundAmount}</p>
                <p><strong>Urgency:</strong> ${urgency}</p>
                ${req.files && req.files.length > 0 ? `<p><strong>Evidence:</strong> ${req.files.length} image(s) provided by customer</p>` : ''}
              </div>
              <p><strong>What this means:</strong></p>
              <ul>
                <li>This is for your information and review</li>
                <li>Our admin team will investigate the delivery</li>
                <li>You may be contacted for additional details</li>
                <li>This helps us improve our service quality</li>
              </ul>
              <p>If you have any information about this delivery that might help resolve the issue, please contact our support team.</p>
              <p>Thank you for your cooperation!</p>
            </div>
            `
          );
          console.log(`✅ Partner notification sent for refund request: ${trackingId}`);
        }
      } catch (partnerEmailError) {
        console.error('❌ Failed to send partner notification:', partnerEmailError.message);
      }
    }

    // Send refund request email to customer
    try {
      await sendDeliveryEmail(
        tracking.sender.email,
        `Refund Request Under Review - Tracking ID: ${trackingId}`,
        `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f59e0b;">Refund Request Under Review</h2>
          <p>Hello ${tracking.sender.name},</p>
          <p>We have received your refund request for the following shipment:</p>
          <div style="background: #fffbeb; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #f59e0b;">
            <p><strong>Tracking ID:</strong> ${trackingId}</p>
            <p><strong>Delivered To:</strong> ${tracking.destination}</p>
            <p><strong>Amount:</strong> ₹${tracking.payment.amount}</p>
            <p><strong>Refund Reason:</strong> ${reason}</p>
            <p><strong>Request Date:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>Status:</strong> Under Review</p>
          </div>
          <p><strong>What happens next?</strong></p>
          <ul>
            <li>Our team will review your request within 24-48 hours</li>
            <li>You will receive an email notification with the decision</li>
            <li>If approved, refund will be processed within 3-5 business days</li>
            <li>If additional information is needed, we will contact you</li>
          </ul>
          <p>Thank you for your patience and for using our courier service!</p>
        </div>
        `
      );

      console.log('✅ Refund request email sent successfully');
    } catch (emailError) {
      console.error('❌ Failed to send refund request email:', emailError.message);
    }

    res.json({ 
      success: true, 
      message: 'Refund request submitted successfully', 
      tracking,
      refundStatus: tracking.payment.status
    });
  } catch (error) {
    console.error('Error requesting refund:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to request refund', 
      error: error.message 
    });
  }
};

// ✔ Cancel refund request
export const cancelRefund = async (req, res) => {
  const { trackingId } = req.params;
  const { reason } = req.body;
  
  try {
    // Get the authenticated user
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Find the tracking record
    const tracking = await Tracking.findOne({ trackingId }).populate('assignedPartner');
    if (!tracking) {
      return res.status(404).json({ message: 'Shipment not found' });
    }

    // Check if user is authorized to cancel refund (must be sender)
    if (tracking.sender.email !== user.email) {
      return res.status(403).json({ 
        message: 'You can only cancel refund requests for shipments that you have sent' 
      });
    }

    // Check if there's a refund request to cancel
    if (tracking.payment.status !== 'Refund Requested') {
      return res.status(400).json({ 
        message: 'No active refund request found for this shipment',
        currentStatus: tracking.payment.status
      });
    }

    const previousStatus = tracking.payment.status;
    
    // Revert payment status back to completed (since it was delivered)
    tracking.payment.status = 'Completed';
    tracking.payment.refundCancelledAt = new Date();
    tracking.payment.refundCancelReason = reason || 'Customer cancelled refund request';
    
    // Clear refund request data but keep it for history
    tracking.payment.refundRequestCancelledBy = user._id;
    tracking.payment.originalRefundReason = tracking.payment.refundReason;
    tracking.payment.originalRefundCategory = tracking.payment.refundCategory;
    tracking.payment.originalRefundDescription = tracking.payment.refundDescription;
    tracking.payment.originalExpectedRefundAmount = tracking.payment.expectedRefundAmount;
    tracking.payment.originalRefundMethod = tracking.payment.refundMethod;
    tracking.payment.originalRefundUrgency = tracking.payment.refundUrgency;
    
    // Clear current refund request fields
    delete tracking.payment.refundReason;
    delete tracking.payment.refundCategory;
    delete tracking.payment.refundDescription;
    delete tracking.payment.expectedRefundAmount;
    delete tracking.payment.refundMethod;
    delete tracking.payment.refundUrgency;
    delete tracking.payment.refundRequestedAt;

    // Add to status history
    tracking.statusHistory.push({
      status: 'Refund Request Cancelled',
      timestamp: new Date(),
      location: tracking.currentLocation,
      notes: `Refund request cancelled by customer: ${reason || 'No reason provided'}`,
      updatedBy: user._id,
      updatedByModel: 'User'
    });

    await tracking.save();

    // Emit real-time notification to admin
    const io = req.app.get('io');
    if (io) {
      io.to('admin-room').emit('refund-request-cancelled', {
        trackingId,
        customerInfo: {
          name: tracking.sender.name,
          email: tracking.sender.email,
          phone: tracking.sender.phone
        },
        cancelReason: reason || 'No reason provided',
        originalRefundAmount: tracking.payment.originalExpectedRefundAmount,
        cancelledAt: new Date()
      });

      // Also emit general notification
      io.to('admin-room').emit('new-notification', {
        id: `refund_cancelled_${trackingId}_${Date.now()}`,
        type: 'info',
        title: 'Refund Request Cancelled',
        message: `Customer ${tracking.sender.name} has cancelled their refund request for shipment ${trackingId}`,
        timestamp: new Date(),
        read: false,
        category: 'refunds',
        data: { trackingId, reason: reason || 'No reason provided' }
      });
    }

    // Send cancellation email to customer
    try {
      await sendDeliveryEmail(
        tracking.sender.email,
        `Refund Request Cancelled - Tracking ID: ${trackingId}`,
        `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10b981;">Refund Request Cancelled Successfully</h2>
          <p>Hello ${tracking.sender.name},</p>
          <p>You have successfully cancelled your refund request for the following shipment:</p>
          <div style="background: #f0fdf4; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #10b981;">
            <p><strong>Tracking ID:</strong> ${trackingId}</p>
            <p><strong>Delivered To:</strong> ${tracking.destination}</p>
            <p><strong>Original Amount:</strong> ₹${tracking.payment.amount}</p>
            <p><strong>Previous Status:</strong> ${previousStatus}</p>
            <p><strong>Current Status:</strong> Payment Completed</p>
            <p><strong>Cancelled At:</strong> ${new Date().toLocaleString()}</p>
            ${reason ? `<p><strong>Cancellation Reason:</strong> ${reason}</p>` : ''}
          </div>
          <p><strong>What this means:</strong></p>
          <ul>
            <li>Your refund request has been cancelled</li>
            <li>No refund will be processed</li>
            <li>The original payment remains completed</li>
            <li>You can submit a new refund request if needed</li>
          </ul>
          <p>If you cancelled by mistake or need to request a refund again, you can do so from your shipment details page.</p>
          <p>Thank you for using our courier service!</p>
        </div>
        `
      );

      console.log('✅ Refund cancellation email sent successfully');
    } catch (emailError) {
      console.error('❌ Failed to send refund cancellation email:', emailError.message);
    }

    // Notify admin about the cancellation
    try {
      // You can add admin notification email here if needed
      console.log(`✅ Refund request cancelled for ${trackingId} by customer ${tracking.sender.email}`);
    } catch (adminNotifyError) {
      console.error('❌ Failed to notify admin about refund cancellation:', adminNotifyError.message);
    }

    res.json({ 
      success: true, 
      message: 'Refund request cancelled successfully', 
      tracking,
      paymentStatus: tracking.payment.status,
      cancelledAt: tracking.payment.refundCancelledAt
    });
  } catch (error) {
    console.error('Error cancelling refund request:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to cancel refund request', 
      error: error.message 
    });
  }
};

// ✔ Submit complaint for shipment
export const submitComplaint = async (req, res) => {
  const { trackingId } = req.params;
  const { 
    complaint,
    category,
    description,
    severity,
    partnerRating,
    partnerFeedback,
    deliveryIssues,
    contactAttempts,
    expectation,
    shipmentDetails
  } = req.body;
  
  try {
    // Get the authenticated user
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Find the tracking record
    const tracking = await Tracking.findOne({ trackingId });
    if (!tracking) {
      return res.status(404).json({ message: 'Shipment not found' });
    }

    // Check if user is authorized (sender or receiver can complain)
    if (tracking.sender.email !== user.email && tracking.receiver.email !== user.email) {
      return res.status(403).json({ 
        message: 'You can only submit complaints for your own shipments' 
      });
    }

    // Add detailed complaint to tracking record
    if (!tracking.complaints) {
      tracking.complaints = [];
    }
    
    tracking.complaints.push({
      complaint: description || complaint,
      category,
      severity,
      partnerRating,
      partnerFeedback,
      deliveryIssues,
      contactAttempts,
      expectation,
      submittedBy: user._id,
      submittedByEmail: user.email,
      submittedAt: new Date(),
      status: 'Open'
    });

    // Add to status history
    tracking.statusHistory.push({
      status: 'Complaint Submitted',
      timestamp: new Date(),
      location: tracking.currentLocation,
      notes: `Complaint: ${complaint}`,
      updatedBy: user._id,
      updatedByModel: 'User'
    });

    await tracking.save();

    // Notify partner about complaint
    if (tracking.assignedPartner) {
      try {
        const Partner = (await import('../models/partner.model.js')).default;
        const partner = await Partner.findById(tracking.assignedPartner);
        
        if (partner && partner.email) {
          await sendDeliveryEmail(
            partner.email,
            `Delivery Complaint Received - Action Required - ${trackingId}`,
            `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #ef4444;">Delivery Complaint Notification</h2>
              <p>Hello ${partner.name},</p>
              <p>A complaint has been submitted regarding your delivery:</p>
              <div style="background: #fef2f2; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #ef4444;">
                <p><strong>Tracking ID:</strong> ${trackingId}</p>
                <p><strong>Delivery Date:</strong> ${new Date(tracking.deliveredAt || tracking.createdAt).toLocaleDateString()}</p>
                <p><strong>Complaint Category:</strong> ${category}</p>
                <p><strong>Severity:</strong> ${severity}</p>
                <p><strong>Customer Rating:</strong> ${partnerRating}/5 stars</p>
                <p><strong>Issues Reported:</strong></p>
                <ul>
                  ${deliveryIssues?.map(issue => `<li>${issue}</li>`).join('') || '<li>No specific issues listed</li>'}
                </ul>
                <p><strong>Customer Feedback:</strong> ${partnerFeedback || 'No additional feedback'}</p>
                <p><strong>Detailed Description:</strong> ${description}</p>
              </div>
              <p><strong>Important:</strong></p>
              <ul>
                <li>This complaint will be reviewed by our admin team</li>
                <li>You may be contacted for your side of the story</li>
                <li>This affects your performance rating</li>
                <li>Please review our delivery guidelines</li>
                <li>Future complaints may result in account suspension</li>
              </ul>
              <p>If you believe this complaint is unfair or have additional information, please contact our support team immediately.</p>
              <p>We expect all partners to maintain high service standards.</p>
            </div>
            `
          );
          console.log(`✅ Partner complaint notification sent: ${trackingId}`);
        }
      } catch (partnerEmailError) {
        console.error('❌ Failed to send partner complaint notification:', partnerEmailError.message);
      }
    }

    // Send complaint acknowledgment email to customer
    try {
      await sendDeliveryEmail(
        user.email,
        `Complaint Received - Tracking ID: ${trackingId}`,
        `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f59e0b;">Complaint Received</h2>
          <p>Hello ${user.name || user.email},</p>
          <p>We have received your complaint regarding the following shipment:</p>
          <div style="background: #fffbeb; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #f59e0b;">
            <p><strong>Tracking ID:</strong> ${trackingId}</p>
            <p><strong>Status:</strong> ${tracking.status}</p>
            <p><strong>Your Complaint:</strong> ${complaint}</p>
            <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
          </div>
          <p>Our customer support team will review your complaint and contact you within 24 hours.</p>
          <p>We take all complaints seriously and will work to resolve your issue promptly.</p>
          <p>Thank you for your feedback!</p>
        </div>
        `
      );

      console.log('✅ Complaint acknowledgment email sent successfully');
    } catch (emailError) {
      console.error('❌ Failed to send complaint email:', emailError.message);
    }

    res.json({ 
      success: true, 
      message: 'Complaint submitted successfully', 
      complaintId: tracking.complaints[tracking.complaints.length - 1]._id
    });
  } catch (error) {
    console.error('Error submitting complaint:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to submit complaint', 
      error: error.message 
    });
  }
};

// ✔ Delete a shipment by tracking ID (Admin only - for data cleanup)
export const deleteTracking = async (req, res) => {
  const { trackingId } = req.params;
  try {
    const deleted = await Tracking.findOneAndDelete({ trackingId });
    if (!deleted) {
      return res.status(404).json({ message: 'Shipment not found' });
    }
    res.json({ success: true, message: 'Shipment deleted successfully' });
  } catch (error) {
    console.error('Error deleting shipment:', error);
    res.status(500).json({ success: false, message: 'Failed to delete shipment', error: error.message });
  }
};

// ✔ Download or View PDF Tax Invoice & Waybill
export const downloadInvoice = async (req, res) => {
  const { trackingId } = req.params;
  try {
    const tracking = await Tracking.findOne({ trackingId });
    if (!tracking) {
      return res.status(404).json({ message: 'Consignment not found' });
    }
    if (req.user.role !== 'admin' && tracking.sender.email !== req.user.email) {
      return res.status(403).json({ message: 'You can only download invoices for your own shipments' });
    }

    const pdfBuffer = await generateInvoicePDF({
      trackingId: tracking.trackingId,
      sender: tracking.sender,
      receiver: tracking.receiver,
      origin: tracking.origin,
      destination: tracking.destination,
      packageDetails: tracking.packageDetails || { type: 'standard', weight: 1 },
      payment: tracking.payment || { method: 'COD' },
      shippingCost: tracking.payment?.amount || 49
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="Prime_Dispatcher_Invoice_${tracking.trackingId}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating invoice PDF:', error);
    res.status(500).json({ message: 'Failed to generate invoice PDF', error: error.message });
  }
};
