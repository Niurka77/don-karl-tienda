import { useState, useEffect, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAdminNotifications } from '../../hooks/useAdminNotifications'
import VentaRapidaModal from '../../components/admin/VentaRapidaModal'

// ---------------------------------------------------------------------------
// Utilidades puras (sin efectos secundarios, fácilmente testeables)
// ---------------------------------------------------------------------------

const formatCurrency = (amount) =>
  new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
  }).format(amount ?? 0)

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

const StatCard = ({ title, value, accent, linkTo }) => (
  <Link
    to={linkTo}
    className="group relative bg-[#FFF8F5] rounded-sm p-6 border border-[rgba(212,120,138,0.12)] shadow-[0_1px_4px_rgba(26,17,24,0.04)] hover:shadow-[0_4px_20px_rgba(212,120,138,0.12)] hover:border-[rgba(212,120,138,0.3)] transition-all duration-300 overflow-hidden"
  >
    <div
      className="absolute top-0 left-0 w-full h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      style={{ background: 'linear-gradient(90deg, #D4788A, #B85268)' }}
    />
    <p className="text-[10px] font-sans uppercase tracking-[0.12em] text-[#9A7480] mb-3">
      {title}
    </p>
    <p className={`font-display text-3xl font-light tracking-tight ${accent ? 'text-[#B85268]' : 'text-[#1A1118]'}`}>
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
    <p className="text-sm text-[#8A2A3D] font-sans">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="text-xs font-medium text-[#8A2A3D] underline underline-offset-2 hover:no-underline font-sans"
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
      <h2 className="font-display text-xl font-light text-[#1A1118]">{title}</h2>
      {subtitle && (
        <p className="text-xs text-[#9A7480] font-sans mt-1">{subtitle}</p>
      )}
    </div>
    {badge}
  </div>
)

// ---------------------------------------------------------------------------
// Hook: carga de estadísticas del dashboard
// ---------------------------------------------------------------------------

