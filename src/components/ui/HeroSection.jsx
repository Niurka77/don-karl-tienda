import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

const trustItems = [
  {
    label: '100% Original',
    icon: (
      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3 .708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
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
      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
    ),
  },
  {
    label: 'Atención 24/7',
    icon: (
      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
    ),
  },
]

const HeroSection = () => {
  const [slides, setSlides] = useState([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [prevSlide, setPrevSlide] = useState(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchSlides()
  }, [])

  useEffect(() => {
    if (slides.length > 0) {
      const timer = setInterval(() => {
        goToSlide((currentSlide + 1) % slides.length)
      }, 4000) // 🔥 REDUCIDO: De 6500ms a 4000ms (4 segundos)
      return () => clearInterval(timer)
    }
  }, [currentSlide, slides])

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
            gender,
            brand,
            images_urls,
            image_url
          )
        `)
        .eq('active', true)
        .order('sort_order', { ascending: true })

      if (error) throw error

      const processedSlides = data.map((slide) => {
        const product = slide.products
        const images = product?.images_urls?.length > 0 
          ? product.images_urls 
          : product?.image_url 
            ? [product.image_url] 
            : []

        if (!product) {
          return {
            id: slide.id,
            title: slide.title_override || 'Colección',
            titleAccent: slide.title_accent_override || 'Exclusiva',
            subtitle: slide.subtitle_override || 'Nueva Colección',
            description: slide.description_override || 'Descubre nuestra selección exclusiva',
            image: slide.image_override || 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200&h=800&fit=crop',
            category: 'todos',
            tag: slide.tag_override || 'Nuevo',
          }
        }

        return {
          id: slide.id,
          title: slide.title_override || product.name.split(' ')[0] || 'Colección',
          titleAccent: slide.title_accent_override || product.name.split(' ').slice(1).join(' ') || 'Exclusiva',
          subtitle: slide.subtitle_override || product.brand || 'Nueva Colección',
          description: slide.description_override || product.description || 'Descubre nuestra selección exclusiva',
          image: slide.image_override || images[0] || 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200&h=800&fit=crop',
          category: product.category || 'todos',
          tag: slide.tag_override || 'Nuevo', // ✅ AHORA USA tag_override
        }
      })

      setSlides(processedSlides)
    } catch (error) {
      console.error('Error fetching slides:', error)
    } finally {
      setLoading(false)
    }
  }

  const goToSlide = (index) => {
    if (isTransitioning || index === currentSlide) return
    setIsTransitioning(true)
    setPrevSlide(currentSlide)
    setCurrentSlide(index)
    setTimeout(() => {
      setPrevSlide(null)
      setIsTransitioning(false)
    }, 900)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') goToSlide((currentSlide - 1 + slides.length) % slides.length)
    if (e.key === 'ArrowRight') goToSlide((currentSlide + 1) % slides.length)
  }

  const handleComprarAhora = (categoria) => navigate(`/?categoria=${categoria}`)

  if (loading) {
    return (
      <section className="relative min-h-[92vh] flex items-center justify-center bg-[#1A1118]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#D4788A] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#F2C4CE] font-['DM_Sans'] text-sm tracking-widest">Cargando...</p>
        </div>
      </section>
    )
  }

  if (slides.length === 0) {
    return null
  }

  return (
    <section
      className="relative overflow-hidden"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-label="Carrusel de productos destacados"
      style={{ background: 'var(--color-kb-ivory)' }}
    >
      <div className="relative min-h-[92vh] md:min-h-[88vh] flex items-center">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className="absolute inset-0 transition-opacity duration-1000"
            style={{ opacity: index === currentSlide ? 1 : 0, zIndex: 0 }}
            aria-hidden
          >
            <img
              src={slide.image}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
              style={{ filter: 'brightness(0.22) saturate(0.6)' }}
            />
            <div
              className="absolute inset-0"
              style={{
                background: `
                  linear-gradient(105deg,
                    rgba(26,17,24,0.96) 0%,
                    rgba(26,17,24,0.75) 38%,
                    rgba(26,17,24,0.15) 65%,
                    transparent 100%
                  )
                `,
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background: 'radial-gradient(ellipse 60% 80% at 75% 50%, rgba(212,120,138,0.08) 0%, transparent 70%)',
              }}
            />
          </div>
        ))}

        <div className="relative z-10 max-w-screen-xl mx-auto px-6 lg:px-10 w-full py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              {slides.map((slide, index) => (
                <div
                  key={slide.id}
                  className="transition-all duration-700"
                  style={{
                    opacity: index === currentSlide ? 1 : 0,
                    transform: index === currentSlide ? 'translateY(0)' : 'translateY(24px)',
                    position: index === currentSlide ? 'relative' : 'absolute',
                    pointerEvents: index === currentSlide ? 'auto' : 'none',
                  }}
                  aria-hidden={index !== currentSlide}
                >
                  <div className="flex items-center gap-3 mb-7">
                    <span
                      className="text-editorial"
                      style={{ color: 'var(--color-kb-rose)', letterSpacing: '0.22em' }}
                    >
                      {slide.tag}
                    </span>
                    <span
                      className="flex-1 h-px max-w-[60px]"
                      style={{ background: 'rgba(212,120,138,0.4)' }}
                    />
                  </div>

                  <h1
                    className="mb-5 leading-[0.95]"
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 'clamp(3.5rem, 8vw, 7rem)',
                      fontWeight: 300,
                      color: 'var(--color-kb-ivory)',
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {slide.title}{' '}
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

                  <p
                    className="mb-4 text-editorial"
                    style={{ color: 'rgba(242,196,206,0.65)', letterSpacing: '0.2em' }}
                  >
                    {slide.subtitle}
                  </p>

                  <p
                    className="mb-10 leading-relaxed max-w-md"
                    style={{
                      color: 'rgba(253,240,243,0.6)',
                      fontSize: '0.95rem',
                      fontWeight: 300,
                    }}
                  >
                    {slide.description}
                  </p>

                  <div className="flex items-baseline gap-2 mb-10">
                    <span
                      className="text-editorial"
                      style={{ color: 'rgba(242,196,206,0.5)' }}
                    >
                      Desde
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '2.2rem',
                        fontWeight: 300,
                        color: 'var(--color-kb-ivory)',
                        letterSpacing: '-0.02em',
                      }}
                    >
                      S/ 45
                    </span>
                    <span style={{ color: 'rgba(242,196,206,0.4)', fontSize: '0.8rem' }}>.00</span>
                  </div>

                  <div className="flex flex-wrap gap-4">
                    <button
                      onClick={() => handleComprarAhora(slide.category)}
                      className="btn-kb-accent"
                      style={{ padding: '0.9rem 2.2rem', fontSize: '0.7rem' }}
                    >
                      <span>Comprar Ahora</span>
                    </button>
                    <button
                      onClick={() => navigate('/?genero=mujer')}
                      className="text-editorial transition-all duration-300"
                      style={{
                        color: 'rgba(242,196,206,0.7)',
                        borderBottom: '1px solid rgba(212,120,138,0.3)',
                        paddingBottom: '2px',
                        letterSpacing: '0.18em',
                        fontSize: '0.7rem',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = 'var(--color-kb-rose-mist)'
                        e.currentTarget.style.borderBottomColor = 'var(--color-kb-rose)'
                        e.currentTarget.style.letterSpacing = '0.24em'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'rgba(242,196,206,0.7)'
                        e.currentTarget.style.borderBottomColor = 'rgba(212,120,138,0.3)'
                        e.currentTarget.style.letterSpacing = '0.18em'
                      }}
                    >
                      Ver Catálogo
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden lg:flex justify-center items-center relative">
              <div
                className="absolute rounded-full"
                style={{
                  width: '460px',
                  height: '460px',
                  border: '1px solid rgba(212,120,138,0.12)',
                }}
              />
              <div
                className="absolute rounded-full"
                style={{
                  width: '380px',
                  height: '380px',
                  border: '1px solid rgba(212,120,138,0.2)',
                }}
              />

              <div
                className="relative overflow-hidden rounded-full"
                style={{
                  width: '320px',
                  height: '320px',
                  border: '2px solid rgba(212,120,138,0.3)',
                  boxShadow: '0 0 80px rgba(212,120,138,0.15), 0 24px 64px rgba(0,0,0,0.4)',
                }}
              >
                {slides.map((slide, index) => (
                  <img
                    key={slide.id}
                    src={slide.image}
                    alt={slide.title}
                    className="absolute inset-0 w-full h-full object-cover transition-all duration-1000"
                    style={{
                      opacity: index === currentSlide ? 1 : 0,
                      transform: index === currentSlide ? 'scale(1.05)' : 'scale(1)',
                    }}
                    loading="eager"
                  />
                ))}
              </div>

              {/* ✅ BADGE DINÁMICO: Muestra el tag del slide actual */}
              <div
                className="absolute bottom-6 right-6 animate-float"
                style={{
                  background: 'rgba(26,17,24,0.85)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(212,120,138,0.25)',
                  borderRadius: '12px',
                  padding: '1rem 1.4rem',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                }}
              >
                <p
                  className="text-editorial mb-1"
                  style={{ color: 'rgba(212,120,138,0.7)', fontSize: '0.6rem' }}
                >
                  {slides[currentSlide]?.tag?.includes('20') ? 'Colección' : 'Tag'}
                </p>
                <p
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.6rem',
                    fontWeight: 300,
                    color: 'var(--color-kb-ivory)',
                    lineHeight: 1,
                    letterSpacing: '-0.02em',
                  }}
                >
                  {slides[currentSlide]?.tag || '2025'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div
          className="absolute right-6 top-1/2 -translate-y-1/2 z-20 hidden md:flex flex-col gap-3"
          role="tablist"
          aria-label="Navegación de slides"
        >
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              onClick={() => goToSlide(index)}
              className="group relative flex items-center justify-end gap-2"
              role="tab"
              aria-selected={index === currentSlide}
              aria-label={`${slide.title} ${slide.titleAccent}`}
            >
              <span
                className="text-editorial opacity-0 group-hover:opacity-100 transition-all duration-300"
                style={{
                  color: 'rgba(242,196,206,0.6)',
                  fontSize: '0.58rem',
                  letterSpacing: '0.18em',
                  transform: 'translateX(4px)',
                }}
              >
                {String(index + 1).padStart(2, '0')}
              </span>
              <div
                className="transition-all duration-500"
                style={{
                  width: index === currentSlide ? '3px' : '2px',
                  height: index === currentSlide ? '40px' : '16px',
                  borderRadius: '99px',
                  background: index === currentSlide
                    ? 'linear-gradient(180deg, var(--color-kb-rose), var(--color-kb-soft-pink))'
                    : 'rgba(255,255,255,0.2)',
                }}
              />
            </button>
          ))}
        </div>

        <div className="absolute bottom-8 left-6 lg:left-10 z-20 hidden md:flex items-end gap-3">
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '3.5rem',
              fontWeight: 300,
              color: 'rgba(255,255,255,0.06)',
              lineHeight: 1,
              letterSpacing: '-0.04em',
              userSelect: 'none',
            }}
          >
            {String(currentSlide + 1).padStart(2, '0')}
          </span>
        </div>
      </div>

      <div
        style={{
          background: 'var(--color-kb-obsidian)',
          borderTop: '1px solid rgba(212,120,138,0.1)',
        }}
      >
        <div className="max-w-screen-xl mx-auto px-6 lg:px-10 py-7">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {trustItems.map((item) => (
              <div key={item.label} className="flex items-center gap-3 group">
                <div
                  className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-105"
                  style={{
                    background: 'rgba(212,120,138,0.08)',
                    border: '1px solid rgba(212,120,138,0.18)',
                  }}
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    style={{ color: 'var(--color-kb-rose)' }}
                  >
                    {item.icon}
                  </svg>
                </div>
                <span
                  className="text-editorial"
                  style={{
                    color: 'rgba(242,196,206,0.55)',
                    fontSize: '0.62rem',
                    letterSpacing: '0.18em',
                    transition: 'color 0.3s ease',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(242,196,206,0.9)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(242,196,206,0.55)'}
                >
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection