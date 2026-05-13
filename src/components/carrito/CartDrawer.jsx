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
    // ✅ CORREGIDO: Usar navigate en lugar de window.location
    setTimeout(() => navigate('/checkout'), 150)
  }

  if (!isCartOpen) return null

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity animate-fade-in"
        onClick={toggleCart}
        aria-hidden="true"
      />
      
      {/* Drawer */}
      <div 
        className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col animate-slide-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
      >
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-gradient-to-r from-kb-pink/5 to-white">
          <div>
            <h2 id="cart-title" className="text-xl font-bold text-gray-800">
              Mi Carrito
            </h2>
            <p className="text-sm text-gray-500">{totalItems} {totalItems === 1 ? 'producto' : 'productos'}</p>
          </div>
          <button
            onClick={toggleCart}
            className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition focus:outline-none focus:ring-2 focus:ring-kb-pink"
            aria-label="Cerrar carrito"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Contenido */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <p className="text-gray-600 font-medium text-lg mb-2">Tu carrito está vacío</p>
            <p className="text-gray-400 text-sm mb-6">¡Agrega productos increíbles!</p>
            <button
              onClick={toggleCart}
              className="bg-kb-pink-dark text-white px-8 py-3 rounded-full hover:bg-kb-pink transition shadow-lg font-medium"
            >
              Seguir comprando
            </button>
          </div>
        ) : (
          <>
            {/* Lista de productos */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {items.map((item, index) => (
                <div 
                  key={`${item.id}-${item.selectedSize}-${index}`} 
                  className="flex gap-4 bg-gray-50 rounded-xl p-4 border border-gray-100 hover:shadow-md transition"
                >
                  {/* Imagen */}
                  <div className="flex-shrink-0">
                    <img
                      src={item.image || 'https://via.placeholder.com/100x100?text=KB'}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg"
                      loading="lazy"
                    />
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        {item.brand && (
                          <p className="text-xs text-kb-pink-dark font-semibold uppercase tracking-wide">
                            {item.brand}
                          </p>
                        )}
                        <h3 className="font-medium text-gray-800 text-sm line-clamp-2 leading-tight">
                          {item.name}
                        </h3>
                        {item.sku && (
                          <p className="text-xs text-gray-400 mt-1">Cód: {item.sku}</p>
                        )}
                        {item.selectedSize && (
                          <p className="text-xs text-gray-500 mt-1 font-medium">
                            Talla: <span className="text-gray-700">{item.selectedSize}</span>
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => removeItem(item.id, item.selectedSize)}
                        className="flex-shrink-0 text-gray-400 hover:text-red-500 transition p-1 hover:bg-red-50 rounded focus:outline-none focus:ring-2 focus:ring-red-400"
                        aria-label={`Eliminar ${item.name} del carrito`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    
                    {/* Precio y cantidad */}
                    <div className="flex items-center justify-between mt-3">
                      <span className="font-bold text-kb-pink-dark text-base">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                      
                      <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200">
                        <button
                          onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1), item.selectedSize)}
                          className="w-7 h-7 flex items-center justify-center text-gray-600 hover:text-kb-pink-dark hover:bg-kb-pink/5 transition rounded-l-lg focus:outline-none focus:ring-2 focus:ring-kb-pink"
                          aria-label="Disminuir cantidad"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-sm font-medium text-gray-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1, item.selectedSize)}
                          className="w-7 h-7 flex items-center justify-center text-gray-600 hover:text-kb-pink-dark hover:bg-kb-pink/5 transition rounded-r-lg focus:outline-none focus:ring-2 focus:ring-kb-pink"
                          aria-label="Aumentar cantidad"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer con total y checkout */}
            <div className="border-t border-gray-200 p-5 space-y-4 bg-gradient-to-r from-kb-pink/5 to-white">
              <div className="space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span className="font-medium">${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Envío:</span>
                  <span className="text-green-600 font-medium">Calculado al finalizar</span>
                </div>
                <div className="flex justify-between text-xl font-bold pt-2 border-t border-gray-200">
                  <span>Total:</span>
                  <span className="text-kb-pink-dark">${totalPrice.toFixed(2)}</span>
                </div>
              </div>
              
              <button
                onClick={handleCheckout}
                className="w-full bg-kb-pink-dark text-white py-4 rounded-full font-bold hover:bg-kb-pink transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
              >
                Proceder al pago →
              </button>
              
              <button
                onClick={clearCart}
                className="w-full text-sm text-gray-500 hover:text-red-600 transition font-medium py-2"
              >
                Vaciar carrito
              </button>
            </div>
          </>
        )}
      </div>

      {/* Animaciones CSS */}
      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </>
  )
}

export default CartDrawer