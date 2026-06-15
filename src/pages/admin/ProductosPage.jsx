import { useState, useEffect, useMemo, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import ProductoForm from '../../components/admin/ProductoForm'
import { useAdminNotifications } from '../../hooks/useAdminNotifications'

// ─── Constants ────────────────────────────────────────────────────────────────

const PRODUCTS_PER_PAGE = 12

const CATEGORY_OPTIONS = [
  { value: 'vestidos', label: 'Vestidos' },
  { value: 'bolsos', label: 'Bolsos' },
  { value: 'zapatos', label: 'Zapatos' },
  { value: 'Billeteras', label: 'Billeteras' },
]

const STOCK_FILTER_OPTIONS = [
  { value: 'agotado', label: 'Agotado' },
  { value: 'critico', label: 'Crítico (1–5)' },
  { value: 'disponible', label: 'Disponible (+5)' },
]

const STOCK_THRESHOLDS = { critical: 5, empty: 0 }

// ─── Pure helpers ─────────────────────────────────────────────────────────────

const computeFinalPrice = (originalPrice, discountPercent) => {
  const price = parseFloat(originalPrice) || 0
  const discount = parseInt(discountPercent) || 0
  return discount > 0 ? price * (1 - discount / 100) : price
}

const resolveStockStatus = (stock) => {
  if (stock === STOCK_THRESHOLDS.empty) return 'empty'
  if (stock <= STOCK_THRESHOLDS.critical) return 'critical'
  return 'available'
}

const extractStoragePath = (imageUrl) => {
  const parts = imageUrl?.split('/productos/')
  return parts?.length > 1 ? parts[1] : null
}

const matchesSearch = (product, query) => {
  const normalized = query.toLowerCase()
  return (
    product.name?.toLowerCase().includes(normalized) ||
    product.sku?.toLowerCase().includes(normalized) ||
    product.brand?.toLowerCase().includes(normalized)
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const StockBadge = ({ stock }) => {
  const status = resolveStockStatus(stock)

  const variants = {
    empty: 'bg-[#8A2A3D]/8 text-[#8A2A3D] border border-[#8A2A3D]/20',
    critical: 'bg-[#C9A84C]/10 text-[#7A6020] border border-[#C9A84C]/25',
    available: 'bg-[#2D7A4F]/8 text-[#1A5C38] border border-[#2D7A4F]/20',
  }

  const labels = {
    empty: 'Agotado',
    critical: `Crítico · ${stock}`,
    available: `${stock} uds`,
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-1 text-[0.7rem] font-medium tracking-wide rounded-sm font-['DM_Sans'] ${variants[status]}`}>
      {labels[status]}
    </span>
  )
}

const PriceDisplay = ({ originalPrice, discountPercent }) => {
  const finalPrice = computeFinalPrice(originalPrice, discountPercent)
  const hasDiscount = discountPercent > 0

  if (!hasDiscount) {
    return (
      <span className="text-sm font-medium text-[#1A1118] font-['DM_Sans']">
        S/ {finalPrice.toFixed(2)}
      </span>
    )
  }

  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-[#9A7480] line-through font-['DM_Sans']">
        S/ {parseFloat(originalPrice).toFixed(2)}
      </span>
      <span className="text-sm font-semibold text-[#B85268] font-['DM_Sans']">
        S/ {finalPrice.toFixed(2)}
      </span>
      <span className="text-[0.6rem] font-medium bg-[#B85268]/10 text-[#B85268] px-1.5 py-0.5 rounded-sm self-start font-['DM_Sans'] tracking-wide">
        -{discountPercent}%
      </span>
    </div>
  )
}

const ProductThumbnail = ({ imageUrl, name }) => (
  <div className="w-11 h-11 rounded-sm overflow-hidden bg-[#FDF0F3] flex-shrink-0 border border-[rgba(212,120,138,0.12)]">
    <img
      src={imageUrl || 'https://placehold.co/44x44/FDF0F3/9A7480?text=·'}
      alt={name}
      className="w-full h-full object-cover"
      loading="lazy"
    />
  </div>
)

const TableHeaderCell = ({ children, align = 'left' }) => (
  <th
    className={`px-5 py-3.5 text-[0.6rem] tracking-widest uppercase font-['DM_Sans'] font-semibold text-[#9A7480] text-${align}`}
  >
    {children}
  </th>
)

const IconButton = ({ onClick, title, variant = 'default', children }) => {
  const variants = {
    default: 'text-[#9A7480] hover:text-[#1A1118] hover:bg-[#FDF0F3]',
    danger: 'text-[#B85268]/60 hover:text-[#8A2A3D] hover:bg-[#8A2A3D]/6',
  }

  return (
    <button
      onClick={onClick}
      title={title}
      className={`p-2 rounded-sm transition-all duration-150 ${variants[variant]}`}
    >
      {children}
    </button>
  )
}

const EditIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75"
      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
  </svg>
)

const TrashIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75"
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
)

const SearchIcon = () => (
  <svg className="w-4 h-4 text-[#9A7480]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75"
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
)

const SkeletonRow = () => (
  <tr className="border-b border-[rgba(212,120,138,0.08)]">
    {[44, 24, 20, 16, 12].map((width, i) => (
      <td key={i} className="px-5 py-4">
        <div className={`h-4 bg-[#FDF0F3] rounded-sm animate-pulse w-${width}`} />
      </td>
    ))}
  </tr>
)

const FilterSelect = ({ value, onChange, children, ariaLabel }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    aria-label={ariaLabel}
    className="w-full border border-[rgba(212,120,138,0.22)] rounded-sm px-3.5 py-2.5 text-sm font-['DM_Sans'] text-[#2D2030] focus:outline-none focus:ring-1 focus:ring-[#D4788A] bg-[#FFF8F5] appearance-none cursor-pointer transition-colors hover:border-[rgba(212,120,138,0.45)]"
  >
    {children}
  </select>
)

// ─── Deletion confirmation modal ──────────────────────────────────────────────

const DeleteConfirmationModal = ({ product, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1118]/60 backdrop-blur-sm">
    <div className="bg-[#FFF8F5] rounded-sm p-8 max-w-sm w-full mx-4 shadow-2xl border border-[rgba(212,120,138,0.15)]">
      <p className="font-['Cormorant_Garamond'] text-[0.6rem] tracking-widest uppercase text-[#B85268] mb-3">
        Acción irreversible
      </p>
      <h3 className="font-['Cormorant_Garamond'] text-2xl font-light text-[#1A1118] mb-3 leading-snug">
        Eliminar producto
      </h3>
      <p className="text-sm text-[#9A7480] font-['DM_Sans'] leading-relaxed mb-7">
        Estás a punto de eliminar{' '}
        <span className="text-[#1A1118] font-medium">{product?.name}</span>.
        Esta acción no se puede deshacer.
      </p>
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 border border-[rgba(212,120,138,0.3)] text-[#9A7480] rounded-sm hover:bg-[#FDF0F3] font-['DM_Sans'] text-sm transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 py-2.5 bg-[#8A2A3D] text-white rounded-sm hover:bg-[#6E1F30] font-['DM_Sans'] text-sm font-medium transition-colors"
        >
          Eliminar
        </button>
      </div>
    </div>
  </div>
)

// ─── Empty state ──────────────────────────────────────────────────────────────

const EmptyState = ({ hasFilters, onClearFilters, onCreateProduct }) => (
  <div className="flex flex-col items-center justify-center py-24 bg-white rounded-sm border border-[rgba(212,120,138,0.12)]">
    <div className="w-12 h-px bg-[#D4788A] mb-6" />
    <p className="font-['Cormorant_Garamond'] text-2xl font-light text-[#1A1118] mb-2">
      {hasFilters ? 'Sin resultados' : 'Sin productos'}
    </p>
    <p className="text-sm text-[#9A7480] font-['DM_Sans'] mb-6 text-center max-w-xs leading-relaxed">
      {hasFilters
        ? 'Ningún producto coincide con los filtros aplicados.'
        : 'Tu inventario está vacío. Agrega el primer producto para comenzar.'}
    </p>
    {hasFilters ? (
      <button
        onClick={onClearFilters}
        className="text-sm text-[#D4788A] hover:text-[#B85268] font-['DM_Sans'] font-medium underline underline-offset-4 transition-colors"
      >
        Limpiar filtros
      </button>
    ) : (
      <button
        onClick={onCreateProduct}
        className="px-5 py-2.5 bg-[#1A1118] text-white text-sm rounded-sm font-['DM_Sans'] font-medium tracking-wide hover:bg-[#2D2030] transition-colors"
      >
        Agregar producto
      </button>
    )}
  </div>
)

// ─── Pagination ───────────────────────────────────────────────────────────────

const Pagination = ({ currentPage, totalPages, totalItems, onPageChange }) => {
  const rangeStart = (currentPage - 1) * PRODUCTS_PER_PAGE + 1
  const rangeEnd = Math.min(currentPage * PRODUCTS_PER_PAGE, totalItems)

  const visiblePages = useMemo(() => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1)
    if (currentPage <= 3) return [1, 2, 3, 4, 5]
    if (currentPage >= totalPages - 2) return [totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
    return [currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2]
  }, [currentPage, totalPages])

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-5 px-1">
      <p className="text-xs text-[#9A7480] font-['DM_Sans'] tabular-nums">
        {rangeStart}–{rangeEnd} de {totalItems} productos
      </p>
      <div className="flex items-center gap-1.5">
        <button
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="px-3 py-2 border border-[rgba(212,120,138,0.25)] rounded-sm text-xs font-['DM_Sans'] text-[#9A7480] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#FDF0F3] transition-colors"
        >
          Anterior
        </button>
        <div className="flex gap-1">
          {visiblePages.map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`w-8 h-8 rounded-sm text-xs font-['DM_Sans'] transition-colors ${
                currentPage === page
                  ? 'bg-[#1A1118] text-white'
                  : 'text-[#9A7480] hover:bg-[#FDF0F3]'
              }`}
            >
              {page}
            </button>
          ))}
        </div>
        <button
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="px-3 py-2 border border-[rgba(212,120,138,0.25)] rounded-sm text-xs font-['DM_Sans'] text-[#9A7480] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#FDF0F3] transition-colors"
        >
          Siguiente
        </button>
      </div>
    </div>
  )
}

