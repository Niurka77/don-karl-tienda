import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

const ProductCard = ({ product }) => {
  const [avgRating, setAvgRating] = useState(null)
  const [reviewCount, setReviewCount] = useState(0)
  const [loadingReviews, setLoadingReviews] = useState(true)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    let cancelled = false
    
    const fetchReviews = async () => {
      try {
        const { data, error } = await supabase
          .from('reviews')
          .select('rating')
          .eq('product_id', product.id)

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
          console.error('Error loading reviews:', err)
        }
      } finally {
        if (!cancelled) {
          setLoadingReviews(false)
        }
      }
    }

    fetchReviews()
    
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

  const getColorHex = (colorName) => {
    const colorMap = {
      'negro': '#000000',
      'blanco': '#FFFFFF',
      'rojo': '#DC143C',
      'rosa': '#FF69B4',
      'dorado': '#D4AF37',
      'plateado': '#C0C0C0',
      'azul': '#0000FF',
      'verde': '#008000',
      'beige': '#F5F5DC',
      'marrón': '#8B4513',
      'gris': '#808080',
      'amarillo': '#FFD700',
      'naranja': '#FFA500',
      'morado': '#800080',
      'vino': '#722F37',
      'turquesa': '#40E0D0',
    }
    return colorMap[colorName.toLowerCase()] || '#E09DAA'
  }

  const MiniStars = ({ rating }) => (
    <div className="flex gap-0.5" role="img" aria-label={`Calificación: ${rating} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-3.5 h-3.5 ${star <= Math.round(rating) ? 'text-kb-gold fill-kb-gold' : 'text-gray-200'}`}
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
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ✅ CORREGIDO: Usar shadow-elegant-hover sin prefix hover: */}
      <div className="relative bg-white rounded-2xl overflow-hidden shadow-elegant-hover border border-border/50">
        
        {/* Badge Numerado */}
        {sku && (
          <div className="absolute top-3 left-3 z-20">
            <div className="bg-kb-rose text-white text-xs font-bold px-3 py-1.5 rounded-br-lg shadow-md">
              {sku.slice(-2)}
            </div>
          </div>
        )}

        {/* Badges de Estado */}
        <div className="absolute top-3 right-3 z-20 flex flex-col gap-1.5">
          {is_new && (
            <span className="bg-kb-charcoal text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
              Nuevo
            </span>
          )}
          {tieneDescuento && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
              -{discount_percent}%
            </span>
          )}
        </div>

        {/* Contenedor de Imagen */}
        <div className="relative aspect-[4/5] bg-kb-blush overflow-hidden">
          {/* Imagen Principal */}
          <img
            src={image_url || 'https://via.placeholder.com/600x750?text=KB+Dresses'}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />

          {/* Overlay con Blur en Hover */}
          <div className={`absolute inset-0 bg-white/20 backdrop-blur-[2px] transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}></div>

          {/* Botones de Acción Rápida */}
          <div className={`absolute inset-0 flex items-center justify-center gap-3 transition-all duration-300 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <button 
              className="bg-kb-rose hover:bg-kb-charcoal text-white text-xs font-bold px-6 py-3 rounded-full shadow-lg transition-all duration-300 hover:scale-105 flex items-center gap-2"
              onClick={(e) => e.preventDefault()}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
              </svg>
              Agregar
            </button>
          </div>

          {/* Iconos Flotantes */}
          <div className={`absolute bottom-4 left-0 right-0 flex justify-center gap-2 transition-all duration-300 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <button 
              className="w-10 h-10 rounded-full bg-white hover:bg-kb-rose hover:text-white text-kb-charcoal shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
              aria-label="Vista rápida"
              onClick={(e) => e.preventDefault()}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
              </svg>
            </button>
            <button 
              className="w-10 h-10 rounded-full bg-white hover:bg-kb-rose hover:text-white text-kb-charcoal shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
              aria-label="Agregar a favoritos"
              onClick={(e) => e.preventDefault()}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
              </svg>
            </button>
          </div>

          {/* Badge de Precio Flotante */}
          <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-sm rounded-2xl px-6 py-3 shadow-xl transition-all duration-300 ${isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            <p className="text-2xl font-bold text-kb-rose">
              S/ {precioMostrar?.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Información del Producto */}
        <div className="p-5 space-y-3">
          {brand && (
            <p className="text-xs font-bold text-kb-mauve uppercase tracking-wider">
              {brand}
            </p>
          )}

          <h3 className="font-serif font-semibold text-kb-charcoal text-base leading-tight line-clamp-2 group-hover:text-kb-rose transition-colors duration-300">
            {name}
          </h3>

          {colores.length > 0 && (
            <div className="flex items-center gap-2 pt-1">
              <span className="text-xs text-kb-mauve font-medium">Colores:</span>
              <div className="flex items-center gap-1.5">
                {colores.slice(0, 4).map((colorItem, index) => {
                  const hexColor = getColorHex(colorItem)
                  return (
                    <div
                      key={index}
                      className="w-4 h-4 rounded-full border border-gray-300 shadow-sm hover:scale-125 transition-transform cursor-pointer ring-2 ring-transparent hover:ring-kb-rose/30"
                      style={{ backgroundColor: hexColor }}
                      title={colorItem}
                      aria-label={`Color disponible: ${colorItem}`}
                    />
                  )
                })}
                {colores.length > 4 && (
                  <span className="text-[10px] text-kb-mauve font-medium ml-1">
                    +{colores.length - 4}
                  </span>
                )}
              </div>
            </div>
          )}

          {!loadingReviews && avgRating && reviewCount > 0 && (
            <div className="flex items-center gap-2">
              <MiniStars rating={parseFloat(avgRating)} />
              <span className="text-xs text-kb-mauve font-medium">
                ({reviewCount})
              </span>
            </div>
          )}

          <div className="flex items-baseline gap-2 pt-2 border-t border-border/50">
            <span className="text-xl font-bold text-kb-rose">
              S/ {precioMostrar?.toFixed(2)}
            </span>
            {tieneDescuento && (
              <span className="text-sm text-gray-400 line-through font-medium">
                S/ {price_original?.toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

export default ProductCard