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

const getColorHex = (colorNombre) => {
  const color = coloresPredefinidos.find(c => c.nombre.toLowerCase() === colorNombre.toLowerCase())
  return color ? color.hex : '#FFFFFF'
}

const ColorPicker = ({
  colorSeleccionado,
  colorPersonalizado,
  onColorPersonalizadoChange,
  onColorToggle,
  onAgregarPersonalizado,
}) => {
  const coloresActuales = colorSeleccionado
    ? colorSeleccionado.split(',').map(c => c.trim())
    : []

  return (
    <div className="md:col-span-2">
      <label className="block text-[0.6rem] tracking-[0.25em] uppercase font-['DM_Sans'] font-light text-[#9A7480] mb-2">
        Colores disponibles
      </label>
      
      <div className="flex flex-wrap gap-3 mb-4">
        {coloresPredefinidos.map((color) => {
          const estaSeleccionado = coloresActuales.includes(color.nombre)
          
          return (
            <button
              key={color.nombre}
              type="button"
              onClick={() => onColorToggle(color.nombre)}
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
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
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
          onChange={(e) => onColorPersonalizadoChange(e.target.value)}
          placeholder="Agregar otro color (ej: Vino, Turquesa)"
          className="flex-1 border border-[rgba(212,120,138,0.25)] rounded-sm px-4 py-2 text-sm font-['DM_Sans'] font-light focus:outline-none focus:ring-1 focus:ring-[#D4788A] focus:border-transparent bg-white"
          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), onAgregarPersonalizado())}
        />
        <button
          type="button"
          onClick={onAgregarPersonalizado}
          disabled={!colorPersonalizado.trim()}
          className="px-4 py-2 bg-[#1A1118] text-white rounded-sm text-sm font-['DM_Sans'] font-medium tracking-wide hover:bg-gradient-to-r hover:from-[#D4788A] hover:to-[#B85268] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] disabled:bg-[#9A7480] disabled:cursor-not-allowed"
        >
          Agregar
        </button>
      </div>

      {colorSeleccionado && (
        <div className="mt-4 flex flex-wrap gap-2">
          {coloresActuales.map((color, index) => {
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
                  onClick={() => onColorToggle(color)}
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
  )
}

export default ColorPicker
