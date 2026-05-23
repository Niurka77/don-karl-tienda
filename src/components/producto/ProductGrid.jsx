import { useState, useEffect, useCallback } from 'react'
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
  
  const [paginaActual, setPaginaActual] = useState(1)
  const [totalProductos, setTotalProductos] = useState(0)
  const productosPorPagina = 8

  // ✅ useCallback para evitar recrear función en cada render
  const cargarProductos = useCallback(async () => {
    let cancelled = false
    
    try {
      setCargando(true)
      setError(null)

      let query = supabase.from('products').select('*', { count: 'exact' })

      if (filtros.categoria) query = query.eq('category', filtros.categoria)
      if (filtros.marca) query = query.ilike('brand', `%${filtros.marca}%`)
      if (filtros.genero) query = query.eq('gender', filtros.genero)
      if (filtros.precioMin) query = query.gte('price_original', parseFloat(filtros.precioMin))
      if (filtros.precioMax) query = query.lte('price_original', parseFloat(filtros.precioMax))

      // ✅ Solo mostrar productos con stock disponible
      query = query.gt('stock', 0)

      const [campo, direccion] = filtros.orden.split('-')
      query = query.order(campo, { ascending: direccion === 'asc' })

      const inicio = (paginaActual - 1) * productosPorPagina
      const fin = inicio + productosPorPagina - 1
      query = query.range(inicio, fin)

      const { data, error: queryError, count } = await query

      // ✅ Si el componente se desmontó, no actualizar estado
      if (cancelled) return

      if (queryError) throw queryError

      setProductos(data || [])
      setTotalProductos(count || 0)
    } catch (err) {
      if (cancelled) return
      console.error('Error al cargar productos:', err)
      setError('No se pudieron cargar los productos. Intenta de nuevo.')
    } finally {
      if (!cancelled) setCargando(false)
    }
    
    // ✅ Cleanup function para evitar memory leaks
    return () => {
      cancelled = true
    }
  }, [filtros, paginaActual])

  useEffect(() => {
    cargarProductos()
  }, [cargarProductos])

  const handleChangeFiltros = (nuevosFiltros) => {
    setFiltros(nuevosFiltros)
    setPaginaActual(1) // ✅ Resetear página al cambiar filtros
  }

  const totalPages = Math.ceil(totalProductos / productosPorPagina)

  if (cargando) {
    return (
      <div>
        <FilterBar filtros={filtros} onChangeFiltros={handleChangeFiltros} />
        <div className="flex flex-col items-center justify-center py-32">
          <div className="w-8 h-8 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin"></div>
          <p className="mt-4 text-sm text-muted-foreground font-mono">Cargando colección...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <FilterBar filtros={filtros} onChangeFiltros={handleChangeFiltros} />
        <div className="text-center py-32">
          <p className="text-red-500 font-mono text-sm">{error}</p>
          <button 
            onClick={() => { setError(null); cargarProductos() }} 
            className="mt-4 underline text-sm hover:text-foreground transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <FilterBar filtros={filtros} onChangeFiltros={handleChangeFiltros} />

      {productos.length === 0 ? (
        <div className="text-center py-32">
          <p className="text-muted-foreground font-mono text-sm">No se encontraron productos.</p>
          <p className="text-xs text-muted-foreground mt-1">Prueba ajustando los filtros.</p>
        </div>
      ) : (
        <>
          <div className="mb-6 text-right">
            <p className="text-xs text-muted-foreground font-mono tracking-wide">
              {totalProductos} piezas encontradas
            </p>
          </div>
          
          {/* Grid con espaciado editorial */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
            {productos.map((producto, idx) => (
              <div 
                key={producto.id} 
                className="animate-fade-in-up"
                style={{ animationDelay: `${idx * 50}ms`, animationFillMode: 'backwards' }}
              >
                <ProductCard product={producto} />
              </div>
            ))}
          </div>

          {/* Paginación refinada */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-16" role="navigation" aria-label="Paginación de productos">
              <button
                onClick={() => setPaginaActual(paginaActual - 1)}
                disabled={paginaActual === 1}
                className="px-4 py-2 text-xs font-mono text-foreground/60 hover:text-foreground border border-border rounded-full disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                aria-label="Página anterior"
              >
                ← Anterior
              </button>
              <div className="flex gap-1" role="group" aria-label="Número de página">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  // Mostrar páginas cercanas a la actual
                  let page
                  if (totalPages <= 5) {
                    page = i + 1
                  } else if (paginaActual <= 3) {
                    page = i + 1
                  } else if (paginaActual >= totalPages - 2) {
                    page = totalPages - 4 + i
                  } else {
                    page = paginaActual - 2 + i
                  }
                  
                  return (
                    <button
                      key={page}
                      onClick={() => setPaginaActual(page)}
                      className={`w-8 h-8 text-xs font-mono rounded-full transition-all ${
                        page === paginaActual
                          ? 'bg-foreground text-background'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                      aria-label={`Ir a página ${page}`}
                      aria-current={page === paginaActual ? 'page' : undefined}
                    >
                      {page}
                    </button>
                  )
                })}
              </div>
              <button
                onClick={() => setPaginaActual(paginaActual + 1)}
                disabled={paginaActual === totalPages}
                className="px-4 py-2 text-xs font-mono text-foreground/60 hover:text-foreground border border-border rounded-full disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                aria-label="Página siguiente"
              >
                Siguiente →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default ProductGrid