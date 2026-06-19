import logoKB from '/kb.png'
import WhatsAppButton from '../ui/WhatsAppButton'
import { Outlet, Link, useNavigate } from 'react-router-dom'
import CartDrawer from '../carrito/CartDrawer'
import useCartStore from '../../store/cartStore'
import { useState, useEffect, useRef } from 'react'

// ─── Paleta Aurora Bloom — Editorial Edition ─────────────────────────────────
const p = {
  rose: '#E891A8',
  roseDeep: '#C9607F',
  roseVivid: '#FF5C8A',
  roseBlush: '#FFC2D4',
  roseMist: '#FFE8EF',
  peach: '#FFB088',
  coral: '#FF8E72',
  coralSoft: '#FFA78E',
  apricot: '#FFCBA4',
  cream: '#FFF5F0',
  ivory: '#FFFAF8',
  gold: '#C9A961',
  goldSoft: '#D4B87A',
  goldLight: '#F5E6A3',
  textMain: '#4A3340',
  textSoft: '#8B6F7A',
}

// ─── Pétalo decorativo flotante ──────────────────────────────────────────────
const FloatingPetal = ({ delay, left, size, color, duration }) => (
  <div
    className="absolute pointer-events-none z-50"
    style={{
      left: `${left}%`,
      top: '-20px',
      width: size,
      height: size * 1.3,
      borderRadius: '50% 0 50% 50%',
      background: color,
      opacity: 0.4,
      animation: `headerPetalFall ${duration}s linear infinite`,
      animationDelay: `${delay}s`,
      filter: 'blur(0.5px)',
    }}
  />
)

