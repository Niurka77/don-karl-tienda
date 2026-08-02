import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import useCartStore from '../../store/cartStore'
import { WHATSAPP_PHONE, WHATSAPP_MESSAGES } from '../../lib/constants'
import { useSiteConfig } from '../../hooks/useSiteConfig'
import kbLogo from '/kb.svg'
import './Navbar.css'

const Navbar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { config } = useSiteConfig()
  const topbarText = config.texts?.topbar_text || 'Envío gratis en compras mayores a S/ 200 — Recoge en tienda'
  const phone = config.footerContact?.phone || WHATSAPP_PHONE

  // ── Estado interno ──────────────────────────────────────────────────────
  const [mobileOpen, setMobileOpen] = useState(false)
  const [catsOpen, setCatsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [categories, setCategories] = useState([])
  const searchInputRef = useRef(null)

  const itemCount = useCartStore((s) => s.items.reduce((t, i) => t + i.quantity, 0))

  // ── Categorías reales desde Supabase ────────────────────────────────────
  useEffect(() => {
    let active = true
    const loadCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('category')
          .not('category', 'is', null)
        if (error) throw error
        if (!active) return
        const seen = new Set()
        const cats = (data || [])
          .map((r) => r.category?.trim())
          .filter(Boolean)
          .filter((c) => {
            if (seen.has(c.toLowerCase())) return false
            seen.add(c.toLowerCase())
            return true
          })
          .sort((a, b) => a.localeCompare(b))
        setCategories(cats)
      } catch (err) {
        console.warn('No se pudieron cargar categorías:', err)
      }
    }
    loadCategories()
    return () => { active = false }
  }, [])

  // ── Cerrar menús al navegar ─────────────────────────────────────────────
  const closeAll = () => {
    setMobileOpen(false)
    setCatsOpen(false)
  }

  // ── Navegación con scroll suave ─────────────────────────────────────────
  const navigateTo = (url) => {
    closeAll()
    navigate(url)
    setTimeout(() => {
      const target = document.getElementById('product-grid-section')
      if (target) {
        const offset = target.getBoundingClientRect().top + window.pageYOffset - 140
        window.scrollTo({ top: offset, behavior: 'smooth' })
      }
    }, 500)
  }

  // ── Ir a una sección del Home (ancla confiable) ─────────────────────────
  const goSection = (sectionId) => {
    closeAll()
    const scroll = () => {
      const target = document.getElementById(sectionId)
      if (target) {
        const offset = target.getBoundingClientRect().top + window.pageYOffset - 120
        window.scrollTo({ top: offset, behavior: 'smooth' })
        return true
      }
      return false
    }
    if (location.pathname === '/' && scroll()) return
    navigate('/')
    let attempts = 0
    const tryScroll = setInterval(() => {
      attempts++
      if (scroll() || attempts > 20) clearInterval(tryScroll)
    }, 150)
  }

  // ── Búsqueda ────────────────────────────────────────────────────────────
  const handleSearch = (e) => {
    e.preventDefault()
    const q = searchQuery.trim()
    if (!q) return
    setSearchQuery('')
    closeAll()
    navigate(`/?busqueda=${encodeURIComponent(q)}`)
  }

  // ── Categoría ───────────────────────────────────────────────────────────
  const goCategory = (category) => {
    closeAll()
    navigate(`/?categoria=${encodeURIComponent(category)}`)
    setTimeout(() => {
      const target = document.getElementById('product-grid-section')
      if (target) {
        const offset = target.getBoundingClientRect().top + window.pageYOffset - 140
        window.scrollTo({ top: offset, behavior: 'smooth' })
      }
    }, 500)
  }

  // ── Items de navegación (barra secundaria) ──────────────────────────────
  const navItems = [
    { label: 'Tienda', action: () => navigateTo('/?busqueda=') },
    { label: 'Novedades', action: () => navigateTo('/?sort=recientes') },
    { label: 'Importados', action: () => navigateTo('/?origen=importado') },
    { label: 'Nacionales', action: () => navigateTo('/?origen=nacional') },
    { label: 'Catálogo', action: () => navigate('/catalogo') },
    { label: 'Nosotros', action: () => goSection('nosotros') },
  ]

  const searchIcon = (
    <svg fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" className="kb-searchbar__icon">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  )

  const cartIcon = (
    <svg className="kb-cart__icon" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  )

  const phoneIcon = (
    <svg fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
    </svg>
  )

  return (
    <header className="kb-header sticky top-0 z-50">
      {/* ── TOPBAR ──────────────────────────────────────────────────────── */}
      <div className="kb-topbar">
        <div className="kb-topbar__track">
          <span className="kb-topbar__item">✦ {topbarText}</span>
        </div>
      </div>

      {/* ── NAVBAR principal (blanco) ────────────────────────────────────── */}
      <nav className="kb-navbar">
        {/* Marca — izquierda */}
        <Link to="/" className="kb-brand" onClick={closeAll} aria-label="KB Dresses and More">
          <img src={kbLogo} alt="KB Dresses and More" className="kb-brand__img" />
        </Link>

        {/* Búsqueda — centro (desktop) */}
        <form onSubmit={handleSearch} className="kb-searchbar">
          {searchIcon}
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar vestidos, carteras, accesorios..."
            className="kb-searchbar__input"
            aria-label="Buscar productos"
          />
        </form>

        {/* Acciones — derecha */}
        <div className="kb-actions">
          <button onClick={() => searchInputRef.current?.focus()} className="kb-icon-btn kb-icon-btn--search" aria-label="Buscar">
            {searchIcon}
          </button>
          <Link to="/checkout" className="kb-cart" aria-label="Carrito">
            {cartIcon}
            {itemCount > 0 && <span className="kb-cart__badge">{itemCount}</span>}
          </Link>
          <button
            className="kb-hamburger"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menú"
          >
            <span className={`kb-hamburger__line ${mobileOpen ? 'is-open' : ''}`} />
            <span className={`kb-hamburger__line kb-hamburger__line--mid ${mobileOpen ? 'is-open' : ''}`} />
            <span className={`kb-hamburger__line ${mobileOpen ? 'is-open' : ''}`} />
          </button>
        </div>
      </nav>

      {/* ── Barra secundaria (rose-deep) ─────────────────────────────────── */}
      <div className="kb-catbar">
        <button className="kb-catbar__btn" onClick={() => setCatsOpen(!catsOpen)}>
          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          Comprar por categoría
        </button>

        <div className="kb-catbar__menu">
          {navItems.map((item, i) => (
            <button key={i} onClick={item.action} className="kb-catbar__link">
              {item.label}
            </button>
          ))}
        </div>

        <a
          href={`https://wa.me/${phone}`}
          target="_blank"
          rel="noopener noreferrer"
          className="kb-catbar__support"
        >
          {phoneIcon}
          Soporte {phone}
        </a>
      </div>

      {/* ── Panel lateral categorías ─────────────────────────────────────── */}
      <div className={`kb-cats__overlay ${catsOpen ? 'kb-cats__overlay--open' : ''}`} onClick={() => setCatsOpen(false)} />
      <aside className={`kb-cats ${catsOpen ? 'kb-cats--open' : ''}`}>
        <div className="kb-cats__header">
          <span className="kb-cats__title">Categorías</span>
          <button className="kb-cats__close" onClick={() => setCatsOpen(false)} aria-label="Cerrar">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        <div className="kb-cats__list">
          {categories.length > 0 ? (
            categories.map((cat) => (
              <button key={cat} className="kb-cats__item" onClick={() => goCategory(cat)}>
                <span className="kb-cats__item-label">
                  <svg className="kb-cats__item-icon" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 8h6m-6 4h6m-6 4h3m-8.25 6h16.5a.75.75 0 00.75-.75V5.25a.75.75 0 00-.75-.75H3.75a.75.75 0 00-.75.75v14.25c0 .414.336.75.75.75z" />
                  </svg>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </span>
                <svg className="kb-cats__arrow" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            ))
          ) : (
            <div className="kb-cats__list">
              {['Carteras', 'Vestidos', 'Billeteras', 'Accesorios', 'Zapatos', 'Hombres'].map((cat) => (
                <button key={cat} className="kb-cats__item" onClick={() => goCategory(cat)}>
                  <span className="kb-cats__item-label">
                    <svg className="kb-cats__item-icon" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 8h6m-6 4h6m-6 4h3m-8.25 6h16.5a.75.75 0 00.75-.75V5.25a.75.75 0 00-.75-.75H3.75a.75.75 0 00-.75.75v14.25c0 .414.336.75.75.75z" />
                    </svg>
                    {cat}
                  </span>
                  <svg className="kb-cats__arrow" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              ))}
            </div>
          )}
        </div>
      </aside>

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

            {navItems.map((item, i) => (
              <button key={i} onClick={item.action} className="kb-mobile__link kb-mobile__link--btn">
                {item.label}
              </button>
            ))}

            {categories.length > 0 && (
              <>
                <div className="kb-mobile__separator" />
                {categories.map((cat) => (
                  <button key={cat} onClick={() => goCategory(cat)} className="kb-mobile__link">
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </button>
                ))}
              </>
            )}

            <div className="kb-mobile__separator" />

            <a
              href={`https://wa.me/${phone}?text=${encodeURIComponent(WHATSAPP_MESSAGES.help)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="kb-mobile__link kb-mobile__link--accent"
            >
              Ayuda
            </a>
            <a
              href={`https://wa.me/${phone}?text=${encodeURIComponent(WHATSAPP_MESSAGES.contact)}`}
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
