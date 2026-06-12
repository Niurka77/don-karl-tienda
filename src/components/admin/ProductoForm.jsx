import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'

const categorias = ['vestidos', 'bolsos', 'zapatos', 'Billeteras']
const generos = ['mujer', 'hombre', 'unisex']

// 🆕 TALLAS DINÁMICAS POR CATEGORÍA
const tallasPorCategoria = {
  vestidos: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Unico'],
  bolsos: ['Unico', 'Pequeño', 'Mediano', 'Grande'],
  zapatos: ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44'],
  Billeteras: ['Unico'],
}

// 🆕 PREFIJOS PARA SKU AUTOMÁTICO
const prefijosCategoria = {
  vestidos: 'VES',
  bolsos: 'BOL',
  zapatos: 'ZAP',
  Billeteras: 'BIL',
}

const marcasPredefinidas = [
  'Guess', 'Tommy Hilfiger', 'Calvin Klein', 'Michael Kors',
  'Victoria\'s Secret', 'Zara', 'H&M', 'Forever 21', 'Mango',
  'Massimo Dutti', 'Steve Madden', 'Coach', 'Kate Spade',
  'Ralph Lauren', 'Lacoste', 'Levi\'s', 'Nike', 'Adidas', 'Puma'
]

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
  { nombre: 'Marron', hex: '#8B4513' },
  { nombre: 'Gris', hex: '#808080' },
  { nombre: 'Amarillo', hex: '#FFD700' },
  { nombre: 'Naranja', hex: '#FFA500' },
  { nombre: 'Morado', hex: '#800080' },
]

const MAX_IMAGENES = 5
const TAMANO_MAXIMO_MB = 5
const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
const MAX_SLIDES = 5

//  SISTEMA DE SONIDOS CON WEB AUDIO API
const playSound = (type) => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    switch (type) {
      case 'success':
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime)
        oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1)
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.3)
        break
        
      case 'error':
        oscillator.frequency.setValueAtTime(300, audioContext.currentTime)
        oscillator.frequency.exponentialRampToValueAtTime(150, audioContext.currentTime + 0.3)
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.3)
        break
        
      case 'warning':
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime)
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)
        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.2)
        break
        
      case 'click':
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05)
        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.05)
        break
        
      case 'upload':
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime)
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.1)
        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.2)
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.3)
        break
    }
  } catch (error) {
    console.error('Error al reproducir sonido:', error)
  }
}

const sanitizarNombreArchivo = (nombreOriginal) => {
  const ultimoPunto = nombreOriginal.lastIndexOf('.')
  const extension = ultimoPunto !== -1 ? nombreOriginal.slice(ultimoPunto) : ''
  let nombreSinExtension = ultimoPunto !== -1 ? nombreOriginal.slice(0, ultimoPunto) : nombreOriginal

  nombreSinExtension = nombreSinExtension
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

  nombreSinExtension = nombreSinExtension.replace(/[^a-zA-Z0-9_-]/g, '_')

  if (nombreSinExtension.length === 0) nombreSinExtension = 'imagen'

  return `${nombreSinExtension}${extension}`
}

