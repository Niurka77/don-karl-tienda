import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAdminNotifications } from '../../hooks/useAdminNotifications'

const DashboardPage = () => {
  const [stats, setStats] = useState({
    totalProductos: 0,
    totalPedidos: 0,
    productosAgotados: 0,
    pedidosPendientes: 0,
    ingresosSemana: 0,
    ingresosMes: 0,
  })
  
  const [cargando, setCargando] = useState(true)
  const [productosEstancados, setProductosEstancados] = useState([])
  const [ajustesRecientes, setAjustesRecientes] = useState([])
  const [aplicandoDescuento, setAplicandoDescuento] = useState(null)
  const [error, setError] = useState(null)
  const [descuentoManual, setDescuentoManual] = useState({})
  const [busquedaEstancados, setBusquedaEstancados] = useState('')
  const [filtroDias, setFiltroDias] = useState(15)

  // 🔔 Usar hook centralizado de notificaciones
  const { agregarToast, ToastContainer } = useAdminNotifications()

  useEffect(() => {
    cargarStats()
    cargarEstancados()
    
    // 🔄 REALTIME: Escuchar cambios en productos y pedidos
    const subscriptionProductos = supabase
      .channel('dashboard-productos')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'products' }, 
        () => {
          cargarStats()
        }
      )
      .subscribe()

    const subscriptionPedidos = supabase
      .channel('dashboard-pedidos')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'orders' }, 
        () => {
          cargarStats()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(subscriptionProductos)
      supabase.removeChannel(subscriptionPedidos)
    }
  }, [])

  const cargarStats = async () => {
    try {
      setError(null)
      
      // Total productos
      const { count: totalProductos } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })

      // Productos agotados
      const { count: productosAgotados } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('stock', 0)

      // Total pedidos
      const { count: totalPedidos } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })

      // Pedidos pendientes
      const { count: pedidosPendientes } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pendiente')

      // Ingresos semana
      const haceUnaSemana = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      const { data: pedidosSemana } = await supabase
        .from('orders')
        .select('total, status')
        .gte('created_at', haceUnaSemana)
        .eq('status', 'entregado')

      const ingresosSemana = pedidosSemana?.reduce((sum, p) => sum + Number(p.total || 0), 0) || 0

      // Ingresos mes
      const haceUnMes = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      const { data: pedidosMes } = await supabase
        .from('orders')
        .select('total, status')
        .gte('created_at', haceUnMes)
        .eq('status', 'entregado')

      const ingresosMes = pedidosMes?.reduce((sum, p) => sum + Number(p.total || 0), 0) || 0

      setStats({
        totalProductos: totalProductos || 0,
        totalPedidos: totalPedidos || 0,
        productosAgotados: productosAgotados || 0,
        pedidosPendientes: pedidosPendientes || 0,
        ingresosSemana,
        ingresosMes,
      })
    } catch (err) {
      console.error('Error al cargar estadísticas:', err)
      setError('No se pudieron cargar las estadísticas')
      agregarToast('Error al cargar estadísticas', 'error')
    } finally {
      setCargando(false)
    }
  }

  const cargarEstancados = async () => {
    try {
      const fechaLimite = new Date()
      fechaLimite.setDate(fechaLimite.getDate() - filtroDias)
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .gt('stock', 0)
        .or(
          `and(last_sale_date.is.null,created_at.lt.${fechaLimite.toISOString()}),last_sale_date.lt.${fechaLimite.toISOString()}`
        )
        .order('created_at', { ascending: true })
        .limit(20)

      if (error) throw error
      
      setProductosEstancados(data || [])

      const initialManual = {}
      data.forEach(p => {
        const sugerido = calcularDescuentoRecomendado(p)
        initialManual[p.id] = sugerido
      })
      setDescuentoManual(initialManual)
    } catch (err) {
      console.error('Error al cargar estancados:', err)
    }
  }

  const calcularDescuentoRecomendado = (producto) => {
    const diasEstancado = getDiasEstancado(producto)
    const descuentoActual = producto.discount_percent || 0
    
    if (diasEstancado > 60) return Math.min(descuentoActual + 30, 50)
    if (diasEstancado > 30) return Math.min(descuentoActual + 20, 50)
    if (diasEstancado > 15) return Math.min(descuentoActual + 10, 50)
    return Math.min(descuentoActual + 5, 50)
  }

  const getDiasEstancado = (producto) => {
    const fechaReferencia = producto.last_sale_date || producto.created_at
    const dias = Math.floor((new Date() - new Date(fechaReferencia)) / (1000 * 60 * 60 * 24))
    return dias
  }

  const getNivelUrgencia = (dias) => {
    if (dias > 60) return { nivel: 'Crítico', color: 'red', emoji: '🔴' }
    if (dias > 30) return { nivel: 'Alto', color: 'orange', emoji: '🟠' }
    if (dias > 15) return { nivel: 'Medio', color: 'yellow', emoji: '🟡' }
    return { nivel: 'Bajo', color: 'green', emoji: '🟢' }
  }

  const handleDescuentoChange = (productoId, value) => {
    let nuevoValor = parseInt(value, 10)
    if (isNaN(nuevoValor)) nuevoValor = 0
    nuevoValor = Math.min(99, Math.max(0, nuevoValor))
    setDescuentoManual(prev => ({ ...prev, [productoId]: nuevoValor }))
  }

  const aplicarDescuento = async (producto, descuentoPersonalizado) => {
    let nuevoDescuento = parseInt(descuentoPersonalizado, 10)
    
    if (isNaN(nuevoDescuento)) {
      agregarToast('Por favor ingresa un número válido', 'error')
      return
    }

    if (nuevoDescuento < 0 || nuevoDescuento > 99) {
      agregarToast('El descuento debe estar entre 0% y 99%', 'error')
      return
    }

    if (nuevoDescuento === producto.discount_percent) {
      agregarToast('Este producto ya tiene ese descuento', 'info')
      return
    }

    setAplicandoDescuento(producto.id)
    
    try {
      const { error } = await supabase
        .from('products')
        .update({
          discount_percent: nuevoDescuento,
          is_new: false,
        })
        .eq('id', producto.id)

      if (error) throw error

      const productoActualizado = {
        ...producto,
        discount_percent: nuevoDescuento,
        is_new: false,
        descuentoAplicadoEn: new Date().toISOString(),
        descuentoAnterior: producto.discount_percent || 0,
      }

      setProductosEstancados(prev => prev.filter(p => p.id !== producto.id))
      setAjustesRecientes(prev => [productoActualizado, ...prev])

      const precioAnterior = producto.price_original * (1 - (producto.discount_percent || 0) / 100)
      const precioNuevo = producto.price_original * (1 - nuevoDescuento / 100)
      const ahorro = precioAnterior - precioNuevo

      agregarToast(
        `✅ ${producto.name}: ${producto.discount_percent || 0}% → ${nuevoDescuento}% (-S/${ahorro.toFixed(2)})`,
        'success'
      )
    } catch (err) {
      console.error('Error al aplicar descuento:', err)
      agregarToast('❌ Error al aplicar el descuento', 'error')
    } finally {
      setAplicandoDescuento(null)
    }
  }

  const ajustarNuevamente = (productoAjustado) => {
    const productoEnLista = {
      ...productoAjustado,
      discount_percent: productoAjustado.descuentoAnterior,
    }
    
    setProductosEstancados(prev => [productoEnLista, ...prev])
    setDescuentoManual(prev => ({ ...prev, [productoAjustado.id]: productoAjustado.discount_percent }))
    setAjustesRecientes(prev => prev.filter(p => p.id !== productoAjustado.id))

    agregarToast('🔄 Producto movido para nuevo ajuste', 'info')
  }

  const confirmarAjuste = (productoId) => {
    setAjustesRecientes(prev => prev.filter(p => p.id !== productoId))
    agregarToast('✨ Ajuste confirmado', 'success')
  }

  const formatearMoneda = (monto) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2
    }).format(monto || 0)
  }

  const exportarEstadisticas = () => {
    const csv = [
      ['ESTADÍSTICAS DE VENTAS'],
      ['Fecha de generación:', new Date().toLocaleString('es-PE')],
      [],
      ['MÉTRICA', 'VALOR'],
      ['Total Productos', stats.totalProductos],
      ['Total Pedidos', stats.totalPedidos],
      ['Productos Agotados', stats.productosAgotados],
      ['Pedidos Pendientes', stats.pedidosPendientes],
      ['Ingresos Semana', formatearMoneda(stats.ingresosSemana)],
      ['Ingresos Mes', formatearMoneda(stats.ingresosMes)],
    ]
    
    const csvContent = csv.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `estadisticas_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    
    agregarToast('📊 Estadísticas exportadas', 'success')
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
      title: 'Pedidos Pendientes',
      value: stats.pedidosPendientes,
      icon: '⏳',
      color: 'bg-yellow-50 text-yellow-700',
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
      title: 'Ingresos Semana',
      value: formatearMoneda(stats.ingresosSemana),
      icon: '💰',
      color: 'bg-purple-50 text-purple-700',
      link: '/admin/pedidos',
    },
    {
      title: 'Ingresos Mes',
      value: formatearMoneda(stats.ingresosMes),
      icon: '📈',
      color: 'bg-indigo-50 text-indigo-700',
      link: '/admin/pedidos',
    },
  ]

  // Filtrar productos estancados por búsqueda
  const productosEstancadosFiltrados = productosEstancados.filter(p =>
    p.name?.toLowerCase().includes(busquedaEstancados.toLowerCase()) ||
    p.sku?.toLowerCase().includes(busquedaEstancados.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#FFF8F5] p-4 md:p-6">
      <ToastContainer />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-['Cormorant_Garamond'] text-3xl font-light text-[#1A1118]">Dashboard</h1>
          <p className="text-sm text-[#9A7480] font-['DM_Sans'] mt-1">Resumen general de tu tienda</p>
        </div>
        <button
          onClick={exportarEstadisticas}
          className="px-4 py-2 border border-[rgba(212,120,138,0.3)] text-[#9A7480] rounded-sm text-sm font-['DM_Sans'] hover:bg-[#FDF0F3] transition-colors flex items-center gap-2"
        >
          📊 Exportar CSV
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-sm mb-6">
          <p className="text-sm text-red-700 font-['DM_Sans']">{error}</p>
        </div>
      )}

      {cargando ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-3 border-[#D4788A] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {cards.map((card) => (
              <Link
                key={card.title}
                to={card.link}
                className="bg-white rounded-sm p-5 border border-[rgba(212,120,138,0.15)] shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">{card.icon}</span>
                </div>
                <p className="text-xs text-[#9A7480] font-['DM_Sans'] uppercase tracking-wide">{card.title}</p>
                <p className="text-2xl font-bold text-[#1A1118] font-['Cormorant_Garamond'] mt-1">{card.value}</p>
              </Link>
            ))}
          </div>

          {/* Ajustes Recientes */}
          {ajustesRecientes.length > 0 && (
            <div className="mb-8 bg-white rounded-sm border border-[rgba(212,120,138,0.15)] shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-[#1A1118] font-['Cormorant_Garamond'] flex items-center gap-2">
                    <span>✨</span> Descuentos aplicados en esta sesión
                  </h2>
                  <p className="text-sm text-[#9A7480] font-['DM_Sans'] mt-1">
                    Productos a los que ya les aplicaste descuento
                  </p>
                </div>
                <span className="text-sm text-green-700 bg-green-100 px-3 py-1 rounded-sm font-['DM_Sans']">
                  {ajustesRecientes.length} ajuste{ajustesRecientes.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="space-y-3">
                {ajustesRecientes.map((producto) => {
                  const tiempoTranscurrido = Math.floor(
                    (new Date() - new Date(producto.descuentoAplicadoEn)) / 1000 / 60
                  )
                  const tiempoTexto = tiempoTranscurrido < 1 
                    ? 'hace un momento' 
                    : `hace ${tiempoTranscurrido} min`

                  return (
                    <div
                      key={producto.id}
                      className="p-4 bg-green-50 rounded-sm border border-green-200"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={producto.image_url || 'https://placehold.co/48x48/e2e8f0/9ca3af?text=IMG'}
                            alt={producto.name}
                            className="w-12 h-12 rounded-sm object-cover bg-gray-100 flex-shrink-0"
                          />
                          <div>
                            <p className="font-medium text-[#1A1118] text-sm font-['DM_Sans']">
                              {producto.name}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
                              <span className="line-through">-{producto.descuentoAnterior}%</span>
                              <span className="text-gray-400">→</span>
                              <span className="text-green-700 font-semibold">-{producto.discount_percent}%</span>
                              <span className="text-gray-400">•</span>
                              <span>{tiempoTexto}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => ajustarNuevamente(producto)}
                            className="px-3 py-1.5 text-xs font-medium text-orange-700 bg-orange-100 rounded-sm hover:bg-orange-200 transition-colors font-['DM_Sans']"
                          >
                            🔄 Ajustar más
                          </button>
                          <button
                            onClick={() => confirmarAjuste(producto.id)}
                            className="px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-sm hover:bg-green-700 transition-colors font-['DM_Sans']"
                          >
                            ✓ Listo
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Productos Estancados */}
          {productosEstancadosFiltrados.length > 0 && (
            <div className="mb-8 bg-white rounded-sm border border-[rgba(212,120,138,0.15)] shadow-sm p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-[#1A1118] font-['Cormorant_Garamond']">
                    📦 Productos con baja rotación
                  </h2>
                  <p className="text-sm text-[#9A7480] font-['DM_Sans'] mt-1">
                    Productos sin ventas hace más de {filtroDias} días
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <select
                    value={filtroDias}
                    onChange={(e) => {
                      setFiltroDias(Number(e.target.value))
                      setTimeout(() => cargarEstancados(), 100)
                    }}
                    className="px-3 py-1.5 border border-[rgba(212,120,138,0.25)] rounded-sm text-sm font-['DM_Sans'] bg-white"
                  >
                    <option value={15}>15 días</option>
                    <option value={30}>30 días</option>
                    <option value={60}>60 días</option>
                  </select>
                  
                  <input
                    type="text"
                    placeholder="Buscar producto..."
                    value={busquedaEstancados}
                    onChange={(e) => setBusquedaEstancados(e.target.value)}
                    className="px-3 py-1.5 border border-[rgba(212,120,138,0.25)] rounded-sm text-sm font-['DM_Sans'] bg-white"
                  />
                </div>
              </div>

              <div className="space-y-4">
                {productosEstancadosFiltrados.slice(0, 5).map((producto) => {
                  const diasEstancado = getDiasEstancado(producto)
                  const urgencia = getNivelUrgencia(diasEstancado)
                  const recomendado = calcularDescuentoRecomendado(producto)
                  const valorActual = descuentoManual[producto.id] !== undefined 
                    ? descuentoManual[producto.id] 
                    : recomendado
                  const precioFinal = producto.price_original * (1 - valorActual / 100)

                  return (
                    <div
                      key={producto.id}
                      className="p-5 bg-gradient-to-r from-amber-50 to-orange-50 rounded-sm border border-amber-200"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                        <div className="flex items-center gap-4">
                          <img
                            src={producto.image_url || 'https://placehold.co/60x60/e2e8f0/9ca3af?text=IMG'}
                            alt={producto.name}
                            className="w-16 h-16 rounded-sm object-cover bg-gray-100 flex-shrink-0"
                          />
                          <div>
                            <h3 className="font-semibold text-[#1A1118] font-['DM_Sans']">
                              {producto.name}
                            </h3>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <span className="text-xs text-[#9A7480] font-['DM_Sans']">
                                Stock: {producto.stock}
                              </span>
                              <span className="text-xs text-gray-400">•</span>
                              <span className="text-xs text-[#9A7480] font-['DM_Sans']">
                                Precio: S/ {producto.price_original?.toFixed(2)}
                              </span>
                              {producto.discount_percent > 0 && (
                                <>
                                  <span className="text-xs text-gray-400">•</span>
                                  <span className="text-xs text-red-500 font-medium font-['DM_Sans']">
                                    -{producto.discount_percent}% actual
                                  </span>
                                </>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-lg">{urgencia.emoji}</span>
                              <span className={`text-xs font-medium px-2 py-0.5 rounded-full bg-${urgencia.color}-100 text-${urgencia.color}-700 font-['DM_Sans']`}>
                                {urgencia.nivel} • {diasEstancado} días sin ventas
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-sm p-4 mb-4 border-2 border-dashed border-blue-300">
                        <div className="flex items-start gap-3">
                          <div className="text-2xl">💡</div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-[#1A1118] mb-1 font-['DM_Sans']">
                              Recomendación: <span className="text-blue-600">-{recomendado}%</span>
                            </p>
                            <p className="text-xs text-gray-600 font-['DM_Sans']">
                              {diasEstancado > 60 && 'Producto muy estancado. Descuento agresivo recomendado.'}
                              {diasEstancado > 30 && diasEstancado <= 60 && 'Baja rotación. Descuento moderado ayudará.'}
                              {diasEstancado > 15 && diasEstancado <= 30 && 'Recientemente estancado. Descuento conservador.'}
                              {diasEstancado <= 15 && 'Pocas ventas. Pequeño descuento puede impulsar.'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                        <div className="flex-1">
                          <label className="block text-xs font-medium text-[#1A1118] mb-1 font-['DM_Sans']">
                            Descuento personalizado:
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="0"
                              max="99"
                              step="1"
                              value={valorActual}
                              onChange={(e) => handleDescuentoChange(producto.id, e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-sm text-sm focus:ring-2 focus:ring-[#D4788A] focus:border-transparent font-['DM_Sans']"
                            />
                            <span className="text-sm text-gray-500">%</span>
                          </div>
                        </div>

                        <div className="bg-white rounded-sm p-3 border border-gray-200 min-w-[180px]">
                          <p className="text-xs text-gray-500 mb-1 font-['DM_Sans']">Precio final:</p>
                          <div className="flex items-baseline gap-2">
                            <span className="text-xl font-bold text-[#1A1118] font-['Cormorant_Garamond']">
                              S/ {precioFinal.toFixed(2)}
                            </span>
                            {valorActual > 0 && (
                              <span className="text-sm text-gray-400 line-through">
                                S/ {producto.price_original?.toFixed(2)}
                              </span>
                            )}
                          </div>
                          {valorActual > 0 && (
                            <p className="text-xs text-green-600 font-medium mt-1 font-['DM_Sans']">
                              Ahorras S/ {(producto.price_original - precioFinal).toFixed(2)}
                            </p>
                          )}
                        </div>

                        <button
                          onClick={() => aplicarDescuento(producto, valorActual)}
                          disabled={aplicandoDescuento === producto.id}
                          className="px-6 py-2.5 bg-[#1A1118] text-white rounded-sm text-sm font-semibold hover:bg-gradient-to-r hover:from-[#D4788A] hover:to-[#B85268] transition-all disabled:bg-gray-300 disabled:cursor-not-allowed whitespace-nowrap font-['DM_Sans']"
                        >
                          {aplicandoDescuento === producto.id ? (
                            <span className="flex items-center gap-2">
                              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                              Aplicando...
                            </span>
                          ) : (
                            'Aplicar Descuento'
                          )}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Acciones rápidas */}
          <div className="bg-white rounded-sm border border-[rgba(212,120,138,0.15)] shadow-sm p-6">
            <h2 className="text-lg font-semibold text-[#1A1118] font-['Cormorant_Garamond'] mb-4">
              Acciones rápidas
            </h2>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/admin/productos"
                className="px-4 py-2 bg-[#1A1118] text-white rounded-sm text-sm font-['DM_Sans'] font-medium hover:bg-gradient-to-r hover:from-[#D4788A] hover:to-[#B85268] transition-all"
              >
                + Nuevo producto
              </Link>
              <Link
                to="/admin/pedidos"
                className="px-4 py-2 border border-[rgba(212,120,138,0.3)] text-[#9A7480] rounded-sm text-sm font-['DM_Sans'] font-medium hover:bg-[#FDF0F3] transition-colors"
              >
                Ver pedidos
              </Link>
              <Link
                to="/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 border border-[rgba(212,120,138,0.3)] text-[#9A7480] rounded-sm text-sm font-['DM_Sans'] font-medium hover:bg-[#FDF0F3] transition-colors"
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