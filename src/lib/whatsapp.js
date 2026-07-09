// Shared WhatsApp helpers.
// Centralizes the store phone number and the wa.me URL construction that was
// previously duplicated across components and pages.

export const STORE_PHONE = '51906877812'

// Builds a wa.me deep link with an optional pre-filled, URL-encoded message.
export const buildWhatsAppUrl = (phone = STORE_PHONE, message = '') => {
  const digits = String(phone).replace(/\D/g, '')
  const base = `https://wa.me/${digits}`
  return message ? `${base}?text=${encodeURIComponent(message)}` : base
}
