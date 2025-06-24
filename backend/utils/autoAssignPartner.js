import Partner from '../models/partner.model.js';
import Tracking from '../models/tracking.model.js';

/**
 * Automatically assign a delivery to an available partner
 * @param {Object} delivery - The delivery/tracking object
 * @returns {Object|null} - Assigned partner or null if none available
 */
export const autoAssignPartner = async (delivery) => {
  try {
    console.log(`🔄 Auto-assigning partner for delivery: ${delivery.trackingId}`);
    
    // First, let's check all partners in the system for debugging
    const allPartners = await Partner.find({});
    console.log(`📊 Total partners in system: ${allPartners.length}`);
    
    if (allPartners.length > 0) {
      const partnerStats = allPartners.reduce((acc, partner) => {
        acc[partner.status] = (acc[partner.status] || 0) + 1;
        return acc;
      }, {});
      console.log(`📊 Partner status breakdown:`, partnerStats);
      
      const onlineCount = allPartners.filter(p => p.isOnline).length;
      const approvedCount = allPartners.filter(p => p.status === 'approved').length;
      const approvedOnlineCount = allPartners.filter(p => p.status === 'approved' && p.isOnline).length;
      
      console.log(`📊 Partner availability: ${approvedCount} approved, ${onlineCount} online, ${approvedOnlineCount} approved & online`);
    }
    
    // Find available partners - prioritize online partners
    let availablePartners = await Partner.find({
      status: 'approved',
      isOnline: true
    }).sort({ totalDeliveries: 1 }); // Sort by least deliveries first (load balancing)
    
    if (availablePartners.length === 0) {
      console.log('⚠️ No online approved partners available, checking offline approved partners...');
      
      // If no online partners, get any approved partner
      const offlinePartners = await Partner.find({
        status: 'approved',
        isOnline: false
      }).sort({ totalDeliveries: 1 });
      
      if (offlinePartners.length === 0) {
        console.log('❌ No approved partners available for assignment');
        console.log('💡 Suggestion: Check if partners need to be approved by admin');
        return null;
      }
      
      availablePartners = offlinePartners;
      console.log(`📋 Found ${offlinePartners.length} offline approved partners for assignment`);
    } else {
      console.log(`🟢 Found ${availablePartners.length} online approved partners for assignment`);
    }
    
    // Simple round-robin assignment (assign to partner with least deliveries)
    const selectedPartner = availablePartners[0];
    
    console.log(`✅ Assigning delivery ${delivery.trackingId} to partner: ${selectedPartner.name}`);
    
    // Update the delivery with proper assignment
    const updateData = {
      assignedPartner: selectedPartner._id,
      status: 'assigned',
      assignedAt: new Date(),
      partnerEarnings: 60 // Base earning per delivery
    };
    
    // Add to status history
    if (!delivery.statusHistory) {
      delivery.statusHistory = [];
    }
    
    delivery.statusHistory.push({
      status: 'assigned',
      timestamp: new Date(),
      notes: `Auto-assigned to partner: ${selectedPartner.name}`,
      updatedBy: selectedPartner._id,
      updatedByModel: 'Partner'
    });
    
    // Apply updates to delivery object
    Object.assign(delivery, updateData);
    
    await delivery.save();
    
    // Also update using findByIdAndUpdate to ensure the database is updated
    await Tracking.findByIdAndUpdate(delivery._id, updateData, { new: true });
    
    console.log(`📊 Delivery ${delivery.trackingId} saved with assignedPartner: ${selectedPartner._id}`);
    
    // Update partner stats
    selectedPartner.totalDeliveries = (selectedPartner.totalDeliveries || 0) + 1;
    await selectedPartner.save();
    
    console.log(`🎉 Successfully assigned delivery ${delivery.trackingId} to ${selectedPartner.name}`);
    
    return selectedPartner;
    
  } catch (error) {
    console.error('❌ Error in auto-assignment:', error);
    return null;
  }
};

/**
 * Get the best available partner based on location and workload
 * @param {Object} deliveryLocation - Delivery location details
 * @returns {Object|null} - Best partner or null
 */
export const getBestAvailablePartner = async (deliveryLocation = {}) => {
  try {
    // Advanced partner selection logic
    const partners = await Partner.aggregate([
      {
        $match: {
          status: 'approved'
        }
      },
      {
        $addFields: {
          // Calculate priority score (lower is better)
          priorityScore: {
            $add: [
              { $ifNull: ['$totalDeliveries', 0] }, // Current workload
              { $cond: [{ $eq: ['$isOnline', true] }, 0, 100] }, // Online bonus
              // Add location-based scoring here if needed
            ]
          }
        }
      },
      {
        $sort: { priorityScore: 1 } // Sort by best score
      },
      {
        $limit: 1
      }
    ]);
    
    return partners.length > 0 ? partners[0] : null;
    
  } catch (error) {
    console.error('Error getting best partner:', error);
    return null;
  }
};

/**
 * Check if a partner is available for new assignments
 * @param {String} partnerId - Partner ID
 * @returns {Boolean} - Whether partner is available
 */
export const isPartnerAvailable = async (partnerId) => {
  try {
    const partner = await Partner.findById(partnerId);
    if (!partner || partner.status !== 'approved') {
      return false;
    }
    
    // Check current active deliveries
    const activeDeliveries = await Tracking.countDocuments({
      assignedPartner: partnerId,
      status: { $in: ['assigned', 'picked_up', 'in_transit'] }
    });
    
    // Set max deliveries per partner (you can make this configurable)
    const maxActiveDeliveries = 10;
    
    return activeDeliveries < maxActiveDeliveries;
    
  } catch (error) {
    console.error('Error checking partner availability:', error);
    return false;
  }
};

export default {
  autoAssignPartner,
  getBestAvailablePartner,
  isPartnerAvailable
};