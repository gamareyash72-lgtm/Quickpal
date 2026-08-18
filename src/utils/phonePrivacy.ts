/**
 * QuickPal Phone Privacy & Number Masking Utility
 * Ensures customer, delivery partner, and customer care actual phone numbers are never exposed in cleartext.
 */

export const DEFAULT_CUSTOMER_CARE_PHONE = '932605337';

export function isValidIndianMobile(phone?: string | null): boolean {
  if (!phone) return false;
  // Remove +91, spaces, dashes, parentheses
  const clean = phone.replace(/[\s\-\(\)\+]/g, '').replace(/^91/, '');
  return /^[6-9]\d{8,9}$/.test(clean);
}

export function cleanIndianMobile(phone?: string | null): string {
  if (!phone) return '';
  const clean = phone.replace(/[\s\-\(\)\+]/g, '').replace(/^91/, '');
  return clean;
}

export function formatIndianMobile(phone?: string | null): string {
  const digits = cleanIndianMobile(phone);
  if (digits.length === 10) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  }
  return phone || '';
}

export function maskPhoneNumber(phone?: string | null, customRole: string = 'User'): string {
  if (!phone || phone.trim() === '') {
    return '+91 93••••••37 🔒 (Private)';
  }

  const digits = cleanIndianMobile(phone);
  if (digits.length >= 8) {
    const firstTwo = digits.slice(0, 2);
    const lastTwo = digits.slice(-2);
    return `+91 ${firstTwo}••••••${lastTwo} 🔒`;
  }

  // Fallback masking if non-standard length
  if (phone.length >= 5) {
    return `${phone.slice(0, 2)}••••••${phone.slice(-2)} 🔒`;
  }

  return '🔒 Number Masked (Private)';
}

export function maskCustomerCarePhone(phone: string = DEFAULT_CUSTOMER_CARE_PHONE): string {
  const clean = cleanIndianMobile(phone);
  if (clean.length >= 6) {
    const start = clean.slice(0, 2);
    const end = clean.slice(-2);
    return `+91 ${start}••••••${end} 🔒 (Verified Support Helpline)`;
  }
  return `+91 93••••••37 🔒 (Customer Care)`;
}
