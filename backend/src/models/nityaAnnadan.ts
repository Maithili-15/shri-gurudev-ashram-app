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

  // ─── Annadan Redesign Fields (all optional for backward compatibility) ──────
  bookingPurpose: {
    type: String,
    enum: ['birthday', 'smruti', 'pitrayartha', 'general'],
    default: null,
  },
  beneficiaryName: { type: String, default: null },
  sponsorName: { type: String, default: null },
  sponsorPhone: { type: String, default: null },
  email: { type: String, default: null },
  address: { type: String, default: null },
  identityType: {
    type: String,
    enum: ['aadhaar', 'pan'],
    default: null,
  },
  identityNumber: { type: String, default: null },       // Encrypted at rest (AES-256-GCM)
  identityNumberMasked: { type: String, default: null },  // XXXX-XXXX-1234 / XXXXX1234X
  isRecurring: { type: Boolean, default: false },
  recurringFrequency: {
    type: String,
    enum: ['yearly'],
    default: null,
  },
  recurringStartDate: { type: String, default: null },
  recurringEndDate: { type: String, default: null },
  nextExecutionDate: { type: String, default: null },     // For future cron scheduler
  lastExecutedDate: { type: String, default: null },      // For future cron scheduler
}, { timestamps: true })

nityaAnnadanBookingSchema.index({ userId: 1, createdAt: -1 })
nityaAnnadanBookingSchema.index({ sevaDate: 1, status: 1 })
nityaAnnadanBookingSchema.index({ isRecurring: 1, nextExecutionDate: 1 }) // Future scheduler query

export const NityaAnnadanBooking = mainDb.models.NityaAnnadanBooking ?? mainDb.model('NityaAnnadanBooking', nityaAnnadanBookingSchema)

