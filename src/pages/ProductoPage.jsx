import useCartStore from '../store/cartStore'
import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import ProductCard from '../components/producto/ProductCard'
import ReviewsSection from '../components/producto/ReviewsSection'

const ProductoPage = () => {
  const { id } = useParams()
  const addItem = useCartStore((state) => state.addItem)
  const [producto, setProducto] = useState(null)
  const [relacionados, setRelacionados] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [tallaSeleccionada, setTallaSeleccionada] = useState('')
  const [cantidad, setCantidad] = useState(1)
  const [imagenError, setImagenError] = useState(false)
  const [reviews, setReviews] = useState([])

  // Cargar producto y reseñas
  const cargarDatos = useCallback(async () => {
    try {
      setCargando(true)
      setError(null)

      const { data: productoData, error: productoError } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()

      if (productoError) throw productoError
      if (!productoData) throw new Error('Producto no encontrado')

      setProducto(productoData)

      // Cargar reseñas para rating
      const { data: reviewsData } = await supabase
        .from('reviews')
        .select('rating')
        .eq('product_id', id)

      setReviews(reviewsData || [])

      // Cargar relacionados
      const { data: relacionadosData } = await supabase
        .from('products')
        .select('*')
        .eq('category', productoData.category)
        .neq('id', id)
        .limit(4)

      setRelacionados(relacionadosData || [])
    } catch (err) {
      console.error('Error al cargar producto:', err)
      setError(err.message || 'Producto no encontrado')
    } finally {
      setCargando(false)
    }
  }, [id])

  useEffect(() => {
    if (id) {
      cargarDatos()
    }
  }, [id, cargarDatos])

  // Callback para que ReviewsSection notifique cuando se agrega una reseña
  const handleReviewAdded = useCallback(() => {
    cargarDatos() // Recargar reviews y actualizar rating
  }, [cargarDatos])

  // Calcular rating promedio
  const avgRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : null

  // Componente de estrellas reutilizable
  const Stars = ({ rating, size = 'sm' }) => {
    const sizeClasses = {
      xs: 'w-3 h-3',
      sm: 'w-4 h-4',
      md: 'w-5 h-5'
    }
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`${sizeClasses[size]} ${star <= Math.round(rating) ? 'text-kb-gold fill-kb-gold' : 'text-gray-300'}`}
            viewBox="0 0 24 24"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
      </div>
    )
  }

  // Estados de carga y error
  if (cargando) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex justify-center">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
      </div>
    )
  }

  if (error || !producto) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">Producto no encontrado</h2>
        <Link to="/" className="text-blue-600 hover:underline">
          ← Volver a la tienda
        </Link>
      </div>
    )
  }

  const {
    name,
    price_original,
    discount_percent,
    price_final,
    image_url,
    sku,
    description,
    stock,
    sizes_available,
    is_new,
    category,
    color,
    brand,
  } = producto

  const tieneDescuento = discount_percent > 0
  const sinStock = stock <= 0
  const tallas = Array.isArray(sizes_available) ? sizes_available : []
  const imagenMostrar = imagenError
    ? 'https://via.placeholder.com/600x750?text=Imagen+no+disponible'
    : image_url

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb - más sutil */}
      <nav className="text-xs text-gray-400 mb-4">
        <Link to="/" className="hover:text-gray-600 transition-colors">Tienda</Link>
        <span className="mx-1.5">/</span>
        <span className="text-gray-500">{category}</span>
      </nav>

      {/* Producto principal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Imagen */}
        <div className="bg-gray-100 rounded-xl overflow-hidden">
          <img
            src={imagenMostrar}
            alt={name}
            className="w-full h-auto object-cover aspect-[4/5]"
            onError={() => setImagenError(true)}
          />
        </div>

        {/* Información */}
        <div className="flex flex-col">
          {/* Etiquetas */}
          <div className="flex flex-wrap gap-2 mb-4">
            {is_new && (
              <span className="bg-black text-white text-xs font-semibold px-3 py-1 rounded-full">
                ✨ Nuevo
              </span>
            )}
            {tieneDescuento && (
              <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                -{discount_percent}%
              </span>
            )}
            {sinStock && (
              <span className="bg-gray-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                Agotado
              </span>
            )}
          </div>

          {/* Nombre del producto */}
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 leading-tight">
            {name}
          </h1>

          {/* Rating promedio - SOLO si hay reseñas */}
          {avgRating && reviews.length > 0 && (
            <div className="flex items-center gap-2 mb-5">
              <Stars rating={parseFloat(avgRating)} size="sm" />
              <span className="text-sm text-gray-600 font-medium">
                {avgRating} <span className="text-gray-400">({reviews.length})</span>
              </span>
            </div>
          )}

          {/* SKU y detalles */}
          {(sku || brand || color) && (
            <div className="text-xs text-gray-500 mb-5 space-y-0.5">
              {sku && <p>SKU: <span className="text-gray-700">{sku}</span></p>}
              {brand && <p>Marca: <span className="text-gray-700">{brand}</span></p>}
              {color && <p>Color: <span className="text-gray-700">{color}</span></p>}
            </div>
          )}

          {/* Precio */}
          <div className="flex items-baseline gap-3 mb-7">
            {tieneDescuento ? (
              <>
                <span className="text-3xl font-bold text-red-600">
                  ${price_final?.toFixed(2)}
                </span>
                <span className="text-lg text-gray-400 line-through">
                  ${price_original?.toFixed(2)}
                </span>
                <span className="text-sm text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded">
                  Ahorras ${(price_original - price_final)?.toFixed(2)}
                </span>
              </>
            ) : (
              <span className="text-3xl font-bold text-gray-900">
                ${price_original?.toFixed(2)}
              </span>
            )}
          </div>

          {/* Selector de tallas */}
          {tallas.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold text-gray-800">
                  Talla
                </label>
                {tallaSeleccionada && (
                  <button
                    type="button"
                    onClick={() => setTallaSeleccionada('')}
                    className="text-xs text-kb-gold hover:underline"
                  >
                    Cambiar
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {tallas.map((talla) => (
                  <button
                    key={talla}
                    type="button"
                    onClick={() => setTallaSeleccionada(talla)}
                    disabled={sinStock}
                    className={`
                      px-5 py-2.5 border-2 rounded-lg font-medium text-sm transition-all
                      ${sinStock
                        ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50'
                        : tallaSeleccionada === talla
                          ? 'border-black bg-black text-white shadow-sm'
                          : 'border-gray-300 text-gray-700 hover:border-black hover:bg-gray-50'
                      }
                    `}
                  >
                    {talla}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Selector de cantidad */}
          {!sinStock && tallas.length > 0 && (
            <div className="mb-7">
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Cantidad
              </label>
              <div className="flex items-center border-2 border-gray-300 rounded-lg w-fit">
                <button
                  type="button"
                  onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                  className="px-4 py-2 text-gray-600 hover:text-black hover:bg-gray-100 transition-colors rounded-l-lg"
                >
                  −
                </button>
                <span className="px-6 py-2 text-gray-900 font-medium min-w-[60px] text-center border-x border-gray-300">
                  {cantidad}
                </span>
                <button
                  type="button"
                  onClick={() => setCantidad(Math.min(stock, cantidad + 1))}
                  className="px-4 py-2 text-gray-600 hover:text-black hover:bg-gray-100 transition-colors rounded-r-lg"
                >
                  +
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {stock} unidades disponibles
              </p>
            </div>
          )}

          {/* Botón de compra */}
          <button
            type="button"
            onClick={() => {
              if (tallaSeleccionada && !sinStock) {
                addItem(producto, tallaSeleccionada, cantidad)
              }
            }}
            disabled={sinStock || (tallas.length > 0 && !tallaSeleccionada)}
            className={`
              w-full py-4 rounded-xl font-semibold text-white transition-all text-base
              ${sinStock
                ? 'bg-gray-300 cursor-not-allowed'
                : tallas.length > 0 && !tallaSeleccionada
                  ? 'bg-gray-400 cursor-pointer hover:bg-gray-500'
                  : 'bg-black hover:bg-gray-800 active:scale-[0.99] shadow-lg hover:shadow-xl'
              }
            `}
          >
            {sinStock
              ? 'Producto agotado'
              : tallas.length > 0 && !tallaSeleccionada
                ? 'Elige una talla para continuar'
                : 'Agregar al carrito'
            }
          </button>

          {/* Descripción */}
          {description && (
            <div className="mt-10 pt-8 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-800 mb-3 uppercase tracking-wide">
                Descripción
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {description}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Reseñas - ANTES de productos relacionados */}
      <ReviewsSection productId={producto.id} onReviewAdded={handleReviewAdded} />

      {/* Productos relacionados */}
      {relacionados.length > 0 && (
        <section className="mt-20">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              También te puede interesar
            </h3>
            <Link to={`/categoria/${category}`} className="text-sm text-kb-gold hover:underline font-medium">
              Ver más →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {relacionados.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </section>
      )}

      {/* Botón volver */}
      <div className="mt-16 text-center pb-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors text-sm font-medium"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver a la tienda
        </Link>
      </div>
    </div>
  )
}

export default ProductoPage