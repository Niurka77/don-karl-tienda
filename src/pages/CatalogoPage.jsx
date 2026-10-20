import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useProducts } from '../hooks/useProducts'
import { WHATSAPP_PHONE } from '../lib/constants'
import { p } from '../lib/theme'

const CatalogoPage = () => {
  const navigate = useNavigate()
  const { products, loading, error, totalProductos, filters, actualizarFiltros, irAPagina } = useProducts()

  // Inicializar filtros con los de URL si existen
  useEffect(() => {
    const load = async () => {
      await actualizarFiltros({})
    }
    load()
  }, [actualizarFiltros])

  const handleChangeFiltro = useCallback((nombreFiltro, valor) => {
    actualizarFiltros({ [nombreFiltro]: valor })
  }, [actualizarFiltros])

  const handleScrollCategorias = useCallback((event) => {
    const target = event.target
    if (target.dataset && target.dataset.category) {
      handleChangeFiltro('categoria', target.dataset.category)
    }
  }, [handleChangeFiltro])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-[#E8D5B7] border-t-[#C9607F] rounded-full animate-spin" />
    </div>
  )

  if (error) return (
    <div className="min-h-screen flex items-center justify-center text-center p-8">
      <p style={{ color: p.roseDeep }}>{error}</p>
      <Link to="/" className="btn-kb-ghost mt-4">← Volver a la tienda</Link>
    </div>
  )

  // --- 1. TÍTULO SIMPLE + DESCRIPCIÓN ---
  const titulo = filters.categoria
    ? filters.categoria.charAt(0).toUpperCase() + filters.categoria.slice(1)
    : 'Catálogo'

  return (
    <div style={{ background: p.ivory, minHeight: '100vh' }}>

      {/* --- Título y descripción simple --- */}
      <div className="py-4 px-6 text-center">
        <h1 className="font-display font-light tracking-[-0.02em] text-2xl md:text-3xl mb-1" style={{ color: p.charcoal }}>
          {titulo}
        </h1>
        <p className="text-mauve text-sm font-light leading-relaxed max-w-xl mx-auto">
          Descubre las últimas colecciones de moda y accesorios. Usa los filtros para encontrar exactamente lo que buscas.
        </p>
      </div>

      {/* --- 2. Fila de categorías circulares con scroll horizontal --- */}
      <div className="overflow-x-auto py-3 px-6 bg-white border-b border-[rgba(212,120,138,0.1)]">
        <div className="inline-flex gap-1" role="tablist" aria-label="Categorías">
          {/* Categoría "Todas" */}
          <button
            data-category="all"
            onClick={() => handleChangeFiltro('categoria', 'all')}
            className={filters.categoria === 'all'
              ? 'inline-flex items-center rounded-full bg-[var(--color-kb-rose)] px-4 py-2.5 text-sm font-medium text-white'
              : 'inline-flex items-center rounded-full bg-transparent px-4 py-2.5 text-sm font-medium text-[var(--color-kb-mauve)] hover:text-[var(--color-kb-rose)] hover:bg-[var(--color-kb-rose)] transition-all'
            }
            style={{ marginRight: '2px' }}
            aria-current={filters.categoria === 'all' ? 'page' : undefined}
          >
            <span className="hidden md:inline">Todos</span>
            <svg className="w-4 h-4 mx-1.5 -mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M9 19l3 3L15 5M9 5l3-3" />
            </svg>
            <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[var(--color-kb-rose)]" aria-hidden="true" />
          </button>

          {/* Categorías únicas de los productos */}
          {products.length > 0 && (
            <div className="flex gap-2 overflow-x-scroll pb-1 scrollbar-hide" style={{ scrollbarWidth: 'none', '-ms-scrollbar-width': 'none' }}>
              {['all', ...new Set(products.map(p => p.category).filter(Boolean))].map((cat) => {
                const productsEnCat = products.filter(p => p.category === cat)
                return (
                  <button
                    key={cat}
                    data-category={cat}
                    onClick={() => handleChangeFiltro('categoria', cat)}
                    className={filters.categoria === cat
                      ? 'inline-flex items-center rounded-full bg-[var(--color-kb-rose)] px-4 py-2.5 text-sm font-medium text-white'
                      : 'inline-flex items-center rounded-full bg-transparent px-4 py-2.5 text-sm font-medium text-[var(--color-kb-mauve)] hover:text-[var(--color-kb-rose)] hover:bg-[var(--color-kb-rose)] transition-all'}
                    style={{ marginRight: '2px' }}
                    aria-current={filters.categoria === cat ? 'page' : undefined}
                  >
                    <span className="hidden md:inline">{cat || 'Sin categoría'}</span>
                    <svg className="w-4 h-4 mx-1.5 -mt-0.5 fill-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M9 19l3 3L15 5M9 5l3-3" />
                    </svg>
                    <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[var(--color-kb-rose)]" aria-hidden="true" />
                  </button>
                )
              })}
            </div>
          )}

          {/* Flechas de scroll para móvil */}
          <button
            onClick={() => window.scrollBy({ left: 200, behavior: 'smooth' })}
            className="hidden md:block p-2 rounded-md hover:bg-[var(--color-kb-rose)] text-[var(--color-kb-rose)]"
            aria-label="Scroll categorías siguiente"
          >
            →
          </button>
          <button
            onClick={() => window.scrollBy({ left: -200, behavior: 'smooth' })}
            className="hidden md:block p-2 rounded-md hover:bg-[var(--color-kb-rose)] text-[var(--color-kb-rose)]"
            aria-label="Scroll categorías anterior"
          >
            ←
          </button>
        </div>
      </div>

      {/* --- 3. Barra de filtros --- */}
      <div className="py-4 px-6 bg-white border-b border-[rgba(212,120,138,0.1)]">
        <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
          {/* Categoría */}
          <div className="flex-1 sm:flex-1">
            <label className="sr-only">Categoría</label>
            <div className="relative">
              <select
                onChange={(e) => handleChangeFiltro('categoria', e.target.value)}
                className="block w-full rounded-border border border-[rgba(212,120,138,0.3)] px-3 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-kb-rose)] focus:border-transparent"
              >
                <option value="">Todas las categorías</option>
                {['all', ...new Set(products.map(p => p.category).filter(Boolean))].map((cat) => (
                  <option key={cat} value={cat} selected={filters.categoria === cat}>
                    {cat || 'Sin categoría'}
                  </option>
                ))}
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-kb-mauve)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 15l-3-3l-2-2l-5-5l5-5l2-2l3 3M6 12l3 3l3-3l-3-3l3-3M6 12l-3 3l3 3" />
              </svg>
            </div>
          </div>

          {/* Marca - solo de datos reales */}
          <div className="flex-1 sm:flex-1">
            <label className="sr-only">Marca</label>
            <div className="relative">
              <select
                onChange={(e) => handleChangeFiltro('marca', e.target.value)}
                className="block w-full rounded-border border border-[rgba(212,120,138,0.3)] px-3 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-kb-rose)] focus:border-transparent"
              >
                <option value="">Todas las marcas</option>
                {['all', ...new Set(products.map(p => p.brand).filter(Boolean))].map((marca) => (
                  <option key={marca} value={marca} selected={filters.marca === marca}>
                    {marca}
                  </option>
                ))}
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-kb-mauve)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 15l-3-3l-2-2l-5-5l5-5l2-2l3 3M6 12l3 3l3-3l-3-3l3-3M6 12l-3 3l3 3" />
              </svg>
            </div>
          </div>

          {/* Talla - solo de datos reales */}
          <div className="flex-1 sm:flex-1">
            <label className="sr-only">Talla</label>
            <div className="relative">
              <select
                onChange={(e) => handleChangeFiltro('genero', e.target.value)}
                className="block w-full rounded-border border border-[rgba(212,120,138,0.3)] px-3 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-kb-rose)] focus:border-transparent"
              >
                <option value="">Tallas</option>
                {['all', ...new Set(products.flatMap(p => p.sizes_available || []).filter(Boolean))].map((talla) => (
                  <option key={talla} value={talla} selected={filters.genero === talla}>
                    {talla}
                  </option>
                ))}
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-kb-mauve)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 15l-3-3l-2-2l-5-5l5-5l2-2l3 3M6 12l3 3l3-3l-3-3l3-3M6 12l-3 3l3 3" />
              </svg>
            </div>
          </div>

          {/* Precio - rangos */}
          <div className="flex-1 sm:flex-1">
            <label className="sr-only">Precio</label>
            <div className="relative">
              <select
                onChange={(e) => handleChangeFiltro('precio', e.target.value)}
                className="block w-full rounded-border border border-[rgba(212,120,138,0.3)] px-3 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-kb-rose)] focus:border-transparent"
              >
                <option value="">Precio</option>
                <option value="0-50">Hasta S/ 50</option>
                <option value="50-100">S/ 50 - S/ 100</option>
                <option value="100-200">S/ 100 - S/ 200</option>
                <option value="200+">S/ 200+</option>
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-kb-mauve)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 15l-3-3l-2-2l-5-5l5-5l2-2l3 3M6 12l3 3l3-3l-3-3l3-3M6 12l-3 3l3 3" />
              </svg>
            </div>
          </div>

          {/* Origen */}
          <div className="flex-1 sm:flex-1">
            <label className="sr-only">Origen</label>
            <div className="relative">
              <select
                onChange={(e) => handleChangeFiltro('origen', e.target.value)}
                className="block w-full rounded-border border border-[rgba(212,120,138,0.3)] px-3 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-kb-rose)] focus:border-transparent"
              >
                <option value="">Todo el origen</option>
                <option value="importado" selected={filters.origen === 'importado'}>Importado</option>
                <option value="nacional" selected={filters.origen === 'nacional'}>Nacional</option>
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-kb-mauve)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 15l-3-3l-2-2l-5-5l5-5l2-2l3 3M6 12l3 3l3-3l-3-3l3-3M6 12l-3 3l3 3" />
              </svg>
            </div>
          </div>

          {/* Ordenar */}
          <div className="flex-1 sm:flex-1 justify-end">
            <label className="sr-only">Ordenar</label>
            <div className="relative">
              <select
                onChange={(e) => handleChangeFiltro('orden', e.target.value)}
                className="block w-full rounded-border border border-[rgba(212,120,138,0.3)] px-3 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-kb-rose)] focus:border-transparent"
              >
                <option value="created_at-desc">Ordenar por: Más recientes</option>
                <option value="price_asc">Menor precio primero</option>
                <option value="price_desc">Mayor precio primero</option>
                <option value="name_asc">A-Z</option>
                <option value="name_desc">Z-A</option>
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-kb-mauve)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 15l-3-3l-2-2l-5-5l5-5l2-2l3 3M6 12l3 3l3-3l-3-3l3-3M6 12l-3 3l3 3" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* --- 4. Línea "Resultados (N)" y chips de filtros activos --- */}
      <div className="py-3 px-6 bg-white border-b border-[rgba(212,120,138,0.1)]">
        <div className="flex flex-wrap gap-2">
          {/* Chip de resultado */}
          <div className="inline-flex items-center rounded-full bg-[var(--color-kb-rose)] px-3 py-1.5 text-sm font-medium text-white">
            <span>{totalProductos} {totalProductos === 1 ? 'producto' : 'productos'} encontrados</span>
            <button
              onClick={() => {
                // Limpiar todos los filtros
                actualizarFiltros({
                  categoria: '', marca: '', genero: '',
                  precioMin: '', precioMax: '', origen: '',
                  busqueda: '', orden: 'created_at-desc'
                })
              }}
              className="ml-2 hover:opacity-90 transition-opacity"
              aria-label="Limpiar filtros"
            >
              ×
            </button>
          </div>

          {/* Chips de filtros activos (solo si hay) */}
          {[filters.categoria && { label: filters.categoria, name: 'categoria' },
          filters.marca && { label: filters.marca, name: 'marca' },
          filters.origen && { label: filters.origen === 'importado' ? 'EE.UU.' : 'Nacional', name: 'origen' }
          ].filter(Boolean).map((chip, i) => (
            <div key={i} className="inline-flex items-center rounded-full bg-[var(--color-kb-rose-mist)] px-3 py-1.5 text-xs font-medium text-[var(--color-kb-rose)] mr-2">
              <span>{chip.label}</span>
              <button
                onClick={() => actualizarFiltros({ [chip.name]: '' })}
                className="ml-1 text-[0.65rem] hover:opacity-80 transition-opacity"
                aria-label={`Quitar filtro de ${chip.name}`}
              >
                ×
              </button>
            </div>
          ))}

          {/* Ordenar en móvil */}
          <div className="inline-flex items-center rounded-full bg-[var(--color-kb-rose)] px-3 py-1.5 text-sm font-medium text-white ml-auto">
            <span>Orden: {filters.orden.replace('created_at-', '')}</span>
          </div>
        </div>
      </div>

      {/* --- 5. Grilla: 2 cols móvil, 3 tablet, 4 escritorio, gap pequeño --- */}
      <div className="py-6 px-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-[#E8D5B7] border-t-[#C9607F] rounded-full animate-spin mx-auto" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 text-mauve">
            <p className="font-light tracking-widest">No hay productos con estos filtros</p>
            <p className="mt-2 text-sm">Prueba ajustando los filtros arriba</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
            {products.map((product) => (
              <ProductCardCompacto key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

      {/* --- 6. Paginación: botón "Ver más" (24 por carga) --- */}
      {totalPages > 1 && totalProductos > 0 && (
        <div className="py-8 px-6 bg-white border-t border-[rgba(212,120,138,0.1)]">
          <div className="flex justify-center gap-4">
            <button
              onClick={() => irAPagina(filters.pagina + 1)}
              className="px-6 py-3 rounded-sm text-sm font-medium uppercase tracking-widest transition-all hover:-translate-y-0.5"
              style={{ background: p.roseDeep, color: '#FFFFFF', fontFamily: 'var(--font-sans)' }}
            >
              Ver más productos
            </button>
            <span className="text-mauve text-sm">
              {totalProductos} productos en total
            </span>
          </div>
        </div>
      )}

      <WhatsAppButton phoneNumber={WHATSAPP_PHONE} />
    </div>
  )
}

// Componente de tarjeta compacto y unificado
const ProductCardCompacto = ({ product }) => {
  const imageUrl = product.images_urls && product.images_urls.length > 0
    ? product.images_urls[0]
    : product.image_url || ''

  const hasDiscount = product.discount_percent > 0
  const finalPrice = hasDiscount ? product.price_final : product.price_original
  const isNew = product.is_new === true

  return (
    <div className="group aspect-[4/5] bg-white rounded-sm overflow-hidden border border-[rgba(212,120,138,0.08)] transition-all duration-300 hover:shadow-sm hover:-translate-y-1">
      {/* Imagen con hover para segunda imagen */}
      <div className="relative">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Segunda imagen al pasar el mouse (solo si tiene images_urls) */}
        {product.images_urls && product.images_urls.length > 1 && (
          <div
            className="absolute inset-0 group-hover:opacity-100 transition-opacity"
            style={{ background: `url(${product.images_urls[1]}) center/cover` }}
          />
        )}

        {/* Insignias sobre la imagen */}
        <div className="absolute top-2 left-2 flex gap-1">
          {isNew && (
            <span className="badge-new text-[0.5rem] px-2 py-0.5 rounded">NUEVO</span>
          )}
          {hasDiscount && (
            <span className="text-[0.5rem] px-2 py-0.5 rounded" style={{ background: p.roseRed, color: '#FFFFFF' }}>
              -{product.discount_percent}%
            </span>
          )}
        </div>

        {/* Etiqueta de origen */}
        {product.origin && (
          <div className="absolute top-2 right-2 px-2 py-0.5 rounded text-[0.5rem] font-medium">
            {product.origin === 'importado' ? 'Importado' : 'Nacional'}
          </div>
        )}
      </div>

      {/* Info debajo de la imagen */}
      <div className="p-3">
        <p className="text-caption text-[0.55rem] uppercase tracking-wider text-[var(--color-kb-mauve)] mb-1">
          {product.brand || product.category || ''}
        </p>
        <h3 className="line-clamp-2 text-[0.7rem] font-medium text-[var(--color-kb-charcoal)] mb-1">
          {product.name}
        </h3>

        {/* Precio */}
        <div className="flex items-baseline gap-1 mb-2">
          <span className="font-medium text-[0.8rem] text-[var(--color-kb-charcoal)]">
            S/ {finalPrice.toFixed(2)}
          </span>
          {hasDiscount && (
            <span className="line-through text-[0.55rem] text-[var(--color-kb-mauve)] opacity-60">
              S/ {product.price_original?.toFixed(2)}
            </span>
          )}
          {hasDiscount && (
            <span className="badge-sale text-[0.45rem] ml-1">-{product.discount_percent}%</span>
          )}
        </div>
        <span className="text-caption text-[0.5rem] text-[var(--color-kb-mauve)] ml-1">
          {product.color ? `Color: ${product.color}` : ''}
        </span>
      </div>

      {/* Botones de acción */}
      <div className="p-3 border-t border-[rgba(212,120,138,0.08)] flex justify-between items-center">
        <button
          onClick={() => navigate(`/producto/${product.id}`)}
          className="text-[0.6rem] text-[var(--color-kb-rose)] underline transition-colors hover:underline"
        >
          Ver detalles
        </button>
        <button
          onClick={() => {
            const msg = `Hola, me interesa el producto "${product.name}" (${product.sku || 'sin código'}) que vi en el catálogo. ¿Está disponible?`
            window.open(`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(msg)}`, '_blank')
          }}
          className="text-[0.6rem] text-[var(--color-kb-gold)] underline transition-colors hover:underline"
        >
          Consultar por WhatsApp
        </button>
      </div>
    </div>
  )
}

// Esconder barra de scroll personalizada
const styles = document.createElement('style')
style.innerHTML = `
  .scrollbar-hide::-webkit-scrollbar { display: none; }
  .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
`
document.head.appendChild(styles)

export default CatalogoPage