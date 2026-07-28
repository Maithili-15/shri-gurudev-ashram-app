/**
 * Centralized Timezone-Safe Date Utility Functions
 * Ensures consistent date parsing and IST (Asia/Kolkata) formatting
 * across all client screens, receipts, and dashboards.
 */

/**
 * Format a YYYY-MM-DD string or ISO timestamp in IST (Asia/Kolkata)
 */
export function formatDateIST(
  input: string | Date | null | undefined,
  options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }
): string {
  if (!input) return '—'

  if (typeof input === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(input.trim())) {
    const [year, month, day] = input.trim().split('-').map(Number)
    const localDate = new Date(year, month - 1, day)
    return localDate.toLocaleDateString('en-IN', {
      day: options.day ?? 'numeric',
      month: options.month ?? 'short',
      year: options.year ?? 'numeric',
    })
  }

  const d = typeof input === 'string' ? new Date(input) : input
  if (Number.isNaN(d.getTime())) return '—'

  return d.toLocaleDateString('en-IN', {
    ...options,
    timeZone: 'Asia/Kolkata',
  })
}

/**
 * Converts a Date object to local YYYY-MM-DD date string without UTC shift
 */
export function toLocalYYYYMMDD(d: Date): string {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Formats YYYY-MM-DD into a human-friendly string (e.g. "Tuesday, 28 July 2026")
 */
export function formatDateDisplay(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  const trimmed = dateStr.trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const [year, month, day] = trimmed.split('-').map(Number)
    const d = new Date(year, month - 1, day)
    return d.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }
  return formatDateIST(dateStr)
}
