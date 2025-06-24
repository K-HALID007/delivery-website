import Partner from '../models/partner.model.js';
import Tracking from '../models/tracking.model.js';
import jwt from 'jsonwebtoken';
import { sendDeliveryEmail } from '../utils/email.js';
import assignmentService from '../services/assignmentService.js';

// Generate JWT token
const generateToken = (partnerId) => {
  return jwt.sign({ partnerId, type: 'partner' }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

// Partner Registration
export const registerPartner = async (req, res) => {
  try {
    const {
      name, email, password, phone, address, city, state, postalCode, country,
      vehicleType, vehicleNumber, licenseNumber, experience, workingHours, preferredZones
    } = req.body;

    // Check if partner already exists
    const existingPartner = await Partner.findOne({ email });
    if (existingPartner) {
      return res.status(400).json({
        success: false,
        message: 'Partner with this email already exists'
      });
    }

    // Check if vehicle number already exists
    const existingVehicle = await Partner.findOne({ vehicleNumber });
    if (existingVehicle) {
      return res.status(400).json({
        success: false,
        message: 'Partner with this vehicle number already exists'
      });
    }

    // Create new partner
    const partner = new Partner({
      name,
      email,
      password,
      phone,
      address: {
        street: address,
        city,
        state,
        postalCode,
        country: country || 'India'
      },
      vehicleType,
      vehicleNumber: vehicleNumber.toUpperCase(),
      licenseNumber,
      experience,
      workingHours,
      preferredZones,
      status: 'pending'
    });

    await partner.save();

    // Welcome email disabled for simplified setup
    console.log('Partner registration successful - welcome email disabled');

    res.status(201).json({
      success: true,
      message: 'Partner registration successful! Please wait for admin approval.',
      partner: {
        id: partner._id,
        name: partner.name,
        email: partner.email,
        status: partner.status
      }
    });

  } catch (error) {
    console.error('Partner registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.',
      error: error.message
    });
  }
};

// Partner Login
export const loginPartner = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find partner by email
    const partner = await Partner.findOne({ email });
    if (!partner) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await partner.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if partner is approved
    if (partner.status !== 'approved') {
      return res.status(403).json({
        success: false,
        message: `Account is ${partner.status}. Please contact admin for assistance.`
      });
    }

    // Update last login
    partner.lastLogin = new Date();
    await partner.save();

    // Generate token
    const token = generateToken(partner._id);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      partner: {
        id: partner._id,
        name: partner.name,
        email: partner.email,
        phone: partner.phone,
        vehicleType: partner.vehicleType,
        vehicleNumber: partner.vehicleNumber,
        status: partner.status,
        rating: partner.rating,
        totalDeliveries: partner.totalDeliveries,
        completionRate: partner.completionRate,
        isOnline: partner.isOnline
      }
    });

  } catch (error) {
    console.error('Partner login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.',
      error: error.message
    });
  }
};

// Get Partner Profile
export const getPartnerProfile = async (req, res) => {
  try {
    const partner = await Partner.findById(req.partnerId).select('-password');
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    res.json({
      success: true,
      partner
    });

  } catch (error) {
    console.error('Get partner profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message
    });
  }
};

// Update Partner Profile
export const updatePartnerProfile = async (req, res) => {
  try {
    const updates = req.body;
    
    // Remove sensitive fields that shouldn't be updated via this endpoint
    delete updates.password;
    delete updates.status;
    delete updates.isVerified;
    delete updates.totalEarnings;
    delete updates.rating;

    const partner = await Partner.findByIdAndUpdate(
      req.partnerId,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).select('-password');

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      partner
    });

  } catch (error) {
    console.error('Update partner profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
};

// Get Partner Dashboard Stats
export const getPartnerDashboard = async (req, res) => {
  try {
    const partner = await Partner.findById(req.partnerId);
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    // Get today's deliveries
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Convert partnerId to ObjectId for proper matching
    const mongoose = await import('mongoose');
    const partnerObjectId = new mongoose.Types.ObjectId(req.partnerId);

    const todayDeliveries = await Tracking.countDocuments({
      assignedPartner: partnerObjectId,
      updatedAt: { $gte: today, $lt: tomorrow }
    });

    // Get active deliveries
    const activeDeliveries = await Tracking.find({
      assignedPartner: partnerObjectId,
      status: { $in: ['assigned', 'picked_up', 'in_transit', 'out_for_delivery'] }
    }).populate('sender receiver', 'name phone email');

    console.log(`📊 Partner ${req.partnerId} dashboard: ${todayDeliveries} today, ${activeDeliveries.length} active deliveries`);
    if (activeDeliveries.length > 0) {
      console.log(`📋 Active delivery IDs: ${activeDeliveries.map(d => d.trackingId).join(', ')}`);
    }

    // Calculate this month's earnings
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const monthlyEarnings = await Tracking.aggregate([
      {
        $match: {
          assignedPartner: partnerObjectId,
          status: 'delivered',
          updatedAt: { $gte: thisMonth }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$partnerEarnings' }
        }
      }
    ]);

    const stats = {
      totalDeliveries: partner.totalDeliveries,
      completedDeliveries: partner.completedDeliveries,
      todayDeliveries,
      monthlyEarnings: monthlyEarnings[0]?.total || 0,
      rating: partner.rating,
      completionRate: partner.completionRate,
      totalEarnings: partner.totalEarnings,
      isOnline: partner.isOnline
    };

    res.json({
      success: true,
      stats,
      activeDeliveries
    });

  } catch (error) {
    console.error('Get partner dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data',
      error: error.message
    });
  }
};

