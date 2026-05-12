import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

const ProductCard = ({ product }) => {
  const [avgRating, setAvgRating] = useState(null)
  const [reviewCount, setReviewCount] = useState(0)
  const [loadingReviews, setLoadingReviews] = useState(true)

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { data, error } = await supabase
          .from('reviews')
          .select('rating')
          .eq('product_id', product.id)

        if (!error && data) {
          setReviewCount(data.length)
          if (data.length > 0) {
            const avg = data.reduce((acc, r) => acc + r.rating, 0) / data.length
            setAvgRating(avg.toFixed(1))
          }
        }
      } catch (err) {
        console.error('Error loading reviews for product card:', err)
      } finally {
        setLoadingReviews(false)
      }
    }

    fetchReviews()
  }, [product.id])

  const {
    id,
    name,
    price_original,
    discount_percent,
    price_final,
    image_url,
    is_new,
  } = product

  const tieneDescuento = discount_percent > 0
  const precioMostrar = tieneDescuento ? price_final : price_original

  // Componente mini de estrellas
  const MiniStars = ({ rating }) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-3 h-3 ${star <= Math.round(rating) ? 'text-kb-gold fill-kb-gold' : 'text-gray-300'}`}
          viewBox="0 0 24 24"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  )

  return (
    <Link to={`/producto/${id}`} className="group block">
      <div className="bg-white rounded-xl overflow-hidden border border-gray-100 hover:border-gray-300 hover:shadow-lg transition-all duration-300">
        {/* Imagen */}
        <div className="relative aspect-[4/5] bg-gray-100 overflow-hidden">
          <img
            src={image_url || 'https://via.placeholder.com/300x375?text=Producto'}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {is_new && (
              <span className="bg-black/90 text-white text-[10px] font-semibold px-2 py-1 rounded-full backdrop-blur-sm">
                Nuevo
              </span>
            )}
            {tieneDescuento && (
              <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                -{discount_percent}%
              </span>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          {/* Rating - SOLO si hay reseñas */}
          {!loadingReviews && avgRating && reviewCount > 0 && (
            <div className="flex items-center gap-1.5 mb-2">
              <MiniStars rating={parseFloat(avgRating)} />
              <span className="text-[11px] text-gray-500 font-medium">
                ({reviewCount})
              </span>
            </div>
          )}

          {/* Nombre */}
          <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2 leading-snug group-hover:text-kb-gold transition-colors">
            {name}
          </h3>

          {/* Precio */}
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-gray-900">
              ${precioMostrar?.toFixed(2)}
            </span>
            {tieneDescuento && (
              <span className="text-xs text-gray-400 line-through">
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