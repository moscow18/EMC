/**
 * Validates Egyptian phone numbers.
 * Accepts formats: 01xxxxxxxxx (11 digits starting with 01)
 * Optional leading +20 or 0020 country code.
 */
export function isValidEgyptianPhone(phone: string): boolean {
  if (!phone || phone.trim() === '') return true; // phone is optional in contact form
  const cleaned = phone.replace(/[\s\-()]/g, '');
  // Match: 01[0-9]{9} or +201[0-9]{9} or 00201[0-9]{9}
  return /^(\+?20|0020)?1[0-9]{9}$/.test(cleaned) || /^01[0-9]{9}$/.test(cleaned);
}

/**
 * Validates email format.
 */
export function isValidEmail(email: string): boolean {
  if (!email || email.trim() === '') return true; // email is optional in contact form
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/**
 * Sanitizes input to prevent XSS.
 * Strips HTML tags and dangerous characters.
 */
export function sanitizeInput(text: string): string {
  if (!text) return '';
  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
}

/**
 * Sanitizes all fields of a form data object.
 */
export function sanitizeFormData<T extends Record<string, string>>(data: T): T {
  const sanitized = {} as T;
  for (const key in data) {
    sanitized[key] = sanitizeInput(data[key]) as T[typeof key];
  }
  return sanitized;
}
