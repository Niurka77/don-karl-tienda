import logoKB from '/kb.png'
import { useState, useEffect, useRef } from 'react'

const checkItems = [
  {
    label: 'Productos 100% Originales',
    sub: 'Guess, Tommy Hilfiger, Calvin Klein, Michael Kors',
  },
  {
    label: 'Envíos a Todo el Perú',
    sub: 'Delivery seguro y rápido a cualquier ciudad',
  },
  {
    label: 'Atención Personalizada',
    sub: 'Te ayudamos a encontrar lo que buscas',
  },
]

const TrustSection = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const sectionRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.2 }
    )
    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }
    return () => observer.disconnect()
  }, [])

  // Parallax con mouse
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

  return (
    <section
      ref={sectionRef}
      id="nosotros"
      className="relative overflow-hidden"
      style={{
        background: 'var(--color-kb-obsidian)',
        padding: 'clamp(5rem, 12vh, 10rem) 0',
      }}
    >
      {/* ── Fondo con texturas vivas y parallax ── */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Base oscura con gradiente cálido */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 80% 70% at 0% 50%, rgba(212,120,138,0.12) 0%, transparent 60%),
              radial-gradient(ellipse 60% 60% at 100% 30%, rgba(201,168,76,0.10) 0%, transparent 50%),
              radial-gradient(ellipse 50% 50% at 50% 80%, rgba(184,82,104,0.08) 0%, transparent 50%)
            `,
            transform: `translate(${mousePosition.x * 10}px, ${mousePosition.y * 10}px)`,
            transition: 'transform 0.3s ease-out',
          }}
        />

        {/* Partículas brillantes animadas con parallax */}
        <div
          className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full blur-3xl animate-pulse-glow"
          style={{
            background: 'radial-gradient(circle, rgba(212,120,138,0.18) 0%, transparent 70%)',
            animationDuration: '4s',
            transform: `translate(${mousePosition.x * -20}px, ${mousePosition.y * -20}px)`,
            transition: 'transform 0.3s ease-out',
          }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse-glow"
          style={{
            background: 'radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 70%)',
            animationDuration: '5s',
            animationDelay: '1s',
            transform: `translate(${mousePosition.x * 15}px, ${mousePosition.y * 15}px)`,
            transition: 'transform 0.3s ease-out',
          }}
        />
        <div
          className="absolute top-3/4 left-1/3 w-56 h-56 rounded-full blur-2xl animate-pulse-glow"
          style={{
            background: 'radial-gradient(circle, rgba(242,196,206,0.10) 0%, transparent 70%)',
            animationDuration: '3.5s',
            animationDelay: '0.5s',
            transform: `translate(${mousePosition.x * -12}px, ${mousePosition.y * -12}px)`,
            transition: 'transform 0.3s ease-out',
          }}
        />

        {/* Líneas decorativas doradas animadas */}
        <div
          className="absolute top-0 left-0 w-full h-full opacity-20"
          style={{
            backgroundImage: `
              repeating-linear-gradient(
                45deg,
                transparent 0px,
                transparent 40px,
                rgba(201,168,76,0.04) 40px,
                rgba(201,168,76,0.04) 41px,
                transparent 41px,
                transparent 80px
              )
            `,
          }}
        />

        {/* Textura de grano cinematográfica */}
        <div
          className="absolute inset-0 opacity-[0.02] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="relative max-w-screen-xl mx-auto px-6 lg:px-10">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* ── LADO IZQUIERDO: Tarjeta oscura con logo ── */}
          <div
            className="relative transform transition-all duration-700"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateX(0)' : 'translateX(-30px)',
            }}
          >
            {/* Línea decorativa vertical con brillo */}
            <div
              style={{
                position: 'absolute',
                left: '-20px',
                top: '10%',
                bottom: '10%',
                width: '1px',
                background: 'linear-gradient(180deg, transparent, rgba(212,120,138,0.5) 30%, rgba(201,168,76,0.5) 70%, transparent)',
                boxShadow: '0 0 20px rgba(212,120,138,0.2)',
              }}
            />

            {/* Tarjeta principal con glassmorphism mejorado */}
            <div
              className="relative overflow-hidden"
              style={{
                background: 'rgba(45,32,48,0.7)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: '1px solid rgba(212,120,138,0.2)',
                borderRadius: '2px',
                padding: 'clamp(2rem, 4vw, 2.8rem)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.4), 0 0 40px rgba(212,120,138,0.05)',
              }}
            >
              {/* Sutil glow interno */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'radial-gradient(ellipse at 30% 20%, rgba(212,120,138,0.04) 0%, transparent 60%)',
                }}
              />

         

<div
  style={{
    marginBottom: '2rem',
    paddingBottom: '2rem',
    borderBottom: '1px solid rgba(212,120,138,0.15)',
    position: 'relative',
  }}
>
  <div className="relative inline-block">
    <img
      src={logoKB}
      alt="KB Dresses and More"
      className="w-full object-contain"
      style={{
        maxHeight: '80px',
        // 🔥 SOLUCIÓN DEFINITIVA - Sin filtros raros
        filter: 'none',
      }}
    />
  </div>
</div>

              {/* Información de contacto */}
              <div className="space-y-5">
                {[
                  {
                    icon: (
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    ),
                    label: 'Tienda Física',
                    value: 'Galería Chiclayo — 2do Piso',
                  },
                  {
                    icon: (
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    ),
                    label: 'WhatsApp',
                    value: '+51 906 877 812',
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 group/item transition-all duration-300 hover:translate-x-1"
                  >
                    <div
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '50%',
                        flexShrink: 0,
                        border: '1px solid rgba(212,120,138,0.25)',
                        background: 'rgba(212,120,138,0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                        boxShadow: '0 0 20px rgba(212,120,138,0.05)',
                      }}
                      className="group-hover/item:bg-gradient-to-br group-hover/item:from-[#D4788A] group-hover/item:to-[#B85268]"
                    >
                      <svg
                        className="w-4 h-4 transition-colors duration-300"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        style={{ color: 'var(--color-kb-rose)' }}
                      >
                        {item.icon}
                      </svg>
                    </div>
                    <div>
                      <p
                        style={{
                          fontSize: '0.6rem',
                          fontWeight: 500,
                          letterSpacing: '0.2em',
                          textTransform: 'uppercase',
                          color: 'rgba(212,120,138,0.7)',
                          marginBottom: '2px',
                          fontFamily: 'var(--font-sans)',
                        }}
                      >
                        {item.label}
                      </p>
                      <p
                        style={{
                          fontSize: '0.9rem',
                          fontWeight: 300,
                          color: 'rgba(253,240,243,0.9)',
                          letterSpacing: '0.02em',
                          fontFamily: 'var(--font-sans)',
                        }}
                      >
                        {item.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Decoración KB con glow */}
              <div
                style={{
                  marginTop: '2rem',
                  paddingTop: '1.5rem',
                  borderTop: '1px solid rgba(212,120,138,0.1)',
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: '0.5rem',
                  position: 'relative',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '3rem',
                    fontWeight: 300,
                    letterSpacing: '-0.04em',
                    color: 'rgba(255,255,255,0.06)',
                    lineHeight: 1,
                    userSelect: 'none',
                    textShadow: '0 0 30px rgba(212,120,138,0.1)',
                  }}
                >
                  KB
                </span>
                <span
                  className="text-editorial"
                  style={{
                    color: 'rgba(212,120,138,0.3)',
                    fontSize: '0.6rem',
                    letterSpacing: '0.2em',
                  }}
                >
                  Dresses & More
                </span>
              </div>
            </div>
          </div>

          {/* ── LADO DERECHO: Texto editorial con más vitalidad ── */}
          <div
            className="transform transition-all duration-700 delay-200"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateX(0)' : 'translateX(30px)',
            }}
          >
            {/* Label con brillo */}
            <div className="flex items-center gap-3 mb-6">
              <span
                style={{
                  width: '24px',
                  height: '1px',
                  background: 'linear-gradient(90deg, var(--color-kb-rose), var(--color-kb-gold))',
                  display: 'inline-block',
                  boxShadow: '0 0 12px rgba(212,120,138,0.3)',
                }}
              />
              <span
                className="text-editorial"
                style={{
                  color: 'var(--color-kb-rose)',
                  fontSize: '0.62rem',
                  letterSpacing: '0.25em',
                  fontWeight: 500,
                }}
              >
                Sobre nosotros
              </span>
            </div>

            {/* Título con gradiente más vivo */}
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2rem, 4vw, 3.2rem)',
                fontWeight: 300,
                letterSpacing: '-0.02em',
                lineHeight: 1.08,
                color: 'var(--color-kb-ivory)',
                marginBottom: '1.5rem',
              }}
            >
              Moda importada desde{' '}
              <span
                style={{
                  fontStyle: 'italic',
                  background: 'linear-gradient(135deg, var(--color-kb-rose) 0%, var(--color-kb-gold) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  backgroundSize: '200% 200%',
                  animation: 'gradientShift 8s ease infinite',
                }}
              >
                EE.UU.
              </span>
            </h2>

            {/* Párrafo con texto más legible */}
            <p
              style={{
                fontSize: '0.95rem',
                fontWeight: 300,
                color: 'rgba(154,116,128,0.8)',
                lineHeight: 1.8,
                marginBottom: '2.5rem',
                maxWidth: '460px',
                fontFamily: 'var(--font-sans)',
              }}
            >
              En{' '}
              <strong
                style={{
                  color: 'rgba(242,196,206,0.85)',
                  fontWeight: 400,
                  background: 'linear-gradient(135deg, rgba(212,120,138,0.1), rgba(201,168,76,0.05))',
                  padding: '0 0.2rem',
                }}
              >
                KB Dresses & More
              </strong>{' '}
              nos especializamos en traer lo último en tendencias directamente desde Estados Unidos.
              Contamos con una amplia variedad de carteras, vestidos de fiesta, billeteras y accesorios
              de las mejores marcas.
            </p>

            {/* Lista de checks con iconos más brillantes */}
            <div className="space-y-5 mb-10">
              {checkItems.map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 group-check transition-all duration-300 hover:translate-x-1"
                  style={{
                    animation: isVisible ? `fadeUp 0.6s ease ${0.3 + i * 0.15}s forwards` : 'none',
                    opacity: 0,
                    transform: 'translateY(20px)',
                  }}
                >
                  <div
                    style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      flexShrink: 0,
                      marginTop: '2px',
                      border: '1px solid rgba(212,120,138,0.35)',
                      background: 'rgba(212,120,138,0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                      boxShadow: '0 0 16px rgba(212,120,138,0.05)',
                    }}
                    className="group-check-hover:bg-gradient-to-br group-check-hover:from-[#D4788A] group-check-hover:to-[#B85268]"
                  >
                    <svg
                      className="w-3 h-3 transition-colors duration-300"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      viewBox="0 0 24 24"
                      style={{ color: 'var(--color-kb-rose)' }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p
                      style={{
                        fontSize: '0.9rem',
                        fontWeight: 400,
                        color: 'rgba(253,240,243,0.9)',
                        marginBottom: '2px',
                        fontFamily: 'var(--font-sans)',
                      }}
                    >
                      {item.label}
                    </p>
                    <p
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 300,
                        color: 'rgba(154,116,128,0.65)',
                        letterSpacing: '0.02em',
                        fontFamily: 'var(--font-sans)',
                      }}
                    >
                      {item.sub}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Divisor con gradiente */}
            <div
              style={{
                height: '1px',
                background: 'linear-gradient(90deg, rgba(212,120,138,0.3), rgba(201,168,76,0.2), transparent)',
                marginBottom: '2rem',
                boxShadow: '0 0 20px rgba(212,120,138,0.05)',
              }}
            />

            {/* CTA WhatsApp con más brillo */}
            <a
              href="https://wa.me/51906877812"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 transition-all duration-500 group-cta"
              style={{
                padding: '0.9rem 2.2rem',
                background: 'linear-gradient(135deg, var(--color-kb-rose) 0%, var(--color-kb-rose-deep) 50%, var(--color-kb-gold) 100%)',
                color: 'white',
                fontSize: '0.68rem',
                fontWeight: 500,
                fontFamily: 'var(--font-sans)',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                borderRadius: '2px',
                boxShadow: '0 6px 28px rgba(212,120,138,0.35), 0 0 40px rgba(212,120,138,0.05)',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)'
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(212,120,138,0.5), 0 0 60px rgba(201,168,76,0.1)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)'
                e.currentTarget.style.boxShadow = '0 6px 28px rgba(212,120,138,0.35), 0 0 40px rgba(212,120,138,0.05)'
              }}
            >
              {/* Brillo animado sobre el botón */}
              <span
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)',
                  animation: 'btnShine 3s ease-in-out infinite',
                }}
              />
              <svg
                className="w-4 h-4 relative z-10"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              <span className="relative z-10">Escríbenos por WhatsApp</span>
            </a>
          </div>
        </div>
      </div>

      {/* ── Keyframes para animaciones ── */}
      <style>{`
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.05); }
        }
        .animate-pulse-glow {
          animation: pulse-glow ease-in-out infinite;
        }

        @keyframes logoShine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        @keyframes btnShine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        /* Hover effects para los items de la lista */
        .group-check:hover .group-check-hover\\:bg-gradient-to-br {
          background: linear-gradient(135deg, #D4788A, #B85268) !important;
        }
        .group-check:hover svg {
          color: white !important;
        }

        /* Efecto hover en el CTA */
        .group-cta:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 12px 40px rgba(212,120,138,0.5), 0 0 60px rgba(201,168,76,0.1);
        }
      `}</style>
    </section>
  )
}

export default TrustSection