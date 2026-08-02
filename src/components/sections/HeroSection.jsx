import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

export default function HeroSection({ title, subtitle, ctaText, backgroundImage, backgroundColor }) {
  const [slides, setSlides] = useState([])
  const [current, setCurrent] = useState(0)
  const [loading, setLoading] = useState(true)

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
    if (slides.length < 2) return
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [slides.length])

  const slide = slides[current]
  const slideTag = slide?.tag_override || 'New Collection'
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
        className="relative w-full min-h-[500px] flex items-center overflow-hidden"
        style={{
          backgroundColor: backgroundColor || 'var(--color-kb-rose-deep)',
          backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Overlay suave para legibilidad */}
        {backgroundImage && (
          <div className="absolute inset-0 bg-black/30 pointer-events-none" />
        )}

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-[3fr_2fr] items-center gap-10 py-16">
          {/* ── Texto ─────────────────────────────────────────────────────── */}
          <div className="text-center md:text-left max-w-xl">
            <span className="inline-flex items-center gap-2 font-sans text-[0.62rem] tracking-[0.3em] uppercase text-kb-gold border border-kb-gold/50 rounded-full px-4 py-1.5 mb-6 bg-black/5">
              <span className="w-1.5 h-1.5 rounded-full bg-kb-gold" />
              {slideTag}
            </span>

            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-light text-white leading-[1.05] mb-4">
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

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
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
          </div>

          {/* ── Imagen con arco decorativo ────────────────────────────────── */}
          <div className="flex items-center justify-center md:justify-end relative">
            <div className="relative w-64 h-72 md:w-80 md:h-[22rem]">
              <svg
                viewBox="0 0 320 352"
                className="absolute inset-0 w-full h-full"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M20 332V120 C20 40 120 8 160 8 C200 8 300 40 300 120 V332Z"
                  fill="white"
                  opacity="0.12"
                  stroke="rgba(255,255,255,0.25)"
                  strokeWidth="1.5"
                />
              </svg>
              {slideImage ? (
                hasProductLink ? (
                  <Link to={`/producto/${slide.product_id}`} className="block h-full">
                    <img
                      src={slideImage}
                      alt={slideTitle || ''}
                      className="relative w-full h-full object-cover shadow-2xl"
                    />
                  </Link>
                ) : (
                  <img
                    src={slideImage}
                    alt={slideTitle || ''}
                    className="relative w-full h-full object-cover shadow-2xl"
                  />
                )
              ) : (
                <div className="relative w-full h-full bg-white/10 flex items-center justify-center">
                  <span className="font-display text-white/40 text-4xl">KB</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Indicadores de slide ────────────────────────────────────────── */}
        {hasSlides && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                aria-label={`Slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  i === current ? 'w-8 bg-kb-gold' : 'w-3 bg-white/40 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