// Get Partner Deliveries
export const getPartnerDeliveries = async (req, res) => {
  try {
    const { status, page = 1, limit = 10, trackingId } = req.query;
    const skip = (page - 1) * limit;

    // Convert partnerId to ObjectId for proper matching
    const mongoose = await import('mongoose');
    const partnerObjectId = new mongoose.Types.ObjectId(req.partnerId);

    const query = { assignedPartner: partnerObjectId };
    if (status) {
      query.status = status;
    }
    if (trackingId) {
      query.trackingId = trackingId;
    }

    console.log(`🔍 Partner ${req.partnerId} requesting deliveries with query:`, query);
    console.log(`🔍 Partner ObjectId: ${partnerObjectId}`);

    // Debug: Check all deliveries with this partner assigned
    const allAssignedDeliveries = await Tracking.find({ assignedPartner: partnerObjectId });
    console.log(`🔍 Total deliveries assigned to this partner: ${allAssignedDeliveries.length}`);
    if (allAssignedDeliveries.length > 0) {
      console.log(`🔍 All assigned delivery IDs: ${allAssignedDeliveries.map(d => d.trackingId).join(', ')}`);
      console.log(`🔍 All assigned delivery statuses: ${allAssignedDeliveries.map(d => `${d.trackingId}:${d.status}`).join(', ')}`);
    }

    const deliveries = await Tracking.find(query)
      .populate('sender receiver', 'name phone email address')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Tracking.countDocuments(query);

    console.log(`📦 Found ${deliveries.length} deliveries for partner ${req.partnerId} with status filter: ${status || 'all'}`);
    if (deliveries.length > 0) {
      console.log(`📋 Filtered delivery IDs: ${deliveries.map(d => d.trackingId).join(', ')}`);
    }

    res.json({
      success: true,
      deliveries,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: deliveries.length,
        totalRecords: total
      }
    });

  } catch (error) {
    console.error('Get partner deliveries error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch deliveries',
      error: error.message
    });
  }
};

