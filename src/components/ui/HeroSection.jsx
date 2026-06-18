import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

// ═══════════════════════════════════════════════════════════════════════════════
//  KB DRESSES & MORE — HERO SECTION V3.1
//  "Aurora Bloom Editorial" — Lujo, feminidad y celebración refinada
//  Inspiración: Vogue, Net-a-Porter, Chanel
//  Correcciones aplicadas:
//   - process.env.NODE_ENV → import.meta.env.MODE (Vite compatible)
//   - Cleanup de transitionTimeoutRef al desmontar
//   - Paths SVG del MorphingBlob cerrados con Z
//   - animateIn se resetea al cambiar de slide (opcional, refinado)
// ═══════════════════════════════════════════════════════════════════════════════

const SLIDE_DURATION_MS = 6000
const TRANSITION_DURATION_MS = 1000
const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=1600&h=1000&fit=crop&q=85'

// ─── Paleta Aurora Bloom — Editorial Edition ─────────────────────────────────
const p = {
  // Rosados (identidad)
  rose: '#E891A8',
  roseDeep: '#C9607F',
  roseVivid: '#FF5C8A',
  roseBlush: '#FFC2D4',
  roseMist: '#FFE8EF',
  // Champagne & Nude (lujo)
  champagne: '#E8D5B7',
  champagneLt: '#F5EBD9',
  nude: '#E8CDB5',
  // Base cálida
  peach: '#FFB088',
  coral: '#FF8E72',
  coralSoft: '#FFA78E',
  apricot: '#FFCBA4',
  cream: '#FFF5F0',
  ivory: '#FFFAF8',
  // Dorados
  gold: '#C9A961',
  goldSoft: '#D4B87A',
  goldLight: '#F5E6A3',
  goldMist: '#FFF8E1',
  // Textos
  ink: '#2D1F26',
  textMain: '#4A3340',
  textSoft: '#8B6F7A',
}

// ─── Trust bar items ─────────────────────────────────────────────────────────
const trustItems = [
  {
    label: '100% Originales',
    sub: 'Marcas de USA',
    path: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  },
  {
    label: 'Envío a Todo el Perú',
    sub: 'Rápido y seguro',
    path: 'M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0',
  },
  {
    label: 'Atención Personalizada',
    sub: 'Te ayudamos a elegir',
    path: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
  },
  {
    label: 'Pago Seguro',
    sub: 'Yape, Plin, Tarjeta',
    path: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
  },
]

// ─── Helper: truncar texto ───────────────────────────────────────────────────
const truncateText = (text, maxLength = 110) => {
  if (!text) return ''
  return text.length > maxLength ? text.slice(0, maxLength) + '...' : text
}

// ═══════════════════════════════════════════════════════════════════════════════
//  SUBCOMPONENTES
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Split Text: revelado palabra por palabra ────────────────────────────────
const SplitText = ({
  text,
  delay = 0,
  animate,
  className = '',
  style = {},
  as: Tag = 'span',
}) => {
  const words = text.split(' ')
  return (
    <Tag
      className={`inline-flex flex-wrap gap-x-[0.28em] overflow-hidden align-baseline ${className}`}
      style={style}
    >
      {words.map((w, i) => (
        <span
          key={i}
          className="inline-block will-change-transform"
          style={{
            transform: animate ? 'translateY(0)' : 'translateY(115%)',
            opacity: animate ? 1 : 0,
            transition: `transform 1s cubic-bezier(0.16, 1, 0.3, 1) ${delay + i * 0.07}s, opacity 0.8s ease ${delay + i * 0.07}s`,
          }}
        >
          {w}
        </span>
      ))}
    </Tag>
  )
}

// ─── Animated Price: cuenta desde 0 hasta el precio ──────────────────────────
const AnimatedPrice = ({ value, inView, duration = 1400 }) => {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    if (!inView || value == null) return
    const start = performance.now()
    let rafId
    const tick = (now) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(eased * value)
      if (progress < 1) rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [value, inView, duration])
  return <>{display.toFixed(2)}</>
}

