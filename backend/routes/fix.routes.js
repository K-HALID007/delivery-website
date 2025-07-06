import express from 'express';
import Partner from '../models/partner.model.js';

const router = express.Router();

// Fix partner active status - one-time fix endpoint
router.post('/fix-partner-active-status', async (req, res) => {
  try {
    console.log('🔧 Starting partner active status fix...');

    // Find all approved partners with isActive: false
    const partnersToUpdate = await Partner.find({
      status: 'approved',
      isActive: { $ne: true }
    });

    console.log(`🔍 Found ${partnersToUpdate.length} approved partners with isActive: false`);

    if (partnersToUpdate.length > 0) {
      // Update all approved partners to set isActive: true
      const result = await Partner.updateMany(
        { 
          status: 'approved',
          isActive: { $ne: true }
        },
        { 
          $set: { 
            isActive: true,
            updatedAt: new Date()
          }
        }
      );

      console.log(`✅ Updated ${result.modifiedCount} partners`);
      
      // Get updated partners for response
      const updatedPartners = await Partner.find({
        status: 'approved',
        isActive: true
      }).select('name email status isActive');

      res.json({
        success: true,
        message: `Fixed ${result.modifiedCount} partners`,
        partnersFixed: result.modifiedCount,
        updatedPartners: updatedPartners.map(p => ({
          name: p.name,
          email: p.email,
          status: p.status,
          isActive: p.isActive
        }))
      });
    } else {
      res.json({
        success: true,
        message: 'All approved partners already have isActive: true',
        partnersFixed: 0,
        updatedPartners: []
      });
    }

  } catch (error) {
    console.error('❌ Error fixing partner active status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fix partner active status',
      error: error.message
    });
  }
});

// Check partner status - debug endpoint
router.get('/check-partner-status/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    const partner = await Partner.findOne({ email }).select('name email status isActive isOnline');
    
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    res.json({
      success: true,
      partner: {
        name: partner.name,
        email: partner.email,
        status: partner.status,
        isActive: partner.isActive,
        isOnline: partner.isOnline,
        canLogin: partner.status === 'approved' && partner.isActive
      }
    });

  } catch (error) {
    console.error('❌ Error checking partner status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check partner status',
      error: error.message
    });
  }
});

export default router;