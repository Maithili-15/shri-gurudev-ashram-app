import { create } from 'zustand'
import { CollectorCollectionPayload, CollectorTraveler } from '../types/collector'
import { collectorAnalytics, collectorNotifications, collectorTravelers } from '../services/collectorMockData'

type CollectorState = {
  travelers: CollectorTraveler[]
  notifications: typeof collectorNotifications
  analytics: typeof collectorAnalytics
  selectedTravelerId: string | null
  paymentSheetTravelerId: string | null
  setSelectedTraveler: (travelerId: string | null) => void
  openPaymentSheet: (travelerId: string) => void
  closePaymentSheet: () => void
  collectPayment: (payload: CollectorCollectionPayload) => void
  updateVerification: (travelerId: string, updates: Partial<Pick<CollectorTraveler, 'aadhaarUploaded' | 'selfieUploaded' | 'travelerConfirmed' | 'verificationState'>>) => void
}

const getTravelerStatus = (traveler: CollectorTraveler): CollectorTraveler['status'] => {
  if (traveler.dueAmount <= 0) return 'Paid'
  if (traveler.amountPaid > 0 && traveler.amountPaid < traveler.totalAmount) return traveler.dueDate === 'Completed' ? 'Partial' : 'Partial'
  if (traveler.dueDate !== 'Completed' && traveler.status === 'Overdue') return 'Overdue'
  return traveler.amountPaid > 0 ? 'Partial' : 'Pending'
}

export const useCollectorStore = create<CollectorState>((set) => ({
  travelers: collectorTravelers,
  notifications: collectorNotifications,
  analytics: { ...collectorAnalytics },
  selectedTravelerId: null,
  paymentSheetTravelerId: null,
  setSelectedTraveler: (travelerId) => set({ selectedTravelerId: travelerId }),
  openPaymentSheet: (travelerId) => set({ paymentSheetTravelerId: travelerId, selectedTravelerId: travelerId }),
  closePaymentSheet: () => set({ paymentSheetTravelerId: null }),
  collectPayment: ({ travelerId, amount, mode, receiptUri, remarks }) =>
    set((state) => {
      const currentTraveler = state.travelers.find((traveler) => traveler.id === travelerId)
      const wasFullyPaid = (currentTraveler?.dueAmount ?? 0) <= 0

      return {
        travelers: state.travelers.map((traveler) => {
          if (traveler.id !== travelerId) return traveler

          const updatedPaid = Math.min(traveler.totalAmount, traveler.amountPaid + amount)
          const updatedDue = Math.max(0, traveler.totalAmount - updatedPaid)
          const updatedTraveler: CollectorTraveler = {
            ...traveler,
            amountPaid: updatedPaid,
            dueAmount: updatedDue,
            status: updatedDue === 0 ? 'Paid' : updatedPaid > 0 ? 'Partial' : 'Pending',
            verificationState: traveler.verificationState,
            notes: [traveler.notes, `Last collected via ${mode}${remarks ? ` - ${remarks}` : ''}${receiptUri ? ' (receipt attached)' : ''}`].join('. '),
          }

          return updatedTraveler
        }),
        analytics: {
          ...state.analytics,
          collectedThisMonth: state.analytics.collectedThisMonth + amount,
          pendingRecovery: Math.max(0, state.analytics.pendingRecovery - amount),
          totalPendingPayments: wasFullyPaid ? state.analytics.totalPendingPayments : Math.max(0, state.analytics.totalPendingPayments - 1),
          collectionCompletion: Math.min(
            100,
            Math.round(((state.analytics.collectedThisMonth + amount) / state.analytics.monthlyTarget) * 100),
          ),
        },
      }
    }),
  updateVerification: (travelerId, updates) =>
    set((state) => ({
      travelers: state.travelers.map((traveler) => {
        if (traveler.id !== travelerId) return traveler
        const merged = { ...traveler, ...updates }
        return {
          ...merged,
          status: getTravelerStatus(merged),
        }
      }),
    })),
}))
