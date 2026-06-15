import { useState, useEffect, useMemo, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { useAdminNotifications } from '../../hooks/useAdminNotifications'

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

  // 🔔 Usar hook centralizado de notificaciones
  const { agregarToast, ToastContainer } = useAdminNotifications()

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
          console.log('Cambio en pedidos:', payload)
          
          if (payload.eventType === 'INSERT') {
            // Nuevo pedido insertado
            setPedidos(prev => [payload.new, ...prev])
            agregarToast(`🆕 Nuevo pedido de ${payload.new.customer_name}`, 'success')
            calcularEstadisticas()
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
      const { error } = await supabase
        .from('orders')
        .update({ status: nuevoEstado })
        .eq('id', id)
      
      if (error) throw error
      
      setPedidos(pedidos.map(p => p.id === id ? { ...p, status: nuevoEstado } : p))
      agregarToast(`Estado actualizado a "${nuevoEstado}"`, 'success')
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

  const getEstadoColor = (status) => {
    const colores = {
      pendiente: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      confirmado: 'bg-blue-100 text-blue-700 border-blue-200',
      enviado: 'bg-purple-100 text-purple-700 border-purple-200',
      entregado: 'bg-green-100 text-green-700 border-green-200',
    }
    return colores[status] || 'bg-gray-100 text-gray-700 border-gray-200'
  }

  const getEstadoLabel = (status) => {
    const labels = {
      pendiente: '⏳ Pendiente',
      confirmado: '✅ Confirmado',
      enviado: '🚚 Enviado',
      entregado: '✓ Entregado',
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
            <h3 className="font-['Cormorant_Garamond'] text-xl text-[#1A1118] mb-2">Confirmar eliminación</h3>
            <p className="text-sm text-gray-600 mb-6 font-['DM_Sans']">
              ¿Estás seguro de eliminar el pedido <strong>#{String(modalEliminar.pedido?.id).substring(0, 8).toUpperCase()}</strong>? Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setModalEliminar({ abierto: false, pedido: null })}
                className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-sm hover:bg-gray-50 font-['DM_Sans']"
              >
                Cancelar
              </button>
              <button
                onClick={handleEliminarPedido}
                className="flex-1 py-2.5 bg-[#B85268] text-white rounded-sm hover:bg-[#9A3A4C] font-['DM_Sans'] transition-colors"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h1 className="font-['Cormorant_Garamond'] text-3xl font-light text-[#1A1118]">Pedidos</h1>
        <p className="text-sm text-[#9A7480] font-['DM_Sans'] mt-1">Gestiona todos los pedidos de tu tienda</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-sm p-4 border border-[rgba(212,120,138,0.15)] shadow-sm">
          <p className="text-xs text-[#9A7480] font-['DM_Sans'] uppercase tracking-wide">Pedidos Hoy</p>
          <p className="text-2xl font-bold text-[#1A1118] font-['Cormorant_Garamond'] mt-1">{stats.totalHoy}</p>
        </div>
        <div className="bg-white rounded-sm p-4 border border-[rgba(212,120,138,0.15)] shadow-sm">
          <p className="text-xs text-[#9A7480] font-['DM_Sans'] uppercase tracking-wide">Pendientes</p>
          <p className="text-2xl font-bold text-yellow-600 font-['Cormorant_Garamond'] mt-1">{stats.pendientes}</p>
        </div>
        <div className="bg-white rounded-sm p-4 border border-[rgba(212,120,138,0.15)] shadow-sm">
          <p className="text-xs text-[#9A7480] font-['DM_Sans'] uppercase tracking-wide">Ingresos Semana</p>
          <p className="text-2xl font-bold text-green-600 font-['Cormorant_Garamond'] mt-1">{formatearMoneda(stats.ingresosSemana)}</p>
        </div>
        <div className="bg-white rounded-sm p-4 border border-[rgba(212,120,138,0.15)] shadow-sm">
          <p className="text-xs text-[#9A7480] font-['DM_Sans'] uppercase tracking-wide">Por Enviar</p>
          <p className="text-2xl font-bold text-purple-600 font-['Cormorant_Garamond'] mt-1">{stats.porEnviar}</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-sm">
          <p className="text-sm text-red-700 font-['DM_Sans']">{error}</p>
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
              className="w-full border border-[rgba(212,120,138,0.25)] rounded-sm px-4 py-2.5 text-sm font-['DM_Sans'] focus:outline-none focus:ring-1 focus:ring-[#D4788A] bg-white"
            />
          </div>
          
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="w-full border border-[rgba(212,120,138,0.25)] rounded-sm px-4 py-2.5 text-sm font-['DM_Sans'] focus:outline-none focus:ring-1 focus:ring-[#D4788A] bg-white"
          >
            <option value="">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="confirmado">Confirmado</option>
            <option value="enviado">Enviado</option>
            <option value="entregado">Entregado</option>
          </select>

          <select
            value={filtroFecha}
            onChange={(e) => setFiltroFecha(e.target.value)}
            className="w-full border border-[rgba(212,120,138,0.25)] rounded-sm px-4 py-2.5 text-sm font-['DM_Sans'] focus:outline-none focus:ring-1 focus:ring-[#D4788A] bg-white"
          >
            <option value="">Todas las fechas</option>
            <option value="hoy">Hoy</option>
            <option value="semana">Esta semana</option>
            <option value="mes">Este mes</option>
          </select>

          <button
            onClick={() => { setBusqueda(''); setFiltroEstado(''); setFiltroFecha(''); setFechaInicio(''); setFechaFin(''); }}
            className="px-4 py-2.5 border border-[rgba(212,120,138,0.3)] text-[#9A7480] rounded-sm text-sm font-['DM_Sans'] hover:bg-[#FDF0F3] transition-colors"
          >
            Limpiar filtros
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-[rgba(212,120,138,0.15)]">
          <div>
            <label className="block text-xs text-[#9A7480] font-['DM_Sans'] mb-1">Fecha inicio</label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="w-full border border-[rgba(212,120,138,0.25)] rounded-sm px-3 py-2 text-sm font-['DM_Sans'] focus:outline-none focus:ring-1 focus:ring-[#D4788A]"
            />
          </div>
          <div>
            <label className="block text-xs text-[#9A7480] font-['DM_Sans'] mb-1">Fecha fin</label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="w-full border border-[rgba(212,120,138,0.25)] rounded-sm px-3 py-2 text-sm font-['DM_Sans'] focus:outline-none focus:ring-1 focus:ring-[#D4788A]"
            />
          </div>
          <div className="flex items-end">
            <p className="text-xs text-[#9A7480] font-['DM_Sans']">
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
          <p className="text-[#9A7480] font-['DM_Sans']">No se encontraron pedidos con estos filtros</p>
          <button 
            onClick={() => { setBusqueda(''); setFiltroEstado(''); setFiltroFecha(''); setFechaInicio(''); setFechaFin(''); }}
            className="mt-3 text-[#D4788A] hover:underline text-sm font-['DM_Sans']"
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
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-sm border font-['DM_Sans'] ${getEstadoColor(pedido.status)}`}>
                      {getEstadoLabel(pedido.status)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-[#9A7480] font-['DM_Sans']">{formatearFecha(pedido.created_at)}</span>
                    <span className="text-lg font-bold text-[#1A1118] font-['Cormorant_Garamond']">{formatearMoneda(pedido.total)}</span>
                  </div>
                </div>

                <div className="p-4">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-[#9A7480] font-['DM_Sans'] uppercase tracking-wide mb-1">Cliente</p>
                      <p className="text-sm font-medium text-[#1A1118] font-['DM_Sans']">{pedido.customer_name}</p>
                      <p className="text-xs text-[#9A7480] font-['DM_Sans'] mt-1"> {pedido.customer_phone}</p>
                      <p className="text-xs text-[#9A7480] font-['DM_Sans']"> {pedido.customer_city}</p>
                      {pedido.customer_email && (
                        <p className="text-xs text-[#9A7480] font-['DM_Sans'] truncate">✉️ {pedido.customer_email}</p>
                      )}
                    </div>

                    <div className="lg:col-span-2">
                      <p className="text-xs text-[#9A7480] font-['DM_Sans'] uppercase tracking-wide mb-2">Productos</p>
                      {Array.isArray(pedido.products) && pedido.products.length > 0 ? (
                        <div className="space-y-1">
                          {pedido.products.map((prod, idx) => (
                            <div key={idx} className="flex justify-between items-center text-sm">
                              <span className="text-[#2D2030] font-['DM_Sans']">
                                {prod.name} {prod.size && `(${prod.size})`} × {prod.quantity}
                              </span>
                              <span className="text-[#1A1118] font-medium font-['DM_Sans']">
                                {formatearMoneda(prod.price * prod.quantity)}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-[#9A7480] font-['DM_Sans'] italic">Sin productos registrados</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-[rgba(212,120,138,0.15)]">
                    <p className="text-xs text-[#9A7480] font-['DM_Sans'] uppercase tracking-wide mb-2">Actualizar estado</p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => actualizarEstado(pedido.id, 'pendiente')}
                        disabled={pedido.status === 'pendiente'}
                        className={`px-3 py-1.5 text-xs font-medium rounded-sm font-['DM_Sans'] transition-all ${
                          pedido.status === 'pendiente'
                            ? 'bg-yellow-100 text-yellow-700 border border-yellow-200 cursor-default'
                            : 'bg-white text-yellow-700 border border-yellow-200 hover:bg-yellow-50'
                        }`}
                      >
                        Pendiente
                      </button>
                      <button
                        onClick={() => actualizarEstado(pedido.id, 'confirmado')}
                        disabled={pedido.status === 'confirmado'}
                        className={`px-3 py-1.5 text-xs font-medium rounded-sm font-['DM_Sans'] transition-all ${
                          pedido.status === 'confirmado'
                            ? 'bg-blue-100 text-blue-700 border border-blue-200 cursor-default'
                            : 'bg-white text-blue-700 border border-blue-200 hover:bg-blue-50'
                        }`}
                      >
                        Confirmado
                      </button>
                      <button
                        onClick={() => actualizarEstado(pedido.id, 'enviado')}
                        disabled={pedido.status === 'enviado'}
                        className={`px-3 py-1.5 text-xs font-medium rounded-sm font-['DM_Sans'] transition-all ${
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
                        className={`px-3 py-1.5 text-xs font-medium rounded-sm font-['DM_Sans'] transition-all ${
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
                        className="px-3 py-1.5 text-xs font-medium rounded-sm font-['DM_Sans'] bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-all flex items-center gap-1"
                        title="Contactar por WhatsApp"
                      >
                        💬 WhatsApp
                      </button>
                      <button
                        onClick={() => setModalEliminar({ abierto: true, pedido })}
                        className="px-3 py-1.5 text-xs font-medium rounded-sm font-['DM_Sans'] bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-all flex items-center gap-1"
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
              <p className="text-sm text-[#9A7480] font-['DM_Sans']">
                Mostrando {(paginaActual - 1) * POR_PAGINA + 1} - {Math.min(paginaActual * POR_PAGINA, pedidosFiltrados.length)} de {pedidosFiltrados.length}
              </p>
              <div className="flex items-center gap-2">
                <button
                  disabled={paginaActual === 1}
                  onClick={() => setPaginaActual(p => p - 1)}
                  className="px-3 py-2 border border-[rgba(212,120,138,0.3)] rounded-sm text-sm font-['DM_Sans'] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#FDF0F3] transition-colors"
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
                        className={`w-8 h-8 rounded-sm text-sm font-['DM_Sans'] transition-colors ${
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
                  className="px-3 py-2 border border-[rgba(212,120,138,0.3)] rounded-sm text-sm font-['DM_Sans'] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#FDF0F3] transition-colors"
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