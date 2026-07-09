// Shared formatting helpers.
// Centralizes price/discount/date formatting that was previously duplicated
// across pages and components.

// Formats a numeric value as a price string, e.g. formatPrice(12) -> "S/ 12.00".
// `separator` sits between the currency symbol and the amount (defaults to a
// space, matching the "S/ 12.00" style; pass '' for the "$12.00" style).
// Returns `fallback` when the value is not a finite number.
export const formatPrice = (
  value,
  { currency = 'S/', separator = ' ', fallback = '' } = {},
) => {
  const number = Number(value)
  if (!Number.isFinite(number)) return fallback
  return `${currency}${separator}${number.toFixed(2)}`
}

// Applies a percentage discount to an original price and returns the final price
// as a number. Accepts strings or numbers; invalid input is treated as 0.
export const computeFinalPrice = (originalPrice, discountPercent) => {
  const price = parseFloat(originalPrice) || 0
  const discount = parseInt(discountPercent) || 0
  return discount > 0 ? price * (1 - discount / 100) : price
}

// Formats an ISO date string (or Date) using the es-PE locale.
// Returns `fallback` when the value is missing or invalid.
export const formatDate = (value, options = {}, fallback = '-') => {
  if (!value) return fallback
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return fallback
  return date.toLocaleDateString('es-PE', options)
}
