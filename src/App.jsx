import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import AdminLayout from './components/admin/AdminLayout'
import ProtectedRoute from './components/admin/ProtectedRoute'
import HomePage from './pages/HomePage'
import ProductoPage from './pages/ProductoPage'
import CheckoutPage from './pages/CheckoutPage'
import LoginPage from './pages/admin/LoginPage'
import DashboardPage from './pages/admin/DashboardPage'
import ProductosPage from './pages/admin/ProductosPage'
import PedidosPage from './pages/admin/PedidosPage'
import AdminVideos from './components/admin/AdminVideos'
import HeroSlidesManager from './components/admin/HeroSlidesManager'
function App() {
  return (
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
    </Routes>
  )
}

export default App