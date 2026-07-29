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
  const slideTitle = slide?.title_override || slide?.products?.name || title
  const slideSubtitle = slide?.subtitle_override || slide?.products?.brand || subtitle
  const slideImage = slide?.image_override || slide?.products?.images_urls?.[0] || slide?.products?.image_url || ''
  const slidePrice = slide?.products?.price_original
  const hasSlides = slides.length > 0 && !loading
  const hasProductLink = Boolean(slide?.product_id)

  return (
    <section className="relative w-full overflow-hidden bg-white">
      <div
        className="relative w-full h-[85vh] flex items-center justify-center overflow-hidden"
        style={!backgroundImage && backgroundColor ? { backgroundColor } : undefined}
      >
        {backgroundImage && (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${backgroundImage})` }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-black/20 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between w-full max-w-7xl mx-auto px-6 gap-8">
          <div className="text-center md:text-left flex-1 max-w-xl">
            {slide?.tag_override && (
              <span className="inline-block font-sans text-[0.55rem] tracking-[0.25em] uppercase text-white/70 border border-white/20 px-4 py-1.5 mb-6">
                {slide.tag_override}
              </span>
            )}
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-light text-white leading-tight mb-4">
              {slideTitle || 'Nueva Colección'}
              {slide?.title_accent_override && (
                <span className="italic text-kb-rose"> {slide.title_accent_override}</span>
              )}
            </h1>
            {slideSubtitle && (
              <p className="font-sans text-sm md:text-base text-white/70 tracking-[0.2em] uppercase mb-6 font-light">
                {slideSubtitle}
              </p>
            )}
            {slidePrice && (
              <p className="font-sans text-xl md:text-2xl text-kb-rose font-light tracking-wide mb-8">
                S/ {Number(slidePrice).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </p>
            )}
            {hasProductLink && (
              <Link
                to={`/producto/${slide.product_id}`}
                className="inline-block border border-white text-white bg-transparent px-10 py-4 text-xs font-sans tracking-[0.2em] uppercase transition-all duration-300 hover:bg-white hover:text-kb-obsidian"
              >
                {ctaText || 'Ver Producto'}
              </Link>
            )}
          </div>

          {slideImage && (
            <div className="flex-shrink-0 w-64 h-64 md:w-96 md:h-96 relative">
              {hasProductLink ? (
                <Link to={`/producto/${slide.product_id}`}>
                  <img
                    src={slideImage}
                    alt={slideTitle || ''}
                    className="w-full h-full object-cover rounded-sm shadow-2xl"
                  />
                </Link>
              ) : (
                <img
                  src={slideImage}
                  alt={slideTitle || ''}
                  className="w-full h-full object-cover rounded-sm shadow-2xl"
                />
              )}
            </div>
          )}
        </div>

        {hasSlides && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-2 h-2 rounded-full transition-all duration-500 ${
                  i === current ? 'bg-white w-8' : 'bg-white/40 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {hasSlides && (
        <div className="w-full bg-white border-t border-kb-rose/10">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
              {slides.map((s, i) => {
                const thumb = s.image_override || s.products?.images_urls?.[0] || s.products?.image_url || ''
                const name = s.title_override || s.products?.name || ''

                return (
                  <button
                    key={s.id}
                    onClick={() => setCurrent(i)}
                    className={`flex-shrink-0 w-20 md:w-24 transition-all duration-300 ${
                      i === current ? 'opacity-100 ring-1 ring-kb-rose' : 'opacity-50 hover:opacity-80'
                    }`}
                  >
                    <div className="aspect-[3/4] overflow-hidden rounded-sm bg-kb-blush">
                      {thumb && (
                        <img src={thumb} alt={name} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <p className="font-sans text-[0.6rem] text-kb-obsidian/60 mt-1 truncate tracking-wider uppercase">
                      {name}
                    </p>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
