import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

const ProductCard = ({ product }) => {
  const [avgRating, setAvgRating] = useState(null)
  const [reviewCount, setReviewCount] = useState(0)
  const [loadingReviews, setLoadingReviews] = useState(true)

  useEffect(() => {
    let cancelled = false
    
    const fetchReviews = async () => {
      try {
        const { data, error } = await supabase
          .from('reviews')
          .select('rating')
          .eq('product_id', product.id)

        // ✅ Si el componente se desmontó, no actualizar estado
        if (cancelled) return

        if (!error && data) {
          setReviewCount(data.length)
          if (data.length > 0) {
            const avg = data.reduce((acc, r) => acc + r.rating, 0) / data.length
            setAvgRating(avg.toFixed(1))
          }
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Error loading reviews for product card:', err)
        }
      } finally {
        if (!cancelled) {
          setLoadingReviews(false)
        }
      }
    }

    fetchReviews()
    
    // ✅ Cleanup para evitar memory leaks y warnings
    return () => {
      cancelled = true
    }
  }, [product.id])

  const {
    id,
    name,
    price_original,
    discount_percent,
    price_final,
    image_url,
    is_new,
    sku,
    brand,
    color,
  } = product

  const tieneDescuento = discount_percent > 0
  const precioMostrar = tieneDescuento ? price_final : price_original

  const getColorArray = () => {
    if (!color) return []
    return color.split(',').map(c => c.trim()).filter(c => c)
  }

  const colores = getColorArray()

  // Mini estrellas refinadas
  const MiniStars = ({ rating }) => (
    <div className="flex gap-0.5" role="img" aria-label={`Calificación: ${rating} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-3 h-3 ${star <= Math.round(rating) ? 'text-kb-gold fill-kb-gold' : 'text-border'}`}
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  )

  return (
    <Link 
      to={`/producto/${id}`} 
      className="group block"
      aria-label={`Ver detalles de ${name}`}
    >
      <div className="relative bg-white transition-all duration-500 hover:shadow-elegant-hover rounded-2xl">
        
        {/* Contenedor de Imagen */}
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-muted">
          <img
            src={image_url || 'https://via.placeholder.com/600x750?text=KB+Dresses'}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
            loading="lazy"
          />
          
          {/* Badges Premium */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {is_new && (
              <span className="bg-foreground text-background text-[10px] font-semibold px-2 py-1 rounded-full uppercase tracking-wider shadow-sm">
                Nuevo
              </span>
            )}
            {tieneDescuento && (
              <span className="bg-kb-pink-dark text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
                -{discount_percent}%
              </span>
            )}
          </div>

          {/* SKU sutil */}
          {sku && (
            <div className="absolute bottom-3 left-3 bg-white/70 backdrop-blur-sm text-foreground/50 text-[9px] font-mono px-2 py-0.5 rounded-full">
              {sku}
            </div>
          )}

          {/* Overlay de información en hover */}
          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
        </div>

        {/* Información del producto */}
        <div className="p-4 space-y-2">
          {/* Marca y Rating */}
          <div className="flex items-center justify-between">
            {brand && (
              <p className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
                {brand}
              </p>
            )}
            {!loadingReviews && avgRating && reviewCount > 0 && (
              <div className="flex items-center gap-1">
                <MiniStars rating={parseFloat(avgRating)} />
                <span className="text-[10px] text-muted-foreground">
                  ({reviewCount})
                </span>
              </div>
            )}
          </div>

          {/* Nombre del producto */}
          <h3 className="text-sm font-medium text-foreground line-clamp-2 leading-snug tracking-tight group-hover:text-kb-pink-dark transition-colors">
            {name}
          </h3>

          {/* Colores disponibles */}
          {colores.length > 0 && (
            <div className="flex items-center gap-1.5 pt-1">
              {colores.slice(0, 3).map((colorItem, index) => (
                <div
                  key={index}
                  className="w-3.5 h-3.5 rounded-full border border-border shadow-sm transition-transform group-hover:scale-110"
                  style={{ backgroundColor: colorItem.toLowerCase() }}
                  title={colorItem}
                  aria-label={`Color disponible: ${colorItem}`}
                />
              ))}
              {colores.length > 3 && (
                <span className="text-[9px] text-muted-foreground ml-1">
                  +{colores.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Precio */}
          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-base font-semibold text-foreground">
              ${precioMostrar?.toFixed(2)}
            </span>
            {tieneDescuento && (
              <span className="text-xs text-muted-foreground line-through">
                ${price_original?.toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

export default ProductCard