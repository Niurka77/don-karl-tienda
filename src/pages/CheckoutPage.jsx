import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useCartStore from '../store/cartStore'
import { supabase } from '../lib/supabase'
import { WHATSAPP_PHONE } from '../lib/constants'
import ImageWithFallback from '../components/ui/ImageWithFallback'
import { p } from '../lib/theme'

const CheckoutPage = () => {
  const navigate = useNavigate()
  const { items, getTotalPrice, clearCart } = useCartStore()
  const total = getTotalPrice()

  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState(null)
  const [exito, setExito] = useState(null)

  const validarTelefono = (v) => /^9\d{8}$/.test(v.replace(/\D/g, ''))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!nombre.trim()) { setError('Ingresa tu nombre'); return }
    if (!telefono.trim()) { setError('Ingresa tu teléfono'); return }
    if (!validarTelefono(telefono)) { setError('Teléfono inválido (ej: 999888777)'); return }

    setEnviando(true)
    try {
      const pedido = {
        customer_name: nombre.trim(),
        customer_phone: telefono.trim(),
        products: items.map(i => ({
          id: i.id, name: i.name, size: i.selectedSize,
          quantity: i.quantity, price: i.price,
          sku: i.sku,
        })),
        total,
        payment_method: 'cotizacion',
        status: 'cotizacion',
      }

      const { data, error: e } = await supabase.from('orders').insert([pedido]).select('id').single()
      if (e) throw e

      const orderId = data.id
      const baseUrl = window.location.origin
      const listaProductos = items.map(item =>
        `• ${item.name} ${item.selectedSize ? `(Talla ${item.selectedSize})` : ''} x ${item.quantity} = S/ ${(item.price * item.quantity).toFixed(2)}`
      ).join('\n')

      const textoDonKarl =
        `🛍️ *NUEVA COTIZACIÓN* 🛍️\n\n` +
        `Cliente: ${nombre.trim()}\n` +
        `Teléfono: ${telefono.trim()}\n\n` +
        `Productos:\n${listaProductos}\n\n` +
        `Total: S/ ${total.toFixed(2)}\n\n` +
        `✅ Pagado: ${baseUrl}/confirmar/${orderId}?accion=pagado\n` +
        `📦 Enviado: ${baseUrl}/confirmar/${orderId}?accion=enviado`

      const waUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(textoDonKarl)}`

      setExito({ id: orderId, nombre: nombre.trim(), telefono: telefono.trim(), waUrl })
      clearCart()
    } catch (err) {
      console.error('Error completo:', err)
      setError('Error al enviar la cotización. Intenta de nuevo.')
    } finally {
      setEnviando(false)
    }
  }

  if (items.length === 0 && !exito) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: p.ivory }}>
      <div className="text-center px-6">
        <div style={{ width: '56px', height: '56px', borderRadius: '50%', margin: '0 auto 1.5rem', border: `1px solid ${p.roseBlush}40`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg className="w-5 h-5" fill="none" stroke={p.rose} strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 300, fontStyle: 'italic', color: p.mauve, marginBottom: '1.5rem' }}>
          Tu lista está vacía
        </p>
        <Link to="/" className="btn-kb-ghost">← Ir a la tienda</Link>
      </div>
    </div>
  )

  if (exito) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: p.ivory }}>
      <div className="text-center px-6 animate-scale-reveal max-w-sm">
        <div style={{ width: '72px', height: '72px', borderRadius: '50%', margin: '0 auto 2rem', border: `1px solid ${p.roseBlush}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${p.blush}99` }}>
          <svg className="w-7 h-7" fill="none" stroke={p.rose} strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <p className="text-editorial mb-3" style={{ color: p.rose, fontSize: '0.62rem', letterSpacing: '0.25em' }}>
          Cotización enviada
        </p>

        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 300, letterSpacing: '-0.02em', color: p.charcoal, marginBottom: '0.5rem' }}>
          ¡Gracias, {exito.nombre.split(' ')[0]}!
        </h2>

        <p style={{ fontSize: '0.75rem', fontWeight: 300, color: p.mauve, marginBottom: '0.5rem' }}>
          Cotización #{exito.id?.slice(0, 8).toUpperCase()}
        </p>

        <p style={{ fontSize: '0.78rem', fontWeight: 300, color: `${p.mauve}B3`, lineHeight: 1.6, marginBottom: '2.5rem' }}>
          Tu cotización se ha guardado correctamente.
        </p>

        <a
          href={exito.waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full block text-center py-3 rounded-sm text-sm font-semibold uppercase tracking-widest transition-all hover:-translate-y-0.5"
          style={{ background: '#25D366', color: '#FFFFFF', fontFamily: 'var(--font-sans)', marginBottom: '1rem' }}
        >
          💬 Abrir WhatsApp
        </a>

        <div style={{ height: '1px', background: `${p.roseBlush}20`, marginBottom: '2rem' }} />

        <Link to="/" className="btn-kb-ghost">← Seguir explorando</Link>
      </div>
    </div>
  )

  return (
    <div style={{ background: p.ivory, minHeight: '100vh' }}>
      <div className="max-w-screen-xl mx-auto px-6 lg:px-10 py-14 md:py-20">
        <div className="flex items-center gap-4 mb-14">
          <span style={{ width: '24px', height: '1px', background: p.rose, display: 'inline-block' }} />
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', fontWeight: 300, fontStyle: 'italic', letterSpacing: '-0.02em', color: p.charcoal }}>
            Solicitar cotización
          </h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-12 lg:gap-16 items-start">
          <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-10">
            <section>
              <p className="text-editorial mb-8" style={{ color: p.mauve, fontSize: '0.62rem', letterSpacing: '0.25em' }}>
                Tus datos
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
                <div>
                  <label style={{ display: 'block', fontSize: '0.58rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: p.mauve, marginBottom: '0.6rem', fontFamily: 'var(--font-sans)' }}>
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="María Pérez"
                    style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: `1.5px solid ${p.roseBlush}50`, padding: '0.55rem 0', fontSize: '0.9rem', fontWeight: 300, fontFamily: 'var(--font-sans)', color: p.charcoal, outline: 'none', transition: 'border-color 0.3s ease' }}
                    onFocus={(e) => e.currentTarget.style.borderBottomColor = p.rose}
                    onBlur={(e) => e.currentTarget.style.borderBottomColor = `${p.roseBlush}50`}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.58rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: p.mauve, marginBottom: '0.6rem', fontFamily: 'var(--font-sans)' }}>
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="999 888 777"
                    style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: `1.5px solid ${p.roseBlush}50`, padding: '0.55rem 0', fontSize: '0.9rem', fontWeight: 300, fontFamily: 'var(--font-sans)', color: p.charcoal, outline: 'none', transition: 'border-color 0.3s ease' }}
                    onFocus={(e) => e.currentTarget.style.borderBottomColor = p.rose}
                    onBlur={(e) => e.currentTarget.style.borderBottomColor = `${p.roseBlush}50`}
                  />
                </div>
              </div>
            </section>

            {error && (
              <div style={{ padding: '0.9rem 1.2rem', border: '1px solid rgba(229,57,53,0.2)', borderLeft: '2px solid #E53935', background: 'rgba(229,57,53,0.04)', fontSize: '0.78rem', fontWeight: 300, color: '#C62828' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={enviando}
              className="w-full btn-kb-primary"
              style={{ fontSize: '0.68rem', padding: '1.1rem', opacity: enviando ? 0.6 : 1 }}
            >
              <span>
                {enviando ? 'Enviando…' : `Enviar cotización — S/ ${total.toFixed(2)}`}
              </span>
            </button>
          </form>

          <div className="lg:sticky lg:top-28">
            <div style={{ background: 'white', border: `1px solid ${p.roseBlush}20`, padding: '1.8rem' }}>
              <div className="flex items-center gap-3 mb-6">
                <span style={{ width: '16px', height: '1px', background: p.rose, flexShrink: 0 }} />
                <p className="text-editorial" style={{ color: p.charcoal, fontSize: '0.62rem', letterSpacing: '0.22em' }}>
                  Tu lista
                </p>
              </div>

              <div className="space-y-4 mb-6" style={{ maxHeight: '340px', overflowY: 'auto' }}>
                {items.map((item) => (
                  <div key={`${item.id}-${item.selectedSize}`} className="flex gap-3">
                    <div style={{ width: '52px', height: '64px', flexShrink: 0, overflow: 'hidden', background: p.blush }}>
                      <ImageWithFallback src={item.image} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p style={{ fontSize: '0.82rem', fontWeight: 400, color: p.charcoal, marginBottom: '2px' }} className="line-clamp-1">
                        {item.name}
                      </p>
                      <p style={{ fontSize: '0.65rem', fontWeight: 300, color: p.mauve, letterSpacing: '0.04em', marginBottom: '4px' }}>
                        {item.selectedSize && `Talla ${item.selectedSize} · `}Cant. {item.quantity}
                      </p>
                      <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 400, color: p.roseDeep, letterSpacing: '-0.01em' }}>
                        S/ {(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: `1px solid ${p.roseBlush}15`, paddingTop: '1.2rem' }}>
                <div className="flex justify-between items-center mb-2">
                  <span style={{ fontSize: '0.75rem', fontWeight: 300, color: p.mauve }}>Subtotal</span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 300, color: p.charcoal }}>S/ {total.toFixed(2)}</span>
                </div>
                <div style={{ borderTop: `1px solid ${p.roseBlush}15`, paddingTop: '1rem' }}
                  className="flex justify-between items-baseline">
                  <span className="text-editorial" style={{ color: p.mauve, fontSize: '0.62rem', letterSpacing: '0.2em' }}>Total</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 300, letterSpacing: '-0.03em', color: p.roseDeep }}>
                    S/ {total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckoutPage
