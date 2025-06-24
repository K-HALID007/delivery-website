import Tracking from '../models/tracking.model.js';
import Partner from '../models/partner.model.js';
import { sendDeliveryEmail } from '../utils/email.js';

// Get all refund requests
export const getAllRefunds = async (req, res) => {
  try {
    const refunds = await Tracking.find({
      'payment.status': 'Refund Requested'
    })
    .populate('assignedPartner', 'name email phone')
    .sort({ 'payment.refundRequestedAt': -1 });

    // Add image URLs and comprehensive details for admin access
    const refundsWithDetails = refunds.map(refund => {
      const refundObj = refund.toObject();
      
      // Add image URLs
      if (refundObj.payment.refundImages && refundObj.payment.refundImages.length > 0) {
        refundObj.payment.refundImages = refundObj.payment.refundImages.map(image => ({
          ...image,
          imageUrl: `/api/uploads/refunds/${image.filename}`
        }));
      }
      
      // Add comprehensive refund details for admin
      refundObj.adminDetails = {
        customerInfo: {
          name: refundObj.sender?.name || 'Unknown',
          email: refundObj.sender?.email || 'Unknown',
          phone: refundObj.sender?.phone || 'Not provided'
        },
        receiverInfo: {
          name: refundObj.receiver?.name || 'Unknown',
          email: refundObj.receiver?.email || 'Unknown',
          phone: refundObj.receiver?.phone || 'Not provided'
        },
        shipmentInfo: {
          trackingId: refundObj.trackingId,
          origin: refundObj.origin,
          destination: refundObj.destination,
          currentLocation: refundObj.currentLocation,
          status: refundObj.status,
          createdAt: refundObj.createdAt,
          deliveredAt: refundObj.deliveredAt,
          packageType: refundObj.packageDetails?.type,
          packageWeight: refundObj.packageDetails?.weight,
          packageDescription: refundObj.packageDetails?.description,
          specialInstructions: refundObj.packageDetails?.specialInstructions
        },
        partnerInfo: {
          name: refundObj.assignedPartner?.name || 'Unassigned',
          email: refundObj.assignedPartner?.email || 'N/A',
          phone: refundObj.assignedPartner?.phone || 'N/A',
          partnerId: refundObj.assignedPartner?._id || null
        },
        paymentInfo: {
          method: refundObj.payment.method,
          originalAmount: refundObj.payment.amount,
          status: refundObj.payment.status,
          paidAt: refundObj.payment.paidAt,
          transactionId: refundObj.payment.transactionId,
          upiId: refundObj.payment.upiId
        },
        refundRequest: {
          reason: refundObj.payment.refundReason,
          category: refundObj.payment.refundCategory,
          description: refundObj.payment.refundDescription,
          expectedAmount: refundObj.payment.expectedRefundAmount,
          refundMethod: refundObj.payment.refundMethod,
          urgency: refundObj.payment.refundUrgency,
          requestedAt: refundObj.payment.refundRequestedAt,
          hasImages: refundObj.payment.refundImages && refundObj.payment.refundImages.length > 0,
          imageCount: refundObj.payment.refundImages ? refundObj.payment.refundImages.length : 0,
          images: refundObj.payment.refundImages || []
        },
        timeline: refundObj.statusHistory || refundObj.history || [],
        deliveryHistory: refundObj.history || []
      };
      
      return refundObj;
    });

    res.json({
      success: true,
      refunds: refundsWithDetails,
      count: refunds.length,
      summary: {
        totalPending: refunds.length,
        totalAmount: refunds.reduce((sum, r) => sum + (r.payment.expectedRefundAmount || r.payment.amount), 0),
        urgentRequests: refunds.filter(r => r.payment.refundUrgency === 'high').length,
        withImages: refunds.filter(r => r.payment.refundImages && r.payment.refundImages.length > 0).length,
        categories: {
          damaged: refunds.filter(r => r.payment.refundCategory === 'damaged').length,
          wrong_item: refunds.filter(r => r.payment.refundCategory === 'wrong_item').length,
          other: refunds.filter(r => r.payment.refundCategory === 'other').length
        }
      }
    });
  } catch (error) {
    console.error('Error fetching refunds:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch refunds',
      error: error.message
    });
  }
};

