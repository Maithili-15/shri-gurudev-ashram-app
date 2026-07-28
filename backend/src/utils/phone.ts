export function normalizePhoneNumber(value: unknown): string {
  if (typeof value !== 'string') return ''
  let cleaned = value.replace(/[^\d]/g, '')
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    cleaned = cleaned.slice(2)
  } else if (cleaned.length === 11 && cleaned.startsWith('0')) {
    cleaned = cleaned.slice(1)
  }
  return cleaned.slice(0, 10)
}

export function isValidIndianMobile(value: unknown): boolean {
  const normalized = normalizePhoneNumber(value)
  return /^[6-9]\d{9}$/.test(normalized)
}
