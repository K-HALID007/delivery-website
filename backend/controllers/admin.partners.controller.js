import Partner from '../models/partner.model.js';
import Tracking from '../models/tracking.model.js';

// Get all partners with pagination and filtering
export const getAllPartners = async (req, res) => {
  try {
    console.log('🔍 Admin getAllPartners request received');
    console.log('Query params:', req.query);
    console.log('User:', req.userId, 'Role:', req.userRole);
    
    const { 
      page = 1, 
      limit = 10, 
      status, 
      search, 
      sortBy = 'createdAt', 
      sortOrder = 'desc' 
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (status) {
      filter.status = status;
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { vehicleNumber: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    console.log('Filter:', filter);
    console.log('Sort options:', sortOptions);
    
    // Get partners with pagination
    const partners = await Partner.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-password')
      .lean();

    console.log(`Found ${partners.length} partners`);

    // Get total count for pagination
    const total = await Partner.countDocuments(filter);
    console.log(`Total partners: ${total}`);

    // Add delivery statistics for each partner
    const partnersWithStats = await Promise.all(
      partners.map(async (partner) => {
        const deliveryStats = await Tracking.aggregate([
          { $match: { assignedPartner: partner._id } },
          {
            $group: {
              _id: null,
              totalDeliveries: { $sum: 1 },
              completedDeliveries: {
                $sum: { $cond: [{ $eq: ['$status', 'Delivered'] }, 1, 0] }
              },
              pendingDeliveries: {
                $sum: { $cond: [{ $in: ['$status', ['Pending', 'In Transit', 'Out for Delivery']] }, 1, 0] }
              },
              totalEarnings: { $sum: '$partnerEarnings' }
            }
          }
        ]);

        const stats = deliveryStats[0] || {
          totalDeliveries: 0,
          completedDeliveries: 0,
          pendingDeliveries: 0,
          totalEarnings: 0
        };

        return {
          ...partner,
          deliveryStats: {
            totalDeliveries: stats.totalDeliveries,
            completedDeliveries: stats.completedDeliveries,
            pendingDeliveries: stats.pendingDeliveries,
            totalEarnings: stats.totalEarnings || 0,
            successRate: stats.totalDeliveries > 0 
              ? Math.round((stats.completedDeliveries / stats.totalDeliveries) * 100) 
              : 0
          }
        };
      })
    );

    console.log(`Returning ${partnersWithStats.length} partners with stats`);

    res.json({
      success: true,
      partners: partnersWithStats,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalRecords: total,
        hasNext: skip + parseInt(limit) < total,
        hasPrev: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error('❌ Error fetching partners:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch partners',
      error: error.message
    });
  }
};

// Get partner details by ID
export const getPartnerDetails = async (req, res) => {
  try {
    const { partnerId } = req.params;

    const partner = await Partner.findById(partnerId).select('-password');
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    // Get detailed delivery statistics
    const deliveryStats = await Tracking.aggregate([
      { $match: { assignedPartner: partner._id } },
      {
        $group: {
          _id: null,
          totalDeliveries: { $sum: 1 },
          completedDeliveries: {
            $sum: { $cond: [{ $eq: ['$status', 'Delivered'] }, 1, 0] }
          },
          pendingDeliveries: {
            $sum: { $cond: [{ $in: ['$status', ['Pending', 'In Transit', 'Out for Delivery']] }, 1, 0] }
          },
          failedDeliveries: {
            $sum: { $cond: [{ $in: ['$status', ['Failed', 'Cancelled']] }, 1, 0] }
          },
          totalEarnings: { $sum: '$partnerEarnings' },
          avgRating: { $avg: '$partnerRating' }
        }
      }
    ]);

    // Get recent deliveries
    const recentDeliveries = await Tracking.find({ assignedPartner: partner._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('trackingId status origin destination createdAt deliveredAt partnerEarnings');

    const stats = deliveryStats[0] || {
      totalDeliveries: 0,
      completedDeliveries: 0,
      pendingDeliveries: 0,
      failedDeliveries: 0,
      totalEarnings: 0,
      avgRating: 0
    };

    res.json({
      success: true,
      partner: {
        ...partner.toObject(),
        deliveryStats: {
          ...stats,
          successRate: stats.totalDeliveries > 0 
            ? Math.round((stats.completedDeliveries / stats.totalDeliveries) * 100) 
            : 0,
          failureRate: stats.totalDeliveries > 0 
            ? Math.round((stats.failedDeliveries / stats.totalDeliveries) * 100) 
            : 0
        },
        recentDeliveries
      }
    });

  } catch (error) {
    console.error('Error fetching partner details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch partner details',
      error: error.message
    });
  }
};

// Update partner status
export const updatePartnerStatus = async (req, res) => {
  try {
    const { partnerId } = req.params;
    const { status, reason } = req.body;

    const validStatuses = ['pending', 'approved', 'suspended', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
      });
    }

    const partner = await Partner.findById(partnerId);
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    const oldStatus = partner.status;
    partner.status = status;
    
    // Set isActive to true when approving partner
    if (status === 'approved') {
      partner.isActive = true;
    } else if (status === 'suspended' || status === 'rejected') {
      partner.isActive = false;
      partner.isOnline = false; // Also set offline if suspended/rejected
    }
    
    if (reason) {
      partner.statusReason = reason;
    }

    partner.statusUpdatedAt = new Date();
    await partner.save();

    // Log status change
    console.log(`Partner ${partner.name} status changed from ${oldStatus} to ${status}`);

    res.json({
      success: true,
      message: 'Partner status updated successfully',
      partner: {
        id: partner._id,
        name: partner.name,
        email: partner.email,
        status: partner.status,
        statusReason: partner.statusReason,
        statusUpdatedAt: partner.statusUpdatedAt
      }
    });

  } catch (error) {
    console.error('Error updating partner status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update partner status',
      error: error.message
    });
  }
};

// Get partner analytics
export const getPartnerAnalytics = async (req, res) => {
  try {
    const { timeRange = '30days' } = req.query;
    
    // Calculate date range
    const endDate = new Date();
    let startDate = new Date();
    
    switch (timeRange) {
      case '7days':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30days':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90days':
        startDate.setDate(endDate.getDate() - 90);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    // Get partner statistics
    const totalPartners = await Partner.countDocuments();
    const activePartners = await Partner.countDocuments({ status: 'approved', isOnline: true });
    const pendingPartners = await Partner.countDocuments({ status: 'pending' });
    const suspendedPartners = await Partner.countDocuments({ status: 'suspended' });

    // Get delivery performance
    const deliveryPerformance = await Tracking.aggregate([
      {
        $match: {
          assignedPartner: { $exists: true },
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$assignedPartner',
          totalDeliveries: { $sum: 1 },
          completedDeliveries: {
            $sum: { $cond: [{ $eq: ['$status', 'Delivered'] }, 1, 0] }
          },
          totalEarnings: { $sum: '$partnerEarnings' }
        }
      },
      {
        $lookup: {
          from: 'partners',
          localField: '_id',
          foreignField: '_id',
          as: 'partner'
        }
      },
      {
        $unwind: '$partner'
      },
      {
        $project: {
          partnerName: '$partner.name',
          totalDeliveries: 1,
          completedDeliveries: 1,
          totalEarnings: 1,
          successRate: {
            $cond: [
              { $gt: ['$totalDeliveries', 0] },
              { $multiply: [{ $divide: ['$completedDeliveries', '$totalDeliveries'] }, 100] },
              0
            ]
          }
        }
      },
      {
        $sort: { totalDeliveries: -1 }
      },
      {
        $limit: 10
      }
    ]);

    // Get earnings distribution
    const earningsDistribution = await Partner.aggregate([
      {
        $bucket: {
          groupBy: '$totalEarnings',
          boundaries: [0, 1000, 5000, 10000, 25000, 50000],
          default: '50000+',
          output: {
            count: { $sum: 1 },
            partners: { $push: '$name' }
          }
        }
      }
    ]);

    res.json({
      success: true,
      analytics: {
        summary: {
          totalPartners,
          activePartners,
          pendingPartners,
          suspendedPartners,
          activationRate: totalPartners > 0 ? Math.round((activePartners / totalPartners) * 100) : 0
        },
        topPerformers: deliveryPerformance,
        earningsDistribution,
        timeRange
      }
    });

  } catch (error) {
    console.error('Error fetching partner analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch partner analytics',
      error: error.message
    });
  }
};

// Bulk partner actions
export const bulkPartnerActions = async (req, res) => {
  try {
    const { action, partnerIds, data } = req.body;

    if (!partnerIds || !Array.isArray(partnerIds) || partnerIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Partner IDs array is required'
      });
    }

    let result;
    
    switch (action) {
      case 'updateStatus':
        if (!data.status) {
          return res.status(400).json({
            success: false,
            message: 'Status is required for bulk status update'
          });
        }
        
        const updateData = { 
          status: data.status,
          statusReason: data.reason || 'Bulk update',
          statusUpdatedAt: new Date()
        };
        
        // Set isActive based on status
        if (data.status === 'approved') {
          updateData.isActive = true;
        } else if (data.status === 'suspended' || data.status === 'rejected') {
          updateData.isActive = false;
          updateData.isOnline = false;
        }
        
        result = await Partner.updateMany(
          { _id: { $in: partnerIds } },
          updateData
        );
        break;

      case 'delete':
        result = await Partner.deleteMany({ _id: { $in: partnerIds } });
        break;

      case 'activate':
        result = await Partner.updateMany(
          { _id: { $in: partnerIds } },
          { 
            status: 'approved',
            isActive: true,
            statusUpdatedAt: new Date()
          }
        );
        break;

      case 'deactivate':
        result = await Partner.updateMany(
          { _id: { $in: partnerIds } },
          { 
            status: 'suspended',
            isActive: false,
            isOnline: false,
            statusUpdatedAt: new Date()
          }
        );
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid action. Supported actions: updateStatus, delete, activate, deactivate'
        });
    }

    // Get updated partners for response
    const updatedPartners = await Partner.find({ _id: { $in: partnerIds } })
      .select('name email status isOnline');

    res.json({
      success: true,
      message: `Bulk ${action} completed successfully`,
      result: {
        matchedCount: result.matchedCount || result.deletedCount,
        modifiedCount: result.modifiedCount || result.deletedCount,
        affectedPartners: updatedPartners.length
      },
      updatedPartners
    });

  } catch (error) {
    console.error('Error performing bulk partner action:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform bulk action',
      error: error.message
    });
  }
};

