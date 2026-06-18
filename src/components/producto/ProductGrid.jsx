import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import ProductCard from './ProductCard'
import FilterBar from './FilterBar'

// ─── Paleta Aurora Bloom ─────────────────────────────────────────────────────
const p = {
  rose: '#E891A8',
  roseDeep: '#C9607F',
  roseVivid: '#FF5C8A',
  roseBlush: '#FFC2D4',
  roseMist: '#FFE8EF',
  champagne: '#E8D5B7',
  champagneLt: '#F5EBD9',
  ivory: '#FDF8F4',
  cream: '#FAF3ED',
  gold: '#C9A961',
  goldSoft: '#D4B87A',
  coral: '#FF8E72',
  ink: '#2D1F26',
  textMain: '#4A3340',
  textSoft: '#8B6F7A',
}

// ─── Skeleton de carga — editorial ───────────────────────────────────────────
const SkeletonCard = () => (
  <div
    style={{
      background: p.ivory,
      boxShadow: `0 4px 20px ${p.ink}08`,
      borderRadius: '6px',
      overflow: 'hidden',
    }}
  >
    {/* Imagen */}
    <div
      style={{
        aspectRatio: '4/5',
        background: `linear-gradient(110deg, ${p.roseMist} 30%, ${p.roseBlush}40 50%, ${p.roseMist} 70%)`,
        backgroundSize: '200% 100%',
        animation: 'shimmerBg 1.8s linear infinite',
      }}
    />
    {/* Texto */}
    <div className="px-4 pt-4 pb-5 space-y-3">
      <div style={{ height: '8px', width: '45%', borderRadius: '2px', background: p.roseMist }} />
      <div style={{ height: '12px', width: '80%', borderRadius: '2px', background: p.roseBlush }} />
      <div style={{ height: '12px', width: '60%', borderRadius: '2px', background: p.roseBlush }} />
      <div
        style={{
          height: '1px',
          background: `${p.roseBlush}30`,
          marginTop: '8px',
          marginBottom: '8px',
        }}
      />
      <div style={{ height: '18px', width: '35%', borderRadius: '2px', background: p.roseMist }} />
    </div>
  </div>
)

