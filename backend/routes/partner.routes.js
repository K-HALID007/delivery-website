import express from 'express';
import { verifyPartnerToken } from '../middleware/partner.middleware.js';
import { createRateLimiter } from '../utils/rateLimit.js';
import {
  registerPartner,
  loginPartner,
  getPartnerProfile,
  updatePartnerProfile,
  getPartnerDashboard,
  getPartnerDeliveries,
  updateDeliveryStatus,
  updatePartnerLocation,
  toggleOnlineStatus,
  getPartnerEarnings
} from '../controllers/partner.controller.js';
const router = express.Router();
const partnerLoginLimiter = createRateLimiter({ keyPrefix: 'partner-login', limit: 10, windowMs: 15 * 60 * 1000 });
const partnerRegistrationLimiter = createRateLimiter({ keyPrefix: 'partner-register', limit: 5, windowMs: 60 * 60 * 1000 });

// Public routes
router.post('/register', partnerRegistrationLimiter, registerPartner);
router.post('/login', partnerLoginLimiter, loginPartner);

// Protected routes (require partner authentication)
router.use(verifyPartnerToken);

// Profile routes
router.get('/profile', getPartnerProfile);
router.put('/profile', updatePartnerProfile);

// Dashboard routes
router.get('/dashboard', getPartnerDashboard);
router.get('/deliveries', getPartnerDeliveries);
router.get('/earnings', getPartnerEarnings);

// Delivery management routes
router.put('/deliveries/:trackingId/status', updateDeliveryStatus);

// Location and status routes
router.put('/location', updatePartnerLocation);
router.put('/toggle-online', toggleOnlineStatus);

export default router;
