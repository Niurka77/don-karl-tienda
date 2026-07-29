import { useState } from 'react'
import { Link } from 'react-router-dom'
import ImageWithFallback from '../ui/ImageWithFallback'
import { p } from '../../lib/theme'
import { WHATSAPP_PHONE, CURRENCY } from '../../lib/constants'

const ProductCard = ({ product }) => {
  const [hovered, setHovered] = useState(false)

  const {
    id, name, sku,
    price_original, discount_percent, price_final,
    image_url, images_urls, is_new, brand, category, stock,
  } = product

  const mainImage = image_url || images_urls?.[0] || ''

  const tieneDescuento = discount_percent > 0
  const precio = tieneDescuento ? price_final : price_original

  const productUrl = `${window.location.origin}/producto/${id}`
  const whatsappText = `${sku ? `*${sku}*` : ''} - ${name} | ${CURRENCY} ${precio?.toFixed(2)} | ${productUrl}`
  const whatsappUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(whatsappText)}`

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ position: 'relative' }}
    >
      <Link
        to={`/producto/${id}`}
        className="block"
        aria-label={`Ver ${name}`}
      >
        <article
          style={{
            background: '#FFFFFF',
            transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
            transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
            boxShadow: hovered
              ? '0 20px 60px -12px rgba(26, 17, 24, 0.15), 0 0 0 1px rgba(212, 120, 138, 0.12)'
              : '0 2px 12px rgba(26, 17, 24, 0.04), 0 0 0 1px rgba(212, 120, 138, 0.06)',
          }}
        >
          <div
            className="relative overflow-hidden"
            style={{ aspectRatio: '4/5', background: p.roseMist }}
          >
            <ImageWithFallback
              src={mainImage}
              alt={name}
              className="w-full h-full object-cover"
              style={{
                transition: 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
                transform: hovered ? 'scale(1.05)' : 'scale(1)',
              }}
              loading="lazy"
            />

            {is_new && (
              <span
                className="absolute top-3 left-3 z-10"
                style={{
                  fontSize: '0.45rem', padding: '0.2rem 0.55rem',
                  letterSpacing: '0.18em', textTransform: 'uppercase',
                  fontWeight: 600, color: '#FFFFFF', background: p.ink,
                  borderRadius: '1px',
                }}
              >
                Nuevo
              </span>
            )}

            {tieneDescuento && (
              <span
                className="absolute top-3 left-3 z-10"
                style={{
                  fontSize: '0.45rem', padding: '0.2rem 0.55rem',
                  letterSpacing: '0.18em', textTransform: 'uppercase',
                  fontWeight: 600, color: '#FFFFFF', background: p.red,
                  borderRadius: '1px',
                  ...(is_new ? { top: '1.6rem' } : {}),
                }}
              >
                -{discount_percent}%
              </span>
            )}

            {sku && (
              <div
                className="absolute bottom-3 right-3 z-10"
                style={{
                  background: 'rgba(255,255,255,0.92)',
                  backdropFilter: 'blur(6px)',
                  padding: '0.15rem 0.5rem',
                  fontSize: '0.5rem', letterSpacing: '0.08em',
                  color: p.textSoft, fontWeight: 500, borderRadius: '1px',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                {sku}
              </div>
            )}

            <div
              className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 p-6"
              style={{
                background: 'rgba(26, 17, 24, 0.55)',
                backdropFilter: 'blur(2px)',
                opacity: hovered ? 1 : 0,
                transition: 'opacity 0.4s ease',
              }}
            >
              <button
                onClick={(e) => { e.preventDefault(); window.open(whatsappUrl, '_blank') }}
                style={{
                  fontSize: '0.6rem', padding: '0.7rem 1.6rem',
                  letterSpacing: '0.18em', textTransform: 'uppercase',
                  fontWeight: 600, color: p.ink, background: '#FFFFFF',
                  border: 'none', cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = p.roseBlush }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#FFFFFF' }}
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Cotizar
              </button>

              <button
                onClick={(e) => { e.preventDefault(); const u = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(whatsappText)}`; window.open(u, '_blank') }}
                style={{
                  fontSize: '0.5rem', padding: '0.45rem 1.2rem',
                  letterSpacing: '0.15em', textTransform: 'uppercase',
                  fontWeight: 400, color: 'rgba(255,255,255,0.8)',
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.25)',
                  cursor: 'pointer', transition: 'all 0.3s ease',
                  display: 'flex', alignItems: 'center', gap: '0.35rem',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.6)'; e.currentTarget.style.color = '#FFFFFF' }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; e.currentTarget.style.color = 'rgba(255,255,255,0.8)' }}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Compartir
              </button>
            </div>
          </div>

          <div style={{ padding: '0.85rem 0.9rem 1rem' }}>
            {brand && (
              <p
                style={{
                  fontSize: '0.55rem', letterSpacing: '0.22em',
                  fontWeight: 600, color: p.textSoft,
                  fontFamily: 'var(--font-sans)',
                  margin: '0 0 0.15rem',
                }}
              >
                {brand.toUpperCase()}
              </p>
            )}

            <h3
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '0.85rem', fontWeight: 400,
                color: p.ink, letterSpacing: '-0.01em',
                lineHeight: 1.3, margin: 0,
              }}
            >
              {name}
            </h3>

            {sku && (
              <p
                style={{
                  fontSize: '0.5rem', letterSpacing: '0.08em',
                  color: p.textSoft, fontWeight: 400, margin: '0.2rem 0 0',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                Código: {sku}
              </p>
            )}

            <div
              style={{
                height: '1px',
                background: `linear-gradient(90deg, ${p.red}30, transparent)`,
                marginTop: '0.5rem', marginBottom: '0.4rem',
              }}
            />

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.1rem', fontWeight: 500,
                  color: p.red, letterSpacing: '-0.02em',
                }}
              >
                {CURRENCY} {precio?.toFixed(2)}
              </span>
              {tieneDescuento && (
                <span
                  style={{
                    fontSize: '0.65rem', color: p.textSoft,
                    textDecoration: 'line-through', fontWeight: 300, opacity: 0.5,
                  }}
                >
                  {CURRENCY} {price_original?.toFixed(2)}
                </span>
              )}
            </div>

            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.open(whatsappUrl, '_blank') }}
              style={{
                fontSize: '0.5rem', padding: '0.5rem 0',
                letterSpacing: '0.18em', textTransform: 'uppercase',
                fontWeight: 600, color: p.red, background: 'transparent',
                border: 'none', borderTop: `1px solid ${p.red}15`,
                cursor: 'pointer', transition: 'all 0.3s ease',
                width: '100%', textAlign: 'center', marginTop: '0.25rem',
                fontFamily: 'var(--font-sans)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = p.roseDeep; e.currentTarget.style.borderTopColor = `${p.roseDeep}30` }}
              onMouseLeave={(e) => { e.currentTarget.style.color = p.red; e.currentTarget.style.borderTopColor = `${p.red}15` }}
            >
              Cotizar por WhatsApp
            </button>
          </div>
        </article>
      </Link>
    </div>
  )
}

export default ProductCard
