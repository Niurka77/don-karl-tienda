import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

// ─── Paleta Aurora Bloom ─────────────────────────────────────────────────────
const p = {
  rose: '#E891A8',
  roseDeep: '#C9607F',
  roseVivid: '#FF5C8A',
  roseBlush: '#FFC2D4',
  roseMist: '#FFE8EF',
  champagne: '#E8D5B7',
  champagneLt: '#F5EBD9',
  ivory: '#FDF8F4',
  cream: '#FAF3ED',
  gold: '#C9A961',
  goldSoft: '#D4B87A',
  coral: '#FF8E72',
  ink: '#2D1F26',
  textMain: '#4A3340',
  textSoft: '#8B6F7A',
}

// ─── Mapeo de colores ────────────────────────────────────────────────────────
const COLOR_MAP = {
  negro: '#111111',
  blanco: '#F8F8F8',
  rojo: '#C0392B',
  rosa: '#E87D8F',
  dorado: '#C9A84C',
  plateado: '#B0B0B0',
  azul: '#2C5F8A',
  verde: '#2E7D32',
  beige: '#D4C5A9',
  marrón: '#6D4C41',
  gris: '#78909C',
  amarillo: '#F9A825',
  naranja: '#E64A19',
  morado: '#6A1B9A',
  vino: '#6D1F2E',
  turquesa: '#00897B',
}

const getColorHex = (name) => COLOR_MAP[name?.toLowerCase()] ?? p.rose

// ─── Mini estrellas ──────────────────────────────────────────────────────────
const MiniStars = ({ rating }) => (
  <div className="flex gap-0.5" role="img" aria-label={`${rating} de 5 estrellas`}>
    {[1, 2, 3, 4, 5].map((s) => (
      <svg
        key={s}
        className="w-3 h-3"
        viewBox="0 0 24 24"
        aria-hidden
        style={{
          fill: s <= Math.round(rating) ? p.gold : `${p.roseBlush}40`,
        }}
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ))}
  </div>
)

// ─── ProductCard ─────────────────────────────────────────────────────────────
const ProductCard = ({ product }) => {
  const [avgRating, setAvgRating] = useState(null)
  const [reviewCount, setReviewCount] = useState(0)
  const [loadingReviews, setLoadingReviews] = useState(true)
  const [hovered, setHovered] = useState(false)

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
  const precio = tieneDescuento ? price_final : price_original
  const colores = color ? color.split(',').map(c => c.trim()).filter(Boolean) : []

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
          background: p.ivory,
          transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.6s ease',
          transform: hovered ? 'translateY(-8px) scale(1.01)' : 'translateY(0) scale(1)',
          boxShadow: hovered
            ? `0 25px 70px -15px ${p.roseBlush}50, 0 10px 30px -10px ${p.ink}15, 0 0 0 1px ${p.roseBlush}30`
            : `0 4px 20px ${p.ink}08, 0 0 0 1px ${p.champagne}30`,
          borderRadius: '6px',
          overflow: 'hidden',
        }}
      >
        {/* ── IMAGEN ── */}
        <div
          className="relative overflow-hidden"
          style={{ aspectRatio: '4/5', background: p.roseMist }}
        >
          {/* Foto */}
          <img
            src={image_url || 'https://via.placeholder.com/600x750?text=KB+Dresses'}
            alt={name}
            className="w-full h-full object-cover"
            style={{
              transition: 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
              transform: hovered ? 'scale(1.08)' : 'scale(1)',
            }}
            loading="lazy"
          />

          {/* Velo oscuro suave al hover */}
          <div
            className="absolute inset-0 transition-opacity duration-500"
            style={{
              background: `linear-gradient(180deg, transparent 40%, ${p.ink}50 100%)`,
              opacity: hovered ? 1 : 0,
            }}
          />

          {/* ── BADGES superiores ── */}
          <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5">
            {is_new && (
              <span
                className="animate-fade-in"
                style={{
                  fontSize: '0.55rem',
                  padding: '0.25rem 0.65rem',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  color: p.ivory,
                  background: `linear-gradient(135deg, ${p.roseVivid} 0%, ${p.coral} 100%)`,
                  borderRadius: '3px',
                  boxShadow: `0 4px 14px ${p.roseVivid}40`,
                }}
              >
                Nuevo
              </span>
            )}
            {tieneDescuento && (
              <span
                className="animate-fade-in"
                style={{
                  fontSize: '0.55rem',
                  padding: '0.25rem 0.65rem',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  color: p.ivory,
                  background: `linear-gradient(135deg, ${p.gold} 0%, ${p.goldSoft} 100%)`,
                  borderRadius: '3px',
                  boxShadow: `0 4px 14px ${p.gold}40`,
                }}
              >
                −{discount_percent}%
              </span>
            )}
          </div>

          {/* SKU esquina derecha */}
          {sku && (
            <div className="absolute top-3 right-3 z-20">
              <span
                style={{
                  background: `${p.ink}70`,
                  backdropFilter: 'blur(10px)',
                  color: p.champagneLt,
                  fontSize: '0.55rem',
                  padding: '0.22rem 0.6rem',
                  letterSpacing: '0.18em',
                  borderRadius: '3px',
                  fontWeight: 500,
                }}
              >
                {sku.slice(-4)}
              </span>
            </div>
          )}

          {/* ── OVERLAY DE ACCIONES (hover) ── */}
          <div
            className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-center gap-2.5 pb-5 transition-all duration-500"
            style={{
              opacity: hovered ? 1 : 0,
              transform: hovered ? 'translateY(0)' : 'translateY(16px)',
            }}
          >
            {/* Botón principal */}
            <button
              className="group/btn relative overflow-hidden"
              style={{
                fontSize: '0.62rem',
                padding: '0.7rem 1.8rem',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                fontWeight: 600,
                color: p.ivory,
                background: `linear-gradient(135deg, ${p.roseVivid} 0%, ${p.coral} 50%, ${p.goldSoft} 100%)`,
                border: 'none',
                borderRadius: '50px',
                cursor: 'pointer',
                boxShadow: `0 8px 24px ${p.roseVivid}50`,
                transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
              onClick={(e) => e.preventDefault()}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)'
                e.currentTarget.style.boxShadow = `0 12px 32px ${p.roseVivid}70`
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.boxShadow = `0 8px 24px ${p.roseVivid}50`
              }}
            >
              <span className="relative z-10 flex items-center gap-2">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Agregar
              </span>
              {/* Shimmer effect */}
              <span
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)',
                  transform: hovered ? 'translateX(120%)' : 'translateX(-120%)',
                  transition: 'transform 1s ease',
                }}
              />
            </button>

           
          </div>
        </div>

        {/* ── INFO ── */}
        <div className="px-4 pt-4 pb-5 space-y-2.5">
          {/* Marca */}
          {brand && (
            <p
              style={{
                color: p.roseDeep,
                fontSize: '0.58rem',
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                fontWeight: 600,
                fontFamily: 'ui-sans-serif, system-ui, sans-serif',
              }}
            >
              {brand}
            </p>
          )}

          {/* Nombre */}
          <h3
            className="leading-snug line-clamp-2 transition-colors duration-400"
            style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontSize: '1.05rem',
              fontWeight: 400,
              color: hovered ? p.roseDeep : p.textMain,
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
                  className="transition-transform duration-300 hover:scale-125 cursor-pointer"
                  style={{
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    background: getColorHex(c),
                    border: `1.5px solid ${p.ivory}`,
                    boxShadow: `0 1px 4px ${p.ink}20, 0 0 0 1px ${p.ink}10`,
                  }}
                />
              ))}
              {colores.length > 5 && (
                <span
                  style={{ color: p.textSoft, fontSize: '0.65rem', fontWeight: 300 }}
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
                  color: p.textSoft,
                  fontWeight: 300,
                }}
              >
                ({reviewCount})
              </span>
            </div>
          )}

          {/* Precio */}
          <div
            className="flex items-baseline gap-2.5 pt-2.5"
            style={{ borderTop: `1px solid ${p.roseBlush}30` }}
          >
            <span
              style={{
                fontFamily: 'Georgia, serif',
                fontSize: '1.35rem',
                fontWeight: 400,
                color: p.roseDeep,
                letterSpacing: '-0.02em',
              }}
            >
              S/ {precio?.toFixed(2)}
            </span>
            {tieneDescuento && (
              <span
                style={{
                  fontSize: '0.85rem',
                  color: p.textSoft,
                  textDecoration: 'line-through',
                  fontWeight: 300,
                  opacity: 0.6,
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