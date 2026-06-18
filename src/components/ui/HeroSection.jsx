import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

// ═══════════════════════════════════════════════════════════════════════════════
//  KB DRESSES & MORE — HERO SECTION V2.1
//  "Aurora Bloom" — Luz, color, feminidad y celebración
//  Paleta inspirada en el logo: rosas cálidos, melocotón, coral, dorado suave
//  NADA DE OSCURO. Todo es luz, aire, flores y alegría.
// ═══════════════════════════════════════════════════════════════════════════════

const SLIDE_DURATION_MS = 5000
const TRANSITION_DURATION_MS = 900

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=1600&h=1000&fit=crop&q=85'

// ─── Paleta Aurora Bloom — Clara, cálida, vibrante ───────────────────────────
const p = {
  rose: '#E891A8',
  roseDeep: '#D46A8A',
  roseVivid: '#FF6B9D',
  roseBlush: '#FFB8D0',
  roseMist: '#FFE4EC',
  peach: '#FFB088',
  coral: '#FF8E72',
  coralSoft: '#FFA78E',
  apricot: '#FFCBA4',
  cream: '#FFF5F0',
  ivory: '#FFFAF8',
  gold: '#E8C547',
  goldLight: '#F5E6A3',
  goldMist: '#FFF8E1',
  mint: '#A8E6CF',
  lavender: '#E2D5F8',
  warmWhite: '#FFF9F7',
  warmGray: '#B8A9A0',
  textMain: '#5A3D4A',
  textSoft: '#8B6F7A',
}

// ─── Trust items — ahora solo el path (sin SVG anidado) ────────────────────
const trustItems = [
  {
    label: '100% Originales',
    sub: 'Marcas de USA',
    path: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
    viewBox: '0 0 24 24',
  },
  {
    label: 'Envío a Todo el Perú',
    sub: 'Rápido y seguro',
    path: 'M5 9l2 2 4-4 M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v4z',
    viewBox: '0 0 24 24',
  },
  {
    label: 'Atención Personalizada',
    sub: 'Te ayudamos a elegir',
    path: 'M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z',
    viewBox: '0 0 24 24',
  },
  {
    label: 'Pago Seguro',
    sub: 'Yape, Plin, Tarjeta',
    path: 'M3 11h18v11H3z M7 11V7a5 5 0 0110 0v4',
    viewBox: '0 0 24 24',
  },
]

// ─── Floating petals decoration ──────────────────────────────────────────────
const Petal = ({ delay, left, size, color }) => (
  <div
    className="absolute pointer-events-none"
    style={{
      left: `${left}%`,
      top: '-20px',
      width: size,
      height: size,
      borderRadius: '50% 0 50% 50%',
      background: color,
      opacity: 0.4,
      animation: `petalFall 12s linear infinite`,
      animationDelay: `${delay}s`,
      filter: 'blur(1px)',
    }}
  />
)

// ─── Helper: truncar texto ───────────────────────────────────────────────────
const truncateText = (text, maxLength = 90) => {
  if (!text) return ''
  return text.length > maxLength ? text.slice(0, maxLength) + '...' : text
}

