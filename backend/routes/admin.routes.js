import express from 'express';
import { verifyToken, isAdmin } from '../middleware/auth.middleware.js';
import {
  getDashboardStats,
  getRecentShipments,
  getAllUsers,
  updateUserStatus,
  updateTrackingStatusAdmin,
  getRealtimeAnalytics,
  getRevenueAnalytics,
  getAdminSettings,
  updateAdminSettings,
  getAdminNotifications,
  getReportsData,
  getAllDeliveries,
  getDeliveryDetails,
  updateDeliveryStatus,
  reassignDelivery,
  getDeliveryAnalytics,
  bulkDeliveryActions
} from '../controllers/admin.controller.js';
import {
  getAllPartners,
  getPartnerDetails,
  updatePartnerStatus,
  assignDeliveryToPartner,
  getPartnerAnalytics,
  bulkPartnerActions
} from '../controllers/admin.partners.controller.js';
import {
  getSettings,
  updateSettings,
  resetSettings,
  getSettingCategory,
  updateSettingCategory,
  testEmailConfig,
  testSmsConfig
} from '../controllers/settings.controller.js';
import {
  getAllRefunds,
  getAllComplaints,
  getRefundDetails,
  approveRefund,
  rejectRefund,
  resolveComplaint
} from '../controllers/admin.refund.controller.js';
import {
  getAdminDashboard,
  getRefundAnalytics
} from '../controllers/admin.dashboard.controller.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(verifyToken);
router.use(isAdmin);

router.get('/summary', getDashboardStats);
router.get('/shipments/trends', getRecentShipments); // For now, use recent shipments as chart data
router.get('/shipments/recent', getRecentShipments); // Explicit recent shipments endpoint
router.get('/users', getAllUsers);
router.patch('/users/:userId/status', updateUserStatus);
router.patch('/shipments/:trackingId/status', updateTrackingStatusAdmin);

// Real-time analytics endpoints
router.get('/analytics/realtime', getRealtimeAnalytics);
router.get('/analytics/revenue', getRevenueAnalytics);

// Settings endpoints (new enhanced settings)
router.get('/settings', getSettings);
router.put('/settings', updateSettings);
router.post('/settings/reset', resetSettings);
router.get('/settings/:category', getSettingCategory);
router.put('/settings/:category', updateSettingCategory);
router.post('/settings/test-email', testEmailConfig);
router.post('/settings/test-sms', testSmsConfig);

// Legacy settings endpoints (keep for backward compatibility)
router.get('/settings/legacy', getAdminSettings);
router.put('/settings/legacy', updateAdminSettings);

// Notifications endpoints
router.get('/notifications', getAdminNotifications);

// Dashboard and Analytics endpoints
router.get('/dashboard', getAdminDashboard);
router.get('/analytics/refunds', getRefundAnalytics);

// Reports endpoints
router.get('/reports', getReportsData);

// Partner management endpoints
router.get('/partners', getAllPartners);
router.get('/partners/:partnerId', getPartnerDetails);
router.put('/partners/:partnerId/status', updatePartnerStatus);
router.post('/partners/assign-delivery', assignDeliveryToPartner);
router.get('/partners/analytics', getPartnerAnalytics);
router.post('/partners/bulk-actions', bulkPartnerActions);

// Delivery management endpoints
router.get('/deliveries', getAllDeliveries);
router.get('/deliveries/:trackingId', getDeliveryDetails);
router.put('/deliveries/:trackingId/status', updateDeliveryStatus);
router.put('/deliveries/:trackingId/reassign', reassignDelivery);
router.get('/deliveries/analytics/overview', getDeliveryAnalytics);
router.post('/deliveries/bulk-actions', bulkDeliveryActions);

// Refund and Complaint management endpoints
router.get('/refunds', getAllRefunds);
router.get('/refunds/:trackingId', getRefundDetails);
router.get('/complaints', getAllComplaints);
router.put('/refund/:trackingId/approve', approveRefund);
router.put('/refund/:trackingId/reject', rejectRefund);
router.put('/complaint/:trackingId/:complaintId/resolve', resolveComplaint);

export default router;
