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
  const [descuentoManual, setDescuentoManual] = useState({})
  
  // 🆕 NUEVO: Productos con descuento aplicado en esta sesión
  const [ajustesRecientes, setAjustesRecientes] = useState([])
  
  //  NUEVO: Sistema de notificaciones toast
  const [toast, setToast] = useState(null)

  useEffect(() => {
    cargarStats()
    cargarEstancados()
  }, [])

  // Auto-ocultar toast después de 4 segundos
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  const mostrarToast = (mensaje, tipo = 'exito') => {
    setToast({ mensaje, tipo })
  }

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

  // 🧠 SISTEMA INTELIGENTE: Calcula descuento recomendado según contexto
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
    if (dias > 60) return { nivel: 'Crítico', color: 'red', emoji: '' }
    if (dias > 30) return { nivel: 'Alto', color: 'orange', emoji: '🟠' }
    if (dias > 15) return { nivel: 'Medio', color: 'yellow', emoji: '🟡' }
    return { nivel: 'Bajo', color: 'green', emoji: '' }
  }

  const handleDescuentoChange = (productoId, value) => {
    let nuevoValor = parseInt(value, 10)
    if (isNaN(nuevoValor)) nuevoValor = 0
    nuevoValor = Math.min(99, Math.max(0, nuevoValor))
    setDescuentoManual(prev => ({ ...prev, [productoId]: nuevoValor }))
  }

  //  NUEVO: Aplicar descuento con flujo mejorado
  const aplicarDescuento = async (producto, descuentoPersonalizado) => {
    let nuevoDescuento = parseInt(descuentoPersonalizado, 10)
    if (isNaN(nuevoDescuento)) {
      mostrarToast('Por favor ingresa un número válido', 'error')
      return
    }
    if (nuevoDescuento < 0 || nuevoDescuento > 99) {
      mostrarToast('El descuento debe estar entre 0% y 99%', 'error')
      return
    }

    // Si el descuento es el mismo que ya tiene, no hacer nada
    if (nuevoDescuento === producto.discount_percent) {
      mostrarToast('Este producto ya tiene ese descuento', 'info')
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

      // 🆕 NUEVO: Mover el producto de "estancados" a "ajustes recientes"
      const productoActualizado = {
        ...producto,
        discount_percent: nuevoDescuento,
        is_new: false,
        descuentoAplicadoEn: new Date().toISOString(),
        descuentoAnterior: producto.discount_percent || 0,
      }

      // Quitar de la lista principal con animación
      setProductosEstancados(prev => prev.filter(p => p.id !== producto.id))
      
      // Agregar a ajustes recientes
      setAjustesRecientes(prev => [productoActualizado, ...prev])

      // Calcular precio anterior y nuevo para el mensaje
      const precioAnterior = producto.price_original * (1 - (producto.discount_percent || 0) / 100)
      const precioNuevo = producto.price_original * (1 - nuevoDescuento / 100)
      const ahorro = precioAnterior - precioNuevo

      mostrarToast(
        `✅ ${producto.name}: ${producto.discount_percent || 0}% → ${nuevoDescuento}% (-$${ahorro.toFixed(2)})`,
        'exito'
      )
    } catch (err) {
      console.error('Error al aplicar descuento:', err)
      mostrarToast('❌ Error al aplicar el descuento. Intenta nuevamente.', 'error')
    } finally {
      setAplicandoDescuento(null)
    }
  }

  // 🆕 NUEVO: Ajustar nuevamente un producto de ajustes recientes
  const ajustarNuevamente = (productoAjustado) => {
    // Volver a poner en la lista principal con el descuento actual
    const productoEnLista = {
      ...productoAjustado,
      discount_percent: productoAjustado.descuentoAnterior, // Restaurar valor anterior en la lista
    }
    
    setProductosEstancados(prev => [productoEnLista, ...prev])
    setDescuentoManual(prev => ({ ...prev, [productoAjustado.id]: productoAjustado.discount_percent }))
    setAjustesRecientes(prev => prev.filter(p => p.id !== productoAjustado.id))
    
    mostrarToast('🔄 Producto movido para nuevo ajuste', 'info')
  }

  // 🆕 NUEVO: Confirmar que el descuento fue suficiente (quitar de recientes)
  const confirmarAjuste = (productoId) => {
    setAjustesRecientes(prev => prev.filter(p => p.id !== productoId))
    mostrarToast('✨ Ajuste confirmado. El producto ya no aparecerá aquí.', 'exito')
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
      icon: '️',
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

      {/* 🆕 NUEVO: Sistema de Toast Notifications */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 animate-slide-in">
          <div className={`px-5 py-3 rounded-lg shadow-lg border max-w-sm ${
            toast.tipo === 'exito' ? 'bg-green-50 border-green-200 text-green-800' :
            toast.tipo === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
            'bg-blue-50 border-blue-200 text-blue-800'
          }`}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium">{toast.mensaje}</p>
              <button
                onClick={() => setToast(null)}
                className="text-gray-400 hover:text-gray-600 text-lg leading-none"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

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

          {/* 🆕 NUEVO: Sección de Ajustes Recientes (aparece primero si hay items) */}
          {ajustesRecientes.length > 0 && (
            <div className="mt-8 bg-white rounded-xl shadow-sm p-6 border-2 border-green-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <span>✨</span> Descuentos aplicados en esta sesión
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Productos a los que ya les aplicaste descuento. Confirma que está bien o ajusta nuevamente.
                  </p>
                </div>
                <span className="text-sm text-green-700 bg-green-100 px-3 py-1 rounded-full font-medium">
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
                      className="p-4 bg-green-50 rounded-lg border border-green-200"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={producto.image_url || 'https://via.placeholder.com/48'}
                            alt={producto.name}
                            className="w-12 h-12 rounded object-cover bg-gray-100 flex-shrink-0"
                          />
                          <div>
                            <p className="font-medium text-gray-800 text-sm">
                              {producto.name}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              <span className="line-through">
                                -{producto.descuentoAnterior}%
                              </span>
                              <span className="text-gray-400">→</span>
                              <span className="text-green-700 font-semibold">
                                -{producto.discount_percent}%
                              </span>
                              <span className="text-gray-400">•</span>
                              <span>{tiempoTexto}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => ajustarNuevamente(producto)}
                            className="px-3 py-1.5 text-xs font-medium text-orange-700 bg-orange-100 rounded-lg hover:bg-orange-200 transition-colors"
                            title="Volver a la lista para ajustar"
                          >
                            🔄 Ajustar más
                          </button>
                          <button
                            onClick={() => confirmarAjuste(producto.id)}
                            className="px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                            title="Descuento suficiente, quitar de la lista"
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

          {/* Productos estancados - lista principal */}
          {productosEstancados.length > 0 && (
            <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    📦 Productos con baja rotación
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Productos sin ventas hace más de 15 días. Al aplicarles descuento, pasarán a "Ajustes recientes".
                  </p>
                </div>
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {productosEstancados.length} producto{productosEstancados.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="space-y-4">
                {productosEstancados.map((producto) => {
                  const diasEstancado = getDiasEstancado(producto)
                  const urgencia = getNivelUrgencia(diasEstancado)
                  const recomendado = calcularDescuentoRecomendado(producto)
                  const valorActual = descuentoManual[producto.id] !== undefined 
                    ? descuentoManual[producto.id] 
                    : recomendado
                  const precioFinal = producto.price_original * (1 - valorActual / 100)
                  const esRecomendado = valorActual === recomendado

                  return (
                    <div
                      key={producto.id}
                      className="p-5 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200"
                    >
                      {/* Header del producto */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                        <div className="flex items-center gap-4">
                          <img
                            src={producto.image_url || 'https://via.placeholder.com/60'}
                            alt={producto.name}
                            className="w-16 h-16 rounded-lg object-cover bg-gray-100 flex-shrink-0 shadow-sm"
                          />
                          <div>
                            <h3 className="font-semibold text-gray-800">
                              {producto.name}
                            </h3>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <span className="text-xs text-gray-500">
                                Stock: {producto.stock}
                              </span>
                              <span className="text-xs text-gray-400">•</span>
                              <span className="text-xs text-gray-500">
                                Precio: ${producto.price_original?.toFixed(2)}
                              </span>
                              {producto.discount_percent > 0 && (
                                <>
                                  <span className="text-xs text-gray-400">•</span>
                                  <span className="text-xs text-red-500 font-medium">
                                    -{producto.discount_percent}% actual
                                  </span>
                                </>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-lg">{urgencia.emoji}</span>
                              <span className={`text-xs font-medium px-2 py-0.5 rounded-full bg-${urgencia.color}-100 text-${urgencia.color}-700`}>
                                {urgencia.nivel} • {diasEstancado} días sin ventas
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 💡 Recomendación destacada */}
                      <div className="bg-white rounded-lg p-4 mb-4 border-2 border-dashed border-blue-300">
                        <div className="flex items-start gap-3">
                          <div className="text-2xl">💡</div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-800 mb-1">
                              Recomendación del sistema: <span className="text-blue-600">-{recomendado}%</span>
                            </p>
                            <p className="text-xs text-gray-600">
                              {diasEstancado > 60 && 'Producto muy estancado. Se recomienda un descuento agresivo para liquidar stock.'}
                              {diasEstancado > 30 && diasEstancado <= 60 && 'Producto con baja rotación. Un descuento moderado ayudará a moverlo.'}
                              {diasEstancado > 15 && diasEstancado <= 30 && 'Producto recientemente estancado. Un descuento conservador puede ser suficiente.'}
                              {diasEstancado <= 15 && 'Producto con pocas ventas. Un pequeño descuento puede impulsar las ventas.'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Botones rápidos de descuento */}
                      <div className="mb-4">
                        <p className="text-xs font-medium text-gray-700 mb-2">
                          Selecciona un descuento rápido:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {[10, 20, 30, 40, 50].map((desc) => {
                            const esRecomendadoBtn = desc === recomendado
                            const esSeleccionado = valorActual === desc
                            return (
                              <button
                                key={desc}
                                onClick={() => handleDescuentoChange(producto.id, desc)}
                                className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                  esSeleccionado
                                    ? 'bg-blue-600 text-white shadow-md scale-105'
                                    : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                                }`}
                              >
                                -{desc}%
                                {esRecomendadoBtn && (
                                  <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                                    ✓
                                  </span>
                                )}
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      {/* Input manual y preview */}
                      <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                        <div className="flex-1">
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            O ingresa un descuento personalizado:
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="0"
                              max="99"
                              step="1"
                              value={valorActual}
                              onChange={(e) => handleDescuentoChange(producto.id, e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              aria-label="Porcentaje de descuento"
                            />
                            <span className="text-sm text-gray-500">%</span>
                          </div>
                        </div>

                        {/* Preview del precio final */}
                        <div className="bg-white rounded-lg p-3 border border-gray-200 min-w-[180px]">
                          <p className="text-xs text-gray-500 mb-1">Precio final:</p>
                          <div className="flex items-baseline gap-2">
                            <span className="text-xl font-bold text-gray-800">
                              ${precioFinal.toFixed(2)}
                            </span>
                            {valorActual > 0 && (
                              <span className="text-sm text-gray-400 line-through">
                                ${producto.price_original?.toFixed(2)}
                              </span>
                            )}
                          </div>
                          {valorActual > 0 && (
                            <p className="text-xs text-green-600 font-medium mt-1">
                              Ahorras ${(producto.price_original - precioFinal).toFixed(2)}
                            </p>
                          )}
                        </div>

                        {/* Botón aplicar */}
                        <button
                          onClick={() => aplicarDescuento(producto, valorActual)}
                          disabled={aplicandoDescuento === producto.id}
                          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed whitespace-nowrap shadow-sm hover:shadow-md"
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