import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ImageWithFallback from '../ui/ImageWithFallback'
import useCartStore from '../../store/cartStore'
import { p } from '../../lib/theme'
import { CURRENCY } from '../../lib/constants'

const ProductCard = ({ product }) => {
  const [hovered, setHovered] = useState(false)
  const navigate = useNavigate()
  const { addItem } = useCartStore()

  const {
    id, name, sku,
    price_original, discount_percent, price_final,
    image_url, images_urls, is_new, brand, stock,
  } = product

  const mainImage = image_url || images_urls?.[0] || ''
  const segundaImagen = images_urls?.[1] || null
  const totalImagenes = images_urls?.length > 1 ? images_urls.length : 1

  const tieneDescuento = discount_percent > 0
  const precio = tieneDescuento ? price_final : price_original

  const handleAgregar = (e) => {
    e.preventDefault()
    e.stopPropagation()
    addItem({
      id, name,
      price: precio,
      originalPrice: price_original,
      image: image_url, sku,
      brand, quantity: 1, stock,
    })
    navigate('/checkout')
  }

  const handleCompartir = (e) => {
    e.preventDefault()
    e.stopPropagation()
    navigator.clipboard.writeText(window.location.origin + '/producto/' + id)
    alert('Enlace copiado')
  }

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
            borderRadius: '12px',
            overflow: 'hidden',
            transition:
              'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
            transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
            boxShadow: hovered
              ? '0 24px 60px -16px rgba(212, 120, 138, 0.3), 0 0 0 1px rgba(212, 120, 138, 0.16)'
              : '0 4px 18px rgba(26, 17, 24, 0.06), 0 0 0 1px rgba(212, 120, 138, 0.07)',
          }}
        >
          {/* ─── IMAGEN ─── */}
          <div
            className="relative overflow-hidden"
            style={{ aspectRatio: '4/5', background: p.roseMist }}
          >
            {/* Segunda imagen (detrás) */}
            {segundaImagen && (
              <div
                className="absolute inset-0"
                style={{
                  opacity: hovered ? 1 : 0,
                  transform: hovered ? 'scale(1.06)' : 'scale(1.02)',
                  transition:
                    'opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 1.1s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                <ImageWithFallback
                  src={segundaImagen}
                  alt={name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            )}

            {/* Primera imagen (encima) */}
            <div
              className="absolute inset-0"
              style={{
                opacity: hovered && segundaImagen ? 0 : 1,
                transform: hovered ? 'scale(1.05)' : 'scale(1)',
                transition:
                  'opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              <ImageWithFallback
                src={mainImage}
                alt={name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>

            {/* Contador de fotos */}
            {totalImagenes > 1 && (
              <span
                className="absolute top-3 right-3 z-10"
                style={{
                  background: 'rgba(255, 255, 255, 0.92)',
                  backdropFilter: 'blur(6px)',
                  padding: '0.2rem 0.55rem',
                  fontSize: '0.5rem', letterSpacing: '0.12em',
                  fontWeight: 600, color: p.ink, borderRadius: '50px',
                  fontFamily: 'var(--font-sans)',
                  boxShadow: '0 2px 8px rgba(26, 17, 24, 0.12)',
                }}
              >
                {hovered ? '2' : '1'} / {totalImagenes}
              </span>
            )}

            {is_new && (
              <span
                className="absolute top-3 left-3 z-10"
                style={{
                  fontSize: '0.45rem', padding: '0.25rem 0.6rem',
                  letterSpacing: '0.18em', textTransform: 'uppercase',
                  fontWeight: 600, color: '#FFFFFF', background: p.ink,
                  borderRadius: '50px',
                }}
              >
                Nuevo
              </span>
            )}

            {tieneDescuento && (
              <span
                className="absolute top-3 left-3 z-10"
                style={{
                  fontSize: '0.45rem', padding: '0.25rem 0.6rem',
                  letterSpacing: '0.18em', textTransform: 'uppercase',
                  fontWeight: 600, color: '#FFFFFF',
                  background: `linear-gradient(135deg, ${p.roseVivid}, ${p.coral})`,
                  borderRadius: '50px',
                  boxShadow: `0 4px 14px ${p.roseVivid}45`,
                  ...(is_new ? { top: '1.9rem' } : {}),
                }}
              >
                -{discount_percent}%
              </span>
            )}

            {/* Barra de acciones al hacer hover */}
            <div
              className="absolute inset-x-0 bottom-0 z-20"
              style={{
                transform: hovered ? 'translateY(0)' : 'translateY(100%)',
                transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                background:
                  'linear-gradient(to top, rgba(26, 17, 24, 0.85) 0%, rgba(26, 17, 24, 0.45) 55%, transparent 100%)',
                padding: '2.8rem 0.75rem 0.75rem',
                display: 'flex',
                justifyContent: 'flex-end',
              }}
            >
              <button
                onClick={handleCompartir}
                aria-label="Compartir"
                style={{
                  fontSize: '0.5rem', padding: '0.65rem 1rem',
                  letterSpacing: '0.15em', textTransform: 'uppercase',
                  fontWeight: 400, color: 'rgba(255,255,255,0.85)',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  cursor: 'pointer', borderRadius: '50px',
                  transition: 'all 0.3s ease',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem',
                  fontFamily: 'var(--font-sans)',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.7)'; e.currentTarget.style.color = '#FFFFFF' }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; e.currentTarget.style.color = 'rgba(255,255,255,0.85)' }}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Compartir
              </button>
            </div>
          </div>

          {/* ─── INFORMACIÓN ─── */}
          <div style={{ padding: '1.1rem 1.1rem 1.2rem' }}>
            {brand && (
              <p
                style={{
                  fontSize: '0.6rem', letterSpacing: '0.26em',
                  fontWeight: 600, color: p.roseDeep,
                  fontFamily: 'var(--font-sans)',
                  margin: '0 0 0.4rem',
                }}
              >
                {brand.toUpperCase()}
              </p>
            )}

            <h3
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '0.95rem', fontWeight: 400,
                color: p.ink, letterSpacing: '-0.01em',
                lineHeight: 1.35, margin: 0,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {name}
            </h3>

            {sku && (
              <p
                style={{
                  fontSize: '0.55rem', letterSpacing: '0.1em',
                  color: p.textSoft, fontWeight: 400, margin: '0.35rem 0 0',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                Código: {sku}
              </p>
            )}

            <div
              style={{
                height: '1px',
                background: `linear-gradient(90deg, ${p.roseBlush}55, transparent)`,
                marginTop: '0.6rem', marginBottom: '0.55rem',
              }}
            />

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.55rem' }}>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.3rem', fontWeight: 500,
                  color: p.roseVivid, letterSpacing: '-0.02em',
                }}
              >
                {CURRENCY} {precio?.toFixed(2)}
              </span>
              {tieneDescuento && (
                <span
                  style={{
                    fontSize: '0.7rem', color: p.textSoft,
                    textDecoration: 'line-through', fontWeight: 300, opacity: 0.55,
                  }}
                >
                  {CURRENCY} {price_original?.toFixed(2)}
                </span>
              )}
            </div>

            <button
              onClick={handleAgregar}
              style={{
                width: '100%', marginTop: '0.7rem',
                fontSize: '0.58rem', padding: '0.62rem 0',
                letterSpacing: '0.2em', textTransform: 'uppercase',
                fontWeight: 600, color: p.roseDeep,
                background: 'transparent',
                border: `1.5px solid ${p.roseBlush}75`,
                borderRadius: '50px',
                cursor: 'pointer',
                transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                fontFamily: 'var(--font-sans)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = `linear-gradient(135deg, ${p.roseVivid}, ${p.coral})`
                e.currentTarget.style.color = '#FFFFFF'
                e.currentTarget.style.borderColor = 'transparent'
                e.currentTarget.style.boxShadow = `0 8px 20px ${p.roseVivid}40`
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = p.roseDeep
                e.currentTarget.style.borderColor = `${p.roseBlush}75`
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              Agregar al carrito
            </button>
          </div>
        </article>
      </Link>
    </div>
  )
}

export default ProductCard
