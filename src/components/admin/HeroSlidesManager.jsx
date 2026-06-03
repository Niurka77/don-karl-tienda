import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

const MAX_SLIDES = 5

const HeroSlidesManager = () => {
  const [slides, setSlides] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    product_id: '',
    title_override: '',
    title_accent_override: '',
    subtitle_override: '',
    description_override: '',
    image_override: '',
    tag_override: '',
    active: true,
    sort_order: 0,
  })
  const [editingId, setEditingId] = useState(null)
  const [showCustomFields, setShowCustomFields] = useState(false)
  const [selectedProductImages, setSelectedProductImages] = useState([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const { data: slidesData, error: slidesError } = await supabase
        .from('hero_slides')
        .select(`
          *,
          products (
            name,
            brand,
            category,
            images_urls,
            image_url
          )
        `)
        .order('sort_order', { ascending: true })

      if (slidesError) throw slidesError

      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('id, name, brand, category, images_urls, image_url')
        .order('name')

      if (productsError) throw productsError

      setSlides(slidesData || [])
      setProducts(productsData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (slides.length >= MAX_SLIDES && !editingId) {
      alert(`Solo se permiten máximo ${MAX_SLIDES} slides`)
      return
    }

    setSaving(true)

    try {
      if (editingId) {
        const { error } = await supabase
          .from('hero_slides')
          .update(formData)
          .eq('id', editingId)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('hero_slides')
          .insert([formData])

        if (error) throw error
      }

      resetForm()
      fetchData()
    } catch (error) {
      console.error('Error saving slide:', error)
      alert('Error al guardar: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (slide) => {
    setFormData({
      product_id: slide.product_id || '',
      title_override: slide.title_override || '',
      title_accent_override: slide.title_accent_override || '',
      subtitle_override: slide.subtitle_override || '',
      description_override: slide.description_override || '',
      image_override: slide.image_override || '',
      tag_override: slide.tag_override || '',
      active: slide.active,
      sort_order: slide.sort_order,
    })
    setEditingId(slide.id)
    setShowCustomFields(!!slide.title_override || !!slide.subtitle_override)
    
    // Cargar imágenes del producto si existe
    if (slide.product_id && slide.products) {
      const images = slide.products.images_urls?.length > 0 
        ? slide.products.images_urls 
        : slide.products.image_url 
          ? [slide.products.image_url] 
          : []
      setSelectedProductImages(images)
    } else {
      setSelectedProductImages([])
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este slide?')) return

    try {
      const { error } = await supabase
        .from('hero_slides')
        .delete()
        .eq('id', id)

      if (error) throw error
      fetchData()
    } catch (error) {
      console.error('Error deleting:', error)
      alert('Error al eliminar: ' + error.message)
    }
  }

  const handleProductChange = (productId) => {
    const product = products.find(p => p.id === productId)
    
    // Obtener imágenes del producto seleccionado
    const images = product?.images_urls?.length > 0 
      ? product.images_urls 
      : product?.image_url 
        ? [product.image_url] 
        : []
    
    setSelectedProductImages(images)
    
    setFormData(prev => ({
      ...prev,
      product_id: productId,
      image_override: '', // Resetear imagen personalizada al cambiar producto
    }))
  }

  const handleImageSelect = (imageUrl) => {
    setFormData(prev => ({
      ...prev,
      image_override: imageUrl
    }))
  }

  const resetForm = () => {
    setFormData({
      product_id: '',
      title_override: '',
      title_accent_override: '',
      subtitle_override: '',
      description_override: '',
      image_override: '',
      tag_override: '',
      active: true,
      sort_order: slides.length,
    })
    setEditingId(null)
    setShowCustomFields(false)
    setSelectedProductImages([])
  }

  if (loading) {
    return <div className="p-6 text-center">Cargando...</div>
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-light text-gray-800 mb-2">Gestión del Slider Principal</h1>
        <p className="text-gray-600">
          Configura los productos que aparecerán en el hero de la página principal
          <span className="text-sm text-gray-500 ml-2">(Máximo {MAX_SLIDES} slides)</span>
        </p>
      </div>

      {/* Alerta de límite */}
      {slides.length >= MAX_SLIDES && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded text-amber-800">
          ⚠️ Has alcanzado el límite máximo de {MAX_SLIDES} slides. Elimina uno para crear otro.
        </div>
      )}

      {/* Formulario */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-light text-gray-800 mb-4">
          {editingId ? 'Editar Slide' : 'Nuevo Slide'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Producto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Producto (opcional - dejar vacío para slide manual)
            </label>
            <select
              value={formData.product_id}
              onChange={(e) => handleProductChange(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              <option value="">Seleccionar producto...</option>
              {products.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name} - {product.brand}
                </option>
              ))}
            </select>
          </div>

          {/* Selector visual de imágenes */}
          {selectedProductImages.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seleccionar imagen del producto
              </label>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                {selectedProductImages.map((img, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleImageSelect(img)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      formData.image_override === img
                        ? 'border-blue-500 ring-2 ring-blue-200'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    {formData.image_override === img && (
                      <div className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center">
                        <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {formData.image_override 
                  ? 'Imagen seleccionada ✓' 
                  : 'Si no seleccionas, usará la primera imagen del producto'}
              </p>
            </div>
          )}

          {/* Toggle campos personalizados */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="customFields"
              checked={showCustomFields}
              onChange={(e) => setShowCustomFields(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="customFields" className="text-sm text-gray-700">
              Personalizar textos (si no se marca, usará los datos del producto)
            </label>
          </div>

          {/* Campos personalizados */}
          {showCustomFields && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título principal
                </label>
                <input
                  type="text"
                  value={formData.title_override}
                  onChange={(e) => setFormData(prev => ({ ...prev, title_override: e.target.value }))}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="Ej: Vestidos"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título destacado
                </label>
                <input
                  type="text"
                  value={formData.title_accent_override}
                  onChange={(e) => setFormData(prev => ({ ...prev, title_accent_override: e.target.value }))}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="Ej: de Fiesta"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subtítulo
                </label>
                <input
                  type="text"
                  value={formData.subtitle_override}
                  onChange={(e) => setFormData(prev => ({ ...prev, subtitle_override: e.target.value }))}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="Ej: Elegancia atemporal"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tag/Etiqueta (ej: 2026)
                </label>
                <input
                  type="text"
                  value={formData.tag_override}
                  onChange={(e) => setFormData(prev => ({ ...prev, tag_override: e.target.value }))}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="Ej: Colección 2026"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={formData.description_override}
                  onChange={(e) => setFormData(prev => ({ ...prev, description_override: e.target.value }))}
                  rows={2}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="Descripción del slide..."
                />
              </div>
            </div>
          )}

          {/* Orden y activo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Orden de aparición
              </label>
              <input
                type="number"
                value={formData.sort_order}
                onChange={(e) => setFormData(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                className="w-full border border-gray-300 rounded px-3 py-2"
                min="0"
              />
            </div>

            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="active"
                checked={formData.active}
                onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                className="rounded"
              />
              <label htmlFor="active" className="text-sm text-gray-700">
                Activo (visible en el slider)
              </label>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={saving || (!formData.product_id && !showCustomFields)}
              className="px-6 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 disabled:bg-gray-400"
            >
              {saving ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear Slide'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancelar
              </button>
            )}
          </div>

          {!formData.product_id && !showCustomFields && (
            <p className="text-sm text-amber-600">
              ⚠️ Selecciona un producto O activa los campos personalizados
            </p>
          )}
        </form>
      </div>

      {/* Lista de slides */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-light text-gray-800">Slides Existentes ({slides.length}/{MAX_SLIDES})</h2>
        </div>

        {slides.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No hay slides creados aún
          </div>
        ) : (
          <div className="divide-y">
            {slides.map((slide) => {
              const product = slide.products
              const image = slide.image_override || (product?.images_urls?.[0] || product?.image_url)

              return (
                <div key={slide.id} className="p-4 flex items-center gap-4 hover:bg-gray-50">
                  <div className="w-20 h-20 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                    {image && (
                      <img src={image} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">
                        {slide.title_override || product?.name || 'Slide Manual'}
                      </h3>
                      {!slide.active && (
                        <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs rounded">
                          Inactivo
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {product?.brand && `${product.brand} • `}
                      Orden: {slide.sort_order}
                    </p>
                    {slide.tag_override && (
                      <p className="text-xs text-blue-600 mt-1">
                        Tag: {slide.tag_override}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(slide)}
                      className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(slide.id)}
                      className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default HeroSlidesManager