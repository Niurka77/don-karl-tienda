import { Link } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'

// 🔥 Fallbacks de imágenes (se usan si no hay datos en BD)
const FALLBACK_CATEGORIES = [
  {
    title: "Carteras",
    titleAccent: "Importadas",
    subtitle: "Guess · Tommy · Calvin Klein",
    description: "Piezas exclusivas importadas directamente desde Estados Unidos. Calidad premium que complementa tu estilo.",
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=900&h=1200&fit=crop&q=95",
    link: "/?categoria=carteras",
    num: "01",
    accent: "left",
  },
  {
    title: "Vestidos",
    titleAccent: "de Fiesta",
    subtitle: "Elegancia atemporal",
    description: "Diseños que te harán brillar en cada ocasión especial. Desde cócteles hasta galas.",
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=900&h=1200&fit=crop&q=95",
    link: "/?categoria=vestidos",
    num: "02",
    accent: "right",
  },
  {
    title: "Billeteras",
    titleAccent: "Premium",
    subtitle: "Michael Kors · Tommy · CK",
    description: "Funcionalidad y lujo en cada detalle. Las mejores marcas en accesorios esenciales.",
    image: "https://images.unsplash.com/photo-1606503156036-9d2b3da6b5b0?w=900&h=1200&fit=crop&q=95",
    link: "/?categoria=billeteras",
    num: "03",
    accent: "right",
  },
]

