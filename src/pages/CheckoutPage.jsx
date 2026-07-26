import { Link } from 'react-router-dom'
import useCartStore from '../store/cartStore'
import { WHATSAPP_PHONE } from '../lib/constants'
import ImageWithFallback from '../components/ui/ImageWithFallback'

const CURRENCY = 'S/'

const CheckoutPage = () => {
  const { items, getTotalPrice, clearCart } = useCartStore()
  const total = getTotalPrice()

  const buildWhatsAppMessage = () => {
    const lines = items.map((item) => {
      const code = item.sku ? item.sku.replace(/[^0-9]/g, '') : ''
      const size = item.selectedSize ? ` (Talla ${item.selectedSize})` : ''
      const sub = (item.price * item.quantity).toFixed(2)
      return `• ${item.name}${code ? ' [Código: ' + code + ']' : ''}${size} x${item.quantity} = ${CURRENCY}${sub}`
    })

    return [
      `Hola Don Karl`,
      ``,
      `Vi en su tienda y me interesa:`,
      ...lines,
      ``,
      `💰 Total: ${CURRENCY}${total.toFixed(2)}`,
      ``,
      `¿Cómo coordino el pago?`,
    ].join('\n')
  }

  const handleSendWhatsApp = () => {
    if (items.length === 0) return
    const msg = buildWhatsAppMessage()
    const url = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(msg)}`

    if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      window.location.href = url
    } else {
      window.open(url, '_blank')
    }
  }

  /* ── CARRITO VACÍO ── */
  if (items.length === 0) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-kb-ivory)' }}>
      <div className="text-center px-6">
        <div style={{
          width: '56px', height: '56px', borderRadius: '50%', margin: '0 auto 1.5rem',
          border: '1px solid rgba(212,120,138,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"
            style={{ color: 'var(--color-kb-rose)' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
        <p style={{
          fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 300,
          fontStyle: 'italic', color: 'var(--color-kb-mauve)', marginBottom: '1.5rem',
        }}>
          Tu bolsa está vacía
        </p>
        <Link to="/" className="btn-kb-ghost">← Ir a la tienda</Link>
      </div>
    </div>
  )

  /* ── RESUMEN + WHATSAPP ── */
  return (
    <div style={{ background: 'var(--color-kb-ivory)', minHeight: '100vh' }}>
      <div className="max-w-screen-md mx-auto px-6 py-14 md:py-20">

        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <span style={{ width: '24px', height: '1px', background: 'var(--color-kb-rose)', display: 'inline-block' }} />
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4vw, 2.4rem)',
            fontWeight: 300, fontStyle: 'italic', letterSpacing: '-0.02em',
            color: 'var(--color-kb-charcoal)',
          }}>
            Tu cotización
          </h1>
        </div>

        {/* Card resumen */}
        <div style={{
          background: 'white', border: '1px solid rgba(212,120,138,0.12)',
          padding: '2rem', marginBottom: '2rem',
        }}>
          {/* Items */}
          <div className="space-y-5 mb-6">
            {items.map((item) => {
              const code = item.sku ? item.sku.replace(/[^0-9]/g, '') : ''
              return (
                <div key={`${item.id}-${item.selectedSize}`} className="flex gap-4">
                  <div style={{ width: '64px', height: '80px', flexShrink: 0, overflow: 'hidden', background: 'var(--color-kb-blush)' }}>
                    <ImageWithFallback src={item.image} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="line-clamp-1" style={{ fontSize: '0.9rem', fontWeight: 400, color: 'var(--color-kb-charcoal)' }}>
                      {item.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1" style={{ fontSize: '0.72rem', color: 'var(--color-kb-mauve)' }}>
                      {code && (
                        <span style={{
                          background: 'linear-gradient(135deg, #FF5C8A, #FF8E72)',
                          color: '#fff', fontSize: '0.58rem', fontWeight: 700,
                          padding: '0.15rem 0.5rem', borderRadius: '2px',
                        }}>
                          Código: {code}
                        </span>
                      )}
                      {item.selectedSize && <span>Talla {item.selectedSize}</span>}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--color-kb-rose-deep)' }}>
                        {CURRENCY}{(item.price * item.quantity).toFixed(2)}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--color-kb-mauve)' }}>
                        {CURRENCY}{item.price.toFixed(2)} × {item.quantity}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Totales */}
          <div style={{ borderTop: '1px solid rgba(212,120,138,0.1)', paddingTop: '1.2rem' }}>
            <div className="flex justify-between items-center mb-2">
              <span style={{ fontSize: '0.8rem', fontWeight: 300, color: 'var(--color-kb-mauve)' }}>Subtotal</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 300, color: 'var(--color-kb-charcoal)' }}>{CURRENCY}{total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center mb-4">
              <span style={{ fontSize: '0.8rem', fontWeight: 300, color: 'var(--color-kb-mauve)' }}>Envío</span>
              <span style={{ fontSize: '0.72rem', fontWeight: 300, color: '#4CAF50', letterSpacing: '0.04em' }}>Por coordinar</span>
            </div>
            <div style={{ borderTop: '1px solid rgba(212,120,138,0.1)', paddingTop: '0.8rem' }}
              className="flex justify-between items-baseline">
              <span className="text-editorial" style={{ color: 'var(--color-kb-mauve)', fontSize: '0.62rem', letterSpacing: '0.2em' }}>TOTAL</span>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 300, color: 'var(--color-kb-rose-deep)' }}>
                {CURRENCY}{total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Botón WhatsApp */}
        <button onClick={handleSendWhatsApp} className="w-full" style={{
          padding: '1rem 2rem',
          background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
          color: '#fff', fontSize: '0.75rem', fontWeight: 600,
          fontFamily: 'var(--font-sans)', letterSpacing: '0.15em', textTransform: 'uppercase',
          border: 'none', borderRadius: '50px', cursor: 'pointer',
          boxShadow: '0 8px 24px rgba(37,211,102,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
          transition: 'all 0.3s ease',
        }}>
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Cotizar por WhatsApp
        </button>

        {/* Nota */}
        <p style={{
          textAlign: 'center', fontSize: '0.7rem', color: 'var(--color-kb-mauve)',
          marginTop: '1rem', fontWeight: 300, lineHeight: 1.6,
        }}>
          Se abrirá WhatsApp con el resumen de tu pedido.
          <br />Don Karl coordinará el pago y la entrega contigo.
        </p>

        {/* Separador */}
        <div style={{ height: '1px', background: 'rgba(212,120,138,0.1)', margin: '2rem 0' }} />

        {/* Seguir comprando */}
        <div className="text-center">
          <Link to="/" className="btn-kb-ghost">← Seguir comprando</Link>
        </div>
      </div>
    </div>
  )
}

export default CheckoutPage
