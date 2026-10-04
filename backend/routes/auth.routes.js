import express from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import { createRateLimiter } from '../utils/rateLimit.js';
import {
  register,
  login,
  adminLogin,
  createFirstAdmin,
  getProfile,
  updateProfile,
  changePassword,
  deleteProfile,
  sendDeleteAccountOtp
} from '../controllers/auth.controller.js';

const router = express.Router();
const loginLimiter = createRateLimiter({ keyPrefix: 'auth-login', limit: 10, windowMs: 15 * 60 * 1000 });
const adminLoginLimiter = createRateLimiter({ keyPrefix: 'admin-login', limit: 8, windowMs: 15 * 60 * 1000 });
const registrationLimiter = createRateLimiter({ keyPrefix: 'auth-register', limit: 5, windowMs: 60 * 60 * 1000 });

// Public routes
router.post('/register', registrationLimiter, register);
router.post('/login', loginLimiter, login);
router.post('/admin/login', adminLoginLimiter, adminLogin);
router.post('/admin/first', createFirstAdmin);

// Protected routes
router.use(verifyToken);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/profile/send-delete-otp', sendDeleteAccountOtp);
router.delete('/profile', deleteProfile);
router.put('/change-password', changePassword);

export default router;