const ProductoForm = ({ producto, onGuardar, onCancelar }) => {
  const esEdicion = !!producto
  const formRef = useRef(null)

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
  const [skuEditandoManualmente, setSkuEditandoManualmente] = useState(false)

  const [toasts, setToasts] = useState([])

  //  Tallas disponibles según la categoría actual
  const tallasDisponibles = tallasPorCategoria[formData.category] || tallasPorCategoria.vestidos

  const agregarToast = (mensaje, tipo = 'info') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, mensaje, tipo }])
    playSound(tipo)
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 4000)
  }

  const removerToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

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

  // 🆕 NUEVO: Cuando cambia la categoría, limpiar tallas inválidas
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
    playSound('click')
    
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

  const handleColorClick = (colorNombre) => {
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

  const validarImagen = (file) => {
    if (!TIPOS_PERMITIDOS.includes(file.type)) {
      return 'Solo se permiten imagenes JPG, PNG o WebP'
    }
    
    if (file.size > TAMANO_MAXIMO_MB * 1024 * 1024) {
      return `La imagen debe ser menor a ${TAMANO_MAXIMO_MB}MB`
    }
    
    return null
  }

  const handleImagenesSeleccionadas = (e) => {
    const files = Array.from(e.target.files || [])
    
    if (previews.length + files.length > MAX_IMAGENES) {
      setErrores((prev) => ({
        ...prev,
        imagenes: `Maximo ${MAX_IMAGENES} imagenes permitidas. Actualmente tienes ${previews.length}`
      }))
      agregarToast(`Máximo ${MAX_IMAGENES} imágenes`, 'warning')
      return
    }
    
    const nuevosErrores = []
    const nuevasImagenes = []
    const nuevosPreviews = []
    
    for (const file of files) {
      const error = validarImagen(file)
      if (error) {
        nuevosErrores.push(`${file.name}: ${error}`)
      } else {
        nuevasImagenes.push(file)
        nuevosPreviews.push(URL.createObjectURL(file))
      }
    }
    
    if (nuevosErrores.length > 0) {
      setErrores((prev) => ({
        ...prev,
        imagenes: nuevosErrores.join(' ')
      }))
      agregarToast('Algunas imágenes no son válidas', 'error')
      return
    }
    
    setImagenes((prev) => [...prev, ...nuevasImagenes])
    setPreviews((prev) => [...prev, ...nuevosPreviews])
    setErrores((prev) => ({ ...prev, imagenes: '' }))
    agregarToast(`${nuevasImagenes.length} imagen(es) agregada(s)`, 'success')
  }

  const eliminarImagen = (index) => {
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

  const getColorHex = (colorNombre) => {
    const color = coloresPredefinidos.find(c => c.nombre.toLowerCase() === colorNombre.toLowerCase())
    return color ? color.hex : '#FFFFFF'
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

  // 🆕 NUEVO: Generar SKU automático basado en categoría
  const generarSkuAutomatico = async () => {
    setGenerandoSku(true)
    try {
      const prefijo = prefijosCategoria[formData.category] || 'PROD'
      
      // Buscar todos los SKUs que empiecen con este prefijo
      const { data, error } = await supabase
        .from('products')
        .select('sku')
        .like('sku', `${prefijo}-%`)
        .order('sku', { ascending: false })
      
      if (error) throw error
      
      let siguienteNumero = 1
      
      if (data && data.length > 0) {
        // Encontrar el número más alto
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
      
      // Formato: PREFIJO-01, PREFIJO-02, etc.
      const nuevoSku = `${prefijo}-${String(siguienteNumero).padStart(2, '0')}`
      
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
      nuevosErrores.sku = 'El SKU es obligatorio. Haz clic en "Auto" para generarlo automáticamente'
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
        playSound('upload')
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

        // 🆕 NUEVO: Si está marcado como featured, crear slide automáticamente
        if (formData.is_featured && resultado?.id) {
          try {
            // Verificar si aún hay espacio (máximo 5 slides)
            const { count } = await supabase
              .from('hero_slides')
              .select('*', { count: 'exact', head: true })
            
            if (count !== null && count < MAX_SLIDES) {
              // Obtener el siguiente sort_order disponible
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
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-4 py-3 rounded-lg shadow-lg border max-w-sm animate-slide-in ${
              toast.tipo === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
              toast.tipo === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
              toast.tipo === 'warning' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' :
              'bg-blue-50 border-blue-200 text-blue-800'
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium">{toast.mensaje}</p>
              <button
                onClick={() => removerToast(toast.id)}
                className="text-gray-400 hover:text-gray-600 text-lg leading-none"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>

      {mostrarConfirmacion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-[#FFF8F5] rounded-sm p-6 max-w-md w-full mx-4">
            <div className="w-6 h-px bg-[#D4788A] mb-4"></div>
            <h3 className="font-['Cormorant_Garamond'] text-xl font-light tracking-[-0.02em] text-[#1A1118] mb-3">
              Confirmar cambios
            </h3>
            <p className="text-sm font-['DM_Sans'] font-light text-[#2D2030] mb-6">
              ¿Estás seguro de guardar los cambios en este producto?
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => responderConfirmacion(true)}
                className="flex-1 py-2.5 bg-[#1A1118] text-white rounded-sm font-['DM_Sans'] font-medium tracking-wide hover:bg-gradient-to-r hover:from-[#D4788A] hover:to-[#B85268] transition-all duration-300"
              >
                Sí, guardar
              </button>
              <button
                type="button"
                onClick={() => responderConfirmacion(false)}
                className="flex-1 py-2.5 border border-[rgba(212,120,138,0.4)] text-[#2D2030] rounded-sm font-['DM_Sans'] font-medium hover:bg-[#FDF0F3] hover:border-[#D4788A] transition-all duration-300"
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
          <h2 className="font-['Cormorant_Garamond'] text-2xl font-light tracking-[-0.02em] text-[#1A1118]">
            {esEdicion ? 'Editar producto' : 'Nuevo producto'}
          </h2>
        </div>

        {errorGeneral && (
          <div className="mb-6 p-4 border border-[#B85268] bg-[#FDF0F3] rounded-sm">
            <p className="text-sm text-[#B85268] font-['DM_Sans']">{errorGeneral}</p>
          </div>
        )}

        {exito && (
          <div className="mb-6 p-4 border border-[#D4788A] bg-[#F2C4CE] bg-opacity-30 rounded-sm">
            <p className="text-sm text-[#1A1118] font-['DM_Sans']">{exito}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-[0.6rem] tracking-[0.25em] uppercase font-['DM_Sans'] font-light text-[#9A7480] mb-2">
              Nombre del producto *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Vestido Floral Primavera"
              className={`w-full border rounded-sm px-4 py-2.5 text-sm font-['DM_Sans'] font-light focus:outline-none focus:ring-1 focus:ring-[#D4788A] focus:border-transparent bg-white ${
                errores.name ? 'border-[#B85268] bg-[#FDF0F3]' : 'border-[rgba(212,120,138,0.25)]'
              }`}
            />
            {errores.name && (
              <p className="mt-1 text-xs text-[#B85268] font-['DM_Sans']">{errores.name}</p>
            )}
          </div>

          <div>
            <label className="block text-[0.6rem] tracking-[0.25em] uppercase font-['DM_Sans'] font-light text-[#9A7480] mb-2">
              SKU / Codigo *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                placeholder="VES-001"
                disabled={!skuEditandoManualmente && !esEdicion}
                className={`flex-1 border rounded-sm px-4 py-2.5 text-sm font-['DM_Sans'] font-light focus:outline-none focus:ring-1 focus:ring-[#D4788A] focus:border-transparent bg-white ${
                  errores.sku ? 'border-[#B85268] bg-[#FDF0F3]' : 'border-[rgba(212,120,138,0.25)]'
                } ${!skuEditandoManualmente && !esEdicion ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              />
              {!esEdicion && (
                <button
                  type="button"
                  onClick={skuEditandoManualmente ? () => setSkuEditandoManualmente(false) : generarSkuAutomatico}
                  disabled={generandoSku}
                  className="px-4 py-2.5 bg-[#1A1118] text-white rounded-sm text-xs font-['DM_Sans'] font-medium hover:bg-gradient-to-r hover:from-[#D4788A] hover:to-[#B85268] transition-all duration-300 disabled:bg-[#9A7480] disabled:cursor-not-allowed whitespace-nowrap"
                  title={skuEditandoManualmente ? "Volver a generación automática" : "Generar SKU automático según la categoría"}
                >
                  {generandoSku ? '...' : skuEditandoManualmente ? 'Auto' : 'Editar'}
                </button>
              )}
            </div>
            <p className="mt-1 text-[0.65rem] text-[#9A7480] font-['DM_Sans']">
               {skuEditandoManualmente || esEdicion ? 'Puedes editar el SKU manualmente' : `Click en "Auto" para generar según categoría (${prefijosCategoria[formData.category]}-XX)`}
            </p>
            {errores.sku && (
              <p className="mt-1 text-xs text-[#B85268] font-['DM_Sans']">{errores.sku}</p>
            )}
            {skuExiste && (
              <p className="mt-1 text-xs text-orange-600 font-['DM_Sans']">⚠️ Este SKU ya existe</p>
            )}
          </div>

          <div>
            <label className="block text-[0.6rem] tracking-[0.25em] uppercase font-['DM_Sans'] font-light text-[#9A7480] mb-2">
              Marca
            </label>
            <select
              value={marcaSeleccion}
              onChange={handleMarcaChange}
              className="w-full border border-[rgba(212,120,138,0.25)] rounded-sm px-4 py-2.5 text-sm font-['DM_Sans'] font-light focus:outline-none focus:ring-1 focus:ring-[#D4788A] focus:border-transparent bg-white"
            >
              <option value="">Seleccionar marca</option>
              {marcasPredefinidas.map((marca) => (
                <option key={marca} value={marca}>{marca}</option>
              ))}
              <option value="Otra">Otra...</option>
            </select>
          </div>

          {marcaSeleccion === 'Otra' && (
            <div>
              <label className="block text-[0.6rem] tracking-[0.25em] uppercase font-['DM_Sans'] font-light text-[#9A7480] mb-2">
                Escribe la marca
              </label>
              <input
                type="text"
                value={formData.brandPersonalizada}
                onChange={handleMarcaPersonalizadaChange}
                placeholder="Ej: Mi Marca"
                className="w-full border border-[rgba(212,120,138,0.25)] rounded-sm px-4 py-2.5 text-sm font-['DM_Sans'] font-light focus:outline-none focus:ring-1 focus:ring-[#D4788A] focus:border-transparent bg-white"
              />
            </div>
          )}

          <div>
            <label className="block text-[0.6rem] tracking-[0.25em] uppercase font-['DM_Sans'] font-light text-[#9A7480] mb-2">
              Categoria
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full border border-[rgba(212,120,138,0.25)] rounded-sm px-4 py-2.5 text-sm font-['DM_Sans'] font-light focus:outline-none focus:ring-1 focus:ring-[#D4788A] focus:border-transparent bg-white"
            >
              {categorias.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[0.6rem] tracking-[0.25em] uppercase font-['DM_Sans'] font-light text-[#9A7480] mb-2">
              Genero
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full border border-[rgba(212,120,138,0.25)] rounded-sm px-4 py-2.5 text-sm font-['DM_Sans'] font-light focus:outline-none focus:ring-1 focus:ring-[#D4788A] focus:border-transparent bg-white"
            >
              {generos.map((gen) => (
                <option key={gen} value={gen}>
                  {gen.charAt(0).toUpperCase() + gen.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[0.6rem] tracking-[0.25em] uppercase font-['DM_Sans'] font-light text-[#9A7480] mb-2">
              Precio original *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9A7480] text-sm font-['DM_Sans']">
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
                className={`w-full border rounded-sm pl-8 pr-4 py-2.5 text-sm font-['DM_Sans'] font-light focus:outline-none focus:ring-1 focus:ring-[#D4788A] focus:border-transparent bg-white ${
                  errores.price_original ? 'border-[#B85268] bg-[#FDF0F3]' : 'border-[rgba(212,120,138,0.25)]'
                }`}
              />
            </div>
            {errores.price_original && (
              <p className="mt-1 text-xs text-[#B85268] font-['DM_Sans']">{errores.price_original}</p>
            )}
          </div>

          <div>
            <label className="block text-[0.6rem] tracking-[0.25em] uppercase font-['DM_Sans'] font-light text-[#9A7480] mb-2">
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
                  className={`w-full border rounded-sm px-4 py-2.5 text-sm font-['DM_Sans'] font-light focus:outline-none focus:ring-1 focus:ring-[#D4788A] focus:border-transparent bg-white ${
                    errores.discount_percent ? 'border-[#B85268] bg-[#FDF0F3]' : 'border-[rgba(212,120,138,0.25)]'
                  }`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9A7480] text-sm font-['DM_Sans']">
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
                  <p className="text-xs text-[#9A7480] font-['DM_Sans']">
                    Precio final: <span className="font-semibold text-[#1A1118]">${precioFinal.toFixed(2)}</span>
                    <span className="ml-2 line-through text-[#9A7480]">${parseFloat(formData.price_original).toFixed(2)}</span>
                  </p>
                </div>
              )}
            </div>
            {errores.discount_percent && (
              <p className="mt-1 text-xs text-[#B85268] font-['DM_Sans']">{errores.discount_percent}</p>
            )}
          </div>

          <div>
            <label className="block text-[0.6rem] tracking-[0.25em] uppercase font-['DM_Sans'] font-light text-[#9A7480] mb-2">
              Stock *
            </label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              placeholder="5"
              min="0"
              className={`w-full border rounded-sm px-4 py-2.5 text-sm font-['DM_Sans'] font-light focus:outline-none focus:ring-1 focus:ring-[#D4788A] focus:border-transparent bg-white ${
                errores.stock ? 'border-[#B85268] bg-[#FDF0F3]' : 'border-[rgba(212,120,138,0.25)]'
              }`}
            />
            {errores.stock && (
              <p className="mt-1 text-xs text-[#B85268] font-['DM_Sans']">{errores.stock}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="is_featured"
                checked={formData.is_featured}
                onChange={handleChange}
                className="w-5 h-5 rounded-sm border-[rgba(212,120,138,0.35)] text-[#D4788A] focus:ring-[#D4788A] focus:ring-1 focus:ring-offset-0 cursor-pointer"
              />
              <span className="text-sm font-['DM_Sans'] font-medium text-[#1A1118] tracking-wide">
                Mostrar en slider de Productos Nuevos / Destacados
              </span>
            </label>
            <p className="text-xs text-[#9A7480] font-['DM_Sans'] mt-1 ml-8">
              Los productos marcados apareceran en el slider "Recien Llegados" de la pagina principal
              {!esEdicion && formData.is_featured && (
                <span className="ml-1 text-[#D4788A]">• Se creará el slide automáticamente</span>
              )}
            </p>
          </div>

          <div className="md:col-span-2">
            <label className="block text-[0.6rem] tracking-[0.25em] uppercase font-['DM_Sans'] font-light text-[#9A7480] mb-2">
              Colores disponibles
            </label>
            
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
                      relative w-10 h-10 rounded-sm border-2 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-105
                      ${estaSeleccionado ? 'border-[#1A1118] ring-1 ring-[#D4788A]' : 'border-[rgba(212,120,138,0.25)]'}
                    `}
                    style={{ backgroundColor: color.hex }}
                    title={color.nombre}
                    aria-label={`Color ${color.nombre}`}
                  >
                    {estaSeleccionado && (
                      <svg 
                        className="absolute inset-0 w-full h-full text-white drop-shadow-sm" 
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

            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-[rgba(212,120,138,0.15)]">
              <input
                type="text"
                value={colorPersonalizado}
                onChange={(e) => setColorPersonalizado(e.target.value)}
                placeholder="Agregar otro color (ej: Vino, Turquesa)"
                className="flex-1 border border-[rgba(212,120,138,0.25)] rounded-sm px-4 py-2 text-sm font-['DM_Sans'] font-light focus:outline-none focus:ring-1 focus:ring-[#D4788A] focus:border-transparent bg-white"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAgregarColorPersonalizado())}
              />
              <button
                type="button"
                onClick={handleAgregarColorPersonalizado}
                disabled={!colorPersonalizado.trim()}
                className="px-4 py-2 bg-[#1A1118] text-white rounded-sm text-sm font-['DM_Sans'] font-medium tracking-wide hover:bg-gradient-to-r hover:from-[#D4788A] hover:to-[#B85268] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] disabled:bg-[#9A7480] disabled:cursor-not-allowed"
              >
                Agregar
              </button>
            </div>

            {formData.color && (
              <div className="mt-4 flex flex-wrap gap-2">
                {formData.color.split(',').map((colorNombre, index) => {
                  const color = colorNombre.trim()
                  const hex = getColorHex(color)
                  
                  return (
                    <div
                      key={index}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#FDF0F3] rounded-sm text-sm font-['DM_Sans']"
                    >
                      <div 
                        className="w-4 h-4 rounded-sm border border-[rgba(212,120,138,0.25)]"
                        style={{ backgroundColor: hex }}
                      />
                      <span className="text-[#1A1118]">{color}</span>
                      <button
                        type="button"
                        onClick={() => handleColorClick(color)}
                        className="text-[#9A7480] hover:text-[#B85268] transition-colors duration-300"
                      >
                        ×
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* 🆕 TALLAS DINÁMICAS POR CATEGORÍA */}
          <div className="md:col-span-2">
            <label className="block text-[0.6rem] tracking-[0.25em] uppercase font-['DM_Sans'] font-light text-[#9A7480] mb-2">
              Tallas disponibles
              <span className="ml-2 text-[0.55rem] normal-case tracking-normal text-[#D4788A]">
                (para {formData.category})
              </span>
            </label>
            <div className="flex flex-wrap gap-2">
              {tallasDisponibles.map((talla) => (
                <button
                  key={talla}
                  type="button"
                  onClick={() => handleTallaToggle(talla)}
                  className={`
                    px-4 py-2 border rounded-sm text-sm font-['DM_Sans'] font-medium transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
                    ${
                      formData.sizes_available.includes(talla)
                        ? 'border-[#1A1118] bg-[#1A1118] text-white'
                        : 'border-[rgba(212,120,138,0.25)] text-[#2D2030] hover:border-[#D4788A]'
                    }
                  `}
                >
                  {talla}
                </button>
              ))}
            </div>
            <p className="text-xs text-[#9A7480] font-['DM_Sans'] mt-2">
              {formData.category === 'vestidos' && ' Tallas de ropa: XS a XXL'}
              {formData.category === 'bolsos' && ' Tamaños de bolsos'}
              {formData.category === 'zapatos' && '👠 Tallas numéricas de calzado'}
              {formData.category === 'Billeteras' && '💳 Billeteras: talla única'}
            </p>
          </div>

          <div className="md:col-span-2">
            <label className="block text-[0.6rem] tracking-[0.25em] uppercase font-['DM_Sans'] font-light text-[#9A7480] mb-2">
              Imagenes del producto {!esEdicion && '*'}
            </label>
            <p className="text-xs text-[#9A7480] font-['DM_Sans'] mb-3">
              Maximo {MAX_IMAGENES} imagenes. La primera imagen sera la principal.
            </p>

            {previews.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-4">
                {previews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-[3/4] bg-[#FDF0F3] rounded-sm overflow-hidden">
                      <img
                        src={preview}
                        alt={`Vista previa ${index + 1}`}
                        className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                      />
                    </div>
                    {index === 0 && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 bg-[#D4788A] text-white text-xs font-['DM_Sans'] font-medium rounded-sm">
                        Principal
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => eliminarImagen(index)}
                      className="absolute top-2 right-2 w-7 h-7 bg-[#1A1118] text-white rounded-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-[#B85268]"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {previews.length < MAX_IMAGENES && (
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-[rgba(212,120,138,0.35)] rounded-sm cursor-pointer hover:border-[#D4788A] transition-colors duration-300 bg-[#FDF0F3] bg-opacity-50">
                  <div className="text-center">
                    <svg
                      className="w-10 h-10 text-[#9A7480] mx-auto mb-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="text-sm text-[#2D2030] font-['DM_Sans'] font-light">
                      {imagenes.length > 0 ? `${imagenes.length} imagenes seleccionadas` : 'Arrastra imagenes o haz clic aqui'}
                    </p>
                    <p className="text-xs text-[#9A7480] font-['DM_Sans'] mt-1">
                      JPG, PNG o WebP (max. {TAMANO_MAXIMO_MB}MB c/u)
                    </p>
                    <p className="text-xs text-[#9A7480] font-['DM_Sans']">
                      {previews.length}/{MAX_IMAGENES} imagenes
                    </p>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImagenesSeleccionadas}
                    className="hidden"
                  />
                </label>
              </div>
            )}
            {errores.imagenes && (
              <p className="mt-2 text-xs text-[#B85268] font-['DM_Sans']">{errores.imagenes}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-[0.6rem] tracking-[0.25em] uppercase font-['DM_Sans'] font-light text-[#9A7480] mb-2">
              Descripcion
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Describe el producto..."
              className="w-full border border-[rgba(212,120,138,0.25)] rounded-sm px-4 py-2.5 text-sm font-['DM_Sans'] font-light focus:outline-none focus:ring-1 focus:ring-[#D4788A] focus:border-transparent resize-none bg-white"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-6 border-t border-[rgba(212,120,138,0.2)] mt-6">
          <button
            type="submit"
            disabled={guardando}
            className="flex-1 py-2.5 bg-[#1A1118] text-white rounded-sm font-['DM_Sans'] font-medium tracking-wide hover:bg-gradient-to-r hover:from-[#D4788A] hover:to-[#B85268] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] disabled:bg-[#9A7480] disabled:cursor-not-allowed text-sm relative overflow-hidden group"
          >
            <span className="relative z-10">
              {guardando ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  {subiendo ? 'Subiendo imagenes...' : 'Guardando...'}
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
              className="px-6 py-2.5 border border-[rgba(212,120,138,0.4)] text-[#2D2030] rounded-sm font-['DM_Sans'] font-medium hover:bg-[#FDF0F3] hover:border-[#D4788A] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] text-sm"
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