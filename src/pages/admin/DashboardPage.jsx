import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

const DashboardPage = () => {
  const [stats, setStats] = useState({
    totalProductos: 0,
    totalPedidos: 0,
    productosAgotados: 0,
    ventasRecientes: 0,
  })
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    cargarStats()
  }, [])

  const cargarStats = async () => {
    try {
      const { count: totalProductos } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })

      const { count: totalPedidos } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })

      const { count: productosAgotados } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('stock', 0)

      setStats({
        totalProductos: totalProductos || 0,
        totalPedidos: totalPedidos || 0,
        productosAgotados: productosAgotados || 0,
        ventasRecientes: totalPedidos || 0,
      })
    } catch (err) {
      console.error('Error al cargar estadísticas:', err)
    } finally {
      setCargando(false)
    }
  }

  const cards = [
    {
      title: 'Total Productos',
      value: stats.totalProductos,
      icon: '📦',
      color: 'bg-blue-50 text-blue-700',
      link: '/admin/productos',
    },
    {
      title: 'Pedidos Totales',
      value: stats.totalPedidos,
      icon: '📋',
      color: 'bg-green-50 text-green-700',
      link: '/admin/pedidos',
    },
    {
      title: 'Productos Agotados',
      value: stats.productosAgotados,
      icon: '⚠️',
      color: 'bg-red-50 text-red-700',
      link: '/admin/productos',
    },
    {
      title: 'Ventas Recientes',
      value: stats.ventasRecientes,
      icon: '💰',
      color: 'bg-purple-50 text-purple-700',
      link: '/admin/pedidos',
    },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

      {cargando ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((card) => (
            <Link
              key={card.title}
              to={card.link}
              className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">{card.icon}</span>
              </div>
              <p className="text-sm text-gray-500 mb-1">{card.title}</p>
              <p className="text-3xl font-bold text-gray-800">{card.value}</p>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Acciones rápidas
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/admin/productos"
            className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            + Nuevo producto
          </Link>
          <Link
            to="/admin/pedidos"
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Ver pedidos
          </Link>
          <Link
            to="/"
            target="_blank"
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Ver tienda →
          </Link>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage