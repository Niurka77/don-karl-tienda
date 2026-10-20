import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

// ─── Configuración de paginación ────────────────────────────────────────────
const PRODUCTOS_POR_PAGINA = 24

// ─── Hook principal - fuente única de datos para productos ──────────────────
export const useProducts = (initialFilters = {}) => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    categoria: initialFilters.categoria || '',
    marca: initialFilters.marca || '',
    genero: initialFilters.genero || '',
    precioMin: initialFilters.precioMin || '',
    precioMax: initialFilters.precioMax || '',
    origen: initialFilters.origen || '',
    busqueda: initialFilters.busqueda || '',
    orden: initialFilters.orden || 'created_at-desc',
    pagina: initialFilters.pagina || 1,
  })
  const [totalProductos, setTotalProductos] = useState(0)

  // ─── Cargar productos ────────────────────────────────────────────────────
  const cargarProductos = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      let query = supabase.from('products').select('*', { count: 'exact' })

      if (filters.categoria) query = query.eq('category', filters.categoria)
      if (filters.marca) query = query.ilike('brand', `%${filters.marca}%`)
      if (filters.genero) query = query.eq('gender', filters.genero)
      if (filters.precioMin)
        query = query.gte('price_original', parseFloat(filters.precioMin))
      if (filters.precioMax)
        query = query.lte('price_original', parseFloat(filters.precioMax))
      if (filters.origen) query = query.eq('origin', filters.origen)
      if (filters.busqueda) {
        const q = `*${filters.busqueda}*`
        query = query.or(`name.ilike.${q},brand.ilike.${q},sku.ilike.${q}`)
      }

      query = query.gt('stock', 0)

      const [campo, dir] = filters.orden.split('-')
      query = query.order(campo, { ascending: dir === 'asc' })

      const inicio = (filters.pagina - 1) * PRODUCTOS_POR_PAGINA
      query = query.range(inicio, inicio + PRODUCTOS_POR_PAGINA - 1)

      const { data, error: e, count } = await query
      if (e) throw e

      setProducts(data || [])
      setTotalProductos(count || 0)
    } catch (err) {
      console.error('Error cargando productos:', err)
      setError('No se pudieron cargar los productos. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }, [filters])

  // ─── Actualizar filtros y recargar ──────────────────────────────────────
  const actualizarFiltros = useCallback((newFilters) => {
    setFilters({
      ...filters,
      ...newFilters,
      pagina: 1, // Siempre reiniciar a la página 1 al cambiar filtros
    })
    cargarProductos()
  }, [filters, cargarProductos])

  // ─── Paginación siguiente/anterior ────────────────────────────────────────
  const siguientePagina = useCallback(() => {
    if (filters.pagina * PRODUCTOS_POR_PAGINA < totalProductos) {
      setFilters({ ...filters, pagina: filters.pagina + 1 })
    }
  }, [filters])

  const paginaAnterior = useCallback(() => {
    if (filters.pagina > 1) {
      setFilters({ ...filters, pagina: filters.pagina - 1 })
    }
  }, [filters])

  const irAPagina = useCallback((pagina) => {
    if (pagina >= 1 && pagina <= Math.ceil(totalProductos / PRODUCTOS_POR_PAGINA)) {
      setFilters({ ...filters, pagina })
    }
  }, [filters])

  return {
    // Estado
    products,
    loading,
    error,
    totalProductos,
    totalPages: Math.ceil(totalProductos / PRODUCTOS_POR_PAGINA),
    filters,

    // Acciones
    actualizarFiltros,
    siguientePagina,
    paginaAnterior,
    irAPagina,
    refetch: cargarProductos, // Forzar recarga
  }
}