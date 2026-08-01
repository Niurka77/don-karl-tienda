import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { useAdminNotifications } from '../../hooks/useAdminNotifications'
import ImageUploader, { MAX_IMAGENES, sanitizarNombreArchivo } from './ImageUploader'
import ColorPicker from './ColorPicker'
import SizePicker, { tallasPorCategoria } from './SizePicker'
import BrandSelector, { marcasPredefinidas } from './BrandSelector'

const categorias = ['vestidos', 'bolsos', 'zapatos', 'zapatillas', 'Billeteras']
const generos = ['mujer', 'hombre', 'unisex']
const origenes = ['importado', 'nacional']

const prefijosCategoria = {
  vestidos: 'KB-VES',
  bolsos: 'KB-BOL',
  zapatos: 'KB-ZAP',
  zapatillas: 'KB-ZAT',
  'Billeteras': 'KB-BIL',
}

const MAX_SLIDES = 5

const ProductoForm = ({ producto, onGuardar, onCancelar }) => {
  const esEdicion = !!producto
  const formRef = useRef(null)
  
  // 🔔 Usar hook centralizado de notificaciones
  const { agregarToast, ToastContainer } = useAdminNotifications()
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price_original: '',
    discount_percent: '0',
    sku: '',
    category: 'vestidos',
    gender: 'mujer',
    origin: 'importado',
    color: '',
    brand: '',
    brandPersonalizada: '',
    stock: '',
    sizes_available: [],
    images_urls: [],
    is_featured: false,
  })
  
  const [imagenes, setImagenes] = useState([])
  const [previews, setPreviews] = useState([])
  const [subiendo, setSubiendo] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [errores, setErrores] = useState({})
  const [errorGeneral, setErrorGeneral] = useState('')
  const [exito, setExito] = useState('')
  const [colorPersonalizado, setColorPersonalizado] = useState('')
  const [marcaSeleccion, setMarcaSeleccion] = useState('')
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false)
  const [confirmacionCallback, setConfirmacionCallback] = useState(null)
  const [skuExiste, setSkuExiste] = useState(false)
  const [generandoSku, setGenerandoSku] = useState(false)

  useEffect(() => {
    if (producto) {
      const brandValue = producto.brand || ''
      const esMarcaPredefinida = marcasPredefinidas.includes(brandValue)
      
      let initialImagesUrls = []
      if (Array.isArray(producto.images_urls) && producto.images_urls.length > 0) {
        initialImagesUrls = producto.images_urls
      } else if (producto.image_url) {
        initialImagesUrls = [producto.image_url]
      }

      setFormData({
        name: producto.name || '',
        description: producto.description || '',
        price_original: producto.price_original || '',
        discount_percent: producto.discount_percent?.toString() || '0',
        sku: producto.sku || '',
        category: producto.category || 'vestidos',
        gender: producto.gender || 'mujer',
        origin: producto.origin || 'importado',
        color: producto.color || '',
        brand: brandValue,
        brandPersonalizada: esMarcaPredefinida ? '' : brandValue,
        stock: producto.stock?.toString() || '',
        sizes_available: Array.isArray(producto.sizes_available)
          ? producto.sizes_available
          : [],
        images_urls: initialImagesUrls,
        is_featured: producto.is_featured || false,
      })
      
      setMarcaSeleccion(esMarcaPredefinida ? brandValue : 'Otra')
      setPreviews(initialImagesUrls)
      setImagenes([])
    }
  }, [producto])

  useEffect(() => {
    if (formData.sku.trim().length > 2 && !generandoSku) {
      const verificarSku = async () => {
        const { data, error } = await supabase
          .from('products')
          .select('id')
          .eq('sku', formData.sku.trim())
          .neq('id', producto?.id || '00000000-0000-0000-0000-000000000000')
          .limit(1)
        
        if (!error && data && data.length > 0) {
          setSkuExiste(true)
          setErrores(prev => ({ ...prev, sku: 'Este SKU ya existe' }))
        } else {
          setSkuExiste(false)
          if (errores.sku === 'Este SKU ya existe') {
            setErrores(prev => ({ ...prev, sku: '' }))
          }
        }
      }
      verificarSku()
    } else {
      setSkuExiste(false)
    }
  }, [formData.sku, producto?.id, generandoSku])

  // 🆕 Cuando cambia la categoría, limpiar tallas inválidas
  useEffect(() => {
    if (esEdicion) return // No limpiar al editar
    
    const tallasValidas = tallasPorCategoria[formData.category] || []
    const tallasFiltradas = formData.sizes_available.filter(t => tallasValidas.includes(t))
    
    if (tallasFiltradas.length !== formData.sizes_available.length) {
      setFormData(prev => ({ ...prev, sizes_available: tallasFiltradas }))
    }
  }, [formData.category])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    
    if (name === 'discount_percent') {
      let numValue = parseInt(value, 10)
      if (isNaN(numValue) || numValue < 0) numValue = 0
      if (numValue > 99) numValue = 99
      setFormData((prev) => ({ ...prev, [name]: numValue.toString() }))
    } else {
      setFormData((prev) => ({ 
        ...prev, 
        [name]: type === 'checkbox' ? checked : value 
      }))
    }
    
    if (errores[name]) {
      setErrores((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const handleMarcaChange = (e) => {
    const value = e.target.value
    setMarcaSeleccion(value)
    
    if (value === 'Otra') {
      setFormData((prev) => ({ ...prev, brand: prev.brandPersonalizada }))
    } else {
      setFormData((prev) => ({ ...prev, brand: value, brandPersonalizada: '' }))
    }
  }

  const handleMarcaPersonalizadaChange = (e) => {
    const value = e.target.value
    setFormData((prev) => ({ ...prev, brandPersonalizada: value, brand: value }))
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

  const handleColorToggle = (colorNombre) => {
    const coloresActuales = formData.color ? formData.color.split(',').map(c => c.trim()) : []
    
    if (coloresActuales.includes(colorNombre)) {
      const nuevosColores = coloresActuales.filter(c => c !== colorNombre)
      setFormData((prev) => ({ ...prev, color: nuevosColores.join(', ') }))
    } else {
      setFormData((prev) => ({ 
        ...prev, 
        color: [...coloresActuales, colorNombre].join(', ') 
      }))
    }
  }

  const handleAgregarColorPersonalizado = () => {
    if (!colorPersonalizado.trim()) return
    
    const coloresActuales = formData.color ? formData.color.split(',').map(c => c.trim()) : []
    
    if (!coloresActuales.includes(colorPersonalizado.trim())) {
      setFormData((prev) => ({ 
        ...prev, 
        color: [...coloresActuales, colorPersonalizado.trim()].join(', ') 
      }))
      setColorPersonalizado('')
      agregarToast('Color agregado', 'success')
    } else {
      agregarToast('Este color ya está seleccionado', 'warning')
    }
  }

  const handleImageFilesSelected = ({ error, files, previews: newPreviews }) => {
    if (error) {
      setErrores((prev) => ({ ...prev, imagenes: error }))
      agregarToast('Algunas imágenes no son válidas', 'error')
      return
    }
    setImagenes((prev) => [...prev, ...files])
    setPreviews((prev) => [...prev, ...newPreviews])
    setErrores((prev) => ({ ...prev, imagenes: '' }))
    agregarToast(`${files.length} imagen(es) agregada(s)`, 'success')
  }

  const handleRemoveImage = (index) => {
    const esImagenExistente = previews[index] && !previews[index].startsWith('blob:')
    
    if (esImagenExistente) {
      if (!window.confirm('¿Eliminar esta imagen permanentemente?')) return
    }
    
    if (previews[index] && previews[index].startsWith('blob:')) {
      URL.revokeObjectURL(previews[index])
    }
    
    setImagenes((prev) => prev.filter((_, i) => i !== index))
    setPreviews((prev) => prev.filter((_, i) => i !== index))
    agregarToast('Imagen eliminada', 'info')
  }

  const subirImagenes = async () => {
    if (imagenes.length === 0) return []
    
    const urlsSubidas = []
    
    for (const imagen of imagenes) {
      const nombreSanitizado = sanitizarNombreArchivo(imagen.name)
      const timestamp = Date.now()
      const randomStr = Math.random().toString(36).substring(7)
      const fileName = `${timestamp}_${randomStr}_${nombreSanitizado}`
      const filePath = `productos/${fileName}`
      
      const { error: uploadError } = await supabase.storage
        .from('productos')
        .upload(filePath, imagen, {
          cacheControl: '3600',
          upsert: true,
        })
      
      if (uploadError) {
        throw new Error(`Error al subir imagen: ${uploadError.message}`)
      }
      
      const { data: publicUrlData } = supabase.storage
        .from('productos')
        .getPublicUrl(filePath)
      
      urlsSubidas.push(publicUrlData.publicUrl)
    }
    
    return urlsSubidas
  }

  // 🆕 Generar SKU automático basado en categoría
  const generarSkuAutomatico = async () => {
    setGenerandoSku(true)
    try {
      const prefijo = prefijosCategoria[formData.category] || 'PROD'
      
      const { data, error } = await supabase
        .from('products')
        .select('sku')
        .like('sku', `${prefijo}-%`)
        .order('sku', { ascending: false })
      
      if (error) throw error
      
      let siguienteNumero = 1
      
      if (data && data.length > 0) {
        const numeros = data
          .map(p => {
            const partes = p.sku.split('-')
            const num = parseInt(partes[partes.length - 1])
            return isNaN(num) ? 0 : num
          })
          .filter(n => n > 0)
        
        if (numeros.length > 0) {
          siguienteNumero = Math.max(...numeros) + 1
        }
      }
      
      const nuevoSku = `${prefijo}-${String(siguienteNumero).padStart(3, '0')}`
      
      setFormData(prev => ({ ...prev, sku: nuevoSku }))
      agregarToast(`SKU generado: ${nuevoSku}`, 'success')
    } catch (err) {
      console.error('Error generando SKU:', err)
      agregarToast('Error al generar SKU automático', 'error')
    } finally {
      setGenerandoSku(false)
    }
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
    } else if (skuExiste) {
      nuevosErrores.sku = 'Este SKU ya existe'
    }

    if (previews.length === 0) {
      nuevosErrores.imagenes = 'El producto debe tener al menos una imagen'
    }

    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  const solicitarConfirmacion = (mensaje) => {
    return new Promise((resolve) => {
      setMostrarConfirmacion(true)
      setConfirmacionCallback(() => resolve)
    })
  }

  const responderConfirmacion = (respuesta) => {
    if (confirmacionCallback) {
      confirmacionCallback(respuesta)
      setConfirmacionCallback(null)
    }
    setMostrarConfirmacion(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorGeneral('')
    setExito('')
    
    if (!validar()) {
      agregarToast('Por favor corrige los errores', 'error')
      return
    }

    if (esEdicion) {
      const confirmado = await solicitarConfirmacion(
        '¿Estás seguro de guardar los cambios en este producto?'
      )
      if (!confirmado) {
        agregarToast('Cambios cancelados', 'info')
        return
      }
    }

    setGuardando(true)

    try {
      const urlsExistentes = previews.filter(url => !url.startsWith('blob:'))
      
      let urlsNuevasSubidas = []
      
      if (imagenes.length > 0) {
        setSubiendo(true)
        urlsNuevasSubidas = await subirImagenes()
        setSubiendo(false)
      }
      
      const imageUrls = [...urlsExistentes, ...urlsNuevasSubidas]
      const imagenPrincipal = imageUrls[0] || ''

      const datosProducto = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price_original: parseFloat(formData.price_original),
        discount_percent: parseInt(formData.discount_percent) || 0,
        sku: formData.sku.trim(),
        category: formData.category,
        gender: formData.gender,
        origin: formData.origin,
        color: formData.color.trim(),
        brand: formData.brand.trim(),
        stock: parseInt(formData.stock),
        sizes_available: formData.sizes_available,
        image_url: imagenPrincipal,
        images_urls: imageUrls,
        is_featured: formData.is_featured,
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
        agregarToast('Producto actualizado correctamente', 'success')
      } else {
        const { data, error } = await supabase
          .from('products')
          .insert([datosProducto])
          .select()
          .single()

        if (error) throw error
        resultado = data
        agregarToast('Producto creado correctamente', 'success')

        // 🆕 Si está marcado como featured, crear slide automáticamente
        if (formData.is_featured && resultado?.id) {
          try {
            const { count } = await supabase
              .from('hero_slides')
              .select('*', { count: 'exact', head: true })
            
            if (count !== null && count < MAX_SLIDES) {
              const { data: slidesExistentes } = await supabase
                .from('hero_slides')
                .select('sort_order')
                .order('sort_order', { ascending: false })
                .limit(1)
              
              const siguienteOrden = slidesExistentes && slidesExistentes.length > 0
                ? (slidesExistentes[0].sort_order || 0) + 1
                : 0
              
              const { error: slideError } = await supabase
                .from('hero_slides')
                .insert([{
                  product_id: resultado.id,
                  title_override: resultado.name,
                  image_override: resultado.image_url,
                  active: true,
                  sort_order: siguienteOrden,
                }])
              
              if (slideError) {
                console.warn('No se pudo crear el slide:', slideError)
                agregarToast('Producto creado pero no se pudo agregar al slider', 'warning')
              } else {
                agregarToast('✓ Slide creado automáticamente', 'success')
              }
            } else {
              agregarToast(`⚠️ Slider lleno (${MAX_SLIDES}/${MAX_SLIDES}). El producto no se agregó al slider`, 'warning')
            }
          } catch (slideErr) {
            console.warn('Error al crear slide:', slideErr)
            agregarToast('Producto creado pero hubo un error con el slider', 'warning')
          }
        }
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
      agregarToast(err.message || 'Error al guardar', 'error')
    } finally {
      setGuardando(false)
      setSubiendo(false)
    }
  }

  const precioFinal = formData.price_original && formData.discount_percent > 0
    ? parseFloat(formData.price_original) * (1 - parseInt(formData.discount_percent) / 100)
    : null

  return (
    <>
      {/* 🔔 Toast Container del hook centralizado */}
      <ToastContainer />

      {/* Modal de confirmación */}
      {mostrarConfirmacion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-[#FFF8F5] rounded-sm p-6 max-w-md w-full mx-4">
            <div className="w-6 h-px bg-[#D4788A] mb-4"></div>
            <h3 className="font-display text-xl font-light tracking-[-0.02em] text-[#1A1118] mb-3">
              Confirmar cambios
            </h3>
            <p className="text-sm font-sans font-light text-[#2D2030] mb-6">
              ¿Estás seguro de guardar los cambios en este producto?
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => responderConfirmacion(true)}
                className="flex-1 py-2.5 bg-[#1A1118] text-white rounded-sm font-sans font-medium tracking-wide hover:bg-gradient-to-r hover:from-[#D4788A] hover:to-[#B85268] transition-all duration-300"
              >
                Sí, guardar
              </button>
              <button
                type="button"
                onClick={() => responderConfirmacion(false)}
                className="flex-1 py-2.5 border border-[rgba(212,120,138,0.4)] text-[#2D2030] rounded-sm font-sans font-medium hover:bg-[#FDF0F3] hover:border-[#D4788A] transition-all duration-300"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} ref={formRef} className="bg-[#FFF8F5] rounded-sm p-6">
        <div className="border-b border-[rgba(212,120,138,0.2)] pb-4 mb-6">
          <div className="w-6 h-px bg-[#D4788A] mb-3"></div>
          <h2 className="font-display text-2xl font-light tracking-[-0.02em] text-[#1A1118]">
            {esEdicion ? 'Editar producto' : 'Nuevo producto'}
          </h2>
        </div>

        {errorGeneral && (
          <div className="mb-6 p-4 border border-[#B85268] bg-[#FDF0F3] rounded-sm">
            <p className="text-sm text-[#B85268] font-sans">{errorGeneral}</p>
          </div>
        )}

        {exito && (
          <div className="mb-6 p-4 border border-[#D4788A] bg-[#F2C4CE] bg-opacity-30 rounded-sm">
            <p className="text-sm text-[#1A1118] font-sans">{exito}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ✅ NOMBRE - PRIMERO */}
          <div className="md:col-span-2">
            <label className="block text-[0.6rem] tracking-[0.25em] uppercase font-sans font-light text-[#9A7480] mb-2">
              Nombre del producto *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Vestido Floral Primavera"
              className={`w-full border rounded-sm px-4 py-2.5 text-sm font-sans font-light focus:outline-none focus:ring-1 focus:ring-[#D4788A] focus:border-transparent bg-white ${
                errores.name ? 'border-[#B85268] bg-[#FDF0F3]' : 'border-[rgba(212,120,138,0.25)]'
              }`}
            />
            {errores.name && (
              <p className="mt-1 text-xs text-[#B85268] font-sans">{errores.name}</p>
            )}
          </div>

          {/* ✅ CATEGORÍA - AHORA ANTES DE SKU */}
          <div>
            <label className="block text-[0.6rem] tracking-[0.25em] uppercase font-sans font-light text-[#9A7480] mb-2">
              Categoría
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full border border-[rgba(212,120,138,0.25)] rounded-sm px-4 py-2.5 text-sm font-sans font-light focus:outline-none focus:ring-1 focus:ring-[#D4788A] focus:border-transparent bg-white"
            >
              {categorias.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* ✅ SKU - AHORA DESPUÉS DE CATEGORÍA */}
          <div>
            <label className="block text-[0.6rem] tracking-[0.25em] uppercase font-sans font-light text-[#9A7480] mb-2">
              SKU / Código *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                placeholder="KB-BOL-001"
                className={`flex-1 border rounded-sm px-4 py-2.5 text-sm font-sans font-light focus:outline-none focus:ring-1 focus:ring-[#D4788A] focus:border-transparent bg-white ${
                  errores.sku ? 'border-[#B85268] bg-[#FDF0F3]' : 'border-[rgba(212,120,138,0.25)]'
                }`}
              />
              <button
                type="button"
                onClick={generarSkuAutomatico}
                disabled={generandoSku}
                className="px-4 py-2.5 bg-[#1A1118] text-white rounded-sm text-xs font-sans font-medium hover:bg-gradient-to-r hover:from-[#D4788A] hover:to-[#B85268] transition-all duration-300 disabled:bg-[#9A7480] disabled:cursor-not-allowed whitespace-nowrap"
                title="Generar SKU automático según la categoría"
              >
                {generandoSku ? '...' : 'Auto'}
              </button>
            </div>
            <p className="mt-1 text-[0.65rem] text-[#9A7480] font-sans">
              Escribe el código manualmente o pulsa "Auto" para generarlo según la categoría ({prefijosCategoria[formData.category]}-XX)
            </p>
            {errores.sku && (
              <p className="mt-1 text-xs text-[#B85268] font-sans">{errores.sku}</p>
            )}
            {skuExiste && (
              <p className="mt-1 text-xs text-orange-600 font-sans">⚠️ Este SKU ya existe</p>
            )}
          </div>

          {/* Marca */}
          <BrandSelector
            marcaSeleccion={marcaSeleccion}
            brandPersonalizada={formData.brandPersonalizada}
            onMarcaChange={handleMarcaChange}
            onBrandPersonalizadaChange={handleMarcaPersonalizadaChange}
          />

          {/* Género */}
          <div>
            <label className="block text-[0.6rem] tracking-[0.25em] uppercase font-sans font-light text-[#9A7480] mb-2">
              Género
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full border border-[rgba(212,120,138,0.25)] rounded-sm px-4 py-2.5 text-sm font-sans font-light focus:outline-none focus:ring-1 focus:ring-[#D4788A] focus:border-transparent bg-white"
            >
              {generos.map((gen) => (
                <option key={gen} value={gen}>
                  {gen.charAt(0).toUpperCase() + gen.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Origen */}
          <div>
            <label className="block text-[0.6rem] tracking-[0.25em] uppercase font-['DM_Sans'] font-light text-[#9A7480] mb-2">
              Origen
            </label>
            <select
              name="origin"
              value={formData.origin}
              onChange={handleChange}
              className="w-full border border-[rgba(212,120,138,0.25)] rounded-sm px-4 py-2.5 text-sm font-['DM_Sans'] font-light focus:outline-none focus:ring-1 focus:ring-[#D4788A] focus:border-transparent bg-white"
            >
              {origenes.map((org) => (
                <option key={org} value={org}>
                  {org.charAt(0).toUpperCase() + org.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Precio */}
          <div>
            <label className="block text-[0.6rem] tracking-[0.25em] uppercase font-sans font-light text-[#9A7480] mb-2">
              Precio original *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9A7480] text-sm font-sans">
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
                className={`w-full border rounded-sm pl-8 pr-4 py-2.5 text-sm font-sans font-light focus:outline-none focus:ring-1 focus:ring-[#D4788A] focus:border-transparent bg-white ${
                  errores.price_original ? 'border-[#B85268] bg-[#FDF0F3]' : 'border-[rgba(212,120,138,0.25)]'
                }`}
              />
            </div>
            {errores.price_original && (
              <p className="mt-1 text-xs text-[#B85268] font-sans">{errores.price_original}</p>
            )}
          </div>

          {/* Descuento */}
          <div>
            <label className="block text-[0.6rem] tracking-[0.25em] uppercase font-sans font-light text-[#9A7480] mb-2">
              Descuento (%)
            </label>
            <div className="space-y-2">
              <div className="relative">
                <input
                  type="number"
                  name="discount_percent"
                  value={formData.discount_percent}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  max="99"
                  className={`w-full border rounded-sm px-4 py-2.5 text-sm font-sans font-light focus:outline-none focus:ring-1 focus:ring-[#D4788A] focus:border-transparent bg-white ${
                    errores.discount_percent ? 'border-[#B85268] bg-[#FDF0F3]' : 'border-[rgba(212,120,138,0.25)]'
                  }`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9A7480] text-sm font-sans">
                  %
                </span>
              </div>
              
              <input
                type="range"
                min="0"
                max="99"
                value={formData.discount_percent}
                onChange={(e) => handleChange({ target: { name: 'discount_percent', value: e.target.value } })}
                className="w-full h-2 bg-[rgba(212,120,138,0.2)] rounded-lg appearance-none cursor-pointer accent-[#D4788A]"
              />
              
              {precioFinal !== null && precioFinal < parseFloat(formData.price_original || 0) && (
                <div className="bg-[#FDF0F3] rounded-sm p-2 border border-[rgba(212,120,138,0.2)]">
                  <p className="text-xs text-[#9A7480] font-sans">
                    Precio final: <span className="font-semibold text-[#1A1118]">${precioFinal.toFixed(2)}</span>
                    <span className="ml-2 line-through text-[#9A7480]">${parseFloat(formData.price_original).toFixed(2)}</span>
                  </p>
                </div>
              )}
            </div>
            {errores.discount_percent && (
              <p className="mt-1 text-xs text-[#B85268] font-sans">{errores.discount_percent}</p>
            )}
          </div>

          {/* Stock */}
          <div>
            <label className="block text-[0.6rem] tracking-[0.25em] uppercase font-sans font-light text-[#9A7480] mb-2">
              Stock *
            </label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              placeholder="5"
              min="0"
              className={`w-full border rounded-sm px-4 py-2.5 text-sm font-sans font-light focus:outline-none focus:ring-1 focus:ring-[#D4788A] focus:border-transparent bg-white ${
                errores.stock ? 'border-[#B85268] bg-[#FDF0F3]' : 'border-[rgba(212,120,138,0.25)]'
              }`}
            />
            {errores.stock && (
              <p className="mt-1 text-xs text-[#B85268] font-sans">{errores.stock}</p>
            )}
          </div>

          {/* Featured */}
          <div className="md:col-span-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="is_featured"
                checked={formData.is_featured}
                onChange={handleChange}
                className="w-5 h-5 rounded-sm border-[rgba(212,120,138,0.35)] text-[#D4788A] focus:ring-[#D4788A] focus:ring-1 focus:ring-offset-0 cursor-pointer"
              />
              <span className="text-sm font-sans font-medium text-[#1A1118] tracking-wide">
                Mostrar en slider de Productos Nuevos / Destacados
              </span>
            </label>
            <p className="text-xs text-[#9A7480] font-sans mt-1 ml-8">
              Los productos marcados aparecerán en el slider "Recién Llegados" de la página principal
              {!esEdicion && formData.is_featured && (
                <span className="ml-1 text-[#D4788A]">• Se creará el slide automáticamente</span>
              )}
            </p>
          </div>

          {/* Colores */}
          <ColorPicker
            colorSeleccionado={formData.color}
            colorPersonalizado={colorPersonalizado}
            onColorPersonalizadoChange={setColorPersonalizado}
            onColorToggle={handleColorToggle}
            onAgregarPersonalizado={handleAgregarColorPersonalizado}
          />

          {/* Tallas dinámicas */}
          <SizePicker
            categoria={formData.category}
            sizesSeleccionadas={formData.sizes_available}
            onToggle={handleTallaToggle}
          />

          {/* Imágenes */}
          <ImageUploader
            previews={previews}
            imagenesCount={imagenes.length}
            errores={errores.imagenes}
            onFilesSelected={handleImageFilesSelected}
            onRemoveImage={handleRemoveImage}
          />

          {/* Descripción */}
          <div className="md:col-span-2">
            <label className="block text-[0.6rem] tracking-[0.25em] uppercase font-sans font-light text-[#9A7480] mb-2">
              Descripción
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Describe el producto..."
              className="w-full border border-[rgba(212,120,138,0.25)] rounded-sm px-4 py-2.5 text-sm font-sans font-light focus:outline-none focus:ring-1 focus:ring-[#D4788A] focus:border-transparent resize-none bg-white"
            />
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-3 pt-6 border-t border-[rgba(212,120,138,0.2)] mt-6">
          <button
            type="submit"
            disabled={guardando}
            className="flex-1 py-2.5 bg-[#1A1118] text-white rounded-sm font-sans font-medium tracking-wide hover:bg-gradient-to-r hover:from-[#D4788A] hover:to-[#B85268] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] disabled:bg-[#9A7480] disabled:cursor-not-allowed text-sm relative overflow-hidden group"
          >
            <span className="relative z-10">
              {guardando ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  {subiendo ? 'Subiendo imágenes...' : 'Guardando...'}
                </span>
              ) : esEdicion ? (
                'Actualizar producto'
              ) : (
                'Crear producto'
              )}
            </span>
          </button>

          {onCancelar && (
            <button
              type="button"
              onClick={onCancelar}
              className="px-6 py-2.5 border border-[rgba(212,120,138,0.4)] text-[#2D2030] rounded-sm font-sans font-medium hover:bg-[#FDF0F3] hover:border-[#D4788A] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] text-sm"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>
    </>
  )
}

export default ProductoForm