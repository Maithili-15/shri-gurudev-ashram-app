import crypto from 'crypto'

// AES-256-GCM encryption for sensitive identity numbers (Aadhaar / PAN).
// The encryption key must be a 64-character hex string (32 bytes) stored in
// the IDENTITY_ENCRYPTION_KEY environment variable.
//
// In development, a deterministic fallback key is used so the server boots
// without extra configuration. In production this MUST be set to a unique,
// securely generated value.

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16
const AUTH_TAG_LENGTH = 16

function getKey(): Buffer {
  const envKey = process.env.IDENTITY_ENCRYPTION_KEY
  if (envKey && envKey.length === 64) {
    return Buffer.from(envKey, 'hex')
  }
  // Deterministic dev-only fallback — never use in production
  return crypto.createHash('sha256').update('dev-identity-key-not-for-production').digest()
}

/**
 * Encrypt a plaintext string using AES-256-GCM.
 * Returns a hex-encoded string: iv + authTag + ciphertext.
 */
export function encryptIdentity(plaintext: string): string {
  const key = getKey()
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()
  return Buffer.concat([iv, authTag, encrypted]).toString('hex')
}

/**
 * Decrypt an AES-256-GCM encrypted hex string back to plaintext.
 */
export function decryptIdentity(encryptedHex: string): string {
  const key = getKey()
  const data = Buffer.from(encryptedHex, 'hex')
  const iv = data.subarray(0, IV_LENGTH)
  const authTag = data.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH)
  const ciphertext = data.subarray(IV_LENGTH + AUTH_TAG_LENGTH)
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(authTag)
  return decipher.update(ciphertext) + decipher.final('utf8')
}

/**
 * Mask an Aadhaar number for safe display: 123456789012 → XXXX-XXXX-9012
 */
export function maskAadhaar(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (digits.length !== 12) return 'XXXX-XXXX-XXXX'
  return `XXXX-XXXX-${digits.slice(8)}`
}

/**
 * Mask a PAN number for safe display: ABCDE1234F → XXXXX1234X
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
