import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

/* ─────────────────────────────────────────
   Mapeo de colores
───────────────────────────────────────── */
const COLOR_MAP = {
  negro:    '#111111',
  blanco:   '#F8F8F8',
  rojo:     '#C0392B',
  rosa:     '#E87D8F',
  dorado:   '#C9A84C',
  plateado: '#B0B0B0',
  azul:     '#2C5F8A',
  verde:    '#2E7D32',
  beige:    '#D4C5A9',
  marrón:   '#6D4C41',
  gris:     '#78909C',
  amarillo: '#F9A825',
  naranja:  '#E64A19',
  morado:   '#6A1B9A',
  vino:     '#6D1F2E',
  turquesa: '#00897B',
}

const getColorHex = (name) =>
  COLOR_MAP[name?.toLowerCase()] ?? 'var(--color-kb-rose)'

/* ─────────────────────────────────────────
   Mini estrellas
───────────────────────────────────────── */
const MiniStars = ({ rating }) => (
  <div className="flex gap-0.5" role="img" aria-label={`${rating} de 5 estrellas`}>
    {[1, 2, 3, 4, 5].map((s) => (
      <svg
        key={s}
        className="w-3 h-3"
        viewBox="0 0 24 24"
        aria-hidden
        style={{
          fill: s <= Math.round(rating) ? 'var(--color-kb-gold)' : 'rgba(180,160,170,0.25)',
        }}
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ))}
  </div>
)

