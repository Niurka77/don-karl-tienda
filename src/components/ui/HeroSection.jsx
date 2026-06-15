import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

// ─── Constants ────────────────────────────────────────────────────────────────

const SLIDE_DURATION_MS = 6500
const TRANSITION_DURATION_MS = 1100
const HERO_MIN_HEIGHT = 'min(96vh, 900px)'

// ─── Data transformation ──────────────────────────────────────────────────────
// Pure function: maps raw Supabase row → normalized slide shape.
// Keeping this outside the component makes it testable and readable.

const normalizeSlide = (row) => {
  const product = row.products
  const productImages = product?.images_urls?.length > 0
    ? product.images_urls
    : product?.image_url
      ? [product.image_url]
      : []

  const fallbackImage = 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&h=900&fit=crop&q=90'

  if (!product) {
    return {
      id: row.id,
      tag: row.tag_override || 'Colección',
      title: row.title_override || 'Nueva',
      titleAccent: row.title_accent_override || 'Colección',
      subtitle: row.subtitle_override || 'Exclusiva',
      description: row.description_override || 'Descubre nuestra selección importada',
      image: row.image_override || fallbackImage,
      category: 'todos',
    }
  }

  return {
    id: row.id,
    tag: row.tag_override || product.brand || 'Nuevo',
    title: row.title_override || product.name?.split(' ')[0] || 'Nueva',
    titleAccent: row.title_accent_override || product.name?.split(' ').slice(1).join(' ') || 'Colección',
    subtitle: row.subtitle_override || product.brand || 'Importado desde EE.UU.',
    description: row.description_override || product.description || 'Diseño y elegancia en cada detalle',
    image: row.image_override || productImages[0] || fallbackImage,
    category: product.category || 'todos',
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

// Skeleton loader that preserves the hero's exact layout during data fetch.
// No spinner — a pulsing full-bleed surface is more cinematic and less disruptive.
const HeroSkeleton = () => (
  <section
    aria-busy="true"
    aria-label="Cargando hero"
    style={{
      position: 'relative',
      minHeight: HERO_MIN_HEIGHT,
      background: 'var(--color-kb-obsidian)',
      overflow: 'hidden',
    }}
  >
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(110deg, #1A1118 25%, #2D2030 50%, #1A1118 75%)',
        backgroundSize: '200% 100%',
        animation: 'heroPulse 2.2s ease-in-out infinite',
      }}
    />
    <style>{`
      @keyframes heroPulse {
        0%   { background-position: 200% center; }
        100% { background-position: -200% center; }
      }
    `}</style>
  </section>
)

// Slide background layer — full-bleed photograph with cinematic overlay system.
// Three distinct overlay passes create depth that a single gradient cannot:
//   1. Density layer: heavy darkening preserves text legibility at all times
//   2. Directional layer: left-to-right fade creates asymmetric composition space
//   3. Brand accent: radial rose glow on the right softens the photograph edge
const SlideBackground = ({ slide, isActive }) => (
  <div
    aria-hidden
    style={{
      position: 'absolute',
      inset: 0,
      opacity: isActive ? 1 : 0,
      transition: `opacity ${TRANSITION_DURATION_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`,
      zIndex: 0,
    }}
  >
    {/* Photograph */}
    <img
      src={slide.image}
      alt=""
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        objectPosition: 'center 20%',
        filter: 'brightness(0.45) saturate(0.75)',
        transform: isActive ? 'scale(1.04)' : 'scale(1)',
        transition: `transform ${TRANSITION_DURATION_MS * 3}ms cubic-bezier(0.16, 1, 0.3, 1)`,
        willChange: 'transform',
      }}
      loading="eager"
    />

    {/* Overlay 1 — base density, makes text always legible */}
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(26,17,24,0.38)',
      }}
    />

    {/* Overlay 2 — directional: right panel stays photographic, left has text */}
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: `linear-gradient(
          100deg,
          rgba(26,17,24,0.92) 0%,
          rgba(26,17,24,0.72) 35%,
          rgba(26,17,24,0.22) 62%,
          rgba(26,17,24,0.05) 100%
        )`,
      }}
    />

    {/* Overlay 3 — brand rose accent, photographic glow on right */}
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse 55% 75% at 80% 55%, rgba(212,120,138,0.14) 0%, transparent 65%)',
      }}
    />
  </div>
)

