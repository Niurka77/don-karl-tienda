import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

// ─── Constants ──────────────────────────────────────────────────────────────
const SLIDE_DURATION_MS = 5000
const TRANSITION_DURATION_MS = 800
const HERO_HEIGHT = '80vh' // Ligeramente más alto para más presencia

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1600&h=900&fit=crop&q=85'

// ─── Paleta Ethereal Editorial – versión vibrante ──────────────────────────
const palette = {
  obsidian: '#1A1118',      // Fondo principal
  obsidianDeep: '#120B10',  // Fondo más profundo para overlays
  blush: '#D4788A',         // Rosa principal – acentos, botones, líneas
  rose: '#B85268',          // Rosa profundo – hover, gradientes
  petal: '#F2C4CE',         // Rosa suave – textos secundarios, fondos sutiles
  ivory: '#FFF8F5',         // Blanco cálido – textos principales
  gold: '#C9A84C',          // Dorado – toques de lujo (estrellas, badges)
  goldLight: '#E8D08A',     // Dorado claro – gradientes
  softGlow: 'rgba(212,120,138,0.15)',
  roseGlow: 'rgba(184,82,104,0.25)',
}

// ─── Trust items ────────────────────────────────────────────────────────────
const trustItems = [
  {
    label: '100% Original',
    icon: (
      <path
        fillRule="evenodd"
        d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3l.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
        clipRule="evenodd"
      />
    ),
  },
  {
    label: 'Envío Rápido',
    icon: (
      <>
        <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
        <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1v-5h2v5a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H17a1 1 0 001-1V5a1 1 0 00-1-1H3z" />
      </>
    ),
  },
  {
    label: 'Pago Seguro',
    icon: (
      <path
        fillRule="evenodd"
        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
        clipRule="evenodd"
      />
    ),
  },
  {
    label: 'Atención 24/7',
    icon: (
      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
    ),
  },
]

// ─── Helper: truncar texto ──────────────────────────────────────────────────
const truncateText = (text, maxLength = 85) => {
  if (!text) return ''
  return text.length > maxLength ? text.slice(0, maxLength) + '...' : text
}

