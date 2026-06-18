import { useState } from 'react'

// ─── Paleta Aurora Bloom ─────────────────────────────────────────────────────
const p = {
  rose: '#E891A8',
  roseDeep: '#C9607F',
  roseVivid: '#FF5C8A',
  roseBlush: '#FFC2D4',
  roseMist: '#FFE8EF',
  champagne: '#E8D5B7',
  champagneLt: '#F5EBD9',
  ivory: '#FDF8F4',
  cream: '#FAF3ED',
  gold: '#C9A961',
  goldSoft: '#D4B87A',
  coral: '#FF8E72',
  ink: '#2D1F26',
  textMain: '#4A3340',
  textSoft: '#8B6F7A',
}

const categorias = [
  { value: '', label: 'Todo' },
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

  // 🔧 CAMBIO: Estilo refinado para selectores
  const selectStyle = {
    width: '100%',
    fontSize: '0.85rem',
    fontFamily: 'ui-sans-serif, system-ui, sans-serif',
    background: 'transparent',
    border: 'none',
    borderBottom: `1.5px solid ${p.roseBlush}40`,
    padding: '0.5rem 0',
    color: p.textMain,
    outline: 'none',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
  }

  const labelStyle = {
    display: 'block',
    fontSize: '0.58rem',
    letterSpacing: '0.25em',
    textTransform: 'uppercase',
    fontWeight: 600,
    color: p.textSoft,
    marginBottom: '0.4rem',
    fontFamily: 'ui-sans-serif, system-ui, sans-serif',
  }

  return (
    <div
      style={{
        marginBottom: '3rem',
        borderBottom: `1px solid ${p.roseBlush}25`,
        paddingBottom: '1.5rem',
      }}
    >
      {/* Header: Ordenamiento + Mobile Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span
            style={{
              fontSize: '0.6rem',
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              fontWeight: 600,
              color: p.textSoft,
              fontFamily: 'ui-sans-serif, system-ui, sans-serif',
            }}
          >
            Filtrar
          </span>
          <button
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className="md:hidden transition-colors duration-300"
            style={{
              fontSize: '0.7rem',
              color: p.textSoft,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'ui-sans-serif, system-ui, sans-serif',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = p.roseDeep)}
            onMouseLeave={(e) => (e.currentTarget.style.color = p.textSoft)}
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
              className="transition-colors duration-300 flex items-center gap-1.5"
              style={{
                fontSize: '0.6rem',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                fontWeight: 600,
                color: p.textSoft,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'ui-sans-serif, system-ui, sans-serif',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = p.roseVivid)}
              onMouseLeave={(e) => (e.currentTarget.style.color = p.textSoft)}
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
            style={{
              fontSize: '0.65rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              fontWeight: 600,
              fontFamily: 'ui-sans-serif, system-ui, sans-serif',
              background: p.roseMist,
              border: `1.5px solid ${p.roseBlush}40`,
              borderRadius: '50px',
              padding: '0.45rem 1rem',
              color: p.roseDeep,
              outline: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = p.roseVivid
              e.currentTarget.style.boxShadow = `0 0 0 3px ${p.roseBlush}30`
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = `${p.roseBlush}40`
              e.currentTarget.style.boxShadow = 'none'
            }}
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
            <label htmlFor="filtro-categoria" style={labelStyle}>
              Categoría
            </label>
            <select
              id="filtro-categoria"
              value={filtros.categoria}
              onChange={(e) => handleChange('categoria', e.target.value)}
              style={selectStyle}
              onFocus={(e) => {
                e.currentTarget.style.borderBottomColor = p.roseVivid
                e.currentTarget.style.boxShadow = `0 2px 8px ${p.roseBlush}30`
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderBottomColor = `${p.roseBlush}40`
                e.currentTarget.style.boxShadow = 'none'
              }}
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
            <label htmlFor="filtro-marca" style={labelStyle}>
              Marca
            </label>
            <select
              id="filtro-marca"
              value={filtros.marca}
              onChange={(e) => handleChange('marca', e.target.value)}
              style={selectStyle}
              onFocus={(e) => {
                e.currentTarget.style.borderBottomColor = p.roseVivid
                e.currentTarget.style.boxShadow = `0 2px 8px ${p.roseBlush}30`
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderBottomColor = `${p.roseBlush}40`
                e.currentTarget.style.boxShadow = 'none'
              }}
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
            <label htmlFor="filtro-genero" style={labelStyle}>
              Género
            </label>
            <select
              id="filtro-genero"
              value={filtros.genero}
              onChange={(e) => handleChange('genero', e.target.value)}
              style={selectStyle}
              onFocus={(e) => {
                e.currentTarget.style.borderBottomColor = p.roseVivid
                e.currentTarget.style.boxShadow = `0 2px 8px ${p.roseBlush}30`
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderBottomColor = `${p.roseBlush}40`
                e.currentTarget.style.boxShadow = 'none'
              }}
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
            <label htmlFor="filtro-precio-min" style={labelStyle}>
              Precio min
            </label>
            <input
              id="filtro-precio-min"
              type="number"
              placeholder="S/ 0"
              value={filtros.precioMin}
              onChange={(e) => handleChange('precioMin', e.target.value)}
              style={{
                ...selectStyle,
                width: '100%',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderBottomColor = p.roseVivid
                e.currentTarget.style.boxShadow = `0 2px 8px ${p.roseBlush}30`
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderBottomColor = `${p.roseBlush}40`
                e.currentTarget.style.boxShadow = 'none'
              }}
              min="0"
              step="0.01"
            />
          </div>

          {/* Precio máximo */}
          <div className="w-[100px]">
            <label htmlFor="filtro-precio-max" style={labelStyle}>
              Precio max
            </label>
            <input
              id="filtro-precio-max"
              type="number"
              placeholder="S/ 999"
              value={filtros.precioMax}
              onChange={(e) => handleChange('precioMax', e.target.value)}
              style={{
                ...selectStyle,
                width: '100%',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderBottomColor = p.roseVivid
                e.currentTarget.style.boxShadow = `0 2px 8px ${p.roseBlush}30`
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderBottomColor = `${p.roseBlush}40`
                e.currentTarget.style.boxShadow = 'none'
              }}
              min="0"
              step="0.01"
            />
          </div>
          {/* Búsqueda por nombre */}
<div className="w-full min-w-[200px]">
  <label style={labelStyle}>Buscar producto</label>
  <input
    type="text"
    placeholder="Escribe el nombre..."
    value={filtros.busqueda || ''}
    onChange={(e) => handleChange('busqueda', e.target.value)}
    style={{
      ...selectStyle,
      width: '100%',
      padding: '0.5rem 0.5rem 0.5rem 0',
    }}
    onFocus={(e) => {
      e.currentTarget.style.borderBottomColor = p.roseVivid
      e.currentTarget.style.boxShadow = `0 2px 8px ${p.roseBlush}30`
    }}
    onBlur={(e) => {
      e.currentTarget.style.borderBottomColor = `${p.roseBlush}40`
      e.currentTarget.style.boxShadow = 'none'
    }}
  />
</div>
        </div>
      </div>
    </div>
  )
}

export default FilterBar