const CategoriesSection = () => {
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES)
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef(null)

  // 🔥 Fetch de categorías desde Supabase
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('id, name, category, brand, images_urls, image_url, stock')
          .or('category.ilike.%bolso%,category.ilike.%cartera%,category.ilike.%vestido%,category.ilike.%billetera%')
          .gte('stock', 1)
          .limit(30)

        if (error) throw error

        // Agrupar productos por categoría
        const grouped = { bolsos: [], vestidos: [], billeteras: [] }
        
        data?.forEach(product => {
          const cat = product.category?.toLowerCase() || ''
          if (cat.includes('bolso') || cat.includes('cartera')) grouped.bolsos.push(product)
          else if (cat.includes('vestido')) grouped.vestidos.push(product)
          else if (cat.includes('billetera')) grouped.billeteras.push(product)
        })

        // Función para construir tarjeta con imagen de BD o fallback
        const buildCard = (products, fallback, index) => {
          const firstProduct = products[0]
          let imageUrl = fallback.image
          
          // Prioridad: images_urls[0] > image_url > fallback
          if (firstProduct) {
            if (Array.isArray(firstProduct.images_urls) && firstProduct.images_urls.length > 0) {
              imageUrl = firstProduct.images_urls[0]
            } else if (typeof firstProduct.image_url === 'string' && firstProduct.image_url) {
              imageUrl = firstProduct.image_url
            }
          }

          // Extraer marcas reales
          const brands = [...new Set(products.map(p => p.brand).filter(Boolean))].slice(0, 3)
          
          return {
            ...fallback,
            image: imageUrl,
            subtitle: brands.length > 0 ? brands.join(' · ') : fallback.subtitle,
          }
        }

        setCategories([
          buildCard(grouped.bolsos, FALLBACK_CATEGORIES[0], 0),
          buildCard(grouped.vestidos, FALLBACK_CATEGORIES[1], 1),
          buildCard(grouped.billeteras, FALLBACK_CATEGORIES[2], 2),
        ])
      } catch (error) {
        console.warn('Usando categorías fallback:', error)
      }
    }

    fetchCategories()
  }, [])

  // Intersection Observer para animación
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #FFF8F5 0%, #FDF0F3 50%, #F2C4CE20 100%)',
        padding: 'clamp(5rem, 12vh, 10rem) 0',
        position: 'relative',
      }}
    >
      {/* ── Fondo con efectos cinematográficos ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Gradientes base */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 80% 60% at 20% 30%, rgba(212,120,138,0.08) 0%, transparent 60%),
              radial-gradient(ellipse 60% 70% at 80% 70%, rgba(201,168,76,0.06) 0%, transparent 50%),
              radial-gradient(ellipse 50% 50% at 50% 50%, rgba(242,196,206,0.05) 0%, transparent 60%)
            `,
          }}
        />

        {/* Partículas brillantes animadas */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full blur-3xl animate-float"
            style={{
              width: `${200 + i * 80}px`,
              height: `${200 + i * 80}px`,
              background: `radial-gradient(circle, ${i % 2 === 0 ? 'rgba(212,120,138,0.08)' : 'rgba(201,168,76,0.06)'} 0%, transparent 70%)`,
              top: `${10 + (i * 15)}%`,
              left: `${5 + (i * 18)}%`,
              animationDuration: `${8 + i * 2}s`,
              animationDelay: `${i * 0.5}s`,
            }}
          />
        ))}

        {/* Líneas decorativas doradas */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent 0px,
              transparent 50px,
              rgba(201,168,76,0.03) 50px,
              rgba(201,168,76,0.03) 51px,
              transparent 51px,
              transparent 100px
            )`,
          }}
        />
      </div>

      <div className="relative max-w-screen-2xl mx-auto px-6 lg:px-12">
        {/* ── HEADER ESPECTACULAR ── */}
        <div
          className="mb-16 lg:mb-20"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
            transition: 'all 1s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <div className="flex-1">
              {/* Label */}
              <div className="flex items-center gap-4 mb-5">
                <div
                  style={{
                    width: '40px',
                    height: '2px',
                    background: 'linear-gradient(90deg, #D4788A, #C9A84C)',
                    boxShadow: '0 0 16px rgba(212,120,138,0.4)',
                  }}
                />
                <span
                  style={{
                    color: '#D4788A',
                    fontSize: '0.65rem',
                    letterSpacing: '0.35em',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    fontFamily: 'var(--font-sans)',
                  }}
                >
                  Colecciones Exclusivas
                </span>
              </div>

              {/* Título principal */}
              <h2
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                  fontWeight: 300,
                  letterSpacing: '-0.02em',
                  lineHeight: 1.08,
                  color: '#1A1118',
                  marginBottom: '1rem',
                }}
              >
                Explora por{' '}
                <span
                  style={{
                    fontStyle: 'italic',
                    background: 'linear-gradient(135deg, #D4788A 0%, #B85268 40%, #C9A84C 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    backgroundSize: '200% 200%',
                    animation: 'gradientShift 6s ease infinite',
                  }}
                >
                  categoría
                </span>
              </h2>

              {/* Línea decorativa */}
              <div
                style={{
                  width: '80px',
                  height: '1px',
                  background: 'linear-gradient(90deg, rgba(212,120,138,0.4), transparent)',
                }}
              />
            </div>

            {/* Descripción */}
            <p
              className="lg:text-right"
              style={{
                fontSize: '0.95rem',
                fontWeight: 300,
                color: 'rgba(154,116,128,0.8)',
                lineHeight: 1.8,
                maxWidth: '420px',
                fontFamily: 'var(--font-sans)',
                paddingLeft: '2rem',
                borderLeft: '2px solid rgba(212,120,138,0.2)',
              }}
            >
              Piezas cuidadosamente seleccionadas y importadas directamente desde 
              <span style={{ color: '#D4788A', fontWeight: 400 }}> Estados Unidos</span>. 
              Calidad y estilo que trascienden tendencias.
            </p>
          </div>
        </div>

        {/* ── GRID ASIMÉTRICO PREMIUM ── */}
        <div className="hidden lg:grid gap-6" style={{ gridTemplateColumns: '1.2fr 1fr', gridTemplateRows: '520px 520px' }}>
          {/* Carta grande izquierda */}
          <div className="row-span-2" style={{ position: 'relative' }}>
            <CategoryCard cat={categories[0]} index={0} isLarge={true} />
          </div>
          
          {/* Cartas pequeñas derecha */}
          <div style={{ position: 'relative' }}>
            <CategoryCard cat={categories[1]} index={1} isLarge={false} />
          </div>
          <div style={{ position: 'relative' }}>
            <CategoryCard cat={categories[2]} index={2} isLarge={false} />
          </div>
        </div>

        {/* ── Mobile: Stack vertical ── */}
        <div className="lg:hidden flex flex-col gap-6">
          {categories.map((cat, idx) => (
            <div
              key={idx}
              style={{
                position: 'relative',
                aspectRatio: '4/5',
                minHeight: '420px',
              }}
            >
              <CategoryCard cat={cat} index={idx} isLarge={false} />
            </div>
          ))}
        </div>

        {/* ── CTA Inferior Espectacular ── */}
        <div
          className="flex justify-center mt-16 lg:mt-20"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
            transition: 'all 1s cubic-bezier(0.16, 1, 0.3, 1) 0.4s',
          }}
        >
          <Link
            to="/"
            className="group relative inline-flex items-center gap-4 px-8 py-4 overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #1A1118 0%, #2D2030 100%)',
              color: '#FFF8F5',
              fontFamily: 'var(--font-sans)',
              fontSize: '0.7rem',
              fontWeight: 600,
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              borderRadius: '30px',
              boxShadow: '0 12px 48px rgba(26,17,24,0.3), 0 0 0 1px rgba(212,120,138,0.2)',
              transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
              textDecoration: 'none',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)'
              e.currentTarget.style.boxShadow = '0 20px 64px rgba(212,120,138,0.35), 0 0 0 1px rgba(212,120,138,0.4)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)'
              e.currentTarget.style.boxShadow = '0 12px 48px rgba(26,17,24,0.3), 0 0 0 1px rgba(212,120,138,0.2)'
            }}
          >
            {/* Efecto de brillo */}
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
                transform: 'translateX(-100%)',
                transition: 'transform 0.8s ease',
              }}
            />
            
            <span className="relative z-10">Ver Toda la Colección</span>
            <span
              className="relative z-10 text-xl transition-transform duration-500 group-hover:translate-x-2"
              style={{ display: 'inline-block' }}
            >
              →
            </span>
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { opacity: 0.3; transform: translateY(0px) scale(1); }
          50% { opacity: 0.6; transform: translateY(-30px) scale(1.05); }
        }
        .animate-float {
          animation: float ease-in-out infinite;
        }
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </section>
  )
}

