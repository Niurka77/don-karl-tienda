import { Link } from 'react-router-dom'

const ProductCard = ({ product }) => {
  if (!product) return null

  const {
    id,
    name,
    price_original,
    discount_percent,
    price_final,
    image_url,
    is_new,
    stock,
  } = product

  const tieneDescuento = discount_percent > 0
  const sinStock = stock <= 0

  return (
    <Link
      to={`/producto/${id}`}
      className="group relative bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden block"
    >
      {/* Contenedor de imagen */}
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
        <img
          src={image_url || 'https://via.placeholder.com/400x500?text=Sin+Imagen'}
          alt={name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {is_new && !sinStock && (
          <span className="absolute top-2 left-2 bg-black text-white text-xs font-semibold px-2 py-1 rounded">
            NUEVO
          </span>
        )}

        {tieneDescuento && !sinStock && (
          <span className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
            -{discount_percent}%
          </span>
        )}

        {sinStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-bold text-lg tracking-wider uppercase">
              Agotado
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-800 truncate">
          {name}
        </h3>
        <div className="mt-2 flex items-center gap-2">
          {tieneDescuento ? (
            <>
              <span className="text-lg font-bold text-red-600">
                ${price_final?.toFixed(2)}
              </span>
              <span className="text-sm text-gray-400 line-through">
                ${price_original?.toFixed(2)}
              </span>
            </>
          ) : (
            <span className="text-lg font-bold text-gray-800">
              ${price_original?.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

export default ProductCard