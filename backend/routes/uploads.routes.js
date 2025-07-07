import express from 'express';
import path from 'path';
import fs from 'fs';
import { verifyToken, isAdmin } from '../middleware/auth.middleware.js';
import Tracking from '../models/tracking.model.js';

const router = express.Router();

// Serve refund images (admin or image owner)
router.get('/refunds/:filename', verifyToken, async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(process.cwd(), 'uploads', 'refunds', filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }
    
    // Check if user is admin or owns the image
    const isUserAdmin = req.user.role === 'admin';
    
    if (!isUserAdmin) {
      // Find the tracking record that contains this image
      const tracking = await Tracking.findOne({
        'payment.refundImages.filename': filename
      });
      
      if (!tracking) {
        return res.status(404).json({
          success: false,
          message: 'Image not found in any refund request'
        });
      }
      
      // Check if the user is the sender (owner of the refund request)
      if (tracking.sender.email !== req.user.email) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only view your own refund images.'
        });
      }
    }
    
    // Send the file
    res.sendFile(filePath);
  } catch (error) {
    console.error('Error serving refund image:', error);
    res.status(500).json({
      success: false,
      message: 'Error serving image'
    });
  }
});

// Get refund image info (admin only)
router.get('/refunds/:filename/info', verifyToken, isAdmin, (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(process.cwd(), 'uploads', 'refunds', filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }
    
    const stats = fs.statSync(filePath);
    
    res.json({
      success: true,
      imageInfo: {
        filename,
        size: stats.size,
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime
      }
    });
  } catch (error) {
    console.error('Error getting image info:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting image info'
    });
  }
});

export default router;