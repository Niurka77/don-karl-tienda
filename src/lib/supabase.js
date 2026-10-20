import { createClient } from '@supabase/supabase-js'
import { useMemo } from 'react'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ✅ Helper: redimensionar imagen en canvas a máx. 1600px y convertir a WebP calidad 0.82
const redimensionarImagen = (file) => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      let width = img.width
      let height = img.height

      // Calcular nuevo tamaño máximo 1600px de lado largo
      if (width > height) {
        width = 1600
        height = (height / img.width) * 1600
      } else {
        height = 1600
        width = (width / img.height) * 1600
      }

      // Asegurar mímínimo 200px
      width = Math.max(width, 200)
      height = Math.max(height, 200)

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, width, height)

      // Convertir a WebP calidad 0.82
      canvas.toBlob((blob) => {
        if (!blob) reject(new Error('No se pudo convertir el canvas a blob'))
        else {
          // Nombre único con UUID
          const uuid = self.crypto?.randomUUID?.() || Math.random().toString(36).slice(2, 10)
          const fileExt = 'webp'
          const newFile = new File([blob], `${uuid}.${fileExt}`, { type: 'image/webp' })
          resolve(newFile)
        }
      }, 'image/webp', 0.82)
    }
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

// ✅ Función helper para subir imágenes de productos con validaciones y redimensionamiento
export const uploadProductImage = async (file, productId = null) => {
  // 1. Redimensionar en navegador antes de subir
  const resizedFile = await redimensionarImagen(file)

  // 2. Validar tipo de archivo (solo WebP, PNG, JPEG)
  const allowedTypes = ['image/webp', 'image/png', 'image/jpeg']
  if (!allowedTypes.includes(resizedFile.type)) {
    throw new Error(`Tipo de archivo no permitido: ${resizedFile.type}. Use WebP, PNG o JPG.`)
  }

  // 3. Validar tamaño máximo (después de redimensionar, usualmente < 5MB)
  const maxSize = 5 * 1024 * 1024
  if (resizedFile.size > maxSize) {
    throw new Error(`Archivo demasiado grande (${(resizedFile.size / 1024 / 1024).toFixed(2)}MB). Máximo 5MB después de redimensionar.`)
  }

  // 4. Nombre único con crypto.randomUUID()
  const fileExt = resizedFile.name.split('.').pop().toLowerCase()
  const uniqueId = self.crypto?.randomUUID?.() || Math.random().toString(36).slice(2, 10)
  const fileName = `${uniqueId}-${Date.now()}.${fileExt}`
  const filePath = `${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('productos')
    .upload(filePath, resizedFile, { 
      upsert: false,  // Ya no upsert, nombres únicos garantizados
      contentType: resizedFile.type
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

// ✅ Función para subir fotos de testimonios (bucket site-assets)
export const uploadTestimonialPhoto = async (file) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
  if (!allowedTypes.includes(file.type)) {
    throw new Error(`Tipo de archivo no permitido: ${file.type}. Use JPG, PNG o WebP.`)
  }

  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    throw new Error(`Archivo demasiado grande (${(file.size / 1024 / 1024).toFixed(2)}MB). Máximo 5MB.`)
  }

  const fileExt = file.name.split('.').pop().toLowerCase()
  const fileName = `testimonios/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${fileExt}`

  const { error: uploadError } = await supabase.storage
    .from('site-assets')
    .upload(fileName, file, {
      upsert: true,
      contentType: file.type,
    })

  if (uploadError) {
    console.error('Error subiendo foto de testimonio:', uploadError)
    throw new Error(`Error al subir la foto: ${uploadError.message}`)
  }

  const { data: { publicUrl } } = supabase.storage
    .from('site-assets')
    .getPublicUrl(fileName)

  if (!publicUrl) {
    throw new Error('No se pudo obtener URL pública de la foto')
  }

  return publicUrl
}