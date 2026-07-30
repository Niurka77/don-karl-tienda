import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import { useAdminNotifications } from '../../hooks/useAdminNotifications'
import { useNotificationCenter } from '../../context/NotificationContext'

const VentaRapidaModal = ({ abierto, onCerrar }) => {
  const [busqueda, setBusqueda] = useState('')
  const [resultados, setResultados] = useState([])
  const [items, setItems] = useState([])
  const [cargando, setCargando] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [nombreCliente, setNombreCliente] = useState('')
  const inputRef = useRef(null)
  const { agregarToast, ToastContainer } = useAdminNotifications()
  const { pushNotification } = useNotificationCenter()

  useEffect(() => {
    if (abierto) {
      setBusqueda('')
      setResultados([])
      setItems([])
      setNombreCliente('')
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [abierto])

  const buscar = useCallback(async (term) => {
    if (!term || term.length < 2) { setResultados([]); return }
    const { data } = await supabase
      .from('products')
      .select('id, name, sku, stock, price_original, image_url')
      .or(`name.ilike.%${term}%,sku.ilike.%${term}%`)
      .gt('stock', 0)
      .limit(8)
    setResultados(data || [])
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => buscar(busqueda), 300)
    return () => clearTimeout(timer)
  }, [busqueda, buscar])

  const agregarItem = (producto) => {
    setItems(prev => {
      const existente = prev.find(i => i.id === producto.id)
      if (existente) return prev.map(i => i.id === producto.id ? { ...i, cantidad: i.cantidad + 1 } : i)
      return [...prev, { id: producto.id, name: producto.name, sku: producto.sku, price: producto.price_original, cantidad: 1, stock: producto.stock, image_url: producto.image_url }]
    })
    setBusqueda('')
    setResultados([])
    inputRef.current?.focus()
  }

  const cambiarCantidad = (id, cantidad) => {
    if (cantidad <= 0) { setItems(prev => prev.filter(i => i.id !== id)); return }
    setItems(prev => prev.map(i => i.id === id ? { ...i, cantidad: Math.min(cantidad, i.stock) } : i))
  }

  const total = items.reduce((sum, i) => sum + i.price * i.cantidad, 0)

  const handleEnviar = async () => {
    if (items.length === 0) { agregarToast('Agrega al menos un producto', 'warning'); return }
    setEnviando(true)
    try {
      const orderData = {
        customer_name: nombreCliente.trim() || 'Venta en tienda',
        products: items.map(i => ({ id: i.id, name: i.name, sku: i.sku, size: null, quantity: i.cantidad, price: i.price })),
        total,
        status: 'entregado',
        payment_method: 'efectivo',
        created_at: new Date().toISOString(),
      }

      const { data, error } = await supabase.from('orders').insert(orderData).select().single()
      if (error) throw error

      for (const item of items) {
        await supabase.rpc('decrementar_stock', { product_id: item.id, cantidad: item.cantidad })
      }

      agregarToast(`Venta rápida registrada — S/ ${total.toFixed(2)}`, 'success')
      pushNotification({ title: 'Venta en tienda', body: `${items.length} producto(s) — S/ ${total.toFixed(2)}`, type: 'success', link: '/admin/pedidos' })
      onCerrar()
    } catch (err) {
      agregarToast('Error al registrar venta', 'error')
    } finally {
      setEnviando(false)
    }
  }

  if (!abierto) return null

  return (
    <>
      <ToastContainer />
      <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center pt-[10vh]" onClick={onCerrar}>
        <div className="bg-white rounded-sm shadow-xl w-full max-w-lg mx-4 max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-display text-lg font-light text-gray-800">Venta rápida</h2>
            <button onClick={onCerrar} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
          </div>

          {/* Buscador */}
          <div className="px-6 py-4 border-b border-gray-50">
            <div className="relative">
              <input ref={inputRef} type="text" value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar producto por nombre o SKU..." className="w-full px-3 py-2 border border-gray-200 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-gray-400" />
              {resultados.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-sm shadow-lg z-10 max-h-48 overflow-y-auto">
                  {resultados.map(p => (
                    <button key={p.id} onClick={() => agregarItem(p)} className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 text-left">
                      <img src={p.image_url || 'https://placehold.co/32x32/F2C4CE/9A7480?text=KB'} alt="" className="w-8 h-8 rounded-sm object-cover bg-gray-100" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                        <p className="text-xs text-gray-500">Stock: {p.stock} · S/ {p.price_original?.toFixed(2)}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
            {items.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">Busca y agrega productos</p>
            ) : (
              items.map(item => (
                <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-sm">
                  <img src={item.image_url || 'https://placehold.co/40x40/F2C4CE/9A7480?text=KB'} alt="" className="w-10 h-10 rounded-sm object-cover bg-gray-100" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                    <p className="text-xs text-gray-500">S/ {item.price?.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => cambiarCantidad(item.id, item.cantidad - 1)} className="w-7 h-7 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-200 text-sm">&minus;</button>
                    <span className="w-8 text-center text-sm font-medium">{item.cantidad}</span>
                    <button onClick={() => cambiarCantidad(item.id, item.cantidad + 1)} className="w-7 h-7 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-200 text-sm">+</button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100 space-y-3">
            <input type="text" value={nombreCliente} onChange={e => setNombreCliente(e.target.value)} placeholder="Nombre del cliente (opcional)" className="w-full px-3 py-2 border border-gray-200 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-gray-400" />
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total: <strong className="text-gray-800">S/ {total.toFixed(2)}</strong></span>
              <div className="flex gap-2">
                <button onClick={onCerrar} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 font-medium">Cancelar</button>
                <button onClick={handleEnviar} disabled={enviando || items.length === 0} className="px-5 py-2 bg-gray-900 text-white rounded-sm text-sm font-medium hover:bg-gray-800 disabled:opacity-40 transition-colors">
                  {enviando ? 'Registrando...' : 'Registrar venta'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default VentaRapidaModal
