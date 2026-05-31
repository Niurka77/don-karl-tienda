import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import ProductCard from './ProductCard'
import FilterBar from './FilterBar'

/* ─────────────────────────────────────────
   Skeleton de carga — editorial
───────────────────────────────────────── */
const SkeletonCard = () => (
  <div style={{ background: 'white', boxShadow: '0 2px 12px rgba(26,17,24,0.04)' }}>
    {/* Imagen */}
    <div
      style={{
        aspectRatio: '4/5',
        background: 'linear-gradient(110deg, var(--color-kb-blush) 30%, var(--color-kb-petal) 50%, var(--color-kb-blush) 70%)',
        backgroundSize: '200% 100%',
        animation: 'shimmerBg 1.6s linear infinite',
      }}
    />
    {/* Texto */}
    <div className="px-4 pt-4 pb-5 space-y-3">
      <div style={{ height: '8px', width: '45%', borderRadius: '2px', background: 'var(--color-kb-petal)' }} />
      <div style={{ height: '12px', width: '80%', borderRadius: '2px', background: 'var(--color-kb-blush)' }} />
      <div style={{ height: '12px', width: '60%', borderRadius: '2px', background: 'var(--color-kb-blush)' }} />
      <div
        style={{
          height: '1px',
          background: 'rgba(212,120,138,0.1)',
          marginTop: '8px',
          marginBottom: '8px',
        }}
      />
      <div style={{ height: '18px', width: '35%', borderRadius: '2px', background: 'var(--color-kb-petal)' }} />
    </div>
  </div>
)

/* ─────────────────────────────────────────
   Paginación editorial
───────────────────────────────────────── */
const Pagination = ({ current, total, onChange }) => {
  const pages = []

  if (total <= 5) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else if (current <= 3) {
    pages.push(1, 2, 3, 4, 5)
  } else if (current >= total - 2) {
    for (let i = total - 4; i <= total; i++) pages.push(i)
  } else {
    for (let i = current - 2; i <= current + 2; i++) pages.push(i)
  }

  const BtnStyle = (active) => ({
    width: active ? '32px' : '28px',
    height: active ? '32px' : '28px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.7rem',
    fontWeight: active ? 500 : 300,
    letterSpacing: '0.04em',
    transition: 'all 0.3s ease',
    background: active
      ? 'var(--color-kb-obsidian)'
      : 'transparent',
    color: active
      ? 'var(--color-kb-ivory)'
      : 'var(--color-kb-mauve)',
    border: active
      ? 'none'
      : '1px solid rgba(212,120,138,0.18)',
    cursor: active ? 'default' : 'pointer',
  })

  const ArrowStyle = (disabled) => ({
    fontSize: '0.65rem',
    fontWeight: 400,
    letterSpacing: '0.16em',
    color: disabled ? 'rgba(154,116,128,0.3)' : 'var(--color-kb-mauve)',
    padding: '0.4rem 0.8rem',
    border: `1px solid ${disabled ? 'rgba(212,120,138,0.08)' : 'rgba(212,120,138,0.2)'}`,
    borderRadius: '2px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.3s ease',
    fontFamily: 'var(--font-sans)',
    textTransform: 'uppercase',
  })

  return (
    <nav
      className="flex items-center justify-center gap-2 mt-16 pt-10"
      style={{ borderTop: '1px solid rgba(212,120,138,0.1)' }}
      role="navigation"
      aria-label="Paginación"
    >
      <button
        onClick={() => onChange(current - 1)}
        disabled={current === 1}
        style={ArrowStyle(current === 1)}
        onMouseEnter={e => { if (current !== 1) e.currentTarget.style.color = 'var(--color-kb-charcoal)'; e.currentTarget.style.borderColor = 'rgba(212,120,138,0.4)' }}
        onMouseLeave={e => { e.currentTarget.style.color = current === 1 ? 'rgba(154,116,128,0.3)' : 'var(--color-kb-mauve)'; e.currentTarget.style.borderColor = current === 1 ? 'rgba(212,120,138,0.08)' : 'rgba(212,120,138,0.2)' }}
        aria-label="Anterior"
      >
        ← Anterior
      </button>

      <div className="flex items-center gap-1.5" role="group">
        {pages.map((page) => (
          <button
            key={page}
            onClick={() => page !== current && onChange(page)}
            style={BtnStyle(page === current)}
            aria-label={`Página ${page}`}
            aria-current={page === current ? 'page' : undefined}
            onMouseEnter={e => { if (page !== current) { e.currentTarget.style.borderColor = 'var(--color-kb-rose)'; e.currentTarget.style.color = 'var(--color-kb-rose-deep)' } }}
            onMouseLeave={e => { if (page !== current) { e.currentTarget.style.borderColor = 'rgba(212,120,138,0.18)'; e.currentTarget.style.color = 'var(--color-kb-mauve)' } }}
          >
            {page}
          </button>
        ))}
      </div>

      <button
        onClick={() => onChange(current + 1)}
        disabled={current === total}
        style={ArrowStyle(current === total)}
        onMouseEnter={e => { if (current !== total) e.currentTarget.style.color = 'var(--color-kb-charcoal)'; e.currentTarget.style.borderColor = 'rgba(212,120,138,0.4)' }}
        onMouseLeave={e => { e.currentTarget.style.color = current === total ? 'rgba(154,116,128,0.3)' : 'var(--color-kb-mauve)'; e.currentTarget.style.borderColor = current === total ? 'rgba(212,120,138,0.08)' : 'rgba(212,120,138,0.2)' }}
        aria-label="Siguiente"
      >
        Siguiente →
      </button>
    </nav>
  )
}

