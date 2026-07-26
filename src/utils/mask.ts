/**
 * Mask an Aadhaar number for safe display.
 * 123456789012 → XXXX-XXXX-9012
 */
export function maskAadhaar(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (digits.length !== 12) return 'XXXX-XXXX-XXXX'
  return `XXXX-XXXX-${digits.slice(8)}`
}

/**
 * Mask a PAN number for safe display.
 * ABCDE1234F → XXXXX1234X
 */
export function maskPan(raw: string): string {
  const cleaned = raw.trim().toUpperCase()
  if (cleaned.length !== 10) return 'XXXXXXXXXX'
  return `XXXXX${cleaned.slice(5, 9)}${cleaned.slice(9)}`
}

/**
 * Mask an identity number based on its type.
 */
export function maskIdentityNumber(type: 'aadhaar' | 'pan' | string, raw: string): string {
  if (type === 'aadhaar') return maskAadhaar(raw)
  if (type === 'pan') return maskPan(raw)
  return 'XXXXXXXXXX'
}