// ─── Magnetic Button: sigue el cursor con efecto magnético ───────────────────
const MagneticButton = ({
  onClick,
  children,
  variant = 'primary',
  icon,
  strength = 0.35,
}) => {
  const ref = useRef(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [hover, setHover] = useState(false)

  const handleMove = (e) => {
    const r = ref.current.getBoundingClientRect()
    const x = (e.clientX - r.left - r.width / 2) * strength
    const y = (e.clientY - r.top - r.height / 2) * strength
    setPos({ x, y })
  }
  const reset = () => setPos({ x: 0, y: 0 })

  const styles =
    variant === 'primary'
      ? {
          background: `linear-gradient(135deg, ${p.roseVivid} 0%, ${p.coral} 55%, ${p.goldSoft} 100%)`,
          color: p.ivory,
          boxShadow: hover
            ? `0 20px 55px ${p.roseVivid}60, 0 0 0 1px ${p.goldSoft}50`
            : `0 10px 35px ${p.roseVivid}45`,
          border: 'none',
        }
      : {
          background: `${p.ivory}CC`,
          color: p.roseDeep,
          boxShadow: hover
            ? `0 12px 30px ${p.roseBlush}50, 0 0 0 1px ${p.roseDeep}30`
            : `0 4px 16px ${p.roseBlush}20`,
          border: `1.5px solid ${p.roseBlush}`,
          backdropFilter: 'blur(10px)',
        }

  return (
    <button
      ref={ref}
      onClick={onClick}
      onMouseMove={handleMove}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => {
        reset()
        setHover(false)
      }}
      className="group relative inline-flex items-center gap-3 overflow-hidden will-change-transform"
      style={{
        transform: `translate(${pos.x}px, ${pos.y}px)`,
        transition:
          'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease, background 0.4s ease',
        padding: '1.1rem 2.4rem',
        fontSize: '0.7rem',
        fontWeight: 600,
        letterSpacing: '0.22em',
        textTransform: 'uppercase',
        borderRadius: '999px',
        cursor: 'pointer',
        minHeight: '54px',
        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        ...styles,
      }}
    >
      {/* Shimmer en hover */}
      <span
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)',
          transform: hover ? 'translateX(120%)' : 'translateX(-120%)',
          transition: 'transform 1s ease',
        }}
      />
      <span className="relative z-10 flex items-center gap-2.5">
        {children}
        {icon && (
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-transform duration-300 group-hover:translate-x-1"
          >
            {icon}
          </svg>
        )}
      </span>
    </button>
  )
}

// ─── Morphing Blob SVG: paths cerrados con Z ─────────────────────────────────
const MorphingBlob = ({ gradientId, colors, size = 700, opacity = 0.35 }) => (
  <svg
    className="absolute pointer-events-none"
    style={{
      width: size,
      height: size,
      filter: 'blur(60px)',
      opacity,
    }}
    viewBox="0 0 800 800"
  >
    <defs>
      <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={colors[0]} />
        <stop offset="50%" stopColor={colors[1]} />
        <stop offset="100%" stopColor={colors[2]} />
      </linearGradient>
    </defs>
    <path fill={`url(#${gradientId})`}>
      <animate
        attributeName="d"
        dur="20s"
        repeatCount="indefinite"
        values="
          M400,300 Q520,220 620,320 T600,520 Q500,620 380,520 T200,420 Q280,300 400,300 Z;
          M400,260 Q560,240 620,360 T560,560 Q440,620 340,520 T200,380 Q260,280 400,260 Z;
          M400,300 Q520,220 620,320 T600,520 Q500,620 380,520 T200,420 Q280,300 400,300 Z
        "
      />
    </path>
  </svg>
)

// ─── Pétalo flotante refinado ────────────────────────────────────────────────
const Petal = ({ delay, left, size, color, duration }) => (
  <div
    className="absolute pointer-events-none"
    style={{
      left: `${left}%`,
      top: '-20px',
      width: size,
      height: size * 1.3,
      borderRadius: '50% 0 50% 50%',
      background: color,
      opacity: 0.3,
      animation: `heroPetalFall ${duration}s linear infinite`,
      animationDelay: `${delay}s`,
      filter: 'blur(0.8px)',
    }}
  />
)

