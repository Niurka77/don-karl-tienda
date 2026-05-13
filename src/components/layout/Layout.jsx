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

  // Efecto para cambiar el header al hacer scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-kb-gray flex flex-col">
      {/* Header Principal */}
      <header 
        className={`sticky top-0 z-40 transition-all duration-500 ${
          scrolled 
            ? 'bg-white/95 backdrop-blur-md shadow-lg shadow-pink-100/30' 
            : 'bg-white'
        }`}
      >
        {/* Barra superior con info */}
        <div className="bg-gradient-to-r from-kb-pink-dark via-kb-pink to-kb-pink-dark text-white text-xs py-2 px-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"/>
                </svg>
                Envíos a todo el Perú
              </span>
              <span className="hidden sm:inline flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                </svg>
                Productos importados de EE.UU.
              </span>
            </div>
            <span className="hidden md:inline font-medium tracking-wide">
              ✨ Nueva Colección 2024
            </span>
          </div>
        </div>

        {/* Navegación Principal */}
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-8">
            
            {/* Navegación Izquierda */}
            <nav className="hidden lg:flex items-center gap-1 flex-1">
              <button
                onClick={() => navigate('/?genero=mujer')}
                className="group relative px-4 py-2 text-sm font-medium text-gray-700 hover:text-kb-pink-dark transition-colors duration-300"
              >
                <span className="relative z-10">MUJER</span>
                <span className="absolute inset-0 bg-kb-pink/10 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
              </button>
              <button
                onClick={() => navigate('/?genero=hombre')}
                className="group relative px-4 py-2 text-sm font-medium text-gray-700 hover:text-kb-pink-dark transition-colors duration-300"
              >
                <span className="relative z-10">HOMBRE</span>
                <span className="absolute inset-0 bg-kb-pink/10 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
              </button>
              <Link
                to="/nosotros"
                className="group relative px-4 py-2 text-sm font-medium text-gray-700 hover:text-kb-pink-dark transition-colors duration-300"
              >
                <span className="relative z-10">NOSOTROS</span>
                <span className="absolute inset-0 bg-kb-pink/10 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
              </Link>
            </nav>

            {/* Logo Centrado */}
            <Link to="/" className="flex-shrink-0 group">
              <div className="flex flex-col items-center">
                <div className="relative">
                  
                <img
  src={logoKB}
  alt="KB Dresses and More"
  className="w-24 md:w-32 object-contain group-hover:scale-105 transition-transform duration-300"