// Get all complaints
export const getAllComplaints = async (req, res) => {
  try {
    const complaints = await Tracking.find({
      'complaints.0': { $exists: true },
      'complaints.status': 'Open'
    })
    .populate('assignedPartner', 'name email phone')
    .sort({ 'complaints.submittedAt': -1 });

    res.json({
      success: true,
      complaints,
      count: complaints.length
    });
  } catch (error) {
    console.error('Error fetching complaints:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch complaints',
      error: error.message
    });
  }
};

// Get detailed refund information for admin review
export const getRefundDetails = async (req, res) => {
  try {
    const { trackingId } = req.params;
    
    const refund = await Tracking.findOne({ 
      trackingId,
      'payment.status': 'Refund Requested' 
    })
    .populate('assignedPartner', 'name email phone vehicleType vehicleNumber rating totalDeliveries completedDeliveries')
    .lean();

    if (!refund) {
      return res.status(404).json({
        success: false,
        message: 'Refund request not found'
      });
    }

    // Add image URLs
    if (refund.payment.refundImages && refund.payment.refundImages.length > 0) {
      refund.payment.refundImages = refund.payment.refundImages.map(image => ({
        ...image,
        imageUrl: `/api/uploads/refunds/${image.filename}`
      }));
    }

    // Comprehensive refund details
    const refundDetails = {
      basicInfo: {
        trackingId: refund.trackingId,
        status: refund.status,
        createdAt: refund.createdAt,
        deliveredAt: refund.deliveredAt,
        origin: refund.origin,
        destination: refund.destination,
        currentLocation: refund.currentLocation
      },
      customerInfo: {
        sender: {
          name: refund.sender?.name || 'Unknown',
          email: refund.sender?.email || 'Unknown',
          phone: refund.sender?.phone || 'Not provided'
        },
        receiver: {
          name: refund.receiver?.name || 'Unknown',
          email: refund.receiver?.email || 'Unknown',
          phone: refund.receiver?.phone || 'Not provided'
        }
      },
      packageInfo: {
        type: refund.packageDetails?.type,
        weight: refund.packageDetails?.weight,
        dimensions: refund.packageDetails?.dimensions,
        description: refund.packageDetails?.description,
        specialInstructions: refund.packageDetails?.specialInstructions
      },
      partnerInfo: refund.assignedPartner ? {
        name: refund.assignedPartner.name,
        email: refund.assignedPartner.email,
        phone: refund.assignedPartner.phone,
        vehicleType: refund.assignedPartner.vehicleType,
        vehicleNumber: refund.assignedPartner.vehicleNumber,
        rating: refund.assignedPartner.rating,
        totalDeliveries: refund.assignedPartner.totalDeliveries,
        completedDeliveries: refund.assignedPartner.completedDeliveries,
        partnerId: refund.assignedPartner._id
      } : null,
      paymentInfo: {
        method: refund.payment.method,
        amount: refund.payment.amount,
        status: refund.payment.status,
        transactionId: refund.payment.transactionId,
        upiId: refund.payment.upiId,
        paidAt: refund.payment.paidAt
      },
      refundRequest: {
        reason: refund.payment.refundReason,
        category: refund.payment.refundCategory,
        description: refund.payment.refundDescription,
        expectedAmount: refund.payment.expectedRefundAmount,
        refundMethod: refund.payment.refundMethod,
        urgency: refund.payment.refundUrgency,
        requestedAt: refund.payment.refundRequestedAt,
        images: refund.payment.refundImages || []
      },
      deliveryTimeline: refund.history || [],
      statusHistory: refund.statusHistory || [],
      revenue: refund.revenue,
      partnerEarnings: refund.partnerEarnings
    };

    res.json({
      success: true,
      refundDetails
    });
  } catch (error) {
    console.error('Error fetching refund details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch refund details',
      error: error.message
    });
  }
};

