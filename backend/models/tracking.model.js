import mongoose from 'mongoose';

const trackingSchema = new mongoose.Schema({
  trackingId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  sender: {
    name: { type: String, required: true },
    email: { type: String },
    phone: { type: String }
  },
  receiver: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true }
  },
  origin: {
    type: String,
  },
  destination: {
    type: String,
  },
  status: {
    type: String,
    default: 'Pending',
  },
  currentLocation: {
    type: String,
    default: 'Not Updated',
  },
  packageDetails: {
    type: {
      type: String,
      required: true
    },
    weight: {
      type: Number,
      required: true
    },
    dimensions: {
      length: { type: Number, required: true },
      width: { type: Number, required: true },
      height: { type: Number, required: true }
    },
    description: String,
    specialInstructions: String
  },
  history: [
    {
      status: String,
      location: String,
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  // Partner Assignment
  assignedPartner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Partner'
  },
  partnerEarnings: {
    type: Number,
    default: 0
  },
  assignedAt: {
    type: Date
  },
  pickedUpAt: {
    type: Date
  },
  deliveredAt: {
    type: Date
  },
  // Status History with more details
  statusHistory: [{
    status: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    location: String,
    notes: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'statusHistory.updatedByModel'
    },
    updatedByModel: {
      type: String,
      enum: ['User', 'Partner', 'Admin']
    }
  }],
  revenue: {
    type: Number,
    default: 0,
  },
  payment: {
    method: {
      type: String,
      enum: ['UPI', 'COD', 'CARD'],
      required: true
    },
    status: {
      type: String,
      enum: ['Pending', 'Completed', 'Failed', 'Refunded', 'Cancelled', 'Refund Requested', 'Refund Rejected'],
      default: 'Pending'
    },
    amount: {
      type: Number,
      required: true
    },
    transactionId: {
      type: String,
      sparse: true // Only required for UPI payments
    },
    upiId: {
      type: String,
      required: function() {
        return this.payment.method === 'UPI';
      }
    },
    paidAt: {
      type: Date
    },
    refundedAt: {
      type: Date
    },
    refundRequestedAt: {
      type: Date
    },
    refundReason: {
      type: String
    },
    refundCategory: {
      type: String
    },
    refundDescription: {
      type: String
    },
    expectedRefundAmount: {
      type: Number
    },
    refundMethod: {
      type: String
    },
    refundUrgency: {
      type: String
    },
    refundImages: [{
      filename: String,
      originalName: String,
      mimetype: String,
      size: Number,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }],
    adminResponse: {
      type: String
    },
    refundRejectedAt: {
      type: Date
    }
  },
  // Complaints system
  complaints: [{
    complaint: {
      type: String,
      required: true
    },
    category: {
      type: String
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },
    partnerRating: {
      type: Number,
      min: 1,
      max: 5
    },
    partnerFeedback: {
      type: String
    },
    deliveryIssues: [{
      type: String
    }],
    contactAttempts: {
      type: String
    },
    expectation: {
      type: String
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    submittedByEmail: {
      type: String,
      required: true
    },
    submittedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
      default: 'Open'
    },
    adminResponse: {
      type: String
    },
    resolvedAt: {
      type: Date
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    }
  }],
}, {
  timestamps: true,
});

export default mongoose.model('Tracking', trackingSchema);
