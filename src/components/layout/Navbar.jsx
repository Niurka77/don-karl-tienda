import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { WHATSAPP_PHONE, WHATSAPP_MESSAGES } from '../../lib/constants'
import { useSiteConfig } from '../../hooks/useSiteConfig'
import { p } from '../../lib/theme'
import kbLogo from '/kb.svg'
import './Navbar.css'

const Navbar = () => {
  const navigate = useNavigate()
  const { config } = useSiteConfig()
  const topbarText = config.texts?.topbar_text || 'Envío gratis en compras mayores a S/ 200 — Recoge en tienda'

  // ── Estado interno ──────────────────────────────────────────────────────
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const navRef = useRef(null)
  const searchInputRef = useRef(null)

  // ── Scroll ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // ── Auto-focus búsqueda ─────────────────────────────────────────────────
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [searchOpen])

  // ── Cerrar menú al navegar ──────────────────────────────────────────────
  const closeMobile = () => setMobileOpen(false)

  // ── Navegación con scroll suave ─────────────────────────────────────────
  const navigateTo = (url) => {
    closeMobile()
    navigate(url)
    setTimeout(() => {
      const target = document.getElementById('product-grid-section')
      if (target) {
        const offset = target.getBoundingClientRect().top + window.pageYOffset - 140
        window.scrollTo({ top: offset, behavior: 'smooth' })
      }
    }, 500)
  }

  // ── Búsqueda ────────────────────────────────────────────────────────────
  const handleSearch = (e) => {
    e.preventDefault()
    const q = searchQuery.trim()
    if (!q) return
    setSearchOpen(false)
    setSearchQuery('')
    closeMobile()
    navigate(`/?busqueda=${encodeURIComponent(q)}`)
  }

  // ── Items de navegación ─────────────────────────────────────────────────
  const navItems = [
    { label: 'Mujer', action: () => navigateTo('/?genero=mujer') },
    { label: 'Hombre', action: () => navigateTo('/?genero=hombre') },
    { label: 'Importados', action: () => navigateTo('/?origen=importado') },
    { label: 'Nacionales', action: () => navigateTo('/?origen=nacional') },
    { label: 'Catálogo', href: '/catalogo' },
    { label: 'Nosotros', href: '/#nosotros' },
  ]

  return (
    <header
      ref={navRef}
      className={`kb-header sticky top-0 z-50 ${scrolled ? 'kb-header--scrolled' : ''}`}
    >
      {/* ── TOPBAR ──────────────────────────────────────────────────────── */}
      <div className="kb-topbar">
        <div className="kb-topbar__track">
          {Array.from({ length: 6 }, (_, i) => (
            <span key={i} className="kb-topbar__item">
              ✦ {topbarText}
              <span className="kb-topbar__dot">✦</span>
            </span>
          ))}
          {Array.from({ length: 6 }, (_, i) => (
            <span key={`d-${i}`} className="kb-topbar__item">
              ✦ {topbarText}
              <span className="kb-topbar__dot">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── NAVBAR ──────────────────────────────────────────────────────── */}
      <nav className="kb-navbar">

        {/* Left links — desktop */}
        <div className="kb-nav kb-nav--left">
          {navItems.slice(0, 3).map((item, i) =>
            item.href ? (
              <a key={i} href={item.href} className="kb-nav__link">
                {item.label}
              </a>
            ) : (
              <button key={i} onClick={item.action} className="kb-nav__link kb-nav__link--btn">
                {item.label}
              </button>
            )
          )}
        </div>

        {/* Center logo badge */}
        <Link to="/" className="kb-logo-badge">
          <img
            src={kbLogo}
            alt="KB Dresses and More"
            className="kb-logo-badge__img"
          />
        </Link>

        {/* Right links + actions — desktop */}
        <div className="kb-nav kb-nav--right">
          {navItems.slice(3).map((item, i) =>
            item.href ? (
              <a key={i} href={item.href} className="kb-nav__link">
                {item.label}
              </a>
            ) : (
              <button key={i} onClick={item.action} className="kb-nav__link kb-nav__link--btn">
                {item.label}
              </button>
            )
          )}
          <div className="kb-actions">
            {searchOpen ? (
              <form onSubmit={handleSearch} className="kb-search">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar..."
                  className="kb-search__input"
                  onBlur={() => { if (!searchQuery.trim()) setSearchOpen(false) }}
                />
              </form>
            ) : (
              <button onClick={() => setSearchOpen(true)} className="kb-icon-btn" aria-label="Buscar">
                <svg className="kb-icon-btn__svg" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </button>
            )}
            <Link to="/checkout" className="kb-cart" aria-label="Carrito">
              <svg className="kb-cart__icon" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Hamburguesa — mobile */}
        <button
          className="kb-hamburger"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Menú"
        >
          <span className={`kb-hamburger__line ${mobileOpen ? 'is-open' : ''}`} />
          <span className={`kb-hamburger__line kb-hamburger__line--mid ${mobileOpen ? 'is-open' : ''}`} />
          <span className={`kb-hamburger__line ${mobileOpen ? 'is-open' : ''}`} />
        </button>
      </nav>

      {/* ── MENÚ MOBILE ────────────────────────────────────────────────── */}
      {mobileOpen && (
        <div className="kb-mobile">
          <div className="kb-mobile__inner">

            <form onSubmit={handleSearch} className="kb-mobile__search">
              <svg className="kb-mobile__search-icon" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar productos..."
                className="kb-mobile__search-input"
              />
            </form>

            {navItems.map((item, i) =>
              item.href ? (
                <a key={i} href={item.href} onClick={closeMobile} className="kb-mobile__link">
                  {item.label}
                </a>
              ) : (
                <button key={i} onClick={item.action} className="kb-mobile__link kb-mobile__link--btn">
                  {item.label}
                </button>
              )
            )}

            <div className="kb-mobile__separator" />

            <a
              href={`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(WHATSAPP_MESSAGES.help)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="kb-mobile__link kb-mobile__link--accent"
            >
              Ayuda
            </a>
            <a
              href={`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(WHATSAPP_MESSAGES.contact)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="kb-mobile__link kb-mobile__link--accent"
            >
              Contacto
            </a>
          </div>
        </div>
      )}
    </header>
  )
}

export default Navbar
