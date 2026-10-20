import { useState } from 'react'
import ImageWithFallback from '../ui/ImageWithFallback'
import { p } from '../../lib/theme'
import { CURRENCY } from '../../lib/constants'
import { Link, useNavigate } from 'react-router-dom'

const ProductCard = ({ product }) => {
  const imageUrl = product.images_urls && product.images_urls.length > 0
    ? product.images_urls[0]
    : product.image_url || ''

  const hasDiscount = product.discount_percent > 0
  const finalPrice = hasDiscount ? product.price_final : product.price_original
  const isNew = product.is_new === true

  return (
    <div
      className="group aspect-[4/5] bg-white rounded-sm overflow-hidden border border-[rgba(212,120,138,0.08)] transition-all duration-300 hover:shadow-sm hover:-translate-y-1"
    >
      {/* Imagen */}
      <div className="relative">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Segunda imagen al pasar el mouse */}
        {product.images_urls && product.images_urls.length > 1 && (
          <div
            className="absolute inset-0 group-hover:opacity-100 transition-opacity"
            style={{ background: `url(${product.images_urls[1]}) center/cover` }}
          />
        )}

        {/* Insignias sobre la imagen */}
        <div className="absolute top-2 left-2 flex gap-1">
          {isNew && (
            <span className="badge-new text-[0.5rem] px-2 py-0.5 rounded">NUEVO</span>
          )}
          {hasDiscount && (
            <span className="text-[0.5rem] px-2 py-0.5 rounded" style={{ background: p.roseRed, color: '#FFFFFF' }}>
              -{product.discount_percent}%
            </span>
          )}
        </div>

        {/* Etiqueta de origen */}
        {product.origin && (
          <div className="absolute top-2 right-2 px-2 py-0.5 rounded text-[0.5rem] font-medium">
            {product.origin === 'importado' ? 'Importado' : 'Nacional'}
          </div>
        )}
      </div>

      {/* Info debajo de la imagen */}
      <div className="p-3">
        <p className="text-caption text-[0.55rem] uppercase tracking-wider text-[var(--color-kb-mauve)] mb-1">
          {product.brand || product.category || ''}
        </p>
        <h3 className="line-clamp-2 text-[0.7rem] font-medium text-[var(--color-kb-charcoal)] mb-1">
          {product.name}
        </h3>

        {/* Precio */}
        <div className="flex items-baseline gap-1 mb-2">
          <span className="font-medium text-[0.8rem] text-[var(--color-kb-charcoal)]">
            S/ {finalPrice.toFixed(2)}
          </span>
          {hasDiscount && (
            <span className="line-through text-[0.55rem] text-[var(--color-kb-mauve)] opacity-60">
              S/ {product.price_original?.toFixed(2)}
            </span>
          )}
          {hasDiscount && (
            <span className="badge-sale text-[0.45rem] ml-1">-{product.discount_percent}%</span>
          )}
        </div>
        <span className="text-caption text-[0.5rem] text-[var(--color-kb-mauve)] ml-1">
          {product.color ? `Color: ${product.color}` : ''}
        </span>
      </div>

      {/* Botones de acción */}
      <div className="p-3 border-t border-[rgba(212,120,138,0.08)] flex justify-between items-center">
        <button
          onClick={() => navigate(`/producto/${product.id}`)}
          className="text-[0.6rem] text-[var(--color-kb-rose)] underline transition-colors hover:underline"
        >
          Ver detalles
        </button>
        <button
          onClick={() => {
            const msg = `Hola, me interesa el producto "${product.name}" (${product.sku || 'sin código'}) que vi en el catálogo. ¿Está disponible?`
            window.open(`https://wa.me/51906877812?text=${encodeURIComponent(msg)}`, '_blank')
          }}
          className="text-[0.6rem] text-[var(--color-kb-gold)] underline transition-colors hover:underline"
        >
          Consultar por WhatsApp
        </button>
      </div>
    </div>
  )
}

export default ProductCard