// Slide content — the editorial text panel.
// Choreographed: each text layer has a different entry timing to create
// a staggered reveal effect that reads as intentional, not mechanical.
const SlideContent = ({ slide, isActive, onShop, onExplore }) => {
  const contentRef = useRef(null)

  return (
    <div
      ref={contentRef}
      style={{
        opacity: isActive ? 1 : 0,
        transform: isActive ? 'translateY(0)' : 'translateY(32px)',
        transition: `opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.15s, transform 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.15s`,
        position: isActive ? 'relative' : 'absolute',
        pointerEvents: isActive ? 'auto' : 'none',
        maxWidth: '560px',
      }}
      aria-hidden={!isActive}
    >
      {/* Tag / eyebrow */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '1.75rem',
          opacity: isActive ? 1 : 0,
          transform: isActive ? 'translateY(0)' : 'translateY(16px)',
          transition: 'opacity 0.7s ease 0.3s, transform 0.7s cubic-bezier(0.16,1,0.3,1) 0.3s',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '0.58rem',
            fontWeight: 500,
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            color: 'var(--color-kb-rose)',
          }}
        >
          {slide.tag}
        </span>
        <span
          aria-hidden
          style={{
            flex: 1,
            maxWidth: '48px',
            height: '1px',
            background: 'rgba(212,120,138,0.45)',
          }}
        />
      </div>

      {/* Headline — the typographic centrepiece of the hero */}
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(3.8rem, 9vw, 7.5rem)',
          fontWeight: 300,
          color: 'var(--color-kb-ivory)',
          letterSpacing: '-0.025em',
          lineHeight: 0.92,
          marginBottom: '1.5rem',
          opacity: isActive ? 1 : 0,
          transform: isActive ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 0.8s ease 0.2s, transform 0.8s cubic-bezier(0.16,1,0.3,1) 0.2s',
        }}
      >
        {slide.title}
        <br />
        <span
          style={{
            fontStyle: 'italic',
            background: 'linear-gradient(135deg, var(--color-kb-rose) 0%, var(--color-kb-soft-pink) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          {slide.titleAccent}
        </span>
      </h1>

      {/* Brand / subtitle line */}
      <p
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '0.62rem',
          fontWeight: 400,
          letterSpacing: '0.24em',
          textTransform: 'uppercase',
          color: 'rgba(242,196,206,0.6)',
          marginBottom: '1rem',
          opacity: isActive ? 1 : 0,
          transform: isActive ? 'translateY(0)' : 'translateY(14px)',
          transition: 'opacity 0.7s ease 0.35s, transform 0.7s cubic-bezier(0.16,1,0.3,1) 0.35s',
        }}
      >
        {slide.subtitle}
      </p>

      {/* Description */}
      <p
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '0.9rem',
          fontWeight: 300,
          lineHeight: 1.72,
          color: 'rgba(253,240,243,0.55)',
          marginBottom: '2.5rem',
          maxWidth: '400px',
          opacity: isActive ? 1 : 0,
          transform: isActive ? 'translateY(0)' : 'translateY(12px)',
          transition: 'opacity 0.7s ease 0.45s, transform 0.7s cubic-bezier(0.16,1,0.3,1) 0.45s',
        }}
      >
        {slide.description}
      </p>

      {/* CTA row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.25rem',
          opacity: isActive ? 1 : 0,
          transform: isActive ? 'translateY(0)' : 'translateY(10px)',
          transition: 'opacity 0.7s ease 0.55s, transform 0.7s cubic-bezier(0.16,1,0.3,1) 0.55s',
        }}
      >
        <button
          onClick={onShop}
          className="btn-kb-accent"
          style={{ padding: '0.9rem 2.4rem', fontSize: '0.65rem' }}
        >
          <span>Explorar colección</span>
        </button>

        <button
          onClick={onExplore}
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '0.62rem',
            fontWeight: 400,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'rgba(242,196,206,0.65)',
            borderBottom: '1px solid rgba(212,120,138,0.35)',
            paddingBottom: '3px',
            background: 'none',
            border: 'none',
            borderBottom: '1px solid rgba(212,120,138,0.35)',
            cursor: 'pointer',
            transition: 'color 0.3s ease, border-color 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--color-kb-rose-mist)'
            e.currentTarget.style.borderBottomColor = 'var(--color-kb-rose)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'rgba(242,196,206,0.65)'
            e.currentTarget.style.borderBottomColor = 'rgba(212,120,138,0.35)'
          }}
        >
          Ver todo
        </button>
      </div>
    </div>
  )
}

// Right panel — the editorial image frame.
// DESIGN DECISION: replaced the circle (startup/tech aesthetic) with a
// tall editorial portrait crop. Fashion photography lives in 2:3 ratios —
// that's how magazines present clothing. The shape communicates the category.
// Asymmetric offset creates compositional tension that feels designed.
const SlideImagePanel = ({ slides, currentSlide }) => (
  <div
    aria-hidden
    style={{
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
    }}
  >
    {/* Decorative vertical line — editorial breath mark */}
    <div
      style={{
        position: 'absolute',
        left: '-2rem',
        top: '8%',
        bottom: '8%',
        width: '1px',
        background: 'linear-gradient(180deg, transparent, rgba(212,120,138,0.25) 30%, rgba(212,120,138,0.25) 70%, transparent)',
      }}
    />

    {/* Portrait frame — 2:3 editorial ratio */}
    <div
      style={{
        position: 'relative',
        width: 'clamp(260px, 28vw, 380px)',
        aspectRatio: '2 / 3',
        overflow: 'hidden',
        borderRadius: '2px',
        border: '1px solid rgba(212,120,138,0.2)',
        boxShadow: '0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(212,120,138,0.08)',
      }}
    >
      {slides.map((slide, index) => (
        <img
          key={slide.id}
          src={slide.image}
          alt={`${slide.title} ${slide.titleAccent}`}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center 15%',
            opacity: index === currentSlide ? 1 : 0,
            transform: index === currentSlide ? 'scale(1.04)' : 'scale(1)',
            transition: `opacity ${TRANSITION_DURATION_MS}ms cubic-bezier(0.4, 0, 0.2, 1), transform ${TRANSITION_DURATION_MS * 3}ms cubic-bezier(0.16, 1, 0.3, 1)`,
          }}
        />
      ))}

      {/* Inner vignette — makes the portrait feel photographic, not digital */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(26,17,24,0) 50%, rgba(26,17,24,0.45) 100%)',
          pointerEvents: 'none',
        }}
      />
    </div>

    {/* Floating brand accent — replaces the previous dynamic tag badge.
        CHANGE: Removed the conditional `includes('20')` logic that was fragile
        and semantically wrong. This is now a static brand mark: clean, intentional. */}
    <div
      style={{
        position: 'absolute',
        bottom: '-1rem',
        left: '0.5rem',
        background: 'rgba(26,17,24,0.9)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(212,120,138,0.2)',
        borderRadius: '2px',
        padding: '1.1rem 1.5rem',
        boxShadow: '0 12px 40px rgba(0,0,0,0.35)',
        animation: 'floatBadge 5s ease-in-out infinite',
      }}
    >
      <p
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '0.55rem',
          fontWeight: 500,
          letterSpacing: '0.24em',
          textTransform: 'uppercase',
          color: 'rgba(212,120,138,0.65)',
          marginBottom: '0.3rem',
        }}
      >
        Importado desde
      </p>
      <p
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.45rem',
          fontWeight: 300,
          color: 'var(--color-kb-ivory)',
          letterSpacing: '-0.01em',
          lineHeight: 1,
        }}
      >
        EE.UU.
      </p>
    </div>

    {/* Decorative corner mark — editorial detail */}
    <div
      aria-hidden
      style={{
        position: 'absolute',
        top: '-0.75rem',
        right: '-0.75rem',
        width: '28px',
        height: '28px',
        borderTop: '1px solid rgba(212,120,138,0.35)',
        borderRight: '1px solid rgba(212,120,138,0.35)',
      }}
    />
  </div>
)

