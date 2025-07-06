import express from 'express';
import { debugRefund, checkTracking } from '../controllers/debug.controller.js';

const router = express.Router();

// Debug routes
router.get('/refund/:trackingId', debugRefund);
router.get('/tracking/:trackingId', checkTracking);

export default router;