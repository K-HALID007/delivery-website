import express from 'express';
import Partner from '../models/partner.model.js';
import Tracking from '../models/tracking.model.js';
import assignmentService from '../services/assignmentService.js';

const router = express.Router();

// Debug endpoint to check system status
router.get('/system-status', async (req, res) => {
  try {
    // Get all partners
    const allPartners = await Partner.find({});
    const partnerStats = {
      total: allPartners.length,
      byStatus: allPartners.reduce((acc, partner) => {
        acc[partner.status] = (acc[partner.status] || 0) + 1;
        return acc;
      }, {}),
      online: allPartners.filter(p => p.isOnline).length,
      approved: allPartners.filter(p => p.status === 'approved').length,
      approvedOnline: allPartners.filter(p => p.status === 'approved' && p.isOnline).length
    };

    // Get unassigned deliveries
    const unassignedDeliveries = await Tracking.find({
      $or: [
        { assignedPartner: { $exists: false } },
        { assignedPartner: null }
      ]
    });

    const unassignedStats = {
      total: unassignedDeliveries.length,
      byStatus: unassignedDeliveries.reduce((acc, delivery) => {
        acc[delivery.status] = (acc[delivery.status] || 0) + 1;
        return acc;
      }, {}),
      recent: unassignedDeliveries.filter(d => 
        new Date() - new Date(d.createdAt) < 24 * 60 * 60 * 1000 // Last 24 hours
      ).length
    };

    // Get assigned deliveries
    const assignedDeliveries = await Tracking.find({
      assignedPartner: { $exists: true, $ne: null }
    });

    const assignedStats = {
      total: assignedDeliveries.length,
      byStatus: assignedDeliveries.reduce((acc, delivery) => {
        acc[delivery.status] = (acc[delivery.status] || 0) + 1;
        return acc;
      }, {})
    };

    // Assignment service status
    const serviceStatus = assignmentService.getStatus();

    res.json({
      success: true,
      timestamp: new Date(),
      partners: partnerStats,
      unassignedDeliveries: unassignedStats,
      assignedDeliveries: assignedStats,
      assignmentService: serviceStatus,
      recommendations: generateRecommendations(partnerStats, unassignedStats)
    });

  } catch (error) {
    console.error('Debug system status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get system status',
      error: error.message
    });
  }
});

// Manual trigger assignment
router.post('/trigger-assignment', async (req, res) => {
  try {
    console.log('🔄 Manually triggering assignment from debug endpoint...');
    await assignmentService.triggerAssignment();
    
    res.json({
      success: true,
      message: 'Assignment process triggered successfully',
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Manual assignment trigger error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to trigger assignment',
      error: error.message
    });
  }
});

// Get recent unassigned deliveries
router.get('/unassigned-deliveries', async (req, res) => {
  try {
    const unassignedDeliveries = await Tracking.find({
      $or: [
        { assignedPartner: { $exists: false } },
        { assignedPartner: null }
      ]
    })
    .sort({ createdAt: -1 })
    .limit(10)
    .select('trackingId status createdAt sender receiver origin destination');

    res.json({
      success: true,
      count: unassignedDeliveries.length,
      deliveries: unassignedDeliveries
    });
  } catch (error) {
    console.error('Get unassigned deliveries error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get unassigned deliveries',
      error: error.message
    });
  }
});

// Get partner list with status
router.get('/partners', async (req, res) => {
  try {
    const partners = await Partner.find({})
      .select('name email status isOnline totalDeliveries createdAt')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: partners.length,
      partners
    });
  } catch (error) {
    console.error('Get partners error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get partners',
      error: error.message
    });
  }
});

// Get all deliveries in system
router.get('/all-deliveries', async (req, res) => {
  try {
    const allDeliveries = await Tracking.find({})
      .select('trackingId status assignedPartner createdAt sender receiver origin destination')
      .populate('assignedPartner', 'name email')
      .sort({ createdAt: -1 });

    // Group by partner
    const partnerGroups = {};
    allDeliveries.forEach(delivery => {
      const partnerId = delivery.assignedPartner?._id?.toString() || 'UNASSIGNED';
      const partnerName = delivery.assignedPartner?.name || 'UNASSIGNED';
      
      if (!partnerGroups[partnerId]) {
        partnerGroups[partnerId] = {
          partnerName,
          deliveries: []
        };
      }
      partnerGroups[partnerId].deliveries.push({
        trackingId: delivery.trackingId,
        status: delivery.status,
        createdAt: delivery.createdAt,
        sender: delivery.sender?.name,
        origin: delivery.origin,
        destination: delivery.destination
      });
    });

    res.json({
      success: true,
      totalDeliveries: allDeliveries.length,
      deliveries: allDeliveries.map(d => ({
        trackingId: d.trackingId,
        status: d.status,
        assignedPartner: d.assignedPartner?._id || null,
        partnerName: d.assignedPartner?.name || 'UNASSIGNED',
        createdAt: d.createdAt,
        sender: d.sender?.name,
        origin: d.origin,
        destination: d.destination
      })),
      partnerGroups
    });
  } catch (error) {
    console.error('Get all deliveries error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get all deliveries',
      error: error.message
    });
  }
});

function generateRecommendations(partnerStats, unassignedStats) {
  const recommendations = [];

  if (partnerStats.total === 0) {
    recommendations.push({
      type: 'critical',
      message: 'No partners registered in the system',
      action: 'Register partners through the partner registration page'
    });
  } else if (partnerStats.approved === 0) {
    recommendations.push({
      type: 'critical',
      message: 'No partners are approved',
      action: 'Admin needs to approve pending partners'
    });
  } else if (partnerStats.approvedOnline === 0) {
    recommendations.push({
      type: 'warning',
      message: 'No approved partners are online',
      action: 'Partners need to go online to receive deliveries'
    });
  }

  if (unassignedStats.total > 0) {
    recommendations.push({
      type: 'info',
      message: `${unassignedStats.total} deliveries are unassigned`,
      action: 'Check partner availability and trigger assignment'
    });
  }

  if (unassignedStats.recent > 5) {
    recommendations.push({
      type: 'warning',
      message: `${unassignedStats.recent} deliveries created in last 24 hours are still unassigned`,
      action: 'Investigate assignment service or partner availability'
    });
  }

  return recommendations;
}

export default router;