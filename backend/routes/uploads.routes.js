import express from 'express';
import path from 'path';
import fs from 'fs';
import { verifyToken, isAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

// Serve refund images (admin only)
router.get('/refunds/:filename', verifyToken, isAdmin, (req, res) => {
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