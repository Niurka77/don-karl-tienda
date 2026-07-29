import React, { useState, useRef, useEffect, useCallback, createContext, useContext } from 'react'
import { supabase } from '../../lib/supabase'
import { CURRENCY } from '../../lib/constants'

const year = new Date().getFullYear()

// ─── ESTILOS INLINE COMPLETOS (sin herencia CSS) ───
const S = {
  page: { width: '794px', minHeight: '1123px', background: '#ffffff', overflow: 'hidden', position: 'relative', fontFamily: 'Inter, Helvetica, Arial, sans-serif', boxSizing: 'border-box' },
  gradient: (invertido) => ({
    position: 'absolute', inset: 0,
    background: `linear-gradient(180deg, #f8ebf0 0%, rgba(248,235,240,0.8) 40%, rgba(255,255,255,0.95) 100%)`,
    pointerEvents: 'none',
  }),
  line: { height: '1px', background: '#e6b4c3', border: 'none', margin: '0 auto' },
  lineW: (w) => ({ width: w, height: '1px', background: '#e6b4c3', border: 'none', margin: '0 auto' }),
  brandTxt: { fontFamily: 'Inter, Helvetica, Arial, sans-serif', fontWeight: 700, fontSize: '9px', letterSpacing: '2px', color: '#644650', textTransform: 'uppercase' },
  nameTxt: { fontFamily: 'Georgia, "Times New Roman", serif', fontWeight: 400, fontSize: '13px', color: '#2d1f26', lineHeight: 1.3 },
  subtxt: { fontFamily: 'Inter, Helvetica, Arial, sans-serif', fontWeight: 400, fontSize: '8px', color: '#8b6f7a', letterSpacing: '1px' },
  priceTxt: { fontFamily: 'Georgia, "Times New Roman", serif', fontWeight: 700, fontSize: '18px', color: '#e60000' },
}

const CatalogPage = React.forwardRef(({ children, style }, ref) => (
  <div ref={ref} style={{ ...S.page, ...style }}>{children}</div>
))

const CoverContent = () => (
  <>
    <div style={S.gradient(false)} />
    <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '1123px', padding: '60px 40px', boxSizing: 'border-box' }}>
      <div style={{ ...S.lineW('200px'), marginBottom: '40px' }} />
      <div style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: '52px', fontWeight: 700, color: '#2d1f26', letterSpacing: '4px', marginBottom: '10px' }}>DON KARL</div>
      <div style={{ fontFamily: 'Inter, Helvetica, Arial, sans-serif', fontSize: '12px', fontWeight: 400, color: '#8b6f7a', letterSpacing: '6px', marginBottom: '30px' }}>{`COLECCIÓN ${year}`}</div>
      <div style={{ ...S.lineW('200px'), marginBottom: '40px' }} />
      <div style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: '16px', fontWeight: 400, fontStyle: 'italic', color: '#2d1f26', marginBottom: '50px' }}>Encuentra tu estilo con nosotros</div>
      <div style={{ display: 'flex', gap: '30px', justifyContent: 'center', marginBottom: '30px' }}>
        {['INSTAGRAM', 'TIKTOK', 'FACEBOOK', 'WHATSAPP'].map(r => (
          <span key={r} style={{ fontFamily: 'Inter, Helvetica, Arial, sans-serif', fontSize: '8px', fontWeight: 700, letterSpacing: '3px', color: '#c88c9d' }}>{r}</span>
        ))}
      </div>
      <div style={{ ...S.lineW('200px'), marginBottom: '20px' }} />
      <div style={{ fontFamily: 'Inter, Helvetica, Arial, sans-serif', fontSize: '8px', fontWeight: 400, color: '#8b6f7a' }}>{new Date().toLocaleDateString('es-PE')}</div>
    </div>
  </>
)

