import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useCartStore from '../store/cartStore'
import { supabase } from '../lib/supabase'

const CheckoutPage = () => {
  const navigate = useNavigate()
  const { items, getTotalPrice, clearCart } = useCartStore()
  const total = getTotalPrice()

  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    email: '',
    direccion: '',
    ciudad: '',
    metodoPago: '',
  })

  const [errores, setErrores] = useState({})
  const [enviando, setEnviando] = useState(false)
  const [errorServidor, setErrorServidor] = useState(null)
  const [pedidoExitoso, setPedidoExitoso] = useState(null)

  // ✅ VALIDADORES
  const validarEmail = (email) => {
    if (!email) return true // Es opcional
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  const validarTelefono = (telefono) => {
    // Formato peruano: 9 dígitos empezando con 9
    const re = /^9\d{8}$/
    return re.test(telefono.replace(/\D/g, ''))
  }

  if (items.length === 0 && !pedidoExitoso) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-32 text-center">
        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
        <p className="text-foreground/60 text-sm mb-6">Tu bolsa está vacía</p>
        <Link to="/" className="text-xs font-mono border border-foreground/20 px-6 py-2 rounded-full hover:bg-foreground hover:text-background transition-all">
          ← Ir a la tienda
        </Link>
      </div>
    )
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errores[name]) setErrores((prev) => ({ ...prev, [name]: '' }))
    // ✅ Limpiar error de servidor cuando el usuario modifica cualquier campo
    if (errorServidor) setErrorServidor(null)
  }

  const validarFormulario = () => {
    const nuevosErrores = {}
    if (!formData.nombre.trim()) nuevosErrores.nombre = 'Requerido'
    
    if (!formData.telefono.trim()) {
      nuevosErrores.telefono = 'Requerido'
    } else if (!validarTelefono(formData.telefono)) {
      nuevosErrores.telefono = 'Ingrese un número válido (ej: 999999999)'
    }
    
    if (!formData.direccion.trim()) nuevosErrores.direccion = 'Requerido'
    if (!formData.ciudad.trim()) nuevosErrores.ciudad = 'Requerido'
    if (!formData.metodoPago) nuevosErrores.metodoPago = 'Selecciona un método'
    
    // ✅ Validar email si está presente
    if (formData.email && !validarEmail(formData.email)) {
      nuevosErrores.email = 'Formato de email inválido'
    }
    
    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorServidor(null)
    if (!validarFormulario()) return
    setEnviando(true)

    try {
      const pedido = {
        customer_name: formData.nombre.trim(),
        customer_phone: formData.telefono.trim(),
        customer_email: formData.email.trim() || null,
        customer_address: formData.direccion.trim(),
        customer_city: formData.ciudad.trim(),
        products: items.map((item) => ({
          product_id: item.id,
          name: item.name,
          talla: item.selectedSize,
          cantidad: item.quantity,
          precio_unitario: item.price,
          subtotal: item.price * item.quantity,
          sku: item.sku,
        })),
        total: total,
        payment_method: formData.metodoPago,
        status: 'pendiente',
      }

      const { data, error } = await supabase
        .from('orders')
        .insert([pedido])
        .select('id')
        .single()

      if (error) throw error

      for (const item of items) {
        await supabase.rpc('decrementar_stock', {
          product_id: item.id,
          cantidad: item.quantity,
        })
      }

      setPedidoExitoso({ id: data.id, ...pedido })
      clearCart()
    } catch (err) {
      console.error(err)
      setErrorServidor('Error al procesar el pedido. Intenta nuevamente.')
    } finally {
      setEnviando(false)
    }
  }

  if (pedidoExitoso) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20">
        <div className="text-center">
          <div className="w-16 h-16 bg-foreground/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-serif mb-2">Pedido confirmado</h2>
          <p className="text-muted-foreground text-sm mb-6">
            #{pedidoExitoso.id?.slice(0, 8).toUpperCase()}
          </p>
          <Link to="/" className="text-xs font-mono border border-foreground/20 px-6 py-2 rounded-full hover:bg-foreground hover:text-background transition-all">
            ← Seguir comprando
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 md:py-20">
      <h1 className="text-3xl font-serif mb-12">Checkout</h1>

      <div className="grid lg:grid-cols-3 gap-12">
        {/* Formulario */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-10">
          {/* Datos */}
          <div className="space-y-6">
            <h2 className="text-sm font-mono tracking-wider text-foreground/60 uppercase">Contacto</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  placeholder="Nombre completo"
                  className={`w-full bg-transparent border-b ${errores.nombre ? 'border-red-500' : 'border-border'} py-2 text-sm focus:outline-none focus:border-foreground transition-colors`}
                />
                {errores.nombre && <p className="text-[10px] text-red-500 mt-1">{errores.nombre}</p>}
              </div>
              <div>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  placeholder="Teléfono"
                  className={`w-full bg-transparent border-b ${errores.telefono ? 'border-red-500' : 'border-border'} py-2 text-sm focus:outline-none focus:border-foreground transition-colors`}
                />
                {errores.telefono && <p className="text-[10px] text-red-500 mt-1">{errores.telefono}</p>}
              </div>
              <div className="md:col-span-2">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email (opcional)"
                  className={`w-full bg-transparent border-b ${errores.email ? 'border-red-500' : 'border-border'} py-2 text-sm focus:outline-none focus:border-foreground transition-colors`}
                />
                {errores.email && <p className="text-[10px] text-red-500 mt-1">{errores.email}</p>}
              </div>
            </div>
          </div>

          {/* Envío */}
          <div className="space-y-6">
            <h2 className="text-sm font-mono tracking-wider text-foreground/60 uppercase">Envío</h2>
            <div className="space-y-6">
              <div>
                <input
                  type="text"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleChange}
                  placeholder="Dirección"
                  className={`w-full bg-transparent border-b ${errores.direccion ? 'border-red-500' : 'border-border'} py-2 text-sm focus:outline-none focus:border-foreground transition-colors`}
                />
                {errores.direccion && <p className="text-[10px] text-red-500 mt-1">{errores.direccion}</p>}
              </div>
              <div>
                <input
                  type="text"
                  name="ciudad"
                  value={formData.ciudad}
                  onChange={handleChange}
                  placeholder="Ciudad"
                  className={`w-full bg-transparent border-b ${errores.ciudad ? 'border-red-500' : 'border-border'} py-2 text-sm focus:outline-none focus:border-foreground transition-colors`}
                />
                {errores.ciudad && <p className="text-[10px] text-red-500 mt-1">{errores.ciudad}</p>}
              </div>
            </div>
          </div>

          {/* Pago */}
          <div className="space-y-6">
            <h2 className="text-sm font-mono tracking-wider text-foreground/60 uppercase">Pago</h2>
            <div className="grid grid-cols-3 gap-3">
              {['yape', 'plin', 'tarjeta'].map((metodo) => (
                <button
                  key={metodo}
                  type="button"
                  onClick={() => setFormData({ ...formData, metodoPago: metodo })}
                  className={`py-3 text-sm font-mono border rounded-full transition-all ${
                    formData.metodoPago === metodo
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-border text-foreground/60 hover:border-foreground/30'
                  }`}
                >
                  {metodo.toUpperCase()}
                </button>
              ))}
            </div>
            {errores.metodoPago && <p className="text-[10px] text-red-500">{errores.metodoPago}</p>}
            
            {formData.metodoPago === 'yape' && (
              <div className="mt-4 p-4 bg-muted/50 rounded-2xl text-xs font-mono text-muted-foreground">
                📱 Yape al 999 999 999 (KB Dresses). El pedido se confirma al recibir el comprobante oficial.
              </div>
            )}
          </div>

          {errorServidor && (
            <div className="p-4 bg-red-50/50 border border-red-200 rounded-2xl text-xs text-red-600">
              {errorServidor}
            </div>
          )}

          <button
            type="submit"
            disabled={enviando}
            className="w-full py-4 bg-foreground text-background rounded-full text-sm font-medium tracking-wide hover:bg-foreground/90 transition-all disabled:opacity-50"
          >
            {enviando ? 'Procesando...' : `Confirmar pedido — $${total.toFixed(2)}`}
          </button>
        </form>

        {/* Resumen */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-muted/30 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-mono tracking-wider uppercase">Tu pedido</h3>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {items.map((item) => (
                <div key={`${item.id}-${item.selectedSize}`} className="flex gap-3 text-sm">
                  <div className="w-12 h-14 flex-shrink-0 bg-muted rounded-lg overflow-hidden">
                    {/* ✅ CORREGIDO: item.image en lugar de item.image_url */}
                    <img 
                      src={item.image || 'https://via.placeholder.com/48x60'} 
                      alt={item.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground line-clamp-1">{item.name}</p>
                    <p className="text-[10px] text-muted-foreground">Talla: {item.selectedSize} × {item.quantity}</p>
                    <p className="text-xs font-medium mt-1">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-border pt-4 text-right">
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-xl font-semibold">${total.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckoutPage