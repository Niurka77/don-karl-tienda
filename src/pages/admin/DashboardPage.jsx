import { useState, useEffect, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAdminNotifications } from '../../hooks/useAdminNotifications'

// ---------------------------------------------------------------------------
// Tipos / constantes
// ---------------------------------------------------------------------------

const URGENCY_LEVELS = {
  CRITICAL: { label: 'Crítico',  threshold: 60 },
  HIGH:     { label: 'Alto',     threshold: 30 },
  MEDIUM:   { label: 'Medio',    threshold: 15 },
  LOW:      { label: 'Bajo',     threshold: 0  },
}

const DAY_FILTER_OPTIONS = [
  { value: 15, label: '15 días' },
  { value: 30, label: '30 días' },
  { value: 60, label: '60 días' },
]

const MAX_DISCOUNT_PERCENT = 50
const DISCOUNT_HARD_CAP   = 99

// ---------------------------------------------------------------------------
// Utilidades puras (sin efectos secundarios, fácilmente testeables)
// ---------------------------------------------------------------------------

const formatCurrency = (amount) =>
  new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
  }).format(amount ?? 0)

const getDaysStagnant = (product) => {
  const referenceDate = product.last_sale_date ?? product.created_at
  return Math.floor((Date.now() - new Date(referenceDate).getTime()) / 86_400_000)
}

const getUrgencyLevel = (days) => {
  if (days > URGENCY_LEVELS.CRITICAL.threshold) return 'CRITICAL'
  if (days > URGENCY_LEVELS.HIGH.threshold)     return 'HIGH'
  if (days > URGENCY_LEVELS.MEDIUM.threshold)   return 'MEDIUM'
  return 'LOW'
}

const getRecommendedDiscount = (product) => {
  const days           = getDaysStagnant(product)
  const currentDiscount = product.discount_percent ?? 0
  if (days > 60) return Math.min(currentDiscount + 30, MAX_DISCOUNT_PERCENT)
  if (days > 30) return Math.min(currentDiscount + 20, MAX_DISCOUNT_PERCENT)
  if (days > 15) return Math.min(currentDiscount + 10, MAX_DISCOUNT_PERCENT)
  return Math.min(currentDiscount + 5, MAX_DISCOUNT_PERCENT)
}

const clampDiscount = (raw) => {
  const parsed = parseInt(raw, 10)
  if (isNaN(parsed)) return 0
  return Math.min(DISCOUNT_HARD_CAP, Math.max(0, parsed))
}

const buildInitialDiscountMap = (products) =>
  Object.fromEntries(products.map((p) => [p.id, getRecommendedDiscount(p)]))

const exportStatsToCSV = (stats) => {
  const rows = [
    ['ESTADÍSTICAS DE VENTAS'],
    ['Generado el:', new Date().toLocaleString('es-PE')],
    [],
    ['MÉTRICA', 'VALOR'],
    ['Total Productos',    stats.totalProducts],
    ['Total Pedidos',      stats.totalOrders],
    ['Productos Agotados', stats.outOfStockProducts],
    ['Pedidos Pendientes', stats.pendingOrders],
    ['Ingresos Semana',   formatCurrency(stats.weekRevenue)],
    ['Ingresos Mes',      formatCurrency(stats.monthRevenue)],
  ]
  const csv  = rows.map((r) => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href     = url
  link.download = `estadisticas_${new Date().toISOString().split('T')[0]}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

// ---------------------------------------------------------------------------
// Sub-componentes de presentación
// ---------------------------------------------------------------------------

const UrgencyBadge = ({ days }) => {
  const level = getUrgencyLevel(days)

  const styles = {
    CRITICAL: 'bg-[#8A2A3D]/10 text-[#8A2A3D] border-[#8A2A3D]/20',
    HIGH:     'bg-[#C9A84C]/10 text-[#8A6520] border-[#C9A84C]/20',
    MEDIUM:   'bg-[#D4788A]/10 text-[#B85268] border-[#D4788A]/20',
    LOW:      'bg-[#9A7480]/10 text-[#6B4F5B] border-[#9A7480]/20',
  }

  const indicators = {
    CRITICAL: 'bg-[#8A2A3D]',
    HIGH:     'bg-[#C9A84C]',
    MEDIUM:   'bg-[#D4788A]',
    LOW:      'bg-[#9A7480]',
  }

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border font-['DM_Sans'] ${styles[level]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${indicators[level]}`} />
      {URGENCY_LEVELS[level].label} · {days} días
    </span>
  )
}

const StatCard = ({ title, value, accent, linkTo }) => (
  <Link
    to={linkTo}
    className="group relative bg-[#FFF8F5] rounded-sm p-6 border border-[rgba(212,120,138,0.12)] shadow-[0_1px_4px_rgba(26,17,24,0.04)] hover:shadow-[0_4px_20px_rgba(212,120,138,0.12)] hover:border-[rgba(212,120,138,0.3)] transition-all duration-300 overflow-hidden"
  >
    <div
      className="absolute top-0 left-0 w-full h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      style={{ background: 'linear-gradient(90deg, #D4788A, #B85268)' }}
    />
    <p className="text-[10px] font-['DM_Sans'] uppercase tracking-[0.12em] text-[#9A7480] mb-3">
      {title}
    </p>
    <p className={`font-['Cormorant_Garamond'] text-3xl font-light tracking-tight ${accent ? 'text-[#B85268]' : 'text-[#1A1118]'}`}>
      {value}
    </p>
  </Link>
)

const DashboardSkeleton = () => (
  <div className="space-y-8 animate-pulse">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-28 bg-[rgba(212,120,138,0.06)] rounded-sm border border-[rgba(212,120,138,0.08)]" />
      ))}
    </div>
    <div className="h-64 bg-[rgba(212,120,138,0.06)] rounded-sm border border-[rgba(212,120,138,0.08)]" />
  </div>
)

const ErrorBanner = ({ message, onRetry }) => (
  <div className="flex items-center justify-between p-4 bg-[#8A2A3D]/5 border border-[#8A2A3D]/20 rounded-sm mb-6">
    <p className="text-sm text-[#8A2A3D] font-['DM_Sans']">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="text-xs font-medium text-[#8A2A3D] underline underline-offset-2 hover:no-underline font-['DM_Sans']"
      >
        Reintentar
      </button>
    )}
  </div>
)

const SectionHeader = ({ title, subtitle, badge }) => (
  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
    <div>
      <div className="w-5 h-px bg-[#D4788A] mb-3" />
      <h2 className="font-['Cormorant_Garamond'] text-xl font-light text-[#1A1118]">{title}</h2>
      {subtitle && (
        <p className="text-xs text-[#9A7480] font-['DM_Sans'] mt-1">{subtitle}</p>
      )}
    </div>
    {badge}
  </div>
)

const Spinner = ({ size = 'md' }) => {
  const sizeClass = size === 'sm' ? 'w-3.5 h-3.5 border' : 'w-4 h-4 border-2'
  return (
    <span
      className={`${sizeClass} border-current border-t-transparent rounded-full animate-spin`}
      aria-hidden="true"
    />
  )
}

// ---------------------------------------------------------------------------
// Componente: tarjeta de producto estancado
// ---------------------------------------------------------------------------

