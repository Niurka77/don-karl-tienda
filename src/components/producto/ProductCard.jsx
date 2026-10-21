import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ImageWithFallback from '../ui/ImageWithFallback'
import useCartStore from '../../store/cartStore'
import { p } from '../../lib/theme'
import { CURRENCY } from '../../lib/constants'

const RED = 'var(--color-kb-red, #E60000)'

const fmt = (n) => `${CURRENCY} ${Number(n || 0).toFixed(2)}`

// Tarjeta de producto: estructura limpia estilo catálogo de tienda por departamentos.
// Imagen 4:5 · marca · nombre (2 líneas) · precio final y tachado · rating compacto.
const ProductCard = ({ product, avgRating, reviewCount }) => {
  const [hovered, setHovered] = useState(false)
  const navigate = useNavigate()
  const { addItem } = useCartStore()

  const {
    id, name, sku, color,
    price_original, discount_percent, price_final,
    image_url, images_urls, is_new, brand, stock,
  } = product

  const mainImage = image_url || images_urls?.[0] || ''
  const segundaImagen = images_urls?.[1] || null
  const tieneDescuento = discount_percent > 0
  const precio = tieneDescuento ? price_final : price_original
  const agotado = Number(stock) <= 0
  const pocasUnidades = !agotado && Number(stock) <= 3

  const handleAgregar = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (agotado) return
    addItem({
      id, name,
      price: precio,
      originalPrice: price_original,
      image: image_url, sku,
      brand, quantity: 1, stock,
    })
    navigate('/checkout')
  }

  return (
    <article
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
    >
      <Link to={`/producto/${id}`} aria-label={`Ver ${name}`} className="block" style={{ flex: 1 }}>
        {/* Imagen */}
        <div
          className="relative overflow-hidden"
          style={{ aspectRatio: '4/5', background: p.roseMist, borderRadius: '4px' }}
        >
          <ImageWithFallback
            src={mainImage}
            alt={name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          {segundaImagen && (
            <div
              className="absolute inset-0 hidden md:block"
              style={{ opacity: hovered ? 1 : 0, transition: 'opacity 0.35s ease' }}
            >
              <ImageWithFallback
                src={segundaImagen}
                alt=""
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          )}

          {is_new && (
            <span
              className="absolute top-2 left-2"
              style={{
                fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.08em',
                textTransform: 'uppercase', color: '#fff', background: p.ink,
                padding: '0.2rem 0.5rem', borderRadius: '2px',
                fontFamily: 'var(--font-sans)',
              }}
            >
              Nuevo
            </span>
          )}

          {tieneDescuento && (
            <span
              className="absolute top-2 right-2"
              style={{
                fontSize: '0.7rem', fontWeight: 700, color: '#fff', background: RED,
                padding: '0.2rem 0.45rem', borderRadius: '2px',
                fontFamily: 'var(--font-sans)',
              }}
            >
              -{discount_percent}%
            </span>
          )}

          {agotado && (
            <div
              className="absolute inset-x-0 bottom-0 text-center"
              style={{
                background: 'rgba(255,255,255,0.9)', color: p.ink, fontSize: '0.7rem',
                fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
                padding: '0.4rem 0', fontFamily: 'var(--font-sans)',
              }}
            >
              Agotado
            </div>
          )}
        </div>

        {/* Información */}
        <div style={{ paddingTop: '0.65rem' }}>
          {brand && (
            <p style={{
              fontSize: '0.65rem', letterSpacing: '0.12em', fontWeight: 600,
              color: p.textSoft, margin: '0 0 0.2rem', textTransform: 'uppercase',
              fontFamily: 'var(--font-sans)',
            }}>
              {brand}
            </p>
          )}

          <h3 style={{
            fontFamily: 'var(--font-sans)', fontSize: '0.85rem', fontWeight: 400,
            color: p.ink, lineHeight: 1.35, margin: 0, minHeight: '2.3em',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {name}
          </h3>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.35rem' }}>
            <span style={{
              fontFamily: 'var(--font-sans)', fontSize: '1.05rem', fontWeight: 700,
              color: tieneDescuento ? RED : p.ink,
            }}>
              {fmt(precio)}
            </span>
            {tieneDescuento && (
              <span style={{ fontSize: '0.75rem', color: p.textSoft, textDecoration: 'line-through' }}>
                {fmt(price_original)}
              </span>
            )}
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap',
            marginTop: '0.3rem', fontSize: '0.68rem', color: p.textSoft,
            fontFamily: 'var(--font-sans)',
          }}>
            {reviewCount > 0 && (
              <span>
                <span style={{ color: 'var(--color-kb-gold, #C9A84C)' }}>★</span> {avgRating} ({reviewCount})
              </span>
            )}
            {color && <span>{color}</span>}
            {sku && <span>Cód. {sku}</span>}
            {pocasUnidades && <span style={{ color: RED, fontWeight: 600 }}>¡Últimas unidades!</span>}
          </div>
        </div>
      </Link>

      <button
        onClick={handleAgregar}
        disabled={agotado}
        style={{
          width: '100%',
          fontSize: '0.7rem', padding: '0.6rem 0', letterSpacing: '0.1em',
          textTransform: 'uppercase', fontWeight: 600,
          color: agotado ? p.textSoft : p.roseDeep, background: 'transparent',
          border: `1px solid ${agotado ? 'rgba(0,0,0,0.12)' : p.roseDeep}`,
          borderRadius: '4px', cursor: agotado ? 'not-allowed' : 'pointer',
          fontFamily: 'var(--font-sans)', marginTop: '0.7rem',
        }}
      >
        {agotado ? 'Agotado' : 'Agregar al carrito'}
      </button>
    </article>
  )
}

export default ProductCard
