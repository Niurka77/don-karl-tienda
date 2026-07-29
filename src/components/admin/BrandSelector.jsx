const marcasPredefinidas = [
  'Guess', 'Tommy Hilfiger', 'Calvin Klein', 'Michael Kors',
  'Victoria\'s Secret', 'Zara', 'H&M', 'Forever 21', 'Mango',
  'Massimo Dutti', 'Steve Madden', 'Coach', 'Kate Spade',
  'Ralph Lauren', 'Lacoste', 'Levi\'s', 'Nike', 'Adidas', 'Puma'
]

const BrandSelector = ({
  marcaSeleccion,
  brandPersonalizada,
  onMarcaChange,
  onBrandPersonalizadaChange,
}) => {
  return (
    <>
      <div>
        <label className="block text-[0.6rem] tracking-[0.25em] uppercase font-sans font-light text-[#9A7480] mb-2">
          Marca
        </label>
        <select
          value={marcaSeleccion}
          onChange={onMarcaChange}
          className="w-full border border-[rgba(212,120,138,0.25)] rounded-sm px-4 py-2.5 text-sm font-sans font-light focus:outline-none focus:ring-1 focus:ring-[#D4788A] focus:border-transparent bg-white"
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
          <label className="block text-[0.6rem] tracking-[0.25em] uppercase font-sans font-light text-[#9A7480] mb-2">
            Escribe la marca
          </label>
          <input
            type="text"
            value={brandPersonalizada}
            onChange={onBrandPersonalizadaChange}
            placeholder="Ej: Mi Marca"
            className="w-full border border-[rgba(212,120,138,0.25)] rounded-sm px-4 py-2.5 text-sm font-sans font-light focus:outline-none focus:ring-1 focus:ring-[#D4788A] focus:border-transparent bg-white"
          />
        </div>
      )}
    </>
  )
}

export { marcasPredefinidas }
export default BrandSelector
