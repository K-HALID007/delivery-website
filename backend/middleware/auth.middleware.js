import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

// Middleware to verify JWT token
export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    console.log('Auth header:', authHeader ? 'Present' : 'Missing');
    
    const token = authHeader?.split(' ')[1];
    console.log('Token extracted:', token ? 'Present' : 'Missing');
    console.log('Token length:', token ? token.length : 0);
    
    if (!token) {
      console.log('No token provided in request');
      return res.status(401).json({ message: 'No token provided' });
    }

    console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
    console.log('JWT_SECRET length:', process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decoded successfully:', decoded);
    
    const user = await User.findById(decoded.userId).select('-password');
    console.log('User found:', user ? user.email : 'Not found');
    
    if (!user) {
      console.log('User not found in database');
      return res.status(401).json({ message: 'User not found' });
    }

    if (!user.isActive) {
      console.log('User account is deactivated');
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    req.user = user;
    console.log('Auth middleware successful for user:', user.email);
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    res.status(401).json({ message: 'Invalid token', error: error.message });
  }
};

// Middleware to check if user is admin
export const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
  next();
};

// Middleware to check if user is authenticated
export const isAuthenticated = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  next();
};

