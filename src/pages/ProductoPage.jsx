import useCartStore from '../store/cartStore'
import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import ProductCard from '../components/producto/ProductCard'

const ProductoPage = () => {
  const { id } = useParams()
  const addItem = useCartStore((state) => state.addItem)
  const [producto, setProducto] = useState(null)
  const [relacionados, setRelacionados] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [tallaSeleccionada, setTallaSeleccionada] = useState('')
  const [cantidad, setCantidad] = useState(1)
  const [imagenError, setImagenError] = useState(false)

  useEffect(() => {
    if (id) {
      cargarProducto()
    }
  }, [id])

  const cargarProducto = async () => {
    try {
      setCargando(true)
      setError(null)
      setTallaSeleccionada('')
      setCantidad(1)

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      if (!data) throw new Error('Producto no encontrado')

      setProducto(data)

      // Cargar productos relacionados (misma categoría, excluyendo actual)
      const { data: relacionadosData } = await supabase
        .from('products')
        .select('*')
        .eq('category', data.category)
        .neq('id', id)
        .limit(4)

      setRelacionados(relacionadosData || [])
    } catch (err) {
      console.error('Error al cargar producto:', err)
      setError(err.message || 'Producto no encontrado')
    } finally {
      setCargando(false)
    }
  }

  // Estados de carga y error
  if (cargando) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex justify-center">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
      </div>
    )
  }

  if (error || !producto) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">Producto no encontrado</h2>
        <Link to="/" className="text-blue-600 hover:underline">
          ← Volver a la tienda
        </Link>
      </div>
    )
  }

  const {
    name,
    price_original,
    discount_percent,
    price_final,
    image_url,
    sku,
    description,
    stock,
    sizes_available,
    is_new,
    category,
    color,
    brand,
  } = producto

  const tieneDescuento = discount_percent > 0
  const sinStock = stock <= 0
  const tallas = Array.isArray(sizes_available) ? sizes_available : []

  const imagenMostrar = imagenError
    ? 'https://via.placeholder.com/600x750?text=Imagen+no+disponible'
    : image_url

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-gray-800 transition-colors">Inicio</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800">{name}</span>
      </nav>

      {/* Producto principal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Imagen */}
        <div className="bg-gray-100 rounded-lg overflow-hidden">
          <img
            src={imagenMostrar}
            alt={name}
            className="w-full h-auto object-cover aspect-[4/5]"
            onError={() => setImagenError(true)}
          />
        </div>

        {/* Información */}
        <div className="flex flex-col">
          {/* Etiquetas */}
          <div className="flex gap-2 mb-3">
            {is_new && (
              <span className="bg-black text-white text-xs font-semibold px-3 py-1 rounded">
                NUEVO
              </span>
            )}
            {tieneDescuento && (
              <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded">
                -{discount_percent}%
              </span>
            )}
            {sinStock && (
              <span className="bg-gray-500 text-white text-xs font-bold px-3 py-1 rounded">
                AGOTADO
              </span>
            )}
          </div>

          {/* Nombre */}
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
            {name}
          </h1>

          {/* SKU y marca */}
          <div className="text-sm text-gray-500 mb-4 space-y-1">
            {sku && <p>SKU: {sku}</p>}
            {brand && <p>Marca: {brand}</p>}
            {color && <p>Color: {color}</p>}
          </div>

          {/* Precio */}
          <div className="flex items-baseline gap-3 mb-6">
            {tieneDescuento ? (
              <>
                <span className="text-3xl font-bold text-red-600">
                  ${price_final?.toFixed(2)}
                </span>
                <span className="text-xl text-gray-400 line-through">
                  ${price_original?.toFixed(2)}
                </span>
                <span className="text-sm text-green-600 font-medium">
                  Ahorras ${(price_original - price_final)?.toFixed(2)}
                </span>
              </>
            ) : (
              <span className="text-3xl font-bold text-gray-800">
                ${price_original?.toFixed(2)}
              </span>
            )}
          </div>

          {/* Selector de tallas */}
          {tallas.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-gray-700">
                  Talla
                </label>
                {tallaSeleccionada && (
                  <span className="text-sm text-gray-500">
                    Seleccionada: {tallaSeleccionada}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {tallas.map((talla) => (
                  <button
                    key={talla}
                    onClick={() => setTallaSeleccionada(talla)}
                    disabled={sinStock}
                    className={`
                      px-5 py-2.5 border-2 rounded-lg font-medium text-sm transition-all
                      ${sinStock
                        ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50'
                        : tallaSeleccionada === talla
                          ? 'border-black bg-black text-white'
                          : 'border-gray-300 text-gray-700 hover:border-black'
                      }
                    `}
                  >
                    {talla}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Selector de cantidad */}
          {!sinStock && (
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Cantidad
              </label>
              <div className="flex items-center border-2 border-gray-300 rounded-lg w-fit">
                <button
                  onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                  className="px-4 py-2 text-gray-600 hover:text-black hover:bg-gray-100 transition-colors"
                >
                  −
                </button>
                <span className="px-6 py-2 text-gray-800 font-medium min-w-[60px] text-center">
                  {cantidad}
                </span>
                <button
                  onClick={() => setCantidad(Math.min(stock, cantidad + 1))}
                  className="px-4 py-2 text-gray-600 hover:text-black hover:bg-gray-100 transition-colors"
                >
                  +
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Stock disponible: {stock} unidades
              </p>
            </div>
          )}

          {/* Botón de compra */}
         <button
  onClick={() => {
    addItem(producto, tallaSeleccionada, cantidad)
  }}
  disabled={sinStock || !tallaSeleccionada}
  className={`
    w-full py-3.5 rounded-lg font-semibold text-white transition-all
    ${sinStock || !tallaSeleccionada
      ? 'bg-gray-300 cursor-not-allowed'
      : 'bg-black hover:bg-gray-800 active:scale-[0.98]'
    }
  `}
>
  {sinStock
    ? 'Producto agotado'
    : !tallaSeleccionada
      ? 'Selecciona una talla'
      : 'Agregar al carrito'
  }
</button>

          {/* Descripción */}
          {description && (
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                Descripción
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {description}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Productos relacionados */}
      {relacionados.length > 0 && (
        <section className="mt-16">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">
            También te puede interesar
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {relacionados.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </section>
      )}

      {/* Botón volver */}
      <div className="mt-12 text-center">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors font-medium"
        >
          ← Volver a la tienda
        </Link>
      </div>
    </div>
  )
}

export default ProductoPage