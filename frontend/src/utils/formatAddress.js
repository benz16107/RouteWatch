/**
 * Shortens an address to end at the street name (before first comma).
 * e.g. "123 Main St, San Francisco, CA" → "123 Main St"
 * Skips shortening for coordinates (lat,lng) or when the result would be only numbers.
 */
export function shortenToStreet(address) {
  if (!address || typeof address !== 'string') return ''
  const trimmed = address.trim()
  // Don't shorten coordinates (e.g. "37.7749,-122.4194") - would show only numbers
  if (/^-?\d+\.?\d*,\s*-?\d+\.?\d*$/.test(trimmed)) return trimmed
  const commaIdx = trimmed.indexOf(',')
  const beforeComma = commaIdx > 0 ? trimmed.slice(0, commaIdx).trim() : trimmed
  // If "before comma" is only numbers (e.g. "123" from "123, Main St"), use full address
  if (/^-?\d+\.?\d*$/.test(beforeComma)) return trimmed
  return beforeComma
}