const ProductCard_ = ({ prod, imgUrl }) => (
  <div style={{ background: '#ffffff', boxShadow: '0 1px 6px rgba(0,0,0,0.04), 0 0 0 1px rgba(230,180,195,0.15)', overflow: 'hidden', position: 'relative' }}>
    <div style={{ width: '100%', aspectRatio: '1/1.05', background: '#ffe8ef', overflow: 'hidden', position: 'relative' }}>
      {imgUrl ? (
        <img src={imgUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} crossOrigin="anonymous" />
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <span style={{ fontSize: '10px', letterSpacing: '2px', color: '#c9607f', opacity: 0.5, fontFamily: 'Inter, Helvetica, Arial, sans-serif', fontWeight: 600 }}>KB</span>
        </div>
      )}
      {prod.is_new && <span style={{ position: 'absolute', top: '6px', left: '6px', background: '#2d1f26', color: '#fff', fontSize: '7px', fontWeight: 700, letterSpacing: '2px', padding: '2px 8px', fontFamily: 'Inter, Helvetica, Arial, sans-serif' }}>NUEVO</span>}
      {prod.sku && <span style={{ position: 'absolute', bottom: '6px', right: '6px', background: 'rgba(255,255,255,0.9)', fontSize: '7px', color: '#8b6f7a', padding: '1px 6px', fontFamily: 'Inter, Helvetica, Arial, sans-serif', fontWeight: 500 }}>{prod.sku}</span>}
    </div>
    <div style={{ padding: '10px 10px 12px' }}>
      {prod.brand && <div style={S.brandTxt}>{prod.brand.toUpperCase()}</div>}
      <div style={{ ...S.nameTxt, marginTop: '2px' }}>{prod.name}</div>
      {prod.color && <div style={{ ...S.subtxt, marginTop: '3px' }}>{prod.color.charAt(0).toUpperCase() + prod.color.slice(1)}</div>}
      <div style={{ height: '1px', background: 'linear-gradient(90deg, #e60000 30%, transparent)', margin: '8px 0 6px' }} />
      <div style={S.priceTxt}>{`${CURRENCY} ${Number(prod.discount_percent > 0 ? prod.price_final : prod.price_original).toFixed(2)}`}</div>
      {prod.discount_percent > 0 && <div style={{ ...S.subtxt, marginTop: '1px', textDecoration: 'line-through' }}>{`${CURRENCY} ${Number(prod.price_original).toFixed(2)}`}</div>}
    </div>
  </div>
)

const BackCoverContent = () => (
  <>
    <div style={S.gradient(true)} />
    <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '1123px', padding: '60px 40px', boxSizing: 'border-box' }}>
      <div style={{ ...S.lineW('200px'), marginBottom: '30px' }} />
      <div style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: '36px', fontWeight: 700, color: '#2d1f26', marginBottom: '8px' }}>¡Gracias!</div>
      <div style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: '14px', color: '#2d1f26', marginBottom: '24px' }}>Por tu preferencia</div>
      <div style={{ ...S.lineW('200px'), marginBottom: '28px' }} />
      <div style={{ fontFamily: 'Inter, Helvetica, Arial, sans-serif', fontSize: '10px', fontWeight: 700, letterSpacing: '3px', color: '#e60000', marginBottom: '6px' }}>CONTÁCTANOS</div>
      <div style={{ fontFamily: 'Inter, Helvetica, Arial, sans-serif', fontSize: '16px', fontWeight: 400, color: '#2d1f26', marginBottom: '28px' }}>+51 906 877 812</div>
      <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', marginBottom: '24px', flexWrap: 'wrap' }}>
        {[
          { plat: 'INSTAGRAM', user: '@donkarl_oficial' },
          { plat: 'TIKTOK', user: '@donkarl_oficial' },
          { plat: 'FACEBOOK', user: '@donkarl_tienda' },
        ].map(({ plat, user }) => (
          <div key={plat} style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'Inter, Helvetica, Arial, sans-serif', fontSize: '8px', fontWeight: 700, letterSpacing: '2px', color: '#8b6f7a' }}>{plat}</div>
            <div style={{ fontFamily: 'Inter, Helvetica, Arial, sans-serif', fontSize: '8px', color: '#2d1f26', marginTop: '2px' }}>{user}</div>
          </div>
        ))}
      </div>
      <div style={{ ...S.lineW('200px'), marginBottom: '16px' }} />
      <div style={{ fontFamily: 'Inter, Helvetica, Arial, sans-serif', fontSize: '9px', fontWeight: 700, letterSpacing: '2px', color: '#8b6f7a', marginBottom: '6px' }}>MÉTODOS DE PAGO</div>
      <div style={{ fontFamily: 'Inter, Helvetica, Arial, sans-serif', fontSize: '8px', color: '#2d1f26', marginBottom: '16px', textAlign: 'center' }}>Visa | Mastercard | Yape | Plin | Transferencia Bancaria | Efectivo</div>
      <div style={{ ...S.lineW('200px'), marginBottom: '16px' }} />
      <div style={{ fontFamily: 'Inter, Helvetica, Arial, sans-serif', fontSize: '9px', fontWeight: 700, letterSpacing: '2px', color: '#8b6f7a', marginBottom: '4px' }}>ENVÍOS</div>
      <div style={{ fontFamily: 'Inter, Helvetica, Arial, sans-serif', fontSize: '8px', color: '#2d1f26', marginBottom: '30px' }}>A todo el Perú</div>
      <div style={{ ...S.lineW('200px'), marginBottom: '20px' }} />
      <div style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: '14px', fontWeight: 700, color: '#2d1f26', letterSpacing: '3px' }}>DON KARL</div>
    </div>
  </>
)