// Approve refund
export const approveRefund = async (req, res) => {
  const { trackingId } = req.params;
  const { adminResponse } = req.body;

  try {
    const tracking = await Tracking.findOne({ trackingId }).populate('assignedPartner');
    if (!tracking) {
      return res.status(404).json({ message: 'Shipment not found' });
    }

    // Update payment status
    tracking.payment.status = 'Refunded';
    tracking.payment.refundedAt = new Date();
    tracking.payment.adminResponse = adminResponse;

    // Add to status history
    tracking.statusHistory.push({
      status: 'Refund Approved',
      timestamp: new Date(),
      location: 'Admin Panel',
      notes: adminResponse,
      updatedBy: req.admin._id,
      updatedByModel: 'Admin'
    });

    await tracking.save();

    // Emit real-time notification to admin dashboard
    const io = req.app.get('io');
    if (io) {
      io.to('admin-room').emit('refund-approved', {
        trackingId,
        customerName: tracking.sender.name,
        amount: tracking.payment.expectedRefundAmount,
        approvedAt: new Date(),
        adminResponse
      });

      // Update dashboard stats
      io.to('admin-room').emit('dashboard-stats-update', {
        type: 'refund_approved',
        trackingId,
        amount: tracking.payment.expectedRefundAmount
      });
    }

    // Send approval email to customer
    await sendDeliveryEmail(
      tracking.sender.email,
      `Refund Approved - Tracking ID: ${trackingId}`,
      `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10b981;">Refund Approved!</h2>
        <p>Hello ${tracking.sender.name},</p>
        <p>Great news! Your refund request has been approved.</p>
        <div style="background: #f0fdf4; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #10b981;">
          <p><strong>Tracking ID:</strong> ${trackingId}</p>
          <p><strong>Refund Amount:</strong> ₹${tracking.payment.expectedRefundAmount}</p>
          <p><strong>Refund Method:</strong> ${tracking.payment.refundMethod}</p>
          <p><strong>Processing Time:</strong> 3-5 business days</p>
          <p><strong>Admin Notes:</strong> ${adminResponse}</p>
        </div>
        <p>Your refund will be processed within 3-5 business days to your ${tracking.payment.refundMethod}.</p>
        <p>Thank you for your patience!</p>
      </div>
      `
    );

    // Notify partner about refund approval
    if (tracking.assignedPartner && tracking.assignedPartner.email) {
      await sendDeliveryEmail(
        tracking.assignedPartner.email,
        `Refund Approved for Your Delivery - ${trackingId}`,
        `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f59e0b;">Refund Approved - Delivery Review</h2>
          <p>Hello ${tracking.assignedPartner.name},</p>
          <p>A refund has been approved for delivery ${trackingId} that you completed.</p>
          <div style="background: #fffbeb; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #f59e0b;">
            <p><strong>Tracking ID:</strong> ${trackingId}</p>
            <p><strong>Refund Amount:</strong> ₹${tracking.payment.expectedRefundAmount}</p>
            <p><strong>Admin Decision:</strong> ${adminResponse}</p>
          </div>
          <p>This refund approval will be considered in your performance review. Please ensure high-quality deliveries to maintain your rating.</p>
          <p>If you have any questions about this decision, please contact our support team.</p>
        </div>
        `
      );
    }

    res.json({
      success: true,
      message: 'Refund approved successfully',
      tracking
    });
  } catch (error) {
    console.error('Error approving refund:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve refund',
      error: error.message
    });
  }
};