// Slide navigator — vertical pill indicators on the right edge.
// Accessible: role="tablist" with individual tab semantics per indicator.
const SlideNavigator = ({ slides, currentSlide, onGoToSlide }) => (
  <div
    role="tablist"
    aria-label="Navegar entre slides"
    style={{
      position: 'absolute',
      right: '1.5rem',
      top: '50%',
      transform: 'translateY(-50%)',
      zIndex: 20,
      display: 'flex',
      flexDirection: 'column',
      gap: '0.6rem',
      alignItems: 'flex-end',
    }}
  >
    {slides.map((slide, index) => {
      const isActive = index === currentSlide
      return (
        <button
          key={slide.id}
          role="tab"
          aria-selected={isActive}
          aria-label={`Slide ${index + 1}: ${slide.title} ${slide.titleAccent}`}
          onClick={() => onGoToSlide(index)}
          style={{
            background: 'none',
            border: 'none',
            padding: '4px 0',
            cursor: isActive ? 'default' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          {/* Numeric label — visible on hover, communicates position */}
          <span
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '0.52rem',
              fontWeight: 400,
              letterSpacing: '0.12em',
              color: isActive ? 'rgba(242,196,206,0.8)' : 'rgba(242,196,206,0)',
              transition: 'color 0.3s ease, opacity 0.3s ease',
              userSelect: 'none',
            }}
          >
            {String(index + 1).padStart(2, '0')}
          </span>

          {/* Pill indicator */}
          <div
            style={{
              width: isActive ? '3px' : '2px',
              height: isActive ? '44px' : '14px',
              borderRadius: '99px',
              background: isActive
                ? 'linear-gradient(180deg, var(--color-kb-rose), var(--color-kb-soft-pink))'
                : 'rgba(255,255,255,0.18)',
              transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
        </button>
      )
    })}
  </div>
)

// Progress bar — thin line at the very bottom of the hero.
// Communicates autoplay timing without any text or explicit UI.
// Resets and restarts cleanly on each slide transition.
const SlideProgressBar = ({ duration, isActive, slideKey }) => (
  <div
    aria-hidden
    style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: '1px',
      background: 'rgba(212,120,138,0.1)',
      zIndex: 20,
      overflow: 'hidden',
    }}
  >
    <div
      key={slideKey}
      style={{
        height: '100%',
        background: 'linear-gradient(90deg, var(--color-kb-rose), var(--color-kb-soft-pink))',
        width: isActive ? '100%' : '0%',
        transition: isActive ? `width ${duration}ms linear` : 'none',
        transformOrigin: 'left center',
      }}
    />
  </div>
)

