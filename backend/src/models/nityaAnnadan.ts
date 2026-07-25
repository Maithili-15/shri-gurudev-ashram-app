import { Schema } from 'mongoose'
import { mainDb } from '../services/mongo'

const nityaAnnadanBookingSchema = new Schema({
  bookingReference: { type: String, required: true, unique: true, index: true },
  userId: { type: String, default: null, index: true },
  sevaType: { type: String, default: 'annadan' },
  sevaDate: { type: String, required: true, index: true }, // Format: YYYY-MM-DD
  fullName: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  totalAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['payment_pending', 'paid', 'cancelled'],
    default: 'payment_pending',
    index: true,
  },
  notes: { type: String, default: null },
  razorpayOrderId: { type: String, default: null },
  razorpayPaymentId: { type: String, default: null },
  razorpaySignature: { type: String, default: null },
}, { timestamps: true })

nityaAnnadanBookingSchema.index({ userId: 1, createdAt: -1 })
nityaAnnadanBookingSchema.index({ sevaDate: 1, status: 1 })

export const NityaAnnadanBooking = mainDb.models.NityaAnnadanBooking ?? mainDb.model('NityaAnnadanBooking', nityaAnnadanBookingSchema)
