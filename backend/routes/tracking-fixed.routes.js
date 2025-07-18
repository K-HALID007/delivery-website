import express from 'express';
import { verifyToken, isAdmin } from '../middleware/auth.middleware.js';
import { uploadRefundImages, handleUploadError } from '../middleware/upload.middleware.js';
import {
  verifyTracking,
  addTracking,
  updateTracking,
  getTrackingByEmail,
  getUserShipments,
  cancelTracking,
  requestRefund,
  submitComplaint,
  deleteTracking
} from '../controllers/tracking.controller.js';

import { requestRefundSimple } from '../controllers/tracking-simple.controller.js';

const router = express.Router();

// Public routes
router.post('/verify', verifyTracking);
router.get('/email/:email', getTrackingByEmail);

// Protected routes
router.use(verifyToken);
router.post('/add', addTracking);
router.put('/:trackingId', updateTracking);

// Get user's shipments (protected route)
router.get('/user', getUserShipments);

// Cancel a shipment (protected route - user can cancel their own orders)
router.put('/cancel/:trackingId', cancelTracking);

// Request refund for delivered shipment (with image upload support)
router.put('/refund/:trackingId', uploadRefundImages, handleUploadError, requestRefund);

// Submit complaint for shipment (protected route)
router.post('/complaint/:trackingId', submitComplaint);

// Add this route for deleting a shipment (Admin only)
router.delete('/delete/:trackingId', deleteTracking);

export default router;