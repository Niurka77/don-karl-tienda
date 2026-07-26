import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { WHATSAPP_PHONE } from '../lib/constants'
import { useSiteConfig } from '../hooks/useSiteConfig'
import { p } from '../lib/theme'

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=800&fit=crop&q=85'

export default function CatalogoPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [originFilter, setOriginFilter] = useState('all')
  const { config } = useSiteConfig()

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .gt('stock', 0)
      .order('created_at', { ascending: false })
    if (!error) setProducts(data || [])
    setLoading(false)
  }

  const categories = ['all', ...new Set(products.map(p => p.category).filter(Boolean))]
  const origins = ['all', 'importado', 'nacional']

  const filtered = products.filter(p => {
    if (filter !== 'all' && p.category !== filter) return false
    if (originFilter !== 'all' && p.origin !== originFilter) return false
    return true
  })

  const handleWhatsApp = (product) => {
    const msg = `Hola, me interesa el producto "${product.name}" (${product.sku || 'sin código'}) que vi en su catálogo. ¿Está disponible?`
    window.open(`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  return (
    <div className="min-h-screen" style={{ background: p.ivory }}>
      {/* Header */}
      <div
        className="relative py-16 px-6 text-center overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${p.roseMist} 0%, ${p.champagneLt} 50%, ${p.ivory} 100%)`,
        }}
      >
        <div className="relative z-10 max-w-3xl mx-auto">
          <p className="text-[0.65rem] tracking-[0.4em] uppercase font-medium mb-4" style={{ color: p.roseDeep }}>
            Catálogo Digital
          </p>
          <h1
            className="font-['Cormorant_Garamond'] font-light leading-[1.05] tracking-[-0.02em] mb-4"
            style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', color: p.ink }}
          >
            Explora nuestra{' '}
            <span
              style={{
                fontStyle: 'italic',
                background: `linear-gradient(135deg, ${p.roseVivid}, ${p.coral}, ${p.gold})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              colección
            </span>
          </h1>
          <p className="text-sm max-w-md mx-auto" style={{ color: p.textSoft, fontWeight: 300 }}>
            Piezas importadas desde Estados Unidos y productos nacionales de Lima.
            Contacta por WhatsApp para pedidos.
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="max-w-screen-xl mx-auto px-6 py-6">
        <div className="flex flex-wrap gap-3 mb-8">
          {/* Categorías */}
          <div className="flex gap-1 bg-white rounded-sm p-0.5 border border-[rgba(212,120,138,0.15)]">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-2 text-[0.65rem] font-['DM_Sans'] font-medium tracking-wider uppercase rounded-sm transition-all ${
                  filter === cat
                    ? 'bg-[#1A1118] text-white shadow-sm'
                    : 'text-[#9A7480] hover:text-[#4A3340]'
                }`}
              >
                {cat === 'all' ? 'Todo' : cat}
              </button>
            ))}
          </div>

          {/* Origen */}
          <div className="flex gap-1 bg-white rounded-sm p-0.5 border border-[rgba(212,120,138,0.15)]">
            {origins.map((org) => (
              <button
                key={org}
                onClick={() => setOriginFilter(org)}
                className={`px-4 py-2 text-[0.65rem] font-['DM_Sans'] font-medium tracking-wider uppercase rounded-sm transition-all ${
                  originFilter === org
                    ? 'bg-[#1A1118] text-white shadow-sm'
                    : 'text-[#9A7480] hover:text-[#4A3340]'
                }`}
              >
                {org === 'all' ? 'Todos' : org === 'importado' ? 'EE.UU.' : 'Lima'}
              </button>
            ))}
          </div>
        </div>

        {/* Grid de productos */}
        {loading ? (
          <div className="text-center py-20">
            <div className="w-8 h-8 border-4 border-[#E8D5B7] border-t-[#C9607F] rounded-full animate-spin mx-auto" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-sm py-20" style={{ color: p.textSoft }}>
            No hay productos en esta categoría
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filtered.map((product) => {
              const imageUrl = product.images_urls?.[0] || product.image_url || FALLBACK_IMAGE
              const hasDiscount = product.discount_percent > 0
              const finalPrice = hasDiscount
                ? product.price_original * (1 - product.discount_percent / 100)
                : product.price_original

              return (
                <div
                  key={product.id}
                  className="group bg-white rounded-sm overflow-hidden border border-[rgba(212,120,138,0.08)] transition-all duration-500 hover:shadow-xl hover:-translate-y-1"
                >
                  {/* Imagen */}
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    {hasDiscount && (
                      <div
                        className="absolute top-3 left-3 px-2 py-1 text-[0.6rem] font-bold tracking-wider"
                        style={{ background: p.gold, color: p.ink, borderRadius: '2px' }}
                      >
                        -{product.discount_percent}%
                      </div>
                    )}
                    {product.origin && (
                      <div
                        className={`absolute top-3 right-3 px-2 py-1 text-[0.55rem] font-semibold tracking-wider ${
                          product.origin === 'nacional' ? 'bg-blue-500 text-white' : 'bg-amber-500 text-white'
                        }`}
                        style={{ borderRadius: '2px' }}
                      >
                        {product.origin === 'nacional' ? 'LIMA' : 'EE.UU.'}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <p className="text-[0.6rem] tracking-[0.2em] uppercase mb-1" style={{ color: p.textSoft }}>
                      {product.brand || product.category}
                    </p>
                    <h3 className="text-sm font-medium mb-2 line-clamp-2" style={{ color: p.ink, fontFamily: 'ui-sans-serif, system-ui, sans-serif' }}>
                      {product.name}
                    </h3>
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-lg font-light" style={{ color: p.roseDeep, fontFamily: 'Georgia, serif' }}>
                        S/ {finalPrice.toFixed(2)}
                      </span>
                      {hasDiscount && (
                        <span className="text-xs line-through" style={{ color: p.textSoft }}>
                          S/ {product.price_original.toFixed(2)}
                        </span>
                      )}
                    </div>

                    {/* Botón WhatsApp */}
                    <button
                      onClick={() => handleWhatsApp(product)}
                      className="w-full py-2.5 text-[0.65rem] font-['DM_Sans'] font-semibold tracking-widest uppercase rounded-sm transition-all"
                      style={{
                        border: `1.5px solid ${p.roseBlush}60`,
                        color: p.roseDeep,
                        background: `linear-gradient(135deg, ${p.roseMist} 0%, ${p.champagneLt}40 100%)`,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = `linear-gradient(135deg, ${p.roseVivid}, ${p.coral})`
                        e.currentTarget.style.color = p.ivory
                        e.currentTarget.style.borderColor = p.roseVivid
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = `linear-gradient(135deg, ${p.roseMist} 0%, ${p.champagneLt}40 100%)`
                        e.currentTarget.style.color = p.roseDeep
                        e.currentTarget.style.borderColor = `${p.roseBlush}60`
                      }}
                    >
                      Consultar por WhatsApp
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer del catálogo */}
      <div className="text-center py-12 px-6" style={{ borderTop: `1px solid ${p.champagne}30` }}>
        <p className="text-xs" style={{ color: p.textSoft }}>
          Para pedidos, contacta por WhatsApp con el código del producto
        </p>
      </div>
    </div>
  )
}
