import { getSupabaseClient } from '../lib/supabase'
import { Booking, BookingStatus, CreateBookingInput } from '../types/travel'

type BookingRow = {
  id: string | number
  booking_reference?: string | null
  package_id?: string | number | null
  user_id?: string | null
  traveler_count?: number | string | null
  special_notes?: string | null
  total_amount?: number | string | null
  paid_amount?: number | string | null
  remaining_amount?: number | string | null
  status?: BookingStatus | string | null
  created_at?: string | null
}

type BookingInsertRow = {
  package_id: string
  user_id: string
  traveler_count: number
  special_notes: string | null
  total_amount: number
  paid_amount: number
  remaining_amount: number
  status: 'pending'
  booking_reference: string
}

// TODO(production): Replace this hardcoded user_id with the authenticated Supabase user id.
const TEMP_USER_ID = '7a880d7f-51c3-4553-931f-a7c725e9d10b'

function createTemporaryBookingReference() {
  // TODO(production): Replace this temporary reference with a database-backed sequence.
  return `BK${Date.now()}`
}

function toNumber(value: number | string | null | undefined) {
  if (typeof value === 'number') {
    return value
  }

  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
  }

  return 0
}

function mapBookingRow(row: BookingRow): Booking {
  const id = String(row.id)

  return {
    id,
    bookingReference: row.booking_reference ?? id,
    packageId: String(row.package_id ?? ''),
    userId: row.user_id ?? TEMP_USER_ID,
    travelerCount: toNumber(row.traveler_count),
    specialNotes: row.special_notes ?? null,
    totalAmount: toNumber(row.total_amount),
    paidAmount: toNumber(row.paid_amount),
    remainingAmount: toNumber(row.remaining_amount),
    status: (row.status ?? 'pending') as BookingStatus,
    createdAt: row.created_at ?? undefined,
  }
}

export async function createBooking(input: CreateBookingInput): Promise<Booking> {
  const supabase = getSupabaseClient()
  const totalAmount = toNumber(input.totalAmount)

  if (!input.packageId) {
    throw new Error('Package is required before creating a booking.')
  }

  if (!Number.isInteger(input.travelerCount) || input.travelerCount < 1) {
    throw new Error('Traveler count must be at least 1.')
  }

  if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
    throw new Error('Booking total is invalid. Please select a package with a valid price.')
  }

  const insertRow: BookingInsertRow = {
    package_id: input.packageId,
    user_id: TEMP_USER_ID,
    traveler_count: input.travelerCount,
    special_notes: input.specialNotes?.trim() ? input.specialNotes.trim() : null,
    // TODO(production): Replace frontend-calculated totals with server-side pricing validation.
    total_amount: totalAmount,
    paid_amount: 0,
    remaining_amount: totalAmount,
    status: 'pending',
    booking_reference: createTemporaryBookingReference(),
  }

  // TODO(production): Tighten RLS around authenticated users once auth is wired.
  const bookingsTable = supabase.from('bookings') as any
  const { data, error } = await bookingsTable
    .insert(insertRow)
    .select('*')
    .single()

  if (error) {
    console.log('BOOKING ERROR:', JSON.stringify(error, null, 2))
    throw new Error(error.message)
  }

  if (!data) {
    throw new Error('Booking was created but Supabase returned no booking record.')
  }

  return mapBookingRow(data as BookingRow)
}
