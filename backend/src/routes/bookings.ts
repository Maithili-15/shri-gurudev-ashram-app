import { Router } from 'express'
import { HttpError } from '../errors'
import { AuthenticatedRequest, requireAuth } from '../middleware/auth'
import { createNotification } from '../services/notifications'
import { NotificationType } from '../constants/notifications'
import { supabaseAdmin } from '../services/supabaseAdmin'
import { logError, logInfo } from '../utils/logger'

export const bookingsRouter = Router()

type CreateBookingPassengerInput = {
  fullName: string
  dob: string
  gender: string
  phone: string
  address: string
  aadhaarNumber: string
  aadhaarImagePath?: string
  selfieImagePath?: string
}

type CreateBookingBody = {
  packageId?: string
  travelerCount?: number
  specialNotes?: string
  transportType?: string
  busType?: string
  roomType?: string
  passengers?: CreateBookingPassengerInput[]
  additionalSevaType?: string
  additionalSevaDate?: string
  additionalSevaPackageId?: string
}

bookingsRouter.post('/', requireAuth, async (request, response, next) => {
  try {
    const {
      packageId,
      travelerCount,
      specialNotes,
      transportType,
      busType,
      roomType,
      passengers,
      additionalSevaType,
      additionalSevaDate,
      additionalSevaPackageId,
    } = request.body as CreateBookingBody

    // 1. Required fields and empty value checks
    if (!packageId || typeof packageId !== 'string' || !packageId.trim()) {
      throw new HttpError(400, 'packageId is required and cannot be empty')
    }

    if (travelerCount === undefined || typeof travelerCount !== 'number' || !Number.isInteger(travelerCount) || travelerCount < 1 || travelerCount > 20) {
      throw new HttpError(400, 'travelerCount must be a positive integer between 1 and 20')
    }

    if (!Array.isArray(passengers) || passengers.length !== travelerCount) {
      throw new HttpError(400, 'passengers array must be provided and its length must match travelerCount')
    }

    if (!transportType || typeof transportType !== 'string' || !transportType.trim()) {
      throw new HttpError(400, 'transportType is required and cannot be empty')
    }

    if (!roomType || typeof roomType !== 'string' || !roomType.trim()) {
      throw new HttpError(400, 'roomType is required and cannot be empty')
    }

    // 2. Validate passengers
    const phoneRegex = /^\d{10}$/
    const aadhaarRegex = /^\d{12}$/
    const today = new Date()

    for (let i = 0; i < passengers.length; i++) {
      const p = passengers[i]
      if (!p.fullName || typeof p.fullName !== 'string' || !p.fullName.trim()) {
        throw new HttpError(400, `Passenger ${i + 1}: fullName is required`)
      }
      if (!p.phone || typeof p.phone !== 'string' || !phoneRegex.test(p.phone)) {
        throw new HttpError(400, `Passenger ${i + 1}: phone must be a valid 10-digit number`)
      }
      if (!p.dob || typeof p.dob !== 'string' || !p.dob.trim()) {
        throw new HttpError(400, `Passenger ${i + 1}: dob is required`)
      }
      if (!p.address || typeof p.address !== 'string' || !p.address.trim()) {
        throw new HttpError(400, `Passenger ${i + 1}: address is required`)
      }
      if (!p.gender || !['male', 'female', 'other'].includes(p.gender)) {
        throw new HttpError(400, `Passenger ${i + 1}: gender must be male, female, or other`)
      }
      if (!p.aadhaarNumber || typeof p.aadhaarNumber !== 'string' || !aadhaarRegex.test(p.aadhaarNumber)) {
        throw new HttpError(400, `Passenger ${i + 1}: aadhaarNumber must be a valid 12-digit number`)
      }

      const birthDate = new Date(p.dob)
      if (Number.isNaN(birthDate.getTime())) {
        throw new HttpError(400, `Passenger ${i + 1}: dob must be a valid date`)
      }

      let calculatedAge = today.getFullYear() - birthDate.getFullYear()
      const monthDelta = today.getMonth() - birthDate.getMonth()
      if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge -= 1
      }
      if (calculatedAge < 0 || calculatedAge > 120) {
        throw new HttpError(400, `Passenger ${i + 1}: dob corresponds to an invalid age`)
      }
    }

    // 3. Validate transport options and constraints
    if (transportType !== 'Flight' && transportType !== 'Train') {
      throw new HttpError(400, "transportType must be either 'Flight' or 'Train'")
    }

    if (transportType === 'Train') {
      if (!busType || (busType !== 'AC Train' && busType !== 'Non-AC Train')) {
        throw new HttpError(400, "busType is required when transportType is 'Train', and must be 'AC Train' or 'Non-AC Train'")
      }
    }

    if (roomType !== 'AC Room' && roomType !== 'Non-AC Room') {
      throw new HttpError(400, "roomType must be either 'AC Room' or 'Non-AC Room'")
    }

    // 4. Package information validation
    const { data: travelPackage, error: packageError } = await supabaseAdmin
      .from('travel_packages')
      .select('id, price, is_active, remaining_seats, flight_price, train_ac_price, train_non_ac_price, room_ac_price, room_non_ac_price, start_date, end_date')
      .eq('id', packageId)
      .single()

    if (packageError || !travelPackage) {
      throw new HttpError(404, 'Travel package not found')
    }

    if (!travelPackage.is_active) {
      throw new HttpError(400, 'Travel package is not active')
    }

    if (travelPackage.remaining_seats < travelerCount) {
      throw new HttpError(400, 'Not enough seats available')
    }

    const baseUnitPrice = Number(travelPackage.price)
    if (!Number.isFinite(baseUnitPrice) || baseUnitPrice <= 0) {
      throw new HttpError(400, 'Travel package has an invalid price')
    }

    let transportAddon = 0
    if (transportType === 'Flight') {
      transportAddon = Number(travelPackage.flight_price || 0)
    } else if (transportType === 'Train') {
      transportAddon = busType === 'AC Train'
        ? Number(travelPackage.train_ac_price || 0)
        : Number(travelPackage.train_non_ac_price || 0)
    }

    let roomAddon = 0
    if (roomType === 'AC Room') {
      roomAddon = Number(travelPackage.room_ac_price || 0)
    } else if (roomType === 'Non-AC Room') {
      roomAddon = Number(travelPackage.room_non_ac_price || 0)
    }

    const packageUnitPrice = baseUnitPrice + transportAddon + roomAddon
    let additionalSevaPrice = 0
    let resolvedSevaType = additionalSevaType

    if (additionalSevaPackageId && additionalSevaPackageId !== 'none') {
      const { data: sevaPackage, error: sevaPackageError } = await supabaseAdmin
        .from('seva_packages')
        .select('id, price, is_active, booking_enabled, allow_date_selection, seva_type')
        .eq('id', additionalSevaPackageId)
        .is('deleted_at', null)
        .single()

      if (sevaPackageError || !sevaPackage) {
        throw new HttpError(404, 'Additional Seva package not found')
      }
      if (!sevaPackage.is_active || !sevaPackage.booking_enabled) {
        throw new HttpError(400, 'Selected Seva package is not active or booking is disabled')
      }

      if (sevaPackage.allow_date_selection) {
        if (!additionalSevaDate || !/^\d{4}-\d{2}-\d{2}$/.test(additionalSevaDate)) {
          throw new HttpError(400, 'additionalSevaDate is required in YYYY-MM-DD format for this package')
        }
      }

      additionalSevaPrice = Number(sevaPackage.price)
      resolvedSevaType = sevaPackage.seva_type
    } else if (additionalSevaType && additionalSevaType !== 'none') {
      if (!['guruji_aarti', 'yajman_pad', 'yajman'].includes(additionalSevaType)) {
        throw new HttpError(400, 'Invalid additionalSevaType. Allowed: guruji_aarti, yajman_pad')
      }
      if (!additionalSevaDate || !/^\d{4}-\d{2}-\d{2}$/.test(additionalSevaDate)) {
        throw new HttpError(400, 'additionalSevaDate is required in YYYY-MM-DD format')
      }
      additionalSevaPrice = additionalSevaType === 'guruji_aarti' ? 2100 : Number(process.env.YAJMAN_SEVA_PRICE ?? 5100)
    }

    if (additionalSevaDate) {
      if (travelPackage.start_date && additionalSevaDate < travelPackage.start_date) {
        throw new HttpError(400, `Seva date (${additionalSevaDate}) cannot be earlier than Yatra departure date (${travelPackage.start_date}).`)
      }
      if (travelPackage.end_date && additionalSevaDate > travelPackage.end_date) {
        throw new HttpError(400, `Seva date (${additionalSevaDate}) cannot be later than Yatra return date (${travelPackage.end_date}).`)
      }
    }

    const totalAmount = (packageUnitPrice * travelerCount) + additionalSevaPrice

    logInfo('Travel', `Calculated pricing breakdown for package ${packageId}`, {
      baseAmount: baseUnitPrice * travelerCount,
      transportAmount: transportAddon * travelerCount,
      roomAmount: roomAddon * travelerCount,
      additionalSevaAmount: additionalSevaPrice,
      totalAmount,
    })

    const bookingReference = `BK${Date.now()}${Math.floor(Math.random() * 1000)}`
    const authRequest = request as AuthenticatedRequest

    // 5. Document validation and User Profile

    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('users')
      .select('verification_status, aadhaar_number, aadhaar_image_path, selfie_image_path')
      .eq('id', authRequest.userId)
      .maybeSingle()

    if (profileError) {
      throw new HttpError(500, 'Failed to load user profile')
    }

    const isLeadVerified = userProfile && ['submitted', 'verified'].includes(userProfile.verification_status)

    // Validate document paths
    for (let i = 0; i < passengers.length; i++) {
      const p = passengers[i]
      if (i === 0 && isLeadVerified) {
        // Skip validation, we will attach user profile documents
        continue
      }
      if (!p.aadhaarImagePath || !p.aadhaarImagePath.trim()) {
        throw new HttpError(400, `Passenger ${i + 1}: Aadhaar document image is required`)
      }
      if (!p.selfieImagePath || !p.selfieImagePath.trim()) {
        throw new HttpError(400, `Passenger ${i + 1}: Selfie document image is required`)
      }
    }

    const leadPassenger = passengers[0]

    // 6. Application-Layer Transaction
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .insert({
        user_id: authRequest.userId,
        package_id: packageId,
        status: 'payment_pending',
        traveler_count: travelerCount,
        special_notes: specialNotes?.trim() || null,
        booking_reference: bookingReference,
        full_name: leadPassenger.fullName.trim(),
        phone_number: leadPassenger.phone.trim(),
        whatsapp_number: leadPassenger.phone.trim(),
        dob: new Date(leadPassenger.dob).toISOString(),
        address: leadPassenger.address.trim(),
        transport_type: transportType,
        bus_type: transportType === 'Train' ? busType : null,
        room_type: roomType,
        base_amount: baseUnitPrice * travelerCount,
        transport_amount: transportAddon * travelerCount,
        room_amount: roomAddon * travelerCount,
        additional_seva_type: additionalSevaPackageId ? null : (additionalSevaType ?? null),
        additional_seva_date: additionalSevaDate ?? null,
        additional_seva_amount: additionalSevaPackageId ? null : (additionalSevaPrice > 0 ? additionalSevaPrice : null),
        additional_seva_package_id: additionalSevaPackageId ?? null,
        total_amount: totalAmount,
      })
      .select('*')
      .single()

    if (bookingError || !booking) {
      logError('Travel', 'Failed to create booking row in database', bookingError)
      throw new HttpError(500, bookingError?.message ?? 'Failed to create booking')
    }

    logInfo('Travel', `Travel Booking created: ${booking.id}`, { bookingId: booking.id, bookingReference, totalAmount })
    if (authRequest.userId) {
      await createNotification(authRequest.userId, 'Booking Created', `Your Yatra booking reference ${bookingReference} has been created and is pending payment.`, NotificationType.BOOKING_CREATED)
    }

    try {
      // 6a. Batch Insert Passengers
      const passengersToInsert = passengers.map((p, index) => ({
        booking_id: booking.id,
        passenger_index: index,
        is_primary: index === 0,
        full_name: p.fullName.trim(),
        dob: new Date(p.dob).toISOString(),
        gender: p.gender,
        phone: p.phone.trim(),
        address: p.address.trim(),
        aadhaar_number: p.aadhaarNumber,
        verification_status: (index === 0 && isLeadVerified) ? userProfile.verification_status : 'submitted',
      }))

      const { data: insertedPassengers, error: passengerError } = await supabaseAdmin
        .from('booking_passengers')
        .insert(passengersToInsert)
        .select('id, passenger_index')

      if (passengerError || !insertedPassengers) {
        throw new Error(passengerError?.message ?? 'Failed to insert passengers')
      }

      // 6b. Batch Insert Documents
      const documentsToInsert: any[] = []
      for (const ip of insertedPassengers) {
        const p = passengers[ip.passenger_index]

        if (ip.passenger_index === 0 && isLeadVerified) {
          if (userProfile.aadhaar_image_path) {
            documentsToInsert.push({ passenger_id: ip.id, document_type: 'aadhaar_front', file_path: userProfile.aadhaar_image_path })
          }
          if (userProfile.selfie_image_path) {
            documentsToInsert.push({ passenger_id: ip.id, document_type: 'selfie', file_path: userProfile.selfie_image_path })
          }
        } else {
          documentsToInsert.push({ passenger_id: ip.id, document_type: 'aadhaar_front', file_path: p.aadhaarImagePath })
          documentsToInsert.push({ passenger_id: ip.id, document_type: 'selfie', file_path: p.selfieImagePath })
        }
      }

      if (documentsToInsert.length > 0) {
        const { error: documentError } = await supabaseAdmin
          .from('passenger_documents')
          .insert(documentsToInsert)

        if (documentError) {
          throw new Error(documentError.message ?? 'Failed to insert documents')
        }
      }

      // 6c. Insert Linked Seva Booking (for single source of truth availability)
      if ((additionalSevaPackageId || additionalSevaType) && (additionalSevaPackageId !== 'none' && additionalSevaType !== 'none') && additionalSevaDate) {
        const sevaRef = `SEV-${bookingReference}`
        const sevaBookingType = resolvedSevaType === 'guruji_aarti' ? 'yajman' : (resolvedSevaType || 'yajman')
        await supabaseAdmin.from('seva_bookings').insert({
          booking_reference: sevaRef,
          user_id: authRequest.userId,
          seva_type: sevaBookingType,
          seva_package_id: additionalSevaPackageId ?? null,
          seva_date: additionalSevaDate,
          full_name: leadPassenger.fullName.trim(),
          phone_number: leadPassenger.phone.trim(),
          total_amount: additionalSevaPrice,
          status: 'payment_pending',
          notes: `Additional Seva with Yatra Booking ${bookingReference}`,
        })
      }

    } catch (txError) {
      console.error('Partial booking failure, rolling back booking:', txError)
      // Manual Rollback
      await supabaseAdmin.from('bookings').delete().eq('id', booking.id)
      throw new HttpError(500, txError instanceof Error ? txError.message : 'Transaction failed during passenger insertion')
    }

    response.status(201).json({ booking })
  } catch (error) {
    next(error)
  }
})

bookingsRouter.get('/', requireAuth, async (request, response, next) => {
  try {
    const authRequest = request as AuthenticatedRequest

    const { data: bookings, error } = await supabaseAdmin
      .from('bookings')
      .select('*, travel_packages(title, start_date, end_date)')
      .eq('user_id', authRequest.userId)
      .order('created_at', { ascending: false })

    const userBookings = bookings ?? []
    if (userBookings.length > 0) {
      const bookingIds = userBookings.map((b) => b.id)
      const { data: sevas } = await supabaseAdmin
        .from('seva_bookings')
        .select('*')
        .in('travel_booking_id', bookingIds)

      const sevaMap = new Map((sevas ?? []).map((s: any) => [s.travel_booking_id, s]))
      userBookings.forEach((b: any) => {
        b.linkedSeva = sevaMap.get(b.id) ?? null
      })
    }

    response.json({ bookings: userBookings })
  } catch (error) {
    next(error)
  }
})

bookingsRouter.get('/:bookingId', requireAuth, async (request, response, next) => {
  try {
    const authRequest = request as AuthenticatedRequest
    const { bookingId } = request.params

    const { data: booking, error } = await supabaseAdmin
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single()

    if (error || !booking) {
      throw new HttpError(404, 'Booking not found')
    }

    if (booking.user_id !== authRequest.userId) {
      throw new HttpError(403, 'Booking does not belong to the authenticated user')
    }

    const { data: linkedSeva } = await supabaseAdmin
      .from('seva_bookings')
      .select('*')
      .or(`travel_booking_id.eq.${booking.id},notes.eq.Additional Seva with Yatra Booking ${booking.booking_reference}`)
      .maybeSingle()

    const pricing = {
      baseAmount: booking.base_amount ?? (booking.total_amount - (booking.additional_seva_amount || 0)),
      transportAmount: booking.transport_amount ?? 0,
      roomAmount: booking.room_amount ?? 0,
      sevaAmount: booking.additional_seva_amount ?? 0,
      totalAmount: booking.total_amount,
    }

    response.json({
      booking: { ...booking, linkedSeva: linkedSeva ?? null },
      linkedSeva: linkedSeva ?? null,
      pricing,
    })
  } catch (error) {
    next(error)
  }
})

