import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import ProductoForm from '../../components/admin/ProductoForm'

const ProductosPage = () => {
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [productoEditar, setProductoEditar] = useState(null)

  useEffect(() => {
    cargarProductos()
  }, [])

  const cargarProductos = async () => {
    try {
      setCargando(true)
      setError(null)
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setProductos(data || [])
    } catch (err) {
      console.error('Error:', err)
      setError('No se pudieron cargar los productos')
    } finally {
      setCargando(false)
    }
  }

  const handleDelete = async (id, imageUrl) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return

    try {
      // Intentar eliminar imagen del storage
      if (imageUrl) {
        const urlParts = imageUrl.split('/productos/')
        if (urlParts.length > 1) {
          const filePath = urlParts[1]
          await supabase.storage.from('productos').remove([filePath])
        }
      }

      const { error } = await supabase.from('products').delete().eq('id', id)
      if (error) throw error

      setProductos(productos.filter((p) => p.id !== id))
    } catch (err) {
      console.error('Error al eliminar:', err)
      alert('Error al eliminar el producto')
    }
  }

  const handleNuevoProducto = () => {
    setProductoEditar(null)
    setMostrarFormulario(true)
  }

  const handleEditar = (producto) => {
    setProductoEditar(producto)
    setMostrarFormulario(true)
  }

  const handleGuardar = (productoGuardado) => {
    if (productoEditar) {
      // Actualizar en la lista
      setProductos(
        productos.map((p) =>
          p.id === productoGuardado.id ? productoGuardado : p
        )
      )
    } else {
      // Agregar al inicio
      setProductos([productoGuardado, ...productos])
    }
    setMostrarFormulario(false)
    setProductoEditar(null)
  }

  if (mostrarFormulario) {
    return (
      <div>
        <button
          onClick={() => {
            setMostrarFormulario(false)
            setProductoEditar(null)
          }}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors text-sm font-medium"
        >
          ← Volver a productos
        </button>
        <ProductoForm
          producto={productoEditar}
          onGuardar={handleGuardar}
          onCancelar={() => {
            setMostrarFormulario(false)
            setProductoEditar(null)
          }}
        />
      </div>
    )
  }

  if (cargando) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Productos</h1>
        <button
          onClick={handleNuevoProducto}
          className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          + Nuevo producto
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {productos.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <p className="text-gray-500 mb-3">No hay productos aún</p>
          <button
            onClick={handleNuevoProducto}
            className="text-black font-medium hover:underline text-sm"
          >
            Crear primer producto →
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Producto
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                    SKU
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Categoría
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Precio
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Stock
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {productos.map((producto) => (
                  <tr key={producto.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            producto.image_url ||
                            'https://via.placeholder.com/40'
                          }
                          alt={producto.name}
                          className="w-10 h-10 rounded object-cover bg-gray-100"
                        />
                        <span className="text-sm font-medium text-gray-800">
                          {producto.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                      {producto.sku || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {producto.category}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800">
                      <div>
                        {producto.discount_percent > 0 && (
                          <span className="text-xs text-red-500 line-through mr-1">
                            ${producto.price_original?.toFixed(2)}
                          </span>
                        )}
                        <span className="font-medium">
                          $
                          {producto.discount_percent > 0
                            ? producto.price_final?.toFixed(2)
                            : producto.price_original?.toFixed(2)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          producto.stock === 0
                            ? 'bg-red-100 text-red-700'
                            : producto.stock <= 3
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {producto.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditar(producto)}
                          className="text-sm text-gray-600 hover:text-gray-800 font-medium"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() =>
                            handleDelete(producto.id, producto.image_url)
                          }
                          className="text-sm text-red-600 hover:text-red-800 font-medium"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductosPage