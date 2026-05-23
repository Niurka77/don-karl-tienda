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

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    
    window.addEventListener('scroll', handleScroll)
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <div className="min-h-screen bg-kb-cream flex flex-col">
      {/* Header Profesional */}
      <header className="sticky top-0 z-40 bg-white shadow-sm">
        
        {/* Top Bar - Información */}
        <div className="bg-gradient-to-r from-kb-rose via-kb-soft-pink to-kb-rose text-white text-xs py-2">
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-6">
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
              </svg>
              Galería Chiclayo - 2do Piso
            </span>
            <span className="hidden sm:flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1v-5h2v5a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H17a1 1 0 001-1V5a1 1 0 00-1-1H3z"/>
              </svg>
              Envíos a todo el Perú
            </span>
            <span className="hidden md:flex items-center gap-1 font-semibold">
              Nueva Colección 2024
            </span>
          </div>
        </div>

        {/* Navbar Principal */}
        <nav className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          
          {/* Left: Navegación Desktop */}
          <div className="hidden lg:flex items-center gap-8">
            {['MUJER', 'HOMBRE', 'NOSOTROS'].map((item) => (
              item === 'NOSOTROS' ? (
                <a
                  key={item}
                  href="/#nosotros"
                  className="text-sm font-semibold text-kb-charcoal hover:text-kb-rose transition-colors relative group"
                >
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-kb-rose transition-all group-hover:w-full"></span>
                </a>
              ) : (
                <button
                  key={item}
                  onClick={() => navigate(`/?genero=${item.toLowerCase()}`)}
                  className="text-sm font-semibold text-kb-charcoal hover:text-kb-rose transition-colors relative group"
                >
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-kb-rose transition-all group-hover:w-full"></span>
                </button>
              )
            ))}
          </div>

          {/* Center: Logo */}
          <Link to="/" className="flex-shrink-0 mx-auto lg:mx-0">
            <img 
              src={logoKB} 
              alt="KB Dresses and More" 
              className="h-16 md:h-20 object-contain transition-transform duration-300 hover:scale-105"
            />
          </Link>

          {/* Right: Ayuda, Contacto y Carrito */}
          <div className="hidden lg:flex items-center gap-6">
            <a
              href="https://wa.me/51906877812?text=Hola,%20necesito%20ayuda%20con%20mi%20pedido"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-kb-charcoal hover:text-kb-rose transition-colors"
            >
              AYUDA
            </a>
            <a
              href="https://wa.me/51906877812?text=Hola,%20quiero%20contactar%20contigo"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-kb-charcoal hover:text-kb-rose transition-colors"
            >
              CONTACTO
            </a>
            
            <div className="w-px h-6 bg-border"></div>
            
            {/* Botón Carrito */}
            <button 
              onClick={toggleCart}
              className="relative p-2 hover:bg-kb-blush rounded-full transition-colors group"
              aria-label={`Carrito de compras (${itemCount} artículos)`}
            >
              <svg className="w-6 h-6 text-kb-charcoal group-hover:text-kb-rose transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
              </svg>
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-kb-rose text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>
          </div>

          {/* Mobile: Menú Hamburguesa (simplificado) */}
          <div className="lg:hidden flex items-center gap-4">
            <button 
              onClick={toggleCart}
              className="relative p-2 hover:bg-kb-blush rounded-full transition-colors"
              aria-label={`Carrito de compras (${itemCount} artículos)`}
            >
              <svg className="w-6 h-6 text-kb-charcoal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
              </svg>
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-kb-rose text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </nav>

        {/* Mobile: Navegación inferior */}
        <nav className="lg:hidden border-t border-border py-3">
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-6 text-xs font-semibold text-kb-charcoal">
            <button onClick={() => navigate('/?genero=mujer')} className="hover:text-kb-rose transition-colors">MUJER</button>
            <button onClick={() => navigate('/?genero=hombre')} className="hover:text-kb-rose transition-colors">HOMBRE</button>
            <a href="/#nosotros" className="hover:text-kb-rose transition-colors">NOSOTROS</a>
            <a 
              href="https://wa.me/51906877812?text=Hola,%20necesito%20ayuda"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-kb-rose transition-colors"
            >
              AYUDA
            </a>
          </div>
        </nav>
      </header>

      {/* Contenido Principal */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* WhatsApp Button */}
      <WhatsAppButton phoneNumber="51906877812" />

      {/* Cart Drawer */}
      <CartDrawer />

      {/* Footer Profesional */}
      <footer className="bg-kb-blush border-t border-border mt-24">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            
            {/* Brand */}
            <div>
              <img src={logoKB} alt="KB Dresses and More" className="h-16 mb-6 opacity-90" />
              <p className="text-sm text-kb-mauve leading-relaxed mb-6">
                Moda importada desde Estados Unidos. Piezas únicas seleccionadas para ti.
              </p>
              <div className="flex items-center gap-4">
                {['facebook', 'instagram', 'pinterest'].map((social) => (
                  <a 
                    key={social} 
                    href="#" 
                    className="w-9 h-9 rounded-full bg-kb-rose/10 hover:bg-kb-rose flex items-center justify-center text-kb-rose hover:text-white transition-all"
                    aria-label={social}
                  >
                    <div className="w-4 h-4 bg-current rounded-full"></div>
                  </a>
                ))}
              </div>
            </div>

            {/* Explora */}
            <div>
              <h4 className="font-serif font-semibold text-kb-charcoal mb-5">EXPLORA</h4>
              <ul className="space-y-3 text-sm">
                <li><Link to="/?genero=mujer" className="text-kb-mauve hover:text-kb-rose transition-colors">Mujer</Link></li>
                <li><Link to="/?genero=hombre" className="text-kb-mauve hover:text-kb-rose transition-colors">Hombre</Link></li>
                <li><Link to="/?categoria=vestidos" className="text-kb-mauve hover:text-kb-rose transition-colors">Vestidos</Link></li>
                <li><Link to="/?orden=price_original-asc" className="text-kb-mauve hover:text-kb-rose transition-colors">Outlet</Link></li>
              </ul>
            </div>

            {/* Soporte */}
            <div>
              <h4 className="font-serif font-semibold text-kb-charcoal mb-5">SOPORTE</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <a
                    href="https://wa.me/51906877812?text=Hola,%20tengo%20una%20pregunta"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-kb-mauve hover:text-kb-rose transition-colors"
                  >
                    Preguntas Frecuentes
                  </a>
                </li>
                <li>
                  <a
                    href="https://wa.me/51906877812"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-kb-mauve hover:text-kb-rose transition-colors"
                  >
                    Contacto
                  </a>
                </li>
                <li><span className="text-kb-mauve">Política de Envíos</span></li>
                <li><span className="text-kb-mauve">Cambios y Devoluciones</span></li>
              </ul>
            </div>

            {/* Contacto */}
            <div>
              <h4 className="font-serif font-semibold text-kb-charcoal mb-5">CONTACTO</h4>
              <ul className="space-y-3 text-sm text-kb-mauve">
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-kb-rose" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                  </svg>
                  +51 906 877 812
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-kb-rose" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                  </svg>
                  info@kbdresses.com
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-kb-rose" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                  </svg>
                  Galería Chiclayo - 2do Piso
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-12 pt-8 text-center text-xs text-kb-mauve">
            <p>2024 KB Dresses and More. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout