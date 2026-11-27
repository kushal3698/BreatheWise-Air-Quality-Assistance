/**
 * Sanitizes city input to prevent injection attacks and enforce length limits,
 * while supporting Unicode letters across Latin, Devanagari, Telugu, and Tamil.
 */
export function sanitizeCity(city?: unknown): string {
  if (typeof city !== 'string') return 'Delhi';
  const cleaned = city.replace(/[^\p{L}\p{M}\p{N}\s()\-.]/gu, '').trim().slice(0, 60);
  return cleaned || 'Delhi';
}