/* ─────────────────────────────────────────
   ProductCard
───────────────────────────────────────── */
const ProductCard = ({ product }) => {
  const [avgRating, setAvgRating]       = useState(null)
  const [reviewCount, setReviewCount]   = useState(0)
  const [loadingReviews, setLoadingReviews] = useState(true)
  const [hovered, setHovered]           = useState(false)

  useEffect(() => {
    let cancelled = false
    const fetchReviews = async () => {
      try {
        const { data, error } = await supabase
          .from('reviews')
          .select('rating')
          .eq('product_id', product.id)
        if (cancelled) return
        if (!error && data?.length) {
          const avg = data.reduce((a, r) => a + r.rating, 0) / data.length
          setAvgRating(avg.toFixed(1))
          setReviewCount(data.length)
        }
      } catch (e) {
        if (!cancelled) console.error('Error reviews:', e)
      } finally {
        if (!cancelled) setLoadingReviews(false)
      }
    }
    fetchReviews()
    return () => { cancelled = true }
  }, [product.id])

  const {
    id, name,
    price_original, discount_percent, price_final,
    image_url, is_new, sku, brand, color,
  } = product

  const tieneDescuento = discount_percent > 0
  const precio         = tieneDescuento ? price_final : price_original
  const colores        = color ? color.split(',').map(c => c.trim()).filter(Boolean) : []

  return (
    <Link
      to={`/producto/${id}`}
      className="group block"
      aria-label={`Ver ${name}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <article
        style={{
          background: 'white',
          transition: 'transform 0.5s cubic-bezier(0.16,1,0.3,1), box-shadow 0.5s ease',
          transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
          boxShadow: hovered
            ? '0 20px 60px rgba(26,17,24,0.1), 0 4px 16px rgba(212,120,138,0.08)'
            : '0 2px 12px rgba(26,17,24,0.05)',
        }}
      >

        {/* ── IMAGEN ── */}
        <div
          className="relative overflow-hidden"
          style={{ aspectRatio: '4/5', background: 'var(--color-kb-blush)' }}
        >
          {/* Foto */}
          <img
            src={image_url || 'https://via.placeholder.com/600x750?text=KB+Dresses'}
            alt={name}
            className="w-full h-full object-cover"
            style={{
              transition: 'transform 0.7s cubic-bezier(0.16,1,0.3,1)',
              transform: hovered ? 'scale(1.07)' : 'scale(1)',
            }}
            loading="lazy"
          />

          {/* Velo oscuro suave al hover */}
          <div
            className="absolute inset-0 transition-opacity duration-400"
            style={{
              background: 'linear-gradient(180deg, rgba(26,17,24,0) 50%, rgba(26,17,24,0.55) 100%)',
              opacity: hovered ? 1 : 0,
            }}
          />

          {/* ── BADGES superiores ── */}
          <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5">
            {is_new && (
              <span
                className="badge-new animate-fade-in"
                style={{ fontSize: '0.55rem', padding: '0.22rem 0.6rem' }}
              >
                Nuevo
              </span>
            )}
            {tieneDescuento && (
              <span
                className="badge-sale animate-fade-in"
                style={{ fontSize: '0.55rem', padding: '0.22rem 0.6rem' }}
              >
                −{discount_percent}%
              </span>
            )}
          </div>

          {/* SKU esquina derecha */}
          {sku && (
            <div className="absolute top-3 right-3 z-20">
              <span
                className="text-editorial"
                style={{
                  background: 'rgba(26,17,24,0.65)',
                  backdropFilter: 'blur(8px)',
                  color: 'rgba(242,196,206,0.7)',
                  fontSize: '0.55rem',
                  padding: '0.2rem 0.55rem',
                  letterSpacing: '0.18em',
                  borderRadius: '1px',
                }}
              >
                {sku.slice(-4)}
              </span>
            </div>
          )}

          {/* ── OVERLAY DE ACCIONES (hover) ── */}
          <div
            className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-center gap-2 pb-4 transition-all duration-400"
            style={{
              opacity: hovered ? 1 : 0,
              transform: hovered ? 'translateY(0)' : 'translateY(12px)',
            }}
          >
            {/* Botón principal */}
            <button
              className="btn-kb-accent flex items-center gap-2"
              style={{ fontSize: '0.62rem', padding: '0.65rem 1.6rem', letterSpacing: '0.16em' }}
              onClick={(e) => e.preventDefault()}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              Agregar
            </button>

            {/* Iconos secundarios */}
            <div className="flex items-center gap-2">
              {[
                {
                  label: 'Vista rápida',
                  icon: (
                    <>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </>
                  ),
                },
                {
                  label: 'Favoritos',
                  icon: (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  ),
                },
              ].map((btn) => (
                <button
                  key={btn.label}
                  aria-label={btn.label}
                  className="transition-all duration-300"
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'rgba(253,250,249,0.92)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-kb-charcoal)',
                    border: '1px solid rgba(212,120,138,0.15)',
                  }}
                  onClick={(e) => e.preventDefault()}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'var(--color-kb-rose)'
                    e.currentTarget.style.color = 'white'
                    e.currentTarget.style.transform = 'scale(1.1)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(253,250,249,0.92)'
                    e.currentTarget.style.color = 'var(--color-kb-charcoal)'
                    e.currentTarget.style.transform = 'scale(1)'
                  }}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {btn.icon}
                  </svg>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── INFO ── */}
        <div className="px-4 pt-4 pb-5 space-y-2.5">

          {/* Marca */}
          {brand && (
            <p
              className="text-editorial"
              style={{
                color: 'var(--color-kb-rose)',
                fontSize: '0.6rem',
                letterSpacing: '0.22em',
              }}
            >
              {brand}
            </p>
          )}

          {/* Nombre */}
          <h3
            className="leading-snug line-clamp-2 transition-colors duration-300"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1rem',
              fontWeight: 400,
              color: hovered ? 'var(--color-kb-rose-deep)' : 'var(--color-kb-charcoal)',
              letterSpacing: '-0.01em',
            }}
          >
            {name}
          </h3>

          {/* Colores */}
          {colores.length > 0 && (
            <div className="flex items-center gap-2 pt-0.5">
              {colores.slice(0, 5).map((c, i) => (
                <div
                  key={i}
                  title={c}
                  aria-label={`Color: ${c}`}
                  className="transition-transform duration-200 hover:scale-125 cursor-pointer"
                  style={{
                    width: '13px',
                    height: '13px',
                    borderRadius: '50%',
                    background: getColorHex(c),
                    border: '1.5px solid rgba(26,17,24,0.12)',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                  }}
                />
              ))}
              {colores.length > 5 && (
                <span
                  style={{ color: 'var(--color-kb-mauve)', fontSize: '0.65rem', fontWeight: 300 }}
                >
                  +{colores.length - 5}
                </span>
              )}
            </div>
          )}

          {/* Rating */}
          {!loadingReviews && avgRating && reviewCount > 0 && (
            <div className="flex items-center gap-2">
              <MiniStars rating={parseFloat(avgRating)} />
              <span
                style={{
                  fontSize: '0.7rem',
                  color: 'var(--color-kb-mauve)',
                  fontWeight: 300,
                }}
              >
                ({reviewCount})
              </span>
            </div>
          )}

          {/* Precio */}
          <div
            className="flex items-baseline gap-2 pt-2"
            style={{ borderTop: '1px solid rgba(212,120,138,0.12)' }}
          >
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.3rem',
                fontWeight: 400,
                color: 'var(--color-kb-rose-deep)',
                letterSpacing: '-0.02em',
              }}
            >
              S/ {precio?.toFixed(2)}
            </span>
            {tieneDescuento && (
              <span
                style={{
                  fontSize: '0.8rem',
                  color: 'var(--color-kb-mauve)',
                  textDecoration: 'line-through',
                  fontWeight: 300,
                  opacity: 0.7,
                }}
              >
                S/ {price_original?.toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  )
}

export default ProductCard
