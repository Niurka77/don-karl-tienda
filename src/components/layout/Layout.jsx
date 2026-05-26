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

  // ✅ Navega + espera carga + scroll al grid
  const handleNavigateWithScroll = (url) => {
    navigate(url)
    
    const timer = setTimeout(() => {
      const productGrid = document.getElementById('product-grid-section')
      
      if (productGrid) {
        const headerOffset = 140
        const elementPosition = productGrid.getBoundingClientRect().top
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        })
      } else {
        const mainContent = document.getElementById('main-content')
        if (mainContent) {
          window.scrollTo({
            top: mainContent.offsetTop - 120,
            behavior: 'smooth'
          })
        }
      }
    }, 500)
    
    return () => clearTimeout(timer)
  }

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
                  onClick={() => handleNavigateWithScroll(`/?genero=${item.toLowerCase()}`)}
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

          {/* Mobile: Menú Hamburguesa */}
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
            <button onClick={() => handleNavigateWithScroll('/?genero=mujer')} className="hover:text-kb-rose transition-colors">MUJER</button>
            <button onClick={() => handleNavigateWithScroll('/?genero=hombre')} className="hover:text-kb-rose transition-colors">HOMBRE</button>
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
      <main className="flex-1" id="main-content">
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
                <a href="https://facebook.com/kbdresses" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-kb-rose/10 hover:bg-kb-rose flex items-center justify-center text-kb-rose hover:text-white transition-all" aria-label="Facebook">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
                <a href="https://instagram.com/kbdresses" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-kb-rose/10 hover:bg-kb-rose flex items-center justify-center text-kb-rose hover:text-white transition-all" aria-label="Instagram">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
                <a href="https://pinterest.com/kbdresses" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-kb-rose/10 hover:bg-kb-rose flex items-center justify-center text-kb-rose hover:text-white transition-all" aria-label="Pinterest">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.852-2.433-4.587 0-3.728 2.708-7.159 7.812-7.159 4.144 0 7.365 2.956 7.365 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.609 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z"/></svg>
                </a>
              </div>
            </div>

            {/* Explora */}
            <div>
              <h4 className="font-serif font-semibold text-kb-charcoal mb-5">EXPLORA</h4>
              <ul className="space-y-3 text-sm">
                <li><button onClick={() => handleNavigateWithScroll('/?genero=mujer')} className="text-kb-mauve hover:text-kb-rose transition-colors text-left w-full">Mujer</button></li>
                <li><button onClick={() => handleNavigateWithScroll('/?genero=hombre')} className="text-kb-mauve hover:text-kb-rose transition-colors text-left w-full">Hombre</button></li>
                <li><button onClick={() => handleNavigateWithScroll('/?categoria=vestidos')} className="text-kb-mauve hover:text-kb-rose transition-colors text-left w-full">Vestidos</button></li>
                <li><button onClick={() => handleNavigateWithScroll('/?categoria=carteras')} className="text-kb-mauve hover:text-kb-rose transition-colors text-left w-full">Carteras</button></li>
              </ul>
            </div>

            {/* Soporte */}
            <div>
              <h4 className="font-serif font-semibold text-kb-charcoal mb-5">SOPORTE</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="https://wa.me/51906877812?text=Hola,%20tengo%20una%20pregunta" target="_blank" rel="noopener noreferrer" className="text-kb-mauve hover:text-kb-rose transition-colors">Preguntas Frecuentes</a></li>
                <li><a href="https://wa.me/51906877812" target="_blank" rel="noopener noreferrer" className="text-kb-mauve hover:text-kb-rose transition-colors">Contacto</a></li>
                <li><span className="text-kb-mauve cursor-default">Política de Envíos</span></li>
                <li><span className="text-kb-mauve cursor-default">Cambios y Devoluciones</span></li>
              </ul>
            </div>

            {/* Contacto */}
            <div>
              <h4 className="font-serif font-semibold text-kb-charcoal mb-5">CONTACTO</h4>
              <ul className="space-y-3 text-sm text-kb-mauve">
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-kb-rose" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/></svg>
                  +51 906 877 812
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-kb-rose" fill="currentColor" viewBox="0 0 20 20"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/></svg>
                  info@kbdresses.com
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-kb-rose" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/></svg>
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