import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import useCartStore from '../store/cartStore'
import WhatsAppButton from '../components/ui/WhatsAppButton'
import DOMPurify from 'dompurify'

const ProductoPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  // ✅ Importar openCart además de addItem
  const { addItem, openCart } = useCartStore()
  
  const [producto, setProducto] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState('')
  const [cantidad, setCantidad] = useState(1)
  const [agregando, setAgregando] = useState(false)
  const [mostrarMensaje, setMostrarMensaje] = useState(false)
  const [reviews, setReviews] = useState([])
  const [avgRating, setAvgRating] = useState(null)
  
  const [colores, setColores] = useState([])
  const [tallas, setTallas] = useState([])

  useEffect(() => {
    let cancelled = false
    
    const cargarProducto = async () => {
      try {
        setCargando(true)
        setError(null)

        const { data: productData, error: productError } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single()

        if (cancelled) return
        
        if (productError) throw productError
        setProducto(productData)

        if (productData.color) {
          setColores(productData.color.split(',').map(c => c.trim()).filter(c => c))
        }

        if (productData.sizes_available) {
          try {
            let tallasData = []
            if (typeof productData.sizes_available === 'string') {
              tallasData = JSON.parse(productData.sizes_available)
            } else if (Array.isArray(productData.sizes_available)) {
              tallasData = productData.sizes_available
            }
            if (Array.isArray(tallasData)) {
              setTallas(tallasData.filter(t => typeof t === 'string'))
            } else {
              setTallas([])
            }
          } catch (e) {
            console.error('Error parsing sizes_available:', e)
            setTallas([])
          }
        }

        const { data: reviewsData, error: reviewsError } = await supabase
          .from('reviews')
          .select('*')
          .eq('product_id', id)
          .order('created_at', { ascending: false })

        if (cancelled) return
        
        if (!reviewsError && reviewsData) {
          setReviews(reviewsData)
          if (reviewsData.length > 0) {
            const avg = reviewsData.reduce((acc, r) => acc + r.rating, 0) / reviewsData.length
            setAvgRating(avg.toFixed(1))
          }
        }

      } catch (err) {
        if (cancelled) return
        console.error('Error:', err)
        setError('No se pudo cargar el producto')
      } finally {
        if (!cancelled) setCargando(false)
      }
    }

    cargarProducto()
    window.scrollTo(0, 0)

    return () => {
      cancelled = true
    }
  }, [id])

  const handleAgregarCarrito = async () => {
    if (!selectedSize && tallas.length > 0) {
      alert('Por favor selecciona una talla')
      return
    }

    if (producto.stock && cantidad > producto.stock) {
      alert(`Solo quedan ${producto.stock} unidades disponibles`)
      return
    }

    setAgregando(true)
    try {
      const result = await addItem({
        id: producto.id,
        name: producto.name,
        price: producto.discount_percent > 0 ? producto.price_final : producto.price_original,
        originalPrice: producto.price_original,
        image: producto.image_url,
        sku: producto.sku,
        brand: producto.brand,
        selectedSize: selectedSize,
        quantity: cantidad,
        stock: producto.stock
      })
      
      if (result !== false) {
        setMostrarMensaje(true)
        setTimeout(() => setMostrarMensaje(false), 3000)
      }
    } catch (err) {
      console.error('Error al agregar:', err)
      alert('Error al agregar al carrito')
    } finally {
      setAgregando(false)
    }
  }

  // ✅ CORREGIDO: En lugar de navegar a /carrito, abre el drawer
  const handleComprarAhora = () => {
    handleAgregarCarrito()
    // ✅ Abre el cart drawer directamente
    openCart()
  }

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-kb-gray">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-kb-pink/20 border-t-kb-pink-dark rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Cargando producto...</p>
        </div>
      </div>
    )
  }

  if (error || !producto) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-kb-gray">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg max-w-md">
          <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <p className="text-gray-800 font-semibold mb-2">{error || 'Producto no encontrado'}</p>
          <button 
            onClick={() => navigate('/')}
            className="mt-4 bg-kb-pink-dark text-white px-6 py-3 rounded-full hover:bg-kb-pink transition"
          >
            Volver a la tienda
          </button>
        </div>
      </div>
    )
  }

  const tieneDescuento = producto.discount_percent > 0
  const precioFinal = tieneDescuento ? producto.price_final : producto.price_original

  const imagenes = producto.images_urls 
    ? [producto.image_url, ...producto.images_urls].filter(Boolean)
    : [producto.image_url].filter(Boolean)

  const renderStars = (rating) => {
    return (
      <div className="flex gap-1" role="img" aria-label={`Calificación: ${rating} de 5 estrellas`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-5 h-5 ${star <= Math.round(rating) ? 'text-kb-gold fill-kb-gold' : 'text-gray-300'}`}
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
      </div>
    )
  }

  return (
    <div className="bg-kb-gray min-h-screen pb-12">
      {mostrarMensaje && (
        <div className="fixed top-20 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-xl animate-bounce">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Producto agregado al carrito
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          
          {/* GALERÍA DE IMÁGENES */}
          <div>
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg mb-4">
              <img
                src={imagenes[selectedImage] || 'https://via.placeholder.com/600x600?text=KB+Dresses'}
                alt={`${producto.name} - Vista principal`}
                className="w-full h-auto object-cover aspect-square"
                loading="eager"
              />
            </div>
            
            {imagenes.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {imagenes.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === idx ? 'border-kb-pink-dark' : 'border-transparent hover:border-kb-pink'
                    }`}
                    aria-label={`Ver imagen ${idx + 1}`}
                    aria-pressed={selectedImage === idx}
                  >
                    <img 
                      src={img} 
                      alt={`${producto.name} - Vista ${idx + 1}`} 
                      className="w-full aspect-square object-cover"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* INFO PRODUCTO */}
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-3">
              {producto.sku && (
                <span className="text-xs text-gray-600 bg-gray-100 px-3 py-1 rounded-full font-medium">
                  CÓDIGO: {producto.sku}
                </span>
              )}
              {producto.brand && (
                <span className="text-xs font-semibold text-kb-pink-dark bg-kb-pink/10 px-3 py-1 rounded-full uppercase tracking-wide">
                  {producto.brand}
                </span>
              )}
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">
              {producto.name}
            </h1>

            {avgRating && (
              <div className="flex items-center gap-2 mb-4">
                {renderStars(parseFloat(avgRating))}
                <span className="text-sm text-gray-600">
                  {avgRating} · {reviews.length} {reviews.length === 1 ? 'reseña' : 'reseñas'}
                </span>
              </div>
            )}

            <div className="mb-6 p-4 bg-white rounded-xl shadow-sm">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-3xl font-bold text-kb-pink-dark">
                  ${precioFinal?.toFixed(2)}
                </span>
                {tieneDescuento && (
                  <>
                    <span className="text-lg text-gray-400 line-through">
                      ${producto.price_original?.toFixed(2)}
                    </span>
                    <span className="bg-red-600 text-white text-sm font-bold px-2 py-1 rounded-full">
                      -{producto.discount_percent}%
                    </span>
                  </>
                )}
              </div>
              {tieneDescuento && (
                <p className="text-sm text-green-600 mt-2 font-medium">
                  Ahorras ${(producto.price_original - producto.price_final).toFixed(2)}
                </p>
              )}
            </div>

            {producto.description && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-2">Descripción</h3>
                <div 
                  className="text-gray-600 leading-relaxed prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ 
                    __html: DOMPurify.sanitize(producto.description) 
                  }} 
                />
              </div>
            )}

            {colores.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-2">Colores disponibles</h3>
                <div className="flex flex-wrap gap-3">
                  {colores.map((color, idx) => (
                    <button
                      key={idx}
                      className="w-10 h-10 rounded-full border-2 border-gray-300 shadow-sm cursor-pointer hover:scale-110 hover:border-kb-pink-dark transition transform focus:outline-none focus:ring-2 focus:ring-kb-pink focus:ring-offset-2"
                      style={{ backgroundColor: color.toLowerCase() }}
                      title={color}
                      aria-label={`Color disponible: ${color}`}
                      type="button"
                    />
                  ))}
                </div>
              </div>
            )}

            {tallas.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-2">Tallas disponibles</h3>
                <div className="flex flex-wrap gap-2">
                  {tallas.map((talla) => (
                    <button
                      key={talla}
                      onClick={() => setSelectedSize(talla)}
                      className={`w-12 h-12 rounded-lg border-2 font-medium transition-all focus:outline-none focus:ring-2 focus:ring-kb-pink focus:ring-offset-2 ${
                        selectedSize === talla
                          ? 'border-kb-pink-dark bg-kb-pink-dark text-white shadow-lg'
                          : 'border-gray-300 hover:border-kb-pink text-gray-700 bg-white'
                      }`}
                      aria-pressed={selectedSize === talla}
                      aria-label={`Seleccionar talla ${talla}`}
                      type="button"
                    >
                      {talla}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-6">
              <h3 className="font-semibold text-gray-800 mb-2">Cantidad</h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                  className="w-10 h-10 rounded-lg border border-gray-300 text-gray-700 hover:border-kb-pink hover:bg-kb-pink/5 transition font-medium focus:outline-none focus:ring-2 focus:ring-kb-pink"
                  aria-label="Disminuir cantidad"
                  type="button"
                >
                  -
                </button>
                <span className="w-16 text-center text-lg font-medium text-gray-800">{cantidad}</span>
                <button
                  onClick={() => setCantidad(Math.min(producto.stock, cantidad + 1))}
                  disabled={cantidad >= producto.stock}
                  className={`w-10 h-10 rounded-lg border border-gray-300 text-gray-700 hover:border-kb-pink hover:bg-kb-pink/5 transition font-medium focus:outline-none focus:ring-2 focus:ring-kb-pink ${
                    cantidad >= producto.stock ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  aria-label="Aumentar cantidad"
                  type="button"
                >
                  +
                </button>
                <span className="text-sm text-gray-500 ml-4">
                  Stock: {producto.stock} {producto.stock === 1 ? 'unidad' : 'unidades'}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <button
                onClick={handleAgregarCarrito}
                disabled={agregando || producto.stock === 0}
                className="flex-1 bg-white border-2 border-kb-pink-dark text-kb-pink-dark font-semibold py-3.5 rounded-full hover:bg-kb-pink/10 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                type="button"
              >
                {agregando ? 'Agregando...' : '🛍️ Agregar al carrito'}
              </button>
              <button
                onClick={handleComprarAhora}
                disabled={agregando || producto.stock === 0}
                className="flex-1 bg-kb-pink-dark text-white font-semibold py-3.5 rounded-full hover:bg-kb-pink transition shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                type="button"
              >
                Comprar ahora → 
              </button>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <h4 className="font-semibold text-sm text-gray-700 mb-3">Métodos de pago aceptados:</h4>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1.5 bg-white rounded-lg text-sm border border-gray-200">🇵🇪 Yape</span>
                <span className="px-3 py-1.5 bg-white rounded-lg text-sm border border-gray-200">🇵🇪 Plin</span>
                <span className="px-3 py-1.5 bg-white rounded-lg text-sm border border-gray-200">💳 Tarjetas</span>
                <span className="px-3 py-1.5 bg-white rounded-lg text-sm border border-gray-200">🏦 Transferencia</span>
              </div>
            </div>
          </div>
        </div>

        {/* SECCIÓN DE RESEÑAS */}
        <div className="mt-16 pt-8 border-t border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Opiniones de clientes {avgRating && <span className="text-base font-normal text-gray-500 ml-2">({avgRating}/5 · {reviews.length})</span>}
          </h2>
          
          {reviews.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-gray-500">Aún no hay reseñas para este producto.</p>
              <p className="text-gray-400 text-sm mt-1">¡Sé el primero en opinar!</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {reviews.map((review, index) => (
                <div key={`${review.id}-${index}`} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-kb-pink to-kb-pink-dark rounded-full flex items-center justify-center text-white font-bold">
                        {review.customer_name?.charAt(0).toUpperCase() || 'C'}
                      </div>
                      <div>
                        <span className="font-semibold text-gray-800 block">
                          {review.customer_name || 'Cliente verificado'}
                        </span>
                        {review.verified_purchase && (
                          <span className="text-xs text-green-600 flex items-center gap-1">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Compra verificada
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {renderStars(review.rating)}
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>
                  )}
                  <span className="text-xs text-gray-400 mt-3 block">
                    {new Date(review.created_at).toLocaleDateString('es-PE', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <WhatsAppButton phoneNumber="51906877812" />
    </div>
  )
}

export default ProductoPage