const StagnantProductCard = ({ product, discountValue, onDiscountChange, onApply, isApplying }) => {
  const days           = getDaysStagnant(product)
  const recommended    = getRecommendedDiscount(product)
  const finalPrice     = product.price_original * (1 - discountValue / 100)
  const originalPrice  = product.price_original * (1 - (product.discount_percent ?? 0) / 100)
  const saving         = originalPrice - finalPrice

  const urgencyRationale = {
    CRITICAL: 'Sin movimiento prolongado. Descuento agresivo recomendado para recuperar inversión.',
    HIGH:     'Baja rotación. Un descuento moderado puede reactivar el interés.',
    MEDIUM:   'Estancamiento reciente. Ajuste conservador como primer paso.',
    LOW:      'Pocas ventas. Un descuento pequeño puede impulsar la visibilidad.',
  }

  const level = getUrgencyLevel(days)

  return (
    <article className="p-5 bg-white rounded-sm border border-[rgba(212,120,138,0.12)] shadow-[0_1px_4px_rgba(26,17,24,0.03)]">
      <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-4">
        <img
          src={product.image_url ?? 'https://placehold.co/64x64/F2C4CE/9A7480?text=KB'}
          alt={product.name}
          className="w-16 h-16 rounded-sm object-cover bg-[#FDF0F3] flex-shrink-0"
          loading="lazy"
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-[#1A1118] font-['DM_Sans'] truncate">{product.name}</h3>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
            <span className="text-xs text-[#9A7480] font-['DM_Sans']">
              Stock: <strong className="text-[#1A1118]">{product.stock}</strong>
            </span>
            <span className="text-xs text-[#9A7480] font-['DM_Sans']">
              Precio: <strong className="text-[#1A1118]">{formatCurrency(product.price_original)}</strong>
            </span>
            {(product.discount_percent ?? 0) > 0 && (
              <span className="text-xs text-[#B85268] font-medium font-['DM_Sans']">
                -{product.discount_percent}% activo
              </span>
            )}
          </div>
          <div className="mt-2">
            <UrgencyBadge days={days} />
          </div>
        </div>
      </div>

      <div className="bg-[#FDF0F3] rounded-sm p-4 mb-4 border border-[rgba(212,120,138,0.15)]">
        <p className="text-xs font-semibold text-[#1A1118] font-['DM_Sans'] mb-1">
          Recomendación: <span className="text-[#B85268]">-{recommended}%</span>
        </p>
        <p className="text-xs text-[#9A7480] font-['DM_Sans'] leading-relaxed">
          {urgencyRationale[level]}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-end gap-4">
        <div className="flex-1">
          <label className="block text-xs font-medium text-[#1A1118] font-['DM_Sans'] mb-1.5">
            Descuento personalizado
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              max={DISCOUNT_HARD_CAP}
              value={discountValue}
              onChange={(e) => onDiscountChange(product.id, e.target.value)}
              className="w-24 px-3 py-2 border border-[rgba(212,120,138,0.25)] rounded-sm text-sm text-[#1A1118] bg-white focus:outline-none focus:ring-1 focus:ring-[#D4788A] focus:border-[#D4788A] font-['DM_Sans']"
            />
            <span className="text-sm text-[#9A7480] font-['DM_Sans']">%</span>
          </div>
        </div>

        <div className="bg-[#FFF8F5] rounded-sm p-3 border border-[rgba(212,120,138,0.12)] min-w-[160px]">
          <p className="text-[10px] text-[#9A7480] font-['DM_Sans'] uppercase tracking-wide mb-1">
            Precio final
          </p>
          <div className="flex items-baseline gap-2">
            <span className="font-['Cormorant_Garamond'] text-xl font-light text-[#1A1118]">
              {formatCurrency(finalPrice)}
            </span>
            {discountValue > 0 && (
              <span className="text-xs text-[#9A7480] line-through font-['DM_Sans']">
                {formatCurrency(product.price_original)}
              </span>
            )}
          </div>
          {saving > 0 && (
            <p className="text-xs text-[#B85268] font-medium mt-0.5 font-['DM_Sans']">
              Ahorro {formatCurrency(saving)}
            </p>
          )}
        </div>

        <button
          onClick={() => onApply(product, discountValue)}
          disabled={isApplying}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#1A1118] text-[#FFF8F5] rounded-sm text-sm font-semibold font-['DM_Sans'] hover:bg-[#2D2030] disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
        >
          {isApplying ? (
            <>
              <Spinner size="sm" />
              Aplicando
            </>
          ) : (
            'Aplicar descuento'
          )}
        </button>
      </div>
    </article>
  )
}

// ---------------------------------------------------------------------------
// Componente: ajuste reciente
// ---------------------------------------------------------------------------

const RecentAdjustmentCard = ({ product, onReadjust, onConfirm }) => {
  const elapsedMinutes = Math.floor(
    (Date.now() - new Date(product.appliedAt).getTime()) / 60_000
  )
  const timeLabel = elapsedMinutes < 1 ? 'hace un momento' : `hace ${elapsedMinutes} min`

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white rounded-sm border border-[rgba(212,120,138,0.12)]">
      <div className="flex items-center gap-3">
        <img
          src={product.image_url ?? 'https://placehold.co/48x48/F2C4CE/9A7480?text=KB'}
          alt={product.name}
          className="w-11 h-11 rounded-sm object-cover bg-[#FDF0F3] flex-shrink-0"
          loading="lazy"
        />
        <div>
          <p className="text-sm font-medium text-[#1A1118] font-['DM_Sans']">{product.name}</p>
          <div className="flex items-center gap-2 text-xs text-[#9A7480] mt-0.5 font-['DM_Sans']">
            <span className="line-through">-{product.previousDiscount}%</span>
            <span>→</span>
            <span className="text-[#B85268] font-semibold">-{product.discount_percent}%</span>
            <span>·</span>
            <span>{timeLabel}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-2 flex-shrink-0">
        <button
          onClick={() => onReadjust(product)}
          className="px-3 py-1.5 text-xs font-medium text-[#8A6520] bg-[#C9A84C]/10 border border-[#C9A84C]/20 rounded-sm hover:bg-[#C9A84C]/20 transition-colors font-['DM_Sans']"
        >
          Ajustar más
        </button>
        <button
          onClick={() => onConfirm(product.id)}
          className="px-3 py-1.5 text-xs font-medium text-[#FFF8F5] bg-[#1A1118] rounded-sm hover:bg-[#2D2030] transition-colors font-['DM_Sans']"
        >
          Listo
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Hook: carga de estadísticas del dashboard
// ---------------------------------------------------------------------------

const useDashboardStats = (onError) => {
  const [stats, setStats] = useState({
    totalProducts:      0,
    totalOrders:        0,
    outOfStockProducts: 0,
    pendingOrders:      0,
    weekRevenue:        0,
    monthRevenue:       0,
  })
  const [isLoading, setIsLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const oneWeekAgo  = new Date(Date.now() - 7  * 86_400_000).toISOString()
      const oneMonthAgo = new Date(Date.now() - 30 * 86_400_000).toISOString()

      const [
        { count: totalProducts },
        { count: outOfStockProducts },
        { count: totalOrders },
        { count: pendingOrders },
        { data: weekOrders },
        { data: monthOrders },
      ] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('*', { count: 'exact', head: true }).eq('stock', 0),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pendiente'),
        supabase.from('orders').select('total').gte('created_at', oneWeekAgo).eq('status', 'entregado'),
        supabase.from('orders').select('total').gte('created_at', oneMonthAgo).eq('status', 'entregado'),
      ])

      const sumRevenue = (orders) =>
        (orders ?? []).reduce((acc, o) => acc + Number(o.total ?? 0), 0)

      setStats({
        totalProducts:      totalProducts      ?? 0,
        totalOrders:        totalOrders        ?? 0,
        outOfStockProducts: outOfStockProducts ?? 0,
        pendingOrders:      pendingOrders      ?? 0,
        weekRevenue:        sumRevenue(weekOrders),
        monthRevenue:       sumRevenue(monthOrders),
      })
    } catch {
      onError()
    } finally {
      setIsLoading(false)
    }
  }, [onError])

  useEffect(() => {
    load()

    const productChannel = supabase
      .channel('dashboard-products')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, load)
      .subscribe()

    const orderChannel = supabase
      .channel('dashboard-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, load)
      .subscribe()

    return () => {
      supabase.removeChannel(productChannel)
      supabase.removeChannel(orderChannel)
    }
  }, [load])

  return { stats, isLoading, reload: load }
}

