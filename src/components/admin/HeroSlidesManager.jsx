import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAdminNotifications } from '../../hooks/useAdminNotifications'

const MAX_SLIDES = 5

const HeroSlidesManager = () => {
  const [slides, setSlides] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  
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
  const [busquedaProducto, setBusquedaProducto] = useState('')
  const [previewImage, setPreviewImage] = useState(null)
  const [confirmModal, setConfirmModal] = useState({ show: false, slideId: null })

  // 🔔 Usar hook centralizado de notificaciones
  const { agregarToast, ToastContainer } = useAdminNotifications()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const { data: slidesData, error: slidesError } = await supabase
        .from('hero_slides')
        .select(`*, products ( name, brand, category, images_urls, image_url )`)
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
      agregarToast('Error al cargar datos', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (slides.length >= MAX_SLIDES && !editingId) {
      agregarToast(`Solo se permiten máximo ${MAX_SLIDES} slides`, 'error')
      return
    }

    if (!formData.product_id && !showCustomFields) {
      agregarToast('Selecciona un producto O activa los campos personalizados', 'warning')
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
        agregarToast('Slide actualizado correctamente', 'success')
      } else {
        const { error } = await supabase
          .from('hero_slides')
          .insert([formData])

        if (error) throw error
        agregarToast('Slide creado correctamente', 'success')
      }

      resetForm()
      fetchData()
    } catch (error) {
      console.error('Error saving slide:', error)
      agregarToast('Error al guardar: ' + error.message, 'error')
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

  const handleDeleteClick = (id) => {
    setConfirmModal({ show: true, slideId: id })
  }

  const handleDeleteConfirm = async () => {
    const id = confirmModal.slideId
    setDeletingId(id)
    
    try {
      const { error } = await supabase
        .from('hero_slides')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      setSlides(slides.filter(s => s.id !== id))
      agregarToast('Slide eliminado', 'success')
    } catch (error) {
      console.error('Error deleting:', error)
      agregarToast('Error al eliminar: ' + error.message, 'error')
    } finally {
      setDeletingId(null)
      setConfirmModal({ show: false, slideId: null })
    }
  }

  const handleProductChange = (productId) => {
    const product = products.find(p => p.id === productId)
    const images = product?.images_urls?.length > 0 
      ? product.images_urls 
      : product?.image_url 
        ? [product.image_url] 
        : []

    setSelectedProductImages(images)

    setFormData(prev => ({
      ...prev,
      product_id: productId,
      image_override: '',
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

  // Filtrar productos por búsqueda
  const productosFiltrados = products.filter(p => 
    p.name?.toLowerCase().includes(busquedaProducto.toLowerCase()) ||
    p.brand?.toLowerCase().includes(busquedaProducto.toLowerCase()) ||
    p.sku?.toLowerCase().includes(busquedaProducto.toLowerCase())
  )

  const slidesActivos = slides.filter(s => s.active).length
  const slidesInactivos = slides.filter(s => !s.active).length

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF8F5] p-6 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-[#D4788A] border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FFF8F5] p-4 md:p-6">
      <ToastContainer />

      {/* Modal de Confirmación */}
      {confirmModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-sm p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="font-['Cormorant_Garamond'] text-xl text-[#1A1118] mb-2">Confirmar eliminación</h3>
            <p className="text-sm text-gray-600 mb-6 font-['DM_Sans']">
              ¿Estás seguro de eliminar este slide? Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmModal({ show: false, slideId: null })}
                disabled={deletingId}
                className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-sm hover:bg-gray-50 font-['DM_Sans'] disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deletingId}
                className="flex-1 py-2.5 bg-[#B85268] text-white rounded-sm hover:bg-[#9A3A4C] font-['DM_Sans'] transition-colors disabled:opacity-50"
              >
                {deletingId ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview de Imagen */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setPreviewImage(null)}
        >
          <img 
            src={previewImage} 
            alt="Preview" 
            className="max-w-4xl max-h-[90vh] object-contain rounded-sm"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h1 className="font-['Cormorant_Garamond'] text-3xl font-light text-[#1A1118]">Gestión del Slider Principal</h1>
        <p className="text-sm text-[#9A7480] font-['DM_Sans'] mt-1">
          Configura los productos que aparecerán en el hero de la página principal
          <span className="ml-2 text-[#D4788A]">(Máximo {MAX_SLIDES} slides)</span>
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-sm p-4 border border-[rgba(212,120,138,0.15)]">
          <p className="text-xs text-[#9A7480] font-['DM_Sans']">Total Slides</p>
          <p className="text-2xl font-bold text-[#1A1118] font-['Cormorant_Garamond']">{slides.length}/{MAX_SLIDES}</p>
        </div>
        <div className="bg-white rounded-sm p-4 border border-[rgba(212,120,138,0.15)]">
          <p className="text-xs text-[#9A7480] font-['DM_Sans']">Activos</p>
          <p className="text-2xl font-bold text-green-600 font-['Cormorant_Garamond']">{slidesActivos}</p>
        </div>
        <div className="bg-white rounded-sm p-4 border border-[rgba(212,120,138,0.15)]">
          <p className="text-xs text-[#9A7480] font-['DM_Sans']">Inactivos</p>
          <p className="text-2xl font-bold text-gray-600 font-['Cormorant_Garamond']">{slidesInactivos}</p>
        </div>
      </div>

      {/* Alerta de límite */}
      {slides.length >= MAX_SLIDES && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-sm text-amber-800">
          ⚠️ Has alcanzado el límite máximo de {MAX_SLIDES} slides. Elimina uno para crear otro.
        </div>
      )}

      {/* Formulario */}
      <div className="bg-white rounded-sm border border-[rgba(212,120,138,0.15)] shadow-sm p-6 mb-8">
        <h2 className="text-xl font-['Cormorant_Garamond'] text-[#1A1118] mb-4">
          {editingId ? 'Editar Slide' : 'Nuevo Slide'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Búsqueda de Producto */}
          <div>
            <label className="block text-xs text-[#9A7480] font-['DM_Sans'] uppercase tracking-wide mb-2">
              Producto (opcional - dejar vacío para slide manual)
            </label>
            <input
              type="text"
              placeholder="Buscar producto por nombre, marca o SKU..."
              value={busquedaProducto}
              onChange={(e) => setBusquedaProducto(e.target.value)}
              className="w-full border border-[rgba(212,120,138,0.25)] rounded-sm px-4 py-2.5 text-sm font-['DM_Sans'] focus:outline-none focus:ring-1 focus:ring-[#D4788A] mb-2"
            />
            <select
              value={formData.product_id}
              onChange={(e) => handleProductChange(e.target.value)}
              className="w-full border border-[rgba(212,120,138,0.25)] rounded-sm px-4 py-2.5 text-sm font-['DM_Sans'] focus:outline-none focus:ring-1 focus:ring-[#D4788A] bg-white"
            >
              <option value="">Seleccionar producto...</option>
              {productosFiltrados.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name} - {product.brand}
                </option>
              ))}
            </select>
          </div>

          {/* Selector visual de imágenes */}
          {selectedProductImages.length > 0 && (
            <div>
              <label className="block text-xs text-[#9A7480] font-['DM_Sans'] uppercase tracking-wide mb-2">
                Seleccionar imagen del producto
              </label>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                {selectedProductImages.map((img, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleImageSelect(img)}
                    className={`relative aspect-square rounded-sm overflow-hidden border-2 transition-all ${
                      formData.image_override === img 
                        ? 'border-[#D4788A] ring-2 ring-[#D4788A]/30'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img 
                      src={img} 
                      alt="" 
                      className="w-full h-full object-cover"
                      onClick={(e) => {
                        e.stopPropagation()
                        setPreviewImage(img)
                      }}
                    />
                    {formData.image_override === img && (
                      <div className="absolute inset-0 bg-[#D4788A] bg-opacity-20 flex items-center justify-center">
                        <svg className="w-8 h-8 text-[#D4788A]" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <p className="text-xs text-[#9A7480] font-['DM_Sans'] mt-2">
                {formData.image_override 
                  ? '✓ Imagen seleccionada' 
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
              className="rounded border-gray-300 text-[#D4788A] focus:ring-[#D4788A]"
            />
            <label htmlFor="customFields" className="text-sm text-[#2D2030] font-['DM_Sans']">
              Personalizar textos (si no se marca, usará los datos del producto)
            </label>
          </div>

          {/* Campos personalizados */}
          {showCustomFields && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-[#FDF0F3] rounded-sm border border-[rgba(212,120,138,0.15)]">
              <div>
                <label className="block text-xs text-[#9A7480] font-['DM_Sans'] uppercase tracking-wide mb-1">
                  Título principal
                </label>
                <input
                  type="text"
                  value={formData.title_override}
                  onChange={(e) => setFormData(prev => ({ ...prev, title_override: e.target.value }))}
                  className="w-full border border-[rgba(212,120,138,0.25)] rounded-sm px-3 py-2 text-sm font-['DM_Sans'] focus:outline-none focus:ring-1 focus:ring-[#D4788A]"
                  placeholder="Ej: Vestidos"
                />
              </div>

              <div>
                <label className="block text-xs text-[#9A7480] font-['DM_Sans'] uppercase tracking-wide mb-1">
                  Título destacado
                </label>
                <input
                  type="text"
                  value={formData.title_accent_override}
                  onChange={(e) => setFormData(prev => ({ ...prev, title_accent_override: e.target.value }))}
                  className="w-full border border-[rgba(212,120,138,0.25)] rounded-sm px-3 py-2 text-sm font-['DM_Sans'] focus:outline-none focus:ring-1 focus:ring-[#D4788A]"
                  placeholder="Ej: de Fiesta"
                />
              </div>

              <div>
                <label className="block text-xs text-[#9A7480] font-['DM_Sans'] uppercase tracking-wide mb-1">
                  Subtítulo
                </label>
                <input
                  type="text"
                  value={formData.subtitle_override}
                  onChange={(e) => setFormData(prev => ({ ...prev, subtitle_override: e.target.value }))}
                  className="w-full border border-[rgba(212,120,138,0.25)] rounded-sm px-3 py-2 text-sm font-['DM_Sans'] focus:outline-none focus:ring-1 focus:ring-[#D4788A]"
                  placeholder="Ej: Elegancia atemporal"
                />
              </div>

              <div>
                <label className="block text-xs text-[#9A7480] font-['DM_Sans'] uppercase tracking-wide mb-1">
                  Tag/Etiqueta
                </label>
                <input
                  type="text"
                  value={formData.tag_override}
                  onChange={(e) => setFormData(prev => ({ ...prev, tag_override: e.target.value }))}
                  className="w-full border border-[rgba(212,120,138,0.25)] rounded-sm px-3 py-2 text-sm font-['DM_Sans'] focus:outline-none focus:ring-1 focus:ring-[#D4788A]"
                  placeholder="Ej: Colección 2026"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs text-[#9A7480] font-['DM_Sans'] uppercase tracking-wide mb-1">
                  Descripción
                </label>
                <textarea
                  value={formData.description_override}
                  onChange={(e) => setFormData(prev => ({ ...prev, description_override: e.target.value }))}
                  rows={2}
                  className="w-full border border-[rgba(212,120,138,0.25)] rounded-sm px-3 py-2 text-sm font-['DM_Sans'] focus:outline-none focus:ring-1 focus:ring-[#D4788A] resize-none"
                  placeholder="Descripción del slide..."
                />
              </div>
            </div>
          )}

          {/* Orden y activo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[#9A7480] font-['DM_Sans'] uppercase tracking-wide mb-1">
                Orden de aparición
              </label>
              <input
                type="number"
                value={formData.sort_order}
                onChange={(e) => setFormData(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                className="w-full border border-[rgba(212,120,138,0.25)] rounded-sm px-3 py-2 text-sm font-['DM_Sans'] focus:outline-none focus:ring-1 focus:ring-[#D4788A]"
                min="0"
              />
            </div>

            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="active"
                checked={formData.active}
                onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                className="rounded border-gray-300 text-[#D4788A] focus:ring-[#D4788A]"
              />
              <label htmlFor="active" className="text-sm text-[#2D2030] font-['DM_Sans']">
                Activo (visible en el slider)
              </label>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4 border-t border-[rgba(212,120,138,0.15)]">
            <button
              type="submit"
              disabled={saving || (!formData.product_id && !showCustomFields)}
              className="px-6 py-2.5 bg-[#1A1118] text-white rounded-sm text-sm font-['DM_Sans'] font-medium hover:bg-gradient-to-r hover:from-[#D4788A] hover:to-[#B85268] transition-all disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {saving ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear Slide'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2.5 border border-[rgba(212,120,138,0.3)] text-[#9A7480] rounded-sm text-sm font-['DM_Sans'] hover:bg-[#FDF0F3] transition-colors"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Lista de slides */}
      <div className="bg-white rounded-sm border border-[rgba(212,120,138,0.15)] shadow-sm">
        <div className="p-4 border-b border-[rgba(212,120,138,0.15)]">
          <h2 className="text-lg font-['Cormorant_Garamond'] text-[#1A1118]">
            Slides Existentes ({slides.length}/{MAX_SLIDES})
          </h2>
        </div>

        {slides.length === 0 ? (
          <div className="p-8 text-center text-[#9A7480] font-['DM_Sans']">
            <p>No hay slides creados aún</p>
            <p className="text-sm mt-1">Crea tu primer slide para comenzar</p>
          </div>
        ) : (
          <div className="divide-y divide-[rgba(212,120,138,0.1)]">
            {slides.map((slide) => {
              const product = slide.products
              const image = slide.image_override || (product?.images_urls?.[0] || product?.image_url)

              return (
                <div key={slide.id} className="p-4 flex items-center gap-4 hover:bg-[#FDF0F3]/30 transition-colors">
                  <div 
                    className="w-20 h-20 bg-gray-200 rounded-sm overflow-hidden flex-shrink-0 cursor-pointer"
                    onClick={() => image && setPreviewImage(image)}
                  >
                    {image && (
                      <img src={image} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-[#1A1118] font-['DM_Sans']">
                        {slide.title_override || product?.name || 'Slide Manual'}
                      </h3>
                      {!slide.active && (
                        <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs rounded-sm font-['DM_Sans']">
                          Inactivo
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[#9A7480] font-['DM_Sans']">
                      {product?.brand && `${product.brand} • `}
                      Orden: {slide.sort_order}
                    </p>
                    {slide.tag_override && (
                      <p className="text-xs text-[#D4788A] font-['DM_Sans'] mt-1">
                        Tag: {slide.tag_override}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(slide)}
                      className="px-3 py-1.5 text-xs font-medium text-[#9A7480] hover:text-[#1A1118] hover:bg-[#FDF0F3] rounded-sm transition-all font-['DM_Sans']"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteClick(slide.id)}
                      disabled={deletingId === slide.id}
                      className="px-3 py-1.5 text-xs font-medium text-[#B85268] hover:text-red-700 hover:bg-red-50 rounded-sm transition-all font-['DM_Sans'] disabled:opacity-50"
                    >
                      {deletingId === slide.id ? '...' : 'Eliminar'}
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