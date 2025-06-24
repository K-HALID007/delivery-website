import Tracking from '../models/tracking.model.js';
import { sendSMS } from '../utils/sms.js';
import { sendDeliveryEmail } from '../utils/email.js';
import Shipment from '../models/shipment.model.js';
import User from '../models/user.model.js';
import { autoAssignPartner } from '../utils/autoAssignPartner.js';

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
    res.json(tracking);
  } catch (err) {
    console.error("❌ Error verifying tracking:", err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// ✔ Create new tracking entry
export const addTracking = async (req, res) => {
  try {
    const { sender, receiver, currentLocation, status, origin, destination, packageDetails, payment } = req.body;

    // Get the authenticated user
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Generate tracking ID if not provided
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const trackingId = `TRK${year}${month}${random}`;
    
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

    if (!['UPI', 'COD', 'CARD', 'ONLINE'].includes(payment.method)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment method. Must be UPI, CARD, COD, or ONLINE'
      });
    }

    if (payment.method === 'UPI' && !payment.upiId) {
      return res.status(400).json({
        success: false,
        message: 'UPI ID is required for UPI payments'
      });
    }

    // Calculate shipping cost
    const calculateShippingCost = (packageDetails, origin, destination) => {
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
      
      // Distance-based pricing (simplified)
      const distanceCost = 20;
      
      const totalCost = baseCost + weightCost + volumeCost + distanceCost;
      
      return Math.round(totalCost);
    };

    const shippingCost = calculateShippingCost(packageDetails, origin, destination);
    
    // Revenue by shipment type (for backward compatibility)
    const typePrices = {
      standard: 50,
      express: 100,
      fragile: 120,
      oversized: 150
    };
    const shipmentType = packageDetails.type?.toLowerCase() || 'standard';
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
      status: status || 'Pending',
      origin,
      destination,
      packageDetails,
      history: [{
        status: status || 'Pending',
        location: currentLocation || 'Not Updated',
        timestamp: new Date()
      }],
      revenue,
      payment: {
        method: payment.method,
        status: payment.method === 'COD' ? 'Pending' : 'Pending', // COD is pending until delivery, UPI/CARD needs processing
        amount: shippingCost,
        upiId: payment.upiId || undefined,
        transactionId: payment.transactionId || undefined
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

    // 📧 Send shipment creation email notifications
    try {
      // Send email to sender
      await sendDeliveryEmail(
        senderData.email,
        `Shipment Created - Tracking ID: ${trackingId}`,
        `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f59e0b;">Shipment Created Successfully!</h2>
          <p>Hello ${senderData.name},</p>
          <p>Your shipment has been created successfully. Here are the details:</p>
          <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p><strong>Tracking ID:</strong> ${trackingId}</p>
            <p><strong>From:</strong> ${origin}</p>
            <p><strong>To:</strong> ${destination}</p>
            <p><strong>Status:</strong> ${status || 'Pending'}</p>
            <p><strong>Payment Method:</strong> ${payment.method}</p>
            <p><strong>Amount:</strong> ₹${shippingCost}</p>
          </div>
          <p>You can track your shipment anytime using the tracking ID.</p>
          <p>Thank you for using our courier service!</p>
        </div>
        `
      );

      // Send email to receiver
      await sendDeliveryEmail(
        receiver.email,
        `Incoming Shipment - Tracking ID: ${trackingId}`,
        `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f59e0b;">You Have an Incoming Shipment!</h2>
          <p>Hello ${receiver.name},</p>
          <p>A shipment has been sent to you. Here are the details:</p>
          <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p><strong>Tracking ID:</strong> ${trackingId}</p>
            <p><strong>From:</strong> ${senderData.name} (${origin})</p>
            <p><strong>To:</strong> ${destination}</p>
            <p><strong>Status:</strong> ${status || 'Pending'}</p>
            <p><strong>Package Type:</strong> ${packageDetails.type}</p>
          </div>
          <p>You can track this shipment anytime using the tracking ID.</p>
          <p>Thank you for using our courier service!</p>
        </div>
        `
      );

      console.log('✅ Shipment creation emails sent successfully');
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
  const { status, currentLocation } = req.body;

  try {
    const tracking = await Tracking.findOne({ trackingId });
    if (!tracking) {
      return res.status(404).json({ message: 'Tracking ID not found' });
    }

    const oldStatus = tracking.status;
    const oldLocation = tracking.currentLocation;

    // Update fields
    if (status) tracking.status = status;
    if (currentLocation) tracking.currentLocation = currentLocation;

    // Add to history
    tracking.history.push({
      status: status || tracking.status,
      location: currentLocation || tracking.currentLocation,
      timestamp: new Date()
    });

    // Handle partner earnings when order is delivered
    if (status && status.toLowerCase() === 'delivered' && tracking.assignedPartner && !tracking.deliveredAt) {
      tracking.deliveredAt = new Date();
      
      // Calculate partner earnings (e.g., 70% of revenue)
      const partnerEarningsAmount = Math.round(tracking.revenue * 0.7);
      tracking.partnerEarnings = partnerEarningsAmount;
      
      // Update partner's total earnings and delivery stats
      const Partner = (await import('../models/partner.model.js')).default;
      await Partner.findByIdAndUpdate(
        tracking.assignedPartner,
        { 
          $inc: { 
            totalEarnings: partnerEarningsAmount,
            completedDeliveries: 1,
            totalDeliveries: 1
          }
        }
      );
      
      console.log(`✅ Partner earnings credited: ₹${partnerEarningsAmount} for delivery ${trackingId}`);

      // 💰 AUTO-UPDATE PAYMENT STATUS FOR COD ORDERS
      if (tracking.payment.method === 'COD' && tracking.payment.status === 'Pending') {
        tracking.payment.status = 'Completed';
        tracking.payment.paidAt = new Date();
        console.log(`✅ COD payment automatically completed for delivery: ${trackingId}`);
      }
    }

    await tracking.save();

    // 📧 Send email notifications for status updates
    try {
      const statusChanged = status && status !== oldStatus;
      const locationChanged = currentLocation && currentLocation !== oldLocation;

      if (statusChanged || locationChanged) {
        // Email to sender
        await sendDeliveryEmail(
          tracking.sender.email,
          `Shipment Update - Tracking ID: ${trackingId}`,
          `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #f59e0b;">Shipment Status Update</h2>
            <p>Hello ${tracking.sender.name},</p>
            <p>Your shipment has been updated:</p>
            <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <p><strong>Tracking ID:</strong> ${trackingId}</p>
              ${statusChanged ? `<p><strong>Status:</strong> ${oldStatus} → <span style="color: #10b981;">${status}</span></p>` : ''}
              ${locationChanged ? `<p><strong>Location:</strong> ${oldLocation} → <span style="color: #10b981;">${currentLocation}</span></p>` : ''}
              <p><strong>Updated:</strong> ${new Date().toLocaleString()}</p>
            </div>
            <p>You can track your shipment anytime for the latest updates.</p>
            <p>Thank you for using our courier service!</p>
          </div>
          `
        );

        // Email to receiver
        await sendDeliveryEmail(
          tracking.receiver.email,
          `Shipment Update - Tracking ID: ${trackingId}`,
          `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #f59e0b;">Shipment Status Update</h2>
            <p>Hello ${tracking.receiver.name},</p>
            <p>Your incoming shipment has been updated:</p>
            <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <p><strong>Tracking ID:</strong> ${trackingId}</p>
              ${statusChanged ? `<p><strong>Status:</strong> ${oldStatus} → <span style="color: #10b981;">${status}</span></p>` : ''}
              ${locationChanged ? `<p><strong>Location:</strong> ${oldLocation} → <span style="color: #10b981;">${currentLocation}</span></p>` : ''}
              <p><strong>Updated:</strong> ${new Date().toLocaleString()}</p>
            </div>
            <p>You can track this shipment anytime for the latest updates.</p>
            <p>Thank you for using our courier service!</p>
          </div>
          `
        );

        console.log('✅ Status update emails sent successfully');
      }
    } catch (emailError) {
      console.error('❌ Failed to send status update emails:', emailError.message);
      // Don't fail the update if email fails
    }

    // 📱 Send SMS notifications for specific statuses
    const notifyStatuses = ['out for delivery', 'delivered'];
    const currentStatus = status?.toLowerCase();
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
  const { email } = req.params;

  try {
    const results = await Tracking.find({ "receiver.email": email });

    if (!results.length) {
      return res.status(404).json({ message: 'No tracking records found for this email' });
    }

    res.json({ count: results.length, data: results });
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
    
    // Update status to cancelled
    tracking.status = 'Cancelled';
    tracking.currentLocation = 'Cancelled';

    // Add cancellation to history
    tracking.history.push({
      status: 'Cancelled',
      location: 'Cancelled',
      timestamp: new Date(),
      description: reason || 'Order cancelled by customer'
    });

    // Add to status history with more details
    tracking.statusHistory.push({
      status: 'Cancelled',
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
        { $inc: { cancelledDeliveries: 1, totalDeliveries: 1 } }
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