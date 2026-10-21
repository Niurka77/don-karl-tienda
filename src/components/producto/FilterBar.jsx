import { p } from '../../lib/theme'

// Listas de respaldo por si todavía no cargaron las opciones reales de la base de datos
const CATEGORIAS_RESPALDO = ['vestidos', 'billeteras', 'zapatos', 'bolsos']
const MARCAS_RESPALDO = ['Guess', 'Tommy Hilfiger', 'Calvin Klein', 'Michael Kors', 'Victoria Secret']

const GENEROS = [
  { value: 'mujer', label: 'Mujer' },
  { value: 'hombre', label: 'Hombre' },
]

const ORIGENES = [
  { value: 'importado', label: 'Importados' },
  { value: 'nacional', label: 'Nacionales' },
]

const PRECIOS = [
  { value: '0-100', label: 'Hasta S/ 100', min: '', max: '100' },
  { value: '100-200', label: 'S/ 100 – 200', min: '100', max: '200' },
  { value: '200-400', label: 'S/ 200 – 400', min: '200', max: '400' },
  { value: '400-', label: 'Más de S/ 400', min: '400', max: '' },
]

const ORDENAMIENTOS = [
  { value: 'created_at-desc', label: 'Más recientes' },
  { value: 'price_original-asc', label: 'Precio: menor a mayor' },
  { value: 'price_original-desc', label: 'Precio: mayor a menor' },
  { value: 'name-asc', label: 'Nombre: A–Z' },
]

const capitalizar = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s)

const FILTROS_VACIOS = {
  categoria: '', marca: '', genero: '', precioMin: '', precioMax: '', origen: '', busqueda: '',
}

const precioActual = (f) => {
  if (!f.precioMin && !f.precioMax) return ''
  const hit = PRECIOS.find((x) => x.min === (f.precioMin || '') && x.max === (f.precioMax || ''))
  return hit ? hit.value : 'custom'
}

// Chip desplegable: un <select> nativo con apariencia de botón.
// En celular abre el selector del sistema, que es lo más cómodo y no se corta en pantalla.
const Chip = ({ id, label, value, onChange, children }) => {
  const activo = value !== ''
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <label htmlFor={id} className="sr-only">{label}</label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          appearance: 'none',
          WebkitAppearance: 'none',
          fontFamily: 'var(--font-sans)',
          fontSize: '0.78rem',
          fontWeight: activo ? 600 : 400,
          color: activo ? p.roseDeep : p.textMain,
          background: activo ? `${p.blush}99` : '#FFFFFF',
          border: `1px solid ${activo ? p.roseDeep : `${p.roseBlush}60`}`,
          borderRadius: '999px',
          padding: '0.5rem 1.9rem 0.5rem 0.9rem',
          cursor: 'pointer',
          outline: 'none',
          maxWidth: '100%',
        }}
      >
        <option value="">{label}</option>
        {children}
      </select>
      <svg
        width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth={2.5} aria-hidden="true"
        style={{
          position: 'absolute', right: '0.8rem', top: '50%', transform: 'translateY(-50%)',
          pointerEvents: 'none', color: activo ? p.roseDeep : p.textSoft,
        }}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
      </svg>
    </div>
  )
}

