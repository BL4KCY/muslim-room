/**
 * Mobile API Client & Session Guard (React Native)
 *
 * Security Compliance:
 * - Never writes JWTs to unencrypted AsyncStorage.
 * - Keeps short-lived access token in memory (ready for Keychain / Expo SecureStore).
 * - Automatically attaches Roadmap Step 0 headers:
 *   X-Platform, X-Device, X-App-Version, X-Request-Id
 * - Masks PII before displaying user emails.
 */

let mobileAccessToken: string | null = null;
let mobileServerUrl = 'https://api.quranroom.local/v1';

const MOBILE_DEVICE_UUID = 'rn-mobile-device-7a24f1';
const MOBILE_APP_VERSION = '1.0.0';

export function getMobileServerUrl(): string {
  return mobileServerUrl;
}

export function setMobileServerUrl(rawUrl: string): {
  valid: boolean;
  error?: string;
  sanitizedUrl?: string;
} {
  const trimmed = rawUrl.trim();
  const isHttps = trimmed.startsWith('https://');
  const isLocal =
    trimmed.startsWith('http://127.0.0.1') ||
    trimmed.startsWith('http://localhost') ||
    trimmed.startsWith('http://10.0.2.2');

  if (!isHttps && !isLocal) {
    return {
      valid: false,
      error: 'Remote backend URLs must use HTTPS (or 127.0.0.1 / 10.0.2.2 for local emulator).',
    };
  }
  mobileServerUrl = trimmed.replace(/\/$/, '');
  return { valid: true, sanitizedUrl: mobileServerUrl };
}

export function setMobileAuthToken(token: string | null): void {
  mobileAccessToken = token;
}

export function clearMobileSession(): void {
  mobileAccessToken = null;
}

export function maskEmailMobile(email: string): string {
  const clean = email.trim();
  const atIndex = clean.indexOf('@');
  if (atIndex <= 0) return '***@***';
  const local = clean.slice(0, atIndex);
  const domain = clean.slice(atIndex + 1);
  return `${local.charAt(0)}***@${domain.charAt(0)}***`;
}

export function buildMobileHeaders(platform: 'ios' | 'android' = 'android'): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Platform': platform,
    'X-Device': MOBILE_DEVICE_UUID,
    'X-App-Version': MOBILE_APP_VERSION,
    'X-Request-Id': `rn-req-${Date.now()}`,
  };
  if (mobileAccessToken) {
    headers['Authorization'] = `Bearer ${mobileAccessToken}`;
  }
  return headers;
}

