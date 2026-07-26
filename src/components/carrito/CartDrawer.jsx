import { useNavigate } from 'react-router-dom'
import useCartStore from '../../store/cartStore'
import ImageWithFallback from '../ui/ImageWithFallback'
import { CURRENCY, WHATSAPP_PHONE } from '../../lib/constants'

const CartDrawer = () => {
  const navigate = useNavigate()
  const { 
    isCartOpen, 
    toggleCart, 
    items, 
    removeItem, 
    updateQuantity, 
    getTotalPrice,
    getItemCount,
    clearCart
  } = useCartStore()

  const totalItems = getItemCount()
  const totalPrice = getTotalPrice()

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
      `💰 Total: ${CURRENCY}${totalPrice.toFixed(2)}`,
      ``,
      `¿Cómo coordino el pago?`,
    ].join('\n')
  }

  const handleWhatsApp = () => {
    if (items.length === 0) return
    const msg = buildWhatsAppMessage()
    const url = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(msg)}`

    if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      window.location.href = url
    } else {
      window.open(url, '_blank')
    }
  }

  const handleClearCart = () => {
    if (window.confirm('¿Estás seguro de que deseas vaciar tu bolsa?')) {
      clearCart()
    }
  }

  if (!isCartOpen) return null

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity duration-500 animate-fade-in"
        onClick={toggleCart}
        aria-hidden="true"
      />
      
      {/* Drawer */}
      <div 
        className="fixed right-0 top-0 h-full w-full max-w-md bg-white/95 backdrop-blur-xl shadow-2xl z-50 flex flex-col animate-slide-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
      >
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/50">
          <div>
            <h2 id="cart-title" className="text-xl font-serif font-semibold text-foreground">
              Mi bolsa
            </h2>
            <p className="text-[11px] font-mono text-muted-foreground mt-0.5">
              {totalItems} {totalItems === 1 ? 'artículo' : 'artículos'}
            </p>
          </div>
          <button
            onClick={toggleCart}
            className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
            aria-label="Cerrar carrito"
          >
            <svg className="w-4 h-4 text-foreground/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Contenido */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-muted-foreground/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <p className="text-foreground/60 font-medium text-sm mb-6">Tu bolsa está vacía</p>
            <button
              onClick={toggleCart}
              className="text-xs font-mono border border-foreground/20 px-6 py-2 rounded-full hover:bg-foreground hover:text-background transition-all"
            >
              Seguir comprando
            </button>
          </div>
        ) : (
          <>
            {/* Lista de productos */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {items.map((item, index) => {
                const code = item.sku ? item.sku.replace(/[^0-9]/g, '') : ''
                return (
                  <div 
                    key={`${item.id}-${item.selectedSize}-${index}`} 
                    className="flex gap-4 group"
                  >
                    {/* Imagen */}
                    <div className="flex-shrink-0">
                      <ImageWithFallback
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-24 object-cover rounded-xl shadow-md"
                        loading="lazy"
                      />
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          {item.brand && (
                            <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider">
                              {item.brand}
                            </p>
                          )}
                          <h3 className="font-medium text-foreground text-sm line-clamp-2 leading-tight mt-0.5">
                            {item.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            {code && (
                              <span style={{
                                background: 'linear-gradient(135deg, #FF5C8A, #FF8E72)',
                                color: '#fff', fontSize: '0.55rem', fontWeight: 700,
                                padding: '0.12rem 0.45rem', borderRadius: '2px',
                              }}>
                                Código: {code}
                              </span>
                            )}
                            {item.selectedSize && (
                              <p className="text-[10px] text-muted-foreground">
                                Talla: <span className="text-foreground/80">{item.selectedSize}</span>
                              </p>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => removeItem(item.id, item.selectedSize)}
                          className="text-muted-foreground/40 hover:text-red-500 transition p-1"
                          aria-label={`Eliminar ${item.name} del carrito`}
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                      
                      {/* Precio y cantidad */}
                      <div className="flex items-center justify-between mt-3">
                        <span className="font-semibold text-foreground text-sm">
                          {CURRENCY} {(item.price * item.quantity).toFixed(2)}
                        </span>
                        
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1), item.selectedSize)}
                            className="w-6 h-6 rounded-full border border-border flex items-center justify-center text-foreground/60 hover:border-foreground/30 hover:text-foreground transition-all"
                            aria-label={`Disminuir cantidad de ${item.name}`}
                          >
                            -
                          </button>
                          <span className="w-6 text-center text-xs font-medium text-foreground">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, Math.min(item.stock ?? 99, item.quantity + 1), item.selectedSize)}
                            className="w-6 h-6 rounded-full border border-border flex items-center justify-center text-foreground/60 hover:border-foreground/30 hover:text-foreground transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label={`Aumentar cantidad de ${item.name}`}
                            disabled={item.stock != null && item.quantity >= item.stock}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Footer */}
            <div className="border-t border-border/50 p-6 space-y-4 bg-white/50 backdrop-blur-sm">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{CURRENCY} {totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs font-mono text-muted-foreground">
                  <span>Envío</span>
                  <span className="text-foreground/60">Por coordinar</span>
                </div>
                <div className="flex justify-between text-base font-semibold pt-2 border-t border-border/30">
                  <span>Total</span>
                  <span className="text-foreground">{CURRENCY} {totalPrice.toFixed(2)}</span>
                </div>
              </div>
              
              {/* Botón WhatsApp */}
              <button
                onClick={handleWhatsApp}
                className="w-full py-3.5 rounded-full text-sm font-medium tracking-wide transition-all transform hover:-translate-y-0.5 shadow-md flex items-center justify-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                  color: '#fff',
                }}
                disabled={items.length === 0}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Cotizar por WhatsApp
              </button>
              
              <button
                onClick={handleClearCart}
                className="w-full text-[11px] font-mono text-muted-foreground hover:text-red-500 transition-colors py-1"
                aria-label="Vaciar bolsa de compras"
              >
                Vaciar bolsa
              </button>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-slide-in {
          animation: slideIn 0.4s cubic-bezier(0.2, 0.9, 0.4, 1.1);
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </>
  )
}

export default CartDrawer
