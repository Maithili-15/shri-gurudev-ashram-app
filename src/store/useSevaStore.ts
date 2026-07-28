import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { SevaType } from '../constants/seva';
import type { AnnadanBookingPurpose, IdentityType, SevaBooking } from '../types/seva';

// ─── Devotee Form Fields ──────────────────────────────────────────────────────
export type SevaDevoteeFields = {
  fullName: string;
  phoneNumber: string;
};

// ─── Full Store State ─────────────────────────────────────────────────────────
export type SevaStoreState = {
  // Current seva type being booked
  sevaType: SevaType | null;
  sevaPackageId: string | null;

  // Selected date for the seva
  selectedDate: string; // ISO: YYYY-MM-DD

  // Devotee details
  fullName: string;
  phoneNumber: string;

  // Booking result (set after mock/real booking is created)
  bookingId: string | null;
  bookingReference: string | null;
  transactionId: string | null;

  // ─── Annadan Redesign Fields ────────────────────────────────────────────────
  bookingPurpose: AnnadanBookingPurpose | null;
  beneficiaryName: string;
  sponsorName: string;
  sponsorPhone: string;
  sponsorEmail: string;
  sponsorAddress: string;
  identityType: IdentityType | null;
  identityNumber: string;
  isRecurring: boolean;
  recurringStartDate: string;
  recurringEndDate: string;

  // History — all completed/confirmed bookings this session
  // Phase 2: replace with API call on My Sevas screen mount
  sevaHistory: SevaBooking[];

  // Actions
  setSevaType: (type: SevaType) => void;
  setSevaPackageId: (id: string | null) => void;
  setSelectedDate: (date: string) => void;
  updateDevoteeField: <K extends keyof SevaDevoteeFields>(
    field: K,
    value: SevaDevoteeFields[K],
  ) => void;
  setBookingResult: (bookingId: string, bookingReference: string, transactionId?: string) => void;
  addToHistory: (booking: SevaBooking) => void;
  updateBookingStatus: (id: string, status: SevaBooking['status']) => void;
  resetSeva: () => void;
  // ─── Annadan field setters ──────────────────────────────────────────────────
  setBookingPurpose: (purpose: AnnadanBookingPurpose) => void;
  setBeneficiaryName: (name: string) => void;
  setSponsorName: (name: string) => void;
  setSponsorPhone: (phone: string) => void;
  setSponsorEmail: (email: string) => void;
  setSponsorAddress: (address: string) => void;
  setIdentityType: (type: IdentityType | null) => void;
  setIdentityNumber: (number: string) => void;
  setIsRecurring: (recurring: boolean) => void;
  setRecurringDates: (start: string, end: string) => void;
};

// ─── Initial State ────────────────────────────────────────────────────────────
const initialBookingState = {
  sevaType: null,
  sevaPackageId: null,
  selectedDate: '',
  fullName: '',
  phoneNumber: '',
  bookingId: null,
  bookingReference: null,
  transactionId: null,
  // Annadan redesign defaults
  bookingPurpose: null,
  beneficiaryName: '',
  sponsorName: '',
  sponsorPhone: '',
  sponsorEmail: '',
  sponsorAddress: '',
  identityType: null,
  identityNumber: '',
  isRecurring: false,
  recurringStartDate: '',
  recurringEndDate: '',
} as const;

// ─── Store ────────────────────────────────────────────────────────────────────
export const useSevaStore = create<SevaStoreState>()(
  persist(
    (set) => ({
      ...initialBookingState,
      sevaHistory: [],

      setSevaType: (type) => set({ sevaType: type }),

      setSevaPackageId: (id) => set({ sevaPackageId: id }),

      setSelectedDate: (date) => set({ selectedDate: date }),

      updateDevoteeField: (field, value) =>
        set({ [field]: value } as Partial<SevaStoreState>),

      setBookingResult: (bookingId, bookingReference, transactionId) =>
        set({ bookingId, bookingReference, transactionId: transactionId ?? null }),

      addToHistory: (booking) =>
        set((state) => ({
          sevaHistory: [booking, ...state.sevaHistory.filter((b) => b.id !== booking.id)],
        })),

      updateBookingStatus: (id, status) =>
        set((state) => ({
          sevaHistory: state.sevaHistory.map((b) => (b.id === id ? { ...b, status } : b)),
        })),

      resetSeva: () => set({ ...initialBookingState }),

      // ─── Annadan field setters ────────────────────────────────────────────────
      setBookingPurpose: (purpose) => set({ bookingPurpose: purpose }),
      setBeneficiaryName: (name) => set({ beneficiaryName: name }),
      setSponsorName: (name) => set({ sponsorName: name }),
      setSponsorPhone: (phone) => set({ sponsorPhone: phone }),
      setSponsorEmail: (email) => set({ sponsorEmail: email }),
      setSponsorAddress: (address) => set({ sponsorAddress: address }),
      setIdentityType: (type) => set({ identityType: type, identityNumber: '' }),
      setIdentityNumber: (number) => set({ identityNumber: number }),
      setIsRecurring: (recurring) => set({ isRecurring: recurring }),
      setRecurringDates: (start, end) => set({ recurringStartDate: start, recurringEndDate: end }),
    }),
    {
      name: 'ashram-seva-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ sevaHistory: state.sevaHistory }),
    }
  )
);

