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
      setScrolled(window.scrollY > 20)
    }
    
    window.addEventListener('scroll', handleScroll)
    
    // ✅ CLEANUP: Remover event listener al desmontar
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header con Glassmorphism Premium */}
      <header 
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${
          scrolled 
            ? 'bg-white/80 backdrop-blur-xl border-b border-border/50 shadow-glass' 
            : 'bg-white border-b border-border/30'
        }`}
      >
        <div className="max-w-[90rem] mx-auto px-6 lg:px-8">
          {/* Top Bar (Info) - Refinado */}
          <div className="hidden lg:flex items-center justify-between py-2 text-[11px] tracking-wide text-muted-foreground border-b border-border/50">
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-1.5">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"/>
                </svg>
                Envíos a todo el Perú
              </span>
              <span>Compra 100% segura</span>
            </div>
            <span className="font-medium">
              📦 Importado directamente de EE.UU.
            </span>
          </div>

          {/* Navegación Principal */}
          <div className="flex items-center justify-between gap-6 lg:gap-12 py-4 lg:py-5">
            
            {/* Menú Izquierda */}
            <nav className="hidden lg:flex items-center gap-1">
              {['MUJER', 'HOMBRE', 'NOSOTROS'].map((item) => (
                <button
                  key={item}
                  onClick={() => navigate(`/?genero=${item.toLowerCase()}`)}
                  className="relative px-5 py-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors duration-300 group"
                >
                  {item}
                  <span className="absolute bottom-0 left-1/2 w-0 h-[1.5px] bg-foreground group-hover:w-1/2 group-hover:left-1/4 transition-all duration-300"></span>
                </button>
              ))}
            </nav>

            {/* Logo Centrado */}
            <Link to="/" className="flex-shrink-0 group">
              <img
                src={logoKB}
                alt="KB Dresses and More"
                className="w-28 md:w-32 object-contain transition-all duration-700 group-hover:opacity-80"
              />
            </Link>

            {/* Menú Derecha + Carrito */}
            <div className="flex items-center gap-1 lg:gap-4">
              <nav className="hidden lg:flex items-center gap-1">
                {/* ✅ CORREGIDO: Enlaces que no tienen página → redirigen a WhatsApp */}
                <a
                  href="https://wa.me/51906877812?text=Hola,%20necesito%20ayuda%20con%20mi%20pedido"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors duration-300"
                >
                  AYUDA
                </a>
                <a
                  href="https://wa.me/51906877812?text=Hola,%20quiero%20contactar%20contigo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors duration-300"
                >
                  CONTACTO
                </a>
              </nav>
              
              <div className="w-px h-5 bg-border hidden lg:block"></div>
              
              {/* Botón Carrito Rediseñado */}
              <button
                onClick={toggleCart}
                className="relative group p-2 rounded-full hover:bg-muted transition-all duration-300"
                aria-label={`Carrito de compras (${itemCount} artículos)`}
              >
                <svg className="w-5 h-5 text-foreground/80 group-hover:text-foreground transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-foreground text-background text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Navegación Móvil */}
          <nav className="lg:hidden flex items-center justify-center gap-6 py-3 border-t border-border/50 text-xs font-medium">
            <button onClick={() => navigate('/?genero=mujer')} className="text-foreground/70 hover:text-foreground">Mujer</button>
            <button onClick={() => navigate('/?genero=hombre')} className="text-foreground/70 hover:text-foreground">Hombre</button>
            <Link to="/nosotros" className="text-foreground/70 hover:text-foreground">Nosotros</Link>
            {/* ✅ CORREGIDO: Ayuda → WhatsApp */}
            <a
              href="https://wa.me/51906877812?text=Hola,%20necesito%20ayuda"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground/70 hover:text-foreground"
            >
              Ayuda
            </a>
          </nav>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="flex-1 pt-[88px] lg:pt-[104px]">
        <Outlet />
      </main>

      {/* WhatsApp Button */}
      <WhatsAppButton phoneNumber="51906877812" />

      {/* Cart Drawer */}
      <CartDrawer />

      {/* Footer Rediseñado - Editorial */}
      <footer className="border-t border-border bg-muted/30 mt-24">
        <div className="max-w-[90rem] mx-auto px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">
            
            {/* Brand */}
            <div className="lg:col-span-1">
              <img src={logoKB} alt="KB Dresses and More" className="w-24 opacity-80 mb-6" />
              <p className="text-muted-foreground text-sm leading-relaxed mb-6 max-w-xs">
                Moda de autor importada desde Estados Unidos. Curada para quienes buscan piezas únicas con historia.
              </p>
              <div className="flex items-center gap-5">
                {['facebook', 'instagram', 'pinterest'].map((social) => (
                  <a 
                    key={social} 
                    href="#" 
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={social}
                  >
                    <div className="w-5 h-5 bg-current rounded-full opacity-50 hover:opacity-100 transition"></div>
                  </a>
                ))}
              </div>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-serif text-sm font-semibold tracking-wider mb-5">EXPLORA</h4>
              <ul className="space-y-3 text-sm">
                <li><Link to="/?genero=mujer" className="text-muted-foreground hover:text-foreground transition">Mujer</Link></li>
                <li><Link to="/?genero=hombre" className="text-muted-foreground hover:text-foreground transition">Hombre</Link></li>
                {/* ✅ CORREGIDO: /coleccion → filtro de categoría */}
                <li><Link to="/?categoria=vestidos" className="text-muted-foreground hover:text-foreground transition">Colección Primavera</Link></li>
                {/* ✅ CORREGIDO: /outlet → filtro de precio */}
                <li><Link to="/?orden=price_original-asc" className="text-muted-foreground hover:text-foreground transition">Outlet</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-serif text-sm font-semibold tracking-wider mb-5">SOPORTE</h4>
              <ul className="space-y-3 text-sm">
                {/* ✅ CORREGIDO: Enlaces sin página → WhatsApp o texto estático */}
                <li>
                  <a
                    href="https://wa.me/51906877812?text=Hola,%20tengo%20una%20pregunta"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition"
                  >
                    Preguntas Frecuentes
                  </a>
                </li>
                <li>
                  <a
                    href="https://wa.me/51906877812"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition"
                  >
                    Contacto
                  </a>
                </li>
                <li>
                  <span className="text-muted-foreground cursor-default">Política de Envíos</span>
                </li>
                <li>
                  <span className="text-muted-foreground cursor-default">Cambios y Devoluciones</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-serif text-sm font-semibold tracking-wider mb-5">CONTACTO DIRECTO</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-center gap-3">
                  <span>📱</span> <span>+51 906 877 812</span>
                </li>
                <li className="flex items-center gap-3">
                  <span>✉️</span> <span>info@kbdresses.com</span>
                </li>
                <li className="flex items-center gap-3">
                  <span>📍</span> <span>Galería Chiclayo - 2do Piso</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border/50 mt-16 pt-8 text-center text-xs text-muted-foreground">
            <p>© 2024 KB Dresses and More — Hecho con propósito en Perú.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout