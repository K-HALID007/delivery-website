import express from 'express';
import { verifyToken, isAdmin } from '../middleware/auth.middleware.js';
import { uploadRefundImages, handleUploadError } from '../middleware/upload.middleware.js';
import { createRateLimiter } from '../utils/rateLimit.js';
import {
  verifyTracking,
  addTracking,
  updateTracking,
  getTrackingByEmail,
  getUserShipments,
  cancelTracking,
  requestRefund,
  cancelRefund,
  submitComplaint,
  deleteTracking,
  downloadInvoice
} from '../controllers/tracking.controller.js';

const router = express.Router();
const publicTrackingLimiter = createRateLimiter({ keyPrefix: 'public-tracking', limit: 30, windowMs: 15 * 60 * 1000 });

// Public routes
router.post('/verify', publicTrackingLimiter, verifyTracking);
router.get('/email/:email', verifyToken, getTrackingByEmail);
router.get('/invoice/:trackingId', verifyToken, downloadInvoice);

// Protected routes
router.use(verifyToken);
router.post('/add', addTracking);
router.put('/:trackingId', isAdmin, updateTracking);

// Get user's shipments (protected route)
router.get('/user', getUserShipments);

// Cancel a shipment (protected route - user can cancel their own orders)
router.put('/cancel/:trackingId', cancelTracking);

// Request refund for delivered shipment (with image upload support)
router.put('/refund/:trackingId', uploadRefundImages, handleUploadError, requestRefund);

// Cancel a refund request (user can cancel their own refund requests)
router.put('/refund/cancel/:trackingId', cancelRefund);

// Submit complaint for shipment (protected route)
router.post('/complaint/:trackingId', submitComplaint);

// Add this route for deleting a shipment (Admin only)
router.delete('/delete/:trackingId', isAdmin, deleteTracking);

export default router;
