import { useState, useEffect, useRef } from 'react'
import logoKB from '/kb.png'

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
  ivory: '#FDF8F4',
  cream: '#FAF3ED',
  // Acentos
  gold: '#C9A961',
  goldSoft: '#D4B87A',
  coral: '#FF8E72',
  // Textos
  ink: '#2D1F26',
  textMain: '#4A3340',
  textSoft: '#8B6F7A',
}

// ─── Datos ───────────────────────────────────────────────────────────────────
const checkItems = [
  {
    label: 'Productos 100% Originales',
    sub: 'Guess · Tommy Hilfiger · Calvin Klein · Michael Kors',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    ),
  },
  {
    label: 'Envíos a Todo el Perú',
    sub: 'Delivery seguro y rápido a cualquier ciudad',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
    ),
  },
  {
    label: 'Atención Personalizada',
    sub: 'Te ayudamos a encontrar exactamente lo que buscas',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    ),
  },
]

const stats = [
  { n: 500, s: '+', l: 'Productos importados' },
  { n: 8, s: '', l: 'Años de experiencia' },
  { n: 100, s: '%', l: 'Originales garantizados' },
  { n: 24, s: 'h', l: 'Tiempo de respuesta' },
]

const brands = [
  'GUESS', 'TOMMY HILFIGER', 'CALVIN KLEIN', 'MICHAEL KORS',
  'COACH', 'RALPH LAUREN', 'KATE SPADE',
]

// ─── Subcomponentes ──────────────────────────────────────────────────────────

// Texto que se revela palabra por palabra
const SplitText = ({ text, delay = 0, inView, className = '', style = {} }) => {
  const words = text.split(' ')
  return (
    <span className={`inline-flex flex-wrap gap-x-[0.3em] overflow-hidden align-baseline ${className}`} style={style}>
      {words.map((w, i) => (
        <span
          key={i}
          className="inline-block will-change-transform"
          style={{
            transform: inView ? 'translateY(0)' : 'translateY(110%)',
            opacity: inView ? 1 : 0,
            transition: `transform 0.9s cubic-bezier(0.16, 1, 0.3, 1) ${delay + i * 0.08}s, opacity 0.9s ease ${delay + i * 0.08}s`,
          }}
        >
          {w}
        </span>
      ))}
    </span>
  )
}

// Contador animado
const AnimatedCounter = ({ end, suffix = '', duration = 2000, inView }) => {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!inView) return
    let start = 0
    const startTime = performance.now()
    let rafId
    const tick = (now) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      // easing out-cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * end))
      if (progress < 1) rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [inView, end, duration])
  return <>{count}{suffix}</>
}

// Botón con cursor magnético
const MagneticButton = ({ href, children }) => {
  const ref = useRef(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [hover, setHover] = useState(false)

  const handleMove = (e) => {
    const r = ref.current.getBoundingClientRect()
    const x = (e.clientX - r.left - r.width / 2) * 0.35
    const y = (e.clientY - r.top - r.height / 2) * 0.35
    setPos({ x, y })
  }
  const reset = () => setPos({ x: 0, y: 0 })

  return (
    <a
      ref={ref}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onMouseMove={handleMove}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { reset(); setHover(false) }}
      className="group relative inline-flex items-center gap-3 overflow-hidden will-change-transform"
      style={{
        transform: `translate(${pos.x}px, ${pos.y}px)`,
        transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        padding: '1.15rem 2.6rem',
        background: `linear-gradient(135deg, ${p.roseVivid} 0%, ${p.coral} 60%, ${p.goldSoft} 100%)`,
        color: p.ivory,
        fontSize: '0.72rem',
        fontWeight: 600,
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        borderRadius: '999px',
        boxShadow: hover
          ? `0 18px 50px ${p.roseVivid}55, 0 0 0 1px ${p.goldSoft}40`
          : `0 10px 35px ${p.roseVivid}40`,
      }}
    >
      <span
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.25) 50%, transparent 100%)',
          transform: hover ? 'translateX(100%)' : 'translateX(-100%)',
          transition: 'transform 0.9s ease',
        }}
      />
      <svg className="w-4 h-4 relative z-10" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.76 1-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297 A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
      <span className="relative z-10">{children}</span>
    </a>
  )
}

// Marquee de marcas
const BrandMarquee = () => (
  <div
    className="relative overflow-hidden py-5"
    style={{
      borderTop: `1px solid ${p.champagne}50`,
      borderBottom: `1px solid ${p.champagne}50`,
      background: `linear-gradient(90deg, ${p.cream} 0%, ${p.ivory} 50%, ${p.cream} 100%)`,
    }}
  >
    <div
      className="flex whitespace-nowrap"
      style={{ animation: 'kbMarquee 30s linear infinite' }}
    >
      {[...brands, ...brands, ...brands].map((b, i) => (
        <span
          key={i}
          className="mx-10 font-light tracking-[0.35em] text-[0.95rem]"
          style={{
            color: p.champagne,
            fontFamily: 'Georgia, "Times New Roman", serif',
          }}
        >
          {b}
          <span className="ml-10" style={{ color: p.goldSoft }}>✦</span>
        </span>
      ))}
    </div>
  </div>
)

// Blob morphing de fondo (reemplaza pétalos)
const MorphingBlob = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <svg
      className="absolute top-1/2 left-1/2 opacity-[0.35]"
      style={{
        width: 'min(90vw, 900px)',
        height: 'min(90vw, 900px)',
        transform: 'translate(-50%, -50%)',
        filter: 'blur(50px)',
      }}
      viewBox="0 0 800 800"
    >
      <defs>
        <linearGradient id="kbBlobGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={p.roseBlush} />
          <stop offset="50%" stopColor={p.champagne} />
          <stop offset="100%" stopColor={p.coral} />
        </linearGradient>
      </defs>
      <path fill="url(#kbBlobGrad)">
        <animate
          attributeName="d"
          dur="18s"
          repeatCount="indefinite"
          values="
            M400,300 Q520,220 620,320 T600,520 Q500,620 380,520 T200,420 Q280,300 400,300 Z;
            M400,260 Q560,240 620,360 T560,560 Q440,620 340,520 T200,380 Q260,280 400,260 Z;
            M400,300 Q520,220 620,320 T600,520 Q500,620 380,520 T200,420 Q280,300 400,300 Z
          "
        />
      </path>
    </svg>
  </div>
)