bookingsRouter.post('/:bookingId/cancel', requireAuth, async (request, response, next) => {
  try {
    const authRequest = request as AuthenticatedRequest
    const { bookingId } = request.params

    const { data: booking, error } = await supabaseAdmin
      .from('bookings')
      .select('*, travel_packages(id, remaining_seats)')
      .eq('id', bookingId)
      .single()

    if (error || !booking) {
      throw new HttpError(404, 'Booking not found')
    }

    if (booking.user_id !== authRequest.userId) {
      throw new HttpError(403, 'Booking does not belong to the authenticated user')
    }

    if (booking.status === 'cancelled') {
      response.json({ success: true, booking })
      return
    }

    const cancellableStatuses = ['payment_pending', 'verification_pending', 'pending', 'confirmed', 'paid']
    if (!cancellableStatuses.includes(booking.status)) {
      throw new HttpError(400, `Cannot cancel booking with status: ${booking.status}`)
    }

    // Update status to cancelled
    const { data: updatedBooking, error: updateError } = await supabaseAdmin
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingId)
      .select('*')
      .single()

    if (updateError) {
      throw new HttpError(500, 'Failed to cancel booking')
    }

    // If it had reserved seats (confirmed, paid, verification_pending, pending), increment remaining_seats back
    if (booking.package_id) {
      try {
        await supabaseAdmin.rpc('increment_seats' as never, {
          pid: booking.package_id,
          count: booking.traveler_count
        } as never)
      } catch {
        // Non-critical RPC seat increment catch
      }
    }

    response.json({ success: true, booking: updatedBooking })
  } catch (error) {
    next(error)
  }
})
