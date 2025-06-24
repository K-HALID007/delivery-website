import Complaint from '../models/complaint.model.js';
import { sendDeliveryEmail } from '../utils/email.js';

/**
 * Submit complaint from chatbot
 */
export const submitChatbotComplaint = async (req, res) => {
    try {
        const {
            category,
            userInfo,
            messages,
            description,
            priority = 'medium'
        } = req.body;

        // Validate required fields
        if (!category || !userInfo || !userInfo.name || !userInfo.phone) {
            return res.status(400).json({
                success: false,
                message: 'Category, name, and phone are required'
            });
        }

        // Create complaint
        const complaint = new Complaint({
            complaintId: `CMP-${Date.now()}`,
            category,
            userInfo: {
                name: userInfo.name,
                phone: userInfo.phone,
                email: userInfo.email || '',
                trackingId: userInfo.trackingId || ''
            },
            description: description || messages?.join(' | ') || '',
            messages: messages || [],
            priority,
            status: 'pending',
            source: 'chatbot',
            submittedAt: new Date(),
            estimatedResolution: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
        });

        await complaint.save();

        // Send confirmation email to customer if email provided
        if (userInfo.email) {
            try {
                await sendDeliveryEmail(
                    userInfo.email,
                    `Complaint Received - ID: ${complaint.complaintId}`,
                    `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #f59e0b;">Complaint Received</h2>
                        <p>Hello ${userInfo.name},</p>
                        <p>We have received your complaint and our team will review it shortly.</p>
                        <div style="background: #fffbeb; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #f59e0b;">
                            <p><strong>Complaint ID:</strong> ${complaint.complaintId}</p>
                            <p><strong>Category:</strong> ${category}</p>
                            <p><strong>Priority:</strong> ${priority}</p>
                            <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
                        </div>
                        <p>Our customer support team will contact you within 24 hours.</p>
                        <p>Thank you for your feedback!</p>
                        <div style="margin-top: 20px; padding: 16px; background: #f3f4f6; border-radius: 8px;">
                            <p><strong>Contact Information:</strong></p>
                            <p>📞 Phone: +92-XXX-XXXXXXX</p>
                            <p>📧 Email: support@primedispatcher.com</p>
                            <p>⏰ Hours: 9 AM - 6 PM (Mon-Sat)</p>
                        </div>
                    </div>
                    `
                );
            } catch (emailError) {
                console.error('Failed to send complaint confirmation email:', emailError);
            }
        }

        // Send SMS notification if phone provided
        // You can implement SMS service here using Twilio

        res.json({
            success: true,
            complaintId: complaint.complaintId,
            message: 'Complaint submitted successfully',
            estimatedResponse: '24 hours'
        });

    } catch (error) {
        console.error('Error submitting chatbot complaint:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit complaint',
            error: error.message
        });
    }
};

/**
 * Get all complaints for admin
 */
export const getAllComplaints = async (req, res) => {
    try {
        const {
            status = 'all',
            priority = 'all',
            category = 'all',
            page = 1,
            limit = 20
        } = req.query;

        const filter = {};
        
        if (status !== 'all') filter.status = status;
        if (priority !== 'all') filter.priority = priority;
        if (category !== 'all') filter.category = category;

        const complaints = await Complaint.find(filter)
            .sort({ submittedAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Complaint.countDocuments(filter);

        res.json({
            success: true,
            complaints,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit)
        });

    } catch (error) {
        console.error('Error fetching complaints:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch complaints',
            error: error.message
        });
    }
};

/**
 * Update complaint status
 */
export const updateComplaintStatus = async (req, res) => {
    try {
        const { complaintId } = req.params;
        const { status, adminNotes, assignedTo } = req.body;

        const complaint = await Complaint.findOneAndUpdate(
            { complaintId },
            {
                status,
                adminNotes: adminNotes || complaint.adminNotes,
                assignedTo: assignedTo || complaint.assignedTo,
                updatedAt: new Date(),
                ...(status === 'resolved' && { resolvedAt: new Date() })
            },
            { new: true }
        );

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: 'Complaint not found'
            });
        }

        // Send status update email to customer
        if (complaint.userInfo.email) {
            try {
                const statusMessages = {
                    'pending': 'Your complaint is being reviewed',
                    'in_progress': 'We are working on resolving your complaint',
                    'resolved': 'Your complaint has been resolved',
                    'closed': 'Your complaint has been closed'
                };

                await sendDeliveryEmail(
                    complaint.userInfo.email,
                    `Complaint Update - ${complaint.complaintId}`,
                    `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #10b981;">Complaint Status Update</h2>
                        <p>Hello ${complaint.userInfo.name},</p>
                        <p>${statusMessages[status] || 'Your complaint status has been updated'}.</p>
                        <div style="background: #f0fdf4; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #10b981;">
                            <p><strong>Complaint ID:</strong> ${complaint.complaintId}</p>
                            <p><strong>Status:</strong> ${status.toUpperCase()}</p>
                            <p><strong>Updated:</strong> ${new Date().toLocaleString()}</p>
                            ${adminNotes ? `<p><strong>Notes:</strong> ${adminNotes}</p>` : ''}
                        </div>
                        <p>Thank you for your patience!</p>
                    </div>
                    `
                );
            } catch (emailError) {
                console.error('Failed to send status update email:', emailError);
            }
        }

        res.json({
            success: true,
            message: 'Complaint status updated successfully',
            complaint
        });

    } catch (error) {
        console.error('Error updating complaint status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update complaint status',
            error: error.message
        });
    }
};

/**
 * Get complaint statistics
 */
export const getComplaintStats = async (req, res) => {
    try {
        const total = await Complaint.countDocuments();
        const pending = await Complaint.countDocuments({ status: 'pending' });
        const inProgress = await Complaint.countDocuments({ status: 'in_progress' });
        const resolved = await Complaint.countDocuments({ status: 'resolved' });
        const closed = await Complaint.countDocuments({ status: 'closed' });
        const highPriority = await Complaint.countDocuments({ priority: 'high' });

        // Get complaints by category
        const categoryStats = await Complaint.aggregate([
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Get recent complaints (last 7 days)
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const recentComplaints = await Complaint.countDocuments({
            submittedAt: { $gte: sevenDaysAgo }
        });

        res.json({
            success: true,
            stats: {
                total,
                pending,
                inProgress,
                resolved,
                closed,
                highPriority,
                recentComplaints,
                resolutionRate: total > 0 ? ((resolved + closed) / total * 100).toFixed(1) : 0,
                categoryBreakdown: categoryStats.reduce((acc, item) => {
                    acc[item._id] = item.count;
                    return acc;
                }, {})
            }
        });

    } catch (error) {
        console.error('Error fetching complaint stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch complaint statistics',
            error: error.message
        });
    }
};