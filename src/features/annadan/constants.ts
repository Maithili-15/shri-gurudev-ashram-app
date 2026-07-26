import type { AnnadanBookingPurpose } from '../../types/seva'

// ─── Booking Purpose Options ──────────────────────────────────────────────────
export type PurposeOption = {
  key: AnnadanBookingPurpose
  icon: string
  title: string
  description: string
}

export const PURPOSE_OPTIONS: PurposeOption[] = [
  {
    key: 'birthday',
    icon: 'cake',
    title: 'Birthday',
    description: 'Celebrate a birthday by offering Annadan and seeking divine blessings.',
  },
  {
    key: 'smruti',
    icon: 'brightness-5',
    title: 'Smruti Pitrayartha',
    description: 'Offer Annadan in sacred remembrance of departed ancestors and loved ones as Smruti Pitrayartha Seva.',
  },
  {
    key: 'general',
    icon: 'volunteer-activism',
    title: 'General Annadan',
    description: 'Offer Annadan as a selfless act of seva without any specific occasion.',
  },
]

// ─── Purpose Labels (for review / receipt) ────────────────────────────────────
export const PURPOSE_LABELS: Record<AnnadanBookingPurpose, string> = {
  birthday: 'Birthday',
  smruti: 'Smruti Pitrayartha',
  pitrayartha: 'Smruti Pitrayartha',
  general: 'General Annadan',
}

// ─── Beneficiary Label by Purpose ─────────────────────────────────────────────
export const BENEFICIARY_LABELS: Record<string, { heading: string; placeholder: string }> = {
  birthday: {
    heading: 'Birthday Person Name',
    placeholder: 'Enter the person\'s full name',
  },
  smruti: {
    heading: 'Name of the departed person',
    placeholder: 'Enter the person\'s full name',
  },
  pitrayartha: {
    heading: 'Name of the departed person',
    placeholder: 'Enter the person\'s full name',
  },
}

// ─── Step Definitions ─────────────────────────────────────────────────────────
export const ANNADAN_STEPS = ['date', 'recurring', 'beneficiary', 'sponsor', 'identity'] as const
export type AnnadanStep = typeof ANNADAN_STEPS[number]

export function getStepCount(purpose: AnnadanBookingPurpose | null): number {
  // General Annadan skips beneficiary step
  if (purpose === 'general') return 4
  return 5
}

export function getStepLabel(stepIndex: number, purpose: AnnadanBookingPurpose | null): string {
  const total = getStepCount(purpose)
  return `Step ${stepIndex + 2} of ${total + 2}` // +2 because Step 1 = purpose, last = review
}
