import crypto from 'crypto'
import { Router, Request, Response, NextFunction } from 'express'
import { HttpError } from '../errors'
import { AuthenticatedRequest, requireAuth } from '../middleware/auth'
import { NityaAnnadanBooking } from '../models/nityaAnnadan'
import { razorpay, razorpayKeySecret } from '../services/razorpay'

export const annadanRouter = Router()

function generateBookingReference(): string {
  const random = crypto.randomBytes(3).toString('hex').toUpperCase()
  return `ANN-${random}`
}

export function formatBooking(doc: any) {
  return {
    id: String(doc._id),
    bookingReference: doc.bookingReference,
    userId: doc.userId ?? null,
    sevaType: 'annadan',
    sevaDate: doc.sevaDate,
    fullName: doc.fullName,
    phoneNumber: doc.phoneNumber,
    totalAmount: doc.totalAmount,
    status: doc.status,
    notes: doc.notes ?? null,
    razorpayOrderId: doc.razorpayOrderId ?? null,
    razorpayPaymentId: doc.razorpayPaymentId ?? null,
    createdAt: doc.createdAt ? (doc.createdAt.toISOString ? doc.createdAt.toISOString() : doc.createdAt) : new Date().toISOString(),
    updatedAt: doc.updatedAt ? (doc.updatedAt.toISOString ? doc.updatedAt.toISOString() : doc.updatedAt) : new Date().toISOString(),
  }
}

// ─── Create Nitya Annadan Booking ─────────────────────────────────────────────
export async function createAnnadanBooking(request: Request, response: Response, next: NextFunction) {
  try {
    const {
      sevaType,
      sevaDate,
      fullName,
      phoneNumber,
      totalAmount,
      notes,
    } = request.body ?? {}

    if (!sevaDate || !fullName || !phoneNumber || !totalAmount) {
      throw new HttpError(400, 'Missing required seva fields')
    }

    const numericAmount = Number(totalAmount)
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      throw new HttpError(400, 'Invalid total amount')
    }

    const bookingReference = generateBookingReference()
    const userId = (request as AuthenticatedRequest).userId

    const booking = await NityaAnnadanBooking.create({
      bookingReference,
      userId,
      sevaType: 'annadan',
      sevaDate,
      fullName: String(fullName).trim(),
      phoneNumber: String(phoneNumber).trim(),
      totalAmount: numericAmount,
      status: 'payment_pending',
      notes: notes ? String(notes).trim() : null,
    })

    response.status(201).json({
      success: true,
      data: formatBooking(booking),
    })
  } catch (error) {
    next(error)
  }
}

// ─── Get Nitya Annadan Pricing ────────────────────────────────────────────────
export async function getAnnadanPricing(_request: Request, response: Response, next: NextFunction) {
  try {
    const annadanAmount = Number(process.env.ANNADAN_SEVA_PRICE ?? 2100)
    response.json({
      success: true,
      pricing: {
        annadan: annadanAmount,
      },
    })
  } catch (error) {
    next(error)
  }
}

// ─── Canonical Availability Check (Single Date or Monthly) ──────────────────────
export async function getAnnadanAvailability(request: Request, response: Response, next: NextFunction) {
  try {
    const month = request.query.month as string | undefined
    const date = request.query.date as string | undefined

    const defaultCapacity = 100
    const capacity = Number(process.env.SEVA_CAPACITY_ANNADAN ?? defaultCapacity)

    // Handle Month Availability Map Query
    if (month && /^\d{4}-\d{2}$/.test(month)) {
      const [yearStr, monthStr] = month.split('-')
      const year = Number(yearStr)
      const monthNum = Number(monthStr)
      const startDate = `${month}-01`
      const lastDayNum = new Date(year, monthNum, 0).getDate()
      const endDate = `${month}-${String(lastDayNum).padStart(2, '0')}`

      const bookings = await NityaAnnadanBooking.find({
        sevaDate: { $gte: startDate, $lte: endDate },
        status: { $in: ['paid', 'payment_pending'] },
      }).select('sevaDate status').lean()

      const countsByDate: Record<string, number> = {}
      for (const b of bookings) {
        if (b.sevaDate) {
          countsByDate[b.sevaDate] = (countsByDate[b.sevaDate] || 0) + 1
        }
      }

      const availabilityMap: Record<string, { booked: number; capacity: number; remaining: number; available: boolean }> = {}

      for (let day = 1; day <= lastDayNum; day++) {
        const dateKey = `${month}-${String(day).padStart(2, '0')}`
        const booked = countsByDate[dateKey] || 0
        const remaining = Math.max(0, capacity - booked)
        availabilityMap[dateKey] = {
          booked,
          capacity,
          remaining,
          available: remaining > 0,
        }
      }

      response.json({
        success: true,
        type: 'annadan',
        month,
        availability: availabilityMap,
      })
      return
    }

    // Handle Single Date Availability Query
    if (date) {
      const count = await NityaAnnadanBooking.countDocuments({
        sevaDate: date,
        status: { $in: ['paid', 'payment_pending'] },
      })

      const availableSeats = capacity - count

      response.json({
        available: availableSeats > 0,
        remainingSeats: Math.max(0, availableSeats),
      })
      return
    }

    throw new HttpError(400, 'Date or month parameter is required')
  } catch (error) {
    next(error)
  }
}

