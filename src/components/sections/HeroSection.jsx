import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

const STAR_PATH = 'M12 2l2.9 6.26 6.6.72-4.9 4.55 1.3 6.52L12 17.27 6.1 20.05l1.3-6.52L2.5 8.98l6.6-.72L12 2z'

export default function HeroSection({ title, subtitle, ctaText, backgroundImage, backgroundColor }) {
  const [slides, setSlides] = useState([])
  const [current, setCurrent] = useState(0)
  const [loading, setLoading] = useState(true)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const { data, error } = await supabase
          .from('hero_slides')
          .select(`*, products ( name, brand, category, images_urls, image_url, price_original )`)
          .eq('active', true)
          .order('sort_order', { ascending: true })

        if (error) throw error
        setSlides(data || [])
      } catch (err) {
        console.error('Error fetching hero slides:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchSlides()
  }, [])

  useEffect(() => {
    if (slides.length < 2 || paused) return
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [slides.length, paused])

  const goTo = (i) => setCurrent(((i % slides.length) + slides.length) % slides.length)
  const next = () => goTo(current + 1)
  const prev = () => goTo(current - 1)

  const slide = slides[current]
  const slideTag = slide?.tag_override || 'Nueva Colección'
  const slideTitle = slide?.title_override || slide?.products?.name || title
  const slideAccent = slide?.title_accent_override || ''
  const slideSubtitle = slide?.subtitle_override || slide?.products?.brand || subtitle
  const slideImage = slide?.image_override || slide?.products?.images_urls?.[0] || slide?.products?.image_url || ''
  const slidePrice = slide?.products?.price_original
  const hasSlides = slides.length > 0 && !loading
  const hasProductLink = Boolean(slide?.product_id)

  return (
    <section className="relative w-full overflow-hidden">
      <div
        className="relative w-full min-h-[560px] lg:min-h-[600px] flex items-center overflow-hidden"
        style={{
          backgroundColor: backgroundColor || 'var(--color-kb-rose-deep)',
          backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Glows decorativos */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            width: '520px',
            height: '520px',
            borderRadius: '50%',
            right: '-160px',
            top: '-180px',
            background: 'radial-gradient(circle, rgba(255,197,150,0.28) 0%, transparent 65%)',
            pointerEvents: 'none',
          }}
        />
        <div
          aria-hidden
          style={{
            position: 'absolute',
            width: '460px',
            height: '460px',
            borderRadius: '50%',
            left: '-160px',
            bottom: '-220px',
            background: 'radial-gradient(circle, rgba(201,168,76,0.22) 0%, transparent 65%)',
            pointerEvents: 'none',
          }}
        />

        {/* Overlay suave para legibilidad */}
        {backgroundImage && <div className="absolute inset-0 bg-black/30 pointer-events-none" />}

        {/* Grid interior */}
        <div
          className="relative z-10 w-full max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-[3fr_2fr] items-center gap-12 lg:gap-10 py-16 lg:py-24"
          key={current}
          style={{ animation: 'heroReveal 0.75s cubic-bezier(0.16, 1, 0.3, 1) both' }}
        >
          {/* ── Texto ─────────────────────────────────────────────────────── */}
          <div className="text-center lg:text-left max-w-xl mx-auto lg:mx-0">
            <span
              className="inline-flex items-center gap-2 font-sans text-[0.62rem] tracking-[0.3em] uppercase text-kb-gold border border-kb-gold/50 rounded-full px-4 py-1.5 mb-6"
              style={{ background: 'rgba(0,0,0,0.12)', backdropFilter: 'blur(4px)' }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-kb-gold" />
              {slideTag}
            </span>

            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-light text-white leading-[1.02] mb-4">
              {slideTitle || 'Nueva Colección'}
              {slideAccent && <span className="italic text-kb-gold block"> {slideAccent}</span>}
            </h1>

            {slideSubtitle && (
              <p className="font-sans text-sm md:text-base text-white/80 tracking-[0.18em] uppercase mb-6 font-light">
                {slideSubtitle}
              </p>
            )}

            {slidePrice && (
              <p className="font-sans text-xl md:text-2xl text-kb-gold font-light tracking-wide mb-8">
                Desde S/ {Number(slidePrice).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </p>
            )}

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-9">
              {hasProductLink && (
                <Link
                  to={`/producto/${slide.product_id}`}
                  className="inline-block bg-white text-kb-rose-deep px-10 py-4 text-xs font-sans tracking-[0.2em] uppercase transition-all duration-300 hover:bg-kb-gold hover:text-white font-semibold"
                >
                  {ctaText || 'Ver Producto'}
                </Link>
              )}
              <Link
                to="/catalogo"
                className="inline-block border border-white/60 text-white bg-transparent px-10 py-4 text-xs font-sans tracking-[0.2em] uppercase transition-all duration-300 hover:border-white hover:bg-white hover:text-kb-rose-deep"
              >
                Ver Catálogo
              </Link>
            </div>

            {/* Prueba social */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-3">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="var(--color-kb-gold, #C9A84C)" aria-hidden="true">
                      <path d={STAR_PATH} />
                    </svg>
                  ))}
                </div>
                <span className="text-white/85 font-sans text-xs font-light tracking-wide">+500 clientas felices</span>
              </div>
              <span className="hidden lg:block w-px h-5 bg-white/25" aria-hidden />
              <div className="flex items-center gap-2">
                <svg width="15" height="15" fill="none" stroke="var(--color-kb-gold, #C9A84C)" strokeWidth={1.6} viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1" />
                </svg>
                <span className="text-white/85 font-sans text-xs font-light tracking-wide">Envíos a todo el Perú</span>
              </div>
            </div>
          </div>

          {/* ── Imagen editorial vertical ─────────────────────────────────── */}
          <div className="flex items-center justify-center lg:justify-end relative">
            <div className="relative w-[250px] sm:w-[290px] lg:w-[350px]">
              {/* Arco dorado decorativo detrás */}
              <svg
                viewBox="0 0 340 400"
                className="absolute -inset-3 w-[calc(100%+24px)] h-[calc(100%+24px)]"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M28 390V120 C28 38 128 4 170 4 C212 4 312 38 312 120 V390Z"
                  stroke="rgba(201,168,76,0.45)"
                  strokeWidth="1.5"
                  fill="rgba(255,255,255,0.05)"
                />
              </svg>

              {/* Imagen */}
              <div
                className="relative w-full overflow-hidden shadow-2xl"
                style={{
                  aspectRatio: '4/5',
                  borderRadius: '10px',
                  boxShadow: '0 40px 90px -30px rgba(26,17,24,0.55)',
                }}
              >
                {slideImage ? (
                  <img
                    src={slideImage}
                    alt={slideTitle || ''}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-white/10 flex items-center justify-center">
                    <span className="font-display text-white/40 text-5xl">KB</span>
                  </div>
                )}

                {/* Degradado inferior */}
                <div
                  aria-hidden
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(26,17,24,0.45) 0%, transparent 45%)',
                    pointerEvents: 'none',
                  }}
                />

                {/* Etiqueta flotante: precio */}
                {slidePrice && (
                  <div
                    style={{
                      position: 'absolute',
                      left: '1rem',
                      bottom: '1rem',
                      zIndex: 5,
                      background: 'rgba(255,255,255,0.94)',
                      backdropFilter: 'blur(8px)',
                      borderRadius: '8px',
                      padding: '0.5rem 0.9rem',
                      boxShadow: '0 12px 32px rgba(26,17,24,0.3)',
                    }}
                  >
                    <p style={{ fontSize: '0.5rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-kb-mauve)', fontFamily: 'var(--font-sans)', fontWeight: 600, marginBottom: '2px' }}>
                      Desde
                    </p>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 500, color: 'var(--color-kb-rose-deep)', letterSpacing: '-0.02em', margin: 0 }}>
                      S/ {Number(slidePrice).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                )}

                {/* Badge circular Nuevo */}
                <div
                  style={{
                    position: 'absolute',
                    right: '-0.9rem',
                    top: '1.1rem',
                    zIndex: 6,
                    width: '86px',
                    height: '86px',
                    animation: 'spinSlow 14s linear infinite',
                  }}
                >
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <defs>
                      <path id="circlePath" d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" />
                    </defs>
                    <circle cx="50" cy="50" r="49" fill="#1A1118" />
                    <text style={{ fontSize: '10.5px', letterSpacing: '2.6px', fill: '#F2C4CE', fontFamily: 'var(--font-sans)', fontWeight: 600 }}>
                      <textPath href="#circlePath">NUEVA COLECCIÓN • 2026 •</textPath>
                    </text>
                  </svg>
                  <span
                    style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--color-kb-gold)',
                      fontSize: '1.3rem',
                    }}
                  >
                    ✦
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Flechas de navegación ───────────────────────────────────────── */}
        {hasSlides && slides.length > 1 && (
          <div className="absolute inset-y-0 left-0 right-0 z-20 pointer-events-none hidden md:block">
            <button
              onClick={prev}
              aria-label="Slide anterior"
              className="absolute left-5 top-1/2 -translate-y-1/2 pointer-events-auto w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300"
              style={{
                background: 'rgba(255,255,255,0.12)',
                backdropFilter: 'blur(6px)',
                border: '1px solid rgba(255,255,255,0.3)',
                color: 'white',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--color-kb-gold, #C9A84C)'
                e.currentTarget.style.borderColor = 'var(--color-kb-gold, #C9A84C)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.12)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={next}
              aria-label="Siguiente slide"
              className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-auto w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300"
              style={{
                background: 'rgba(255,255,255,0.12)',
                backdropFilter: 'blur(6px)',
                border: '1px solid rgba(255,255,255,0.3)',
                color: 'white',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--color-kb-gold, #C9A84C)'
                e.currentTarget.style.borderColor = 'var(--color-kb-gold, #C9A84C)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.12)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}

        {/* ── Indicadores de slide ────────────────────────────────────────── */}
        {hasSlides && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  i === current ? 'w-8 bg-kb-gold' : 'w-3 bg-white/40 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        )}

        <style>{`
          @keyframes heroReveal {
            from { opacity: 0; transform: translateY(26px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          @keyframes spinSlow {
            from { transform: rotate(0deg); }
            to   { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </section>
  )
}