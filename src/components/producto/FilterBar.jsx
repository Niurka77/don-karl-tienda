import { useState } from 'react'

// Reemplaza el array 'categorias' por este:
const categorias = [
  { value: '', label: 'Todas las categorías' },
  { value: 'vestidos', label: '👗 Vestidos' },
  { value: 'bolsos', label: '👜 Bolsos' },
  { value: 'zapatos', label: '👠 Zapatos' },
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
      genero: '',
      precioMin: '',
      precioMax: '',
      orden: 'created_at-desc',
    })
  }

  const filtrosActivos = filtros.categoria || filtros.genero || filtros.precioMin || filtros.precioMax

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      {/* Header de filtros (mobile toggle) */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setMostrarFiltros(!mostrarFiltros)}
          className="flex items-center gap-2 text-gray-700 font-medium md:hidden"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filtros
          {filtrosActivos && (
            <span className="bg-black text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              !
            </span>
          )}
        </button>

        {/* Ordenamiento (siempre visible) */}
        <select
          value={`${filtros.orden}`}
          onChange={(e) => {
            const [campo, direccion] = e.target.value.split('-')
            handleChange('orden', e.target.value)
          }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
        >
          {ordenamientos.map((op) => (
            <option key={op.value} value={op.value}>
              {op.label}
            </option>
          ))}
        </select>
      </div>

      {/* Filtros (colapsables en mobile) */}
      <div className={`${mostrarFiltros ? 'block' : 'hidden'} md:block mt-4`}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Categoría */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
              Categoría
            </label>
            <select
              value={filtros.categoria}
              onChange={(e) => handleChange('categoria', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            >
              {categorias.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
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
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
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
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
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
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              min="0"
            />
          </div>
        </div>

        {/* Botón limpiar filtros */}
        {filtrosActivos && (
          <button
            onClick={limpiarFiltros}
            className="mt-4 text-sm text-red-600 hover:text-red-800 font-medium transition-colors"
          >
            ✕ Limpiar filtros
          </button>
        )}
      </div>
    </div>
  )
}

export default FilterBar