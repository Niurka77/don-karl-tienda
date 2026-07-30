import { useState, useEffect, useMemo, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { useAdminNotifications } from '../../hooks/useAdminNotifications'
import { useNotificationCenter } from '../../context/NotificationContext'

const PedidosPage = () => {
  const [pedidos, setPedidos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  
  // Estadísticas
  const [stats, setStats] = useState({
    totalHoy: 0,
    pendientes: 0,
    ingresosSemana: 0,
    porEnviar: 0,
  })
  
  // Filtros y Búsqueda
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [filtroFecha, setFiltroFecha] = useState('')
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')
  
  // Paginación
  const [paginaActual, setPaginaActual] = useState(1)
  const POR_PAGINA = 10

  // Modal de eliminación
  const [modalEliminar, setModalEliminar] = useState({ abierto: false, pedido: null })

  // Modal de cotización
  const [modalCotizacion, setModalCotizacion] = useState({ abierto: false, pedido: null })
  const [preciosEditados, setPreciosEditados] = useState({})
  const [notasCotizacion, setNotasCotizacion] = useState('')

  // 🔔 Usar hook centralizado de notificaciones
  const { agregarToast, ToastContainer } = useAdminNotifications()
  const { pushNotification } = useNotificationCenter()

  // Ref para detectar primera carga (evita notificación falsa)
  const primeraCargaRef = useRef(true)

  useEffect(() => {
    cargarPedidos()
    calcularEstadisticas()
    
    // 🔄 REALTIME: Escuchar cambios en tiempo real (más eficiente que polling)
    const subscription = supabase
      .channel('pedidos-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'orders' }, 
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setPedidos(prev => [payload.new, ...prev])
            agregarToast(`🆕 Nuevo pedido de ${payload.new.customer_name}`, 'success')
            pushNotification({ title: 'Nuevo pedido', body: `${payload.new.customer_name ?? 'Cliente'} — pendiente`, type: 'success', link: '/admin/pedidos' })
            calcularEstadisticas()
            try {
              const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACAf39/f4B/f3+AgH9/f3+Af39/gIB/f39/gH9/f4B/f3+AgH9/f3+Af39/gIB/f39/gH9/f4B/f3+AgH9/f39/gH9/f4B/f3+AgH9/f39/gH9/f4B/f3+AgH9/f39/gH9/f4B/f4B/f39/gH9/f4B/f4B/f3+AgH9/f4B/f4B/f3+AgH9/f4B/f4B/f3+AgH9/gH9/f39/gH9/gH+Af39/gH9/gH+Af39/gH9/gH+Af39/gH9/gICAf39/gH9/gICAf3+AgH9/gICAf3+AgH9/gICAf3+AgH+AgICAf3+AgH+AgICAf3+AgH+AgICAf3+AgH+AgICAf3+AgICAf39/gICAf3+AgICAf3+AgICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf4B/gICAf4B/gICAf4B/gICAf4B/gICAf4B/gICAf4B/gICAf4B/gICAf4B/gICAf4B/gICAf4B/gICAf4B/gICAf4B/gICAf4B/gICAf4B/gICAf4B/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf39/gICAf4B/gICAf39/gICAf4B/gICAf3+AgH+AgICAf3+AgH+AgICAf39/gH+AgICAf39/gH+AgH+Af39/gH+Af39/gH+Af39/gH+Af39/gH9/f39/gH9/gH9/f39/gH9/gH9/f4B/f39/gH9/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/f4B/f39/f4B/f39/f4B/f39/f39/gH9/f39/gH9/f39/gH9/f39/gH9/f39/gH9/f39/gH9/f39/gH9/f39/gH9/f39/gH9/f39/gH9/f39/gH9/f39/gH9/f39/gH9/f39/gH9/f39/gH9/f39/gH9/f39/gH9/f39/gH9/f39/gH9/f39/gH9/f39/gH9/f39/gH9/f39/gH9/f39/gH9/f39/gH9/f39/gH9/f39/gH9/f39/gH9/f39/gH9/f39/gH9/f39/gH9/f39/gH9/f39/gH9/f39/gH9/f39/gH9/f39/gH9/f39/gH9/f39/gH9/f39/gH9/f39/gH9/f39/gH9/f39/gH9/f39/gH9/f39/gH9/f39/gH9/f39/gH9/f39/gH9/f39/gH9/f39/gH9/f39/gH9/f39/gH9/f39/gH9/f39/gH9/f39/gH9/f39/gH9/f39/gH9/f39/gH9/f39/gH9/f39/gH9/f39/gH9/f39/gH9/f39/gH9/f39/gH9/f39/gH9/f39/gH9/f39/gH9/f39/gH9/f39/gH9/f39/gH9/f39/gH9/f39/gH9/f39/gH9/f39/gH9/f39/gH9/f39/gH9/f39/gH9/f39/gH9/f39/gH9/f39/gH9/f39/gH9/f39/gH9/f39/gH9/f39/gH9/f39/gH9/f39/gH9/f39/gH9/f39/gH9/f39/gH9/f39/gH9/f39/gH9/f39/gH9/f39/gH9/f39/gH9/f39/gH9/f39/gH9/f39/gH9/f39/gH9/f39/gH9/f39/gH9/f39/gH9/f39/gH9/f39/gH9/f39/gH9/f39/gH9/f39/gH9/f39/gH9/f39/gH9/f39/gH9/f39/gH9/f39/gH9/f39/gH9/f39/gH9/f39/gH9/f39/gH9/f3+')
              audio.volume = 0.3
              audio.play()
            } catch {}
          } else if (payload.eventType === 'UPDATE') {
            setPedidos(prev => prev.map(p => p.id === payload.new.id ? payload.new : p))
            calcularEstadisticas()
          } else if (payload.eventType === 'DELETE') {
            setPedidos(prev => prev.filter(p => p.id !== payload.old.id))
            calcularEstadisticas()
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [])

  // Resetear página al cambiar filtros
  useEffect(() => {
    setPaginaActual(1)
  }, [busqueda, filtroEstado, filtroFecha, fechaInicio, fechaFin])

  const cargarPedidos = async () => {
    try {
      setCargando(true)
      const { data, error: supaError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })

      if (supaError) throw supaError
      setPedidos(data || [])
      
      // Solo notificar si NO es la primera carga
      if (!primeraCargaRef.current) {
        const nuevosPedidos = data?.filter(p => p.status === 'pendiente') || []
        if (nuevosPedidos.length > 0) {
          agregarToast(`📦 ${nuevosPedidos.length} pedido(s) pendiente(s)`, 'warning')
        }
      }
      primeraCargaRef.current = false
    } catch (err) {
      console.error('Error cargando pedidos:', err)
      setError('No se pudieron cargar los pedidos')
      agregarToast('Error al cargar pedidos', 'error')
    } finally {
      setCargando(false)
    }
  }

  const calcularEstadisticas = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('status, total, created_at')
      
      if (error) throw error
      
      const hoy = new Date().toISOString().split('T')[0]
      const haceUnaSemana = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      
      const pedidosHoy = data?.filter(p => p.created_at?.startsWith(hoy)) || []
      const pendientes = data?.filter(p => p.status === 'pendiente') || []
      const porEnviar = data?.filter(p => p.status === 'confirmado' || p.status === 'enviado') || []
      
      const ingresosSemana = data
        ?.filter(p => p.created_at >= haceUnaSemana)
        .reduce((sum, p) => sum + Number(p.total || 0), 0) || 0
      
      setStats({
        totalHoy: pedidosHoy.length,
        pendientes: pendientes.length,
        ingresosSemana: ingresosSemana,
        porEnviar: porEnviar.length,
      })
    } catch (err) {
      console.error('Error calculando estadísticas:', err)
    }
  }

  const actualizarEstado = async (id, nuevoEstado) => {
    try {
      if (nuevoEstado === 'pagado') {
        const { data: pedido, error: fetchError } = await supabase
          .from('orders')
          .select('products')
          .eq('id', id)
          .single()
        if (!fetchError && pedido?.products) {
          for (const p of pedido.products) {
            await supabase.rpc('decrementar_stock', { product_id: p.id, cantidad: p.quantity || 1 })
          }
        }
      }

      const { error } = await supabase
        .from('orders')
        .update({ status: nuevoEstado })
        .eq('id', id)
      
      if (error) throw error
      
      setPedidos(pedidos.map(p => p.id === id ? { ...p, status: nuevoEstado } : p))
      agregarToast(`Estado actualizado a "${nuevoEstado}"`, 'success')
      const pedidoActual = pedidos.find(p => p.id === id)
      if (pedidoActual && ['pagado', 'cancelado', 'enviado', 'entregado'].includes(nuevoEstado)) {
        const typeMap = { pagado: 'success', cancelado: 'error', enviado: 'info', entregado: 'success' }
        pushNotification({ title: `Pedido ${nuevoEstado}`, body: `${pedidoActual.customer_name ?? 'Cliente'} — ${nuevoEstado}`, type: typeMap[nuevoEstado], link: '/admin/pedidos' })
      }
      calcularEstadisticas()
    } catch (err) {
      console.error('Error al actualizar:', err)
      agregarToast('Error al actualizar pedido', 'error')
    }
  }

  const handleEliminarPedido = async () => {
    const pedido = modalEliminar.pedido
    if (!pedido) return

    try {
      const { error } = await supabase.from('orders').delete().eq('id', pedido.id)
      if (error) throw error

      setPedidos(prev => prev.filter(p => p.id !== pedido.id))
      agregarToast('Pedido eliminado', 'success')
      calcularEstadisticas()
    } catch (err) {
      console.error('Error eliminando pedido:', err)
      agregarToast('Error al eliminar pedido', 'error')
    } finally {
      setModalEliminar({ abierto: false, pedido: null })
    }
  }

  const enviarWhatsApp = (pedido) => {
    const telefono = pedido.customer_phone?.replace(/\D/g, '') || ''
    if (!telefono) {
      agregarToast('No hay número de teléfono', 'warning')
      return
    }
    
    const mensaje = `Hola ${pedido.customer_name}, te contactamos sobre tu pedido #${String(pedido.id).substring(0, 8).toUpperCase()}. Estado actual: ${pedido.status}. Total: S/ ${Number(pedido.total || 0).toFixed(2)}`
    const url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`
    window.open(url, '_blank')
  }

  const enviarCotizacionWhatsApp = (pedido) => {
    const telefono = pedido.customer_phone?.replace(/\D/g, '') || ''
    if (!telefono) {
      agregarToast('No hay número de teléfono', 'warning')
      return
    }

    const productos = Array.isArray(pedido.products) ? pedido.products : []
    let total = 0
    const lines = productos.map((p, i) => {
      const precio = preciosEditados[p.id] ?? p.price ?? 0
      const sub = precio * (p.quantity || 1)
      total += sub
      return `${i + 1}. ${p.name}${p.size ? ` (${p.size})` : ''} x${p.quantity} — S/ ${Number(precio).toFixed(2)} c/u\n   Subtotal: S/ ${sub.toFixed(2)}`
    })

    const idCorto = String(pedido.id).substring(0, 8).toUpperCase()
    const notaAdicional = notasCotizacion ? `\n\n📝 *Notas:* ${notasCotizacion}` : ''

    const mensaje = `¡Hola *${pedido.customer_name}*!\n\nAquí está tu cotización de *KB Dresses & More*:\n\n📍 Pedido: #${idCorto}\n\n${lines.join('\n')}\n\n*Total: S/ ${total.toFixed(2)}*${notaAdicional}\n\nPara confirmar, solo responde este mensaje.\n\n¡Gracias por confiar en KB! ✦`

    const url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`
    window.open(url, '_blank')
  }

  const getEstadoColor = (status) => {
    const colores = {
      pendiente: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      aceptado: 'bg-teal-100 text-teal-700 border-teal-200',
      pagado: 'bg-blue-100 text-blue-700 border-blue-200',
      preparando: 'bg-indigo-100 text-indigo-700 border-indigo-200',
      enviado: 'bg-purple-100 text-purple-700 border-purple-200',
      entregado: 'bg-green-100 text-green-700 border-green-200',
      cancelado: 'bg-red-100 text-red-700 border-red-200',
      expirado: 'bg-gray-200 text-gray-600 border-gray-300',
    }
    return colores[status] || 'bg-gray-100 text-gray-700 border-gray-200'
  }

  const getEstadoLabel = (status) => {
    const labels = {
      pendiente: '⏳ Pendiente',
      aceptado: '👍 Aceptado',
      pagado: '💰 Pagado',
      preparando: '🟣 Preparando',
      enviado: '🚚 Enviado',
      entregado: '✅ Entregado',
      cancelado: '❌ Cancelado',
      expirado: '⏰ Expirado',
    }
    return labels[status] || status
  }

  // Filtrado avanzado
  const pedidosFiltrados = useMemo(() => {
    let res = pedidos

    if (busqueda) {
      const q = busqueda.toLowerCase()
      res = res.filter(p => 
        p.customer_name?.toLowerCase().includes(q) ||
        p.customer_phone?.includes(q) ||
        String(p.id).toLowerCase().includes(q) ||
        p.customer_email?.toLowerCase().includes(q)
      )
    }

    if (filtroEstado) {
      res = res.filter(p => p.status === filtroEstado)
    }

    if (filtroFecha) {
      const hoy = new Date().toISOString().split('T')[0]
      
      if (filtroFecha === 'hoy') {
        res = res.filter(p => p.created_at?.startsWith(hoy))
      } else if (filtroFecha === 'semana') {
        const haceUnaSemana = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        res = res.filter(p => p.created_at >= haceUnaSemana)
      } else if (filtroFecha === 'mes') {
        const haceUnMes = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        res = res.filter(p => p.created_at >= haceUnMes)
      }
    }

    if (fechaInicio && fechaFin) {
      res = res.filter(p => {
        const fechaPedido = p.created_at?.split('T')[0]
        return fechaPedido >= fechaInicio && fechaPedido <= fechaFin
      })
    }

    return res
  }, [pedidos, busqueda, filtroEstado, filtroFecha, fechaInicio, fechaFin])

  const totalPaginas = Math.ceil(pedidosFiltrados.length / POR_PAGINA)
  const pedidosPaginados = pedidosFiltrados.slice(
    (paginaActual - 1) * POR_PAGINA,
    paginaActual * POR_PAGINA
  )

  const formatearFecha = (fechaISO) => {
    if (!fechaISO) return '-'
    const fecha = new Date(fechaISO)
    return fecha.toLocaleDateString('es-PE', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatearMoneda = (monto) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2
    }).format(monto || 0)
  }

  return (
    <div className="min-h-screen bg-[#FFF8F5] p-4 md:p-6">
      <ToastContainer />

      {/* Modal Eliminar Pedido */}
      {modalEliminar.abierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-sm p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="font-display text-xl text-[#1A1118] mb-2">Confirmar eliminación</h3>
            <p className="text-sm text-gray-600 mb-6 font-sans">
              ¿Estás seguro de eliminar el pedido <strong>#{String(modalEliminar.pedido?.id).substring(0, 8).toUpperCase()}</strong>? Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setModalEliminar({ abierto: false, pedido: null })}
                className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-sm hover:bg-gray-50 font-sans"
              >
                Cancelar
              </button>
              <button
                onClick={handleEliminarPedido}
                className="flex-1 py-2.5 bg-[#B85268] text-white rounded-sm hover:bg-[#9A3A4C] font-sans transition-colors"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Gestión de Cotización */}
      {modalCotizacion.abierto && modalCotizacion.pedido && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-sm max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="sticky top-0 bg-white border-b border-[rgba(212,120,138,0.15)] px-6 py-4 flex items-center justify-between z-10">
              <h3 className="font-display text-xl text-[#1A1118]">
                Cotización #{String(modalCotizacion.pedido.id).substring(0, 8).toUpperCase()}
              </h3>
              <button
                onClick={() => setModalCotizacion({ abierto: false, pedido: null })}
                className="text-[#9A7480] hover:text-[#1A1118] text-xl leading-none"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Cliente */}
              <div>
                <p className="text-xs text-[#9A7480] font-sans uppercase tracking-wide mb-2">Cliente</p>
                <p className="font-sans text-sm text-[#1A1118] font-medium">{modalCotizacion.pedido.customer_name}</p>
                <p className="font-sans text-xs text-[#9A7480]">{modalCotizacion.pedido.customer_phone}</p>
              </div>

              {/* Productos con precio editable */}
              <div>
                <p className="text-xs text-[#9A7480] font-sans uppercase tracking-wide mb-3">Productos</p>
                <div className="space-y-3">
                  {(Array.isArray(modalCotizacion.pedido.products) ? modalCotizacion.pedido.products : []).map((p, i) => (
                    <div key={p.id || i} className="flex items-center gap-4 p-3 bg-[#FDF0F3] rounded-sm">
                      <span className="font-sans text-sm text-[#1A1118] flex-1">
                        {p.name}{p.size ? ` (${p.size})` : ''} × {p.quantity}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-sans text-xs text-[#9A7480]">S/</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={preciosEditados[p.id] ?? p.price ?? ''}
                          onChange={(e) => setPreciosEditados(prev => ({ ...prev, [p.id]: parseFloat(e.target.value) || 0 }))}
                          className="w-24 border border-[rgba(212,120,138,0.25)] rounded-sm px-3 py-1.5 text-sm font-sans text-right focus:outline-none focus:ring-1 focus:ring-[#D4788A]"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notas */}
              <div>
                <p className="text-xs text-[#9A7480] font-sans uppercase tracking-wide mb-2">Notas para el cliente</p>
                <textarea
                  value={notasCotizacion}
                  onChange={(e) => setNotasCotizacion(e.target.value)}
                  placeholder="Ej: El vestido azul está disponible solo en talla M..."
                  rows={3}
                  className="w-full border border-[rgba(212,120,138,0.25)] rounded-sm px-4 py-2.5 text-sm font-sans focus:outline-none focus:ring-1 focus:ring-[#D4788A] resize-none"
                />
              </div>

              {/* Total calculado */}
              <div className="pt-3 border-t border-[rgba(212,120,138,0.15)] flex justify-between items-center">
                <span className="font-sans text-sm text-[#9A7480]">Total cotizado</span>
                <span className="font-display text-xl font-bold text-[#1A1118]">
                  S/ {(
                    (Array.isArray(modalCotizacion.pedido.products) ? modalCotizacion.pedido.products : [])
                      .reduce((sum, p) => {
                        const precio = preciosEditados[p.id] ?? p.price ?? 0
                        return sum + precio * (p.quantity || 1)
                      }, 0)
                  ).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Acciones */}
            <div className="sticky bottom-0 bg-white border-t border-[rgba(212,120,138,0.15)] px-6 py-4 flex flex-wrap gap-3">
              <button
                onClick={() => enviarCotizacionWhatsApp(modalCotizacion.pedido)}
                className="flex-1 min-w-[200px] px-4 py-2.5 text-xs font-semibold tracking-widest uppercase rounded-sm font-sans bg-green-600 text-white hover:bg-green-700 transition-all flex items-center justify-center gap-2"
              >
                💬 Enviar cotización por WhatsApp
              </button>
              <button
                onClick={async () => {
                  await actualizarEstado(modalCotizacion.pedido.id, 'aceptado')
                  setModalCotizacion({ abierto: false, pedido: null })
                }}
                className="px-4 py-2.5 text-xs font-semibold tracking-widest uppercase rounded-sm font-sans bg-teal-600 text-white hover:bg-teal-700 transition-all"
              >
                Aceptado
              </button>
              <button
                onClick={async () => {
                  await actualizarEstado(modalCotizacion.pedido.id, 'pagado')
                  setModalCotizacion({ abierto: false, pedido: null })
                }}
                className="px-4 py-2.5 text-xs font-semibold tracking-widest uppercase rounded-sm font-sans bg-blue-600 text-white hover:bg-blue-700 transition-all"
              >
                Pagado
              </button>
              <button
                onClick={async () => {
                  await actualizarEstado(modalCotizacion.pedido.id, 'enviado')
                  setModalCotizacion({ abierto: false, pedido: null })
                }}
                className="px-4 py-2.5 text-xs font-semibold tracking-widest uppercase rounded-sm font-sans bg-purple-600 text-white hover:bg-purple-700 transition-all"
              >
                Enviado
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display text-3xl font-light text-[#1A1118]">Pedidos</h1>
        <p className="text-sm text-[#9A7480] font-sans mt-1">Gestiona todos los pedidos de tu tienda</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-sm p-4 border border-[rgba(212,120,138,0.15)] shadow-sm">
          <p className="text-xs text-[#9A7480] font-sans uppercase tracking-wide">Pedidos Hoy</p>
          <p className="text-2xl font-bold text-[#1A1118] font-display mt-1">{stats.totalHoy}</p>
        </div>
        <div className="bg-white rounded-sm p-4 border border-[rgba(212,120,138,0.15)] shadow-sm">
          <p className="text-xs text-[#9A7480] font-sans uppercase tracking-wide">Pendientes</p>
          <p className="text-2xl font-bold text-yellow-600 font-display mt-1">{stats.pendientes}</p>
        </div>
        <div className="bg-white rounded-sm p-4 border border-[rgba(212,120,138,0.15)] shadow-sm">
          <p className="text-xs text-[#9A7480] font-sans uppercase tracking-wide">Ingresos Semana</p>
          <p className="text-2xl font-bold text-green-600 font-display mt-1">{formatearMoneda(stats.ingresosSemana)}</p>
        </div>
        <div className="bg-white rounded-sm p-4 border border-[rgba(212,120,138,0.15)] shadow-sm">
          <p className="text-xs text-[#9A7480] font-sans uppercase tracking-wide">Por Enviar</p>
          <p className="text-2xl font-bold text-purple-600 font-display mt-1">{stats.porEnviar}</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-sm">
          <p className="text-sm text-red-700 font-sans">{error}</p>
        </div>
      )}

      {/* Filtros y Búsqueda */}
      <div className="bg-white rounded-sm p-4 mb-6 shadow-sm border border-[rgba(212,120,138,0.15)]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2">
            <input
              type="text"
              placeholder="Buscar por nombre, teléfono, ID o email..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full border border-[rgba(212,120,138,0.25)] rounded-sm px-4 py-2.5 text-sm font-sans focus:outline-none focus:ring-1 focus:ring-[#D4788A] bg-white"
            />
          </div>
          
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="w-full border border-[rgba(212,120,138,0.25)] rounded-sm px-4 py-2.5 text-sm font-sans focus:outline-none focus:ring-1 focus:ring-[#D4788A] bg-white"
          >
            <option value="">Todos los estados</option>
            <option value="cotizacion">Cotización</option>
            <option value="pendiente">Pendiente</option>
            <option value="aceptado">Aceptado</option>
            <option value="pagado">Pagado</option>
            <option value="enviado">Enviado</option>
            <option value="entregado">Entregado</option>
          </select>

          <select
            value={filtroFecha}
            onChange={(e) => setFiltroFecha(e.target.value)}
            className="w-full border border-[rgba(212,120,138,0.25)] rounded-sm px-4 py-2.5 text-sm font-sans focus:outline-none focus:ring-1 focus:ring-[#D4788A] bg-white"
          >
            <option value="">Todas las fechas</option>
            <option value="hoy">Hoy</option>
            <option value="semana">Esta semana</option>
            <option value="mes">Este mes</option>
          </select>

          <button
            onClick={() => { setBusqueda(''); setFiltroEstado(''); setFiltroFecha(''); setFechaInicio(''); setFechaFin(''); }}
            className="px-4 py-2.5 border border-[rgba(212,120,138,0.3)] text-[#9A7480] rounded-sm text-sm font-sans hover:bg-[#FDF0F3] transition-colors"
          >
            Limpiar filtros
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-[rgba(212,120,138,0.15)]">
          <div>
            <label className="block text-xs text-[#9A7480] font-sans mb-1">Fecha inicio</label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="w-full border border-[rgba(212,120,138,0.25)] rounded-sm px-3 py-2 text-sm font-sans focus:outline-none focus:ring-1 focus:ring-[#D4788A]"
            />
          </div>
          <div>
            <label className="block text-xs text-[#9A7480] font-sans mb-1">Fecha fin</label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="w-full border border-[rgba(212,120,138,0.25)] rounded-sm px-3 py-2 text-sm font-sans focus:outline-none focus:ring-1 focus:ring-[#D4788A]"
            />
          </div>
          <div className="flex items-end">
            <p className="text-xs text-[#9A7480] font-sans">
              {pedidosFiltrados.length} pedido(s) encontrado(s)
            </p>
          </div>
        </div>
      </div>

      {cargando ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-3 border-[#D4788A] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : pedidosFiltrados.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-sm border border-[rgba(212,120,138,0.15)]">
          <p className="text-[#9A7480] font-sans">No se encontraron pedidos con estos filtros</p>
          <button 
            onClick={() => { setBusqueda(''); setFiltroEstado(''); setFiltroFecha(''); setFechaInicio(''); setFechaFin(''); }}
            className="mt-3 text-[#D4788A] hover:underline text-sm font-sans"
          >
            Limpiar filtros
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {pedidosPaginados.map(pedido => (
              <div key={pedido.id} className="bg-white rounded-sm border border-[rgba(212,120,138,0.15)] shadow-sm overflow-hidden">
                <div className="bg-[#FDF0F3] px-4 py-3 border-b border-[rgba(212,120,138,0.15)] flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-semibold text-[#1A1118]">#{String(pedido.id).substring(0, 8).toUpperCase()}</span>
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-sm border font-sans ${getEstadoColor(pedido.status)}`}>
                      {getEstadoLabel(pedido.status)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-[#9A7480] font-sans">{formatearFecha(pedido.created_at)}</span>
                    <span className="text-lg font-bold text-[#1A1118] font-display">{formatearMoneda(pedido.total)}</span>
                  </div>
                </div>

                <div className="p-4">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-[#9A7480] font-sans uppercase tracking-wide mb-1">Cliente</p>
                      <p className="text-sm font-medium text-[#1A1118] font-sans">{pedido.customer_name}</p>
                      <p className="text-xs text-[#9A7480] font-sans mt-1"> {pedido.customer_phone}</p>
                      <p className="text-xs text-[#9A7480] font-sans"> {pedido.customer_city}</p>
                      {pedido.customer_email && (
                        <p className="text-xs text-[#9A7480] font-sans truncate">✉️ {pedido.customer_email}</p>
                      )}
                    </div>

                    <div className="lg:col-span-2">
                      <p className="text-xs text-[#9A7480] font-sans uppercase tracking-wide mb-2">Productos</p>
                      {Array.isArray(pedido.products) && pedido.products.length > 0 ? (
                        <div className="space-y-1">
                          {pedido.products.map((prod, idx) => (
                            <div key={idx} className="flex justify-between items-center text-sm">
                              <span className="text-[#2D2030] font-sans">
                                {prod.name} {prod.size && `(${prod.size})`} × {prod.quantity}
                              </span>
                              <span className="text-[#1A1118] font-medium font-sans">
                                {formatearMoneda(prod.price * prod.quantity)}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-[#9A7480] font-sans italic">Sin productos registrados</p>
                      )}
                    </div>
                  </div>

                    <div className="mt-4 pt-4 border-t border-[rgba(212,120,138,0.15)]">
                    <p className="text-xs text-[#9A7480] font-sans uppercase tracking-wide mb-2">Actualizar estado</p>
                    <div className="flex flex-wrap gap-2">
                      {pedido.status === 'cotizacion' && (
                        <button
                          onClick={() => {
                            setPreciosEditados({})
                            setNotasCotizacion('')
                            setModalCotizacion({ abierto: true, pedido })
                          }}
                          className="px-3 py-1.5 text-xs font-medium rounded-sm font-sans bg-orange-100 text-orange-700 border border-orange-200 hover:bg-orange-200 transition-all"
                        >
                          📋 Gestionar cotización
                        </button>
                      )}
                      <button
                        onClick={() => actualizarEstado(pedido.id, 'pendiente')}
                        disabled={pedido.status === 'pendiente'}
                        className={`px-3 py-1.5 text-xs font-medium rounded-sm font-sans transition-all ${
                          pedido.status === 'pendiente'
                            ? 'bg-yellow-100 text-yellow-700 border border-yellow-200 cursor-default'
                            : 'bg-white text-yellow-700 border border-yellow-200 hover:bg-yellow-50'
                        }`}
                      >
                        Pendiente
                      </button>
                      <button
                        onClick={() => actualizarEstado(pedido.id, 'aceptado')}
                        disabled={pedido.status === 'aceptado'}
                        className={`px-3 py-1.5 text-xs font-medium rounded-sm font-sans transition-all ${
                          pedido.status === 'aceptado'
                            ? 'bg-teal-100 text-teal-700 border border-teal-200 cursor-default'
                            : 'bg-white text-teal-700 border border-teal-200 hover:bg-teal-50'
                        }`}
                      >
                        Aceptado
                      </button>
                      <button
                        onClick={() => actualizarEstado(pedido.id, 'pagado')}
                        disabled={pedido.status === 'pagado'}
                        className={`px-3 py-1.5 text-xs font-medium rounded-sm font-sans transition-all ${
                          pedido.status === 'pagado'
                            ? 'bg-blue-100 text-blue-700 border border-blue-200 cursor-default'
                            : 'bg-white text-blue-700 border border-blue-200 hover:bg-blue-50'
                        }`}
                      >
                        Pagado
                      </button>
                      <button
                        onClick={() => actualizarEstado(pedido.id, 'enviado')}
                        disabled={pedido.status === 'enviado'}
                        className={`px-3 py-1.5 text-xs font-medium rounded-sm font-sans transition-all ${
                          pedido.status === 'enviado'
                            ? 'bg-purple-100 text-purple-700 border border-purple-200 cursor-default'
                            : 'bg-white text-purple-700 border border-purple-200 hover:bg-purple-50'
                        }`}
                      >
                        Enviado
                      </button>
                      <button
                        onClick={() => actualizarEstado(pedido.id, 'entregado')}
                        disabled={pedido.status === 'entregado'}
                        className={`px-3 py-1.5 text-xs font-medium rounded-sm font-sans transition-all ${
                          pedido.status === 'entregado'
                            ? 'bg-green-100 text-green-700 border border-green-200 cursor-default'
                            : 'bg-white text-green-700 border border-green-200 hover:bg-green-50'
                        }`}
                      >
                        Entregado
                      </button>
                    </div>

                    {/* Acciones adicionales */}
                    <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-[rgba(212,120,138,0.1)]">
                     <button
  onClick={() => enviarWhatsApp(pedido)}
  className="px-3 py-1.5 text-xs font-medium rounded-sm font-sans bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-all flex items-center gap-1"
  title="Contactar por WhatsApp"
>
  💬 WhatsApp
</button>
<button
  onClick={() => {
    const mensaje = `Hola ${pedido.customer_name}, te contactamos sobre tu pedido #${String(pedido.id).substring(0, 8).toUpperCase()}. Estado actual: ${pedido.status}. Total: S/ ${Number(pedido.total || 0).toFixed(2)}`;
    navigator.clipboard.writeText(mensaje);
    agregarToast('Mensaje copiado al portapapeles', 'success');
  }}
  className="px-3 py-1.5 text-xs font-medium rounded-sm font-sans bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-all flex items-center gap-1"
  title="Copiar mensaje para el courier"
>
  📋 Copiar
</button>
                      <button
                        onClick={() => setModalEliminar({ abierto: true, pedido })}
                        className="px-3 py-1.5 text-xs font-medium rounded-sm font-sans bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-all flex items-center gap-1"
                        title="Eliminar pedido"
                      >
                        🗑️ Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPaginas > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 px-2">
              <p className="text-sm text-[#9A7480] font-sans">
                Mostrando {(paginaActual - 1) * POR_PAGINA + 1} - {Math.min(paginaActual * POR_PAGINA, pedidosFiltrados.length)} de {pedidosFiltrados.length}
              </p>
              <div className="flex items-center gap-2">
                <button
                  disabled={paginaActual === 1}
                  onClick={() => setPaginaActual(p => p - 1)}
                  className="px-3 py-2 border border-[rgba(212,120,138,0.3)] rounded-sm text-sm font-sans disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#FDF0F3] transition-colors"
                >
                  Anterior
                </button>
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
                    let page
                    if (totalPaginas <= 5) page = i + 1
                    else if (paginaActual <= 3) page = i + 1
                    else if (paginaActual >= totalPaginas - 2) page = totalPaginas - 4 + i
                    else page = paginaActual - 2 + i
                    
                    return (
                      <button
                        key={page}
                        onClick={() => setPaginaActual(page)}
                        className={`w-8 h-8 rounded-sm text-sm font-sans transition-colors ${
                          paginaActual === page ? 'bg-[#1A1118] text-white' : 'hover:bg-[#FDF0F3] text-[#9A7480]'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  })}
                </div>
                <button
                  disabled={paginaActual === totalPaginas}
                  onClick={() => setPaginaActual(p => p + 1)}
                  className="px-3 py-2 border border-[rgba(212,120,138,0.3)] rounded-sm text-sm font-sans disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#FDF0F3] transition-colors"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default PedidosPage