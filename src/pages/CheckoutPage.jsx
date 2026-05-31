import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useCartStore from '../store/cartStore'
import { supabase } from '../lib/supabase'

/* ─────────────────────────────────────────
   Input base con línea inferior editorial
───────────────────────────────────────── */
const FieldLine = ({ name, value, onChange, placeholder, type = 'text', error, span }) => {
  const [focused, setFocused] = useState(false)

  return (
    <div className={span ? 'md:col-span-2' : ''}>
      <div style={{ position: 'relative', paddingBottom: '1px' }}>
        {/* Placeholder flotante */}
        <label
          style={{
            position: 'absolute',
            left: 0,
            top: focused || value ? '-14px' : '10px',
            fontSize: focused || value ? '0.58rem' : '0.82rem',
            fontWeight: 300,
            letterSpacing: focused || value ? '0.18em' : '0.02em',
            textTransform: focused || value ? 'uppercase' : 'none',
            color: error
              ? '#E53935'
              : focused
              ? 'var(--color-kb-rose)'
              : 'var(--color-kb-mauve)',
            transition: 'all 0.25s cubic-bezier(0.16,1,0.3,1)',
            pointerEvents: 'none',
            fontFamily: 'var(--font-sans)',
          }}
        >
          {placeholder}
        </label>

        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoComplete="off"
          style={{
            width: '100%',
            background: 'transparent',
            border: 'none',
            borderBottom: `1px solid ${
              error ? '#E53935' : focused ? 'var(--color-kb-rose)' : 'rgba(212,120,138,0.25)'
            }`,
            padding: '0.55rem 0 0.5rem',
            fontSize: '0.88rem',
            fontWeight: 300,
            fontFamily: 'var(--font-sans)',
            color: 'var(--color-kb-charcoal)',
            outline: 'none',
            transition: 'border-color 0.3s ease',
            letterSpacing: '0.02em',
          }}
        />

        {/* Línea de progreso animada al focus */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0,
          height: '2px', borderRadius: '0',
          background: 'linear-gradient(90deg, var(--color-kb-rose), var(--color-kb-soft-pink))',
          width: focused ? '100%' : '0',
          transition: 'width 0.4s cubic-bezier(0.16,1,0.3,1)',
        }} />
      </div>

      {error && (
        <p style={{ fontSize: '0.62rem', color: '#E53935', marginTop: '5px', letterSpacing: '0.04em', fontWeight: 300 }}>
          {error}
        </p>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────
   CheckoutPage
───────────────────────────────────────── */
const CheckoutPage = () => {
  const navigate = useNavigate()
  const { items, getTotalPrice, clearCart } = useCartStore()
  const total = getTotalPrice()

  const [formData, setFormData] = useState({
    nombre: '', telefono: '', email: '',
    direccion: '', ciudad: '', metodoPago: '',
  })
  const [errores,       setErrores]      = useState({})
  const [enviando,      setEnviando]     = useState(false)
  const [errorServidor, setErrorServidor] = useState(null)
  const [pedidoExitoso, setPedidoExitoso] = useState(null)

  const validarEmail    = (v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
  const validarTelefono = (v) => /^9\d{8}$/.test(v.replace(/\D/g, ''))

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(p => ({ ...p, [name]: value }))
    if (errores[name]) setErrores(p => ({ ...p, [name]: '' }))
    if (errorServidor) setErrorServidor(null)
  }

  const validar = () => {
    const e = {}
    if (!formData.nombre.trim())    e.nombre    = 'Requerido'
    if (!formData.telefono.trim())  e.telefono  = 'Requerido'
    else if (!validarTelefono(formData.telefono)) e.telefono = 'Número inválido (ej: 999999999)'
    if (!formData.direccion.trim()) e.direccion = 'Requerido'
    if (!formData.ciudad.trim())    e.ciudad    = 'Requerido'
    if (!formData.metodoPago)       e.metodoPago = 'Selecciona un método'
    if (formData.email && !validarEmail(formData.email)) e.email = 'Email inválido'
    setErrores(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    setErrorServidor(null)
    if (!validar()) return
    setEnviando(true)
    try {
      const pedido = {
        customer_name:    formData.nombre.trim(),
        customer_phone:   formData.telefono.trim(),
        customer_email:   formData.email.trim() || null,
        customer_address: formData.direccion.trim(),
        customer_city:    formData.ciudad.trim(),
        products: items.map(i => ({
          product_id: i.id, name: i.name, talla: i.selectedSize,
          cantidad: i.quantity, precio_unitario: i.price,
          subtotal: i.price * i.quantity, sku: i.sku,
        })),
        total, payment_method: formData.metodoPago, status: 'pendiente',
      }
      const { data, error } = await supabase.from('orders').insert([pedido]).select('id').single()
      if (error) throw error
      for (const item of items)
        await supabase.rpc('decrementar_stock', { product_id: item.id, cantidad: item.quantity })
      setPedidoExitoso({ id: data.id, ...pedido })
      clearCart()
    } catch (err) {
      console.error(err)
      setErrorServidor('Error al procesar el pedido. Intenta nuevamente.')
    } finally {
      setEnviando(false)
    }
  }

  /* ── CARRITO VACÍO ── */
  if (items.length === 0 && !pedidoExitoso) return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: 'var(--color-kb-ivory)' }}
    >
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

  /* ── PEDIDO EXITOSO ── */
  if (pedidoExitoso) return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: 'var(--color-kb-ivory)' }}
    >
      <div className="text-center px-6 animate-scale-reveal max-w-sm">
        {/* Ícono check animado */}
        <div style={{
          width: '72px', height: '72px', borderRadius: '50%', margin: '0 auto 2rem',
          border: '1px solid rgba(212,120,138,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(250,237,241,0.6)',
        }}>
          <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"
            style={{ color: 'var(--color-kb-rose)' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {/* Número pedido */}
        <p className="text-editorial mb-3" style={{ color: 'var(--color-kb-rose)', fontSize: '0.62rem', letterSpacing: '0.25em' }}>
          Pedido confirmado
        </p>

        <h2 style={{
          fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 300,
          letterSpacing: '-0.02em', color: 'var(--color-kb-charcoal)', marginBottom: '0.5rem',
        }}>
          ¡Gracias, {pedidoExitoso.customer_name.split(' ')[0]}!
        </h2>

        <p style={{ fontSize: '0.75rem', fontWeight: 300, color: 'var(--color-kb-mauve)', marginBottom: '0.5rem' }}>
          Pedido #{pedidoExitoso.id?.slice(0, 8).toUpperCase()}
        </p>

        <p style={{ fontSize: '0.78rem', fontWeight: 300, color: 'rgba(154,116,128,0.7)', lineHeight: 1.6, marginBottom: '2.5rem' }}>
          Nos pondremos en contacto contigo en breve para coordinar la entrega.
        </p>

        <div style={{ height: '1px', background: 'rgba(212,120,138,0.12)', marginBottom: '2rem' }} />

        <Link to="/" className="btn-kb-ghost">← Seguir comprando</Link>
      </div>
    </div>
  )

  /* ── CHECKOUT PRINCIPAL ── */
  return (
    <div style={{ background: 'var(--color-kb-ivory)', minHeight: '100vh' }}>
      <div className="max-w-screen-xl mx-auto px-6 lg:px-10 py-14 md:py-20">

        {/* Header */}
        <div className="flex items-center gap-4 mb-14">
          <span style={{ width: '24px', height: '1px', background: 'var(--color-kb-rose)', display: 'inline-block' }} />
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4vw, 2.4rem)',
            fontWeight: 300, fontStyle: 'italic', letterSpacing: '-0.02em',
            color: 'var(--color-kb-charcoal)',
          }}>
            Checkout
          </h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-12 lg:gap-16 items-start">

          {/* ── FORMULARIO ── */}
          <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-12">

            {/* CONTACTO */}
            <section>
              <p className="text-editorial mb-8" style={{ color: 'var(--color-kb-mauve)', fontSize: '0.62rem', letterSpacing: '0.25em' }}>
                01 — Contacto
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
                <FieldLine name="nombre"   value={formData.nombre}   onChange={handleChange} placeholder="Nombre completo" error={errores.nombre} />
                <FieldLine name="telefono" value={formData.telefono} onChange={handleChange} placeholder="Teléfono"         type="tel" error={errores.telefono} />
                <FieldLine name="email"    value={formData.email}    onChange={handleChange} placeholder="Email (opcional)" type="email" error={errores.email} span />
              </div>
            </section>

            {/* Separador */}
            <div style={{ height: '1px', background: 'rgba(212,120,138,0.1)' }} />

            {/* ENVÍO */}
            <section>
              <p className="text-editorial mb-8" style={{ color: 'var(--color-kb-mauve)', fontSize: '0.62rem', letterSpacing: '0.25em' }}>
                02 — Envío
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
                <FieldLine name="direccion" value={formData.direccion} onChange={handleChange} placeholder="Dirección" error={errores.direccion} span />
                <FieldLine name="ciudad"    value={formData.ciudad}    onChange={handleChange} placeholder="Ciudad"    error={errores.ciudad} />
              </div>
            </section>

            {/* Separador */}
            <div style={{ height: '1px', background: 'rgba(212,120,138,0.1)' }} />

            {/* PAGO */}
            <section>
              <p className="text-editorial mb-8" style={{ color: 'var(--color-kb-mauve)', fontSize: '0.62rem', letterSpacing: '0.25em' }}>
                03 — Método de pago
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                {['yape', 'plin', 'tarjeta', 'transferencia'].map((m) => {
                  const active = formData.metodoPago === m
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => { setFormData(p => ({ ...p, metodoPago: m })); if (errores.metodoPago) setErrores(p => ({ ...p, metodoPago: '' })) }}
                      style={{
                        padding: '0.85rem 0.5rem',
                        border: `1px solid ${active ? 'var(--color-kb-obsidian)' : 'rgba(212,120,138,0.2)'}`,
                        background: active ? 'var(--color-kb-obsidian)' : 'white',
                        color: active ? 'var(--color-kb-ivory)' : 'var(--color-kb-mauve)',
                        fontSize: '0.62rem', fontWeight: active ? 500 : 300,
                        fontFamily: 'var(--font-sans)',
                        letterSpacing: '0.18em', textTransform: 'uppercase',
                        borderRadius: '2px',
                        transition: 'all 0.25s ease',
                        cursor: 'pointer',
                      }}
                    >
                      {m}
                    </button>
                  )
                })}
              </div>

              {errores.metodoPago && (
                <p style={{ fontSize: '0.62rem', color: '#E53935', marginBottom: '1rem', letterSpacing: '0.04em' }}>
                  {errores.metodoPago}
                </p>
              )}

              {/* Info Yape */}
              {formData.metodoPago === 'yape' && (
                <div
                  className="animate-slide-down"
                  style={{
                    padding: '1rem 1.2rem',
                    border: '1px solid rgba(212,120,138,0.15)',
                    background: 'rgba(250,237,241,0.5)',
                    borderLeft: '2px solid var(--color-kb-rose)',
                    borderRadius: '2px',
                    fontSize: '0.78rem', fontWeight: 300,
                    color: 'var(--color-kb-mauve)',
                    lineHeight: 1.65,
                  }}
                >
                  Yapea al <strong style={{ color: 'var(--color-kb-rose-deep)', fontWeight: 500 }}>+51 906 877 812</strong> a nombre de KB Dresses.
                  El pedido se confirma al recibir el comprobante.
                </div>
              )}
            </section>

            {/* Error servidor */}
            {errorServidor && (
              <div style={{
                padding: '0.9rem 1.2rem',
                border: '1px solid rgba(229,57,53,0.2)',
                borderLeft: '2px solid #E53935',
                background: 'rgba(229,57,53,0.04)',
                fontSize: '0.78rem', fontWeight: 300,
                color: '#C62828', letterSpacing: '0.02em',
              }}>
                {errorServidor}
              </div>
            )}

            {/* Botón confirmar */}
            <button
              type="submit"
              disabled={enviando}
              className="w-full btn-kb-primary"
              style={{ fontSize: '0.68rem', padding: '1.1rem', opacity: enviando ? 0.6 : 1 }}
            >
              <span>
                {enviando ? 'Procesando…' : `Confirmar pedido — S/ ${total.toFixed(2)}`}
              </span>
            </button>
          </form>

          {/* ── RESUMEN DEL PEDIDO ── */}
          <div className="lg:sticky lg:top-28">
            <div style={{
              background: 'white',
              border: '1px solid rgba(212,120,138,0.12)',
              padding: '1.8rem',
            }}>
              {/* Heading */}
              <div className="flex items-center gap-3 mb-6">
                <span style={{ width: '16px', height: '1px', background: 'var(--color-kb-rose)', flexShrink: 0 }} />
                <p className="text-editorial" style={{ color: 'var(--color-kb-charcoal)', fontSize: '0.62rem', letterSpacing: '0.22em' }}>
                  Tu pedido
                </p>
              </div>

              {/* Items */}
              <div className="space-y-4 mb-6" style={{ maxHeight: '340px', overflowY: 'auto' }}>
                {items.map((item) => (
                  <div
                    key={`${item.id}-${item.selectedSize}`}
                    className="flex gap-3"
                  >
                    {/* Miniatura */}
                    <div style={{ width: '52px', height: '64px', flexShrink: 0, overflow: 'hidden', background: 'var(--color-kb-blush)' }}>
                      <img
                        src={item.image || 'https://via.placeholder.com/52x64'}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p style={{ fontSize: '0.82rem', fontWeight: 400, color: 'var(--color-kb-charcoal)', marginBottom: '2px' }}
                        className="line-clamp-1">
                        {item.name}
                      </p>
                      <p style={{ fontSize: '0.65rem', fontWeight: 300, color: 'var(--color-kb-mauve)', letterSpacing: '0.04em', marginBottom: '4px' }}>
                        {item.selectedSize && `Talla ${item.selectedSize} · `}Cant. {item.quantity}
                      </p>
                      <p style={{
                        fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 400,
                        color: 'var(--color-kb-rose-deep)', letterSpacing: '-0.01em',
                      }}>
                        S/ {(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Subtotal / envío / total */}
              <div style={{ borderTop: '1px solid rgba(212,120,138,0.1)', paddingTop: '1.2rem' }}>
                <div className="flex justify-between items-center mb-2">
                  <span style={{ fontSize: '0.75rem', fontWeight: 300, color: 'var(--color-kb-mauve)' }}>Subtotal</span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 300, color: 'var(--color-kb-charcoal)' }}>S/ {total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center mb-5">
                  <span style={{ fontSize: '0.75rem', fontWeight: 300, color: 'var(--color-kb-mauve)' }}>Envío</span>
                  <span style={{ fontSize: '0.72rem', fontWeight: 300, color: '#4CAF50', letterSpacing: '0.04em' }}>Por coordinar</span>
                </div>

                <div style={{ borderTop: '1px solid rgba(212,120,138,0.1)', paddingTop: '1rem' }}
                  className="flex justify-between items-baseline">
                  <span className="text-editorial" style={{ color: 'var(--color-kb-mauve)', fontSize: '0.62rem', letterSpacing: '0.2em' }}>
                    Total
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-display)', fontSize: '1.6rem',
                    fontWeight: 300, letterSpacing: '-0.03em',
                    color: 'var(--color-kb-rose-deep)',
                  }}>
                    S/ {total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Trust badge */}
              <div className="mt-5 flex items-center gap-2" style={{ opacity: 0.55 }}>
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20" style={{ color: 'var(--color-kb-rose)', flexShrink: 0 }}>
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <span style={{ fontSize: '0.6rem', fontWeight: 300, color: 'var(--color-kb-mauve)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  Pago 100% seguro
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckoutPage
