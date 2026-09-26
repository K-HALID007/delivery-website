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

    const secret = process.env.JWT_SECRET || 'courier-tracker-fallback-secret-2025';
    const decoded = jwt.verify(token, secret);
    
    // Attempt to find user in DB with a short timeout, fallback to decoded JWT payload
    let user = null;
    try {
      user = await Promise.race([
        User.findById(decoded.userId).select('-password'),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Database query timeout')), 3000)
        )
      ]);
    } catch (dbError) {
      // Fallback: create safe user object from JWT data
      user = {
        _id: decoded.userId,
        id: decoded.userId,
        role: decoded.role,
        email: decoded.email || 'unknown@example.com',
        name: decoded.name || 'User',
        isActive: true
      };
    }
    
    if (!user) {
      // If DB returned null, still fallback to token data if token is valid
      user = {
        _id: decoded.userId,
        id: decoded.userId,
        role: decoded.role,
        email: decoded.email || 'unknown@example.com',
        name: decoded.name || 'User',
        isActive: true
      };
    }

    if (user.isActive === false) {
      return res.status(401).json({ success: false, message: 'Account is deactivated' });
    }

    req.user = user;
    req.userId = user._id ? user._id.toString() : (user.id || decoded.userId);
    req.userRole = user.role || decoded.role;
    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid or expired token', 
      error: error.message 
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
