/**
 * Sanitizes city input to prevent injection attacks and enforce length limits,
 * while supporting Unicode letters and combining marks across Latin, Devanagari, Telugu, and Tamil.
 */
export function sanitizeCity(city?: unknown): string {
  if (typeof city !== 'string') return 'Delhi';
  const cleaned = city.replace(/[^\p{L}\p{M}\p{N}\s()\-.]/gu, '').trim().slice(0, 60);
  return cleaned || 'Delhi';
}

/**
 * Strips ASCII control characters and enforces 1,000-char payload limits on chat messages.
 */
export function sanitizeChatMessage(message?: unknown): string {
  if (typeof message !== 'string') return '';
  return message.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim().slice(0, 1000);
}