/>
                </div>
                
              </div>
            </Link>

            {/* Navegación Derecha + Carrito */}
            <div className="flex items-center gap-1 flex-1 justify-end">
              <Link
                to="/ayuda"
                className="hidden lg:block group relative px-4 py-2 text-sm font-medium text-gray-700 hover:text-kb-pink-dark transition-colors duration-300"
              >
                <span className="relative z-10">AYUDA</span>
                <span className="absolute inset-0 bg-kb-pink/10 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-right"></span>
              </Link>
              <Link
                to="/contacto"
                className="hidden lg:block group relative px-4 py-2 text-sm font-medium text-gray-700 hover:text-kb-pink-dark transition-colors duration-300"
              >
                <span className="relative z-10">CONTACTO</span>
                <span className="absolute inset-0 bg-kb-pink/10 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-right"></span>
              </Link>
              
              {/* Separador */}
              <div className="hidden lg:block w-px h-6 bg-gray-300 mx-2"></div>
              
              {/* Botón Carrito */}
              <button
                onClick={toggleCart}
                className="relative group p-3 rounded-full hover:bg-kb-pink/10 transition-all duration-300"
              >
                <svg className="w-6 h-6 text-gray-700 group-hover:text-kb-pink-dark transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-br from-kb-pink to-kb-pink-dark text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-lg animate-pulse">
                    {itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Navegación Móvil */}
          <nav className="lg:hidden flex items-center justify-center gap-4 mt-4 pt-4 border-t border-gray-100">
            <button
              onClick={() => navigate('/?genero=mujer')}
              className="px-3 py-1.5 text-xs font-medium text-gray-700 hover:text-kb-pink-dark hover:bg-kb-pink/5 rounded-full transition-all"
            >
              Mujer
            </button>
            <button
              onClick={() => navigate('/?genero=hombre')}
              className="px-3 py-1.5 text-xs font-medium text-gray-700 hover:text-kb-pink-dark hover:bg-kb-pink/5 rounded-full transition-all"
            >
              Hombre
            </button>
            <Link
              to="/nosotros"
              className="px-3 py-1.5 text-xs font-medium text-gray-700 hover:text-kb-pink-dark hover:bg-kb-pink/5 rounded-full transition-all"
            >
              Nosotros
            </Link>
            <Link
              to="/ayuda"
              className="px-3 py-1.5 text-xs font-medium text-gray-700 hover:text-kb-pink-dark hover:bg-kb-pink/5 rounded-full transition-all"
            >
              Ayuda
            </Link>
            <Link
              to="/contacto"
              className="px-3 py-1.5 text-xs font-medium text-gray-700 hover:text-kb-pink-dark hover:bg-kb-pink/5 rounded-full transition-all"
            >
              Contacto
            </Link>
          </nav>
        </div>
      </header>

      {/* Contenido dinámico */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* WhatsApp Button */}
      <WhatsAppButton phoneNumber="51906877812" />

      {/* Carrito Drawer */}
      <CartDrawer />

      {/* Footer Elegante */}
      <footer className="bg-gradient-to-b from-white to-kb-gray border-t border-kb-pink/20 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-3xl font-black bg-gradient-to-r from-kb-pink-dark to-kb-pink bg-clip-text text-transparent">
                  KB
                </span>
                <span className="text-xs text-kb-pink-dark font-medium tracking-[0.2em]">
                  DRESSES AND MORE
                </span>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-4 max-w-md">
                Importamos directamente desde EE.UU. las mejores tendencias en moda para ti. 
                Calidad garantizada y envíos a todo el Perú.
              </p>
              <div className="flex items-center gap-4">
                <a href="#" className="w-8 h-8 rounded-full bg-kb-pink/10 flex items-center justify-center text-kb-pink-dark hover:bg-kb-pink hover:text-white transition-all">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="#" className="w-8 h-8 rounded-full bg-kb-pink/10 flex items-center justify-center text-kb-pink-dark hover:bg-kb-pink hover:text-white transition-all">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z"/>
                  </svg>
                </a>
                <a href="#" className="w-8 h-8 rounded-full bg-kb-pink/10 flex items-center justify-center text-kb-pink-dark hover:bg-kb-pink hover:text-white transition-all">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Links Rápidos */}
            <div>
              <h4 className="font-semibold text-gray-800 mb-3 text-sm tracking-wide">ENLACES</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/?genero=mujer" className="text-gray-600 hover:text-kb-pink-dark transition-colors">Mujer</Link></li>
                <li><Link to="/?genero=hombre" className="text-gray-600 hover:text-kb-pink-dark transition-colors">Hombre</Link></li>
                <li><Link to="/nosotros" className="text-gray-600 hover:text-kb-pink-dark transition-colors">Nosotros</Link></li>
                <li><Link to="/ayuda" className="text-gray-600 hover:text-kb-pink-dark transition-colors">Ayuda</Link></li>
              </ul>
            </div>

            {/* Contacto */}
            <div>
              <h4 className="font-semibold text-gray-800 mb-3 text-sm tracking-wide">CONTACTO</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 mt-0.5 text-kb-pink-dark" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                  </svg>
                  <span>WhatsApp: +51 906 877 812</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 mt-0.5 text-kb-pink-dark" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                  </svg>
                  <span>info@kbdresses.com</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 mt-0.5 text-kb-pink-dark" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                  </svg>
                  <span>Envíos a todo el Perú</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-kb-pink/20 pt-6 text-center">
            <p className="text-gray-500 text-sm">
              © 2024 KB Dresses and More - Todos los derechos reservados
            </p>
            <p className="text-gray-400 text-xs mt-2">
              Importado directamente desde EE.UU. 💗
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout