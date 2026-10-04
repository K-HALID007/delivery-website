import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

// Middleware to verify JWT token
export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;

    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication token required' });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(503).json({ success: false, message: 'Authentication is not configured' });
    }
    const decoded = jwt.verify(token, secret);
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Account no longer exists' });
    }

    if (user.isActive === false) {
      return res.status(401).json({ success: false, message: 'Account is deactivated' });
    }

    req.user = user;
    req.userId = user._id ? user._id.toString() : (user.id || decoded.userId);
    req.userRole = user.role || decoded.role;
    next();
  } catch (error) {
    return res.status(error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError' ? 401 : 503).json({ 
      success: false, 
      message: error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError'
        ? 'Invalid or expired token'
        : 'Unable to verify account right now'
    });
  }
};

// Middleware to check if user is admin
export const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied. Admin privileges required.' });
  }
  next();
};

// Middleware to check if user is authenticated
export const isAuthenticated = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }
  next();
};

export default { verifyToken, isAdmin, isAuthenticated };
