export type LogModule =
  | 'Auth'
  | 'Travel'
  | 'Seva'
  | 'Annadan'
  | 'Donation'
  | 'Payment'
  | 'Receipt'
  | 'ERROR'

export function logInfo(module: LogModule, message: string, data?: Record<string, any>) {
  const timestamp = new Date().toISOString()
  if (data) {
    const sanitized = sanitizePayload(data)
    console.log(`[${module}] [${timestamp}] ${message}`, JSON.stringify(sanitized))
  } else {
    console.log(`[${module}] [${timestamp}] ${message}`)
  }
}

export function logError(module: LogModule, message: string, error?: any) {
  const timestamp = new Date().toISOString()
  if (error instanceof Error) {
    console.error(`[ERROR] [${module}] [${timestamp}] ${message}: ${error.message}\nStack: ${error.stack}`)
  } else if (error) {
    console.error(`[ERROR] [${module}] [${timestamp}] ${message}:`, error)
  } else {
    console.error(`[ERROR] [${module}] [${timestamp}] ${message}`)
  }
}

function sanitizePayload(data: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {}
  for (const [key, value] of Object.entries(data)) {
    if (key.toLowerCase().includes('aadhaar') || key.toLowerCase().includes('pan') || key.toLowerCase().includes('signature') || key.toLowerCase().includes('secret')) {
      sanitized[key] = '[REDACTED]'
    } else {
      sanitized[key] = value
    }
  }
  return sanitized
}
