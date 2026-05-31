import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import useCartStore from '../store/cartStore'
import WhatsAppButton from '../components/ui/WhatsAppButton'
import DOMPurify from 'dompurify'

/* ─────────────────────────────────────────
   Mapa de colores
───────────────────────────────────────── */
const COLOR_MAP = {
  negro: '#111111', blanco: '#F8F8F8', rojo: '#C0392B',
  rosa: '#E87D8F', dorado: '#C9A84C', plateado: '#B0B0B0',
  azul: '#2C5F8A', verde: '#2E7D32', beige: '#D4C5A9',
  marron: '#6D4C41', gris: '#78909C', amarillo: '#F9A825',
  naranja: '#E64A19', morado: '#6A1B9A', vino: '#6D1F2E',
  turquesa: '#00897B',
}
const getColorHex = (n) => COLOR_MAP[n?.toLowerCase()] ?? 'var(--color-kb-rose)'

const Stars = ({ rating, size = 18 }) => (
  <div className="flex gap-0.5" role="img" aria-label={`${rating} de 5 estrellas`}>
    {[1, 2, 3, 4, 5].map((s) => (
      <svg key={s} width={size} height={size} viewBox="0 0 24 24" aria-hidden style={{
        fill: s <= Math.round(rating) ? 'var(--color-kb-gold)' : 'rgba(180,160,170,0.2)',
      }}>
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ))}
  </div>
)

const Skeleton = ({ w = '100%', h = '20px', style = {} }) => (
  <div style={{
    width: w, height: h, borderRadius: '2px',
    background: 'linear-gradient(110deg, var(--color-kb-blush) 30%, var(--color-kb-petal) 50%, var(--color-kb-blush) 70%)',
    backgroundSize: '200% 100%',
    animation: 'shimmerBg 1.6s linear infinite',
    ...style,
  }} />
)

const ProductoPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addItem, openCart } = useCartStore()

  const [producto, setProducto] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState('')
  const [cantidad, setCantidad] = useState(1)
  const [agregando, setAgregando] = useState(false)
  const [toastVisible, setToastVisible] = useState(false)
  const [reviews, setReviews] = useState([])
  const [avgRating, setAvgRating] = useState(null)
  const [colores, setColores] = useState([])
  const [tallas, setTallas] = useState([])
  
  // Estado para el formulario de reseña
  const [mostrarFormularioReview, setMostrarFormularioReview] = useState(false)
  const [mostrarTodasReviews, setMostrarTodasReviews] = useState(false)
  const [reviewForm, setReviewForm] = useState({
    customer_name: '',
    rating: 5,
    comment: ''
  })
  const [enviandoReview, setEnviandoReview] = useState(false)
  const [reviewExito, setReviewExito] = useState('')
  const [reviewError, setReviewError] = useState('')

  useEffect(() => {
    let cancelled = false
    const cargar = async () => {
      try {
        setCargando(true); setError(null)
        const { data, error: e } = await supabase
          .from('products').select('*').eq('id', id).single()
        if (cancelled) return
        if (e) throw e
        setProducto(data)

        if (data.color)
          setColores(data.color.split(',').map(c => c.trim()).filter(Boolean))

        if (data.sizes_available) {
          try {
            const t = typeof data.sizes_available === 'string'
              ? JSON.parse(data.sizes_available)
              : data.sizes_available
            setTallas(Array.isArray(t) ? t.filter(x => typeof x === 'string') : [])
          } catch { setTallas([]) }
        }

        // Cargar todas las reseñas (sin filtro de approved)
        const { data: rev, error: re } = await supabase
          .from('reviews')
          .select('*')
          .eq('product_id', id)
          .order('created_at', { ascending: false })
        
        if (cancelled) return
        if (!re && rev) {
          setReviews(rev)
          if (rev.length > 0)
            setAvgRating((rev.reduce((a, r) => a + r.rating, 0) / rev.length).toFixed(1))
        }
      } catch (err) {
        if (!cancelled) { console.error(err); setError('No se pudo cargar el producto') }
      } finally {
        if (!cancelled) setCargando(false)
      }
    }
    cargar()
    window.scrollTo(0, 0)
    return () => { cancelled = true }
  }, [id])

  const handleAgregar = async () => {
    if (!selectedSize && tallas.length > 0) { alert('Por favor selecciona una talla'); return }
    if (producto.stock && cantidad > producto.stock) { alert(`Solo quedan ${producto.stock} unidades`); return }
    setAgregando(true)
    try {
      const result = await addItem({
        id: producto.id, name: producto.name,
        price: producto.discount_percent > 0 ? producto.price_final : producto.price_original,
        originalPrice: producto.price_original,
        image: producto.image_url, sku: producto.sku,
        brand: producto.brand, selectedSize, quantity: cantidad, stock: producto.stock,
      })
      if (result !== false) { setToastVisible(true); setTimeout(() => setToastVisible(false), 3000) }
    } catch (e) { console.error(e); alert('Error al agregar al carrito') }
    finally { setAgregando(false) }
  }

  const handleComprarAhora = () => { handleAgregar(); openCart() }

  const handleReviewChange = (e) => {
    const { name, value } = e.target
    setReviewForm(prev => ({ ...prev, [name]: value }))
    if (reviewError) setReviewError('')
    if (reviewExito) setReviewExito('')
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    
    if (!reviewForm.customer_name.trim()) {
      setReviewError('Por favor ingresa tu nombre')
      return
    }
    
    if (reviewForm.comment.trim().length < 5) {
      setReviewError('El comentario debe tener al menos 5 caracteres')
      return
    }
    
    setEnviandoReview(true)
    setReviewError('')
    setReviewExito('')
    
    try {
      const { error } = await supabase
        .from('reviews')
        .insert([{
          product_id: id,
          customer_name: reviewForm.customer_name.trim(),
          rating: reviewForm.rating,
          comment: reviewForm.comment.trim(),
          verified_purchase: false,
        }])
      
      if (error) throw error
      
      // Recargar las reseñas para mostrar la nueva
      const { data: rev, error: re } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', id)
        .order('created_at', { ascending: false })
      
      if (!re && rev) {
        setReviews(rev)
        if (rev.length > 0)
          setAvgRating((rev.reduce((a, r) => a + r.rating, 0) / rev.length).toFixed(1))
      }
      
      setReviewExito('Gracias por tu opinion. Tu reseña ya esta publicada.')
      setReviewForm({ customer_name: '', rating: 5, comment: '' })
      setMostrarFormularioReview(false)
      
      setTimeout(() => setReviewExito(''), 5000)
    } catch (err) {
      console.error('Error al enviar reseña:', err)
      setReviewError('No se pudo enviar tu reseña. Intenta nuevamente.')
    } finally {
      setEnviandoReview(false)
    }
  }

  if (cargando) return (
    <div style={{ background: 'var(--color-kb-ivory)', minHeight: '100vh' }}>
      <style>{`@keyframes shimmerBg { 0%{background-position:200% center} 100%{background-position:-200% center} }`}</style>
      <div className="max-w-screen-xl mx-auto px-6 lg:px-10 py-12 md:py-20">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
          <div className="space-y-3">
            <Skeleton h="520px" style={{ aspectRatio: '4/5' }} />
            <div className="grid grid-cols-4 gap-2">
              {[0,1,2,3].map(i => <Skeleton key={i} h="80px" />)}
            </div>
          </div>
          <div className="space-y-5 pt-4">
            <Skeleton w="40%" h="10px" />
            <Skeleton w="75%" h="32px" />
            <Skeleton w="55%" h="24px" />
            <Skeleton h="1px" style={{ margin: '1.5rem 0' }} />
            <Skeleton w="30%" h="40px" />
          </div>
        </div>
      </div>
    </div>
  )

  if (error || !producto) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-kb-ivory)' }}>
      <div className="text-center px-6">
        <div style={{
          width: '48px', height: '1px',
          background: 'rgba(212,120,138,0.4)',
          margin: '0 auto 2rem',
        }} />
        <p style={{
          fontFamily: 'var(--font-display)', fontSize: '1.4rem',
          fontWeight: 300, fontStyle: 'italic',
          color: 'var(--color-kb-mauve)', marginBottom: '1.5rem',
        }}>
          {error || 'Producto no encontrado'}
        </p>
        <button onClick={() => navigate('/')} className="btn-kb-ghost">
          ← Volver a la tienda
        </button>
      </div>
    </div>
  )

  const tieneDescuento = producto.discount_percent > 0
  const precioFinal = tieneDescuento ? producto.price_final : producto.price_original
  const imagenes = producto.images_urls && producto.images_urls.length > 0
    ? producto.images_urls
    : producto.image_url 
      ? [producto.image_url]
      : []

  // Determinar que reseñas mostrar (primeras 4 o todas)
  const reviewsToShow = mostrarTodasReviews ? reviews : reviews.slice(0, 4)

  return (
    <div style={{ background: 'var(--color-kb-ivory)', minHeight: '100vh' }}>
      <style>{`@keyframes shimmerBg { 0%{background-position:200% center} 100%{background-position:-200% center} }`}</style>

      {toastVisible && (
        <div
          className="fixed top-24 right-5 z-50 animate-slide-in"
          style={{
            background: 'var(--color-kb-obsidian)',
            color: 'var(--color-kb-ivory)',
            padding: '0.85rem 1.4rem',
            borderLeft: '3px solid var(--color-kb-rose)',
            borderRadius: '2px',
            boxShadow: '0 8px 32px rgba(26,17,24,0.25)',
            fontSize: '0.8rem', fontWeight: 300, letterSpacing: '0.04em',
          }}
        >
          <div className="flex items-center gap-2.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
              style={{ color: 'var(--color-kb-rose)', flexShrink: 0 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Agregado al carrito
          </div>
        </div>
      )}

      <div className="max-w-screen-xl mx-auto px-6 lg:px-10 py-12 md:py-20">

        <div className="flex items-center gap-2 mb-12">
          <button
            onClick={() => navigate('/')}
            className="text-editorial transition-all duration-300"
            style={{ color: 'var(--color-kb-mauve)', fontSize: '0.62rem', letterSpacing: '0.18em' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--color-kb-rose)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--color-kb-mauve)'}
          >
            Tienda
          </button>
          <span style={{ color: 'rgba(154,116,128,0.35)', fontSize: '0.6rem' }}>✦</span>
          <span className="text-editorial" style={{ color: 'var(--color-kb-charcoal)', fontSize: '0.62rem', letterSpacing: '0.18em' }}>
            {producto.name}
          </span>
        </div>

        <div className="grid md:grid-cols-2 gap-10 lg:gap-20 items-start">

          <div className="md:sticky md:top-28">
            <div
              className="relative overflow-hidden mb-3"
              style={{ background: 'var(--color-kb-blush)', aspectRatio: '4/5' }}
            >
              <img
                src={imagenes[selectedImage] || 'https://via.placeholder.com/600x750?text=KB+Dresses'}
                alt={`${producto.name} — vista ${selectedImage + 1}`}
                className="w-full h-full object-cover transition-all duration-700"
                loading="eager"
              />

              <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                {producto.is_new && <span className="badge-new">Nuevo</span>}
                {tieneDescuento && <span className="badge-sale">−{producto.discount_percent}%</span>}
              </div>

              {producto.sku && (
                <div className="absolute top-4 right-4 z-10">
                  <span className="text-editorial" style={{
                    background: 'rgba(26,17,24,0.6)', backdropFilter: 'blur(8px)',
                    color: 'rgba(242,196,206,0.75)', fontSize: '0.55rem',
                    padding: '0.22rem 0.6rem', letterSpacing: '0.18em', borderRadius: '1px',
                  }}>
                    {producto.sku}
                  </span>
                </div>
              )}

              {imagenes.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImage(i => (i - 1 + imagenes.length) % imagenes.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-10 transition-all duration-300"
                    style={{
                      width: '36px', height: '36px', borderRadius: '50%',
                      background: 'rgba(253,250,249,0.88)', backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(212,120,138,0.2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--color-kb-charcoal)',
                    }}
                    aria-label="Imagen anterior"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setSelectedImage(i => (i + 1) % imagenes.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-10 transition-all duration-300"
                    style={{
                      width: '36px', height: '36px', borderRadius: '50%',
                      background: 'rgba(253,250,249,0.88)', backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(212,120,138,0.2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--color-kb-charcoal)',
                    }}
                    aria-label="Siguiente imagen"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}
            </div>

            {imagenes.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {imagenes.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    aria-label={`Ver imagen ${idx + 1}`}
                    aria-pressed={selectedImage === idx}
                    style={{
                      overflow: 'hidden',
                      aspectRatio: '1',
                      border: `2px solid ${selectedImage === idx ? 'var(--color-kb-rose)' : 'transparent'}`,
                      opacity: selectedImage === idx ? 1 : 0.6,
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <img src={img} alt={`Vista ${idx + 1}`} className="w-full h-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="py-2">

            <div className="flex items-center gap-4 mb-4">
              {producto.brand && (
                <span className="text-editorial" style={{
                  color: 'var(--color-kb-rose)', fontSize: '0.62rem', letterSpacing: '0.25em',
                }}>
                  {producto.brand}
                </span>
              )}
              {producto.sku && (
                <span className="text-editorial" style={{
                  color: 'rgba(154,116,128,0.5)', fontSize: '0.58rem', letterSpacing: '0.18em',
                }}>
                  #{producto.sku}
                </span>
              )}
            </div>

            <h1 style={{
              fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
              fontWeight: 300, letterSpacing: '-0.02em', lineHeight: 1.1,
              color: 'var(--color-kb-charcoal)', marginBottom: '1rem',
            }}>
              {producto.name}
            </h1>

            {avgRating && (
              <div className="flex items-center gap-3 mb-5">
                <Stars rating={parseFloat(avgRating)} size={15} />
                <span style={{ fontSize: '0.75rem', fontWeight: 300, color: 'var(--color-kb-mauve)' }}>
                  {avgRating} · {reviews.length} {reviews.length === 1 ? 'reseña' : 'reseñas'}
                </span>
              </div>
            )}

            <div style={{ height: '1px', background: 'rgba(212,120,138,0.12)', margin: '1.2rem 0 1.5rem' }} />

            <div className="flex items-baseline gap-3 flex-wrap mb-6">
              <span style={{
                fontFamily: 'var(--font-display)', fontSize: '2.4rem',
                fontWeight: 300, letterSpacing: '-0.03em',
                color: 'var(--color-kb-rose-deep)',
              }}>
                S/ {precioFinal?.toFixed(2)}
              </span>
              {tieneDescuento && (
                <>
                  <span style={{ fontSize: '1rem', fontWeight: 300, color: 'var(--color-kb-mauve)', textDecoration: 'line-through', opacity: 0.65 }}>
                    S/ {producto.price_original?.toFixed(2)}
                  </span>
                  <span className="badge-sale">−{producto.discount_percent}%</span>
                </>
              )}
            </div>

            {tieneDescuento && (
              <p style={{ fontSize: '0.78rem', fontWeight: 300, color: '#4CAF50', marginBottom: '1.2rem', letterSpacing: '0.03em' }}>
                Ahorras S/ {(producto.price_original - producto.price_final).toFixed(2)}
              </p>
            )}

            {producto.description && (
              <div
                className="prose prose-sm max-w-none mb-6"
                style={{
                  fontSize: '0.88rem', fontWeight: 300,
                  color: 'rgba(45,32,48,0.7)', lineHeight: 1.75,
                }}
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(producto.description) }}
              />
            )}

            <div style={{ height: '1px', background: 'rgba(212,120,138,0.1)', margin: '1.5rem 0' }} />

            {colores.length > 0 && (
              <div className="mb-7">
                <p className="text-editorial mb-3" style={{ color: 'var(--color-kb-mauve)', fontSize: '0.62rem', letterSpacing: '0.2em' }}>
                  Colores disponibles
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {colores.map((c, i) => (
                    <button
                      key={i}
                      title={c}
                      aria-label={`Color: ${c}`}
                      type="button"
                      className="transition-all duration-300 hover:scale-110"
                      style={{
                        width: '26px', height: '26px', borderRadius: '50%',
                        background: getColorHex(c),
                        border: '2px solid rgba(255,255,255,0.9)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        outline: 'none',
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {tallas.length > 0 && (
              <div className="mb-7">
                <p className="text-editorial mb-3" style={{ color: 'var(--color-kb-mauve)', fontSize: '0.62rem', letterSpacing: '0.2em' }}>
                  Selecciona tu talla
                </p>
                <div className="flex flex-wrap gap-2">
                  {tallas.map((talla) => (
                    <button
                      key={talla}
                      onClick={() => setSelectedSize(talla)}
                      aria-pressed={selectedSize === talla}
                      type="button"
                      style={{
                        width: '44px', height: '44px', borderRadius: '2px',
                        fontSize: '0.75rem', fontWeight: selectedSize === talla ? 500 : 300,
                        fontFamily: 'var(--font-sans)', letterSpacing: '0.04em',
                        border: `1px solid ${selectedSize === talla ? 'var(--color-kb-obsidian)' : 'rgba(212,120,138,0.25)'}`,
                        background: selectedSize === talla ? 'var(--color-kb-obsidian)' : 'white',
                        color: selectedSize === talla ? 'var(--color-kb-ivory)' : 'var(--color-kb-charcoal)',
                        transition: 'all 0.25s ease',
                        cursor: 'pointer',
                      }}
                    >
                      {talla}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-8">
              <p className="text-editorial mb-3" style={{ color: 'var(--color-kb-mauve)', fontSize: '0.62rem', letterSpacing: '0.2em' }}>
                Cantidad
              </p>
              <div className="flex items-center gap-0">
                <button
                  onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                  type="button"
                  aria-label="Disminuir"
                  style={{
                    width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '1px solid rgba(212,120,138,0.25)', borderRight: 'none',
                    background: 'white', color: 'var(--color-kb-charcoal)',
                    fontSize: '1.1rem', fontWeight: 300, cursor: 'pointer',
                    borderRadius: '2px 0 0 2px', transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--color-kb-blush)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'white'}
                >
                  −
                </button>

                <div style={{
                  width: '52px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '1px solid rgba(212,120,138,0.25)',
                  fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 400,
                  color: 'var(--color-kb-charcoal)', letterSpacing: '-0.02em',
                }}>
                  {cantidad}
                </div>

                <button
                  onClick={() => setCantidad(Math.min(producto.stock, cantidad + 1))}
                  disabled={cantidad >= producto.stock}
                  type="button"
                  aria-label="Aumentar"
                  style={{
                    width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '1px solid rgba(212,120,138,0.25)', borderLeft: 'none',
                    background: 'white', color: 'var(--color-kb-charcoal)',
                    fontSize: '1.1rem', fontWeight: 300, cursor: cantidad >= producto.stock ? 'not-allowed' : 'pointer',
                    borderRadius: '0 2px 2px 0', transition: 'all 0.2s ease',
                    opacity: cantidad >= producto.stock ? 0.35 : 1,
                  }}
                  onMouseEnter={e => { if (cantidad < producto.stock) e.currentTarget.style.background = 'var(--color-kb-blush)' }}
                  onMouseLeave={e => e.currentTarget.style.background = 'white'}
                >
                  +
                </button>

                <span style={{
                  marginLeft: '14px', fontSize: '0.7rem', fontWeight: 300,
                  color: 'rgba(154,116,128,0.65)', letterSpacing: '0.04em',
                }}>
                  {producto.stock} {producto.stock === 1 ? 'unidad disponible' : 'unidades disponibles'}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <button
                onClick={handleAgregar}
                disabled={agregando || producto.stock === 0}
                className="btn-kb-secondary flex-1 flex items-center justify-center gap-2"
                style={{ padding: '0.95rem 1.5rem', fontSize: '0.68rem' }}
                type="button"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {agregando ? 'Agregando…' : 'Agregar al carrito'}
              </button>
              <button
                onClick={handleComprarAhora}
                disabled={agregando || producto.stock === 0}
                className="btn-kb-primary flex-1"
                style={{ padding: '0.95rem 1.5rem', fontSize: '0.68rem' }}
                type="button"
              >
                <span>{producto.stock === 0 ? 'Agotado' : 'Comprar ahora'}</span>
              </button>
            </div>

            <div style={{
              padding: '1.2rem 1.4rem',
              border: '1px solid rgba(212,120,138,0.15)',
              background: 'rgba(250,237,241,0.4)',
              borderRadius: '2px',
            }}>
              <p className="text-editorial mb-3" style={{ color: 'var(--color-kb-mauve)', fontSize: '0.6rem', letterSpacing: '0.2em' }}>
                Metodos de pago
              </p>
              <div className="flex flex-wrap gap-2">
                {['Yape', 'Plin', 'Tarjeta', 'Transferencia'].map((m) => (
                  <span
                    key={m}
                    style={{
                      fontSize: '0.68rem', fontWeight: 300, letterSpacing: '0.06em',
                      padding: '0.3rem 0.75rem', borderRadius: '2px',
                      border: '1px solid rgba(212,120,138,0.2)',
                      color: 'var(--color-kb-mauve)', background: 'white',
                    }}
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SECCION RESEÑAS CON VER MAS */}
        <div className="mt-24 pt-12" style={{ borderTop: '1px solid rgba(212,120,138,0.1)' }}>

          <div className="flex items-end justify-between mb-10">
            <div className="flex items-center gap-4">
              <span style={{ width: '24px', height: '1px', background: 'var(--color-kb-rose)', display: 'inline-block' }} />
              <h2 style={{
                fontFamily: 'var(--font-display)', fontSize: '1.6rem',
                fontWeight: 300, fontStyle: 'italic',
                color: 'var(--color-kb-charcoal)', letterSpacing: '-0.01em',
              }}>
                Opiniones
              </h2>
            </div>
            <button
              onClick={() => setMostrarFormularioReview(!mostrarFormularioReview)}
              className="px-4 py-2 border border-[rgba(212,120,138,0.4)] text-[#2D2030] rounded-sm text-xs font-['DM_Sans'] font-medium tracking-wide hover:bg-[#FDF0F3] hover:border-[#D4788A] transition-all duration-300"
            >
              {mostrarFormularioReview ? 'Cancelar' : 'Escribir opinion'}
            </button>
          </div>

          {/* Formulario para escribir reseña */}
          {mostrarFormularioReview && (
            <div className="mb-10 p-6 bg-[#FDF0F3] rounded-sm border border-[rgba(212,120,138,0.2)]">
              <h3 className="font-['Cormorant_Garamond'] text-xl font-light tracking-[-0.02em] text-[#1A1118] mb-4">
                Comparte tu experiencia
              </h3>
              
              {reviewExito && (
                <div className="mb-4 p-3 border border-[#D4788A] bg-white rounded-sm">
                  <p className="text-sm text-[#1A1118] font-['DM_Sans']">{reviewExito}</p>
                </div>
              )}
              
              {reviewError && (
                <div className="mb-4 p-3 border border-[#B85268] bg-white rounded-sm">
                  <p className="text-sm text-[#B85268] font-['DM_Sans']">{reviewError}</p>
                </div>
              )}
              
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="block text-[0.6rem] tracking-[0.25em] uppercase font-['DM_Sans'] font-light text-[#9A7480] mb-2">
                    Tu nombre *
                  </label>
                  <input
                    type="text"
                    name="customer_name"
                    value={reviewForm.customer_name}
                    onChange={handleReviewChange}
                    placeholder="Maria Gonzalez"
                    required
                    className="w-full border border-[rgba(212,120,138,0.25)] rounded-sm px-4 py-2.5 text-sm font-['DM_Sans'] font-light focus:outline-none focus:ring-1 focus:ring-[#D4788A] focus:border-transparent bg-white"
                  />
                </div>
                
                <div>
                  <label className="block text-[0.6rem] tracking-[0.25em] uppercase font-['DM_Sans'] font-light text-[#9A7480] mb-2">
                    Puntuacion *
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                        className="transition-all duration-300 hover:scale-110"
                        aria-label={`${star} estrella${star !== 1 ? 's' : ''}`}
                      >
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                            fill={star <= reviewForm.rating ? 'var(--color-kb-gold)' : 'rgba(212,120,138,0.25)'}
                            stroke="rgba(212,120,138,0.4)"
                            strokeWidth="0.5"
                          />
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-[0.6rem] tracking-[0.25em] uppercase font-['DM_Sans'] font-light text-[#9A7480] mb-2">
                    Tu opinion *
                  </label>
                  <textarea
                    name="comment"
                    value={reviewForm.comment}
                    onChange={handleReviewChange}
                    rows={4}
                    placeholder="Cuentanos que te parecio el producto..."
                    required
                    className="w-full border border-[rgba(212,120,138,0.25)] rounded-sm px-4 py-2.5 text-sm font-['DM_Sans'] font-light focus:outline-none focus:ring-1 focus:ring-[#D4788A] focus:border-transparent resize-none bg-white"
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={enviandoReview}
                  className="px-6 py-2.5 bg-[#1A1118] text-white rounded-sm text-sm font-['DM_Sans'] font-medium tracking-wide hover:bg-gradient-to-r hover:from-[#D4788A] hover:to-[#B85268] transition-all duration-300 disabled:bg-[#9A7480] disabled:cursor-not-allowed"
                >
                  {enviandoReview ? 'Enviando...' : 'Enviar opinion'}
                </button>
              </form>
            </div>
          )}

          {reviews.length === 0 ? (
            <div className="py-16 text-center">
              <div style={{ width: '40px', height: '1px', background: 'rgba(212,120,138,0.25)', margin: '0 auto 1.5rem' }} />
              <p style={{
                fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 300,
                color: 'var(--color-kb-mauve)', fontSize: '1.1rem', marginBottom: '0.5rem',
              }}>
                Aun sin reseñas
              </p>
              <p style={{ fontSize: '0.75rem', fontWeight: 300, color: 'rgba(154,116,128,0.5)' }}>
                ¡Se el primero en opinar!
              </p>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 gap-4">
                {reviewsToShow.map((review, i) => (
                  <div
                    key={`${review.id}-${i}`}
                    className="animate-fade-up"
                    style={{
                      background: 'white',
                      padding: '1.4rem 1.6rem',
                      borderLeft: '2px solid rgba(212,120,138,0.2)',
                      animationDelay: `${i * 60}ms`, animationFillMode: 'backwards',
                    }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div style={{
                          width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                          background: 'linear-gradient(135deg, var(--color-kb-rose), var(--color-kb-rose-deep))',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'white', fontSize: '0.85rem', fontFamily: 'var(--font-display)',
                          fontWeight: 400,
                        }}>
                          {review.customer_name?.charAt(0).toUpperCase() || 'C'}
                        </div>
                        <div>
                          <p style={{ fontSize: '0.82rem', fontWeight: 400, color: 'var(--color-kb-charcoal)' }}>
                            {review.customer_name || 'Cliente verificado'}
                          </p>
                          {review.verified_purchase && (
                            <span className="flex items-center gap-1" style={{ fontSize: '0.62rem', color: '#4CAF50', fontWeight: 300, letterSpacing: '0.04em' }}>
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              Compra verificada
                            </span>
                          )}
                        </div>
                      </div>
                      <Stars rating={review.rating} size={13} />
                    </div>

                    {review.comment && (
                      <p style={{ fontSize: '0.82rem', fontWeight: 300, color: 'rgba(45,32,48,0.7)', lineHeight: 1.7, marginBottom: '0.75rem' }}>
                        {review.comment}
                      </p>
                    )}

                    <span style={{ fontSize: '0.65rem', fontWeight: 300, color: 'rgba(154,116,128,0.5)', letterSpacing: '0.04em' }}>
                      {new Date(review.created_at).toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  </div>
                ))}
              </div>

              {/* Boton VER MAS / VER MENOS */}
              {reviews.length > 4 && (
                <div className="text-center mt-8">
                  <button
                    onClick={() => setMostrarTodasReviews(!mostrarTodasReviews)}
                    className="px-6 py-2 border border-[rgba(212,120,138,0.4)] text-[#2D2030] rounded-sm text-xs font-['DM_Sans'] font-medium tracking-wide hover:bg-[#FDF0F3] hover:border-[#D4788A] transition-all duration-300"
                  >
                    {mostrarTodasReviews ? 'Ver menos' : `Ver todas las ${reviews.length} opiniones`}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <WhatsAppButton phoneNumber="51906877812" />
    </div>
  )
}

export default ProductoPage