import { Link } from 'react-router-dom'
import useCartStore from '../../store/cartStore'

const CartDrawer = () => {
  const { items, isOpen, closeCart, removeItem, updateQuantity, getTotal } = useCartStore()

  const total = getTotal()

  if (!isOpen) return null

  return (
    <>
      {/* Overlay oscuro */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={closeCart}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-800">
            Carrito ({items.length})
          </h2>
          <button
            onClick={closeCart}
            className="text-gray-500 hover:text-gray-800 transition-colors p-1"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <p className="text-gray-500 font-medium">Tu carrito está vacío</p>
              <button
                onClick={closeCart}
                className="mt-2 text-sm text-blue-600 hover:underline"
              >
                Seguir comprando
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={`${item.id}-${item.talla}`}
                  className="flex gap-4 bg-gray-50 rounded-lg p-3"
                >
                  {/* Imagen */}
                  <div className="w-20 h-24 flex-shrink-0 bg-gray-200 rounded overflow-hidden">
                    <img
                      src={item.image_url || 'https://via.placeholder.com/80x100?text=Sin+Imagen'}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-800 truncate">
                      {item.name}
                    </h4>
                    {item.talla && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        Talla: {item.talla}
                      </p>
                    )}
                    <p className="text-sm font-bold text-gray-800 mt-1">
                      ${item.price?.toFixed(2)}
                    </p>

                    {/* Controles de cantidad */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-gray-300 rounded">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.talla, item.cantidad - 1)
                          }
                          disabled={item.cantidad <= 1}
                          className="px-2.5 py-1 text-xs text-gray-600 hover:text-black hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          −
                        </button>
                        <span className="px-3 py-1 text-xs font-medium text-gray-800 min-w-[32px] text-center">
                          {item.cantidad}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.talla, item.cantidad + 1)
                          }
                          disabled={item.cantidad >= item.stock}
                          className="px-2.5 py-1 text-xs text-gray-600 hover:text-black hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.id, item.talla)}
                        className="text-red-500 hover:text-red-700 text-xs font-medium transition-colors"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-200 px-6 py-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Total</span>
              <span className="text-xl font-bold text-gray-800">
                ${total.toFixed(2)}
              </span>
            </div>
            <Link
              to="/checkout"
              onClick={closeCart}
              className="block w-full text-center py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
            >
              Finalizar compra
            </Link>
          </div>
        )}
      </div>

      {/* Animación */}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </>
  )
}

export default CartDrawer