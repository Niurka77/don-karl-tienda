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
  const [productosEstancados, setProductosEstancados] = useState([])
  const [aplicandoDescuento, setAplicandoDescuento] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    cargarStats()
    cargarEstancados()
  }, [])

  const cargarStats = async () => {
    try {
      setError(null)
      const { count: totalProductos, error: errorProductos } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })

      if (errorProductos) throw errorProductos

      const { count: totalPedidos, error: errorPedidos } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })

      if (errorPedidos) throw errorPedidos

      const { count: productosAgotados, error: errorAgotados } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('stock', 0)

      if (errorAgotados) throw errorAgotados

      setStats({
        totalProductos: totalProductos || 0,
        totalPedidos: totalPedidos || 0,
        productosAgotados: productosAgotados || 0,
        ventasRecientes: totalPedidos || 0,
      })
    } catch (err) {
      console.error('Error al cargar estadísticas:', err)
      setError('No se pudieron cargar las estadísticas')
    } finally {
      setCargando(false)
    }
  }

  const cargarEstancados = async () => {
    try {
      const fechaLimite = new Date()
      fechaLimite.setDate(fechaLimite.getDate() - 15)

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .gt('stock', 0)
        .or(
          `and(last_sale_date.is.null,created_at.lt.${fechaLimite.toISOString()}),last_sale_date.lt.${fechaLimite.toISOString()}`
        )
        .order('created_at', { ascending: true })
        .limit(10)

      if (error) throw error
      setProductosEstancados(data || [])
    } catch (err) {
      console.error('Error al cargar estancados:', err)
    }
  }

  const aplicarDescuento = async (producto) => {
    // ✅ CONFIRMACIÓN: Preguntar antes de aplicar
    const confirmacion = window.confirm(
      `¿Aplicar descuento del ${Math.min((producto.discount_percent || 0) + 10, 50)}% a "${producto.name}"?`
    )
    
    if (!confirmacion) return

    setAplicandoDescuento(producto.id)
    try {
      const nuevoDescuento = Math.min(
        (producto.discount_percent || 0) + 10,
        50
      )

      const { error } = await supabase
        .from('products')
        .update({
          discount_percent: nuevoDescuento,
          is_new: false,
        })
        .eq('id', producto.id)

      if (error) throw error

      // ✅ ACTUALIZAR UI: Remover de la lista inmediatamente
      setProductosEstancados(
        productosEstancados.map((p) =>
          p.id === producto.id 
            ? { ...p, discount_percent: nuevoDescuento, is_new: false }
            : p
        )
      )
      
      alert(`✅ Descuento del ${nuevoDescuento}% aplicado correctamente`)
    } catch (err) {
      console.error('Error al aplicar descuento:', err)
      alert('❌ Error al aplicar el descuento. Intenta nuevamente.')
    } finally {
      setAplicandoDescuento(null)
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

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {cargando ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
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

          {/* Productos estancados */}
          {productosEstancados.length > 0 && (
            <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  📦 Productos con baja rotación
                </h2>
                <span className="text-sm text-gray-500">
                  {productosEstancados.length} producto{productosEstancados.length !== 1 ? 's' : ''}
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-4">
                Productos con stock sin ventas hace más de 15 días. Aplica un descuento para acelerar su salida.
              </p>
              <div className="space-y-3">
                {productosEstancados.map((producto) => (
                  <div
                    key={producto.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-amber-50 rounded-lg border border-amber-200"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={producto.image_url || 'https://via.placeholder.com/48'}
                        alt={producto.name}
                        className="w-12 h-12 rounded object-cover bg-gray-100 flex-shrink-0"
                      />
                      <div>
                        <p className="font-medium text-gray-800 text-sm">
                          {producto.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          Stock: {producto.stock} | Precio: ${producto.price_original?.toFixed(2)}
                          {producto.discount_percent > 0 && (
                            <span className="text-red-500 ml-2">
                              (-{producto.discount_percent}% actual)
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => aplicarDescuento(producto)}
                      disabled={aplicandoDescuento === producto.id}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      {aplicandoDescuento === producto.id ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                          Aplicando...
                        </span>
                      ) : (
                        `Aplicar -${Math.min((producto.discount_percent || 0) + 10, 50)}%`
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Acciones rápidas */}
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
                rel="noopener noreferrer"
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Ver tienda →
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default DashboardPage