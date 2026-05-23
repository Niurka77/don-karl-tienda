import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ✅ Función helper para subir imágenes con validaciones
export const uploadProductImage = async (file, productId = null) => {
  // Validar tipo de archivo
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
  if (!allowedTypes.includes(file.type)) {
    throw new Error(`Tipo de archivo no permitido: ${file.type}. Use JPG, PNG o WebP.`)
  }
  
  // Validar tamaño máximo (5MB)
  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    throw new Error(`Archivo demasiado grande (${(file.size / 1024 / 1024).toFixed(2)}MB). Máximo 5MB.`)
  }

  const fileExt = file.name.split('.').pop().toLowerCase()
  const fileName = `${productId || Date.now()}-${Date.now()}.${fileExt}`
  const filePath = `${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('productos')
    .upload(filePath, file, { 
      upsert: true,
      contentType: file.type
    })

  if (uploadError) {
    console.error('Error subiendo imagen:', uploadError)
    throw new Error(`Error al subir imagen: ${uploadError.message}`)
  }

  const { data: { publicUrl } } = supabase.storage
    .from('productos')
    .getPublicUrl(filePath)

  if (!publicUrl) {
    throw new Error('No se pudo obtener URL pública de la imagen')
  }

  return publicUrl
}