// ─── Main Component ──────────────────────────────────────────────────────────
const HeroSection = () => {
  const [slides, setSlides] = useState([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [loading, setLoading] = useState(true)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const timerRef = useRef(null)
  const sectionRef = useRef(null)
  const navigate = useNavigate()

  // ── Data fetch ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const { data, error } = await supabase
          .from('hero_slides')
          .select(
            `*, products(name, description, category, gender, brand, images_urls, image_url)`
          )
          .eq('active', true)
          .order('sort_order', { ascending: true })

        if (error) throw error

        const processedSlides = data.map((slide) => {
          const product = slide.products
          const images =
            product?.images_urls?.length > 0
              ? product.images_urls
              : product?.image_url
              ? [product.image_url]
              : []

          const rawDescription =
            slide.description_override || product?.description || ''
          const truncatedDescription = truncateText(rawDescription, 85)

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
            }
          }

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
          }
        })

        setSlides(processedSlides)
      } catch (error) {
        console.error('Error fetching slides:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSlides()
  }, [])

  // ── Precarga de imágenes ──────────────────────────────────────────────────
  useEffect(() => {
    if (slides.length === 0) return
    slides.forEach((slide) => {
      if (slide.image && slide.image !== FALLBACK_IMAGE) {
        const img = new Image()
        img.src = slide.image
      }
    })
  }, [slides])

  // ── Mouse tracking for parallax ───────────────────────────────────────────
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

  // ── Autoplay ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (slides.length < 2) return
    timerRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, SLIDE_DURATION_MS)

    return () => clearInterval(timerRef.current)
  }, [slides.length])

  const goToSlide = useCallback(
    (index) => {
      if (isTransitioning || index === currentSlide) return
      clearInterval(timerRef.current)
      setIsTransitioning(true)
      setCurrentSlide(index)
      setTimeout(() => setIsTransitioning(false), TRANSITION_DURATION_MS)

      if (slides.length > 1) {
        timerRef.current = setInterval(() => {
          setCurrentSlide((prev) => (prev + 1) % slides.length)
        }, SLIDE_DURATION_MS)
      }
    },
    [isTransitioning, currentSlide, slides.length]
  )

  // ── Keyboard navigation ──────────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e) => {
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

  // ── Skeleton con shimmer cinematográfico ──────────────────────────────────
  if (loading) {
    return (
      <section
        className="relative overflow-hidden"
        style={{
          height: HERO_HEIGHT,
          background: `linear-gradient(135deg, ${palette.obsidianDeep} 0%, ${palette.obsidian} 100%)`,
        }}
      >
        <div className="absolute inset-0">
          <div
            className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl animate-shimmer-slow"
            style={{
              background: `radial-gradient(circle, ${palette.blush}22 0%, transparent 70%)`,
            }}
          />
          <div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl animate-shimmer-slow"
            style={{
              background: `radial-gradient(circle, ${palette.gold}18 0%, transparent 70%)`,
              animationDelay: '1.5s',
            }}
          />
        </div>

        <div className="relative z-10 max-w-screen-2xl mx-auto px-6 lg:px-12 h-full flex items-center">
          <div className="w-full max-w-2xl">
            <div
              className="h-3 w-20 rounded-sm mb-6 animate-shimmer-line"
              style={{
                background: `linear-gradient(90deg, ${palette.blush}15 0%, ${palette.petal}25 50%, ${palette.blush}15 100%)`,
                backgroundSize: '200% 100%',
              }}
            />
            <div className="space-y-3 mb-6">
              <div
                className="h-10 w-full rounded-sm animate-shimmer-line"
                style={{
                  background: `linear-gradient(90deg, ${palette.obsidianDeep} 0%, ${palette.blush}12 50%, ${palette.obsidianDeep} 100%)`,
                  backgroundSize: '200% 100%',
                }}
              />
              <div
                className="h-10 w-3/4 rounded-sm animate-shimmer-line"
                style={{
                  background: `linear-gradient(90deg, ${palette.obsidianDeep} 0%, ${palette.gold}15 50%, ${palette.obsidianDeep} 100%)`,
                  backgroundSize: '200% 100%',
                  animationDelay: '0.2s',
                }}
              />
            </div>
            <div
              className="h-2 w-32 rounded-sm mb-4 animate-shimmer-line"
              style={{
                background: `linear-gradient(90deg, ${palette.blush}10 0%, ${palette.petal}20 50%, ${palette.blush}10 100%)`,
                backgroundSize: '200% 100%',
                animationDelay: '0.4s',
              }}
            />
            <div className="space-y-2 mb-8">
              <div
                className="h-2 w-full rounded-sm animate-shimmer-line"
                style={{
                  background: `linear-gradient(90deg, ${palette.obsidianDeep} 0%, ${palette.blush}08 50%, ${palette.obsidianDeep} 100%)`,
                  backgroundSize: '200% 100%',
                  animationDelay: '0.6s',
                }}
              />
              <div
                className="h-2 w-5/6 rounded-sm animate-shimmer-line"
                style={{
                  background: `linear-gradient(90deg, ${palette.obsidianDeep} 0%, ${palette.petal}10 50%, ${palette.obsidianDeep} 100%)`,
                  backgroundSize: '200% 100%',
                  animationDelay: '0.8s',
                }}
              />
            </div>
            <div className="flex gap-3">
              <div
                className="h-12 w-44 rounded-sm animate-shimmer-line"
                style={{
                  background: `linear-gradient(90deg, ${palette.blush}20 0%, ${palette.gold}25 50%, ${palette.blush}20 100%)`,
                  backgroundSize: '200% 100%',
                  animationDelay: '1s',
                }}
              />
              <div
                className="h-12 w-24 rounded-sm animate-shimmer-line"
                style={{
                  background: `linear-gradient(90deg, ${palette.blush}10 0%, ${palette.petal}15 50%, ${palette.blush}10 100%)`,
                  backgroundSize: '200% 100%',
                  animationDelay: '1.2s',
                }}
              />
            </div>
          </div>
        </div>

        <style>{`
          @keyframes shimmer-line {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
          @keyframes shimmer-slow {
            0%, 100% { opacity: 0.3; transform: scale(1); }
            50% { opacity: 0.5; transform: scale(1.1); }
          }
          .animate-shimmer-line {
            animation: shimmer-line 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          }
          .animate-shimmer-slow {
            animation: shimmer-slow 4s ease-in-out infinite;
          }
        `}</style>
      </section>
    )
  }

  if (slides.length === 0) return null

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden"
      tabIndex={0}
      role="region"
      aria-label="Carrusel de productos destacados"
      style={{ background: palette.obsidianDeep, outline: 'none' }}
    >
      {/* ── Ambient background effects ── */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-0 left-0 w-full h-full opacity-40"
          style={{
            background: `radial-gradient(ellipse 80% 50% at 20% 40%, ${palette.blush}18 0%, transparent 50%)`,
            transform: `translate(${mousePosition.x * 20}px, ${mousePosition.y * 20}px)`,
            transition: 'transform 0.3s ease-out',
          }}
        />
        <div
          className="absolute top-0 left-0 w-full h-full opacity-30"
          style={{
            background: `radial-gradient(ellipse 60% 60% at 80% 60%, ${palette.gold}15 0%, transparent 50%)`,
            transform: `translate(${mousePosition.x * -15}px, ${mousePosition.y * -15}px)`,
            transition: 'transform 0.3s ease-out',
          }}
        />
      </div>

      <div className="relative flex items-center" style={{ height: HERO_HEIGHT }}>
        {/* ── Background images with cinematic effect ── */}
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className="absolute inset-0 transition-all"
            style={{
              opacity: index === currentSlide ? 1 : 0,
              transform:
                index === currentSlide
                  ? `scale(${1 + mousePosition.x * 0.02}) translate(${mousePosition.x * -10}px, ${mousePosition.y * -10}px)`
                  : 'scale(1.05)',
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
                filter:
                  'brightness(0.35) saturate(0.9) contrast(1.1) hue-rotate(-5deg)',
              }}
              loading="eager"
            />

            {/* Cinematic gradient overlays - con más calidez */}
            <div
              className="absolute inset-0"
              style={{
                background: `
                  linear-gradient(135deg, 
                    ${palette.obsidianDeep}FA 0%, 
                    ${palette.obsidianDeep}D9 25%, 
                    ${palette.obsidianDeep}99 50%, 
                    ${palette.obsidianDeep}4D 75%, 
                    transparent 100%
                  )
                `,
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background: `
                  radial-gradient(ellipse 100% 80% at 50% 100%, 
                    ${palette.obsidianDeep}E6 0%, 
                    transparent 60%
                  )
                `,
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background: `
                  radial-gradient(circle at 70% 30%, 
                    ${palette.blush}12 0%, 
                    ${palette.gold}08 40%, 
                    transparent 60%
                  )
                `,
              }}
            />

            {/* Animated grain texture */}
            <div
              className="absolute inset-0 opacity-[0.015] mix-blend-overlay"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
              }}
            />
          </div>
        ))}

        {/* ── Content ── */}
        <div className="relative z-10 max-w-screen-2xl mx-auto px-6 lg:px-12 w-full py-8 md:py-12">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left: text content */}
            <div className="lg:col-span-7">
              {slides.map((slide, index) => (
                <div
                  key={slide.id}
                  className="transition-all"
                  style={{
                    opacity: index === currentSlide ? 1 : 0,
                    transform:
                      index === currentSlide
                        ? 'translateY(0) scale(1)'
                        : 'translateY(40px) scale(0.98)',
                    position: index === currentSlide ? 'relative' : 'absolute',
                    pointerEvents: index === currentSlide ? 'auto' : 'none',
                    transitionDuration: `${TRANSITION_DURATION_MS}ms`,
                    transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                  aria-hidden={index !== currentSlide}
                >
                  {/* Tag with animated line - más vibrante */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="relative">
                      <span
                        className="inline-block px-4 py-1.5 rounded-sm text-[0.65rem] tracking-[0.3em] uppercase font-medium"
                        style={{
                          color: palette.ivory,
                          background: `linear-gradient(135deg, ${palette.blush}33 0%, ${palette.gold}22 100%)`,
                          border: `1px solid ${palette.blush}44`,
                          backdropFilter: 'blur(10px)',
                          WebkitBackdropFilter: 'blur(10px)',
                          fontFamily: 'var(--font-sans, system-ui)',
                        }}
                      >
                        {slide.tag}
                      </span>
                      <div
                        className="absolute -top-1 -right-1 w-2 h-2 rounded-full animate-pulse"
                        style={{
                          background: `linear-gradient(135deg, ${palette.blush}, ${palette.gold})`,
                          boxShadow: `0 0 12px ${palette.blush}AA`,
                        }}
                      />
                    </div>
                    <div
                      className="flex-1 h-px max-w-[60px]"
                      style={{
                        background: `linear-gradient(90deg, ${palette.blush}88 0%, ${palette.gold}44 50%, transparent 100%)`,
                      }}
                    />
                  </div>

                  {/* Headline - Ethereal Editorial typography + gradiente vivo */}
                  <h1
                    className="leading-[0.88] mb-6"
                    style={{
                      fontFamily: "'Cormorant Garamond', 'EB Garamond', Georgia, serif",
                      fontSize: 'clamp(2.8rem, 7vw, 6rem)',
                      fontWeight: 300,
                      color: palette.ivory,
                      letterSpacing: '-0.01em',
                      textShadow: '0 4px 24px rgba(0,0,0,0.3)',
                    }}
                  >
                    {slide.title}{' '}
                    <span
                      className="inline-block"
                      style={{
                        fontStyle: 'italic',
                        fontWeight: 300,
                        background: `linear-gradient(135deg, ${palette.blush} 0%, ${palette.rose} 40%, ${palette.gold} 80%, ${palette.blush} 100%)`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        backgroundSize: '300% 300%',
                        animation: 'gradientShift 8s ease infinite',
                        filter: `drop-shadow(0 2px 16px ${palette.blush}66)`,
                      }}
                    >
                      {slide.titleAccent}
                    </span>
                  </h1>

                  {/* Subtitle */}
                  <p
                    className="text-[0.7rem] tracking-[0.35em] uppercase mb-4 font-medium"
                    style={{
                      color: `${palette.petal}CC`,
                      fontFamily: 'var(--font-sans, system-ui)',
                    }}
                  >
                    {slide.subtitle}
                  </p>

                  {/* Description - truncada via JS */}
                  <p
                    className="leading-relaxed max-w-lg mb-8"
                    style={{
                      color: `${palette.ivory}B3`,
                      fontSize: 'clamp(0.9rem, 1vw, 1.05rem)',
                      fontWeight: 300,
                      fontFamily: 'var(--font-sans, system-ui)',
                      lineHeight: 1.7,
                    }}
                  >
                    {slide.description}
                  </p>

                  {/* CTAs - premium y vibrantes */}
                  <div className="flex flex-wrap gap-4">
                    <button
                      onClick={() => handleComprarAhora(slide.category)}
                      className="group relative overflow-hidden transition-all duration-500"
                      style={{
                        fontFamily: 'var(--font-sans, system-ui)',
                        fontSize: 'clamp(0.7rem, 0.75vw, 0.8rem)',
                        fontWeight: 600,
                        letterSpacing: '0.25em',
                        textTransform: 'uppercase',
                        color: palette.ivory,
                        background: palette.obsidian,
                        padding: '1rem 2.5rem',
                        border: `1px solid ${palette.blush}60`,
                        borderRadius: '2px',
                        cursor: 'pointer',
                        minHeight: '52px',
                        boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px ${palette.blush}20`,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform =
                          'translateY(-3px) scale(1.02)'
                        e.currentTarget.style.boxShadow = `0 16px 48px ${palette.blush}88, 0 4px 16px rgba(0,0,0,0.4)`
                        e.currentTarget.style.background = `linear-gradient(135deg, ${palette.blush} 0%, ${palette.rose} 50%, ${palette.gold} 100%)`
                        e.currentTarget.style.borderColor = palette.gold
                        e.currentTarget.style.color = palette.ivory
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)'
                        e.currentTarget.style.boxShadow = `0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px ${palette.blush}20`
                        e.currentTarget.style.background = palette.obsidian
                        e.currentTarget.style.borderColor = `${palette.blush}60`
                        e.currentTarget.style.color = palette.ivory
                      }}
                    >
                      <span className="relative z-10">Descubrir Colección</span>
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                        style={{
                          background:
                            'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 100%)',
                        }}
                      />
                    </button>

                    <button
                      onClick={handleVerTodo}
                      className="group relative transition-all duration-500"
                      style={{
                        fontFamily: 'var(--font-sans, system-ui)',
                        fontSize: 'clamp(0.65rem, 0.7vw, 0.75rem)',
                        fontWeight: 500,
                        letterSpacing: '0.3em',
                        textTransform: 'uppercase',
                        color: `${palette.petal}CC`,
                        background: 'none',
                        border: 'none',
                        borderBottom: `2px solid ${palette.blush}66`,
                        padding: '0.5rem 0',
                        cursor: 'pointer',
                        minHeight: '52px',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = palette.gold
                        e.currentTarget.style.borderBottomColor = palette.gold
                        e.currentTarget.style.transform = 'translateX(6px) scale(1.02)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = `${palette.petal}CC`
                        e.currentTarget.style.borderBottomColor = `${palette.blush}66`
                        e.currentTarget.style.transform = 'translateX(0) scale(1)'
                      }}
                    >
                      Ver Todo →
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Right: portrait panel - desktop only */}
            <div className="hidden lg:flex lg:col-span-5 justify-center items-center relative">
              {/* Animated rings - más brillo */}
              <div
                className="absolute rounded-full animate-spin-slow"
                style={{
                  width: '420px',
                  height: '420px',
                  border: `1px solid ${palette.blush}22`,
                  animationDuration: '30s',
                }}
              />
              <div
                className="absolute rounded-full animate-spin-slow"
                style={{
                  width: '360px',
                  height: '360px',
                  border: `1px solid ${palette.gold}22`,
                  animationDuration: '25s',
                  animationDirection: 'reverse',
                }}
              />
              <div
                className="absolute rounded-full animate-spin-slow"
                style={{
                  width: '300px',
                  height: '300px',
                  border: `1px solid ${palette.blush}33`,
                  animationDuration: '20s',
                }}
              />

              {/* Glow effect - más intenso */}
              <div
                className="absolute rounded-full blur-3xl"
                style={{
                  width: '280px',
                  height: '280px',
                  background: `radial-gradient(circle, ${palette.blush}44 0%, ${palette.gold}22 40%, transparent 70%)`,
                  animation: 'pulse 4s ease-in-out infinite',
                }}
              />

              {/* Main portrait container */}
              <div
                className="relative overflow-hidden rounded-full"
                style={{
                  width: '280px',
                  height: '280px',
                  border: `2px solid ${palette.blush}55`,
                  boxShadow: `
                    0 0 80px ${palette.blush}55,
                    0 32px 80px rgba(0,0,0,0.5),
                    inset 0 0 40px ${palette.blush}15
                  `,
                  transform: `rotate(${mousePosition.x * 5}deg)`,
                  transition: 'transform 0.3s ease-out',
                }}
              >
                {slides.map((slide, index) => (
                  <img
                    key={slide.id}
                    src={slide.image || FALLBACK_IMAGE}
                    alt={slide.title}
                    className="absolute inset-0 w-full h-full object-cover transition-all"
                    style={{
                      opacity: index === currentSlide ? 1 : 0,
                      transform:
                        index === currentSlide ? 'scale(1.1)' : 'scale(1)',
                      transitionDuration: `${TRANSITION_DURATION_MS}ms`,
                      transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                    loading="eager"
                  />
                ))}

                {/* Inner gradient overlay - toque dorado */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: `radial-gradient(circle at 30% 30%, ${palette.blush}22 0%, ${palette.gold}11 40%, transparent 70%)`,
                  }}
                />
              </div>

              {/* Floating badge - más glamour */}
              <div
                className="absolute bottom-8 right-8 group"
                style={{
                  background: `${palette.obsidianDeep}E6`,
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: `1px solid ${palette.blush}55`,
                  borderRadius: '2px',
                  padding: '0.8rem 1.2rem',
                  boxShadow: `0 12px 48px rgba(0,0,0,0.4), 0 0 24px ${palette.blush}33`,
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px) scale(1.05)'
                  e.currentTarget.style.borderColor = palette.gold
                  e.currentTarget.style.boxShadow = `0 16px 56px rgba(0,0,0,0.4), 0 0 40px ${palette.gold}44`
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)'
                  e.currentTarget.style.borderColor = `${palette.blush}55`
                  e.currentTarget.style.boxShadow = `0 12px 48px rgba(0,0,0,0.4), 0 0 24px ${palette.blush}33`
                }}
              >
                <p
                  className="text-[0.5rem] tracking-[0.3em] uppercase mb-1"
                  style={{
                    color: `${palette.blush}CC`,
                    fontFamily: 'var(--font-sans, system-ui)',
                  }}
                >
                  Importado desde
                </p>
                <p
                  style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontSize: '1.3rem',
                    fontWeight: 300,
                    fontStyle: 'italic',
                    color: palette.ivory,
                    lineHeight: 1,
                    letterSpacing: '-0.02em',
                    background: `linear-gradient(135deg, ${palette.ivory} 0%, ${palette.gold} 100%)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  EE.UU.
                </p>
              </div>

              {/* Decorative dots - más brillo */}
              <div
                className="absolute top-12 left-12 w-2 h-2 rounded-full"
                style={{
                  background: `linear-gradient(135deg, ${palette.blush}, ${palette.gold})`,
                  boxShadow: `0 0 16px ${palette.blush}AA`,
                  animation: 'float 6s ease-in-out infinite',
                }}
              />
              <div
                className="absolute bottom-16 left-16 w-1.5 h-1.5 rounded-full"
                style={{
                  background: palette.gold,
                  boxShadow: `0 0 12px ${palette.gold}AA`,
                  animation: 'float 5s ease-in-out infinite',
                  animationDelay: '1s',
                }}
              />
            </div>
          </div>
        </div>

        {/* ── Navigation pills - Right side ── */}
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
                className="transition-all duration-500"
                style={{
                  fontFamily: 'var(--font-sans, system-ui)',
                  fontSize: '0.6rem',
                  letterSpacing: '0.15em',
                  fontWeight: 500,
                  color:
                    index === currentSlide
                      ? `${palette.petal}DD`
                      : 'transparent',
                  userSelect: 'none',
                  transform:
                    index === currentSlide
                      ? 'translateX(0)'
                      : 'translateX(10px)',
                }}
              >
                {String(index + 1).padStart(2, '0')}
              </span>
              <div
                className="transition-all duration-700 rounded-full relative overflow-hidden"
                style={{
                  width: index === currentSlide ? '4px' : '3px',
                  height: index === currentSlide ? '40px' : '16px',
                  background:
                    index === currentSlide
                      ? `linear-gradient(180deg, ${palette.blush}, ${palette.gold})`
                      : `${palette.ivory}33`,
                  boxShadow:
                    index === currentSlide
                      ? `0 0 20px ${palette.blush}AA`
                      : 'none',
                }}
              >
                {index === currentSlide && (
                  <div
                    className="absolute inset-0 animate-shimmer"
                    style={{
                      background:
                        'linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
                    }}
                  />
                )}
              </div>
            </button>
          ))}
        </div>

        {/* ── Mobile dots ── */}
        <div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex md:hidden gap-2 items-center"
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
                padding: '8px 4px',
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
                  width: index === currentSlide ? '24px' : '6px',
                  height: '4px',
                  background:
                    index === currentSlide
                      ? `linear-gradient(90deg, ${palette.blush}, ${palette.gold})`
                      : `${palette.ivory}40`,
                  boxShadow:
                    index === currentSlide
                      ? `0 0 16px ${palette.blush}AA`
                      : 'none',
                }}
              />
            </button>
          ))}
        </div>

        {/* ── Ghost index ── */}
        <div
          aria-hidden
          className="absolute bottom-8 left-8 lg:left-12 z-20 hidden md:flex items-end gap-4"
        >
          <span
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 'clamp(3rem, 8vw, 5rem)',
              fontWeight: 300,
              fontStyle: 'italic',
              color: `${palette.ivory}0A`,
              lineHeight: 1,
              letterSpacing: '-0.05em',
              userSelect: 'none',
              textShadow: `0 0 40px ${palette.blush}15`,
            }}
          >
            {String(currentSlide + 1).padStart(2, '0')}
          </span>
        </div>

        {/* ── Progress bar ── */}
        <div
          aria-hidden
          className="absolute bottom-0 left-0 right-0 z-20 overflow-hidden"
          style={{
            height: '3px',
            background: `${palette.blush}22`,
          }}
        >
          <div
            key={`progress-${currentSlide}`}
            style={{
              height: '100%',
              background: `linear-gradient(90deg, ${palette.blush} 0%, ${palette.rose} 40%, ${palette.gold} 70%, ${palette.blush} 100%)`,
              animation: `progressAdvance ${SLIDE_DURATION_MS}ms cubic-bezier(0.4, 0, 0.2, 1) forwards`,
              boxShadow: `0 0 20px ${palette.blush}AA`,
            }}
          />
        </div>
      </div>

      {/* ── Trust bar ── */}
      <div
        style={{
          background: `linear-gradient(180deg, ${palette.obsidianDeep}F2 0%, ${palette.obsidianDeep} 100%)`,
          borderTop: `1px solid ${palette.blush}22`,
          padding: '0.8rem 0',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {trustItems.map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-3 group cursor-default"
              >
                <div
                  className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-6"
                  style={{
                    background: `linear-gradient(135deg, ${palette.blush}22 0%, ${palette.gold}18 100%)`,
                    border: `1px solid ${palette.blush}44`,
                    boxShadow: `0 4px 16px rgba(0,0,0,0.2), 0 0 12px ${palette.blush}22`,
                  }}
                >
                  <svg
                    className="w-4 h-4 transition-transform duration-500 group-hover:scale-110"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    style={{
                      color: palette.blush,
                      filter: `drop-shadow(0 0 8px ${palette.blush}88)`,
                    }}
                  >
                    {item.icon}
                  </svg>
                </div>
                <span
                  className="text-[0.6rem] tracking-[0.2em] uppercase transition-all duration-500 font-medium"
                  style={{
                    fontFamily: 'var(--font-sans, system-ui)',
                    color: `${palette.petal}99`,
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = `${palette.petal}FF`)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = `${palette.petal}99`)
                  }
                >
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes progressAdvance {
          from { width: 0%; }
          to { width: 100%; }
        }

        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-20px) translateX(10px); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.1); }
        }

        @keyframes shimmer {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }

        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .animate-spin-slow {
          animation: spin-slow linear infinite;
        }

        .animate-shimmer {
          animation: shimmer 2s ease-in-out infinite;
        }
      `}</style>
    </section>
  )
}

export default HeroSection