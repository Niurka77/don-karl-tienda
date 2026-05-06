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
    genero: '',
    precioMin: '',
    precioMax: '',
    orden: 'created_at-desc',
  })

  useEffect(() => {
    cargarProductos()
  }, [filtros])

  const cargarProductos = async () => {
    try {
      setCargando(true)
      setError(null)

      let query = supabase.from('products').select('*')

      // Aplicar filtros
      if (filtros.categoria) {
        query = query.eq('category', filtros.categoria)
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

      // Aplicar ordenamiento
      const [campo, direccion] = filtros.orden.split('-')
      query = query.order(campo, { ascending: direccion === 'asc' })

      const { data, error } = await query

      if (error) throw error

      setProductos(data || [])
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

  // Estados de carga, error y vacío (igual que antes)
  if (cargando) {
    return (
      <div>
        <FilterBar filtros={filtros} onChangeFiltros={handleChangeFiltros} />
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
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
            <button onClick={cargarProductos} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm">
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
            {productos.length} producto{productos.length !== 1 ? 's' : ''} encontrado{productos.length !== 1 ? 's' : ''}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {productos.map((producto) => (
              <ProductCard key={producto.id} product={producto} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default ProductGrid