// Large ghost index number — decorative editorial detail.
// Establishes position in the sequence. Extremely subtle (4% opacity).
const SlideIndexGhost = ({ index }) => (
  <div
    aria-hidden
    style={{
      position: 'absolute',
      bottom: '2rem',
      left: '1.5rem',
      zIndex: 5,
      fontFamily: 'var(--font-display)',
      fontSize: 'clamp(5rem, 12vw, 9rem)',
      fontWeight: 300,
      color: 'rgba(255,255,255,0.035)',
      lineHeight: 1,
      letterSpacing: '-0.06em',
      userSelect: 'none',
      pointerEvents: 'none',
    }}
  >
    {String(index + 1).padStart(2, '0')}
  </div>
)

// Mobile dot indicators — compact, touch-friendly.
// Only shown on mobile where the vertical pill navigator is hidden.
const MobileDotNavigator = ({ slides, currentSlide, onGoToSlide }) => (
  <div
    role="tablist"
    aria-label="Navegar entre slides"
    style={{
      position: 'absolute',
      bottom: '1.5rem',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 20,
      display: 'flex',
      gap: '0.5rem',
      alignItems: 'center',
    }}
  >
    {slides.map((slide, index) => {
      const isActive = index === currentSlide
      return (
        <button
          key={slide.id}
          role="tab"
          aria-selected={isActive}
          aria-label={`Slide ${index + 1}`}
          onClick={() => onGoToSlide(index)}
          style={{
            background: 'none',
            border: 'none',
            padding: '4px',
            cursor: 'pointer',
          }}
        >
          <div
            style={{
              width: isActive ? '20px' : '5px',
              height: '5px',
              borderRadius: '99px',
              background: isActive ? 'var(--color-kb-rose)' : 'rgba(255,255,255,0.25)',
              transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
        </button>
      )
    })}
  </div>
)

// ─── Main component ───────────────────────────────────────────────────────────

const HeroSection = () => {
  const [slides, setSlides] = useState([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const autoplayRef = useRef(null)
  const navigate = useNavigate()

  // ── Data ────────────────────────────────────────────────────────────────────

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const { data, error } = await supabase
          .from('hero_slides')
          .select(`
            *,
            products (
              name,
              description,
              category,
              brand,
              images_urls,
              image_url
            )
          `)
          .eq('active', true)
          .order('sort_order', { ascending: true })

        if (error) throw error
        setSlides((data || []).map(normalizeSlide))
      } catch (err) {
        // Fail silently: hero returns null, page still renders
        console.error('[HeroSection] Failed to fetch slides:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSlides()
  }, [])

  // ── Slide transition ─────────────────────────────────────────────────────────
  // `useCallback` so the autoplay effect's dependency array stays stable.

  const goToSlide = useCallback((index) => {
    if (isTransitioning || index === currentSlide) return
    setIsTransitioning(true)
    setCurrentSlide(index)
    setTimeout(() => setIsTransitioning(false), TRANSITION_DURATION_MS)
  }, [isTransitioning, currentSlide])

  // ── Autoplay ─────────────────────────────────────────────────────────────────
  // CHANGE from original: 4000ms → 6500ms.
  // Rationale: 4s is editorial panic. Fashion brands use 5–8s because
  // the viewer needs time to feel desire, not just register information.
  // 6.5s is deliberate, confident, premium.

  useEffect(() => {
    if (slides.length < 2) return

    autoplayRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, SLIDE_DURATION_MS)

    return () => clearInterval(autoplayRef.current)
  }, [slides.length])

  // Pause autoplay while user is navigating manually
  const pauseAndResumeAutoplay = useCallback((nextIndex) => {
    clearInterval(autoplayRef.current)
    goToSlide(nextIndex)
    if (slides.length < 2) return
    autoplayRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, SLIDE_DURATION_MS)
  }, [goToSlide, slides.length])

  // ── Keyboard navigation ──────────────────────────────────────────────────────

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowLeft') {
      pauseAndResumeAutoplay((currentSlide - 1 + slides.length) % slides.length)
    }
    if (e.key === 'ArrowRight') {
      pauseAndResumeAutoplay((currentSlide + 1) % slides.length)
    }
  }, [currentSlide, slides.length, pauseAndResumeAutoplay])

  // ── Navigation handlers ──────────────────────────────────────────────────────

  const handleShop = useCallback((category) => {
    navigate(`/?categoria=${category}`)
  }, [navigate])

  const handleExploreAll = useCallback(() => {
    navigate('/')
  }, [navigate])

  // ── Render states ────────────────────────────────────────────────────────────

  if (isLoading) return <HeroSkeleton />
  if (slides.length === 0) return null

  return (
    <>
      <style>{`
        @keyframes floatBadge {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-6px); }
        }
      `}</style>

      <section
        role="region"
        aria-label="Productos destacados"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        style={{
          position: 'relative',
          overflow: 'hidden',
          background: 'var(--color-kb-obsidian)',
          minHeight: HERO_MIN_HEIGHT,
          outline: 'none',
        }}
      >
        {/* ── Background layers ── */}
        {slides.map((slide, index) => (
          <SlideBackground
            key={slide.id}
            slide={slide}
            isActive={index === currentSlide}
          />
        ))}

        {/* ── Main content grid ── */}
        <div
          style={{
            position: 'relative',
            zIndex: 10,
            minHeight: HERO_MIN_HEIGHT,
            display: 'flex',
            alignItems: 'center',
            maxWidth: '1280px',
            margin: '0 auto',
            padding: 'clamp(5rem, 10vh, 7rem) 1.5rem clamp(4rem, 8vh, 6rem)',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: '4rem',
              width: '100%',
              alignItems: 'center',
            }}
            className="lg:grid-cols-[1fr_auto]"
          >
            {/* Left: text content */}
            <div style={{ position: 'relative' }}>
              {slides.map((slide, index) => (
                <SlideContent
                  key={slide.id}
                  slide={slide}
                  isActive={index === currentSlide}
                  onShop={() => handleShop(slide.category)}
                  onExplore={handleExploreAll}
                />
              ))}
            </div>

            {/* Right: editorial portrait — hidden on mobile */}
            <div className="hidden lg:block">
              <SlideImagePanel
                slides={slides}
                currentSlide={currentSlide}
              />
            </div>
          </div>
        </div>

        {/* ── Decorative ghost index — desktop only ── */}
        <div className="hidden md:block">
          <SlideIndexGhost index={currentSlide} />
        </div>

        {/* ── Vertical pill navigator — desktop only ── */}
        <div className="hidden md:block">
          <SlideNavigator
            slides={slides}
            currentSlide={currentSlide}
            onGoToSlide={pauseAndResumeAutoplay}
          />
        </div>

        {/* ── Mobile dot navigator — mobile only ── */}
        <div className="md:hidden">
          <MobileDotNavigator
            slides={slides}
            currentSlide={currentSlide}
            onGoToSlide={pauseAndResumeAutoplay}
          />
        </div>

        {/* ── Progress bar ── */}
        <SlideProgressBar
          duration={SLIDE_DURATION_MS}
          isActive
          slideKey={`progress-${currentSlide}`}
        />
      </section>
    </>
  )
}

export default HeroSection