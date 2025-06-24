import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema({
    complaintId: {
        type: String,
        required: true,
        unique: true
    },
    category: {
        type: String,
        required: true,
        enum: [
            'delivery_delay',
            'damaged_package', 
            'wrong_address',
            'poor_service',
            'payment_issue',
            'other'
        ]
    },
    userInfo: {
        name: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        },
        email: {
            type: String,
            default: ''
        },
        trackingId: {
            type: String,
            default: ''
        }
    },
    description: {
        type: String,
        required: true
    },
    messages: [{
        type: String
    }],
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    status: {
        type: String,
        enum: ['pending', 'in_progress', 'resolved', 'closed'],
        default: 'pending'
    },
    source: {
        type: String,
        enum: ['chatbot', 'web', 'phone', 'email'],
        default: 'chatbot'
    },
    adminNotes: {
        type: String,
        default: ''
    },
    assignedTo: {
        type: String,
        default: ''
    },
    submittedAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    resolvedAt: {
        type: Date
    },
    estimatedResolution: {
        type: Date
    }
}, {
    timestamps: true
});

// Index for better query performance
complaintSchema.index({ complaintId: 1 });
complaintSchema.index({ status: 1 });
complaintSchema.index({ category: 1 });
complaintSchema.index({ priority: 1 });
complaintSchema.index({ submittedAt: -1 });

export default mongoose.model('Complaint', complaintSchema);