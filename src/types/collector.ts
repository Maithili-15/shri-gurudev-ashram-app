export type InstallmentStatus = 'Paid' | 'Partial' | 'Pending' | 'Overdue'
export type PaymentMode = 'UPI' | 'Cash' | 'Bank Transfer'
export type VerificationState = 'approved' | 'pending' | 'warning'

export type CollectorInstallment = {
  id: string
  label: string
  amount: number
  dueDate: string
  status: 'paid' | 'current' | 'upcoming'
}

export type CollectorTraveler = {
  id: string
  bookingId: string
  fullName: string
  yatraName: string
  photo: string
  phone: string
  whatsapp: string
  totalAmount: number
  amountPaid: number
  dueAmount: number
  dueDate: string
  status: InstallmentStatus
  aadhaarUploaded: boolean
  selfieUploaded: boolean
  travelerConfirmed: boolean
  verificationState: VerificationState
  notes: string
  tags: string[]
  installments: CollectorInstallment[]
  targetPercent: number
}

export type CollectorNotification = {
  id: string
  title: string
  message: string
  time: string
  tone: 'alert' | 'info' | 'success'
}

export type CollectorAnalytics = {
  totalAssigned: number
  totalPendingPayments: number
  collectedThisMonth: number
  upcomingDues: number
  monthlyTarget: number
  collectionCompletion: number
  pendingRecovery: number
}

export type CollectorCollectionPayload = {
  travelerId: string
  amount: number
  mode: PaymentMode
  receiptUri?: string
  remarks?: string
}
