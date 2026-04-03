/**
 * Validator utilities for LinkedIn system
 */

export type UUID = string & { readonly __brand: "UUID" };

/**
 * Generate UUID v4
 */
export function generateUUID(): UUID {
  return (
    "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    }) as UUID
  );
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 */
export function isValidPassword(password: string): boolean {
  return password.length >= 8;
}

/**
 * Validate not empty string
 */
export function isValidString(value: string, minLength: number = 1): boolean {
  return value.trim().length >= minLength;
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Create branded UUID from string
 */
export function createUUID(value: string): UUID {
  return value as UUID;
}
