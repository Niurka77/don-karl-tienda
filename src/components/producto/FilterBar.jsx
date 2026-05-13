import { useState } from 'react'

const categorias = [
  { value: '', label: 'Todas las categorías' },
  { value: 'carteras', label: 'Carteras' },
  { value: 'vestidos', label: 'Vestidos' },
  { value: 'billeteras', label: 'Billeteras' },
  { value: 'zapatos', label: 'Zapatos' },
  { value: 'bolsos', label: 'Bolsos' },
]

const marcas = [
  { value: '', label: 'Todas las marcas' },
  { value: 'guess', label: 'Guess' },
  { value: 'tommy hilfiger', label: 'Tommy Hilfiger' },
  { value: 'calvin klein', label: 'Calvin Klein' },
  { value: 'michael kors', label: 'Michael Kors' },
  { value: 'victoria secret', label: 'Victoria Secret' },
]

const generos = [
  { value: '', label: 'Todos' },
  { value: 'mujer', label: 'Mujer' },
  { value: 'hombre', label: 'Hombre' },
]

const ordenamientos = [
  { value: 'created_at-desc', label: 'Más recientes' },
  { value: 'price_original-asc', label: 'Precio: menor a mayor' },
  { value: 'price_original-desc', label: 'Precio: mayor a menor' },
  { value: 'name-asc', label: 'Nombre: A-Z' },
]

const FilterBar = ({ filtros, onChangeFiltros }) => {
  const [mostrarFiltros, setMostrarFiltros] = useState(false)

  const handleChange = (campo, valor) => {
    onChangeFiltros({ ...filtros, [campo]: valor })
  }

  const limpiarFiltros = () => {
    onChangeFiltros({
      categoria: '',
      marca: '',
      genero: '',
      precioMin: '',
      precioMax: '',
      orden: 'created_at-desc',
    })
  }

  const filtrosActivos = filtros.categoria || filtros.marca || filtros.genero || filtros.precioMin || filtros.precioMax

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
      {/* Header de filtros (mobile toggle) */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setMostrarFiltros(!mostrarFiltros)}
          className="flex items-center gap-2 text-gray-700 font-medium md:hidden"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filtros
          {filtrosActivos && (
            <span className="bg-kb-pink-dark text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              !
            </span>
          )}
        </button>

        {/* Ordenamiento (siempre visible) */}
        <select
          value={`${filtros.orden}`}
          onChange={(e) => handleChange('orden', e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-kb-pink focus:border-transparent"
        >
          {ordenamientos.map((op) => (
            <option key={op.value} value={op.value}>
              {op.label}
            </option>
          ))}
        </select>
      </div>

      {/* Filtros (colapsables en mobile) */}
      <div className={`${mostrarFiltros ? 'block' : 'hidden'} md:block`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Categoría */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
              Categoría
            </label>
            <select
              value={filtros.categoria}
              onChange={(e) => handleChange('categoria', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-kb-pink focus:border-transparent"
            >
              {categorias.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Marca */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
              Marca
            </label>
            <select
              value={filtros.marca}
              onChange={(e) => handleChange('marca', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-kb-pink focus:border-transparent"
            >
              {marcas.map((marca) => (
                <option key={marca.value} value={marca.value}>
                  {marca.label}
                </option>
              ))}
            </select>
          </div>

          {/* Género */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
              Género
            </label>
            <select
              value={filtros.genero}
              onChange={(e) => handleChange('genero', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-kb-pink focus:border-transparent"
            >
              {generos.map((gen) => (
                <option key={gen.value} value={gen.value}>
                  {gen.label}
                </option>
              ))}
            </select>
          </div>

          {/* Precio mínimo */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
              Precio mínimo
            </label>
            <input
              type="number"
              placeholder="$0"
              value={filtros.precioMin}
              onChange={(e) => handleChange('precioMin', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-kb-pink focus:border-transparent"
              min="0"
            />
          </div>

          {/* Precio máximo */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
              Precio máximo
            </label>
            <input
              type="number"
              placeholder="$999"
              value={filtros.precioMax}
              onChange={(e) => handleChange('precioMax', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-kb-pink focus:border-transparent"
              min="0"
            />
          </div>
        </div>

        {/* Botón limpiar filtros */}
        {filtrosActivos && (
          <button
            onClick={limpiarFiltros}
            className="mt-4 text-sm text-kb-pink-dark hover:text-kb-pink font-medium transition-colors flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Limpiar filtros
          </button>
        )}
      </div>
    </div>
  )
}

export default FilterBar