const FilterBar = ({ filtros, onChangeFiltros, opciones }) => {
  const categorias = opciones?.categorias?.length ? opciones.categorias : CATEGORIAS_RESPALDO
  const marcas = opciones?.marcas?.length ? opciones.marcas : MARCAS_RESPALDO

  const set = (campo, valor) => onChangeFiltros({ ...filtros, [campo]: valor })

  const setPrecio = (valor) => {
    const hit = PRECIOS.find((x) => x.value === valor)
    onChangeFiltros({ ...filtros, precioMin: hit ? hit.min : '', precioMax: hit ? hit.max : '' })
  }

  const limpiarTodo = () =>
    onChangeFiltros({ ...filtros, ...FILTROS_VACIOS, orden: filtros.orden || 'created_at-desc' })

  // Chips de filtros activos, cada uno se quita con la "x"
  const activos = []
  if (filtros.categoria) activos.push({ k: 'categoria', texto: `Categoría: ${capitalizar(filtros.categoria)}`, quitar: () => set('categoria', '') })
  if (filtros.marca) activos.push({ k: 'marca', texto: `Marca: ${filtros.marca}`, quitar: () => set('marca', '') })
  if (filtros.genero) activos.push({ k: 'genero', texto: capitalizar(filtros.genero), quitar: () => set('genero', '') })
  if (filtros.origen) activos.push({ k: 'origen', texto: filtros.origen === 'importado' ? 'Importados' : 'Nacionales', quitar: () => set('origen', '') })
  if (filtros.precioMin || filtros.precioMax) {
    const hit = PRECIOS.find((x) => x.value === precioActual(filtros))
    const texto = hit
      ? hit.label
      : `S/ ${filtros.precioMin || '0'} – ${filtros.precioMax || '∞'}`
    activos.push({ k: 'precio', texto, quitar: () => onChangeFiltros({ ...filtros, precioMin: '', precioMax: '' }) })
  }
  if (filtros.busqueda) activos.push({ k: 'busqueda', texto: `“${filtros.busqueda}”`, quitar: () => set('busqueda', '') })

  return (
    <div style={{ marginBottom: '1.75rem' }}>
      {/* Búsqueda */}
      <div style={{ position: 'relative', marginBottom: '0.9rem' }}>
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={p.textSoft}
          strokeWidth={2} aria-hidden="true"
          style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)' }}
        >
          <circle cx="11" cy="11" r="7" />
          <path strokeLinecap="round" d="M21 21l-4.3-4.3" />
        </svg>
        <input
          type="search"
          aria-label="Buscar producto"
          placeholder="¿Qué estás buscando hoy?"
          value={filtros.busqueda || ''}
          onChange={(e) => set('busqueda', e.target.value)}
          style={{
            width: '100%',
            fontFamily: 'var(--font-sans)',
            fontSize: '0.9rem',
            color: p.textMain,
            background: '#FFFFFF',
            border: `1px solid ${p.roseBlush}60`,
            borderRadius: '999px',
            padding: '0.7rem 1rem 0.7rem 2.5rem',
            outline: 'none',
          }}
        />
      </div>

      {/* Fila de filtros */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
        <Chip id="f-categoria" label="Categoría" value={filtros.categoria || ''} onChange={(v) => set('categoria', v)}>
          {categorias.map((c) => <option key={c} value={c}>{capitalizar(c)}</option>)}
        </Chip>

        <Chip id="f-marca" label="Marca" value={filtros.marca || ''} onChange={(v) => set('marca', v)}>
          {marcas.map((m) => <option key={m} value={m}>{m}</option>)}
        </Chip>

        <Chip id="f-genero" label="Género" value={filtros.genero || ''} onChange={(v) => set('genero', v)}>
          {GENEROS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
        </Chip>

        <Chip id="f-precio" label="Precio" value={precioActual(filtros)} onChange={setPrecio}>
          {PRECIOS.map((x) => <option key={x.value} value={x.value}>{x.label}</option>)}
          {precioActual(filtros) === 'custom' && <option value="custom" disabled>Personalizado</option>}
        </Chip>

        <Chip id="f-origen" label="Origen" value={filtros.origen || ''} onChange={(v) => set('origen', v)}>
          {ORIGENES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </Chip>

        {/* Ordenar, a la derecha */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <label
            htmlFor="f-orden"
            style={{ fontSize: '0.75rem', color: p.textSoft, fontFamily: 'var(--font-sans)' }}
          >
            Ordenar
          </label>
          <select
            id="f-orden"
            value={filtros.orden || 'created_at-desc'}
            onChange={(e) => set('orden', e.target.value)}
            style={{
              fontFamily: 'var(--font-sans)', fontSize: '0.78rem', color: p.textMain,
              background: 'transparent', border: 'none', outline: 'none', cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            {ORDENAMIENTOS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      {/* Filtros activos */}
      {activos.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center', marginTop: '0.9rem' }}>
          {activos.map((a) => (
            <button
              key={a.k}
              type="button"
              onClick={a.quitar}
              aria-label={`Quitar filtro ${a.texto}`}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                fontFamily: 'var(--font-sans)', fontSize: '0.72rem', color: p.textMain,
                background: '#F5EEF0', border: 'none', borderRadius: '999px',
                padding: '0.3rem 0.6rem 0.3rem 0.75rem', cursor: 'pointer',
              }}
            >
              {a.texto}
              <span aria-hidden="true" style={{ fontSize: '0.95rem', lineHeight: 1, color: p.textSoft }}>×</span>
            </button>
          ))}
          <button
            type="button"
            onClick={limpiarTodo}
            style={{
              fontFamily: 'var(--font-sans)', fontSize: '0.72rem', color: p.roseDeep,
              background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer',
              padding: '0.3rem 0.4rem',
            }}
          >
            Limpiar todo
          </button>
        </div>
      )}
    </div>
  )
}

export default FilterBar
