/**
 * Utility functions for Create LiveStream Page
 */

/**
 * Sanitize stream key để dùng làm filename an toàn
 * Chỉ giữ lại alphanumeric, dash, underscore
 */
export function sanitizeStreamKeyForFilename(key: string): string {
  return key.replace(/[^a-zA-Z0-9_-]/g, '_');
}

/**
 * Generate stream key an toàn cho RTMP
 * Format: LS-{random_alphanumeric} (24 ký tự sau LS-)
 */
export function generateStreamKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'LS-';
  for (let i = 0; i < 24; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generate WebRTC room ID
 */
export function generateRoomId(): string {
  return `rtc-${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`;
}

export const DEFAULT_SERVER_URL = 'rtmp://127.0.0.1/live';
export const DEFAULT_PLAYBACK_BASE = 'http://localhost:8080/hls';
export const HLS_HTTP_BASE = DEFAULT_PLAYBACK_BASE.replace(/\/hls.*$/, '');

