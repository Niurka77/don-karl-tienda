import { useNavigate } from 'react-router-dom'
import useCartStore from '../../store/cartStore'

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

  const handleCheckout = () => {
    toggleCart()
    setTimeout(() => navigate('/checkout'), 200)
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
              {items.map((item, index) => (
                <div 
                  key={`${item.id}-${item.selectedSize}-${index}`} 
                  className="flex gap-4 group"
                >
                  {/* Imagen - CORREGIDO: uso item.image, no image_url */}
                  <div className="flex-shrink-0">
                    <img
                      src={item.image || 'https://via.placeholder.com/80x100?text=KB'}
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
                        {/* CORREGIDO: uso selectedSize, no talla */}
                        {item.selectedSize && (
                          <p className="text-[10px] text-muted-foreground mt-1">
                            Talla: <span className="text-foreground/80">{item.selectedSize}</span>
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => removeItem(item.id, item.selectedSize)}
                        className="text-muted-foreground/40 hover:text-red-500 transition p-1"
                        aria-label="Eliminar"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    
                    {/* Precio y cantidad */}
                    <div className="flex items-center justify-between mt-3">
                      <span className="font-semibold text-foreground text-sm">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                      
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1), item.selectedSize)}
                          className="w-6 h-6 rounded-full border border-border flex items-center justify-center text-foreground/60 hover:border-foreground/30 hover:text-foreground transition-all"
                          aria-label="Disminuir"
                        >
                          -
                        </button>
                        <span className="w-6 text-center text-xs font-medium text-foreground">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1, item.selectedSize)}
                          className="w-6 h-6 rounded-full border border-border flex items-center justify-center text-foreground/60 hover:border-foreground/30 hover:text-foreground transition-all"
                          aria-label="Aumentar"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-border/50 p-6 space-y-4 bg-white/50 backdrop-blur-sm">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono text-muted-foreground">
                  <span>Subtotal</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs font-mono text-muted-foreground">
                  <span>Envío</span>
                  <span className="text-foreground/60">Calculado al finalizar</span>
                </div>
                <div className="flex justify-between text-base font-semibold pt-2 border-t border-border/30">
                  <span>Total</span>
                  <span className="text-foreground">${totalPrice.toFixed(2)}</span>
                </div>
              </div>
              
              <button
                onClick={handleCheckout}
                className="w-full bg-foreground text-background py-3.5 rounded-full text-sm font-medium tracking-wide hover:bg-foreground/90 transition-all transform hover:-translate-y-0.5 shadow-md"
              >
                Finalizar compra →
              </button>
              
              <button
                onClick={clearCart}
                className="w-full text-[11px] font-mono text-muted-foreground hover:text-foreground/60 transition-colors py-1"
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