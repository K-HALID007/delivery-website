import express from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
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

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/admin/login', adminLogin);
router.post('/admin/first', createFirstAdmin);

// Protected routes
router.use(verifyToken);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/profile/send-delete-otp', sendDeleteAccountOtp);
router.delete('/profile', deleteProfile);
router.put('/change-password', changePassword);

export default router;