// ─── Inventory summary bar ────────────────────────────────────────────────────

const InventorySummary = ({ products }) => {
  const summary = useMemo(() => {
    const emptyCount = products.filter((p) => p.stock === 0).length
    const criticalCount = products.filter((p) => p.stock > 0 && p.stock <= STOCK_THRESHOLDS.critical).length
    const discountedCount = products.filter((p) => p.discount_percent > 0).length
    return { emptyCount, criticalCount, discountedCount }
  }, [products])

  if (products.length === 0) return null

  return (
    <div className="grid grid-cols-3 gap-3 mb-6">
      <div className="bg-white rounded-sm border border-[rgba(212,120,138,0.12)] px-4 py-3.5">
        <p className="text-[0.6rem] tracking-widest uppercase font-['DM_Sans'] text-[#9A7480] mb-1">Total</p>
        <p className="font-['Cormorant_Garamond'] text-2xl font-light text-[#1A1118]">{products.length}</p>
      </div>
      <div className={`bg-white rounded-sm border px-4 py-3.5 ${summary.emptyCount > 0 ? 'border-[#8A2A3D]/20' : 'border-[rgba(212,120,138,0.12)]'}`}>
        <p className="text-[0.6rem] tracking-widest uppercase font-['DM_Sans'] text-[#9A7480] mb-1">Agotados</p>
        <p className={`font-['Cormorant_Garamond'] text-2xl font-light ${summary.emptyCount > 0 ? 'text-[#8A2A3D]' : 'text-[#1A1118]'}`}>
          {summary.emptyCount}
        </p>
      </div>
      <div className={`bg-white rounded-sm border px-4 py-3.5 ${summary.criticalCount > 0 ? 'border-[#C9A84C]/25' : 'border-[rgba(212,120,138,0.12)]'}`}>
        <p className="text-[0.6rem] tracking-widest uppercase font-['DM_Sans'] text-[#9A7480] mb-1">Stock crítico</p>
        <p className={`font-['Cormorant_Garamond'] text-2xl font-light ${summary.criticalCount > 0 ? 'text-[#7A6020]' : 'text-[#1A1118]'}`}>
          {summary.criticalCount}
        </p>
      </div>
    </div>
  )
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

const useProductFilters = (products) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [stockFilter, setStockFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const hasActiveFilters = Boolean(searchQuery || categoryFilter || stockFilter)

  const filteredProducts = useMemo(() => {
    let result = products

    if (searchQuery) {
      result = result.filter((p) => matchesSearch(p, searchQuery))
    }

    if (categoryFilter) {
      result = result.filter((p) => p.category === categoryFilter)
    }

    if (stockFilter) {
      result = result.filter((p) => {
        if (stockFilter === 'agotado') return p.stock === 0
        if (stockFilter === 'critico') return p.stock > 0 && p.stock <= STOCK_THRESHOLDS.critical
        if (stockFilter === 'disponible') return p.stock > STOCK_THRESHOLDS.critical
        return true
      })
    }

    return result
  }, [products, searchQuery, categoryFilter, stockFilter])

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, categoryFilter, stockFilter])

  const clearFilters = useCallback(() => {
    setSearchQuery('')
    setCategoryFilter('')
    setStockFilter('')
  }, [])

  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE)

  const paginatedProducts = useMemo(
    () => filteredProducts.slice(
      (currentPage - 1) * PRODUCTS_PER_PAGE,
      currentPage * PRODUCTS_PER_PAGE
    ),
    [filteredProducts, currentPage]
  )

  return {
    searchQuery, setSearchQuery,
    categoryFilter, setCategoryFilter,
    stockFilter, setStockFilter,
    currentPage, setCurrentPage,
    filteredProducts,
    paginatedProducts,
    totalPages,
    hasActiveFilters,
    clearFilters,
  }
}

