import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import ProductCard from './ProductCard'
import FilterBar from './FilterBar'

const ProductGrid = () => {
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [filtros, setFiltros] = useState({
    categoria: '',
    marca: '',
    genero: '',
    precioMin: '',
    precioMax: '',
    orden: 'created_at-desc',
  })
  
  // Paginación
  const [paginaActual, setPaginaActual] = useState(1)
  const [totalProductos, setTotalProductos] = useState(0)
  const productosPorPagina = 8

  useEffect(() => {
    cargarProductos()
    setPaginaActual(1) // Resetear a página 1 cuando cambian los filtros
  }, [filtros, paginaActual])

  const cargarProductos = async () => {
    try {
      setCargando(true)
      setError(null)

      let query = supabase.from('products').select('*', { count: 'exact' })

      // Aplicar filtros
      if (filtros.categoria) {
        query = query.eq('category', filtros.categoria)
      }

      if (filtros.marca) {
        query = query.ilike('brand', `%${filtros.marca}%`)
      }

      if (filtros.genero) {
        query = query.eq('gender', filtros.genero)
      }

      if (filtros.precioMin) {
        query = query.gte('price_original', parseFloat(filtros.precioMin))
      }

      if (filtros.precioMax) {
        query = query.lte('price_original', parseFloat(filtros.precioMax))
      }

      // Solo productos con stock
      query = query.gt('stock', 0)

      // Aplicar ordenamiento
      const [campo, direccion] = filtros.orden.split('-')
      query = query.order(campo, { ascending: direccion === 'asc' })

      // Paginación
      const inicio = (paginaActual - 1) * productosPorPagina
      const fin = inicio + productosPorPagina - 1
      query = query.range(inicio, fin)

      const { data, error, count } = await query

      if (error) throw error

      setProductos(data || [])
      setTotalProductos(count || 0)
    } catch (err) {
      console.error('Error al cargar productos:', err)
      setError('No se pudieron cargar los productos. Intenta de nuevo.')
    } finally {
      setCargando(false)
    }
  }

  const handleChangeFiltros = (nuevosFiltros) => {
    setFiltros(nuevosFiltros)
  }

  const totalPages = Math.ceil(totalProductos / productosPorPagina)

  // Estados de carga, error y vacío
  if (cargando) {
    return (
      <div>
        <FilterBar filtros={filtros} onChangeFiltros={handleChangeFiltros} />
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-kb-pink/20 border-t-kb-pink-dark rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-500 font-medium">Cargando productos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <FilterBar filtros={filtros} onChangeFiltros={handleChangeFiltros} />
        <div className="flex flex-col items-center justify-center py-20">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center max-w-md">
            <svg className="w-12 h-12 text-red-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-red-700 font-medium">{error}</p>
            <button onClick={cargarProductos} className="mt-4 px-4 py-2 bg-kb-pink-dark text-white rounded-lg hover:bg-kb-pink transition-colors text-sm">
              Reintentar
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <FilterBar filtros={filtros} onChangeFiltros={handleChangeFiltros} />

      {productos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p className="text-gray-500 text-lg font-medium">Sin resultados</p>
          <p className="text-gray-400 text-sm mt-1">Prueba con otros filtros</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">
            {totalProductos} producto{totalProductos !== 1 ? 's' : ''} encontrado{totalProductos !== 1 ? 's' : ''}
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {productos.map((producto) => (
              <ProductCard key={producto.id} product={producto} />
            ))}
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setPaginaActual(paginaActual - 1)}
                disabled={paginaActual === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-kb-pink/10 hover:border-kb-pink disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Anterior
              </button>

              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setPaginaActual(page)}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                      page === paginaActual
                        ? 'bg-kb-pink-dark text-white'
                        : 'border border-gray-300 text-gray-700 hover:bg-kb-pink/10 hover:border-kb-pink'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setPaginaActual(paginaActual + 1)}
                disabled={paginaActual === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-kb-pink/10 hover:border-kb-pink disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default ProductGrid