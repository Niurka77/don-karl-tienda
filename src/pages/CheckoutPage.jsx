import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useCartStore from '../store/cartStore'
import { supabase } from '../lib/supabase'

const CheckoutPage = () => {
  const navigate = useNavigate()
  const { items, getTotal, clearCart } = useCartStore()
  const total = getTotal()

  // Estados del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    email: '',
    direccion: '',
    ciudad: '',
    metodoPago: '',
  })

  // Estados de UI
  const [errores, setErrores] = useState({})
  const [enviando, setEnviando] = useState(false)
  const [errorServidor, setErrorServidor] = useState(null)
  const [pedidoExitoso, setPedidoExitoso] = useState(null)

  // Si el carrito está vacío, redirigir
  if (items.length === 0 && !pedidoExitoso) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <svg className="w-20 h-20 text-gray-300 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
        <h2 className="text-2xl font-bold text-gray-700 mb-3">Tu carrito está vacío</h2>
        <p className="text-gray-500 mb-6">Agrega productos antes de finalizar tu compra.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
        >
          ← Ir a la tienda
        </Link>
      </div>
    )
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Limpiar error del campo al escribir
    if (errores[name]) {
      setErrores((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const validarFormulario = () => {
    const nuevosErrores = {}

    if (!formData.nombre.trim()) {
      nuevosErrores.nombre = 'El nombre es obligatorio'
    } else if (formData.nombre.trim().length < 3) {
      nuevosErrores.nombre = 'El nombre debe tener al menos 3 caracteres'
    }

    if (!formData.telefono.trim()) {
      nuevosErrores.telefono = 'El teléfono es obligatorio'
    } else if (!/^\d{9,15}$/.test(formData.telefono.trim())) {
      nuevosErrores.telefono = 'Ingresa un teléfono válido (9 a 15 dígitos)'
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      nuevosErrores.email = 'Ingresa un email válido'
    }

    if (!formData.direccion.trim()) {
      nuevosErrores.direccion = 'La dirección es obligatoria'
    } else if (formData.direccion.trim().length < 5) {
      nuevosErrores.direccion = 'Ingresa una dirección más detallada'
    }

    if (!formData.ciudad.trim()) {
      nuevosErrores.ciudad = 'La ciudad es obligatoria'
    }

    if (!formData.metodoPago) {
      nuevosErrores.metodoPago = 'Selecciona un método de pago'
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
      // Preparar datos del pedido
      const pedido = {
        customer_name: formData.nombre.trim(),
        customer_phone: formData.telefono.trim(),
        customer_email: formData.email.trim() || null,
        customer_address: formData.direccion.trim(),
        customer_city: formData.ciudad.trim(),
        products: items.map((item) => ({
          product_id: item.id,
          name: item.name,
          talla: item.talla,
          cantidad: item.cantidad,
          precio_unitario: item.price,
          subtotal: item.price * item.cantidad,
          sku: item.sku,
        })),
        total: total,
        payment_method: formData.metodoPago,
        status: 'pendiente',
      }

      // Guardar en Supabase
      const { data, error } = await supabase
        .from('orders')
        .insert([pedido])
        .select('id')
        .single()

      if (error) throw error

      // Actualizar stock de cada producto
      for (const item of items) {
        const { error: stockError } = await supabase.rpc('decrementar_stock', {
          product_id: item.id,
          cantidad: item.cantidad,
        })

        if (stockError) {
          console.error('Error al actualizar stock:', stockError)
        }
      }

      // Pedido exitoso
      setPedidoExitoso({
        id: data.id,
        ...pedido,
      })

      // Limpiar carrito
      clearCart()
    } catch (err) {
      console.error('Error al crear pedido:', err)
      setErrorServidor(
        'Ocurrió un error al procesar tu pedido. Por favor, intenta de nuevo.'
      )
    } finally {
      setEnviando(false)
    }
  }

  // Función para generar mensaje de WhatsApp
  const generarMensajeWhatsApp = (pedido) => {
    const productosTexto = pedido.products
      .map(
        (p, i) =>
          `${i + 1}. ${p.name} (Talla: ${p.talla}) x${p.cantidad} - $${p.subtotal.toFixed(2)}`
      )
      .join('\n')

    return encodeURIComponent(
      `🚨 *NUEVO PEDIDO #${pedido.id?.slice(0, 8).toUpperCase()}*\n\n` +
        `👤 *Cliente:* ${pedido.customer_name}\n` +
        `📱 *Teléfono:* ${pedido.customer_phone}\n` +
        `📍 *Dirección:* ${pedido.customer_address}\n` +
        `🏙️ *Ciudad:* ${pedido.customer_city}\n` +
        `💳 *Pago:* ${pedido.payment_method === 'yape' ? 'Yape' : pedido.payment_method === 'plin' ? 'Plin' : 'Tarjeta'}\n\n` +
        `📦 *Productos:*\n${productosTexto}\n\n` +
        `💰 *TOTAL: $${pedido.total.toFixed(2)}*`
    )
  }

  // Si el pedido fue exitoso, mostrar confirmación
  if (pedidoExitoso) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-2">¡Pedido confirmado!</h2>
          <p className="text-gray-500 mb-6">
            Tu pedido <span className="font-mono font-bold text-gray-700">#{pedidoExitoso.id?.slice(0, 8).toUpperCase()}</span> ha sido registrado exitosamente.
          </p>

          {/* Resumen */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left space-y-2">
            <p className="text-sm"><span className="font-semibold">Cliente:</span> {pedidoExitoso.customer_name}</p>
            <p className="text-sm"><span className="font-semibold">Teléfono:</span> {pedidoExitoso.customer_phone}</p>
            <p className="text-sm"><span className="font-semibold">Dirección:</span> {pedidoExitoso.customer_address}, {pedidoExitoso.customer_city}</p>
            <p className="text-sm"><span className="font-semibold">Pago:</span> {pedidoExitoso.payment_method === 'yape' ? 'Yape' : pedidoExitoso.payment_method === 'plin' ? 'Plin' : 'Tarjeta'}</p>
            <p className="text-sm font-bold text-lg pt-2 border-t border-gray-200">
              Total: ${pedidoExitoso.total.toFixed(2)}
            </p>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href={`https://wa.me/51${pedidoExitoso.customer_phone}?text=${generarMensajeWhatsApp(pedidoExitoso)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Enviar por WhatsApp
            </a>

            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
            >
              ← Seguir comprando
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">Finalizar compra</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulario */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
          {/* Datos del cliente */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Datos de contacto
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre completo *
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  placeholder="María García"
                  className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all ${
                    errores.nombre ? 'border-red-400 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {errores.nombre && (
                  <p className="mt-1 text-xs text-red-500">{errores.nombre}</p>
                )}
              </div>

              {/* Teléfono */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono *
                </label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  placeholder="987654321"
                  className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all ${
                    errores.telefono ? 'border-red-400 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {errores.telefono && (
                  <p className="mt-1 text-xs text-red-500">{errores.telefono}</p>
                )}
              </div>

              {/* Email */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email (opcional)
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="maria@email.com"
                  className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all ${
                    errores.email ? 'border-red-400 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {errores.email && (
                  <p className="mt-1 text-xs text-red-500">{errores.email}</p>
                )}
              </div>
            </div>
          </div>

          {/* Dirección de envío */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Dirección de envío
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Dirección */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección *
                </label>
                <input
                  type="text"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleChange}
                  placeholder="Av. Balta 456, Departamento 302"
                  className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all ${
                    errores.direccion ? 'border-red-400 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {errores.direccion && (
                  <p className="mt-1 text-xs text-red-500">{errores.direccion}</p>
                )}
              </div>

              {/* Ciudad */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ciudad *
                </label>
                <input
                  type="text"
                  name="ciudad"
                  value={formData.ciudad}
                  onChange={handleChange}
                  placeholder="Chiclayo"
                  className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all ${
                    errores.ciudad ? 'border-red-400 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {errores.ciudad && (
                  <p className="mt-1 text-xs text-red-500">{errores.ciudad}</p>
                )}
              </div>
            </div>
          </div>

          {/* Método de pago */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Método de pago
            </h2>

            {errores.metodoPago && (
              <p className="mb-3 text-xs text-red-500">{errores.metodoPago}</p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { value: 'yape', label: 'Yape', color: 'bg-purple-600' },
                { value: 'plin', label: 'Plin', color: 'bg-blue-600' },
                { value: 'tarjeta', label: 'Tarjeta', color: 'bg-gray-800' },
              ].map((metodo) => (
                <button
                  key={metodo.value}
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, metodoPago: metodo.value })
                  }
                  className={`p-4 rounded-lg border-2 text-center transition-all ${
                    formData.metodoPago === metodo.value
                      ? 'border-black bg-gray-50'
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <span
                    className={`inline-block w-3 h-3 rounded-full mr-2 ${metodo.color}`}
                  ></span>
                  <span className="font-medium text-sm">{metodo.label}</span>
                </button>
              ))}
            </div>

            {/* Instrucciones de pago */}
            {formData.metodoPago === 'yape' && (
              <div className="mt-4 p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-800">
                  📱 Al confirmar, verás los datos para realizar el Yape.
                </p>
              </div>
            )}
            {formData.metodoPago === 'plin' && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  📱 Al confirmar, verás los datos para realizar el Plin.
                </p>
              </div>
            )}
            {formData.metodoPago === 'tarjeta' && (
              <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                <p className="text-sm text-gray-700">
                  💳 Serás redirigido a la pasarela de pago seguro.
                </p>
              </div>
            )}
          </div>

          {/* Error del servidor */}
          {errorServidor && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{errorServidor}</p>
            </div>
          )}

          {/* Botón enviar (mobile: sticky abajo) */}
          <div className="lg:hidden">
            <button
              type="submit"
              disabled={enviando}
              className="w-full py-3.5 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {enviando ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Procesando...
                </span>
              ) : (
                `Confirmar pedido - $${total.toFixed(2)}`
              )}
            </button>
          </div>
        </form>

        {/* Resumen del pedido (sidebar desktop) */}
        <div className="hidden lg:block">
          <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Tu pedido
            </h2>

            <div className="space-y-3 mb-4 max-h-80 overflow-y-auto">
              {items.map((item) => (
                <div
                  key={`${item.id}-${item.talla}`}
                  className="flex gap-3 text-sm"
                >
                  <div className="w-12 h-14 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                    <img
                      src={item.image_url || 'https://via.placeholder.com/48x60'}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 truncate">
                      {item.name}
                    </p>
                    <p className="text-gray-500 text-xs">
                      Talla: {item.talla} × {item.cantidad}
                    </p>
                    <p className="font-medium text-gray-800">
                      ${(item.price * item.cantidad).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-medium text-gray-600">Total</span>
                <span className="text-xl font-bold text-gray-800">
                  ${total.toFixed(2)}
                </span>
              </div>

              <button
                type="submit"
                onClick={handleSubmit}
                disabled={enviando}
                className="w-full py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {enviando ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Procesando...
                  </span>
                ) : (
                  `Confirmar pedido - $${total.toFixed(2)}`
                )}
              </button>

              <Link
                to="/"
                className="block text-center mt-3 text-sm text-gray-500 hover:text-gray-800 transition-colors"
              >
                ← Seguir comprando
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckoutPage