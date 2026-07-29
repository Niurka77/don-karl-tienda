const tallasPorCategoria = {
  vestidos: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Unico'],
  bolsos: ['Unico', 'Pequeño', 'Mediano', 'Grande'],
  zapatos: ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44'],
  zapatillas: ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44'],
  Billeteras: ['Unico'],
}

const SizePicker = ({
  categoria,
  sizesSeleccionadas,
  onToggle,
}) => {
  const tallasDisponibles = tallasPorCategoria[categoria] || tallasPorCategoria.vestidos

  return (
    <div className="md:col-span-2">
      <label className="block text-[0.6rem] tracking-[0.25em] uppercase font-sans font-light text-[#9A7480] mb-2">
        Tallas disponibles
        <span className="ml-2 text-[0.55rem] normal-case tracking-normal text-[#D4788A]">
          (para {categoria})
        </span>
      </label>
      <div className="flex flex-wrap gap-2">
        {tallasDisponibles.map((talla) => (
          <button
            key={talla}
            type="button"
            onClick={() => onToggle(talla)}
            className={`
              px-4 py-2 border rounded-sm text-sm font-sans font-medium transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
              ${
                sizesSeleccionadas.includes(talla)
                  ? 'border-[#1A1118] bg-[#1A1118] text-white'
                  : 'border-[rgba(212,120,138,0.25)] text-[#2D2030] hover:border-[#D4788A]'
              }
            `}
          >
            {talla}
          </button>
        ))}
      </div>
      <p className="text-xs text-[#9A7480] font-sans mt-2">
        {categoria === 'vestidos' && '👗 Tallas de ropa: XS a XXL'}
        {categoria === 'bolsos' && '👜 Tamaños de bolsos'}
        {categoria === 'zapatos' && '👠 Tallas numéricas de calzado'}
        {categoria === 'zapatillas' && '👟 Tallas numéricas de zapatillas'}
        {categoria === 'Billeteras' && '💳 Billeteras: talla única'}
      </p>
    </div>
  )
}

export { tallasPorCategoria }
export default SizePicker
