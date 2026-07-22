import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import AdminLayout from './components/admin/AdminLayout'
import ProtectedRoute from './components/admin/ProtectedRoute'
import LoginPage from './pages/admin/LoginPage'

const HomePage = lazy(() => import('./pages/HomePage'))
const ProductoPage = lazy(() => import('./pages/ProductoPage'))
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'))
const DashboardPage = lazy(() => import('./pages/admin/DashboardPage'))
const ProductosPage = lazy(() => import('./pages/admin/ProductosPage'))
const PedidosPage = lazy(() => import('./pages/admin/PedidosPage'))
const AdminVideos = lazy(() => import('./components/admin/AdminVideos'))
const HeroSlidesManager = lazy(() => import('./components/admin/HeroSlidesManager'))

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-kb-ivory)' }}>
    <div className="w-8 h-8 border-4 border-[#E8D5B7] border-t-[#C9607F] rounded-full animate-spin" />
  </div>
)

const NotFoundPage = () => (
  <div
    className="min-h-screen flex items-center justify-center"
    style={{ background: 'var(--color-kb-ivory)' }}
  >
    <div className="text-center px-6">
      <div
        style={{
          width: '48px',
          height: '1px',
          background: 'rgba(212,120,138,0.4)',
          margin: '0 auto 2rem',
        }}
      />
      <p
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '4rem',
          fontWeight: 300,
          fontStyle: 'italic',
          color: 'var(--color-kb-rose)',
          marginBottom: '0.5rem',
        }}
      >
        404
      </p>
      <p
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.3rem',
          fontWeight: 300,
          fontStyle: 'italic',
          color: 'var(--color-kb-mauve)',
          marginBottom: '1.5rem',
        }}
      >
        Página no encontrada
      </p>
      <a href="/" className="btn-kb-ghost">
        ← Volver a la tienda
      </a>
    </div>
  </div>
)

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
    <Routes>
      {/* Rutas públicas */}
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="producto/:id" element={<ProductoPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
      </Route>

      {/* Login (sin layout) */}
      <Route path="/admin/login" element={<LoginPage />} />

      {/* Rutas protegidas del admin */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="productos" element={<ProductosPage />} />
        <Route path="pedidos" element={<PedidosPage />} />
        <Route path="videos" element={<AdminVideos />} /> 
        <Route path="/admin/slides" element={<HeroSlidesManager />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
    </Suspense>
  )
}

export default App