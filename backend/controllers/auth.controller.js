import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { sendDeliveryEmail } from '../utils/email.js';

const getJwtSecret = () => process.env.JWT_SECRET || 'courier-tracker-fallback-secret-2025';

// Helper to get user ID safely from request
const getReqUserId = (req) => {
  return req.user?._id || req.user?.id || req.userId;
};

// Register a new user with strict validation
export const register = async (req, res) => {
  try {
    const { name, email, password, phone, address, city, state, postalCode, country, role } = req.body;

    const requiredFields = {
      name: 'Full name',
      email: 'Email',
      password: 'Password',
      phone: 'Phone number',
      address: 'Street address',
      city: 'City',
      state: 'State/Province',
      postalCode: 'Postal code',
      country: 'Country'
    };

    const missingFields = [];
    for (const [field, label] of Object.entries(requiredFields)) {
      if (!req.body[field] || req.body[field].toString().trim() === '') {
        missingFields.push(label);
      }
    }

    if (missingFields.length > 0) {
      return res.status(400).json({ 
        success: false,
        message: `The following fields are required: ${missingFields.join(', ')}` 
      });
    }

    if (name.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Full name must be at least 2 characters long' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists with this email address' });
    }

    // Role is strictly user by default unless set through admin endpoints
    const userRole = role === 'admin' ? 'user' : (role || 'user');

    const user = new User({
      name: name.trim(),
      email: cleanEmail,
      password: password,
      phone: phone.toString().trim(),
      address: {
        street: address.trim(),
        city: city.trim(),
        state: state.trim(),
        postalCode: postalCode.toString().trim(),
        country: country.trim()
      },
      role: userRole,
      isActive: true
    });

    await user.save();

    const token = jwt.sign(
      { userId: user._id, role: user.role, email: user.email, name: user.name },
      getJwtSecret(),
      { expiresIn: '7d' }
    );

    const userData = user.toObject();
    delete userData.password;

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: userData,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'User already exists with this email address' });
    }
    res.status(500).json({ success: false, message: 'Error registering user', error: error.message });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Account is deactivated' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign(
      { userId: user._id, role: user.role, email: user.email, name: user.name },
      getJwtSecret(),
      { expiresIn: '7d' }
    );

    const userData = user.toObject();
    delete userData.password;

    res.json({
      success: true,
      message: 'Login successful',
      user: userData,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Error logging in', error: error.message });
  }
};

// Admin login
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied. Not an admin.' });
    }

    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Admin account is deactivated' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign(
      { userId: user._id, role: user.role, email: user.email, name: user.name },
      getJwtSecret(),
      { expiresIn: '7d' }
    );

    const userData = user.toObject();
    delete userData.password;

    res.json({
      success: true,
      message: 'Admin login successful',
      user: userData,
      token
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ success: false, message: 'Error logging in as admin', error: error.message });
  }
};

// Create admin user (protected route for existing admins)
export const createAdmin = async (req, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to create admin users' });
    }

    const { name, email, password, phone, address } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    const admin = new User({
      name: name.trim(),
      email: cleanEmail,
      password: password,
      phone: (phone || '1234567890').toString().trim(),
      address: {
        street: address?.street || 'Admin HQ',
        city: address?.city || 'Admin City',
        state: address?.state || 'Admin State',
        postalCode: (address?.postalCode || '100001').toString(),
        country: address?.country || 'India'
      },
      role: 'admin',
      isActive: true
    });

    await admin.save();

    const adminData = admin.toObject();
    delete adminData.password;

    res.status(201).json({
      success: true,
      message: 'Admin user created successfully',
      user: adminData
    });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({ success: false, message: 'Error creating admin user', error: error.message });
  }
};

// Create first admin user (for initial project setup)
export const createFirstAdmin = async (req, res) => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    if (adminExists) {
      return res.status(403).json({ 
        success: false, 
        message: 'Admin user already exists. Please use admin login or admin management.' 
      });
    }

    const { name, email, password, phone, address } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const admin = new User({
      name: name.trim(),
      email: cleanEmail,
      password: password,
      phone: (phone || '1234567890').toString().trim(),
      address: {
        street: address?.street || 'Admin Main Street',
        city: address?.city || 'HQ City',
        state: address?.state || 'HQ State',
        postalCode: (address?.postalCode || '100001').toString(),
        country: address?.country || 'India'
      },
      role: 'admin',
      isActive: true
    });

    await admin.save();

    const token = jwt.sign(
      { userId: admin._id, role: admin.role, email: admin.email, name: admin.name },
      getJwtSecret(),
      { expiresIn: '7d' }
    );

    const adminData = admin.toObject();
    delete adminData.password;

    res.status(201).json({
      success: true,
      message: 'First admin user created successfully',
      user: adminData,
      token
    });
  } catch (error) {
    console.error('Create first admin error:', error);
    res.status(500).json({ success: false, message: 'Error creating first admin user', error: error.message });
  }
};