const Layout = () => {
  const navigate = useNavigate()
  const { toggleCart, getItemCount } = useCartStore()
  const itemCount = getItemCount()
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const headerRef = useRef(null)

  // ── Scroll effect ─────────────────────────────────────────────────────────
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // ── Mouse tracking para parallax sutil ────────────────────────────────────
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!headerRef.current) return
      const rect = headerRef.current.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width - 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5
      setMousePos({ x, y })
    }
    const el = headerRef.current
    if (el) {
      el.addEventListener('mousemove', handleMouseMove)
      return () => el.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  // ── Navegación con scroll suave ───────────────────────────────────────────
  const handleNavigateWithScroll = (url) => {
    setMobileMenuOpen(false)
    navigate(url)
    const timer = setTimeout(() => {
      const productGrid = document.getElementById('product-grid-section')
      if (productGrid) {
        const headerOffset = 140
        const elementPosition = productGrid.getBoundingClientRect().top
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset
        window.scrollTo({ top: offsetPosition, behavior: 'smooth' })
      }
    }, 500)
    return () => clearTimeout(timer)
  }

  const navItems = [
    { label: 'MUJER', action: () => handleNavigateWithScroll('/?genero=mujer') },
    { label: 'HOMBRE', action: () => handleNavigateWithScroll('/?genero=hombre') },
    { label: 'NOSOTROS', href: '/#nosotros' },
  ]

  // ─── Pétalos para el header ───────────────────────────────────────────────
  const petals = [
    { delay: 0, left: 10, size: 8, color: p.roseBlush, duration: 15 },
    { delay: 3, left: 25, size: 6, color: p.peach, duration: 18 },
    { delay: 6, left: 40, size: 7, color: p.coralSoft, duration: 16 },
    { delay: 9, left: 55, size: 5, color: p.roseMist, duration: 20 },
    { delay: 12, left: 70, size: 9, color: p.goldLight, duration: 17 },
    { delay: 15, left: 85, size: 6, color: p.apricot, duration: 19 },
  ]

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: `linear-gradient(180deg, ${p.ivory} 0%, ${p.cream} 100%)`,
      }}
    >
      {/* ════════════════════════════════════════════════════════════════════
          HEADER — Aurora Bloom Luxury
      ════════════════════════════════════════════════════════════════════ */}
      <header
        ref={headerRef}
        className="sticky top-0 z-50 transition-all duration-700"
        style={{
          background: scrolled
            ? `linear-gradient(180deg, ${p.ivory}F5 0%, ${p.cream}E0 100%)`
            : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          boxShadow: scrolled
            ? `0 4px 40px ${p.roseBlush}30, 0 0 0 1px ${p.roseBlush}20`
            : 'none',
        }}
      >
        {/* Pétalos flotantes decorativos */}
        {petals.map((petal, i) => (
          <FloatingPetal key={i} {...petal} />
        ))}

        {/* ── TOPBAR — Marquee elegante ─────────────────────────────────── */}
        <div
          className="overflow-hidden py-2"
          style={{
            background: `linear-gradient(90deg, ${p.roseVivid} 0%, ${p.coral} 30%, ${p.goldSoft} 60%, ${p.roseVivid} 100%)`,
            backgroundSize: '300% 100%',
            animation: 'topbarGradient 8s ease infinite',
            boxShadow: `0 2px 20px ${p.roseVivid}40`,
          }}
        >
          <div
            className="flex whitespace-nowrap"
            style={{
              animation: 'marqueeScroll 30s linear infinite',
            }}
          >
            {[
              '✦ Nueva Colección 2025',
              '✦ Envíos a Todo el Perú',
              '✦ Galería Chiclayo — 2do Piso',
              '✦ Moda Importada desde EE.UU.',
              '✦ 100% Originales',
              '✦ Atención Personalizada',
            ].map((text, i) => (
              <span
                key={i}
                className="px-8 whitespace-nowrap"
                style={{
                  color: p.ivory,
                  fontSize: '0.65rem',
                  letterSpacing: '0.2em',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  fontFamily: 'ui-sans-serif, system-ui, sans-serif',
                  textShadow: `0 1px 4px ${p.roseDeep}30`,
                }}
              >
                {text}
                <span className="mx-4" style={{ opacity: 0.6 }}>
                  ✦
                </span>
              </span>
            ))}
            {/* Duplicar para loop infinito */}
            {[
              '✦ Nueva Colección 2025',
              '✦ Envíos a Todo el Perú',
              '✦ Galería Chiclayo — 2do Piso',
              '✦ Moda Importada desde EE.UU.',
              '✦ 100% Originales',
              '✦ Atención Personalizada',
            ].map((text, i) => (
              <span
                key={`dup-${i}`}
                className="px-8 whitespace-nowrap"
                style={{
                  color: p.ivory,
                  fontSize: '0.65rem',
                  letterSpacing: '0.2em',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  fontFamily: 'ui-sans-serif, system-ui, sans-serif',
                }}
              >
                {text}
                <span className="mx-4" style={{ opacity: 0.6 }}>
                  ✦
                </span>
              </span>
            ))}
          </div>
        </div>

        {/* ── NAVBAR PRINCIPAL ──────────────────────────────────────────── */}
        <nav
          className={`transition-all duration-700 ${
            scrolled ? 'py-2' : 'py-5'
          }`}
        >
          <div className="max-w-screen-xl mx-auto px-6 lg:px-10">
            <div className="flex items-center justify-between">
              {/* LEFT — Navegación desktop */}
              <div className="hidden lg:flex items-center gap-10">
                {navItems.map((item, i) =>
                  item.href ? (
                    <a
                      key={i}
                      href={item.href}
                      className="group relative"
                      style={{
                        fontSize: '0.62rem',
                        letterSpacing: '0.25em',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        color: p.textSoft,
                        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
                        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = p.roseDeep
                        e.currentTarget.style.transform = 'translateY(-2px)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = p.textSoft
                        e.currentTarget.style.transform = 'translateY(0)'
                      }}
                    >
                      {item.label}
                      <span
                        className="absolute -bottom-1 left-0 w-0 h-px transition-all duration-400 group-hover:w-full"
                        style={{
                          background: `linear-gradient(90deg, ${p.roseVivid}, ${p.gold})`,
                          boxShadow: `0 0 8px ${p.roseVivid}60`,
                        }}
                      />
                    </a>
                  ) : (
                    <button
                      key={i}
                      onClick={item.action}
                      className="group relative"
                      style={{
                        fontSize: '0.62rem',
                        letterSpacing: '0.25em',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        color: p.textSoft,
                        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = p.roseDeep
                        e.currentTarget.style.transform = 'translateY(-2px)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = p.textSoft
                        e.currentTarget.style.transform = 'translateY(0)'
                      }}
                    >
                      {item.label}
                      <span
                        className="absolute -bottom-1 left-0 w-0 h-px transition-all duration-400 group-hover:w-full"
                        style={{
                          background: `linear-gradient(90deg, ${p.roseVivid}, ${p.gold})`,
                          boxShadow: `0 0 8px ${p.roseVivid}60`,
                        }}
                      />
                    </button>
                  )
                )}
              </div>

              {/* CENTER — Logo con efecto especial */}
              <Link
                to="/"
                className="absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0 lg:mx-auto group"
                style={{
                  transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                <div
                  className="relative"
                  style={{
                    transform: `perspective(1000px) rotateY(${mousePos.x * 5}deg) rotateX(${mousePos.y * -3}deg)`,
                    transition: 'transform 0.5s ease-out',
                  }}
                >
                  <img
                    src={logoKB}
                    alt="KB Dresses and More"
                    className={`object-contain transition-all duration-700 ${
                      scrolled ? 'h-12 md:h-14' : 'h-16 md:h-20'
                    }`}
                    style={{
                      filter: 'drop-shadow(0 4px 20px rgba(201, 96, 127, 0.2))',
                    }}
                  />
                  {/* Brillo barrido sobre el logo */}
                  <div
                    className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                    style={{
                      background:
                        'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.4) 50%, transparent 70%)',
                      animation: 'logoShine 3s ease-in-out infinite',
                    }}
                  />
                </div>
              </Link>

              {/* RIGHT — Acciones */}
              <div className="flex items-center gap-4">
                {/* AYUDA & CONTACTO — desktop */}
                <div className="hidden lg:flex items-center gap-6 mr-2">
                  <a
                    href="https://wa.me/51906877812?text=Hola,%20necesito%20ayuda%20con%20mi%20pedido"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: '0.6rem',
                      letterSpacing: '0.18em',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      color: p.textSoft,
                      fontFamily: 'ui-sans-serif, system-ui, sans-serif',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = p.roseVivid
                      e.currentTarget.style.transform = 'translateY(-1px)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = p.textSoft
                      e.currentTarget.style.transform = 'translateY(0)'
                    }}
                  >
                    AYUDA
                  </a>
                  <a
                    href="https://wa.me/51906877812?text=Hola,%20quiero%20contactar%20contigo"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: '0.6rem',
                      letterSpacing: '0.18em',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      color: p.textSoft,
                      fontFamily: 'ui-sans-serif, system-ui, sans-serif',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = p.roseVivid
                      e.currentTarget.style.transform = 'translateY(-1px)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = p.textSoft
                      e.currentTarget.style.transform = 'translateY(0)'
                    }}
                  >
                    CONTACTO
                  </a>
                </div>

                {/* Carrito */}
                <button
                  onClick={toggleCart}
                  className="relative group"
                  aria-label={`Carrito de compras (${itemCount} artículos)`}
                  style={{
                    background: `linear-gradient(135deg, ${p.roseMist} 0%, ${p.goldLight}30 100%)`,
                    border: `1.5px solid ${p.roseBlush}50`,
                    borderRadius: '50%',
                    width: '44px',
                    height: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                    boxShadow: `0 4px 16px ${p.roseBlush}20`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.1) rotate(5deg)'
                    e.currentTarget.style.boxShadow = `0 8px 24px ${p.roseVivid}40`
                    e.currentTarget.style.borderColor = p.roseVivid
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1) rotate(0deg)'
                    e.currentTarget.style.boxShadow = `0 4px 16px ${p.roseBlush}20`
                    e.currentTarget.style.borderColor = `${p.roseBlush}50`
                  }}
                >
                  <svg
                    className="w-5 h-5 transition-colors duration-300"
                    fill="none"
                    stroke={p.textMain}
                    strokeWidth={1.5}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                  {itemCount > 0 && (
                    <span
                      className="absolute -top-1 -right-1 flex items-center justify-center"
                      style={{
                        background: `linear-gradient(135deg, ${p.roseVivid}, ${p.coral})`,
                        color: p.ivory,
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        minWidth: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        boxShadow: `0 2px 12px ${p.roseVivid}50`,
                        animation: 'cartPulse 2s ease-in-out infinite',
                      }}
                    >
                      {itemCount}
                    </span>
                  )}
                </button>

                {/* Hamburguesa mobile */}
                <button
                  className="lg:hidden flex flex-col gap-[5px] p-2 ml-1"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  aria-label="Menú"
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <span
                    className="block h-px w-6 transition-all duration-400 origin-center"
                    style={{
                      background: p.textMain,
                      transform: mobileMenuOpen
                        ? 'translateY(6px) rotate(45deg)'
                        : 'none',
                    }}
                  />
                  <span
                    className="block h-px w-4 ml-auto transition-all duration-400"
                    style={{
                      background: p.rose,
                      opacity: mobileMenuOpen ? 0 : 1,
                      width: mobileMenuOpen ? '24px' : '16px',
                    }}
                  />
                  <span
                    className="block h-px w-6 transition-all duration-400 origin-center"
                    style={{
                      background: p.textMain,
                      transform: mobileMenuOpen
                        ? 'translateY(-6px) rotate(-45deg)'
                        : 'none',
                    }}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Mobile menu desplegable */}
          {mobileMenuOpen && (
            <div
              className="lg:hidden animate-slide-down"
              style={{
                background: `linear-gradient(180deg, ${p.ivory} 0%, ${p.cream} 100%)`,
                backdropFilter: 'blur(20px)',
                borderTop: `1px solid ${p.roseBlush}40`,
                boxShadow: `0 20px 60px ${p.roseBlush}30`,
              }}
            >
              <div className="max-w-screen-xl mx-auto px-6 py-8 flex flex-col gap-6">
                {navItems.map((item, i) =>
                  item.href ? (
                    <a
                      key={i}
                      href={item.href}
                      className="text-base"
                      onClick={() => setMobileMenuOpen(false)}
                      style={{
                        fontSize: '0.75rem',
                        letterSpacing: '0.2em',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        color: p.textMain,
                        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
                        padding: '0.75rem 0',
                        borderBottom: `1px solid ${p.roseBlush}20`,
                        transition: 'all 0.3s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = p.roseDeep
                        e.currentTarget.style.paddingLeft = '12px'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = p.textMain
                        e.currentTarget.style.paddingLeft = '0'
                      }}
                    >
                      {item.label}
                    </a>
                  ) : (
                    <button
                      key={i}
                      onClick={() => {
                        item.action()
                        setMobileMenuOpen(false)
                      }}
                      style={{
                        fontSize: '0.75rem',
                        letterSpacing: '0.2em',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        color: p.textMain,
                        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
                        padding: '0.75rem 0',
                        borderBottom: `1px solid ${p.roseBlush}20`,
                        background: 'none',
                        border: 'none',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = p.roseDeep
                        e.currentTarget.style.paddingLeft = '12px'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = p.textMain
                        e.currentTarget.style.paddingLeft = '0'
                      }}
                    >
                      {item.label}
                    </button>
                  )
                )}

                {/* Separador */}
                <div
                  style={{
                    height: '1px',
                    background: `linear-gradient(90deg, transparent, ${p.roseBlush}40, transparent)`,
                    margin: '0.5rem 0',
                  }}
                />

                <a
                  href="https://wa.me/51906877812?text=Hola,%20necesito%20ayuda"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: '0.75rem',
                    letterSpacing: '0.2em',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    color: p.roseDeep,
                    fontFamily: 'ui-sans-serif, system-ui, sans-serif',
                    padding: '0.75rem 0',
                    borderBottom: `1px solid ${p.roseBlush}20`,
                  }}
                >
                  AYUDA
                </a>
                <a
                  href="https://wa.me/51906877812?text=Hola,%20quiero%20contactar%20contigo"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: '0.75rem',
                    letterSpacing: '0.2em',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    color: p.roseDeep,
                    fontFamily: 'ui-sans-serif, system-ui, sans-serif',
                    padding: '0.75rem 0',
                  }}
                >
                  CONTACTO
                </a>
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* ════════════════════════════════════════════════════════════════════
          CONTENIDO PRINCIPAL
      ════════════════════════════════════════════════════════════════════ */}
      <main className="flex-1" id="main-content">
        <Outlet />
      </main>

      {/* WhatsApp */}
      <WhatsAppButton phoneNumber="51906877812" />

      {/* Cart Drawer */}
      <CartDrawer />

      {/* ════════════════════════════════════════════════════════════════════
          FOOTER — Aurora Bloom Luxury
      ════════════════════════════════════════════════════════════════════ */}
      <footer
        className="relative mt-28"
        style={{
          background: `linear-gradient(180deg, ${p.cream} 0%, ${p.ivory} 100%)`,
          borderTop: `1px solid ${p.roseBlush}30`,
        }}
      >
        {/* Divider top decorativo */}
        <div
          style={{
            height: '1px',
            background: `linear-gradient(90deg, transparent, ${p.roseBlush}40, ${p.goldSoft}30, ${p.roseBlush}40, transparent)`,
          }}
        />

        {/* Sección principal */}
        <div className="relative max-w-screen-xl mx-auto px-6 lg:px-10 pt-16 pb-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16">
            {/* BRAND — 4 columnas */}
            <div className="md:col-span-4">
              {/* Logo */}
              <div className="mb-6">
                <img
                  src={logoKB}
                  alt="KB Dresses and More"
                  className="h-16 object-contain"
                  style={{
                    filter: 'drop-shadow(0 4px 20px rgba(201, 96, 127, 0.15))',
                  }}
                />
              </div>

              <p
                className="text-sm leading-relaxed mb-8"
                style={{
                  color: p.textSoft,
                  fontWeight: 300,
                  maxWidth: '300px',
                  fontFamily: 'ui-sans-serif, system-ui, sans-serif',
                }}
              >
                Piezas únicas de moda importada desde Estados Unidos,
                seleccionadas con ojo editorial para la mujer que sabe quién es.
              </p>

              {/* Redes sociales */}
              <div className="flex items-center gap-3">
                {[
                  {
                    name: 'Facebook',
                    path: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
                  },
                  {
                    name: 'Instagram',
                    path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.64 4.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z',
                  },
                  {
                    name: 'Pinterest',
                    path: 'M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.852-2.433-4.587 0-3.728 2.708-7.159 7.812-7.159 4.144 0 7.365 2.956 7.365 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.609 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z',
                  },
                ].map((social, i) => (
                  <a
                    key={i}
                    href={
                      social.name === 'Facebook'
                        ? 'https://facebook.com/kbdresses'
                        : social.name === 'Instagram'
                        ? 'https://instagram.com/kbdresses'
                        : 'https://pinterest.com/kbdresses'
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.name}
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, ${p.roseMist} 0%, ${p.goldLight}30 100%)`,
                      border: `1.5px solid ${p.roseBlush}40`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform =
                        'translateY(-4px) scale(1.15) rotate(8deg)'
                      e.currentTarget.style.background = `linear-gradient(135deg, ${p.roseVivid}, ${p.coral})`
                      e.currentTarget.style.borderColor = p.roseVivid
                      e.currentTarget.style.boxShadow = `0 8px 24px ${p.roseVivid}40`
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform =
                        'translateY(0) scale(1) rotate(0deg)'
                      e.currentTarget.style.background = `linear-gradient(135deg, ${p.roseMist} 0%, ${p.goldLight}30 100%)`
                      e.currentTarget.style.borderColor = `${p.roseBlush}40`
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      style={{ color: p.roseDeep }}
                    >
                      <path d={social.path} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            {/* EXPLORA — 2 columnas */}
            <div className="md:col-span-2">
              <p
                className="mb-6"
                style={{
                  fontSize: '0.65rem',
                  letterSpacing: '0.25em',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: p.textMain,
                  fontFamily: 'ui-sans-serif, system-ui, sans-serif',
                }}
              >
                Explora
              </p>
              <ul className="space-y-3">
                {[
                  { label: 'Mujer', action: () => handleNavigateWithScroll('/?genero=mujer') },
                  { label: 'Hombre', action: () => handleNavigateWithScroll('/?genero=hombre') },
                  { label: 'Vestidos', action: () => handleNavigateWithScroll('/?categoria=vestidos') },
                  { label: 'Carteras', action: () => handleNavigateWithScroll('/?categoria=carteras') },
                  { label: 'Novedades', action: () => handleNavigateWithScroll('/?orden=nuevo') },
                ].map((item, i) => (
                  <li key={i}>
                    <button
                      onClick={item.action}
                      style={{
                        fontSize: '0.8rem',
                        color: p.textSoft,
                        fontWeight: 300,
                        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        textAlign: 'left',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = p.roseDeep
                        e.currentTarget.style.paddingLeft = '8px'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = p.textSoft
                        e.currentTarget.style.paddingLeft = '0'
                      }}
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* SOPORTE — 2 columnas */}
            <div className="md:col-span-2">
              <p
                className="mb-6"
                style={{
                  fontSize: '0.65rem',
                  letterSpacing: '0.25em',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: p.textMain,
                  fontFamily: 'ui-sans-serif, system-ui, sans-serif',
                }}
              >
                Soporte
              </p>
              <ul className="space-y-3">
                {[
                  { label: 'Preguntas Frecuentes', href: 'https://wa.me/51906877812?text=Hola,%20tengo%20una%20pregunta' },
                  { label: 'Contacto', href: 'https://wa.me/51906877812' },
                  { label: 'Política de Envíos', href: null },
                  { label: 'Cambios y Devoluciones', href: null },
                ].map((item, i) =>
                  item.href ? (
                    <li key={i}>
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: '0.8rem',
                          color: p.textSoft,
                          fontWeight: 300,
                          fontFamily: 'ui-sans-serif, system-ui, sans-serif',
                          transition: 'all 0.3s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = p.roseDeep
                          e.currentTarget.style.paddingLeft = '8px'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = p.textSoft
                          e.currentTarget.style.paddingLeft = '0'
                        }}
                      >
                        {item.label}
                      </a>
                    </li>
                  ) : (
                    <li key={i}>
                      <span
                        style={{
                          fontSize: '0.8rem',
                          color: p.textSoft,
                          fontWeight: 300,
                          fontFamily: 'ui-sans-serif, system-ui, sans-serif',
                          opacity: 0.5,
                        }}
                      >
                        {item.label}
                      </span>
                    </li>
                  )
                )}
              </ul>
            </div>

            {/* CONTACTO — 4 columnas */}
            <div className="md:col-span-4">
              <p
                className="mb-6"
                style={{
                  fontSize: '0.65rem',
                  letterSpacing: '0.25em',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: p.textMain,
                  fontFamily: 'ui-sans-serif, system-ui, sans-serif',
                }}
              >
                Contáctanos
              </p>

              <ul className="space-y-4 mb-8">
                {[
                  {
                    icon: (
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    ),
                    text: '+51 906 877 812',
                  },
                  {
                    icon: (
                      <>
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </>
                    ),
                    text: 'info@kbdresses.com',
                  },
                  {
                    icon: (
                      <path
                        fillRule="evenodd"
                        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                        clipRule="evenodd"
                      />
                    ),
                    text: 'Galería Chiclayo — 2do Piso',
                  },
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <svg
                      className="w-4 h-4 mt-0.5 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      style={{ color: p.rose }}
                    >
                      {item.icon}
                    </svg>
                    <span
                      style={{
                        color: p.textSoft,
                        fontSize: '0.82rem',
                        fontWeight: 300,
                        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
                      }}
                    >
                      {item.text}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA WhatsApp */}
              <a
                href="https://wa.me/51906877812?text=Hola,%20quiero%20hacer%20un%20pedido"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-3 px-6 py-3 text-xs font-medium tracking-widest uppercase transition-all duration-500 hover:-translate-y-1"
                style={{
                  border: `1.5px solid ${p.roseBlush}50`,
                  color: p.roseDeep,
                  borderRadius: '50px',
                  letterSpacing: '0.15em',
                  fontFamily: 'ui-sans-serif, system-ui, sans-serif',
                  background: `linear-gradient(135deg, ${p.roseMist} 0%, ${p.goldLight}20 100%)`,
                  boxShadow: `0 4px 16px ${p.roseBlush}20`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = `linear-gradient(135deg, ${p.roseVivid}, ${p.coral})`
                  e.currentTarget.style.color = p.ivory
                  e.currentTarget.style.borderColor = p.roseVivid
                  e.currentTarget.style.boxShadow = `0 12px 40px ${p.roseVivid}50`
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = `linear-gradient(135deg, ${p.roseMist} 0%, ${p.goldLight}20 100%)`
                  e.currentTarget.style.color = p.roseDeep
                  e.currentTarget.style.borderColor = `${p.roseBlush}50`
                  e.currentTarget.style.boxShadow = `0 4px 16px ${p.roseBlush}20`
                }}
              >
                <svg
                  className="w-4 h-4 transition-transform duration-300 group-hover:scale-110"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.76 1-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297 A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Escríbenos ahora
              </a>
            </div>
          </div>
        </div>

        {/* Divider inferior */}
        <div
          style={{
            height: '1px',
            background: `linear-gradient(90deg, transparent, ${p.roseBlush}40, ${p.goldSoft}30, ${p.roseBlush}40, transparent)`,
          }}
        />

        {/* Bottom bar */}
        <div className="max-w-screen-xl mx-auto px-6 lg:px-10 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p
            style={{
              color: p.textSoft,
              fontSize: '0.75rem',
              letterSpacing: '0.06em',
              fontWeight: 300,
              fontFamily: 'ui-sans-serif, system-ui, sans-serif',
            }}
          >
            © 2025 KB Dresses & More — Todos los derechos reservados
          </p>
          <p
            style={{
              color: p.textSoft,
              fontSize: '0.75rem',
              letterSpacing: '0.04em',
              fontWeight: 300,
              fontFamily: 'ui-sans-serif, system-ui, sans-serif',
            }}
          >
            Diseñado con{' '}
            <span
              style={{
                color: p.roseVivid,
                display: 'inline-block',
                animation: 'heartBeat 2s ease-in-out infinite',
              }}
            >
              ✦
            </span>{' '}
            en Chiclayo, Perú
          </p>
        </div>
      </footer>

      {/* ════════════════════════════════════════════════════════════════════
          KEYFRAMES
      ════════════════════════════════════════════════════════════════════ */}
      <style>{`
        @keyframes topbarGradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes marqueeScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        @keyframes headerPetalFall {
          0% { transform: translateY(0) rotate(0deg) scale(1); opacity: 0.4; }
          25% { transform: translateY(25vh) rotate(90deg) scale(0.9); opacity: 0.45; }
          50% { transform: translateY(50vh) rotate(180deg) scale(0.8); opacity: 0.35; }
          75% { transform: translateY(75vh) rotate(270deg) scale(0.7); opacity: 0.25; }
          100% { transform: translateY(110vh) rotate(360deg) scale(0.5); opacity: 0; }
        }

        @keyframes logoShine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }

        @keyframes cartPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        @keyframes heartBeat {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.8; }
        }

        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slide-down {
          animation: slide-down 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  )
}

export default Layout