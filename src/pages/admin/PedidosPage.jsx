import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

const PedidosPage = () => {
  const [pedidos, setPedidos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    cargarPedidos()
  }, [])

  const cargarPedidos = async () => {
    try {
      setCargando(true)
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setPedidos(data || [])
    } catch (err) {
      console.error('Error:', err)
      setError('No se pudieron cargar los pedidos')
    } finally {
      setCargando(false)
    }
  }

  const actualizarEstado = async (id, nuevoEstado) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: nuevoEstado })
        .eq('id', id)

      if (error) throw error

      setPedidos(
        pedidos.map((p) =>
          p.id === id ? { ...p, status: nuevoEstado } : p
        )
      )
    } catch (err) {
      console.error('Error al actualizar:', err)
      alert('Error al actualizar el pedido')
    }
  }

  const getEstadoColor = (status) => {
    const colores = {
      pendiente: 'bg-yellow-100 text-yellow-700',
      confirmado: 'bg-blue-100 text-blue-700',
      enviado: 'bg-purple-100 text-purple-700',
      entregado: 'bg-green-100 text-green-700',
    }
    return colores[status] || 'bg-gray-100 text-gray-700'
  }

  if (cargando) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Pedidos</h1>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {pedidos.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <p className="text-gray-500">No hay pedidos aún</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pedidos.map((pedido) => (
            <div
              key={pedido.id}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm font-mono text-gray-500">
                    #{pedido.id.slice(0, 8).toUpperCase()}
                  </p>
                  <p className="font-semibold text-gray-800 mt-1">
                    {pedido.customer_name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {pedido.customer_city} • {pedido.customer_phone}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getEstadoColor(pedido.status)}`}
                  >
                    {pedido.status}
                  </span>
                  <p className="text-xl font-bold text-gray-800 mt-2">
                    ${pedido.total?.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-3">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                  Productos
                </p>
                {pedido.products?.map((prod, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between text-sm py-1"
                  >
                    <span className="text-gray-700">
                      {prod.name} ({prod.talla}) ×{prod.cantidad}
                    </span>
                    <span className="text-gray-600">
                      ${prod.subtotal?.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-3 mt-3 flex gap-2">
                {['pendiente', 'confirmado', 'enviado', 'entregado'].map(
                  (estado) => (
                    <button
                      key={estado}
                      onClick={() => actualizarEstado(pedido.id, estado)}
                      disabled={pedido.status === estado}
                      className={`px-3 py-1 text-xs rounded-full font-medium transition-all ${
                        pedido.status === estado
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {estado}
                    </button>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default PedidosPage