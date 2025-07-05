import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Register a new user with strict validation
export const register = async (req, res) => {
  try {
    const { name, email, password, phone, address, city, state, postalCode, country } = req.body;

    // Strict validation - check all required fields
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
        message: `The following fields are required: ${missingFields.join(', ')}` 
      });
    }

    // Additional validation
    if (name.trim().length < 2) {
      return res.status(400).json({ message: 'Full name must be at least 2 characters long' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    if (phone.trim().length < 10) {
      return res.status(400).json({ message: 'Phone number must be at least 10 characters long' });
    }

    if (address.trim().length < 5) {
      return res.status(400).json({ message: 'Street address must be at least 5 characters long' });
    }

    if (city.trim().length < 2) {
      return res.status(400).json({ message: 'City must be at least 2 characters long' });
    }

    if (state.trim().length < 2) {
      return res.status(400).json({ message: 'State/Province must be at least 2 characters long' });
    }

    if (postalCode.trim().length < 3) {
      return res.status(400).json({ message: 'Postal code must be at least 3 characters long' });
    }

    if (country.trim().length < 2) {
      return res.status(400).json({ message: 'Country must be at least 2 characters long' });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    // Phone format validation
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ message: 'Please enter a valid phone number' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email address' });
    }

    // Create new user with trimmed data
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: password,
      phone: phone.trim(),
      address: {
        street: address.trim(),
        city: city.trim(),
        state: state.trim(),
        postalCode: postalCode.trim(),
        country: country.trim()
      },
      role: 'user' // Default role is user
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return user data without password
    const userData = user.toObject();
    delete userData.password;

    res.status(201).json({
      message: 'User registered successfully',
      user: userData,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: validationErrors.join(', ')
      });
    }

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'User already exists with this email address' 
      });
    }

    res.status(500).json({ 
      message: 'Error registering user. Please try again.',
      error: error.message 
    });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    console.log('Generating JWT token for user:', user.email);
    console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
    console.log('JWT_SECRET length:', process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0);
    
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('Token generated successfully');
    console.log('Token length:', token.length);
    console.log('Token payload:', { userId: user._id, role: user.role });

    // Return user data without password
    const userData = user.toObject();
    delete userData.password;

    res.json({
      message: 'Login successful',
      user: userData,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
};

// Create admin user (protected route)
export const createAdmin = async (req, res) => {
  try {
    // Check if requester is admin
    if (!req.user.isAdmin()) {
      return res.status(403).json({ message: 'Not authorized to create admin users' });
    }

    const { name, email, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new admin user
    const admin = new User({
      name,
      email,
      password,
      role: 'admin'
    });

    await admin.save();

    // Return admin data without password
    const adminData = admin.toObject();
    delete adminData.password;

    res.status(201).json({
      message: 'Admin user created successfully',
      user: adminData
    });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({ message: 'Error creating admin user', error: error.message });
  }
};

// Get current user profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const { name, phone, address, city, state, postalCode, country } = req.body;
    
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user fields
    user.name = name || user.name;
    user.phone = phone || user.phone;
    if (address) user.address.street = address;
    if (city) user.address.city = city;
    if (state) user.address.state = state;
    if (postalCode) user.address.postalCode = postalCode;
    if (country) user.address.country = country;

    await user.save();

    // Return updated user data without password
    const userData = user.toObject();
    delete userData.password;

    res.json({
      message: 'Profile updated successfully',
      user: userData
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
};

// Change password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Error changing password', error: error.message });
  }
};

// Admin: Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

// Admin: Get user by ID
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
};

// Admin: Update user
export const updateUser = async (req, res) => {
  try {
    const { name, email, phone, role, isActive } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user fields
    user.name = name || user.name;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    user.role = role || user.role;
    user.isActive = isActive !== undefined ? isActive : user.isActive;

    await user.save();

    // Return updated user data without password
    const userData = user.toObject();
    delete userData.password;

    res.json({
      message: 'User updated successfully',
      user: userData
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
};

// Admin: Delete user
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent deleting the last admin
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({ message: 'Cannot delete the last admin user' });
      }
    }

    await user.deleteOne();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
};

// Admin: Get system statistics
export const getSystemStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const adminUsers = await User.countDocuments({ role: 'admin' });
    const regularUsers = await User.countDocuments({ role: 'user' });

    res.json({
      totalUsers,
      activeUsers,
      adminUsers,
      regularUsers
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Error fetching statistics', error: error.message });
  }
};
  
// Delete current user profile
import crypto from 'crypto';
import nodemailer from 'nodemailer';

export const sendDeleteAccountOtp = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetToken = otp;
    user.resetTokenExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // Debug: print SMTP credentials
    console.log('SMTP_USER:', process.env.SMTP_USER);
    console.log('SMTP_PASS:', process.env.SMTP_PASS);

    // Send OTP via email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: user.email,
      subject: 'Your OTP for Account Deletion',
      html: `
        <div style="background:#fffbe6;padding:24px;border-radius:12px;border:1px solid #ffe58f;font-family:sans-serif;max-width:420px;margin:auto;">
          <h2 style="color:#d97706;margin-bottom:8px;">Account Deletion Request</h2>
          <p style="color:#333;font-size:16px;">We received a request to delete your Prime Dispatcher account.</p>
          <p style="color:#333;font-size:16px;">To confirm, please use the following OTP:</p>
          <div style="font-size:32px;font-weight:bold;color:#f59e0b;background:#fff3cd;padding:12px 0;border-radius:8px;text-align:center;letter-spacing:6px;margin:16px 0;">
            <span>${otp}</span>
          </div>
          <p style="color:#666;font-size:14px;">If you did not request this, please ignore this email. Your account will not be deleted without confirmation.</p>
          <div style="margin-top:24px;text-align:center;">
            <span style="color:#b45309;font-size:13px;">Prime Dispatcher Team</span>
          </div>
        </div>
      `,
    });

    res.json({ message: 'OTP sent to your email' });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ message: 'Error sending OTP', error: error.message });
  }
};

export const deleteProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const { password, otp } = req.body;
    // If password is provided, verify it
    if (password) {
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Incorrect password' });
      }
    } else if (otp) {
      // If OTP is provided, verify it
      if (!user.resetToken || !user.resetTokenExpiry) {
        return res.status(400).json({ message: 'No OTP requested' });
      }
      if (user.resetToken !== otp) {
        return res.status(401).json({ message: 'Invalid OTP' });
      }
      if (user.resetTokenExpiry < Date.now()) {
        return res.status(401).json({ message: 'OTP expired' });
      }
      // Clear OTP after use
      user.resetToken = undefined;
      user.resetTokenExpiry = undefined;
      await user.save();
    } else {
      return res.status(400).json({ message: 'Password or OTP required' });
    }
    // Anonymize all shipments where this user is sender or receiver
    const userEmail = user.email;
    await user.deleteOne();
    await import('../models/tracking.model.js').then(async ({ default: Tracking }) => {
      await Tracking.updateMany(
        { 'sender.email': userEmail },
        {
          $set: {
            'sender.name': 'Deleted User',
            'sender.email': null,
            'sender.phone': null
          }
        }
      );
      await Tracking.updateMany(
        { 'receiver.email': userEmail },
        {
          $set: {
            'receiver.name': 'Deleted User',
            'receiver.email': null,
            'receiver.phone': null
          }
        }
      );
    });
    res.json({ message: 'Account deleted and associated shipments anonymized successfully' });
  } catch (error) {
    console.error('Delete profile error:', error);
    res.status(500).json({ message: 'Error deleting account', error: error.message });
  }
};

// Admin login
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if user is admin
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized as admin' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return user data without password
    const userData = user.toObject();
    delete userData.password;

    res.json({
      message: 'Admin login successful',
      user: userData,
      token
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Error logging in as admin', error: error.message });
  }
};

// Create first admin user (special function for initial setup)
export const createFirstAdmin = async (req, res) => {
  try {
    // Check if any admin exists
    const adminExists = await User.findOne({ role: 'admin' });
    if (adminExists) {
      return res.status(403).json({ 
        message: 'Admin user already exists. Please use the admin creation endpoint instead.' 
      });
    }

    const { name, email, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new admin user
    const admin = new User({
      name,
      email,
      password,
      role: 'admin',
      isActive: true
    });

    await admin.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: admin._id, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return admin data without password
    const adminData = admin.toObject();
    delete adminData.password;

    res.status(201).json({
      message: 'First admin user created successfully',
      user: adminData,
      token
    });
  } catch (error) {
    console.error('Create first admin error:', error);
    res.status(500).json({ message: 'Error creating first admin user', error: error.message });
  }
};