const useDashboardStats = (onError) => {
  const [stats, setStats] = useState({
    totalProducts:      0,
    totalOrders:        0,
    outOfStockProducts: 0,
    lowStockProducts:   0,
    pendingOrders:      0,
    weekRevenue:        0,
    monthRevenue:       0,
    ordersToday:        0,
    confirmedOrders:    0,
    totalRevenue:       0,
  })
  const [isLoading, setIsLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const todayStart = new Date(); todayStart.setHours(0,0,0,0)
      const oneWeekAgo  = new Date(Date.now() - 7  * 86_400_000).toISOString()
      const oneMonthAgo = new Date(Date.now() - 30 * 86_400_000).toISOString()

      const [
        { count: totalProducts },
        { count: outOfStockProducts },
        { data: lowStockData },
        { count: totalOrders },
        { count: pendingOrders },
        { data: weekOrders },
        { data: monthOrders },
        { count: ordersToday },
        { count: confirmedOrders },
        { data: allConfirmed },
      ] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('*', { count: 'exact', head: true }).eq('stock', 0),
        supabase.from('products').select('id, name, sku, stock, category').gt('stock', 0).lte('stock', 5),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pendiente'),
        supabase.from('orders').select('total').gte('created_at', oneWeekAgo).eq('status', 'entregado'),
        supabase.from('orders').select('total').gte('created_at', oneMonthAgo).eq('status', 'entregado'),
        supabase.from('orders').select('*', { count: 'exact', head: true }).gte('created_at', todayStart.toISOString()),
        supabase.from('orders').select('*', { count: 'exact', head: true }).in('status', ['pagado', 'preparando', 'enviado']),
        supabase.from('orders').select('total').in('status', ['pagado', 'preparando', 'enviado', 'entregado']),
      ])

      const sumRevenue = (orders) =>
        (orders ?? []).reduce((acc, o) => acc + Number(o.total ?? 0), 0)

      setStats({
        totalProducts:      totalProducts      ?? 0,
        totalOrders:        totalOrders        ?? 0,
        outOfStockProducts: outOfStockProducts ?? 0,
        lowStockProducts:   lowStockData?.length || 0,
        lowStockItems:      lowStockData || [],
        pendingOrders:      pendingOrders      ?? 0,
        weekRevenue:        sumRevenue(weekOrders),
        monthRevenue:       sumRevenue(monthOrders),
        ordersToday:        ordersToday        ?? 0,
        confirmedOrders:    confirmedOrders    ?? 0,
        totalRevenue:       sumRevenue(allConfirmed),
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
// Componente principal
// ---------------------------------------------------------------------------

const DashboardPage = () => {
  const [hasError, setHasError]           = useState(false)
  const [ventaRapidaAbierto, setVentaRapidaAbierto] = useState(false)

  const { agregarToast, ToastContainer } = useAdminNotifications()

  const onStatsError = useCallback(() => {
    setHasError(true)
    agregarToast('No se pudieron cargar las estadísticas', 'error')
  }, [agregarToast])

  const { stats, isLoading, reload: reloadStats } = useDashboardStats(onStatsError)

  const handleExportCSV = useCallback(() => {
    exportStatsToCSV(stats)
    agregarToast('Estadísticas exportadas', 'success')
  }, [stats, agregarToast])

  const statCards = useMemo(() => [
    {
      title:  'Pedidos hoy',
      value:  stats.ordersToday,
      linkTo: '/admin/pedidos',
      accent: false,
    },
    {
      title:  'Ventas confirmadas',
      value:  stats.confirmedOrders,
      linkTo: '/admin/pedidos',
      accent: stats.confirmedOrders > 0,
    },
    {
      title:  'Pendientes',
      value:  stats.pendingOrders,
      linkTo: '/admin/pedidos',
      accent: stats.pendingOrders > 0,
    },
    {
      title:  'Total vendido',
      value:  formatCurrency(stats.totalRevenue),
      linkTo: '/admin/pedidos',
      accent: false,
    },
    {
      title:  'Total productos',
      value:  stats.totalProducts,
      linkTo: '/admin/productos',
      accent: false,
    },
    {
      title:  'Productos agotados',
      value:  stats.outOfStockProducts,
      linkTo: '/admin/productos',
      accent: stats.outOfStockProducts > 0,
    },
    {
      title:  'Stock bajo (≤5)',
      value:  stats.lowStockProducts,
      linkTo: '/admin/productos',
      accent: stats.lowStockProducts > 0,
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
          <p className="text-[10px] font-sans uppercase tracking-[0.15em] text-[#9A7480] mb-2">
            KB Dresses & More
          </p>
          <h1 className="font-display text-4xl font-light tracking-tight text-[#1A1118]">
            Dashboard
          </h1>
          <p className="text-sm text-[#9A7480] font-sans mt-1">
            Resumen operativo de tu tienda
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 border border-[rgba(212,120,138,0.25)] text-[#9A7480] rounded-sm text-sm font-sans hover:bg-[#FDF0F3] hover:border-[rgba(212,120,138,0.4)] transition-all"
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

          {/* Stock bajo */}
          {stats.lowStockItems?.length > 0 && (
            <section className="bg-white rounded-sm border border-[rgba(212,120,138,0.12)] shadow-[0_1px_4px_rgba(26,17,24,0.03)] p-6">
              <SectionHeader
                title="⚠ Stock bajo"
                subtitle={`${stats.lowStockProducts} producto${stats.lowStockProducts !== 1 ? 's' : ''} con 5 o menos unidades`}
                accent
              />
              <div className="mt-4 space-y-2">
                {stats.lowStockItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-2 px-3 bg-[#FFF8F5] rounded-sm">
                    <div>
                      <p className="text-sm font-medium text-[#1A1118] font-['DM_Sans']">{item.name}</p>
                      <p className="text-xs text-[#9A7480] font-['DM_Sans']">{item.sku || '—'} · {item.category || '—'}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-bold rounded-sm ${
                      item.stock === 0 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {item.stock} uds
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Acciones rápidas */}
          <section className="bg-white rounded-sm border border-[rgba(212,120,138,0.12)] shadow-[0_1px_4px_rgba(26,17,24,0.03)] p-6">
            <SectionHeader title="Acciones rápidas" />
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setVentaRapidaAbierto(true)}
                className="px-4 py-2 bg-[#1A1118] text-[#FFF8F5] rounded-sm text-sm font-sans font-medium hover:bg-[#2D2030] transition-colors"
              >
                + Venta rápida
              </button>
              <Link
                to="/admin/productos"
                className="px-4 py-2 bg-[#1A1118] text-[#FFF8F5] rounded-sm text-sm font-sans font-medium hover:bg-[#2D2030] transition-colors"
              >
                Nuevo producto
              </Link>
              <Link
                to="/admin/pedidos"
                className="px-4 py-2 border border-[rgba(212,120,138,0.25)] text-[#9A7480] rounded-sm text-sm font-sans font-medium hover:bg-[#FDF0F3] transition-colors"
              >
                Ver pedidos
              </Link>
              <Link
                to="/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 border border-[rgba(212,120,138,0.25)] text-[#9A7480] rounded-sm text-sm font-sans font-medium hover:bg-[#FDF0F3] transition-colors"
              >
                Ver tienda
              </Link>
              <Link
                to="/catalogo"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 border border-[rgba(212,120,138,0.25)] text-[#9A7480] rounded-sm text-sm font-['DM_Sans'] font-medium hover:bg-[#FDF0F3] transition-colors"
              >
                Catálogo digital
              </Link>
            </div>
          </section>
        </div>
      )}
      <VentaRapidaModal abierto={ventaRapidaAbierto} onCerrar={() => setVentaRapidaAbierto(false)} />
    </div>
  )
}

export default DashboardPage