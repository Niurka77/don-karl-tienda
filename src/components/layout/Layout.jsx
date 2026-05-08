import WhatsAppButton from '../ui/WhatsAppButton'
import { Outlet, Link, useNavigate } from 'react-router-dom'
import CartDrawer from '../carrito/CartDrawer'
import useCartStore from '../../store/cartStore'

const Layout = () => {
  const navigate = useNavigate()
  const { toggleCart, getItemCount } = useCartStore()
  const itemCount = getItemCount()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-gray-800 tracking-tight hover:text-gray-600 transition-colors">
            DON KARL
          </Link>
          <nav className="flex items-center gap-4">
            <button
              onClick={() => navigate('/?genero=mujer')}
              className="text-gray-600 hover:text-gray-800 transition-colors text-sm font-medium"
            >
              Mujer
            </button>
            <button
              onClick={() => navigate('/?genero=hombre')}
              className="text-gray-600 hover:text-gray-800 transition-colors text-sm font-medium"
            >
              Hombre
            </button>
            <button
              onClick={toggleCart}
              className="relative p-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-black text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
                  {itemCount}
                </span>
              )}
            </button>
          </nav>
        </div>
      </header>

      {/* Contenido dinámico */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Carrito Drawer */}
      <CartDrawer />
<WhatsAppButton phoneNumber="51906877812" />
      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-gray-500 text-sm">
          © 2024 Don Karl - Todos los derechos reservados
        </div>
      </footer>
    </div>
  )
}

export default Layout