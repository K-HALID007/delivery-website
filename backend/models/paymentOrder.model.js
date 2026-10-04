import mongoose from 'mongoose';

const paymentOrderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  amount: { type: Number, required: true, min: 1 },
  shipmentData: { type: mongoose.Schema.Types.Mixed, required: true },
  paymentSessionId: String,
  status: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  trackingId: String,
  paymentId: String
}, { timestamps: true });

export default mongoose.model('PaymentOrder', paymentOrderSchema);