// Assign delivery to partner
export const assignDeliveryToPartner = async (req, res) => {
  try {
    const { trackingId, partnerId } = req.body;

    if (!trackingId || !partnerId) {
      return res.status(400).json({
        success: false,
        message: 'Tracking ID and Partner ID are required'
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

    // Find the partner
    const partner = await Partner.findById(partnerId);
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    // Check if partner is available
    if (partner.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Partner is not approved for deliveries'
      });
    }

    // Assign partner to delivery
    tracking.assignedPartner = partnerId;
    tracking.assignedAt = new Date();
    tracking.status = 'Assigned';
    
    // Add to history
    tracking.history.push({
      status: 'Assigned',
      location: tracking.currentLocation,
      timestamp: new Date(),
      description: `Assigned to partner: ${partner.name}`
    });

    await tracking.save();

    // Update partner's delivery count
    await Partner.findByIdAndUpdate(partnerId, {
      $inc: { totalDeliveries: 1 }
    });

    res.json({
      success: true,
      message: 'Delivery assigned to partner successfully',
      assignment: {
        trackingId,
        partnerName: partner.name,
        partnerEmail: partner.email,
        assignedAt: tracking.assignedAt
      }
    });

  } catch (error) {
    console.error('Error assigning delivery to partner:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign delivery to partner',
      error: error.message
    });
  }
};