// ─── Main component ───────────────────────────────────────────────────────────

const ProductosPage = () => {
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [productToEdit, setProductToEdit] = useState(null)
  const [deletionModal, setDeletionModal] = useState({ open: false, product: null })

  const { agregarToast, ToastContainer } = useAdminNotifications()

  const {
    searchQuery, setSearchQuery,
    categoryFilter, setCategoryFilter,
    stockFilter, setStockFilter,
    currentPage, setCurrentPage,
    filteredProducts,
    paginatedProducts,
    totalPages,
    hasActiveFilters,
    clearFilters,
  } = useProductFilters(products)

  // ── Data fetching ──────────────────────────────────────────────────────────

  const fetchProducts = useCallback(async () => {
    setIsLoading(true)
    setLoadError(null)

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      setLoadError('No se pudieron cargar los productos.')
      agregarToast('Error al cargar el inventario', 'error')
    } else {
      setProducts(data || [])
    }

    setIsLoading(false)
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleOpenCreate = useCallback(() => {
    setProductToEdit(null)
    setShowForm(true)
  }, [])

  const handleOpenEdit = useCallback((product) => {
    setProductToEdit(product)
    setShowForm(true)
  }, [])

  const handleCloseForm = useCallback(() => {
    setShowForm(false)
    setProductToEdit(null)
  }, [])

  const handleProductSaved = useCallback((savedProduct) => {
    const isEdit = Boolean(productToEdit)

    setProducts((prev) =>
      isEdit
        ? prev.map((p) => (p.id === savedProduct.id ? savedProduct : p))
        : [savedProduct, ...prev]
    )

    handleCloseForm()
    agregarToast(isEdit ? 'Producto actualizado' : 'Producto creado', 'success')
  }, [productToEdit, handleCloseForm])

  const handleRequestDelete = useCallback((product) => {
    setDeletionModal({ open: true, product })
  }, [])

  const handleCancelDelete = useCallback(() => {
    setDeletionModal({ open: false, product: null })
  }, [])

  const handleConfirmDelete = useCallback(async () => {
    const { product } = deletionModal
    if (!product) return

    const storagePath = extractStoragePath(product.image_url)

    if (storagePath) {
      await supabase.storage.from('productos').remove([storagePath])
    }

    const { error } = await supabase.from('products').delete().eq('id', product.id)

    if (error) {
      agregarToast('Error al eliminar el producto', 'error')
    } else {
      setProducts((prev) => prev.filter((p) => p.id !== product.id))
      agregarToast('Producto eliminado', 'success')
    }

    handleCancelDelete()
  }, [deletionModal, handleCancelDelete])

  // ── Form view ──────────────────────────────────────────────────────────────

  if (showForm) {
    return (
      <div className="min-h-screen bg-[#FFF8F5] p-4 md:p-8">
        <button
          onClick={handleCloseForm}
          className="mb-8 flex items-center gap-2 text-[#9A7480] hover:text-[#1A1118] transition-colors text-sm font-['DM_Sans'] group"
        >
          <svg className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M15 19l-7-7 7-7" />
          </svg>
          Volver al inventario
        </button>
        <ProductoForm
          producto={productToEdit}
          onGuardar={handleProductSaved}
          onCancelar={handleCloseForm}
        />
      </div>
    )
  }

  // ── Main view ──────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#FFF8F5] p-4 md:p-8">
      <ToastContainer />

      {deletionModal.open && (
        <DeleteConfirmationModal
          product={deletionModal.product}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-[0.6rem] tracking-widest uppercase font-['DM_Sans'] text-[#9A7480] mb-1.5">
            KB Fashion · Admin
          </p>
          <h1 className="font-['Cormorant_Garamond'] text-4xl font-light text-[#1A1118] leading-none">
            Inventario
          </h1>
        </div>
        <button
          onClick={handleOpenCreate}
          className="self-start md:self-auto px-5 py-2.5 bg-[#1A1118] text-white rounded-sm font-['DM_Sans'] text-sm font-medium tracking-wide hover:bg-[#2D2030] transition-colors"
        >
          Nuevo producto
        </button>
      </div>

      {/* Error banner */}
      {loadError && (
        <div className="mb-6 p-4 bg-[#8A2A3D]/6 border border-[#8A2A3D]/20 rounded-sm flex items-center justify-between gap-4">
          <p className="text-sm text-[#8A2A3D] font-['DM_Sans']">{loadError}</p>
          <button
            onClick={fetchProducts}
            className="text-xs text-[#8A2A3D] underline underline-offset-4 font-['DM_Sans'] hover:opacity-70 flex-shrink-0"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Inventory summary */}
      {!isLoading && <InventorySummary products={products} />}

      {/* Filters */}
      <div className="bg-white rounded-sm border border-[rgba(212,120,138,0.12)] p-4 mb-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-2 relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
              <SearchIcon />
            </div>
            <input
              type="text"
              placeholder="Nombre, SKU o marca..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border border-[rgba(212,120,138,0.22)] rounded-sm pl-10 pr-4 py-2.5 text-sm font-['DM_Sans'] text-[#2D2030] placeholder:text-[#9A7480]/70 focus:outline-none focus:ring-1 focus:ring-[#D4788A] bg-[#FFF8F5] transition-colors hover:border-[rgba(212,120,138,0.45)]"
            />
          </div>

          <FilterSelect
            value={categoryFilter}
            onChange={setCategoryFilter}
            ariaLabel="Filtrar por categoría"
          >
            <option value="">Todas las categorías</option>
            {CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </FilterSelect>

          <FilterSelect
            value={stockFilter}
            onChange={setStockFilter}
            ariaLabel="Filtrar por stock"
          >
            <option value="">Todo el stock</option>
            {STOCK_FILTER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </FilterSelect>
        </div>

        {hasActiveFilters && (
          <div className="mt-3 pt-3 border-t border-[rgba(212,120,138,0.1)] flex items-center justify-between">
            <p className="text-xs text-[#9A7480] font-['DM_Sans']">
              {filteredProducts.length} resultado{filteredProducts.length !== 1 ? 's' : ''}
            </p>
            <button
              onClick={clearFilters}
              className="text-xs text-[#D4788A] hover:text-[#B85268] font-['DM_Sans'] underline underline-offset-4 transition-colors"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>

      {/* Table or states */}
      {isLoading ? (
        <div className="bg-white rounded-sm border border-[rgba(212,120,138,0.12)] overflow-hidden">
          <table className="w-full">
            <tbody>
              {Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)}
            </tbody>
          </table>
        </div>
      ) : filteredProducts.length === 0 ? (
        <EmptyState
          hasFilters={hasActiveFilters}
          onClearFilters={clearFilters}
          onCreateProduct={handleOpenCreate}
        />
      ) : (
        <>
          <div className="bg-white rounded-sm border border-[rgba(212,120,138,0.12)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#FDF0F3]/70 border-b border-[rgba(212,120,138,0.1)]">
                  <tr>
                    <TableHeaderCell>Producto</TableHeaderCell>
                    <TableHeaderCell>SKU</TableHeaderCell>
                    <TableHeaderCell>Precio</TableHeaderCell>
                    <TableHeaderCell>Stock</TableHeaderCell>
                    <TableHeaderCell align="right">Acciones</TableHeaderCell>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(212,120,138,0.07)]">
                  {paginatedProducts.map((product) => (
                    <tr
                      key={product.id}
                      className="hover:bg-[#FDF0F3]/40 transition-colors duration-100 group"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <ProductThumbnail imageUrl={product.image_url} name={product.name} />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-[#1A1118] font-['DM_Sans'] truncate max-w-[200px]">
                              {product.name}
                            </p>
                            <p className="text-xs text-[#9A7480] font-['DM_Sans'] mt-0.5">
                              {product.category}
                              {product.brand && <span className="opacity-60"> · {product.brand}</span>}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs font-mono text-[#9A7480] tracking-wide">
                          {product.sku || '—'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <PriceDisplay
                          originalPrice={product.price_original}
                          discountPercent={product.discount_percent}
                        />
                      </td>
                      <td className="px-5 py-3.5">
                        <StockBadge stock={product.stock} />
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <IconButton
                            onClick={() => handleOpenEdit(product)}
                            title="Editar producto"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            onClick={() => handleRequestDelete(product)}
                            title="Eliminar producto"
                            variant="danger"
                          >
                            <TrashIcon />
                          </IconButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredProducts.length}
              onPageChange={setCurrentPage}
            />
          )}
        </>
      )}
    </div>
  )
}

export default ProductosPage