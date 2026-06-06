export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function isValidPhoneNumber(value: string) {
  return /^\d{10}$/.test(value.trim());
}

export function isValidAadhaarNumber(value: string) {
  return /^\d{12}$/.test(value.trim());
}

export function normalizeDigits(value: string, maxLength: number) {
  return value.replace(/[^\d]/g, "").slice(0, maxLength);
}

export function isNonEmptyString(value: string) {
  return value.trim().length > 0;
}