// ═══════════════════════════════════════════════════════════════════════════════
//  COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════
const HeroSection = () => {
  const [slides, setSlides] = useState([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isHovered, setIsHovered] = useState(false)
  const [animateIn, setAnimateIn] = useState(false)

  // Mouse position con lerp para suavidad
  const mouseTarget = useRef({ x: 0, y: 0 })
  const mouseCurrent = useRef({ x: 0, y: 0 })
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const rafRef = useRef(null)

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
            const truncatedDescription = truncateText(rawDescription, 110)

            if (product && product.stock === 0) return null

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
              price,
            }
          })
          .filter((s) => s !== null)

        setSlides(processedSlides)
      } catch (error) {
        // ✅ CORRECCIÓN 1: Vite usa import.meta.env, no process.env
        if (import.meta.env.MODE === 'development') {
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

  // ── Mouse tracking con lerp (suavizado) ─────────────────────────────────────
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!sectionRef.current) return
      const rect = sectionRef.current.getBoundingClientRect()
      mouseTarget.current = {
        x: (e.clientX - rect.left) / rect.width - 0.5,
        y: (e.clientY - rect.top) / rect.height - 0.5,
      }
    }

    const lerpLoop = () => {
      mouseCurrent.current.x +=
        (mouseTarget.current.x - mouseCurrent.current.x) * 0.08
      mouseCurrent.current.y +=
        (mouseTarget.current.y - mouseCurrent.current.y) * 0.08
      setMousePos({ ...mouseCurrent.current })
      rafRef.current = requestAnimationFrame(lerpLoop)
    }

    const el = sectionRef.current
    if (el) {
      el.addEventListener('mousemove', handleMouseMove)
      rafRef.current = requestAnimationFrame(lerpLoop)
      return () => {
        el.removeEventListener('mousemove', handleMouseMove)
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [])

  // ── Autoplay con pausa en hover ─────────────────────────────────────────────
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

  // ✅ CORRECCIÓN 2: Cleanup del transitionTimeoutRef al desmontar
  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current)
      }
    }
  }, [])

  // ── Keyboard navigation ─────────────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!sectionRef.current) return
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
    const el = sectionRef.current
    if (el) {
      el.addEventListener('keydown', handleKeyDown)
      return () => el.removeEventListener('keydown', handleKeyDown)
    }
  }, [currentSlide, slides.length, goToSlide])

  // ── Animación inicial al montar ─────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => setAnimateIn(true), 100)
    return () => clearTimeout(t)
  }, [])

  // ✅ CORRECCIÓN 3 (opcional): Resetear animateIn al cambiar de slide
  // para que el Split Text se vuelva a animar en cada slide
  useEffect(() => {
    if (slides.length > 1) {
      setAnimateIn(false)
      const t = setTimeout(() => setAnimateIn(true), 50)
      return () => clearTimeout(t)
    }
  }, [currentSlide, slides.length])

  const handleComprarAhora = (categoria) => navigate(`/?categoria=${categoria}`)
  const handleVerTodo = () => navigate('/')

  // ── Generar pétalos (8 refinados) ───────────────────────────────────────────
  const petals = useRef(
    Array.from({ length: 8 }, (_, i) => ({
      delay: i * 1.8,
      left: 8 + (i * 11) % 85,
      size: 7 + ((i * 2) % 9),
      color: [p.roseBlush, p.peach, p.coralSoft, p.roseMist, p.goldLight][i % 5],
      duration: 16 + (i % 4) * 2,
    }))
  ).current

  // ═══════════════════════════════════════════════════════════════════════════════
  //  SKELETON LOADER
  // ═══════════════════════════════════════════════════════════════════════════════
  if (loading) {
    return (
      <section
        className="relative overflow-hidden"
        style={{
          minHeight: '92vh',
          background: `linear-gradient(135deg, ${p.cream} 0%, ${p.roseMist} 50%, ${p.peach}25 100%)`,
        }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <MorphingBlob
            gradientId="skelBlob1"
            colors={[p.roseBlush, p.champagne, p.peach]}
            size={600}
            opacity={0.3}
          />
        </div>

        <div className="relative z-10 max-w-screen-2xl mx-auto px-6 lg:px-12 h-full flex items-center">
          <div className="w-full max-w-2xl py-20">
            {/* Tag */}
            <div
              className="h-8 w-32 rounded-full mb-8 animate-shimmer-skeleton"
              style={{
                background: `linear-gradient(90deg, ${p.roseBlush}40, ${p.peach}60, ${p.roseBlush}40)`,
                backgroundSize: '200% 100%',
              }}
            />
            {/* Título */}
            <div className="space-y-4 mb-8">
              <div
                className="h-16 w-full rounded-xl animate-shimmer-skeleton"
                style={{
                  background: `linear-gradient(90deg, ${p.roseMist}, ${p.roseBlush}50, ${p.roseMist})`,
                  backgroundSize: '200% 100%',
                }}
              />
              <div
                className="h-16 w-3/4 rounded-xl animate-shimmer-skeleton"
                style={{
                  background: `linear-gradient(90deg, ${p.roseMist}, ${p.peach}50, ${p.roseMist})`,
                  backgroundSize: '200% 100%',
                  animationDelay: '0.2s',
                }}
              />
            </div>
            {/* Subtítulo */}
            <div
              className="h-3 w-48 rounded-full mb-5 animate-shimmer-skeleton"
              style={{
                background: `linear-gradient(90deg, ${p.roseBlush}30, ${p.peach}50, ${p.roseBlush}30)`,
                backgroundSize: '200% 100%',
                animationDelay: '0.4s',
              }}
            />
            {/* Descripción */}
            <div className="space-y-2 mb-10">
              <div
                className="h-2.5 w-full rounded-full animate-shimmer-skeleton"
                style={{
                  background: `linear-gradient(90deg, ${p.cream}, ${p.roseBlush}30, ${p.cream})`,
                  backgroundSize: '200% 100%',
                  animationDelay: '0.6s',
                }}
              />
              <div
                className="h-2.5 w-5/6 rounded-full animate-shimmer-skeleton"
                style={{
                  background: `linear-gradient(90deg, ${p.cream}, ${p.peach}30, ${p.cream})`,
                  backgroundSize: '200% 100%',
                  animationDelay: '0.8s',
                }}
              />
            </div>
            {/* Botones */}
            <div className="flex gap-4">
              <div
                className="h-14 w-56 rounded-full animate-shimmer-skeleton"
                style={{
                  background: `linear-gradient(90deg, ${p.roseBlush}50, ${p.peach}60, ${p.roseBlush}50)`,
                  backgroundSize: '200% 100%',
                  animationDelay: '1s',
                }}
              />
              <div
                className="h-14 w-40 rounded-full animate-shimmer-skeleton"
                style={{
                  background: `linear-gradient(90deg, ${p.roseMist}, ${p.roseBlush}40, ${p.roseMist})`,
                  backgroundSize: '200% 100%',
                  animationDelay: '1.2s',
                }}
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
        `}</style>
      </section>
    )
  }

  // ── Empty state ─────────────────────────────────────────────────────────────
  if (slides.length === 0) {
    return (
      <div
        className="min-h-[70vh] flex items-center justify-center"
        style={{
          background: `linear-gradient(135deg, ${p.cream}, ${p.roseMist})`,
        }}
      >
        <div className="text-center p-10">
          <div
            className="inline-block w-16 h-16 rounded-full mb-6 flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${p.roseBlush}, ${p.peach})`,
              boxShadow: `0 10px 30px ${p.roseBlush}40`,
            }}
          >
            <span style={{ fontSize: '1.8rem' }}>✨</span>
          </div>
          <p
            className="text-2xl font-light mb-2"
            style={{
              fontFamily: 'Georgia, serif',
              fontStyle: 'italic',
              color: p.roseDeep,
            }}
          >
            Pronto nuevas colecciones
          </p>
          <p className="text-sm" style={{ color: p.textSoft }}>
            Estamos seleccionando piezas exclusivas para ti
          </p>
        </div>
      </div>
    )
  }

  const currentSlideData = slides[currentSlide]

  // ═══════════════════════════════════════════════════════════════════════════════
  //  RENDER PRINCIPAL
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
          FONDO — Capas editoriales
      ════════════════════════════════════════════════════════════════════════ */}
      <div className="absolute inset-0" style={{ background: p.cream }}>
        {/* Gradiente base */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${p.ivory} 0%, ${p.roseMist}40 35%, ${p.champagneLt}30 70%, ${p.cream} 100%)`,
          }}
        />

        {/* Blobs morphing */}
        <div
          className="absolute -top-40 -right-40 pointer-events-none"
          style={{
            transform: `translate(${mousePos.x * 30}px, ${mousePos.y * 30}px)`,
            transition: 'transform 0.6s ease-out',
          }}
        >
          <MorphingBlob
            gradientId="heroBlob1"
            colors={[p.roseBlush, p.champagne, p.peach]}
            size={700}
            opacity={0.4}
          />
        </div>

        <div
          className="absolute -bottom-40 -left-40 pointer-events-none"
          style={{
            transform: `translate(${mousePos.x * -20}px, ${mousePos.y * -20}px)`,
            transition: 'transform 0.6s ease-out',
          }}
        >
          <MorphingBlob
            gradientId="heroBlob2"
            colors={[p.peach, p.coralSoft, p.roseMist]}
            size={550}
            opacity={0.3}
          />
        </div>

        <div
          className="absolute top-1/2 left-1/2 pointer-events-none"
          style={{
            transform: `translate(-50%, -50%) translate(${mousePos.x * 10}px, ${mousePos.y * 10}px)`,
            transition: 'transform 0.6s ease-out',
          }}
        >
          <MorphingBlob
            gradientId="heroBlob3"
            colors={[p.goldLight, p.roseBlush, p.champagne]}
            size={400}
            opacity={0.25}
          />
        </div>

        {/* Textura de grano (film look) */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.035] mix-blend-multiply"
          style={{
            backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.5'/></svg>")`,
          }}
        />

        {/* Spotlight que sigue al mouse */}
        <div
          className="absolute inset-0 pointer-events-none transition-transform duration-500 ease-out"
          style={{
            background: `radial-gradient(ellipse 50% 50% at ${50 + mousePos.x * 25}% ${50 + mousePos.y * 25}%, ${p.roseBlush}25 0%, transparent 60%)`,
          }}
        />
      </div>

      {/* Pétalos flotantes */}
      {petals.map((petal, i) => (
        <Petal key={i} {...petal} />
      ))}

      {/* ════════════════════════════════════════════════════════════════════════
          IMAGEN DE FONDO DEL SLIDE
      ════════════════════════════════════════════════════════════════════════ */}
      <div className="absolute inset-0 pointer-events-none">
        {slides.map((slide, index) => (
          <div
            key={`${slide.id}-bg`}
            className="absolute inset-0 transition-all"
            style={{
              opacity: index === currentSlide ? 0.18 : 0,
              transform:
                index === currentSlide
                  ? `scale(1) translate(${mousePos.x * -12}px, ${mousePos.y * -12}px)`
                  : 'scale(1.08)',
              transitionDuration: `${TRANSITION_DURATION_MS}ms`,
              transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            aria-hidden
          >
            <img
              src={slide.image || FALLBACK_IMAGE}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
              style={{
                filter: 'brightness(1.05) saturate(1.1) blur(1px)',
                maskImage:
                  'linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,0.4) 40%, rgba(0,0,0,0.6) 100%)',
                WebkitMaskImage:
                  'linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,0.4) 40%, rgba(0,0,0,0.6) 100%)',
              }}
              loading={index === currentSlide ? 'eager' : 'lazy'}
            />
          </div>
        ))}

        {/* Overlay de gradiente */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(90deg, ${p.cream}E6 0%, ${p.cream}B3 40%, ${p.cream}40 70%, ${p.cream}80 100%)`,
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg, transparent 0%, ${p.cream}40 60%, ${p.cream}F2 100%)`,
          }}
        />
      </div>

      {/* ════════════════════════════════════════════════════════════════════════
          CONTENIDO PRINCIPAL
      ════════════════════════════════════════════════════════════════════════ */}
      <div className="relative z-10" style={{ minHeight: '92vh' }}>
        <div className="relative max-w-screen-2xl mx-auto px-6 lg:px-12 pt-20 pb-12 md:pt-28 md:pb-16">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center min-h-[72vh]">

            {/* ─── COLUMNA IZQUIERDA: Contenido editorial ─── */}
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
                        : 'translateY(30px) scale(0.98)',
                    position: index === currentSlide ? 'relative' : 'absolute',
                    pointerEvents: index === currentSlide ? 'auto' : 'none',
                    transitionDuration: `${TRANSITION_DURATION_MS}ms`,
                    transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                    top: 0,
                    left: 0,
                    right: 0,
                  }}
                  aria-hidden={index !== currentSlide}
                >
                  {/* Tag + línea decorativa */}
                  <div
                    className="flex items-center gap-4 mb-7"
                    style={{
                      opacity: animateIn && index === currentSlide ? 1 : 0,
                      transform:
                        animateIn && index === currentSlide
                          ? 'translateY(0)'
                          : 'translateY(20px)',
                      transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s',
                    }}
                  >
                    <span
                      className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full"
                      style={{
                        color: p.ivory,
                        background: `linear-gradient(135deg, ${p.roseVivid} 0%, ${p.coral} 100%)`,
                        boxShadow: `0 6px 24px ${p.roseVivid}50, 0 0 0 1px ${p.goldSoft}40`,
                        fontSize: '0.62rem',
                        letterSpacing: '0.28em',
                        textTransform: 'uppercase',
                        fontWeight: 600,
                        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
                      }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full animate-pulse"
                        style={{
                          background: p.ivory,
                          boxShadow: `0 0 8px ${p.ivory}`,
                        }}
                      />
                      {slide.tag}
                    </span>
                    <span
                      className="flex-1 h-px max-w-[100px]"
                      style={{
                        background: `linear-gradient(90deg, ${p.goldSoft}, transparent)`,
                      }}
                    />
                  </div>

                  {/* Título principal con Split Text */}
                  <h1
                    className="leading-[0.95] mb-6"
                    style={{
                      fontFamily: 'Georgia, "Times New Roman", serif',
                      fontSize: 'clamp(2.8rem, 6.5vw, 5.2rem)',
                      fontWeight: 400,
                      color: p.ink,
                      letterSpacing: '-0.025em',
                    }}
                  >
                    <SplitText
                      text={slide.title}
                      animate={animateIn && index === currentSlide}
                      delay={0.2}
                      style={{ display: 'inline' }}
                    />{' '}
                    <span
                      style={{
                        fontStyle: 'italic',
                        fontWeight: 300,
                        background: `linear-gradient(135deg, ${p.roseVivid} 0%, ${p.coral} 40%, ${p.gold} 100%)`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        backgroundSize: '300% 300%',
                        animation: 'heroGradientShift 8s ease infinite',
                      }}
                    >
                      <SplitText
                        text={slide.titleAccent}
                        animate={animateIn && index === currentSlide}
                        delay={0.5}
                        style={{ display: 'inline' }}
                      />
                    </span>
                  </h1>

                  {/* Subtítulo */}
                  <p
                    className="mb-5"
                    style={{
                      fontSize: '0.72rem',
                      letterSpacing: '0.35em',
                      textTransform: 'uppercase',
                      fontWeight: 600,
                      color: p.roseDeep,
                      fontFamily: 'ui-sans-serif, system-ui, sans-serif',
                      opacity: animateIn && index === currentSlide ? 1 : 0,
                      transform:
                        animateIn && index === currentSlide
                          ? 'translateY(0)'
                          : 'translateY(20px)',
                      transition:
                        'all 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.7s',
                    }}
                  >
                    — {slide.subtitle}
                  </p>

                  {/* Descripción */}
                  <p
                    className="max-w-lg mb-9 font-light"
                    style={{
                      color: p.textSoft,
                      fontSize: 'clamp(0.95rem, 1.05vw, 1.08rem)',
                      fontFamily: 'ui-sans-serif, system-ui, sans-serif',
                      lineHeight: 1.75,
                      opacity: animateIn && index === currentSlide ? 1 : 0,
                      transform:
                        animateIn && index === currentSlide
                          ? 'translateY(0)'
                          : 'translateY(20px)',
                      transition:
                        'all 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.85s',
                    }}
                  >
                    {slide.description}
                  </p>

                  {/* Precio con animación */}
                  <div
                    className="flex items-baseline gap-4 mb-10"
                    style={{
                      opacity: animateIn && index === currentSlide ? 1 : 0,
                      transform:
                        animateIn && index === currentSlide
                          ? 'translateY(0)'
                          : 'translateY(20px)',
                      transition:
                        'all 0.9s cubic-bezier(0.16, 1, 0.3, 1) 1s',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'Georgia, serif',
                        fontSize: '0.85rem',
                        fontStyle: 'italic',
                        color: p.textSoft,
                        letterSpacing: '0.1em',
                      }}
                    >
                      Desde
                    </span>
                    {slide.price ? (
                      <span
                        style={{
                          fontFamily: 'Georgia, serif',
                          fontSize: 'clamp(2.2rem, 3.5vw, 3rem)',
                          fontWeight: 400,
                          color: p.roseDeep,
                          letterSpacing: '-0.02em',
                          lineHeight: 1,
                        }}
                      >
                        S/ <AnimatedPrice value={slide.price} inView={animateIn && index === currentSlide} />
                      </span>
                    ) : (
                      <span
                        style={{
                          fontFamily: 'Georgia, serif',
                          fontSize: '1.4rem',
                          fontStyle: 'italic',
                          color: p.textSoft,
                        }}
                      >
                        Precio bajo consulta
                      </span>
                    )}
                  </div>

                  {/* CTAs magnéticos */}
                  <div
                    className="flex flex-wrap gap-4"
                    style={{
                      opacity: animateIn && index === currentSlide ? 1 : 0,
                      transform:
                        animateIn && index === currentSlide
                          ? 'translateY(0)'
                          : 'translateY(20px)',
                      transition:
                        'all 0.9s cubic-bezier(0.16, 1, 0.3, 1) 1.15s',
                    }}
                  >
                    <MagneticButton
                      onClick={() => handleComprarAhora(slide.category)}
                      variant="primary"
                      icon={<path d="M5 12h14M12 5l7 7-7 7" />}
                    >
                      Descubrir Colección
                    </MagneticButton>

                    <MagneticButton
                      onClick={handleVerTodo}
                      variant="secondary"
                      icon={<path d="M5 12h14M12 5l7 7-7 7" />}
                    >
                      Ver Todo
                    </MagneticButton>
                  </div>
                </div>
              ))}
            </div>

            {/* ─── COLUMNA DERECHA: Showcase editorial ─── */}
            <div className="hidden lg:flex lg:col-span-5 justify-center items-center relative" style={{ minHeight: '560px' }}>
              {/* Círculos decorativos giratorios */}
              <div
                className="absolute rounded-full"
                style={{
                  width: '440px',
                  height: '440px',
                  border: `1px dashed ${p.champagne}60`,
                  animation: 'heroSpinSlow 50s linear infinite',
                }}
              />
              <div
                className="absolute rounded-full"
                style={{
                  width: '380px',
                  height: '380px',
                  border: `1px dashed ${p.roseBlush}50`,
                  animation: 'heroSpinSlow 40s linear infinite reverse',
                }}
              />

              {/* Esquinas doradas decorativas */}
              {['top-4 left-4 border-t border-l', 'top-4 right-4 border-t border-r', 'bottom-4 left-4 border-b border-l', 'bottom-4 right-4 border-b border-r'].map((pos, i) => (
                <span
                  key={i}
                  className={`absolute w-8 h-8 ${pos} pointer-events-none`}
                  style={{
                    borderColor: p.goldSoft,
                    opacity: 0.5,
                    margin: '12px',
                  }}
                />
              ))}

              {/* Imagen principal con parallax 3D */}
              <div
                className="relative overflow-hidden"
                style={{
                  width: '340px',
                  height: '460px',
                  borderRadius: '8px',
                  border: `2px solid ${p.ivory}`,
                  boxShadow: `
                    0 30px 80px -10px ${p.roseBlush}50,
                    0 15px 40px -5px ${p.ink}15,
                    inset 0 0 60px ${p.roseMist}20
                  `,
                  transform: `perspective(1200px) rotateY(${mousePos.x * 10}deg) rotateX(${mousePos.y * -8}deg)`,
                  transition: 'transform 0.3s ease-out',
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
                        index === currentSlide ? 'scale(1)' : 'scale(1.08)',
                      transitionDuration: `${TRANSITION_DURATION_MS}ms`,
                      transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                      filter: 'brightness(1.02) saturate(1.05)',
                    }}
                    loading={index === currentSlide ? 'eager' : 'lazy'}
                  />
                ))}

                {/* Overlay inferior */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: `linear-gradient(180deg, transparent 50%, ${p.roseMist}30 100%)`,
                  }}
                />

                {/* Brillo barrido */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: 'linear-gradient(115deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)',
                    animation: 'heroImageShine 6s ease-in-out infinite',
                  }}
                />
              </div>

              {/* Badge "Importado desde EE.UU." */}
              <div
                className="absolute -bottom-2 -right-2 group cursor-default"
                style={{
                  background: `linear-gradient(135deg, ${p.ivory} 0%, ${p.champagneLt} 100%)`,
                  border: `1.5px solid ${p.goldSoft}`,
                  borderRadius: '6px',
                  padding: '1.1rem 1.5rem',
                  boxShadow: `0 16px 50px ${p.goldSoft}40, 0 4px 16px ${p.ink}10`,
                  transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-6px) scale(1.04)'
                  e.currentTarget.style.boxShadow = `0 24px 60px ${p.goldSoft}60, 0 0 0 1px ${p.gold}60`
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)'
                  e.currentTarget.style.boxShadow = `0 16px 50px ${p.goldSoft}40, 0 4px 16px ${p.ink}10`
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${p.gold}, ${p.goldSoft})`,
                      boxShadow: `0 4px 14px ${p.gold}50`,
                    }}
                  >
                    <span style={{ fontSize: '1.1rem' }}>✦</span>
                  </div>
                  <div>
                    <p
                      style={{
                        fontSize: '0.55rem',
                        letterSpacing: '0.3em',
                        textTransform: 'uppercase',
                        fontWeight: 600,
                        color: p.textSoft,
                        marginBottom: '2px',
                      }}
                    >
                      Importado desde
                    </p>
                    <p
                      style={{
                        fontFamily: 'Georgia, serif',
                        fontSize: '1.15rem',
                        fontWeight: 400,
                        fontStyle: 'italic',
                        color: p.roseDeep,
                        lineHeight: 1.1,
                      }}
                    >
                      EE.UU.
                    </p>
                  </div>
                </div>
              </div>

              {/* Badge "100% Original" */}
              <div
                className="absolute -top-2 -left-2"
                style={{
                  background: `linear-gradient(135deg, ${p.roseVivid}, ${p.coral})`,
                  color: p.ivory,
                  padding: '0.6rem 1.2rem',
                  borderRadius: '4px',
                  fontSize: '0.58rem',
                  letterSpacing: '0.25em',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  boxShadow: `0 10px 30px ${p.roseVivid}50`,
                  transform: 'rotate(-3deg)',
                }}
              >
                100% Original
              </div>

              {/* Círculos flotantes decorativos */}
              <div
                className="absolute -top-8 left-12"
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${p.roseBlush}70 0%, ${p.peach}50 100%)`,
                  boxShadow: `0 10px 30px ${p.roseBlush}40`,
                  animation: 'heroFloatGentle 7s ease-in-out infinite',
                }}
              />
              <div
                className="absolute top-24 -right-8"
                style={{
                  width: '35px',
                  height: '35px',
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${p.goldLight}80 0%, ${p.champagne}60 100%)`,
                  boxShadow: `0 8px 24px ${p.gold}40`,
                  animation: 'heroFloatGentle 6s ease-in-out infinite',
                  animationDelay: '2s',
                }}
              />
              <div
                className="absolute bottom-28 -left-6"
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${p.coralSoft}70 0%, ${p.roseBlush}50 100%)`,
                  boxShadow: `0 6px 20px ${p.coral}30`,
                  animation: 'heroFloatGentle 8s ease-in-out infinite',
                  animationDelay: '4s',
                }}
              />
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════════
            NAVEGACIÓN — Pills editoriales (desktop)
        ══════════════════════════════════════════════════════════════════════ */}
        <div
          className="absolute right-8 top-1/2 -translate-y-1/2 z-20 hidden md:flex flex-col gap-4"
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
              style={{ minHeight: '48px', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
            >
              <span
                className="transition-all duration-500 font-light"
                style={{
                  fontFamily: 'Georgia, serif',
                  fontSize: '0.85rem',
                  fontStyle: 'italic',
                  color: index === currentSlide ? p.roseDeep : 'transparent',
                  userSelect: 'none',
                  transform: index === currentSlide ? 'translateX(0)' : 'translateX(12px)',
                  opacity: index === currentSlide ? 1 : 0,
                }}
              >
                {slide.title.split(' ')[0]}
              </span>
              <div
                className="transition-all duration-700 rounded-full relative overflow-hidden"
                style={{
                  width: index === currentSlide ? '3px' : '2px',
                  height: index === currentSlide ? '44px' : '16px',
                  background:
                    index === currentSlide
                      ? `linear-gradient(180deg, ${p.roseVivid}, ${p.coral}, ${p.goldSoft})`
                      : `${p.roseBlush}50`,
                  boxShadow:
                    index === currentSlide ? `0 0 14px ${p.roseVivid}60` : 'none',
                }}
              >
                {index === currentSlide && (
                  <div
                    className="absolute inset-0"
                    style={{
                      background: 'linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)',
                      animation: 'heroShimmerVertical 2.5s ease-in-out infinite',
                    }}
                  />
                )}
              </div>
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════════════════════════════════════
            NAVEGACIÓN — Dots (mobile)
        ══════════════════════════════════════════════════════════════════════ */}
        <div
          className="absolute bottom-28 left-1/2 -translate-x-1/2 z-20 flex md:hidden gap-3 items-center"
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
                  width: index === currentSlide ? '32px' : '8px',
                  height: '8px',
                  borderRadius: index === currentSlide ? '12px' : '50%',
                  background:
                    index === currentSlide
                      ? `linear-gradient(90deg, ${p.roseVivid}, ${p.coral}, ${p.goldSoft})`
                      : `${p.roseBlush}60`,
                  boxShadow: index === currentSlide ? `0 0 14px ${p.roseVivid}50` : 'none',
                }}
              />
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════════════════════════════════════
            CONTADOR EDITORIAL — "01 / 03"
        ══════════════════════════════════════════════════════════════════════ */}
        <div
          aria-hidden
          className="absolute bottom-10 left-8 lg:left-12 z-20 hidden md:flex items-end gap-4"
        >
          <span
            style={{
              fontFamily: 'Georgia, serif',
              fontSize: 'clamp(3rem, 6vw, 4.5rem)',
              fontWeight: 300,
              fontStyle: 'italic',
              color: p.roseDeep,
              lineHeight: 1,
              letterSpacing: '-0.04em',
              userSelect: 'none',
              transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {String(currentSlide + 1).padStart(2, '0')}
          </span>
          <div className="flex flex-col pb-2">
            <span
              className="h-px w-8 mb-2"
              style={{ background: `linear-gradient(90deg, ${p.goldSoft}, transparent)` }}
            />
            <span
              style={{
                fontFamily: 'ui-sans-serif, system-ui, sans-serif',
                fontSize: '0.65rem',
                letterSpacing: '0.25em',
                color: p.textSoft,
                textTransform: 'uppercase',
              }}
            >
              / {String(slides.length).padStart(2, '0')}
            </span>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════════
            BARRA DE PROGRESO
        ══════════════════════════════════════════════════════════════════════ */}
        <div
          aria-hidden
          className="absolute bottom-0 left-0 right-0 z-20 overflow-hidden"
          style={{ height: '3px', background: `${p.roseBlush}20` }}
        >
          <div
            key={`progress-${currentSlide}`}
            style={{
              height: '100%',
              background: `linear-gradient(90deg, ${p.roseVivid} 0%, ${p.coral} 40%, ${p.goldSoft} 75%, ${p.roseVivid} 100%)`,
              animation: `heroProgressAdvance ${SLIDE_DURATION_MS}ms linear forwards`,
              boxShadow: `0 0 12px ${p.roseVivid}60`,
            }}
          />
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          TRUST BAR
      ══════════════════════════════════════════════════════════════════════ */}
      <div
        style={{
          background: `linear-gradient(180deg, ${p.cream} 0%, ${p.ivory} 100%)`,
          borderTop: `1px solid ${p.champagne}50`,
          position: 'relative',
          zIndex: 20,
        }}
      >
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 py-7">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {trustItems.map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-4 group cursor-default"
              >
                <div
                  className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-6"
                  style={{
                    background: `linear-gradient(135deg, ${p.roseMist} 0%, ${p.champagneLt} 100%)`,
                    border: `1px solid ${p.champagne}80`,
                    boxShadow: `0 4px 16px ${p.roseBlush}20`,
                  }}
                >
                  <svg
                    className="w-5 h-5 transition-all duration-500 group-hover:scale-110"
                    fill="none"
                    stroke={p.roseDeep}
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    viewBox="0 0 24 24"
                  >
                    <path d={item.path} />
                  </svg>
                </div>
                <div>
                  <span
                    className="block text-[0.68rem] tracking-[0.18em] uppercase font-semibold"
                    style={{
                      fontFamily: 'ui-sans-serif, system-ui, sans-serif',
                      color: p.textMain,
                      letterSpacing: '0.18em',
                    }}
                  >
                    {item.label}
                  </span>
                  <span
                    className="block text-[0.58rem] tracking-[0.1em] font-light mt-0.5"
                    style={{
                      fontFamily: 'ui-sans-serif, system-ui, sans-serif',
                      color: p.textSoft,
                      letterSpacing: '0.1em',
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

      {/* ══════════════════════════════════════════════════════════════════════
          KEYFRAMES
      ══════════════════════════════════════════════════════════════════════ */}
      <style>{`
        @keyframes heroProgressAdvance {
          from { width: 0%; }
          to { width: 100%; }
        }

        @keyframes heroGradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes heroSpinSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes heroFloatGentle {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-14px) rotate(4deg); }
          66% { transform: translateY(-7px) rotate(-3deg); }
        }

        @keyframes heroShimmerVertical {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }

        @keyframes heroImageShine {
          0%, 100% { transform: translateX(-100%) skewX(-15deg); }
          50% { transform: translateX(200%) skewX(-15deg); }
        }

        @keyframes heroPetalFall {
          0% { transform: translateY(0) rotate(0deg) scale(1); opacity: 0.3; }
          25% { transform: translateY(25vh) rotate(90deg) scale(0.9); opacity: 0.35; }
          50% { transform: translateY(50vh) rotate(180deg) scale(0.8); opacity: 0.25; }
          75% { transform: translateY(75vh) rotate(270deg) scale(0.7); opacity: 0.15; }
          100% { transform: translateY(110vh) rotate(360deg) scale(0.5); opacity: 0; }
        }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </section>
  )
}

export default HeroSection