// Reject refund
export const rejectRefund = async (req, res) => {
  const { trackingId } = req.params;
  const { adminResponse } = req.body;

  try {
    const tracking = await Tracking.findOne({ trackingId }).populate('assignedPartner');
    if (!tracking) {
      return res.status(404).json({ message: 'Shipment not found' });
    }

    // Update payment status
    tracking.payment.status = 'Refund Rejected';
    tracking.payment.refundRejectedAt = new Date();
    tracking.payment.adminResponse = adminResponse;

    // Add to status history
    tracking.statusHistory.push({
      status: 'Refund Rejected',
      timestamp: new Date(),
      location: 'Admin Panel',
      notes: adminResponse,
      updatedBy: req.admin._id,
      updatedByModel: 'Admin'
    });

    await tracking.save();

    // Emit real-time notification to admin dashboard
    const io = req.app.get('io');
    if (io) {
      io.to('admin-room').emit('refund-rejected', {
        trackingId,
        customerName: tracking.sender.name,
        amount: tracking.payment.expectedRefundAmount,
        rejectedAt: new Date(),
        adminResponse
      });

      // Update dashboard stats
      io.to('admin-room').emit('dashboard-stats-update', {
        type: 'refund_rejected',
        trackingId,
        amount: tracking.payment.expectedRefundAmount
      });
    }

    // Send rejection email to customer
    await sendDeliveryEmail(
      tracking.sender.email,
      `Refund Request Update - Tracking ID: ${trackingId}`,
      `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ef4444;">Refund Request Update</h2>
        <p>Hello ${tracking.sender.name},</p>
        <p>After careful review, we are unable to approve your refund request for the following reason:</p>
        <div style="background: #fef2f2; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #ef4444;">
          <p><strong>Tracking ID:</strong> ${trackingId}</p>
          <p><strong>Admin Review:</strong> ${adminResponse}</p>
        </div>
        <p>If you believe this decision is incorrect or have additional information, please contact our customer support team.</p>
        <p>We appreciate your understanding.</p>
      </div>
      `
    );

    res.json({
      success: true,
      message: 'Refund rejected',
      tracking
    });
  } catch (error) {
    console.error('Error rejecting refund:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject refund',
      error: error.message
    });
  }
};

// Resolve complaint
export const resolveComplaint = async (req, res) => {
  const { trackingId, complaintId } = req.params;
  const { adminResponse } = req.body;

  try {
    const tracking = await Tracking.findOne({ trackingId }).populate('assignedPartner');
    if (!tracking) {
      return res.status(404).json({ message: 'Shipment not found' });
    }

    // Find and update the complaint
    const complaint = tracking.complaints.id(complaintId);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    complaint.status = 'Resolved';
    complaint.adminResponse = adminResponse;
    complaint.resolvedAt = new Date();
    complaint.resolvedBy = req.admin._id;

    // Add to status history
    tracking.statusHistory.push({
      status: 'Complaint Resolved',
      timestamp: new Date(),
      location: 'Admin Panel',
      notes: adminResponse,
      updatedBy: req.admin._id,
      updatedByModel: 'Admin'
    });

    await tracking.save();

    // Send resolution email to customer
    await sendDeliveryEmail(
      complaint.submittedByEmail,
      `Complaint Resolved - Tracking ID: ${trackingId}`,
      `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10b981;">Complaint Resolved</h2>
        <p>Hello,</p>
        <p>Your complaint regarding delivery ${trackingId} has been resolved.</p>
        <div style="background: #f0fdf4; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #10b981;">
          <p><strong>Tracking ID:</strong> ${trackingId}</p>
          <p><strong>Resolution:</strong> ${adminResponse}</p>
          <p><strong>Resolved Date:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
        <p>Thank you for bringing this to our attention. Your feedback helps us improve our service.</p>
      </div>
      `
    );

    // Notify partner about complaint resolution
    if (tracking.assignedPartner && tracking.assignedPartner.email) {
      await sendDeliveryEmail(
        tracking.assignedPartner.email,
        `Complaint Resolved - ${trackingId}`,
        `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10b981;">Complaint Resolution Update</h2>
          <p>Hello ${tracking.assignedPartner.name},</p>
          <p>The complaint regarding your delivery ${trackingId} has been resolved.</p>
          <div style="background: #f0fdf4; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #10b981;">
            <p><strong>Resolution:</strong> ${adminResponse}</p>
          </div>
          <p>Continue providing excellent service to maintain your high rating!</p>
        </div>
        `
      );
    }

    res.json({
      success: true,
      message: 'Complaint resolved successfully',
      tracking
    });
  } catch (error) {
    console.error('Error resolving complaint:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resolve complaint',
      error: error.message
    });
  }
};