// ─── Componente CategoryCard (sin cambios) ────────────────────────────────
const CategoryCard = ({ cat, index, isLarge }) => {
  const [hovered, setHovered] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const cardRef = useRef(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), index * 150)
          observer.disconnect()
        }
      },
      { threshold: 0.2 }
    )
    if (cardRef.current) observer.observe(cardRef.current)
    return () => observer.disconnect()
  }, [index])

  const handleMouseMove = (e) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    setMousePos({ x, y })
  }

  return (
    <Link
      to={cat.link}
      className="group relative block overflow-hidden w-full h-full"
      aria-label={`Explorar ${cat.title} ${cat.titleAccent}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseMove={handleMouseMove}
      ref={cardRef}
      style={{
        borderRadius: '4px',
        transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(40px) scale(0.98)',
        opacity: isVisible ? 1 : 0,
        transition: `all 1s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.1}s`,
        boxShadow: hovered 
          ? '0 25px 80px rgba(212,120,138,0.25), 0 10px 40px rgba(0,0,0,0.2)' 
          : '0 8px 32px rgba(0,0,0,0.08)',
      }}
    >
      {/* ── Imagen con efecto parallax ── */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          src={cat.image}
          alt={cat.title}
          className="w-full h-full object-cover"
          style={{
            transform: hovered 
              ? `scale(1.15) translate(${(mousePos.x - 0.5) * -10}px, ${(mousePos.y - 0.5) * -10}px)` 
              : 'scale(1)',
            transition: 'transform 1.5s cubic-bezier(0.16, 1, 0.3, 1)',
            filter: hovered ? 'brightness(0.85) saturate(1.1)' : 'brightness(0.92) saturate(1)',
          }}
          loading="lazy"
        />
      </div>

      {/* ── Overlay gradiente cinematográfico ── */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(${cat.accent === 'left' ? '135deg' : '225deg'}, 
            rgba(26,17,24,0.95) 0%, 
            rgba(26,17,24,0.75) 30%, 
            rgba(26,17,24,0.45) 60%, 
            rgba(26,17,24,0.15) 100%
          )`,
          opacity: hovered ? 1 : 0.75,
          transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      />

      {/* ── Glow dinámico que sigue al mouse ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at ${mousePos.x * 100}% ${mousePos.y * 100}%, 
            rgba(212,120,138,0.25) 0%, 
            rgba(201,168,76,0.1) 30%, 
            transparent 70%)`,
          opacity: hovered ? 1 : 0,
          transition: 'opacity 0.6s ease',
        }}
      />

      {/* ── Efecto de brillo sweep ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)',
          transform: hovered ? 'translateX(150%)' : 'translateX(-150%)',
          transition: 'transform 1.5s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      />

      {/* ── Número editorial gigante ── */}
      <div
        className="absolute top-6 left-6"
        style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: isLarge ? 'clamp(4rem, 8vw, 6rem)' : 'clamp(3rem, 5vw, 4.5rem)',
          fontWeight: 300,
          fontStyle: 'italic',
          color: 'rgba(242,196,206,0.08)',
          letterSpacing: '-0.04em',
          lineHeight: 1,
          opacity: hovered ? 1 : 0.3,
          transform: hovered ? 'scale(1.1) translateY(-5px)' : 'scale(1) translateY(0)',
          transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
          textShadow: '0 0 40px rgba(212,120,138,0.15)',
          userSelect: 'none',
        }}
      >
        {cat.num}
      </div>

      {/* ── Badge "Nuevo" o "Popular" ── */}
      {index === 0 && (
        <div
          className="absolute top-6 right-6"
          style={{
            background: 'linear-gradient(135deg, rgba(212,120,138,0.95), rgba(184,82,104,0.95))',
            color: 'white',
            padding: '0.4rem 1rem',
            borderRadius: '20px',
            fontSize: '0.55rem',
            fontWeight: 600,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            boxShadow: '0 4px 16px rgba(212,120,138,0.4)',
            transform: hovered ? 'scale(1.05)' : 'scale(1)',
            transition: 'transform 0.4s ease',
          }}
        >
          Más Popular
        </div>
      )}

      {/* ── Contenido principal ── */}
      <div
        className="absolute inset-0 flex flex-col justify-end p-6 lg:p-10"
        style={{
          transform: hovered ? 'translateY(-8px)' : 'translateY(0)',
          transition: 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Línea decorativa animada */}
        <div
          style={{
            width: hovered ? '60px' : '32px',
            height: '2px',
            background: 'linear-gradient(90deg, #D4788A, #C9A84C)',
            marginBottom: '1.25rem',
            transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
            boxShadow: '0 0 12px rgba(212,120,138,0.4)',
          }}
        />

        {/* Subtítulo */}
        <p
          className="mb-2"
          style={{
            color: 'rgba(242,196,206,0.7)',
            fontSize: '0.65rem',
            letterSpacing: '0.3em',
            fontWeight: 500,
            textTransform: 'uppercase',
            fontFamily: 'var(--font-sans)',
            opacity: hovered ? 1 : 0.7,
            transition: 'opacity 0.5s ease',
          }}
        >
          {cat.subtitle}
        </p>

        {/* Título principal */}
        <h3
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: isLarge ? 'clamp(2.5rem, 4vw, 3.5rem)' : 'clamp(2rem, 3vw, 2.8rem)',
            fontWeight: 300,
            letterSpacing: '-0.02em',
            color: '#FFF8F5',
            lineHeight: 1.05,
            marginBottom: '0.75rem',
          }}
        >
          {cat.title}{' '}
          <span
            style={{
              fontStyle: 'italic',
              background: 'linear-gradient(135deg, #E298A6 0%, #F5BECA 40%, #C9A84C 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              backgroundSize: '200% 200%',
              animation: hovered ? 'gradientShift 3s ease infinite' : 'none',
            }}
          >
            {cat.titleAccent}
          </span>
        </h3>

        {/* Descripción revelable */}
        <div
          style={{
            overflow: 'hidden',
            maxHeight: hovered ? '80px' : '0',
            opacity: hovered ? 1 : 0,
            transition: 'max-height 0.7s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.6s ease',
            marginBottom: hovered ? '1.5rem' : '0',
          }}
        >
          <p
            style={{
              fontSize: '0.9rem',
              fontWeight: 300,
              color: 'rgba(255,248,245,0.75)',
              lineHeight: 1.7,
              fontFamily: 'var(--font-sans)',
              maxWidth: '90%',
            }}
          >
            {cat.description}
          </p>
        </div>

        {/* CTA con flecha animada */}
        <div
          className="flex items-center gap-4"
          style={{
            transform: hovered ? 'translateX(0)' : 'translateX(-8px)',
            opacity: hovered ? 1 : 0.8,
            transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <span
            style={{
              color: '#F2C4CE',
              fontSize: '0.65rem',
              fontWeight: 600,
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              fontFamily: 'var(--font-sans)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            <span>Explorar Colección</span>
            <span
              style={{
                display: 'inline-block',
                transform: hovered ? 'translateX(6px)' : 'translateX(0)',
                transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                fontSize: '1.2rem',
              }}
            >
              →
            </span>
          </span>
        </div>
      </div>

      {/* ── Borde brillante animado ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          border: `2px solid ${hovered ? 'rgba(212,120,138,0.4)' : 'rgba(212,120,138,0.1)'}`,
          borderRadius: '4px',
          transition: 'border-color 0.6s ease',
          boxShadow: hovered ? 'inset 0 0 40px rgba(212,120,138,0.15)' : 'none',
        }}
      />

      <style>{`
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </Link>
  )
}

export default CategoriesSection