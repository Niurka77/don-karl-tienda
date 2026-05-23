import { useState } from 'react'

const categorias = [
  { value: '', label: 'Todo' },
  { value: 'carteras', label: 'Carteras' },
  { value: 'vestidos', label: 'Vestidos' },
  { value: 'billeteras', label: 'Billeteras' },
  { value: 'zapatos', label: 'Zapatos' },
  { value: 'bolsos', label: 'Bolsos' },
]

const marcas = [
  { value: '', label: 'Todas' },
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
  { value: 'created_at-desc', label: 'Recientes' },
  { value: 'price_original-asc', label: 'Precio: menor' },
  { value: 'price_original-desc', label: 'Precio: mayor' },
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
    <div className="mb-12 border-b border-border/50 pb-6">
      {/* Header: Ordenamiento + Mobile Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-mono tracking-wider text-muted-foreground uppercase">
            Filtrar
          </span>
          <button
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className="md:hidden text-xs text-foreground/60 hover:text-foreground transition-colors"
            aria-expanded={mostrarFiltros}
            aria-controls="filtros-panel"
            aria-label={mostrarFiltros ? 'Ocultar filtros' : 'Mostrar filtros'}
          >
            {mostrarFiltros ? 'Ocultar' : 'Mostrar'} filtros
          </button>
        </div>
        
        <div className="flex items-center gap-3">
          {filtrosActivos && (
            <button
              onClick={limpiarFiltros}
              className="text-[10px] font-mono text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              aria-label="Limpiar todos los filtros"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Limpiar
            </button>
          )}
          
          <select
            value={`${filtros.orden}`}
            onChange={(e) => handleChange('orden', e.target.value)}
            className="text-xs font-mono bg-muted border-none rounded-full px-3 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-foreground/20"
            aria-label="Ordenar productos"
          >
            {ordenamientos.map((op) => (
              <option key={op.value} value={op.value}>
                {op.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Filtros (colapsables) */}
      <div 
        id="filtros-panel"
        className={`${mostrarFiltros ? 'block' : 'hidden'} md:block mt-6`}
      >
        <div className="flex flex-wrap gap-6 items-end">
          {/* Categoría */}
          <div className="min-w-[120px]">
            <label htmlFor="filtro-categoria" className="block text-[9px] font-mono text-muted-foreground uppercase tracking-wider mb-1">
              Categoría
            </label>
            <select
              id="filtro-categoria"
              value={filtros.categoria}
              onChange={(e) => handleChange('categoria', e.target.value)}
              className="w-full text-sm font-mono bg-transparent border-b border-border focus:border-foreground py-1.5 focus:outline-none transition-colors"
            >
              {categorias.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Marca */}
          <div className="min-w-[140px]">
            <label htmlFor="filtro-marca" className="block text-[9px] font-mono text-muted-foreground uppercase tracking-wider mb-1">
              Marca
            </label>
            <select
              id="filtro-marca"
              value={filtros.marca}
              onChange={(e) => handleChange('marca', e.target.value)}
              className="w-full text-sm font-mono bg-transparent border-b border-border focus:border-foreground py-1.5 focus:outline-none transition-colors"
            >
              {marcas.map((marca) => (
                <option key={marca.value} value={marca.value}>
                  {marca.label}
                </option>
              ))}
            </select>
          </div>

          {/* Género */}
          <div className="min-w-[100px]">
            <label htmlFor="filtro-genero" className="block text-[9px] font-mono text-muted-foreground uppercase tracking-wider mb-1">
              Género
            </label>
            <select
              id="filtro-genero"
              value={filtros.genero}
              onChange={(e) => handleChange('genero', e.target.value)}
              className="w-full text-sm font-mono bg-transparent border-b border-border focus:border-foreground py-1.5 focus:outline-none transition-colors"
            >
              {generos.map((gen) => (
                <option key={gen.value} value={gen.value}>
                  {gen.label}
                </option>
              ))}
            </select>
          </div>

          {/* Precio mínimo */}
          <div className="w-[100px]">
            <label htmlFor="filtro-precio-min" className="block text-[9px] font-mono text-muted-foreground uppercase tracking-wider mb-1">
              Precio min
            </label>
            <input
              id="filtro-precio-min"
              type="number"
              placeholder="$0"
              value={filtros.precioMin}
              onChange={(e) => handleChange('precioMin', e.target.value)}
              className="w-full text-sm font-mono bg-transparent border-b border-border focus:border-foreground py-1.5 focus:outline-none transition-colors placeholder:text-muted-foreground/40"
              min="0"
              step="0.01"
            />
          </div>

          {/* Precio máximo */}
          <div className="w-[100px]">
            <label htmlFor="filtro-precio-max" className="block text-[9px] font-mono text-muted-foreground uppercase tracking-wider mb-1">
              Precio max
            </label>
            <input
              id="filtro-precio-max"
              type="number"
              placeholder="$999"
              value={filtros.precioMax}
              onChange={(e) => handleChange('precioMax', e.target.value)}
              className="w-full text-sm font-mono bg-transparent border-b border-border focus:border-foreground py-1.5 focus:outline-none transition-colors placeholder:text-muted-foreground/40"
              min="0"
              step="0.01"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default FilterBar