// ─── Componente principal ────────────────────────────────────────────────────
const TrustSection = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const sectionRef = useRef(null)

  // Intersection Observer
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setIsVisible(true)
          obs.disconnect()
        }
      },
      { threshold: 0.15 }
    )
    if (sectionRef.current) obs.observe(sectionRef.current)
    return () => obs.disconnect()
  }, [])

  // Scroll progress (para línea dorada decorativa)
  useEffect(() => {
    const onScroll = () => {
      if (!sectionRef.current) return
      const r = sectionRef.current.getBoundingClientRect()
      const vh = window.innerHeight
      const progress = Math.min(Math.max((vh - r.top) / (vh + r.height), 0), 1)
      setScrollProgress(progress)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <section
      ref={sectionRef}
      id="nosotros"
      className="relative overflow-hidden"
      style={{
        background: `linear-gradient(180deg, ${p.cream} 0%, ${p.ivory} 50%, ${p.cream} 100%)`,
        padding: 'clamp(5rem, 12vh, 9rem) 0 clamp(4rem, 8vh, 6rem)',
        fontFamily: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Textura de grano sutil (film look) */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04] mix-blend-multiply"
        style={{
          backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.5'/></svg>")`,
        }}
      />

      {/* Blob morphing de fondo */}
      <MorphingBlob />

      {/* Línea dorada de progreso decorativa (lateral) */}
      <div
        className="absolute left-6 top-0 bottom-0 w-px pointer-events-none hidden lg:block"
        style={{ background: `${p.champagne}30` }}
      >
        <div
          className="w-full origin-top"
          style={{
            height: `${scrollProgress * 100}%`,
            background: `linear-gradient(180deg, ${p.goldSoft}, ${p.roseVivid})`,
            boxShadow: `0 0 12px ${p.goldSoft}60`,
            transition: 'height 0.1s linear',
          }}
        />
      </div>

      {/* ─── Contenido ─── */}
      <div className="relative max-w-screen-xl mx-auto px-6 lg:px-12">

        {/* ─── HEADER EDITORIAL ─── */}
        <div className="mb-16 lg:mb-24 max-w-3xl">
          <div
            className="flex items-center gap-4 mb-6"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
              transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <span
              className="h-px w-12"
              style={{ background: `linear-gradient(90deg, ${p.gold}, transparent)` }}
            />
            <span
              className="text-[0.68rem] tracking-[0.4em] uppercase font-medium"
              style={{ color: p.roseDeep, letterSpacing: '0.4em' }}
            >
              Atelier · Est. 2018
            </span>
          </div>

          <h2
            className="font-light leading-[1.05] tracking-[-0.02em]"
            style={{
              fontSize: 'clamp(2.2rem, 5.5vw, 4.5rem)',
              color: p.ink,
              fontFamily: 'Georgia, "Times New Roman", serif',
            }}
          >
            <SplitText text="Moda importada" inView={isVisible} />
            <br />
            <SplitText text="desde" inView={isVisible} delay={0.35} />{' '}
            <span
              style={{
                fontStyle: 'italic',
                background: `linear-gradient(135deg, ${p.roseVivid} 0%, ${p.coral} 50%, ${p.gold} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              <SplitText text="EE.UU." inView={isVisible} delay={0.5} />
            </span>
          </h2>

          <p
            className="mt-8 text-[1.05rem] leading-[1.8] max-w-xl font-light"
            style={{
              color: p.textSoft,
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
              transition: 'all 1s cubic-bezier(0.16, 1, 0.3, 1) 0.8s',
            }}
          >
            En <strong style={{ color: p.textMain, fontWeight: 500 }}>KB Dresses & More</strong> curamos lo último en tendencias directamente desde Estados Unidos. Carteras, vestidos de fiesta, billeteras y accesorios de las mejores marcas del mundo — seleccionados para ti.
          </p>
        </div>

        {/* ─── GRID ASIMÉTRICO ─── */}
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-start">

          {/* COLUMNA IZQUIERDA — Card editorial del logo */}
          <div
            className="lg:col-span-5 relative"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
              transition: 'all 1.1s cubic-bezier(0.16, 1, 0.3, 1) 0.3s',
            }}
          >
            {/* Marco dorado */}
            <div
              className="relative p-8 lg:p-10"
              style={{
                background: `linear-gradient(135deg, ${p.ivory} 0%, ${p.roseMist}40 100%)`,
                border: `1px solid ${p.champagne}60`,
                borderRadius: '4px',
                boxShadow: `
                  0 30px 80px -20px ${p.roseBlush}30,
                  0 10px 30px -10px ${p.ink}10,
                  inset 0 1px 0 ${p.ivory}
                `,
              }}
            >
              {/* Esquinas decorativas doradas */}
              {['top-0 left-0 border-t border-l', 'top-0 right-0 border-t border-r', 'bottom-0 left-0 border-b border-l', 'bottom-0 right-0 border-b border-r'].map((pos, i) => (
                <span
                  key={i}
                  className={`absolute w-6 h-6 ${pos}`}
                  style={{ borderColor: p.gold, margin: '8px' }}
                />
              ))}

              {/* Badge "100% Original" */}
              <div
                className="absolute -top-3 -right-3 px-4 py-1.5 text-[0.6rem] tracking-[0.25em] uppercase font-semibold"
                style={{
                  background: `linear-gradient(135deg, ${p.gold}, ${p.goldSoft})`,
                  color: p.ink,
                  borderRadius: '2px',
                  boxShadow: `0 6px 20px ${p.gold}50`,
                  letterSpacing: '0.25em',
                }}
              >
                100% Original
              </div>

              {/* Logo */}
              <div className="relative py-8 flex items-center justify-center">
                <img
                  src={logoKB}
                  alt="KB Dresses and More"
                  className="w-full object-contain"
                  style={{
                    maxHeight: '110px',
                    filter: 'drop-shadow(0 4px 20px rgba(201, 96, 127, 0.15))',
                  }}
                />
              </div>

              {/* Divider */}
              <div
                className="my-6 h-px"
                style={{ background: `linear-gradient(90deg, transparent, ${p.champagne}, transparent)` }}
              />

              {/* Contacto */}
              <div className="space-y-4">
                {[
                  {
                    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" />,
                    label: 'Tienda física',
                    value: 'Galería Chiclayo · 2do Piso',
                  },
                  {
                    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />,
                    label: 'WhatsApp',
                    value: '+51 906 877 812',
                    href: 'https://wa.me/51906877812',
                  },
                ].map((item, i) => {
                  const Tag = item.href ? 'a' : 'div'
                  return (
                    <Tag
                      key={i}
                      href={item.href}
                      target={item.href ? '_blank' : undefined}
                      rel={item.href ? 'noopener noreferrer' : undefined}
                      className="flex items-center gap-4 group transition-all duration-300 hover:translate-x-1"
                    >
                      <div
                        className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-6"
                        style={{
                          background: `linear-gradient(135deg, ${p.roseMist}, ${p.champagneLt})`,
                          border: `1px solid ${p.champagne}80`,
                          boxShadow: `0 4px 14px ${p.roseBlush}20`,
                        }}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" style={{ color: p.roseDeep }}>
                          {item.icon}
                        </svg>
                      </div>
                      <div>
                        <p className="text-[0.6rem] tracking-[0.25em] uppercase font-semibold mb-0.5" style={{ color: p.textSoft, letterSpacing: '0.25em' }}>
                          {item.label}
                        </p>
                        <p className="text-[0.92rem] font-light" style={{ color: p.textMain }}>
                          {item.value}
                        </p>
                      </div>
                    </Tag>
                  )
                })}
              </div>

              {/* Firma KB */}
              <div className="mt-8 pt-6 flex items-baseline gap-3" style={{ borderTop: `1px solid ${p.champagne}40` }}>
                <span
                  className="text-4xl font-light tracking-tight"
                  style={{
                    fontFamily: 'Georgia, serif',
                    fontStyle: 'italic',
                    color: p.roseDeep,
                  }}
                >
                  KB
                </span>
                <span className="text-[0.6rem] tracking-[0.3em] uppercase" style={{ color: p.textSoft, letterSpacing: '0.3em' }}>
                  Dresses & More
                </span>
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA — Features + CTA */}
          <div
            className="lg:col-span-7 space-y-8"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
              transition: 'all 1.1s cubic-bezier(0.16, 1, 0.3, 1) 0.5s',
            }}
          >
            {/* Features cards */}
            <div className="grid sm:grid-cols-3 gap-4">
              {checkItems.map((item, i) => (
                <div
                  key={i}
                  className="group relative p-6 transition-all duration-500 hover:-translate-y-1"
                  style={{
                    background: `${p.ivory}CC`,
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${p.champagne}50`,
                    borderRadius: '4px',
                    boxShadow: `0 4px 20px ${p.ink}05`,
                    transitionDelay: `${i * 0.05}s`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = `${p.goldSoft}80`
                    e.currentTarget.style.boxShadow = `0 20px 50px -10px ${p.roseBlush}40, 0 0 0 1px ${p.goldSoft}40`
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = `${p.champagne}50`
                    e.currentTarget.style.boxShadow = `0 4px 20px ${p.ink}05`
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center mb-4"
                    style={{
                      background: `linear-gradient(135deg, ${p.roseMist}, ${p.champagneLt})`,
                      border: `1px solid ${p.champagne}80`,
                    }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" style={{ color: p.roseDeep }}>
                      {item.icon}
                    </svg>
                  </div>
                  <h3 className="text-[0.95rem] font-medium mb-1.5" style={{ color: p.textMain }}>
                    {item.label}
                  </h3>
                  <p className="text-[0.78rem] font-light leading-relaxed" style={{ color: p.textSoft }}>
                    {item.sub}
                  </p>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div
              className="grid grid-cols-2 sm:grid-cols-4 gap-6 py-8 px-6"
              style={{
                background: `linear-gradient(135deg, ${p.ivory}AA, ${p.roseMist}30)`,
                border: `1px solid ${p.champagne}50`,
                borderRadius: '4px',
                backdropFilter: 'blur(10px)',
              }}
            >
              {stats.map((s, i) => (
                <div key={i} className="text-center relative">
                  {i > 0 && (
                    <div
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-px h-10 hidden sm:block"
                      style={{ background: `linear-gradient(180deg, transparent, ${p.champagne}, transparent)` }}
                    />
                  )}
                  <div
                    className="text-3xl lg:text-4xl font-light mb-1"
                    style={{
                      fontFamily: 'Georgia, serif',
                      color: p.roseDeep,
                    }}
                  >
                    <AnimatedCounter end={s.n} suffix={s.s} inView={isVisible} />
                  </div>
                  <div
                    className="text-[0.6rem] tracking-[0.2em] uppercase font-medium"
                    style={{ color: p.textSoft, letterSpacing: '0.2em' }}
                  >
                    {s.l}
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <MagneticButton href="https://wa.me/51906877812">
                Escríbenos por WhatsApp
              </MagneticButton>
              <p className="text-[0.78rem] font-light" style={{ color: p.textSoft }}>
                Respuesta en menos de <strong style={{ color: p.roseDeep }}>24 horas</strong>
              </p>
            </div>
          </div>
        </div>

        {/* ─── MARQUEE DE MARCAS ─── */}
        <div className="mt-20 lg:mt-28">
          <BrandMarquee />
        </div>
      </div>

      {/* ─── KEYFRAMES ─── */}
      <style>{`
        @keyframes kbMarquee {
          from { transform: translateX(0); }
          to { transform: translateX(-33.333%); }
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

export default TrustSection