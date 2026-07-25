jest.mock('../services/razorpay', () => ({
  razorpay: {
    orders: {
      create: jest.fn().mockResolvedValue({ id: 'order_test_annadan', amount: 210000, currency: 'INR' }),
    },
  },
  razorpayKeySecret: 'test_secret',
}))

jest.mock('../models/nityaAnnadan', () => ({
  NityaAnnadanBooking: {
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    countDocuments: jest.fn(),
  },
}))

import {
  createAnnadanBooking,
  getAnnadanPricing,
  getAnnadanAvailability,
} from '../routes/annadan'
import { NityaAnnadanBooking } from '../models/nityaAnnadan'

describe('Nitya Annadan Controllers', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.ANNADAN_SEVA_PRICE = '2100'
    process.env.SEVA_CAPACITY_ANNADAN = '100'
  })

  it('getAnnadanPricing returns pricing info', async () => {
    const response = { json: jest.fn() } as any
    const next = jest.fn()

    await getAnnadanPricing({} as any, response, next)

    expect(response.json).toHaveBeenCalledWith({
      success: true,
      pricing: { annadan: 2100 },
    })
    expect(next).not.toHaveBeenCalled()
  })

  it('getAnnadanAvailability returns single date availability', async () => {
    ;(NityaAnnadanBooking.countDocuments as jest.Mock).mockResolvedValue(5)
    const response = { json: jest.fn() } as any
    const next = jest.fn()

    await getAnnadanAvailability({ query: { date: '2026-08-15' } } as any, response, next)

    expect(response.json).toHaveBeenCalledWith({
      available: true,
      remainingSeats: 95,
    })
    expect(next).not.toHaveBeenCalled()
  })

  it('getAnnadanAvailability returns month availability map', async () => {
    ;(NityaAnnadanBooking.find as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue([
          { sevaDate: '2026-08-15', status: 'paid' },
          { sevaDate: '2026-08-15', status: 'paid' },
        ]),
      }),
    })

    const response = { json: jest.fn() } as any
    const next = jest.fn()

    await getAnnadanAvailability({ query: { month: '2026-08' } } as any, response, next)

    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        type: 'annadan',
        month: '2026-08',
      })
    )
    expect(response.json.mock.calls[0][0].availability['2026-08-15']).toEqual({
      booked: 2,
      capacity: 100,
      remaining: 98,
      available: true,
    })
    expect(next).not.toHaveBeenCalled()
  })

  it('createAnnadanBooking creates a new Nitya Annadan booking', async () => {
    const mockDoc = {
      _id: '507f1f77bcf86cd799439011',
      bookingReference: 'ANN-A1B2C3',
      userId: 'test-user-id',
      sevaType: 'annadan',
      sevaDate: '2026-08-15',
      fullName: 'Devotee Test',
      phoneNumber: '9876543210',
      totalAmount: 2100,
      status: 'payment_pending',
      createdAt: '2026-07-25T12:00:00.000Z',
      updatedAt: '2026-07-25T12:00:00.000Z',
    }
    ;(NityaAnnadanBooking.create as jest.Mock).mockResolvedValue(mockDoc)

    const request = {
      userId: 'test-user-id',
      body: {
        sevaType: 'annadan',
        sevaDate: '2026-08-15',
        fullName: 'Devotee Test',
        phoneNumber: '9876543210',
        totalAmount: 2100,
      },
    } as any

    const response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any
    const next = jest.fn()

    await createAnnadanBooking(request, response, next)

    expect(response.status).toHaveBeenCalledWith(201)
    expect(response.json).toHaveBeenCalledWith({
      success: true,
      data: expect.objectContaining({
        bookingReference: 'ANN-A1B2C3',
        sevaType: 'annadan',
        totalAmount: 2100,
      }),
    })
    expect(next).not.toHaveBeenCalled()
  })
})
