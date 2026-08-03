const MAX_IMAGENES = 5
const TAMANO_MAXIMO_MB = 5
const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']

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

const ImageUploader = ({
  previews,
  imagenesCount,
  errores,
  onFilesSelected,
  onRemoveImage,
}) => {
  const validarImagen = (file) => {
    if (!TIPOS_PERMITIDOS.includes(file.type)) {
      return 'Solo se permiten imagenes JPG, PNG o WebP'
    }
    if (file.size > TAMANO_MAXIMO_MB * 1024 * 1024) {
      return `La imagen debe ser menor a ${TAMANO_MAXIMO_MB}MB`
    }
    return null
  }

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || [])

    if (previews.length + files.length > MAX_IMAGENES) {
      onFilesSelected({
        error: `Maximo ${MAX_IMAGENES} imagenes permitidas. Actualmente tienes ${previews.length}`,
        files: [],
        previews: [],
      })
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
      onFilesSelected({
        error: nuevosErrores.join(' '),
        files: [],
        previews: [],
      })
      return
    }

    onFilesSelected({
      error: '',
      files: nuevasImagenes,
      previews: nuevosPreviews,
    })
  }

  return (
    <div className="md:col-span-2">
      <label className="block text-[0.6rem] tracking-[0.25em] uppercase font-sans font-light text-[#9A7480] mb-2">
        Imágenes del producto *
      </label>
      <p className="text-xs text-[#9A7480] font-sans mb-3">
        Máximo {MAX_IMAGENES} imágenes. La primera imagen será la principal.
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
                <span className="absolute top-2 left-2 px-2 py-0.5 bg-[#D4788A] text-white text-xs font-sans font-medium rounded-sm">
                  Principal
                </span>
              )}
              <button
                type="button"
                onClick={() => onRemoveImage(index)}
                className="absolute top-2 right-2 w-7 h-7 bg-[#1A1118] text-white rounded-sm flex items-center justify-center transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-[#B85268]"
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
              <p className="text-sm text-[#2D2030] font-sans font-light">
                {imagenesCount > 0 ? `${imagenesCount} imágenes seleccionadas` : 'Arrastra imágenes o haz clic aquí'}
              </p>
              <p className="text-xs text-[#9A7480] font-sans mt-1">
                JPG, PNG o WebP (máx. {TAMANO_MAXIMO_MB}MB c/u)
              </p>
              <p className="text-xs text-[#9A7480] font-sans">
                {previews.length}/{MAX_IMAGENES} imágenes
              </p>
            </div>
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>
      )}
      {errores && (
        <p className="mt-2 text-xs text-[#B85268] font-sans">{errores}</p>
      )}
    </div>
  )
}

export { MAX_IMAGENES, sanitizarNombreArchivo }
export default ImageUploader