// ─── Create Razorpay Order ───────────────────────────────────────────────────
export async function createAnnadanOrder(request: Request, response: Response, next: NextFunction) {
  try {
    const { bookingId } = request.body ?? {}

    if (!bookingId || typeof bookingId !== 'string' || !bookingId.trim()) {
      throw new HttpError(400, 'bookingId is required')
    }

    const booking = await NityaAnnadanBooking.findById(bookingId)
    if (!booking) {
      throw new HttpError(404, 'Seva booking not found')
    }

    const userId = (request as AuthenticatedRequest).userId
    if (booking.userId && booking.userId !== userId) {
      throw new HttpError(403, 'Booking does not belong to the authenticated user')
    }

    if (booking.status !== 'payment_pending') {
      throw new HttpError(400, 'Booking is not pending payment')
    }

    const amountInPaise = Math.round(Number(booking.totalAmount) * 100)

    if (booking.razorpayOrderId) {
      response.json({
        order: {
          id: booking.razorpayOrderId,
          amount: amountInPaise,
          currency: 'INR',
        },
        booking: formatBooking(booking),
      })
      return
    }

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: booking.bookingReference,
      notes: {
        nityaBookingId: String(booking._id),
      },
    })

    booking.razorpayOrderId = order.id
    await booking.save()

    response.json({
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
      },
      booking: formatBooking(booking),
    })
  } catch (error) {
    next(error)
  }
}

// ─── Verify Payment ──────────────────────────────────────────────────────────
export async function verifyAnnadanPayment(request: Request, response: Response, next: NextFunction) {
  try {
    const { bookingId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = request.body ?? {}

    if (!bookingId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      throw new HttpError(400, 'Missing required payment verification fields')
    }

    if (!isValidPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)) {
      throw new HttpError(400, 'Invalid Razorpay signature')
    }

    const booking = await NityaAnnadanBooking.findById(bookingId)
    if (!booking) {
      throw new HttpError(404, 'Seva booking not found')
    }

    const userId = (request as AuthenticatedRequest).userId
    if (booking.userId && booking.userId !== userId) {
      throw new HttpError(403, 'Booking does not belong to the authenticated user')
    }

    if (booking.razorpayOrderId && booking.razorpayOrderId !== razorpay_order_id) {
      throw new HttpError(400, 'Razorpay order does not match this seva booking')
    }

    if (booking.status === 'paid') {
      response.json({ success: true, message: 'Already verified' })
      return
    }

    booking.status = 'paid'
    booking.razorpayPaymentId = razorpay_payment_id
    booking.razorpaySignature = razorpay_signature
    if (!booking.razorpayOrderId) {
      booking.razorpayOrderId = razorpay_order_id
    }
    await booking.save()

    response.json({ success: true })
  } catch (error) {
    next(error)
  }
}

// ─── Upcoming Nitya Annadan Bookings ─────────────────────────────────────────
export async function getUpcomingAnnadan(request: Request, response: Response, next: NextFunction) {
  try {
    const userId = (request as AuthenticatedRequest).userId
    const today = new Date().toISOString().split('T')[0]

    const bookings = await NityaAnnadanBooking.find({
      userId,
      status: { $in: ['paid', 'payment_pending'] },
      sevaDate: { $gte: today },
    }).sort({ sevaDate: 1 }).lean()

    response.json(bookings.map(formatBooking))
  } catch (error) {
    next(error)
  }
}

// ─── Nitya Annadan Booking History ────────────────────────────────────────────
export async function getAnnadanHistory(request: Request, response: Response, next: NextFunction) {
  try {
    const userId = (request as AuthenticatedRequest).userId

    const bookings = await NityaAnnadanBooking.find({ userId })
      .sort({ createdAt: -1 })
      .lean()

    response.json(bookings.map(formatBooking))
  } catch (error) {
    next(error)
  }
}

function isValidPaymentSignature(orderId: string, paymentId: string, signature: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', razorpayKeySecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex')

  return expectedSignature.length === signature.length &&
    crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(signature))
}

// Register routes
annadanRouter.post('/', requireAuth, createAnnadanBooking)
annadanRouter.get('/pricing', getAnnadanPricing)
annadanRouter.get('/availability', getAnnadanAvailability)
annadanRouter.post('/create-order', requireAuth, createAnnadanOrder)
annadanRouter.post('/verify-payment', requireAuth, verifyAnnadanPayment)
annadanRouter.get('/upcoming', requireAuth, getUpcomingAnnadan)
annadanRouter.get('/history', requireAuth, getAnnadanHistory)
