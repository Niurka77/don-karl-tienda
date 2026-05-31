import logoKB from '/kb.png'
import WhatsAppButton from '../ui/WhatsAppButton'
import { Outlet, Link, useNavigate } from 'react-router-dom'
import CartDrawer from '../carrito/CartDrawer'
import useCartStore from '../../store/cartStore'
import { useState, useEffect } from 'react'

const Layout = () => {
  const navigate = useNavigate()
  const { toggleCart, getItemCount } = useCartStore()
  const itemCount = getItemCount()
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // ✅ Navega + espera carga + scroll al grid
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
      } else {
        const mainContent = document.getElementById('main-content')
        if (mainContent) {
          window.scrollTo({ top: mainContent.offsetTop - 120, behavior: 'smooth' })
        }
      }
    }, 500)

    return () => clearTimeout(timer)
  }

  const navItems = [
    { label: 'MUJER',    action: () => handleNavigateWithScroll('/?genero=mujer') },
    { label: 'HOMBRE',   action: () => handleNavigateWithScroll('/?genero=hombre') },
    { label: 'NOSOTROS', href: '/#nosotros' },
  ]

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-background)' }}>

      {/* ═══════════════════════════════════════
          HEADER
      ═══════════════════════════════════════ */}
      <header className="sticky top-0 z-40">

        {/* Topbar — anuncios con marquee */}
        <div className="kb-topbar">
          <div className="overflow-hidden">
            <div className="kb-marquee-track">
              {[
                '✦ Nueva Colección 2025',
                '✦ Envíos a Todo el Perú',
                '✦ Galería Chiclayo — 2do Piso',
                '✦ Moda Importada desde EE.UU.',
                '✦ Nueva Colección 2025',
                '✦ Envíos a Todo el Perú',
                '✦ Galería Chiclayo — 2do Piso',
                '✦ Moda Importada desde EE.UU.',
              ].map((text, i) => (
                <span key={i} className="px-10 whitespace-nowrap" style={{ color: 'rgba(242,196,206,0.9)' }}>
                  {text}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Navbar principal */}
        <nav className={`kb-navbar ${scrolled ? 'scrolled' : ''}`}>
          <div className="max-w-screen-xl mx-auto px-6 lg:px-10">
            <div className={`flex items-center justify-between transition-all duration-400 ${scrolled ? 'py-3' : 'py-5'}`}>

              {/* LEFT — Navegación desktop */}
              <div className="hidden lg:flex items-center gap-8">
                {navItems.map((item, i) =>
                  item.href ? (
                    <a key={i} href={item.href} className="kb-nav-link">
                      {item.label}
                    </a>
                  ) : (
                    <button key={i} onClick={item.action} className="kb-nav-link">
                      {item.label}
                    </button>
                  )
                )}
              </div>

              {/* CENTER — Logo */}
              <Link
                to="/"
                className="absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0 lg:mx-auto"
              >
                <img
                  src={logoKB}
                  alt="KB Dresses and More"
                  className={`kb-logo object-contain transition-all duration-400 ${scrolled ? 'h-10 md:h-12' : 'h-14 md:h-16'}`}
                />
              </Link>

              {/* RIGHT — Acciones */}
              <div className="flex items-center gap-3">

                {/* AYUDA & CONTACTO — solo desktop */}
                <div className="hidden lg:flex items-center gap-6 mr-4">
                  <a
                    href="https://wa.me/51906877812?text=Hola,%20necesito%20ayuda%20con%20mi%20pedido"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="kb-nav-link"
                  >
                    AYUDA
                  </a>
                  <a
                    href="https://wa.me/51906877812?text=Hola,%20quiero%20contactar%20contigo"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="kb-nav-link"
                  >
                    CONTACTO
                  </a>
                </div>

                {/* Carrito */}
                <button
                  onClick={toggleCart}
                  className="kb-cart-btn"
                  aria-label={`Carrito de compras (${itemCount} artículos)`}
                >
                  <svg
                    className="w-[18px] h-[18px]"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    viewBox="0 0 24 24"
                    style={{ color: 'var(--color-kb-charcoal)' }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  {itemCount > 0 && (
                    <span className="kb-cart-badge">{itemCount}</span>
                  )}
                </button>

                {/* Hamburguesa mobile */}
                <button
                  className="lg:hidden flex flex-col gap-[5px] p-2 ml-1"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  aria-label="Menú"
                >
                  <span
                    className="block h-px w-6 transition-all duration-300 origin-center"
                    style={{
                      background: 'var(--color-kb-charcoal)',
                      transform: mobileMenuOpen ? 'translateY(6px) rotate(45deg)' : 'none',
                    }}
                  />
                  <span
                    className="block h-px w-4 ml-auto transition-all duration-300"
                    style={{
                      background: 'var(--color-kb-rose)',
                      opacity: mobileMenuOpen ? 0 : 1,
                      width: mobileMenuOpen ? '24px' : '16px',
                    }}
                  />
                  <span
                    className="block h-px w-6 transition-all duration-300 origin-center"
                    style={{
                      background: 'var(--color-kb-charcoal)',
                      transform: mobileMenuOpen ? 'translateY(-6px) rotate(-45deg)' : 'none',
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
                background: 'rgba(253,250,249,0.98)',
                backdropFilter: 'blur(20px)',
                borderTop: '1px solid rgba(212,120,138,0.1)',
              }}
            >
              <div className="max-w-screen-xl mx-auto px-6 py-6 flex flex-col gap-5">
                {navItems.map((item, i) =>
                  item.href ? (
                    <a
                      key={i}
                      href={item.href}
                      className="kb-nav-link text-base"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.label}
                    </a>
                  ) : (
                    <button
                      key={i}
                      onClick={item.action}
                      className="kb-nav-link text-base text-left"
                    >
                      {item.label}
                    </button>
                  )
                )}

                {/* Separador */}
                <div style={{ height: '1px', background: 'rgba(212,120,138,0.12)' }} />

                <a
                  href="https://wa.me/51906877812?text=Hola,%20necesito%20ayuda"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="kb-nav-link text-base"
                >
                  AYUDA
                </a>
                <a
                  href="https://wa.me/51906877812?text=Hola,%20quiero%20contactar%20contigo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="kb-nav-link text-base"
                >
                  CONTACTO
                </a>
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* ═══════════════════════════════════════
          CONTENIDO PRINCIPAL
      ═══════════════════════════════════════ */}
      <main className="flex-1" id="main-content">
        <Outlet />
      </main>

      {/* WhatsApp */}
      <WhatsAppButton phoneNumber="51906877812" />

      {/* Cart Drawer */}
      <CartDrawer />

      {/* ═══════════════════════════════════════
          FOOTER — OBSIDIAN LUXURY
      ═══════════════════════════════════════ */}
      <footer className="kb-footer mt-28">

        {/* Divider top decorativo */}
        <div className="kb-footer-divider" />

        {/* Sección principal */}
        <div className="relative max-w-screen-xl mx-auto px-6 lg:px-10 pt-16 pb-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16">

            {/* BRAND — 4 columnas */}
            <div className="md:col-span-4">
              {/* Logo con tratamiento especial en dark */}
              <div className="mb-6">
                <img
                  src={logoKB}
                  alt="KB Dresses and More"
                  className="h-14 object-contain"
                  style={{ filter: 'brightness(0) invert(1) opacity(0.85)' }}
                />
              </div>

              <p
                className="text-sm leading-relaxed mb-8"
                style={{ color: 'rgba(154,116,128,0.85)', fontWeight: 300, maxWidth: '280px' }}
              >
                Piezas únicas de moda importada desde Estados Unidos, seleccionadas con ojo editorial para la mujer que sabe quién es.
              </p>

              {/* Redes sociales */}
              <div className="flex items-center gap-3">
                <a
                  href="https://facebook.com/kbdresses"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="kb-social-btn"
                  aria-label="Facebook"
                >
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
                <a
                  href="https://instagram.com/kbdresses"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="kb-social-btn"
                  aria-label="Instagram"
                >
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
                <a
                  href="https://pinterest.com/kbdresses"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="kb-social-btn"
                  aria-label="Pinterest"
                >
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.852-2.433-4.587 0-3.728 2.708-7.159 7.812-7.159 4.144 0 7.365 2.956 7.365 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.609 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* EXPLORA — 2 columnas */}
            <div className="md:col-span-2">
              <p className="kb-footer-heading">Explora</p>
              <ul className="space-y-3">
                {[
                  { label: 'Mujer',     action: () => handleNavigateWithScroll('/?genero=mujer') },
                  { label: 'Hombre',    action: () => handleNavigateWithScroll('/?genero=hombre') },
                  { label: 'Vestidos',  action: () => handleNavigateWithScroll('/?categoria=vestidos') },
                  { label: 'Carteras',  action: () => handleNavigateWithScroll('/?categoria=carteras') },
                  { label: 'Novedades', action: () => handleNavigateWithScroll('/?orden=nuevo') },
                ].map((item, i) => (
                  <li key={i}>
                    <button onClick={item.action} className="kb-footer-link">
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* SOPORTE — 2 columnas */}
            <div className="md:col-span-2">
              <p className="kb-footer-heading">Soporte</p>
              <ul className="space-y-3">
                {[
                  { label: 'Preguntas Frecuentes', href: 'https://wa.me/51906877812?text=Hola,%20tengo%20una%20pregunta' },
                  { label: 'Contacto',              href: 'https://wa.me/51906877812' },
                  { label: 'Política de Envíos',    href: null },
                  { label: 'Cambios y Devoluciones',href: null },
                ].map((item, i) =>
                  item.href ? (
                    <li key={i}>
                      <a href={item.href} target="_blank" rel="noopener noreferrer" className="kb-footer-link">
                        {item.label}
                      </a>
                    </li>
                  ) : (
                    <li key={i}>
                      <span className="kb-footer-link cursor-default" style={{ opacity: 0.5 }}>
                        {item.label}
                      </span>
                    </li>
                  )
                )}
              </ul>
            </div>

            {/* CONTACTO — 4 columnas */}
            <div className="md:col-span-4">
              <p className="kb-footer-heading">Contáctanos</p>

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
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    ),
                    text: 'Galería Chiclayo — 2do Piso',
                  },
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <svg
                      className="w-4 h-4 mt-0.5 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      style={{ color: 'var(--color-kb-rose)' }}
                    >
                      {item.icon}
                    </svg>
                    <span style={{ color: 'rgba(154,116,128,0.85)', fontSize: '0.82rem', fontWeight: 300 }}>
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
                className="inline-flex items-center gap-3 px-6 py-3 text-xs font-medium tracking-widest uppercase transition-all duration-300 hover:-translate-y-0.5"
                style={{
                  border: '1px solid rgba(212,120,138,0.35)',
                  color: 'var(--color-kb-rose-mist)',
                  borderRadius: '2px',
                  letterSpacing: '0.15em',
                }}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Escríbenos ahora
              </a>
            </div>
          </div>
        </div>

        {/* Divider inferior */}
        <div className="kb-footer-divider" />

        {/* Bottom bar */}
        <div className="max-w-screen-xl mx-auto px-6 lg:px-10 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p
            className="text-xs"
            style={{ color: 'rgba(154,116,128,0.5)', letterSpacing: '0.06em', fontWeight: 300 }}
          >
            © 2025 KB Dresses & More — Todos los derechos reservados
          </p>
          <p
            className="text-xs"
            style={{ color: 'rgba(154,116,128,0.35)', letterSpacing: '0.04em', fontWeight: 300 }}
          >
            Diseñado con ✦ en Chiclayo, Perú
          </p>
        </div>
      </footer>
    </div>
  )
}

export default Layout
