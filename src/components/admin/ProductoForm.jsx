import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

const categorias = ['vestidos', 'bolsos', 'zapatos']
const generos = ['mujer', 'hombre', 'unisex']
const tallasDisponibles = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Único']

// ✅ NUEVO: Colores predefinidos para evitar errores humanos
const coloresPredefinidos = [
  { nombre: 'Negro', hex: '#000000' },
  { nombre: 'Blanco', hex: '#FFFFFF' },
  { nombre: 'Rojo', hex: '#DC143C' },
  { nombre: 'Rosa', hex: '#FF69B4' },
  { nombre: 'Dorado', hex: '#D4AF37' },
  { nombre: 'Plateado', hex: '#C0C0C0' },
  { nombre: 'Azul', hex: '#0000FF' },
  { nombre: 'Verde', hex: '#008000' },
  { nombre: 'Beige', hex: '#F5F5DC' },
  { nombre: 'Marrón', hex: '#8B4513' },
  { nombre: 'Gris', hex: '#808080' },
  { nombre: 'Amarillo', hex: '#FFD700' },
  { nombre: 'Naranja', hex: '#FFA500' },
  { nombre: 'Morado', hex: '#800080' },
]

const ProductoForm = ({ producto, onGuardar, onCancelar }) => {
  const esEdicion = !!producto

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price_original: '',
    discount_percent: '0',
    sku: '',
    category: 'vestidos',
    gender: 'mujer',
    color: '',
    brand: '',
    stock: '',
    sizes_available: [],
  })

  const [imagen, setImagen] = useState(null)
  const [imagenPreview, setImagenPreview] = useState('')
  const [subiendo, setSubiendo] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [errores, setErrores] = useState({})
  const [errorGeneral, setErrorGeneral] = useState('')
  const [exito, setExito] = useState('')
  
  // ✅ NUEVO: Estado para color personalizado
  const [colorPersonalizado, setColorPersonalizado] = useState('')

  useEffect(() => {
    if (producto) {
      setFormData({
        name: producto.name || '',
        description: producto.description || '',
        price_original: producto.price_original || '',
        discount_percent: producto.discount_percent?.toString() || '0',
        sku: producto.sku || '',
        category: producto.category || 'vestidos',
        gender: producto.gender || 'mujer',
        color: producto.color || '',
        brand: producto.brand || '',
        stock: producto.stock?.toString() || '',
        sizes_available: Array.isArray(producto.sizes_available)
          ? producto.sizes_available
          : [],
      })
      if (producto.image_url) {
        setImagenPreview(producto.image_url)
      }
    }
  }, [producto])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errores[name]) {
      setErrores((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const handleTallaToggle = (talla) => {
    setFormData((prev) => {
      const actuales = prev.sizes_available
      if (actuales.includes(talla)) {
        return { ...prev, sizes_available: actuales.filter((t) => t !== talla) }
      } else {
        return { ...prev, sizes_available: [...actuales, talla] }
      }
    })
  }

  // ✅ NUEVO: Agregar color predefinido
  const handleColorClick = (colorNombre) => {
    const coloresActuales = formData.color ? formData.color.split(',').map(c => c.trim()) : []
    
    if (coloresActuales.includes(colorNombre)) {
      // Remover color
      const nuevosColores = coloresActuales.filter(c => c !== colorNombre)
      setFormData((prev) => ({ ...prev, color: nuevosColores.join(', ') }))
    } else {
      // Agregar color
      setFormData((prev) => ({ 
        ...prev, 
        color: [...coloresActuales, colorNombre].join(', ') 
      }))
    }
  }

  // ✅ NUEVO: Agregar color personalizado
  const handleAgregarColorPersonalizado = () => {
    if (!colorPersonalizado.trim()) return
    
    const coloresActuales = formData.color ? formData.color.split(',').map(c => c.trim()) : []
    
    if (!coloresActuales.includes(colorPersonalizado.trim())) {
      setFormData((prev) => ({ 
        ...prev, 
        color: [...coloresActuales, colorPersonalizado.trim()].join(', ') 
      }))
      setColorPersonalizado('')
    }
  }

  const handleImagen = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const tiposPermitidos = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
    if (!tiposPermitidos.includes(file.type)) {
      setErrores((prev) => ({
        ...prev,
        imagen: 'Solo se permiten imágenes JPG, PNG o WebP',
      }))
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrores((prev) => ({
        ...prev,
        imagen: 'La imagen debe ser menor a 5MB',
      }))
      return
    }

    setImagen(file)
    setImagenPreview(URL.createObjectURL(file))
    setErrores((prev) => ({ ...prev, imagen: '' }))
  }

  const validar = () => {
    const nuevosErrores = {}

    if (!formData.name.trim()) {
      nuevosErrores.name = 'El nombre es obligatorio'
    }

    if (!formData.price_original || parseFloat(formData.price_original) <= 0) {
      nuevosErrores.price_original = 'El precio debe ser mayor a 0'
    }

    if (
      formData.discount_percent &&
      (parseFloat(formData.discount_percent) < 0 ||
        parseFloat(formData.discount_percent) > 99)
    ) {
      nuevosErrores.discount_percent = 'El descuento debe estar entre 0 y 99%'
    }

    if (!formData.stock || parseInt(formData.stock) < 0) {
      nuevosErrores.stock = 'El stock debe ser 0 o mayor'
    }

    if (!formData.sku.trim()) {
      nuevosErrores.sku = 'El SKU es obligatorio'
    }

    if (!esEdicion && !imagen) {
      nuevosErrores.imagen = 'La imagen es obligatoria para nuevos productos'
    }

    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorGeneral('')
    setExito('')

    if (!validar()) return

    setGuardando(true)

    try {
      let imageUrl = producto?.image_url || ''

      if (imagen) {
        setSubiendo(true)
        const fileName = `${Date.now()}_${imagen.name.replace(/\s+/g, '_')}`
        const filePath = `${fileName}`

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('productos')
          .upload(filePath, imagen, {
            cacheControl: '3600',
            upsert: true,
          })

        if (uploadError) throw new Error(`Error al subir imagen: ${uploadError.message}`)

        const { data: publicUrlData } = supabase.storage
          .from('productos')
          .getPublicUrl(filePath)

        imageUrl = publicUrlData.publicUrl
        setSubiendo(false)
      }

      const datosProducto = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price_original: parseFloat(formData.price_original),
        discount_percent: parseInt(formData.discount_percent) || 0,
        sku: formData.sku.trim(),
        category: formData.category,
        gender: formData.gender,
        color: formData.color.trim(),
        brand: formData.brand.trim(),
        stock: parseInt(formData.stock),
        sizes_available: formData.sizes_available,
        image_url: imageUrl,
      }

      let resultado

      if (esEdicion) {
        const { data, error } = await supabase
          .from('products')
          .update(datosProducto)
          .eq('id', producto.id)
          .select()
          .single()

        if (error) throw error
        resultado = data
      } else {
        const { data, error } = await supabase
          .from('products')
          .insert([datosProducto])
          .select()
          .single()

        if (error) throw error
        resultado = data
      }

      setExito(
        esEdicion
          ? 'Producto actualizado correctamente'
          : 'Producto creado correctamente'
      )

      if (onGuardar) {
        setTimeout(() => {
          onGuardar(resultado)
        }, 800)
      }
    } catch (err) {
      console.error('Error al guardar producto:', err)
      setErrorGeneral(err.message || 'Error al guardar el producto')
    } finally {
      setGuardando(false)
      setSubiendo(false)
    }
  }

  // ✅ NUEVA: Función para obtener el hex de un color
  const getColorHex = (colorNombre) => {
    const color = coloresPredefinidos.find(c => c.nombre.toLowerCase() === colorNombre.toLowerCase())
    return color ? color.hex : '#FFFFFF'
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-6">
        {esEdicion ? 'Editar producto' : 'Nuevo producto'}
      </h2>

      {errorGeneral && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{errorGeneral}</p>
        </div>
      )}

      {exito && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-600">{exito}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nombre */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre del producto *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Vestido Floral Primavera"
            className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent ${
              errores.name ? 'border-red-400 bg-red-50' : 'border-gray-300'
            }`}
          />
          {errores.name && (
            <p className="mt-1 text-xs text-red-500">{errores.name}</p>
          )}
        </div>

        {/* SKU */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            SKU / Código *
          </label>
          <input
            type="text"
            name="sku"
            value={formData.sku}
            onChange={handleChange}
            placeholder="VES-001"
            className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent ${
              errores.sku ? 'border-red-400 bg-red-50' : 'border-gray-300'
            }`}
          />
          {errores.sku && (
            <p className="mt-1 text-xs text-red-500">{errores.sku}</p>
          )}
        </div>

        {/* Marca */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Marca
          </label>
          <input
            type="text"
            name="brand"
            value={formData.brand}
            onChange={handleChange}
            placeholder="Zara"
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          />
        </div>

        {/* Categoría */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Categoría
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          >
            {categorias.map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Género */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Género
          </label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          >
            {generos.map((gen) => (
              <option key={gen} value={gen}>
                {gen.charAt(0).toUpperCase() + gen.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Precio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Precio original *
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
              $
            </span>
            <input
              type="number"
              name="price_original"
              value={formData.price_original}
              onChange={handleChange}
              placeholder="120.00"
              step="0.01"
              min="0"
              className={`w-full border rounded-lg pl-8 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent ${
                errores.price_original ? 'border-red-400 bg-red-50' : 'border-gray-300'
              }`}
            />
          </div>
          {errores.price_original && (
            <p className="mt-1 text-xs text-red-500">{errores.price_original}</p>
          )}
        </div>

        {/* Descuento */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descuento (%)
          </label>
          <div className="relative">
            <input
              type="number"
              name="discount_percent"
              value={formData.discount_percent}
              onChange={handleChange}
              placeholder="0"
              min="0"
              max="99"
              className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent ${
                errores.discount_percent ? 'border-red-400 bg-red-50' : 'border-gray-300'
              }`}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
              %
            </span>
          </div>
          {errores.discount_percent && (
            <p className="mt-1 text-xs text-red-500">{errores.discount_percent}</p>
          )}
          {formData.discount_percent > 0 && (
            <p className="mt-1 text-xs text-green-600">
              Precio final: $
              {(
                parseFloat(formData.price_original || 0) *
                (1 - parseInt(formData.discount_percent || 0) / 100)
              ).toFixed(2)}
            </p>
          )}
        </div>

        {/* Stock */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Stock *
          </label>
          <input
            type="number"
            name="stock"
            value={formData.stock}
            onChange={handleChange}
            placeholder="5"
            min="0"
            className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent ${
              errores.stock ? 'border-red-400 bg-red-50' : 'border-gray-300'
            }`}
          />
          {errores.stock && (
            <p className="mt-1 text-xs text-red-500">{errores.stock}</p>
          )}
        </div>

        {/* ✅ CORREGIDO: Colores con selector visual */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Colores disponibles
          </label>
          
          {/* Colores predefinidos */}
          <div className="flex flex-wrap gap-3 mb-4">
            {coloresPredefinidos.map((color) => {
              const coloresActuales = formData.color ? formData.color.split(',').map(c => c.trim()) : []
              const estaSeleccionado = coloresActuales.includes(color.nombre)
              
              return (
                <button
                  key={color.nombre}
                  type="button"
                  onClick={() => handleColorClick(color.nombre)}
                  className={`
                    relative w-10 h-10 rounded-full border-2 transition-all transform hover:scale-110
                    ${estaSeleccionado ? 'border-black ring-2 ring-black/20' : 'border-gray-300'}
                  `}
                  style={{ backgroundColor: color.hex }}
                  title={color.nombre}
                  aria-label={`Color ${color.nombre}`}
                >
                  {estaSeleccionado && (
                    <svg 
                      className="absolute inset-0 w-full h-full text-white" 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                  )}
                </button>
              )
            })}
          </div>

          {/* Color personalizado */}
          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-200">
            <input
              type="text"
              value={colorPersonalizado}
              onChange={(e) => setColorPersonalizado(e.target.value)}
              placeholder="Agregar otro color (ej: Vino, Turquesa)"
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAgregarColorPersonalizado())}
            />
            <button
              type="button"
              onClick={handleAgregarColorPersonalizado}
              disabled={!colorPersonalizado.trim()}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Agregar
            </button>
          </div>

          {/* Colores seleccionados */}
          {formData.color && (
            <div className="mt-4 flex flex-wrap gap-2">
              {formData.color.split(',').map((colorNombre, index) => {
                const color = colorNombre.trim()
                const hex = getColorHex(color)
                
                return (
                  <div
                    key={index}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full text-sm"
                  >
                    <div 
                      className="w-4 h-4 rounded-full border border-gray-300"
                      style={{ backgroundColor: hex }}
                    />
                    <span>{color}</span>
                    <button
                      type="button"
                      onClick={() => handleColorClick(color)}
                      className="text-gray-500 hover:text-red-500"
                    >
                      ×
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Tallas */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tallas disponibles
          </label>
          <div className="flex flex-wrap gap-2">
            {tallasDisponibles.map((talla) => (
              <button
                key={talla}
                type="button"
                onClick={() => handleTallaToggle(talla)}
                className={`
                  px-4 py-2 border-2 rounded-lg text-sm font-medium transition-all
                  ${
                    formData.sizes_available.includes(talla)
                      ? 'border-black bg-black text-white'
                      : 'border-gray-300 text-gray-600 hover:border-gray-400'
                  }
                `}
              >
                {talla}
              </button>
            ))}
          </div>
        </div>

        {/* Imagen */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Imagen del producto {!esEdicion && '*'}
          </label>

          <div className="flex items-start gap-6">
            {/* Vista previa */}
            {(imagenPreview || producto?.image_url) && (
              <div className="w-32 h-40 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={imagenPreview}
                  alt="Vista previa"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Input de archivo */}
            <div className="flex-1">
              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors bg-gray-50">
                <div className="text-center">
                  <svg
                    className="w-8 h-8 text-gray-400 mx-auto mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-sm text-gray-500">
                    {imagen
                      ? imagen.name
                      : 'Arrastra una imagen o haz clic aquí'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    JPG, PNG o WebP (máx. 5MB)
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImagen}
                  className="hidden"
                />
              </label>
              {errores.imagen && (
                <p className="mt-1 text-xs text-red-500">{errores.imagen}</p>
              )}
            </div>
          </div>
        </div>

        {/* Descripción */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descripción
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            placeholder="Describe el producto..."
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none"
          />
        </div>
      </div>

      {/* Botones */}
      <div className="flex gap-3 pt-6 border-t border-gray-200 mt-6">
        <button
          type="submit"
          disabled={guardando}
          className="flex-1 py-2.5 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
        >
          {guardando ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              {subiendo ? 'Subiendo imagen...' : 'Guardando...'}
            </span>
          ) : esEdicion ? (
            'Actualizar producto'
          ) : (
            'Crear producto'
          )}
        </button>

        {onCancelar && (
          <button
            type="button"
            onClick={onCancelar}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  )
}

export default ProductoForm