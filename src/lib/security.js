// Utilidades de seguridad compartidas.

const SAFE_URL_PROTOCOLS = ['http:', 'https:', 'mailto:', 'tel:']

/**
 * Valida una URL provista por el usuario/admin antes de usarla en `href`.
 * Bloquea esquemas peligrosos como `javascript:` o `data:` que permitirían
 * XSS almacenado. Devuelve `fallback` (por defecto null) si la URL no es segura.
 */
export const sanitizeUrl = (url, fallback = null) => {
  if (typeof url !== 'string') return fallback
  const trimmed = url.trim()
  if (!trimmed) return fallback

  // Permitir rutas relativas (no tienen esquema y no pueden ejecutar JS).
  if (trimmed.startsWith('/') || trimmed.startsWith('#') || trimmed.startsWith('?')) {
    return trimmed
  }

  try {
    const parsed = new URL(trimmed, window.location.origin)
    if (SAFE_URL_PROTOCOLS.includes(parsed.protocol)) {
      return trimmed
    }
  } catch {
    return fallback
  }

  return fallback
}

/**
 * Escapa los comodines de LIKE/ILIKE (`%`, `_`, `\`) en la entrada del usuario
 * para que la búsqueda trate esos caracteres como literales.
 */
export const escapeLike = (value) => {
  if (typeof value !== 'string') return ''
  return value.replace(/[\\%_]/g, (c) => `\\${c}`)
}
