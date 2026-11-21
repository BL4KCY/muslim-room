/**
 * Secure API Client & Session Helper for Quran Room (Web)
 *
 * Security Compliance:
 * 1. Never stores sensitive auth tokens in localStorage or sessionStorage (prevents XSS token theft).
 * 2. Holds short-lived access token in closure memory ONLY and relies on HttpOnly, Secure, SameSite=Lax/Strict cookies.
 * 3. Attaches mandatory roadmap headers on every request:
 *    X-Platform, X-Device, X-App-Version, X-Request-Id.
 * 4. Masks PII (email addresses) before rendering in UI labels.
 */

let inMemoryAccessToken: string | null = null;
let configuredServerUrl = 'https://api.quranroom.local/v1';

const SESSION_DEVICE_ID = 'web-client-session-uuid-9f81c2';
const APP_VERSION = '1.0.0';

export function getServerUrl(): string {
  return configuredServerUrl;
}

export function setServerUrl(rawUrl: string): { valid: boolean; error?: string; sanitizedUrl?: string } {
  const trimmed = rawUrl.trim();
  try {
    const parsed = new URL(trimmed);
    const isLocalhost =
      parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1';
    if (parsed.protocol !== 'https:' && !isLocalhost) {
      return {
        valid: false,
        error: 'Remote API servers must use HTTPS for encrypted communication.',
      };
    }
    configuredServerUrl = parsed.origin + parsed.pathname.replace(/\/$/, '');
    return { valid: true, sanitizedUrl: configuredServerUrl };
  } catch {
    return {
      valid: false,
      error: 'Please enter a valid URL (e.g., https://api.quranroom.org or http://127.0.0.1:3000).',
    };
  }
}

export function setInMemoryToken(token: string | null): void {
  inMemoryAccessToken = token;
}

export function getInMemoryToken(): string | null {
  return inMemoryAccessToken;
}

export function clearSecureSession(): void {
  inMemoryAccessToken = null;
}

/**
 * Masks an email address so full PII is never surfaced directly in UI labels.
 * Example: "ziad@example.com" -> "z***@e***.com"
 */
export function maskEmailAddress(email: string): string {
  const clean = email.trim();
  const atIndex = clean.indexOf('@');
  if (atIndex <= 0) return '***@***';
  const localPart = clean.slice(0, atIndex);
  const domainPart = clean.slice(atIndex + 1);
  const dotIndex = domainPart.lastIndexOf('.');
  const firstChar = localPart.charAt(0);
  const domainFirst = domainPart.charAt(0) || '*';
  const tld = dotIndex > 0 ? domainPart.slice(dotIndex) : '';
  return `${firstChar}***@${domainFirst}***${tld}`;
}

/**
 * Validates strong user passwords per security policy:
 * - Minimum 12 characters recommended (8+ required, max 128)
 * - Allows all characters including special characters
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  strengthLabel: 'Too Short' | 'Fair (12+ chars recommended)' | 'Strong';
  message?: string;
} {
  if (password.length < 8) {
    return {
      isValid: false,
      strengthLabel: 'Too Short',
      message: 'Password must be at least 8 characters long (12+ recommended).',
    };
  }
  if (password.length > 128) {
    return {
      isValid: false,
      strengthLabel: 'Too Short',
      message: 'Password must not exceed 128 characters.',
    };
  }
  if (password.length < 12) {
    return {
      isValid: true,
      strengthLabel: 'Fair (12+ chars recommended)',
    };
  }
  return {
    isValid: true,
    strengthLabel: 'Strong',
  };
}

/**
 * Generates a cryptographic request ID using Web Crypto API
 */
export function createRequestId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `req-${Date.now()}`;
}

/**
 * Builds the standard roadmap headers required on every request:
 * X-Platform, X-Device, X-App-Version, X-Request-Id, plus Authorization Bearer if in-memory token exists.
 */
export function buildRoadmapHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Platform': 'web',
    'X-Device': SESSION_DEVICE_ID,
    'X-App-Version': APP_VERSION,
    'X-Request-Id': createRequestId(),
  };
  if (inMemoryAccessToken) {
    headers['Authorization'] = `Bearer ${inMemoryAccessToken}`;
  }
  return headers;
}

