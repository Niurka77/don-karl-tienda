import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../../lib/supabase'
import ProductoForm from '../../components/admin/ProductoForm'
import { useAdminNotifications } from '../../hooks/useAdminNotifications'

const ProductosPage = () => {
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  
  // Formularios y estados de UI
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [productoEditar, setProductoEditar] = useState(null)
  
  // Filtros y Búsqueda
  const [busqueda, setBusqueda] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('')
  const [filtroStock, setFiltroStock] = useState('')
  
  // Paginación
  const [paginaActual, setPaginaActual] = useState(1)
  const POR_PAGINA = 10

  // Modal de eliminación
  const [modalEliminar, setModalEliminar] = useState({ abierto: false, producto: null })
  
  // 🔔 Usar hook centralizado de notificaciones
  const { agregarToast, ToastContainer } = useAdminNotifications()

  useEffect(() => {
    cargarProductos()
  }, [])

  // Resetear página al cambiar filtros
  useEffect(() => {
    setPaginaActual(1)
  }, [busqueda, filtroCategoria, filtroStock])

  const cargarProductos = async () => {
    try {
      setCargando(true)
      setError(null)
      const { data, error: supaError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

      if (supaError) throw supaError
      setProductos(data || [])
    } catch (err) {
      console.error('Error cargando productos:', err)
      setError('No se pudieron cargar los productos')
      agregarToast('Error al cargar datos', 'error')
    } finally {
      setCargando(false)
    }
  }

  // Filtrado en memoria (rápido para <500 productos)
  const productosFiltrados = useMemo(() => {
    let res = productos

    if (busqueda) {
      const q = busqueda.toLowerCase()
      res = res.filter(p => 
        p.name?.toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q)
      )
    }

    if (filtroCategoria) {
      res = res.filter(p => p.category === filtroCategoria)
    }

    if (filtroStock) {
      res = res.filter(p => {
        if (filtroStock === 'agotado') return p.stock === 0
        if (filtroStock === 'critico') return p.stock > 0 && p.stock <= 5
        if (filtroStock === 'disponible') return p.stock > 5
        return true
      })
    }

    return res
  }, [productos, busqueda, filtroCategoria, filtroStock])

  // Paginación
  const totalPaginas = Math.ceil(productosFiltrados.length / POR_PAGINA)
  const productosPaginados = productosFiltrados.slice(
    (paginaActual - 1) * POR_PAGINA,
    paginaActual * POR_PAGINA
  )

  const handleEliminar = async () => {
    const producto = modalEliminar.producto
    if (!producto) return

    try {
      // Eliminar imagen del storage si existe
      if (producto.image_url) {
        const parts = producto.image_url.split('/productos/')
        if (parts.length > 1) {
          await supabase.storage.from('productos').remove([parts[1]])
        }
      }

      const { error } = await supabase.from('products').delete().eq('id', producto.id)
      if (error) throw error

      setProductos(prev => prev.filter(p => p.id !== producto.id))
      agregarToast('Producto eliminado', 'success')
    } catch (err) {
      console.error('Error eliminando:', err)
      agregarToast('Error al eliminar', 'error')
    } finally {
      setModalEliminar({ abierto: false, producto: null })
    }
  }

  const handleEditar = (producto) => {
    setProductoEditar(producto)
    setMostrarFormulario(true)
  }

  const handleGuardar = (productoGuardado) => {
    if (productoEditar) {
      setProductos(prev => prev.map(p => p.id === productoGuardado.id ? productoGuardado : p))
    } else {
      setProductos(prev => [productoGuardado, ...prev])
    }
    setMostrarFormulario(false)
    setProductoEditar(null)
    agregarToast(productoEditar ? 'Producto actualizado' : 'Producto creado', 'success')
  }

  const calcularPrecioFinal = (original, descuento) => {
    const o = parseFloat(original) || 0
    const d = parseInt(descuento) || 0
    return d > 0 ? o * (1 - d / 100) : o
  }

  // Vista de formulario
  if (mostrarFormulario) {
    return (
      <div>
        <button
          onClick={() => { setMostrarFormulario(false); setProductoEditar(null); }}
          className="mb-6 flex items-center gap-2 text-[#9A7480] hover:text-[#1A1118] transition-colors text-sm font-['DM_Sans'] font-medium"
        >
          ← Volver a productos
        </button>
        <ProductoForm
          producto={productoEditar}
          onGuardar={handleGuardar}
          onCancelar={() => { setMostrarFormulario(false); setProductoEditar(null); }}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FFF8F5] p-4 md:p-6">
      {/* 🔔 Toast Container del hook centralizado */}
      <ToastContainer />

      {/* Modal Eliminar */}
      {modalEliminar.abierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-sm p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="font-['Cormorant_Garamond'] text-xl text-[#1A1118] mb-2">Confirmar eliminación</h3>
            <p className="text-sm text-gray-600 mb-6 font-['DM_Sans']">
              ¿Estás seguro de eliminar <strong>{modalEliminar.producto?.name}</strong>? Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setModalEliminar({ abierto: false, producto: null })}
                className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-sm hover:bg-gray-50 font-['DM_Sans']"
              >
                Cancelar
              </button>
              <button
                onClick={handleEliminar}
                className="flex-1 py-2.5 bg-[#B85268] text-white rounded-sm hover:bg-[#9A3A4C] font-['DM_Sans'] transition-colors"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-['Cormorant_Garamond'] text-3xl font-light text-[#1A1118]">Inventario</h1>
          <p className="text-sm text-[#9A7480] font-['DM_Sans'] mt-1">{productos.length} productos registrados</p>
        </div>
        <button
          onClick={() => { setProductoEditar(null); setMostrarFormulario(true); }}
          className="px-5 py-2.5 bg-[#1A1118] text-white rounded-sm font-['DM_Sans'] font-medium tracking-wide hover:bg-gradient-to-r hover:from-[#D4788A] hover:to-[#B85268] transition-all shadow-sm"
        >
          + Nuevo producto
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-sm">
          <p className="text-sm text-red-700 font-['DM_Sans']">{error}</p>
        </div>
      )}

      {/* Filtros y Búsqueda */}
      <div className="bg-white rounded-sm p-4 mb-6 shadow-sm border border-[rgba(212,120,138,0.15)]">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <input
              type="text"
              placeholder="Buscar por nombre, SKU o marca..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full border border-[rgba(212,120,138,0.25)] rounded-sm px-4 py-2.5 text-sm font-['DM_Sans'] focus:outline-none focus:ring-1 focus:ring-[#D4788A] bg-white"
            />
          </div>
          <select
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
            className="w-full border border-[rgba(212,120,138,0.25)] rounded-sm px-4 py-2.5 text-sm font-['DM_Sans'] focus:outline-none focus:ring-1 focus:ring-[#D4788A] bg-white"
          >
            <option value="">Todas las categorías</option>
            <option value="vestidos">Vestidos</option>
            <option value="bolsos">Bolsos</option>
            <option value="zapatos">Zapatos</option>
            <option value="Billeteras">Billeteras</option>
          </select>
          <select
            value={filtroStock}
            onChange={(e) => setFiltroStock(e.target.value)}
            className="w-full border border-[rgba(212,120,138,0.25)] rounded-sm px-4 py-2.5 text-sm font-['DM_Sans'] focus:outline-none focus:ring-1 focus:ring-[#D4788A] bg-white"
          >
            <option value="">Todo el stock</option>
            <option value="agotado">Agotado</option>
            <option value="critico">Crítico (1-5)</option>
            <option value="disponible">Disponible (&gt;5)</option>
          </select>
        </div>
      </div>

      {cargando ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-3 border-[#D4788A] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : productosFiltrados.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-sm border border-[rgba(212,120,138,0.15)]">
          <p className="text-[#9A7480] font-['DM_Sans']">No se encontraron productos con estos filtros</p>
          <button 
            onClick={() => { setBusqueda(''); setFiltroCategoria(''); setFiltroStock(''); }}
            className="mt-3 text-[#D4788A] hover:underline text-sm font-['DM_Sans']"
          >
            Limpiar filtros
          </button>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-sm shadow-sm border border-[rgba(212,120,138,0.15)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#FDF0F3] border-b border-[rgba(212,120,138,0.15)]">
                  <tr>
                    <th className="text-left px-6 py-4 text-[0.65rem] tracking-wider uppercase font-['DM_Sans'] font-semibold text-[#9A7480]">Producto</th>
                    <th className="text-left px-6 py-4 text-[0.65rem] tracking-wider uppercase font-['DM_Sans'] font-semibold text-[#9A7480]">SKU</th>
                    <th className="text-left px-6 py-4 text-[0.65rem] tracking-wider uppercase font-['DM_Sans'] font-semibold text-[#9A7480]">Precio</th>
                    <th className="text-left px-6 py-4 text-[0.65rem] tracking-wider uppercase font-['DM_Sans'] font-semibold text-[#9A7480]">Stock</th>
                    <th className="text-right px-6 py-4 text-[0.65rem] tracking-wider uppercase font-['DM_Sans'] font-semibold text-[#9A7480]">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(212,120,138,0.1)]">
                  {productosPaginados.map(p => {
                    const precioFinal = calcularPrecioFinal(p.price_original, p.discount_percent)
                    const tieneDescuento = p.discount_percent > 0
                    
                    let stockLabel, stockClass
                    if (p.stock === 0) { stockLabel = 'Agotado'; stockClass = 'bg-red-50 text-red-700 border border-red-200' }
                    else if (p.stock <= 5) { stockLabel = `Crítico: ${p.stock}`; stockClass = 'bg-yellow-50 text-yellow-700 border border-yellow-200' }
                    else { stockLabel = `${p.stock} uds`; stockClass = 'bg-green-50 text-green-700 border border-green-200' }

                    return (
                      <tr key={p.id} className="hover:bg-[#FDF0F3]/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-sm overflow-hidden bg-gray-100 flex-shrink-0">
                              <img src={p.image_url || 'https://placehold.co/48x48/e2e8f0/9ca3af?text=IMG'} alt={p.name} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-[#1A1118] font-['DM_Sans'] truncate max-w-[200px]">{p.name}</p>
                              <p className="text-xs text-[#9A7480] font-['DM_Sans']">{p.category} • {p.brand || 'Sin marca'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-mono text-[#2D2030]">{p.sku || '-'}</td>
                        <td className="px-6 py-4">
                          {tieneDescuento ? (
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-400 line-through font-['DM_Sans']">${p.price_original?.toFixed(2)}</span>
                              <span className="font-semibold text-[#B85268] font-['DM_Sans']">${precioFinal.toFixed(2)}</span>
                              <span className="text-[0.6rem] bg-red-100 text-red-700 px-1.5 py-0.5 rounded mt-0.5 self-start">-{p.discount_percent}%</span>
                            </div>
                          ) : (
                            <span className="font-medium text-[#1A1118] font-['DM_Sans']">${precioFinal.toFixed(2)}</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-sm font-['DM_Sans'] ${stockClass}`}>
                            {stockLabel}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => handleEditar(p)}
                              className="p-2 text-[#9A7480] hover:text-[#1A1118] hover:bg-[#FDF0F3] rounded-sm transition-all"
                              title="Editar"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                            </button>
                            <button 
                              onClick={() => setModalEliminar({ abierto: true, producto: p })}
                              className="p-2 text-[#B85268] hover:text-red-700 hover:bg-red-50 rounded-sm transition-all"
                              title="Eliminar"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Paginación */}
          {totalPaginas > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 px-2">
              <p className="text-sm text-[#9A7480] font-['DM_Sans']">
                Mostrando {(paginaActual - 1) * POR_PAGINA + 1} - {Math.min(paginaActual * POR_PAGINA, productosFiltrados.length)} de {productosFiltrados.length}
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

export default ProductosPage