// ─── Paginación editorial ────────────────────────────────────────────────────
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
    width: active ? '34px' : '30px',
    height: active ? '34px' : '30px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.72rem',
    fontWeight: active ? 500 : 300,
    letterSpacing: '0.04em',
    transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
    background: active
      ? `linear-gradient(135deg, ${p.roseVivid}, ${p.coral})`
      : 'transparent',
    color: active ? p.ivory : p.textSoft,
    border: active ? 'none' : `1.5px solid ${p.roseBlush}40`,
    cursor: active ? 'default' : 'pointer',
    boxShadow: active ? `0 6px 20px ${p.roseVivid}40` : 'none',
    fontFamily: 'ui-sans-serif, system-ui, sans-serif',
  })

  const ArrowStyle = (disabled) => ({
    fontSize: '0.65rem',
    fontWeight: 500,
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    color: disabled ? `${p.textSoft}50` : p.roseDeep,
    padding: '0.5rem 1rem',
    border: `1.5px solid ${disabled ? `${p.roseBlush}20` : `${p.roseBlush}50`}`,
    borderRadius: '50px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
    fontFamily: 'ui-sans-serif, system-ui, sans-serif',
    background: 'transparent',
  })

  return (
    <nav
      className="flex items-center justify-center gap-2 mt-16 pt-10"
      style={{ borderTop: `1px solid ${p.roseBlush}25` }}
      role="navigation"
      aria-label="Paginación"
    >
      <button
        onClick={() => onChange(current - 1)}
        disabled={current === 1}
        style={ArrowStyle(current === 1)}
        onMouseEnter={(e) => {
          if (current !== 1) {
            e.currentTarget.style.color = p.roseVivid
            e.currentTarget.style.borderColor = p.roseVivid
            e.currentTarget.style.boxShadow = `0 4px 16px ${p.roseBlush}40`
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = current === 1 ? `${p.textSoft}50` : p.roseDeep
          e.currentTarget.style.borderColor = current === 1 ? `${p.roseBlush}20` : `${p.roseBlush}50`
          e.currentTarget.style.boxShadow = 'none'
        }}
        aria-label="Anterior"
      >
        ← Anterior
      </button>

      <div className="flex items-center gap-2" role="group">
        {pages.map((page) => (
          <button
            key={page}
            onClick={() => page !== current && onChange(page)}
            style={BtnStyle(page === current)}
            aria-label={`Página ${page}`}
            aria-current={page === current ? 'page' : undefined}
            onMouseEnter={(e) => {
              if (page !== current) {
                e.currentTarget.style.borderColor = p.roseVivid
                e.currentTarget.style.color = p.roseDeep
                e.currentTarget.style.transform = 'scale(1.1)'
              }
            }}
            onMouseLeave={(e) => {
              if (page !== current) {
                e.currentTarget.style.borderColor = `${p.roseBlush}40`
                e.currentTarget.style.color = p.textSoft
                e.currentTarget.style.transform = 'scale(1)'
              }
            }}
          >
            {page}
          </button>
        ))}
      </div>

      <button
        onClick={() => onChange(current + 1)}
        disabled={current === total}
        style={ArrowStyle(current === total)}
        onMouseEnter={(e) => {
          if (current !== total) {
            e.currentTarget.style.color = p.roseVivid
            e.currentTarget.style.borderColor = p.roseVivid
            e.currentTarget.style.boxShadow = `0 4px 16px ${p.roseBlush}40`
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = current === total ? `${p.textSoft}50` : p.roseDeep
          e.currentTarget.style.borderColor = current === total ? `${p.roseBlush}20` : `${p.roseBlush}50`
          e.currentTarget.style.boxShadow = 'none'
        }}
        aria-label="Siguiente"
      >
        Siguiente →
      </button>
    </nav>
  )
}

// ─── ProductGrid ─────────────────────────────────────────────────────────────
const ProductGrid = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const gridRef = useRef(null)
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [paginaActual, setPaginaActual] = useState(1)
  const [totalProductos, setTotalProductos] = useState(0)
  const productosPorPagina = 8

  const [filtros, setFiltros] = useState(() => ({
    categoria: searchParams.get('categoria') || '',
    marca: searchParams.get('marca') || '',
    genero: searchParams.get('genero') || '',
    precioMin: searchParams.get('precioMin') || '',
    precioMax: searchParams.get('precioMax') || '',
    orden: searchParams.get('orden') || 'created_at-desc',
  }))

  // Sincronizar URL → estado
  useEffect(() => {
    const f = {
      categoria: searchParams.get('categoria') || '',
      marca: searchParams.get('marca') || '',
      genero: searchParams.get('genero') || '',
      precioMin: searchParams.get('precioMin') || '',
      precioMax: searchParams.get('precioMax') || '',
      orden: searchParams.get('orden') || 'created_at-desc',
    }
    setFiltros((prev) => (JSON.stringify(prev) === JSON.stringify(f) ? prev : f))
    setPaginaActual(1)
  }, [searchParams])

  // Cargar productos
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
      if (filtros.busqueda) {
      query = query.ilike('name', `%${filtros.busqueda}%`)
      }

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
    return () => {
      cancelled = true
    }
  }, [filtros, paginaActual])

  useEffect(() => {
    cargarProductos()
  }, [cargarProductos])

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
    if (nf.marca) p.set('marca', nf.marca)
    if (nf.genero) p.set('genero', nf.genero)
    if (nf.precioMin) p.set('precioMin', nf.precioMin)
    if (nf.precioMax) p.set('precioMax', nf.precioMax)
    if (nf.orden && nf.orden !== 'created_at-desc') p.set('orden', nf.orden)
    setSearchParams(p)
    if (nf.busqueda) p.set('busqueda', nf.busqueda)
  }

  const totalPages = Math.ceil(totalProductos / productosPorPagina)

  // 🔧 CAMBIO: Fondo con textura sutil
  const sectionStyle = {
    background: `linear-gradient(180deg, ${p.cream} 0%, ${p.ivory} 100%)`,
    position: 'relative',
  }

  // ── CARGANDO ──
  if (cargando) {
    return (
      <div ref={gridRef} id="product-grid-section" className="scroll-mt-32" style={sectionStyle}>
        {/* Textura de grano sutil */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-multiply"
          style={{
            backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.5'/></svg>")`,
          }}
        />
        <div className="relative z-10 max-w-screen-xl mx-auto px-6 lg:px-10 py-12">
          <FilterBar filtros={filtros} onChangeFiltros={handleChangeFiltros} />
          <style>{`@keyframes shimmerBg { 0% { background-position: 200% center; } 100% { background-position: -200% center; } }`}</style>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ── ERROR ──
  if (error) {
    return (
      <div ref={gridRef} id="product-grid-section" className="scroll-mt-32" style={sectionStyle}>
        <div className="relative z-10 max-w-screen-xl mx-auto px-6 lg:px-10 py-32 text-center">
          <p
            style={{
              fontFamily: 'Georgia, serif',
              fontSize: '1.3rem',
              fontWeight: 300,
              fontStyle: 'italic',
              color: p.roseDeep,
              marginBottom: '1.5rem',
            }}
          >
            {error}
          </p>
          <button
            onClick={() => {
              setError(null)
              cargarProductos()
            }}
            style={{
              fontSize: '0.7rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              fontWeight: 600,
              color: p.ivory,
              background: `linear-gradient(135deg, ${p.roseVivid}, ${p.coral})`,
              border: 'none',
              padding: '0.8rem 2rem',
              borderRadius: '50px',
              cursor: 'pointer',
              boxShadow: `0 8px 24px ${p.roseVivid}40`,
              transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
              fontFamily: 'ui-sans-serif, system-ui, sans-serif',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = `0 12px 32px ${p.roseVivid}60`
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = `0 8px 24px ${p.roseVivid}40`
            }}
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  // ── RENDER PRINCIPAL ──
  return (
    <div ref={gridRef} id="product-grid-section" className="scroll-mt-32" style={sectionStyle}>
      {/* Textura de grano sutil */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-multiply"
        style={{
          backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.5'/></svg>")`,
        }}
      />

      <div className="relative z-10 max-w-screen-xl mx-auto px-6 lg:px-10 py-12">
        <FilterBar filtros={filtros} onChangeFiltros={handleChangeFiltros} />

        {productos.length === 0 ? (
          /* Vacío */
          <div className="py-32 flex flex-col items-center gap-4">
            <div
              style={{
                width: '64px',
                height: '1px',
                background: `linear-gradient(90deg, transparent, ${p.roseBlush}, transparent)`,
                marginBottom: '1rem',
              }}
            />
            <p
              style={{
                fontFamily: 'Georgia, serif',
                fontSize: '1.6rem',
                fontWeight: 300,
                fontStyle: 'italic',
                color: p.roseDeep,
              }}
            >
              Sin resultados
            </p>
            <p
              style={{
                fontSize: '0.8rem',
                fontWeight: 300,
                color: p.textSoft,
                letterSpacing: '0.06em',
              }}
            >
              Prueba ajustando los filtros
            </p>
          </div>
        ) : (
          <>
            {/* Contador + separador */}
            <div
              className="flex items-center justify-between mb-8 pb-6"
              style={{ borderBottom: `1px solid ${p.roseBlush}25` }}
            >
              {/* Título de sección */}
              <div className="flex items-center gap-4">
                <span
                  style={{
                    width: '28px',
                    height: '1px',
                    background: `linear-gradient(90deg, ${p.roseVivid}, ${p.gold})`,
                    display: 'inline-block',
                    flexShrink: 0,
                  }}
                />
                <h2
                  style={{
                    fontFamily: 'Georgia, serif',
                    fontSize: '1.5rem',
                    fontWeight: 300,
                    fontStyle: 'italic',
                    color: p.textMain,
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
                style={{
                  color: p.textSoft,
                  fontSize: '0.62rem',
                  letterSpacing: '0.25em',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  fontFamily: 'ui-sans-serif, system-ui, sans-serif',
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
                onChange={(pg) => {
                  setPaginaActual(pg)
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