// ═══════════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
const HeroSection = () => {
  const [slides, setSlides] = useState([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [loading, setLoading] = useState(true)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)
  const timerRef = useRef(null)
  const transitionTimeoutRef = useRef(null)
  const sectionRef = useRef(null)
  const navigate = useNavigate()

  // ── Data fetch ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const { data, error } = await supabase
          .from('hero_slides')
          .select(
            `*, products(name, description, category, gender, brand, images_urls, image_url, price_final, price_original, stock)`
          )
          .eq('active', true)
          .order('sort_order', { ascending: true })

        if (error) throw error

        const processedSlides = data
          .map((slide) => {
            const product = slide.products
            const images =
              product?.images_urls?.length > 0
                ? product.images_urls
                : product?.image_url
                ? [product.image_url]
                : []

            const rawDescription =
              slide.description_override || product?.description || ''
            const truncatedDescription = truncateText(rawDescription, 90)

            if (product && product.stock === 0) {
              return null
            }

            if (!product) {
              return {
                id: slide.id,
                title: slide.title_override || 'Colección',
                titleAccent: slide.title_accent_override || 'Exclusiva',
                subtitle: slide.subtitle_override || 'Nueva Colección',
                description: truncatedDescription,
                image: slide.image_override || FALLBACK_IMAGE,
                category: 'todos',
                tag: slide.tag_override || 'Nuevo',
                price: null,
              }
            }

            const price = product.price_final ?? product.price_original ?? null

            return {
              id: slide.id,
              title:
                slide.title_override ||
                product.name?.split(' ')[0] ||
                'Colección',
              titleAccent:
                slide.title_accent_override ||
                product.name?.split(' ').slice(1).join(' ') ||
                'Exclusiva',
              subtitle: slide.subtitle_override || product.brand || 'Nueva Colección',
              description: truncatedDescription,
              image: slide.image_override || images[0] || FALLBACK_IMAGE,
              category: product.category || 'todos',
              tag: slide.tag_override || 'Nuevo',
              price: price,
              stock: product?.stock ?? null,
            }
          })
          .filter(slide => slide !== null)

        setSlides(processedSlides)
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('Error fetching slides:', error)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchSlides()
  }, [])

  // ── Precarga de imágenes ────────────────────────────────────────────────────
  useEffect(() => {
    if (slides.length === 0) return
    slides.forEach((slide) => {
      if (slide.image && slide.image !== FALLBACK_IMAGE) {
        const img = new Image()
        img.src = slide.image
      }
    })
  }, [slides])

  // ── Mouse tracking for parallax ─────────────────────────────────────────────
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!sectionRef.current) return
      const rect = sectionRef.current.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width - 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5
      setMousePosition({ x, y })
    }

    const element = sectionRef.current
    if (element) {
      element.addEventListener('mousemove', handleMouseMove)
      return () => element.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  // ── Autoplay with pause on hover ────────────────────────────────────────────
  useEffect(() => {
    if (slides.length < 2 || isHovered) return
    timerRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, SLIDE_DURATION_MS)

    return () => clearInterval(timerRef.current)
  }, [slides.length, isHovered])

  const goToSlide = useCallback(
    (index) => {
      if (isTransitioning || index === currentSlide) return
      clearInterval(timerRef.current)
      setIsTransitioning(true)
      setCurrentSlide(index)

      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current)
      }
      transitionTimeoutRef.current = setTimeout(() => {
        setIsTransitioning(false)
        transitionTimeoutRef.current = null
      }, TRANSITION_DURATION_MS)

      if (slides.length > 1 && !isHovered) {
        timerRef.current = setInterval(() => {
          setCurrentSlide((prev) => (prev + 1) % slides.length)
        }, SLIDE_DURATION_MS)
      }
    },
    [isTransitioning, currentSlide, slides.length, isHovered]
  )

  // ── Keyboard navigation ─────────────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!sectionRef.current || !sectionRef.current.contains(document.activeElement)) return
      if (slides.length < 2) return
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        goToSlide((currentSlide - 1 + slides.length) % slides.length)
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        goToSlide((currentSlide + 1) % slides.length)
      }
    }
    const element = sectionRef.current
    if (element) {
      element.addEventListener('keydown', handleKeyDown)
      return () => element.removeEventListener('keydown', handleKeyDown)
    }
  }, [currentSlide, slides.length, goToSlide])

  const handleComprarAhora = (categoria) => navigate(`/?categoria=${categoria}`)
  const handleVerTodo = () => navigate('/')

  // ── Generar pétalos aleatorios ──────────────────────────────────────────────
  const petals = useRef(
    Array.from({ length: 12 }, (_, i) => ({
      delay: i * 1.2,
      left: 5 + (i * 7.5) % 90,
      size: 8 + ((i * 3) % 13),
      color: [p.roseBlush, p.peach, p.coralSoft, p.roseMist, p.goldLight][i % 5],
    }))
  ).current

  // ── SKELETON LOADER ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <section
        className="relative overflow-hidden"
        style={{
          minHeight: '88vh',
          background: `linear-gradient(135deg, ${p.cream} 0%, ${p.roseMist} 50%, ${p.peach}30 100%)`,
        }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute -top-20 -right-20 w-96 h-96 rounded-full blur-3xl animate-pulse-soft"
            style={{ background: `radial-gradient(circle, ${p.roseBlush}60 0%, transparent 70%)` }}
          />
          <div
            className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full blur-3xl animate-pulse-soft"
            style={{
              background: `radial-gradient(circle, ${p.peach}50 0%, transparent 70%)`,
              animationDelay: '1s',
            }}
          />
        </div>

        <div className="relative z-10 max-w-screen-2xl mx-auto px-6 lg:px-12 h-full flex items-center">
          <div className="w-full max-w-2xl py-20">
            <div
              className="h-3 w-24 rounded-full mb-6 animate-shimmer-skeleton"
              style={{ background: `linear-gradient(90deg, ${p.roseBlush}40 0%, ${p.peach}60 50%, ${p.roseBlush}40 100%)`, backgroundSize: '200% 100%' }}
            />
            <div className="space-y-3 mb-6">
              <div
                className="h-12 w-full rounded-xl animate-shimmer-skeleton"
                style={{ background: `linear-gradient(90deg, ${p.roseMist} 0%, ${p.roseBlush}50 50%, ${p.roseMist} 100%)`, backgroundSize: '200% 100%' }}
              />
              <div
                className="h-12 w-3/4 rounded-xl animate-shimmer-skeleton"
                style={{ background: `linear-gradient(90deg, ${p.roseMist} 0%, ${p.peach}50 50%, ${p.roseMist} 100%)`, backgroundSize: '200% 100%', animationDelay: '0.2s' }}
              />
            </div>
            <div
              className="h-2 w-40 rounded-full mb-4 animate-shimmer-skeleton"
              style={{ background: `linear-gradient(90deg, ${p.roseBlush}30 0%, ${p.peach}50 50%, ${p.roseBlush}30 100%)`, backgroundSize: '200% 100%', animationDelay: '0.4s' }}
            />
            <div className="space-y-2 mb-8">
              <div
                className="h-2 w-full rounded-full animate-shimmer-skeleton"
                style={{ background: `linear-gradient(90deg, ${p.cream} 0%, ${p.roseBlush}30 50%, ${p.cream} 100%)`, backgroundSize: '200% 100%', animationDelay: '0.6s' }}
              />
              <div
                className="h-2 w-5/6 rounded-full animate-shimmer-skeleton"
                style={{ background: `linear-gradient(90deg, ${p.cream} 0%, ${p.peach}30 50%, ${p.cream} 100%)`, backgroundSize: '200% 100%', animationDelay: '0.8s' }}
              />
            </div>
            <div className="flex gap-3">
              <div
                className="h-14 w-48 rounded-2xl animate-shimmer-skeleton"
                style={{ background: `linear-gradient(90deg, ${p.roseBlush}50 0%, ${p.peach}60 50%, ${p.roseBlush}50 100%)`, backgroundSize: '200% 100%', animationDelay: '1s' }}
              />
              <div
                className="h-14 w-32 rounded-2xl animate-shimmer-skeleton"
                style={{ background: `linear-gradient(90deg, ${p.roseMist} 0%, ${p.roseBlush}40 50%, ${p.roseMist} 100%)`, backgroundSize: '200% 100%', animationDelay: '1.2s' }}
              />
            </div>
          </div>
        </div>

        <style>{`
          @keyframes shimmer-skeleton {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
          .animate-shimmer-skeleton {
            animation: shimmer-skeleton 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          }
          @keyframes pulse-soft {
            0%, 100% { opacity: 0.4; transform: scale(1); }
            50% { opacity: 0.7; transform: scale(1.05); }
          }
          .animate-pulse-soft {
            animation: pulse-soft 4s ease-in-out infinite; }
        `}</style>
      </section>
    )
  }

  if (slides.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#FFF5F0] rounded-2xl">
        <div className="text-center p-8">
          <p className="text-xl font-serif text-[#D46A8A]">✨ Pronto nuevas colecciones</p>
          <p className="text-sm text-[#8B6F7A] mt-2">Estamos actualizando nuestros productos</p>
        </div>
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  //  RENDER PRINCIPAL — Aurora Bloom
  // ═══════════════════════════════════════════════════════════════════════════════
  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden"
      tabIndex={0}
      role="region"
      aria-label="Carrusel de productos destacados"
      style={{ outline: 'none' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ════════════════════════════════════════════════════════════════════════
          FONDO — Gradientes vivos, múltiples capas, todo CLARO y CÁLIDO
      ════════════════════════════════════════════════════════════════════════ */}
      <div className="absolute inset-0" style={{ background: p.cream }}>
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${p.ivory} 0%, ${p.roseMist} 30%, ${p.peach}25 60%, ${p.cream} 100%)`,
          }}
        />

        <div
          className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full blur-3xl animate-float-slow"
          style={{
            background: `radial-gradient(circle, ${p.roseBlush}50 0%, ${p.peach}30 40%, transparent 70%)`,
            animationDuration: '20s',
          }}
        />

        <div
          className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full blur-3xl animate-float-slow"
          style={{
            background: `radial-gradient(circle, ${p.peach}45 0%, ${p.coralSoft}25 50%, transparent 70%)`,
            animationDuration: '25s',
            animationDelay: '3s',
            animationDirection: 'reverse',
          }}
        />

        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full blur-3xl animate-pulse-glow"
          style={{
            background: `radial-gradient(circle, ${p.goldLight}35 0%, ${p.roseBlush}15 50%, transparent 70%)`,
          }}
        />

        <div
          className="absolute bottom-0 right-0 w-[350px] h-[350px] rounded-full blur-3xl animate-float-slow"
          style={{
            background: `radial-gradient(circle, ${p.roseVivid}20 0%, transparent 70%)`,
            animationDuration: '18s',
            animationDelay: '5s',
          }}
        />

        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle, ${p.roseDeep} 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />

        <div
          className="absolute inset-0 pointer-events-none transition-transform duration-500 ease-out"
          style={{
            background: `radial-gradient(ellipse 50% 50% at ${50 + mousePosition.x * 20}% ${50 + mousePosition.y * 20}%, ${p.roseBlush}20 0%, transparent 60%)`,
          }}
        />
      </div>

      {petals.map((petal, i) => (
        <Petal key={i} {...petal} />
      ))}

      {/* ════════════════════════════════════════════════════════════════════════
          CONTENIDO PRINCIPAL
      ════════════════════════════════════════════════════════════════════════ */}
      <div className="relative z-10" style={{ minHeight: '88vh' }}>
        {slides.map((slide, index) => (
          <div
            key={`${slide.id}-bg`}
            className="absolute inset-0 transition-all"
            style={{
              opacity: index === currentSlide ? 1 : 0,
              transform:
                index === currentSlide
                  ? `scale(1) translate(${mousePosition.x * -8}px, ${mousePosition.y * -8}px)`
                  : 'scale(1.08)',
              transitionDuration: `${TRANSITION_DURATION_MS}ms`,
              transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            aria-hidden
          >
            <img
              src={slide.image || FALLBACK_IMAGE}
              alt=" "
              className="absolute inset-0 w-full h-full object-cover"
              style={{
                filter: 'brightness(0.92) saturate(1.1) contrast(1.02)',
                maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0) 70%)',
                WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0) 70%)',
              }}
              loading={index === currentSlide ? 'eager' : 'lazy'}
            />
          </div>
        ))}

        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg, ${p.ivory}00 0%, ${p.cream}80 50%, ${p.cream}F2 100%)`,
          }}
        />

        <div className="relative z-10 max-w-screen-2xl mx-auto px-6 lg:px-12 pt-16 pb-8 md:pt-24 md:pb-12">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center min-h-[70vh]">

            {/* LEFT: Text content */}
            <div className="lg:col-span-7 relative">
              {slides.map((slide, index) => (
                <div
                  key={`${slide.id}-text`}
                  className="transition-all"
                  style={{
                    opacity: index === currentSlide ? 1 : 0,
                    transform:
                      index === currentSlide
                        ? 'translateY(0) scale(1)'
                        : 'translateY(30px) scale(0.97)',
                    position: index === currentSlide ? 'relative' : 'absolute',
                    pointerEvents: index === currentSlide ? 'auto' : 'none',
                    transitionDuration: `${TRANSITION_DURATION_MS}ms`,
                    transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                  aria-hidden={index !== currentSlide}
                >
                  <div className="flex items-center gap-3 mb-5">
                    <div className="relative">
                      <span
                        className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-[0.65rem] tracking-[0.25em] uppercase font-semibold"
                        style={{
                          color: p.ivory,
                          background: `linear-gradient(135deg, ${p.roseVivid} 0%, ${p.coral} 100%)`,
                          boxShadow: `0 4px 20px ${p.roseVivid}50, 0 2px 8px ${p.coral}30`,
                          fontFamily: 'var(--font-sans, system-ui)',
                        }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full animate-pulse"
                          style={{ background: p.ivory, boxShadow: `0 0 8px ${p.ivory}` }}
                        />
                        {slide.tag}
                      </span>
                    </div>
                    <div
                      className="flex-1 h-px max-w-[80px]"
                      style={{
                        background: `linear-gradient(90deg, ${p.roseBlush} 0%, ${p.peach}60 50%, transparent 100%)`,
                      }}
                    />
                  </div>

                  <h1
                    className="leading-[0.92] mb-5"
                    style={{
                      fontFamily: "'Playfair Display', 'Cormorant Garamond', Georgia, serif",
                      fontSize: 'clamp(2.8rem, 7vw, 5.5rem)',
                      fontWeight: 700,
                      color: p.textMain,
                      letterSpacing: '-0.03em',
                      textShadow: '0 2px 20px rgba(255,255,255,0.8)',
                    }}
                  >
                    {slide.title}{' '}
                    <span
                      className="inline-block"
                      style={{
                        fontStyle: 'italic',
                        fontWeight: 400,
                        background: `linear-gradient(135deg, ${p.roseVivid} 0%, ${p.coral} 30%, ${p.roseDeep} 60%, ${p.gold} 100%)`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        backgroundSize: '300% 300%',
                        animation: 'gradientShift 6s ease infinite',
                        filter: `drop-shadow(0 2px 12px ${p.roseBlush}66)`,
                      }}
                    >
                      {slide.titleAccent}
                    </span>
                  </h1>

                  <p
                    className="text-[0.75rem] tracking-[0.3em] uppercase mb-4 font-semibold"
                    style={{
                      color: p.roseDeep,
                      fontFamily: 'var(--font-sans, system-ui)',
                    }}
                  >
                    {slide.subtitle}
                  </p>

                  <p
                    className="leading-relaxed max-w-lg mb-8"
                    style={{
                      color: p.textSoft,
                      fontSize: 'clamp(0.95rem, 1.1vw, 1.1rem)',
                      fontWeight: 400,
                      fontFamily: 'var(--font-sans, system-ui)',
                      lineHeight: 1.7,
                    }}
                  >
                    {slide.description}
                  </p>

                  <div className="flex items-baseline gap-3 mb-8">
                    <span
                      style={{
                        fontFamily: "'Playfair Display', Georgia, serif",
                        fontSize: '1.1rem',
                        fontWeight: 400,
                        color: p.textSoft,
                        letterSpacing: '0.1em',
                      }}
                    >
                      Desde
                    </span>
                    {slide.price ? (
                      <span
                        style={{
                          fontFamily: "'Playfair Display', Georgia, serif",
                          fontSize: '2.8rem',
                          fontWeight: 700,
                          color: p.roseDeep,
                          letterSpacing: '-0.03em',
                          lineHeight: 1,
                        }}
                      >
                        S/ {slide.price.toFixed(2)}
                      </span>
                    ) : (
                      <span
                        style={{
                          fontFamily: "'Playfair Display', Georgia, serif",
                          fontSize: '1.8rem',
                          fontWeight: 400,
                          color: p.textSoft,
                          letterSpacing: '-0.01em',
                        }}
                      >
                        Precio bajo consulta
                      </span>
                    )}
                    {slide.price && <span style={{ color: p.roseBlush, fontSize: '1rem', fontWeight: 300 }}>.00</span>}
                  </div>

                  <div className="flex flex-wrap gap-4">
                    <button
                      onClick={() => handleComprarAhora(slide.category)}
                      className="group relative overflow-hidden transition-all duration-500"
                      style={{
                        fontFamily: 'var(--font-sans, system-ui)',
                        fontSize: 'clamp(0.72rem, 0.8vw, 0.85rem)',
                        fontWeight: 700,
                        letterSpacing: '0.2em',
                        textTransform: 'uppercase',
                        color: p.ivory,
                        background: `linear-gradient(135deg, ${p.roseVivid} 0%, ${p.coral} 50%, ${p.roseDeep} 100%)`,
                        padding: '1.1rem 2.8rem',
                        borderRadius: '50px',
                        cursor: 'pointer',
                        minHeight: '56px',
                        boxShadow: `0 8px 32px ${p.roseVivid}50, 0 4px 16px ${p.coral}30`,
                        border: 'none',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px) scale(1.03)'
                        e.currentTarget.style.boxShadow = `0 16px 48px ${p.roseVivid}70, 0 8px 24px ${p.coral}40`
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0) scale(1)'
                        e.currentTarget.style.boxShadow = `0 8px 32px ${p.roseVivid}50, 0 4px 16px ${p.coral}30`
                      }}
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        Descubrir Colección
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                      </span>
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                        style={{
                          background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)',
                          transform: 'translateX(-100%)',
                          animation: 'shine 2s ease-in-out infinite',
                        }}
                      />
                    </button>

                    <button
                      onClick={handleVerTodo}
                      className="group relative transition-all duration-500 flex items-center gap-2"
                      style={{
                        fontFamily: 'var(--font-sans, system-ui)',
                        fontSize: 'clamp(0.7rem, 0.75vw, 0.8rem)',
                        fontWeight: 600,
                        letterSpacing: '0.2em',
                        textTransform: 'uppercase',
                        color: p.roseDeep,
                        background: 'transparent',
                        border: `2px solid ${p.roseBlush}`,
                        padding: '1.1rem 2.2rem',
                        borderRadius: '50px',
                        cursor: 'pointer',
                        minHeight: '56px',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = p.roseMist
                        e.currentTarget.style.borderColor = p.roseVivid
                        e.currentTarget.style.color = p.roseDeep
                        e.currentTarget.style.transform = 'translateY(-2px)'
                        e.currentTarget.style.boxShadow = `0 8px 24px ${p.roseBlush}50`
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent'
                        e.currentTarget.style.borderColor = p.roseBlush
                        e.currentTarget.style.color = p.roseDeep
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                    >
                      Ver Todo
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300 group-hover:translate-x-1">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* RIGHT: Product showcase — Desktop */}
            <div className="hidden lg:flex lg:col-span-5 justify-center items-center relative">
              <div
                className="absolute rounded-full animate-spin-slow"
                style={{
                  width: '400px',
                  height: '400px',
                  border: `2px dashed ${p.roseBlush}50`,
                  animationDuration: '40s',
                }}
              />
              <div
                className="absolute rounded-full animate-spin-slow"
                style={{
                  width: '340px',
                  height: '340px',
                  border: `2px dashed ${p.peach}40`,
                  animationDuration: '30s',
                  animationDirection: 'reverse',
                }}
              />

              <div
                className="absolute rounded-full blur-3xl animate-pulse-glow"
                style={{
                  width: '300px',
                  height: '300px',
                  background: `radial-gradient(circle, ${p.roseBlush}50 0%, ${p.peach}30 40%, transparent 70%)`,
                }}
              />

              <div
                className="relative overflow-hidden"
                style={{
                  width: '320px',
                  height: '420px',
                  borderRadius: '24px',
                  border: `3px solid ${p.ivory}`,
                  boxShadow: `
                    0 24px 80px ${p.roseBlush}40,
                    0 8px 32px ${p.peach}30,
                    inset 0 0 60px ${p.roseMist}20
                  `,
                  transform: `perspective(1000px) rotateY(${mousePosition.x * 8}deg) rotateX(${mousePosition.y * -6}deg)`,
                  transition: 'transform 0.4s ease-out',
                }}
              >
                {slides.map((slide, index) => (
                  <img
                    key={`${slide.id}-img`}
                    src={slide.image || FALLBACK_IMAGE}
                    alt={slide.title}
                    className="absolute inset-0 w-full h-full object-cover transition-all"
                    style={{
                      opacity: index === currentSlide ? 1 : 0,
                      transform:
                        index === currentSlide ? 'scale(1)' : 'scale(1.1)',
                      transitionDuration: `${TRANSITION_DURATION_MS}ms`,
                      transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                    loading={index === currentSlide ? 'eager' : 'lazy'}
                  />
                ))}

                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(180deg, transparent 60%, ${p.roseMist}40 100%)`,
                  }}
                />
              </div>

              <div
                className="absolute -bottom-4 -right-4 group cursor-default"
                style={{
                  background: p.ivory,
                  border: `2px solid ${p.roseBlush}`,
                  borderRadius: '20px',
                  padding: '1rem 1.4rem',
                  boxShadow: `0 12px 40px ${p.roseBlush}40, 0 4px 16px ${p.peach}20`,
                  transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-6px) scale(1.05)'
                  e.currentTarget.style.boxShadow = `0 20px 56px ${p.roseVivid}50, 0 8px 24px ${p.peach}30`
                  e.currentTarget.style.borderColor = p.roseVivid
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)'
                  e.currentTarget.style.boxShadow = `0 12px 40px ${p.roseBlush}40, 0 4px 16px ${p.peach}20`
                  e.currentTarget.style.borderColor = p.roseBlush
                }}
              >
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: '1.4rem' }}>✨</span>
                  <div>
                    <p
                      className="text-[0.55rem] tracking-[0.25em] uppercase font-semibold"
                      style={{
                        color: p.roseDeep,
                        fontFamily: 'var(--font-sans, system-ui)',
                      }}
                    >
                      Importado desde
                    </p>
                    <p
                      style={{
                        fontFamily: "'Playfair Display', Georgia, serif",
                        fontSize: '1.2rem',
                        fontWeight: 700,
                        fontStyle: 'italic',
                        color: p.roseVivid,
                        lineHeight: 1.1,
                        letterSpacing: '-0.01em',
                      }}
                    >
                      EE.UU.
                    </p>
                  </div>
                </div>
              </div>

              <div
                className="absolute -top-6 left-8 animate-float-gentle"
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${p.roseBlush}60 0%, ${p.peach}40 100%)`,
                  boxShadow: `0 8px 24px ${p.roseBlush}30`,
                  animationDelay: '0s',
                }}
              />
              <div
                className="absolute top-20 -right-6 animate-float-gentle"
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${p.goldLight}70 0%, ${p.peach}50 100%)`,
                  boxShadow: `0 6px 20px ${p.gold}30`,
                  animationDelay: '2s',
                }}
              />
              <div
                className="absolute bottom-20 left-0 animate-float-gentle"
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${p.coralSoft}60 0%, ${p.roseBlush}40 100%)`,
                  boxShadow: `0 4px 16px ${p.coral}25`,
                  animationDelay: '4s',
                }}
              />
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════════════
            NAVEGACIÓN — Pills con color
        ════════════════════════════════════════════════════════════════════════ */}
        <div
          className="absolute right-8 top-1/2 -translate-y-1/2 z-20 hidden md:flex flex-col gap-3"
          role="tablist"
          aria-label="Navegación de slides"
        >
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              onClick={() => goToSlide(index)}
              className="group relative flex items-center justify-end gap-3"
              role="tab"
              aria-selected={index === currentSlide}
              aria-label={`${slide.title} ${slide.titleAccent}`}
              style={{ minHeight: '44px' }}
            >
              <span
                className="transition-all duration-500 font-semibold"
                style={{
                  fontFamily: 'var(--font-sans, system-ui)',
                  fontSize: '0.65rem',
                  letterSpacing: '0.15em',
                  color: index === currentSlide ? p.roseDeep : 'transparent',
                  userSelect: 'none',
                  transform: index === currentSlide ? 'translateX(0)' : 'translateX(10px)',
                }}
              >
                {String(index + 1).padStart(2, '0')}
              </span>
              <div
                className="transition-all duration-700 rounded-full relative overflow-hidden"
                style={{
                  width: index === currentSlide ? '4px' : '3px',
                  height: index === currentSlide ? '36px' : '14px',
                  background: index === currentSlide
                    ? `linear-gradient(180deg, ${p.roseVivid}, ${p.coral})`
                    : `${p.roseBlush}50`,
                  boxShadow: index === currentSlide ? `0 0 16px ${p.roseVivid}60` : 'none',
                }}
              >
                {index === currentSlide && (
                  <div
                    className="absolute inset-0 animate-shimmer-vertical"
                    style={{
                      background: 'linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%)',
                    }}
                  />
                )}
              </div>
            </button>
          ))}
        </div>

        <div
          className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 flex md:hidden gap-3 items-center"
          role="tablist"
          aria-label="Navegación de slides"
        >
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              role="tab"
              aria-selected={index === currentSlide}
              aria-label={`Slide ${index + 1}`}
              onClick={() => goToSlide(index)}
              style={{
                background: 'none',
                border: 'none',
                padding: '8px',
                cursor: 'pointer',
                minWidth: '44px',
                minHeight: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                className="transition-all duration-500 rounded-full"
                style={{
                  width: index === currentSlide ? '28px' : '8px',
                  height: '8px',
                  borderRadius: index === currentSlide ? '12px' : '50%',
                  background: index === currentSlide
                    ? `linear-gradient(90deg, ${p.roseVivid}, ${p.coral})`
                    : `${p.roseBlush}60`,
                  boxShadow: index === currentSlide ? `0 0 16px ${p.roseVivid}50` : 'none',
                }}
              />
            </button>
          ))}
        </div>

        <div
          aria-hidden
          className="absolute bottom-8 left-8 lg:left-12 z-20 hidden md:flex items-end gap-4"
        >
          <span
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 'clamp(3.5rem, 8vw, 6rem)',
              fontWeight: 700,
              fontStyle: 'italic',
              color: `${p.roseBlush}30`,
              lineHeight: 1,
              letterSpacing: '-0.05em',
              userSelect: 'none',
            }}
          >
            {String(currentSlide + 1).padStart(2, '0')}
          </span>
          <span
            style={{
              fontFamily: 'var(--font-sans, system-ui)',
              fontSize: '0.7rem',
              letterSpacing: '0.2em',
              color: `${p.roseBlush}60`,
              marginBottom: '1rem',
            }}
          >
            / {String(slides.length).padStart(2, '0')}
          </span>
        </div>

        <div
          aria-hidden
          className="absolute bottom-0 left-0 right-0 z-20 overflow-hidden"
          style={{ height: '4px', background: `${p.roseBlush}25` }}
        >
          <div
            key={`progress-${currentSlide}`}
            style={{
              height: '100%',
              background: `linear-gradient(90deg, ${p.roseVivid} 0%, ${p.coral} 40%, ${p.gold} 70%, ${p.roseVivid} 100%)`,
              animation: `progressAdvance ${SLIDE_DURATION_MS}ms linear forwards`,
              boxShadow: `0 0 16px ${p.roseVivid}50`,
            }}
          />
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════════
          TRUST BAR — Con iconos corregidos
      ════════════════════════════════════════════════════════════════════════ */}
      <div
        style={{
          background: `linear-gradient(180deg, ${p.cream} 0%, ${p.ivory} 100%)`,
          borderTop: `1px solid ${p.roseBlush}30`,
          position: 'relative',
          zIndex: 20,
        }}
      >
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {trustItems.map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-4 group cursor-default"
              >
                <div
                  className="flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-3"
                  style={{
                    background: `linear-gradient(135deg, ${p.roseMist} 0%, ${p.peach}30 100%)`,
                    border: `2px solid ${p.roseBlush}40`,
                    boxShadow: `0 4px 16px ${p.roseBlush}20`,
                  }}
                >
                  <svg
                    className="w-6 h-6 transition-all duration-500 group-hover:scale-110"
                    fill="none"
                    stroke={p.roseDeep}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    viewBox={item.viewBox || '0 0 24 24'}
                  >
                    <path d={item.path} />
                  </svg>
                </div>
                <div>
                  <span
                    className="block text-[0.7rem] tracking-[0.15em] uppercase font-bold"
                    style={{
                      fontFamily: 'var(--font-sans, system-ui)',
                      color: p.textMain,
                    }}
                  >
                    {item.label}
                  </span>
                  <span
                    className="block text-[0.6rem] tracking-[0.1em]"
                    style={{
                      fontFamily: 'var(--font-sans, system-ui)',
                      color: p.textSoft,
                    }}
                  >
                    {item.sub}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════════
          KEYFRAMES — Todas las animaciones con duraciones por defecto
      ════════════════════════════════════════════════════════════════════════ */}
      <style>{`
        @keyframes progressAdvance {
          from { width: 0%; }
          to { width: 100%; }
        }

        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes float-slow {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(20px, -30px) rotate(5deg); }
          50% { transform: translate(-10px, -50px) rotate(-3deg); }
          75% { transform: translate(30px, -20px) rotate(8deg); }
        }

        @keyframes float-gentle {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-12px) rotate(3deg); }
          66% { transform: translateY(-6px) rotate(-2deg); }
        }

        @keyframes pulse-glow {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.15); }
        }

        @keyframes shimmer-vertical {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }

        @keyframes shine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }

        @keyframes petalFall {
          0% { transform: translateY(0) rotate(0deg) scale(1); opacity: 0.4; }
          25% { transform: translateY(25vh) rotate(90deg) scale(0.9); opacity: 0.5; }
          50% { transform: translateY(50vh) rotate(180deg) scale(0.8); opacity: 0.3; }
          75% { transform: translateY(75vh) rotate(270deg) scale(0.7); opacity: 0.2; }
          100% { transform: translateY(110vh) rotate(360deg) scale(0.5); opacity: 0; }
        }

        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .animate-float-slow {
          animation: float-slow 20s linear infinite;
        }

        .animate-float-gentle {
          animation: float-gentle 6s ease-in-out infinite;
        }

        .animate-pulse-glow {
          animation: pulse-glow 4s ease-in-out infinite;
        }

        .animate-spin-slow {
          animation: spin-slow 30s linear infinite;
        }

        .animate-shimmer-vertical {
          animation: shimmer-vertical 2s ease-in-out infinite;
        }
      `}</style>
    </section>
  )
}

export default HeroSection