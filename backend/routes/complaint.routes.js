import express from 'express';
import {
    submitChatbotComplaint,
    getAllComplaints,
    updateComplaintStatus,
    getComplaintStats
} from '../controllers/complaint.controller.js';

const router = express.Router();

// Submit complaint from chatbot
router.post('/submit', submitChatbotComplaint);

// Get all complaints (admin)
router.get('/all', getAllComplaints);

// Update complaint status (admin)
router.put('/:complaintId/status', updateComplaintStatus);

// Get complaint statistics (admin)
router.get('/stats', getComplaintStats);

export default router;