/* ─────────────────────────────────────────
   ProductGrid
───────────────────────────────────────── */
const ProductGrid = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const gridRef = useRef(null)

  const [productos,       setProductos]       = useState([])
  const [cargando,        setCargando]        = useState(true)
  const [error,           setError]           = useState(null)
  const [paginaActual,    setPaginaActual]    = useState(1)
  const [totalProductos,  setTotalProductos]  = useState(0)

  const productosPorPagina = 8

  const [filtros, setFiltros] = useState(() => ({
    categoria: searchParams.get('categoria') || '',
    marca:     searchParams.get('marca')     || '',
    genero:    searchParams.get('genero')    || '',
    precioMin: searchParams.get('precioMin') || '',
    precioMax: searchParams.get('precioMax') || '',
    orden:     searchParams.get('orden')     || 'created_at-desc',
  }))

  // Sincronizar URL → estado
  useEffect(() => {
    const f = {
      categoria: searchParams.get('categoria') || '',
      marca:     searchParams.get('marca')     || '',
      genero:    searchParams.get('genero')    || '',
      precioMin: searchParams.get('precioMin') || '',
      precioMax: searchParams.get('precioMax') || '',
      orden:     searchParams.get('orden')     || 'created_at-desc',
    }
    setFiltros(prev => JSON.stringify(prev) === JSON.stringify(f) ? prev : f)
    setPaginaActual(1)
  }, [searchParams])

  // Cargar productos
  const cargarProductos = useCallback(async () => {
    let cancelled = false
    try {
      setCargando(true)
      setError(null)

      let query = supabase.from('products').select('*', { count: 'exact' })

      if (filtros.categoria) query = query.eq('category',   filtros.categoria)
      if (filtros.marca)     query = query.ilike('brand',   `%${filtros.marca}%`)
      if (filtros.genero)    query = query.eq('gender',     filtros.genero)
      if (filtros.precioMin) query = query.gte('price_original', parseFloat(filtros.precioMin))
      if (filtros.precioMax) query = query.lte('price_original', parseFloat(filtros.precioMax))

      query = query.gt('stock', 0)

      const [campo, dir] = filtros.orden.split('-')
      query = query.order(campo, { ascending: dir === 'asc' })

      const inicio = (paginaActual - 1) * productosPorPagina
      query = query.range(inicio, inicio + productosPorPagina - 1)

      const { data, error: e, count } = await query
      if (cancelled) return
      if (e) throw e
      setProductos(data || [])
      setTotalProductos(count || 0)
    } catch (err) {
      if (!cancelled) {
        console.error('Error cargando productos:', err)
        setError('No se pudieron cargar los productos. Intenta de nuevo.')
      }
    } finally {
      if (!cancelled) setCargando(false)
    }
    return () => { cancelled = true }
  }, [filtros, paginaActual])

  useEffect(() => { cargarProductos() }, [cargarProductos])

  // Scroll automático al grid
  useEffect(() => {
    if (!cargando && (productos.length > 0 || error) && searchParams.toString()) {
      const t = setTimeout(() => {
        if (gridRef.current) {
          const offset = gridRef.current.getBoundingClientRect().top + window.pageYOffset - 140
          window.scrollTo({ top: offset, behavior: 'smooth' })
        }
      }, 300)
      return () => clearTimeout(t)
    }
  }, [productos, cargando, error, searchParams])

  const handleChangeFiltros = (nf) => {
    setFiltros(nf)
    setPaginaActual(1)
    const p = new URLSearchParams()
    if (nf.categoria) p.set('categoria', nf.categoria)
    if (nf.marca)     p.set('marca',     nf.marca)
    if (nf.genero)    p.set('genero',    nf.genero)
    if (nf.precioMin) p.set('precioMin', nf.precioMin)
    if (nf.precioMax) p.set('precioMax', nf.precioMax)
    if (nf.orden && nf.orden !== 'created_at-desc') p.set('orden', nf.orden)
    setSearchParams(p)
  }

  const totalPages = Math.ceil(totalProductos / productosPorPagina)

  /* ── CARGANDO ── */
  if (cargando) {
    return (
      <div ref={gridRef} id="product-grid-section" className="scroll-mt-32">
        <FilterBar filtros={filtros} onChangeFiltros={handleChangeFiltros} />
        <div className="max-w-screen-xl mx-auto px-6 lg:px-10 py-12">
          {/* Inline shimmer keyframe */}
          <style>{`
            @keyframes shimmerBg {
              0%   { background-position: 200% center; }
              100% { background-position: -200% center; }
            }
          `}</style>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  /* ── ERROR ── */
  if (error) {
    return (
      <div ref={gridRef} id="product-grid-section" className="scroll-mt-32">
        <FilterBar filtros={filtros} onChangeFiltros={handleChangeFiltros} />
        <div className="max-w-screen-xl mx-auto px-6 lg:px-10 py-32 text-center">
          <p
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.2rem',
              fontWeight: 300,
              color: 'var(--color-kb-mauve)',
              marginBottom: '1.5rem',
            }}
          >
            {error}
          </p>
          <button
            onClick={() => { setError(null); cargarProductos() }}
            className="btn-kb-ghost"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  /* ── RENDER PRINCIPAL ── */
  return (
    <div ref={gridRef} id="product-grid-section" className="scroll-mt-32">
      <FilterBar filtros={filtros} onChangeFiltros={handleChangeFiltros} />

      <div className="max-w-screen-xl mx-auto px-6 lg:px-10 py-12">

        {productos.length === 0 ? (
          /* Vacío */
          <div className="py-32 flex flex-col items-center gap-4">
            <div
              style={{
                width: '64px',
                height: '1px',
                background: 'rgba(212,120,138,0.3)',
                marginBottom: '1rem',
              }}
            />
            <p
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.5rem',
                fontWeight: 300,
                fontStyle: 'italic',
                color: 'var(--color-kb-mauve)',
              }}
            >
              Sin resultados
            </p>
            <p
              style={{
                fontSize: '0.8rem',
                fontWeight: 300,
                color: 'rgba(154,116,128,0.6)',
                letterSpacing: '0.06em',
              }}
            >
              Prueba ajustando los filtros
            </p>
          </div>
        ) : (
          <>
            {/* Contador + separador */}
            <div className="flex items-center justify-between mb-8 pb-6"
              style={{ borderBottom: '1px solid rgba(212,120,138,0.1)' }}
            >
              {/* Título de sección */}
              <div className="flex items-center gap-4">
                <span
                  style={{
                    width: '24px',
                    height: '1px',
                    background: 'var(--color-kb-rose)',
                    display: 'inline-block',
                    flexShrink: 0,
                  }}
                />
                <h2
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.4rem',
                    fontWeight: 300,
                    fontStyle: 'italic',
                    color: 'var(--color-kb-charcoal)',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {filtros.categoria
                    ? filtros.categoria.charAt(0).toUpperCase() + filtros.categoria.slice(1)
                    : filtros.genero
                    ? filtros.genero.charAt(0).toUpperCase() + filtros.genero.slice(1)
                    : 'Colección'}
                </h2>
              </div>

              {/* Conteo */}
              <p
                className="text-editorial"
                style={{
                  color: 'var(--color-kb-mauve)',
                  fontSize: '0.62rem',
                  letterSpacing: '0.2em',
                }}
              >
                {totalProductos} {totalProductos === 1 ? 'pieza' : 'piezas'}
              </p>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
              {productos.map((producto, idx) => (
                <div
                  key={producto.id}
                  className="animate-fade-up"
                  style={{
                    animationDelay: `${idx * 55}ms`,
                    animationFillMode: 'backwards',
                  }}
                >
                  <ProductCard product={producto} />
                </div>
              ))}
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <Pagination
                current={paginaActual}
                total={totalPages}
                onChange={(p) => {
                  setPaginaActual(p)
                  if (gridRef.current) {
                    const offset = gridRef.current.getBoundingClientRect().top + window.pageYOffset - 140
                    window.scrollTo({ top: offset, behavior: 'smooth' })
                  }
                }}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default ProductGrid
