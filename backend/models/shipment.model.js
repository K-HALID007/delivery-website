import mongoose from 'mongoose';

const shipmentSchema = new mongoose.Schema({
  trackingNumber: {
    type: String,
    required: true,
    unique: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Processing', 'In Transit', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },
  origin: {
    type: String,
    required: true
  },
  destination: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  weight: {
    type: Number,
    required: true
  },
  description: {
    type: String
  },
  estimatedDelivery: {
    type: Date
  },
  actualDelivery: {
    type: Date
  },
  trackingHistory: [{
    status: {
      type: String,
      required: true
    },
    location: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    description: String
  }],
  payment: {
    method: {
      type: String,
      enum: ['UPI', 'COD', 'CARD'],
      required: true
    },
    status: {
      type: String,
      enum: ['Pending', 'Completed', 'Failed', 'Refunded'],
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
    }
  }
}, { timestamps: true });

// Generate tracking number before saving
shipmentSchema.pre('save', async function(next) {
  if (this.isNew) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.trackingNumber = `TRK${year}${month}${random}`;
  }
  next();
});

const Shipment = mongoose.model('Shipment', shipmentSchema);

export default Shipment; 