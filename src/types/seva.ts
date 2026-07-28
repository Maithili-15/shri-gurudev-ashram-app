import type { SevaType } from '../constants/seva';

// ─── Booking Purpose ──────────────────────────────────────────────────────────
export type AnnadanBookingPurpose = 'birthday' | 'smruti' | 'pitrayartha' | 'general';
export type IdentityType = 'aadhaar' | 'pan';

// ─── Seva Booking ─────────────────────────────────────────────────────────────
export type SevaBookingStatus = 'payment_pending' | 'paid' | 'cancelled';

export type SevaBooking = {
  id: string;
  bookingReference: string;
  transactionId?: string;
  sevaType: SevaType;
  sevaDate: string;           // ISO date string: YYYY-MM-DD
  fullName: string;
  phoneNumber: string;
  totalAmount: number;
  status: SevaBookingStatus;
  createdAt: string;
  notes?: string;
  // ─── Annadan Redesign Fields ────────────────────────────────────────────────
  bookingPurpose?: AnnadanBookingPurpose;
  beneficiaryName?: string;
  sponsorName?: string;
  sponsorPhone?: string;
  email?: string;
  address?: string;
  identityType?: IdentityType;
  identityNumberMasked?: string;
  isRecurring?: boolean;
  recurringFrequency?: string;
  recurringStartDate?: string;
  recurringEndDate?: string;
};

// ─── Create Input ─────────────────────────────────────────────────────────────
export type CreateSevaBookingInput = {
  sevaType: SevaType;
  sevaDate: string;
  fullName: string;
  phoneNumber: string;
  totalAmount: number;
  notes?: string;
  sevaPackageId?: string;
  // ─── Annadan Redesign Fields ────────────────────────────────────────────────
  bookingPurpose?: AnnadanBookingPurpose;
  beneficiaryName?: string;
  sponsorName?: string;
  sponsorPhone?: string;
  email?: string;
  address?: string;
  identityType?: IdentityType;
  identityNumber?: string;
  isRecurring?: boolean;
  recurringStartDate?: string;
  recurringEndDate?: string;
};

// ─── Receipt Display ──────────────────────────────────────────────────────────
export type SevaReceiptData = {
  receiptNumber: string;
  transactionId?: string;
  transactionDate: string;
  sevaType: SevaType;
  sevaDate: string;
  devotee: string;
  phone: string;
  amount: number;
  paymentMethod: string;
  status: SevaBookingStatus;
  referenceNumber: string;
  // ─── Annadan Redesign Fields ────────────────────────────────────────────────
  bookingPurpose?: string;
  beneficiaryName?: string;
  sponsorName?: string;
  sponsorPhone?: string;
  identityType?: string;
  identityNumberMasked?: string;
  isRecurring?: boolean;
  recurringPeriod?: string;     // e.g. "15 Aug 2026 — 15 Aug 2027"
};

// ─── Upcoming Seva (for Home screen feed) ────────────────────────────────────
export type UpcomingSeva = {
  id: string;
  sevaType: SevaType;
  date: string;           // ISO date string
  isAvailable: boolean;
  spotsLeft?: number;
};