// Get current user profile
export const getProfile = async (req, res) => {
  try {
    const userId = getReqUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: 'Error fetching profile', error: error.message });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const userId = getReqUserId(req);
    const { name, phone, address, city, state, postalCode, country } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name.trim();
    if (phone) user.phone = phone.toString().trim();
    
    user.address = user.address || {};
    if (address) user.address.street = address.trim();
    if (city) user.address.city = city.trim();
    if (state) user.address.state = state.trim();
    if (postalCode) user.address.postalCode = postalCode.toString().trim();
    if (country) user.address.country = country.trim();

    await user.save();

    const userData = user.toObject();
    delete userData.password;

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: userData
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Error updating profile', error: error.message });
  }
};

// Change password
export const changePassword = async (req, res) => {
  try {
    const userId = getReqUserId(req);
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: 'Error changing password', error: error.message });
  }
};

// Send OTP for account deletion
export const sendDeleteAccountOtp = async (req, res) => {
  try {
    const userId = getReqUserId(req);
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetToken = otp;
    user.resetTokenExpiry = Date.now() + 10 * 60 * 1000;
    await user.save();

    await sendDeliveryEmail(
      user.email,
      'Your OTP for Account Deletion',
      `
      <div style="background:#fffbe6;padding:24px;border-radius:12px;border:1px solid #ffe58f;font-family:sans-serif;max-width:420px;margin:auto;">
        <h2 style="color:#d97706;margin-bottom:8px;">Account Deletion Request</h2>
        <p style="color:#333;font-size:16px;">We received a request to delete your Prime Dispatcher account.</p>
        <p style="color:#333;font-size:16px;">To confirm, please use the following OTP (valid for 10 minutes):</p>
        <div style="font-size:32px;font-weight:bold;color:#f59e0b;background:#fff3cd;padding:12px 0;border-radius:8px;text-align:center;letter-spacing:6px;margin:16px 0;">
          <span>${otp}</span>
        </div>
        <p style="color:#666;font-size:14px;">If you did not request this, please ignore this email.</p>
      </div>
      `
    );

    res.json({ success: true, message: 'OTP sent to your email' });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ success: false, message: 'Error sending OTP', error: error.message });
  }
};

// Delete account
export const deleteProfile = async (req, res) => {
  try {
    const userId = getReqUserId(req);
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { password, otp } = req.body;
    if (password) {
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Incorrect password' });
      }
    } else if (otp) {
      if (!user.resetToken || user.resetToken !== otp || user.resetTokenExpiry < Date.now()) {
        return res.status(401).json({ success: false, message: 'Invalid or expired OTP' });
      }
    } else {
      return res.status(400).json({ success: false, message: 'Password or OTP is required' });
    }

    const userEmail = user.email;
    await user.deleteOne();

    try {
      const { default: Tracking } = await import('../models/tracking.model.js');
      await Tracking.updateMany(
        { 'sender.email': userEmail },
        { $set: { 'sender.name': 'Deleted User', 'sender.email': null, 'sender.phone': null } }
      );
    } catch (e) {
      console.warn('Error anonymizing tracking records:', e.message);
    }

    res.json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete profile error:', error);
    res.status(500).json({ success: false, message: 'Error deleting account', error: error.message });
  }
};

// Admin: Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ success: false, message: 'Error fetching users', error: error.message });
  }
};

// Admin: Get user by ID
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ success: false, message: 'Error fetching user', error: error.message });
  }
};

// Admin: Update user status
export const updateUser = async (req, res) => {
  try {
    const { name, email, phone, role, isActive } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name.trim();
    if (email) user.email = email.toLowerCase().trim();
    if (phone) user.phone = phone.toString().trim();
    if (role) user.role = role;
    if (typeof isActive === 'boolean') user.isActive = isActive;

    await user.save();
    const updated = user.toObject();
    delete updated.password;

    res.json({ success: true, message: 'User updated successfully', user: updated });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ success: false, message: 'Error updating user', error: error.message });
  }
};

export default {
  register,
  login,
  adminLogin,
  createAdmin,
  createFirstAdmin,
  getProfile,
  updateProfile,
  changePassword,
  sendDeleteAccountOtp,
  deleteProfile,
  getAllUsers,
  getUserById,
  updateUser
};