// Update Delivery Status
export const updateDeliveryStatus = async (req, res) => {
  try {
    const { trackingId } = req.params;
    const { status, notes, location } = req.body;

    // Convert partnerId to ObjectId for proper matching
    const mongoose = await import('mongoose');
    const partnerObjectId = new mongoose.Types.ObjectId(req.partnerId);

    const tracking = await Tracking.findOne({
      trackingId,
      assignedPartner: partnerObjectId
    });

    if (!tracking) {
      return res.status(404).json({
        success: false,
        message: 'Delivery not found or not assigned to you'
      });
    }

    // Update tracking status
    tracking.status = status;
    if (notes) tracking.notes = notes;
    if (location) tracking.currentLocation = location;

    // Add status history
    tracking.statusHistory.push({
      status,
      timestamp: new Date(),
      location: location || tracking.currentLocation,
      notes
    });

    // If delivered, update partner stats and earnings
    if (status === 'delivered') {
      const partner = await Partner.findById(req.partnerId);
      partner.completedDeliveries += 1;
      partner.totalEarnings += tracking.partnerEarnings || 0;
      await partner.save();

      tracking.deliveredAt = new Date();

      // 💰 AUTO-UPDATE PAYMENT STATUS FOR COD ORDERS
      if (tracking.payment.method === 'COD' && tracking.payment.status === 'Pending') {
        tracking.payment.status = 'Completed';
        tracking.payment.paidAt = new Date();
        console.log(`✅ COD payment automatically completed for delivery: ${trackingId}`);
      }
    }

    await tracking.save();

    // 🚀 EMIT REAL-TIME UPDATE TO ADMIN
    try {
      // Get the app instance to access socket.io
      const app = req.app;
      const io = app.get('io');
      
      if (io) {
        // Populate the tracking data for admin
        const populatedTracking = await Tracking.findOne({ trackingId })
          .populate('assignedPartner', 'name email vehicleType vehicleNumber rating isOnline')
          .populate('sender receiver', 'name email phone');
        
        // Emit to admin room
        io.to('admin-room').emit('delivery-status-updated', {
          trackingId,
          status,
          notes,
          timestamp: new Date(),
          updatedBy: 'partner',
          partnerName: tracking.assignedPartner ? 
            (await Partner.findById(tracking.assignedPartner))?.name : 'Unknown',
          delivery: populatedTracking
        });
        
        console.log(`📡 Real-time update sent to admin: ${trackingId} → ${status}`);
      }
    } catch (socketError) {
      console.error('Failed to emit real-time update:', socketError);
    }

    // 📧 Send email notification to receiver about status update
    try {
      if (tracking.receiver?.email) {
        const statusMessages = {
          'assigned': 'Your package has been assigned to a delivery partner',
          'picked_up': 'Your package has been picked up and is on its way',
          'in_transit': 'Your package is in transit',
          'out_for_delivery': 'Your package is out for delivery and will arrive soon',
          'delivered': 'Your package has been successfully delivered',
          'cancelled': 'Your delivery has been cancelled'
        };

        const statusMessage = statusMessages[status] || 'Your package status has been updated';

        await sendDeliveryEmail(
          tracking.receiver.email,
          `Delivery Update - Tracking ID: ${trackingId}`,
          `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #f59e0b;">Delivery Status Update</h2>
            <p>Hello ${tracking.receiver.name},</p>
            <p>${statusMessage}</p>
            <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <p><strong>Tracking ID:</strong> ${trackingId}</p>
              <p><strong>Status:</strong> ${status.replace('_', ' ').toUpperCase()}</p>
              <p><strong>From:</strong> ${tracking.sender.name}</p>
              <p><strong>Current Location:</strong> ${location || tracking.currentLocation}</p>
              <p><strong>Updated:</strong> ${new Date().toLocaleString('en-IN')}</p>
              ${notes ? `<p><strong>Note:</strong> ${notes}</p>` : ''}
            </div>
            ${status === 'out_for_delivery' ? `<p><strong>🚛 Your package is out for delivery and will arrive soon!</strong></p>` : ''}
            ${status === 'delivered' ? `<p><strong>✅ Your package has been successfully delivered!</strong></p>` : ''}
            <p>You can track your shipment anytime using the tracking ID.</p>
            <p>Thank you for using our courier service!</p>
          </div>
          `
        );

        console.log(`📧 Status update email sent to receiver: ${tracking.receiver.email} - Status: ${status}`);
      }
    } catch (emailError) {
      console.error('Failed to send status update email to receiver:', emailError);
    }

    res.json({
      success: true,
      message: 'Delivery status updated successfully',
      tracking
    });

  } catch (error) {
    console.error('Update delivery status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update delivery status',
      error: error.message
    });
  }
};

// Update Partner Location
export const updatePartnerLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    const partner = await Partner.findById(req.partnerId);
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    await partner.updateLocation(latitude, longitude);

    res.json({
      success: true,
      message: 'Location updated successfully'
    });

  } catch (error) {
    console.error('Update partner location error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update location',
      error: error.message
    });
  }
};

// Toggle Partner Online Status
export const toggleOnlineStatus = async (req, res) => {
  try {
    const partner = await Partner.findById(req.partnerId);
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    const wasOffline = !partner.isOnline;
    partner.isOnline = !partner.isOnline;
    await partner.save();

    // 🚀 If partner just came online, trigger assignment check
    if (wasOffline && partner.isOnline) {
      console.log(`🟢 Partner ${partner.name} (${partner._id}) came online, triggering assignment check...`);
      
      // Trigger assignment check in background (don't wait for it)
      assignmentService.processPartnerOnline(partner._id).catch(error => {
        console.error('Error in background assignment check:', error);
      });
    }

    res.json({
      success: true,
      message: `You are now ${partner.isOnline ? 'online' : 'offline'}`,
      isOnline: partner.isOnline
    });

  } catch (error) {
    console.error('Toggle online status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update online status',
      error: error.message
    });
  }
};

// Get Partner Earnings
export const getPartnerEarnings = async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    let startDate = new Date();
    if (period === 'week') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === 'month') {
      startDate.setMonth(startDate.getMonth() - 1);
    } else if (period === 'year') {
      startDate.setFullYear(startDate.getFullYear() - 1);
    }

    // Convert partnerId to ObjectId for proper matching
    const mongoose = await import('mongoose');
    const partnerObjectId = new mongoose.Types.ObjectId(req.partnerId);

    const earnings = await Tracking.aggregate([
      {
        $match: {
          assignedPartner: partnerObjectId,
          status: 'delivered',
          deliveredAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$deliveredAt" }
          },
          dailyEarnings: { $sum: '$partnerEarnings' },
          deliveryCount: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const totalEarnings = earnings.reduce((sum, day) => sum + day.dailyEarnings, 0);
    const totalDeliveries = earnings.reduce((sum, day) => sum + day.deliveryCount, 0);

    res.json({
      success: true,
      earnings: {
        period,
        totalEarnings,
        totalDeliveries,
        dailyBreakdown: earnings,
        averagePerDelivery: totalDeliveries > 0 ? (totalEarnings / totalDeliveries).toFixed(2) : 0
      }
    });

  } catch (error) {
    console.error('Get partner earnings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch earnings data',
      error: error.message
    });
  }
};