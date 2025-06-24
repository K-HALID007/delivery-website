import jwt from 'jsonwebtoken';
import Partner from '../models/partner.model.js';

export const verifyPartnerToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if token is for partner
    if (decoded.type !== 'partner') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token type'
      });
    }

    // Find partner
    const partner = await Partner.findById(decoded.partnerId);
    if (!partner) {
      return res.status(401).json({
        success: false,
        message: 'Partner not found'
      });
    }

    // Check if partner is active and approved
    if (!partner.isActive || partner.status !== 'approved') {
      return res.status(403).json({
        success: false,
        message: 'Partner account is not active or not approved'
      });
    }

    req.partnerId = partner._id;
    req.partner = partner;
    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }

    console.error('Partner token verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Token verification failed'
    });
  }
};

export const isPartnerOnline = async (req, res, next) => {
  try {
    if (!req.partner.isOnline) {
      return res.status(403).json({
        success: false,
        message: 'Partner must be online to perform this action'
      });
    }
    next();
  } catch (error) {
    console.error('Partner online check error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify partner status'
    });
  }
};