// ---------------------------------------------------------------------------
// Hook: productos estancados + descuentos
// ---------------------------------------------------------------------------

const useStagnantProducts = (dayThreshold) => {
  const [stagnantProducts, setStagnantProducts] = useState([])
  const [discountMap, setDiscountMap]             = useState({})
  const [applyingId, setApplyingId]               = useState(null)
  const [recentAdjustments, setRecentAdjustments] = useState([])

  const load = useCallback(async () => {
    const cutoff = new Date(Date.now() - dayThreshold * 86_400_000).toISOString()

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .gt('stock', 0)
      .or(`and(last_sale_date.is.null,created_at.lt.${cutoff}),last_sale_date.lt.${cutoff}`)
      .order('created_at', { ascending: true })
      .limit(20)

    if (error || !data) return
    setStagnantProducts(data)
    setDiscountMap(buildInitialDiscountMap(data))
  }, [dayThreshold])

  useEffect(() => { load() }, [load])

  const updateDiscount = useCallback((productId, rawValue) => {
    setDiscountMap((prev) => ({ ...prev, [productId]: clampDiscount(rawValue) }))
  }, [])

  const applyDiscount = useCallback(async (product, rawValue) => {
    const newDiscount = clampDiscount(rawValue)

    setApplyingId(product.id)
    try {
      const { error } = await supabase
        .from('products')
        .update({ discount_percent: newDiscount, is_new: false })
        .eq('id', product.id)

      if (error) throw error

      const adjusted = {
        ...product,
        discount_percent:  newDiscount,
        is_new:            false,
        appliedAt:         new Date().toISOString(),
        previousDiscount:  product.discount_percent ?? 0,
      }

      setStagnantProducts((prev) => prev.filter((p) => p.id !== product.id))
      setRecentAdjustments((prev) => [adjusted, ...prev])

      return { success: true, product: adjusted }
    } catch {
      return { success: false }
    } finally {
      setApplyingId(null)
    }
  }, [])

  const readjustProduct = useCallback((adjustedProduct) => {
    const restored = { ...adjustedProduct, discount_percent: adjustedProduct.previousDiscount }
    setStagnantProducts((prev) => [restored, ...prev])
    setDiscountMap((prev) => ({ ...prev, [adjustedProduct.id]: adjustedProduct.discount_percent }))
    setRecentAdjustments((prev) => prev.filter((p) => p.id !== adjustedProduct.id))
  }, [])

  const confirmAdjustment = useCallback((productId) => {
    setRecentAdjustments((prev) => prev.filter((p) => p.id !== productId))
  }, [])

  return {
    stagnantProducts,
    discountMap,
    applyingId,
    recentAdjustments,
    updateDiscount,
    applyDiscount,
    readjustProduct,
    confirmAdjustment,
    reload: load,
  }
}

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------

