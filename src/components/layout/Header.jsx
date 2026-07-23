import logoKB from '/kb.png'
import { Link } from 'react-router-dom'
import { WHATSAPP_PHONE, WHATSAPP_MESSAGES } from '../../lib/constants'
import { p } from '../../lib/theme'

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

const Header = ({
  scrolled,
  mobileMenuOpen,
  setMobileMenuOpen,
  searchOpen,
  setSearchOpen,
  searchQuery,
  setSearchQuery,
  mousePos,
  itemCount,
  toggleCart,
  onSearch,
  navItems,
  headerRef,
  searchInputRef,
  petals,
}) => {
  return (
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
                  href={`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(WHATSAPP_MESSAGES.help)}`}
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
                  href={`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(WHATSAPP_MESSAGES.contact)}`}
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

              {/* Búsqueda — desktop */}
              <div className="hidden lg:flex items-center mr-2">
                {searchOpen ? (
                  <form onSubmit={onSearch} className="flex items-center gap-2">
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Buscar productos..."
                      className="outline-none"
                      style={{
                        width: '180px',
                        fontSize: '0.7rem',
                        letterSpacing: '0.05em',
                        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
                        color: p.textMain,
                        background: `${p.roseMist}60`,
                        border: `1px solid ${p.roseBlush}50`,
                        borderRadius: '50px',
                        padding: '0.45rem 0.9rem',
                        transition: 'all 0.3s ease',
                      }}
                      onBlur={() => { if (!searchQuery.trim()) setSearchOpen(false) }}
                    />
                  </form>
                ) : (
                  <button
                    onClick={() => setSearchOpen(true)}
                    aria-label="Buscar productos"
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      color: p.textSoft,
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
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                  </button>
                )}
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
              {/* Búsqueda mobile */}
              <form onSubmit={(e) => { onSearch(e); setMobileMenuOpen(false) }} className="flex items-center gap-2 pb-4" style={{ borderBottom: `1px solid ${p.roseBlush}20` }}>
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke={p.textSoft} strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar productos..."
                  className="flex-1 outline-none"
                  style={{
                    fontSize: '0.8rem',
                    fontFamily: 'ui-sans-serif, system-ui, sans-serif',
                    color: p.textMain,
                    background: 'transparent',
                    border: 'none',
                  }}
                />
              </form>

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
                href={`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(WHATSAPP_MESSAGES.help)}`}
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
                href={`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(WHATSAPP_MESSAGES.contact)}`}
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
  )
}

export default Header