const CatalogRenderer = ({ productos, onReady }) => {
  const coverRef = useRef(null)
  const backRef = useRef(null)
  const pageRefs = useRef([])
  const [imgMap, setImgMap] = useState({})
  const [ready, setReady] = useState(false)

  // Cargar imágenes
  useEffect(() => {
    let mounted = true
    const loadAll = async () => {
      const map = {}
      for (const prod of productos) {
        const url = prod.image_url || prod.images_urls?.[0]
        if (!url) continue
        const img = new Image()
        img.crossOrigin = 'anonymous'
        await new Promise((resolve) => {
          img.onload = resolve
          img.onerror = resolve
          img.src = url
        })
        if (mounted) map[prod.id] = url
      }
      if (mounted) { setImgMap(map); setReady(true) }
    }
    loadAll()
    return () => { mounted = false }
  }, [productos])

  const porPag = 4
  const cols = 2
  const pages = []
  for (let i = 0; i < productos.length; i += porPag) {
    pages.push(productos.slice(i, i + porPag))
  }

  useEffect(() => {
    if (!ready) return
    const timer = setTimeout(() => {
      onReady({ coverRef, pageRefs: pageRefs.current, backRef, totalPages: pages.length + 2 })
    }, 500)
    return () => clearTimeout(timer)
  }, [ready, onReady, pages.length])

  if (!ready) return null

  return (
    <div style={{ position: 'fixed', left: '-9999px', top: 0, zIndex: -9999, background: '#ffffff' }}>
      {/* Portada */}
      <CatalogPage ref={coverRef}><CoverContent /></CatalogPage>
      {/* Productos */}
      {pages.map((prods, pi) => (
        <CatalogPage key={pi} ref={(el) => { pageRefs.current[pi] = el }}>
          <div style={{ padding: '24px 20px', display: 'flex', flexWrap: 'wrap', gap: '16px', boxSizing: 'border-box' }}>
            {prods.map((prod) => (
              <div key={prod.id} style={{ width: 'calc(50% - 8px)', boxSizing: 'border-box' }}>
                <ProductCard_ prod={prod} imgUrl={imgMap[prod.id]} />
              </div>
            ))}
          </div>
          {prods.length < porPag && <div style={{ flex: 1 }} />}
        </CatalogPage>
      ))}
      {/* Contraportada */}
      <CatalogPage ref={backRef}><BackCoverContent /></CatalogPage>
    </div>
  )
}

const BotonPDF = () => {
  const [state, setState] = useState('idle')
  const [productos, setProductos] = useState(null)
  const rendererRef = useRef(null)

  const handleClick = async () => {
    if (state !== 'idle') return
    setState('loading')

    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .gt('stock', 0)
        .order('category')
        .order('name')
      if (error) throw error
      if (!data || data.length === 0) { alert('No hay productos.'); setState('idle'); return }
      setProductos(data)
      setState('generating')
    } catch (err) {
      console.error(err); alert('Error al obtener productos.'); setState('idle')
    }
  }

  const handleReady = useCallback(async (info) => {
    const { coverRef, pageRefs, backRef, totalPages } = info
    try {
      await document.fonts.ready
      await new Promise(r => setTimeout(r, 300))

      const { default: jsPDF } = await import('jspdf')
      const { default: h2c } = await import('html2canvas')
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pw = 210, ph = 297

      const capture = async (el) => {
        if (!el) return null
        const canvas = await h2c(el, {
          scale: 2,
          useCORS: true,
          allowTaint: false,
          backgroundColor: '#ffffff',
          logging: false,
          width: 794,
          height: 1123,
          onclone: (d) => {
            const imgs = d.querySelectorAll('img')
            imgs.forEach(img => { img.style.display = 'block'; img.style.maxWidth = '100%' })
          }
        })
        return canvas.toDataURL('image/jpeg', 0.92)
      }

      const pages = pageRefs || []
      const allRefs = [coverRef.current, ...pages, backRef.current]

      for (let i = 0; i < allRefs.length; i++) {
        if (i > 0) doc.addPage()
        const dataUrl = await capture(allRefs[i])
        if (dataUrl) {
          try { doc.addImage(dataUrl, 'JPEG', 0, 0, pw, ph, undefined, 'FAST') } catch (e) { console.error(e) }
        }
      }

      doc.save(`Catalogo_Don_Karl_${new Date().toISOString().split('T')[0]}.pdf`)
    } catch (err) {
      console.error('Error PDF:', err)
      alert('Error al generar el PDF')
    } finally {
      setProductos(null)
      setState('idle')
    }
  }, [])

  return (
    <>
      <button
        onClick={handleClick}
        disabled={state !== 'idle'}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.5rem 1rem',
          background: state !== 'idle' ? '#E8D5B7' : '#2D1F26',
          color: state !== 'idle' ? '#8B6F7A' : '#FFFFFF',
          border: 'none', borderRadius: '2px', fontSize: '0.7rem',
          letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600,
          cursor: state !== 'idle' ? 'not-allowed' : 'pointer',
          transition: 'all 0.3s ease', fontFamily: 'var(--font-sans)',
        }}
      >
        {state !== 'idle' ? (
          <><span className="w-4 h-4 border-2 border-[#8B6F7A] border-t-transparent rounded-full animate-spin" /> Generando...</>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Descargar Catálogo PDF
          </>
        )}
      </button>

      {productos && (
        <CatalogRenderer
          productos={productos}
          onReady={handleReady}
        />
      )}
    </>
  )
}

export default BotonPDF