const DashboardPage = () => {
  const [hasError, setHasError]           = useState(false)
  const [searchQuery, setSearchQuery]     = useState('')
  const [dayThreshold, setDayThreshold]   = useState(15)

  const { agregarToast, ToastContainer } = useAdminNotifications()

  const onStatsError = useCallback(() => {
    setHasError(true)
    agregarToast('No se pudieron cargar las estadísticas', 'error')
  }, [agregarToast])

  const { stats, isLoading, reload: reloadStats } = useDashboardStats(onStatsError)

  const {
    stagnantProducts,
    discountMap,
    applyingId,
    recentAdjustments,
    updateDiscount,
    applyDiscount,
    readjustProduct,
    confirmAdjustment,
  } = useStagnantProducts(dayThreshold)

  const handleDayThresholdChange = useCallback((e) => {
    setDayThreshold(Number(e.target.value))
  }, [])

  const handleApplyDiscount = useCallback(async (product, discountValue) => {
    const numericDiscount = clampDiscount(discountValue)

    if (numericDiscount === (product.discount_percent ?? 0)) {
      agregarToast('Este producto ya tiene ese descuento', 'info')
      return
    }

    const result = await applyDiscount(product, numericDiscount)

    if (result.success) {
      const previousPrice = product.price_original * (1 - (product.discount_percent ?? 0) / 100)
      const newPrice      = product.price_original * (1 - numericDiscount / 100)
      const saving        = formatCurrency(previousPrice - newPrice)
      agregarToast(
        `${product.name}: ${product.discount_percent ?? 0}% → ${numericDiscount}% (${saving})`,
        'success'
      )
    } else {
      agregarToast('No se pudo aplicar el descuento', 'error')
    }
  }, [applyDiscount, agregarToast])

  const handleExportCSV = useCallback(() => {
    exportStatsToCSV(stats)
    agregarToast('Estadísticas exportadas', 'success')
  }, [stats, agregarToast])

  const filteredStagnantProducts = useMemo(() =>
    stagnantProducts.filter((p) => {
      const term = searchQuery.toLowerCase()
      return (
        p.name?.toLowerCase().includes(term) ||
        p.sku?.toLowerCase().includes(term)
      )
    }),
    [stagnantProducts, searchQuery]
  )

  const statCards = useMemo(() => [
    {
      title:  'Total productos',
      value:  stats.totalProducts,
      linkTo: '/admin/productos',
      accent: false,
    },
    {
      title:  'Pedidos totales',
      value:  stats.totalOrders,
      linkTo: '/admin/pedidos',
      accent: false,
    },
    {
      title:  'Pedidos pendientes',
      value:  stats.pendingOrders,
      linkTo: '/admin/pedidos',
      accent: stats.pendingOrders > 0,
    },
    {
      title:  'Productos agotados',
      value:  stats.outOfStockProducts,
      linkTo: '/admin/productos',
      accent: stats.outOfStockProducts > 0,
    },
    {
      title:  'Ingresos semana',
      value:  formatCurrency(stats.weekRevenue),
      linkTo: '/admin/pedidos',
      accent: false,
    },
    {
      title:  'Ingresos mes',
      value:  formatCurrency(stats.monthRevenue),
      linkTo: '/admin/pedidos',
      accent: false,
    },
  ], [stats])

  return (
    <div className="min-h-screen bg-[#FFF8F5] p-4 md:p-8">
      <ToastContainer />

      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div>
          <p className="text-[10px] font-['DM_Sans'] uppercase tracking-[0.15em] text-[#9A7480] mb-2">
            KB Dresses & More
          </p>
          <h1 className="font-['Cormorant_Garamond'] text-4xl font-light tracking-tight text-[#1A1118]">
            Dashboard
          </h1>
          <p className="text-sm text-[#9A7480] font-['DM_Sans'] mt-1">
            Resumen operativo de tu tienda
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 border border-[rgba(212,120,138,0.25)] text-[#9A7480] rounded-sm text-sm font-['DM_Sans'] hover:bg-[#FDF0F3] hover:border-[rgba(212,120,138,0.4)] transition-all"
          >
            Exportar CSV
          </button>
        </div>
      </header>

      {hasError && (
        <ErrorBanner
          message="No se pudieron cargar las estadísticas."
          onRetry={() => { setHasError(false); reloadStats() }}
        />
      )}

      {isLoading ? (
        <DashboardSkeleton />
      ) : (
        <div className="space-y-8">
          {/* Stats grid */}
          <section>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {statCards.map((card) => (
                <StatCard key={card.title} {...card} />
              ))}
            </div>
          </section>

          {/* Ajustes recientes */}
          {recentAdjustments.length > 0 && (
            <section className="bg-white rounded-sm border border-[rgba(212,120,138,0.12)] shadow-[0_1px_4px_rgba(26,17,24,0.03)] p-6">
              <SectionHeader
                title="Descuentos de esta sesión"
                subtitle="Productos ajustados recientemente"
                badge={
                  <span className="text-xs font-medium text-[#B85268] bg-[#D4788A]/10 border border-[#D4788A]/20 px-2.5 py-1 rounded-full font-['DM_Sans']">
                    {recentAdjustments.length} ajuste{recentAdjustments.length !== 1 ? 's' : ''}
                  </span>
                }
              />
              <div className="space-y-3">
                {recentAdjustments.map((product) => (
                  <RecentAdjustmentCard
                    key={product.id}
                    product={product}
                    onReadjust={readjustProduct}
                    onConfirm={confirmAdjustment}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Productos estancados */}
          {filteredStagnantProducts.length > 0 && (
            <section className="bg-white rounded-sm border border-[rgba(212,120,138,0.12)] shadow-[0_1px_4px_rgba(26,17,24,0.03)] p-6">
              <SectionHeader
                title="Baja rotación"
                subtitle={`Sin ventas hace más de ${dayThreshold} días`}
                badge={
                  <div className="flex items-center gap-2">
                    <select
                      value={dayThreshold}
                      onChange={handleDayThresholdChange}
                      className="px-3 py-1.5 border border-[rgba(212,120,138,0.2)] rounded-sm text-xs font-['DM_Sans'] text-[#1A1118] bg-white focus:outline-none focus:ring-1 focus:ring-[#D4788A]"
                    >
                      {DAY_FILTER_OPTIONS.map(({ value, label }) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                    <input
                      type="search"
                      placeholder="Buscar producto..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="px-3 py-1.5 border border-[rgba(212,120,138,0.2)] rounded-sm text-xs font-['DM_Sans'] text-[#1A1118] bg-white placeholder:text-[#9A7480] focus:outline-none focus:ring-1 focus:ring-[#D4788A] w-40"
                    />
                  </div>
                }
              />

              <div className="space-y-4">
                {filteredStagnantProducts.slice(0, 5).map((product) => (
                  <StagnantProductCard
                    key={product.id}
                    product={product}
                    discountValue={discountMap[product.id] ?? 0}
                    onDiscountChange={updateDiscount}
                    onApply={handleApplyDiscount}
                    isApplying={applyingId === product.id}
                  />
                ))}
              </div>

              {filteredStagnantProducts.length > 5 && (
                <p className="text-xs text-[#9A7480] font-['DM_Sans'] text-center mt-5 pt-5 border-t border-[rgba(212,120,138,0.1)]">
                  Mostrando 5 de {filteredStagnantProducts.length} productos. Ajusta los filtros para ver más.
                </p>
              )}
            </section>
          )}

          {/* Acciones rápidas */}
          <section className="bg-white rounded-sm border border-[rgba(212,120,138,0.12)] shadow-[0_1px_4px_rgba(26,17,24,0.03)] p-6">
            <SectionHeader title="Acciones rápidas" />
            <div className="flex flex-wrap gap-3">
              <Link
                to="/admin/productos"
                className="px-4 py-2 bg-[#1A1118] text-[#FFF8F5] rounded-sm text-sm font-['DM_Sans'] font-medium hover:bg-[#2D2030] transition-colors"
              >
                Nuevo producto
              </Link>
              <Link
                to="/admin/pedidos"
                className="px-4 py-2 border border-[rgba(212,120,138,0.25)] text-[#9A7480] rounded-sm text-sm font-['DM_Sans'] font-medium hover:bg-[#FDF0F3] transition-colors"
              >
                Ver pedidos
              </Link>
              <Link
                to="/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 border border-[rgba(212,120,138,0.25)] text-[#9A7480] rounded-sm text-sm font-['DM_Sans'] font-medium hover:bg-[#FDF0F3] transition-colors"
              >
                Ver tienda
              </Link>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}

export default DashboardPage