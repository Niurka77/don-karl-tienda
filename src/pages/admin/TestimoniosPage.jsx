import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

const TestimoniosPage = () => {
  const [testimonios, setTestimonios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [editandoId, setEditandoId] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    photo: '',
    comment: '',
    rating: 5,
    active: true,
    sort_order: 0
  })
  const [guardando, setGuardando] = useState(false)
  const [exito, setExito] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    cargarTestimonios()
  }, [])

  const cargarTestimonios = async () => {
    setCargando(true)
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })

    if (!error && data) setTestimonios(data)
    setCargando(false)
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setGuardando(true)
    setError('')
    setExito('')

    try {
      if (editandoId) {
        const { error } = await supabase
          .from('testimonials')
          .update({
            name: formData.name.trim(),
            city: formData.city.trim(),
            photo: formData.photo.trim(),
            comment: formData.comment.trim(),
            rating: parseInt(formData.rating, 10),
            active: formData.active,
            sort_order: formData.sort_order,
            updated_at: new Date()
          })
          .eq('id', editandoId)

        if (error) throw error
        setExito('Testimonio actualizado correctamente')
      } else {
        const { error } = await supabase
          .from('testimonials')
          .insert([{
            name: formData.name.trim(),
            city: formData.city.trim(),
            photo: formData.photo.trim(),
            comment: formData.comment.trim(),
            rating: parseInt(formData.rating, 10),
            active: formData.active,
            sort_order: formData.sort_order
          }])

        if (error) throw error
        setExito('Testimonio agregado correctamente')
      }

      setFormData({ name: '', city: '', photo: '', comment: '', rating: 5, active: true, sort_order: 0 })
      setEditandoId(null)
      setMostrarFormulario(false)
      cargarTestimonios()
    } catch (err) {
      setError(err.message)
    } finally {
      setGuardando(false)
    }
  }

  const handleEditar = (t) => {
    setFormData({
      name: t.name,
      city: t.city || '',
      photo: t.photo || '',
      comment: t.comment,
      rating: t.rating || 5,
      active: t.active,
      sort_order: t.sort_order || 0
    })
    setEditandoId(t.id)
    setMostrarFormulario(true)
  }

  const handleEliminar = async (id) => {
    if (!confirm('¿Eliminar este testimonio permanentemente?')) return

    const { error } = await supabase
      .from('testimonials')
      .delete()
      .eq('id', id)

    if (error) {
      setError(error.message)
    } else {
      setExito('Testimonio eliminado')
      cargarTestimonios()
    }
  }

  const handleToggleActivo = async (id, active) => {
    const { error } = await supabase
      .from('testimonials')
      .update({ active: !active, updated_at: new Date() })
      .eq('id', id)

    if (error) {
      setError(error.message)
    } else {
      cargarTestimonios()
    }
  }

  return (
    <div className="bg-[#FFF8F5] rounded-sm p-6">
      <div className="border-b border-[rgba(212,120,138,0.2)] pb-4 mb-6">
        <div className="w-6 h-px bg-[#D4788A] mb-3"></div>
        <h2 className="font-display text-2xl font-light tracking-[-0.02em] text-[#1A1118]">
          Testimonios de Clientes
        </h2>
        <p className="text-[0.6rem] tracking-[0.25em] uppercase font-sans font-light text-[#9A7480] mt-2">
          Gestiona el carrusel de opiniones que aparece en la tienda
        </p>
      </div>

      {exito && (
        <div className="mb-4 p-3 border-l-2 border-[#D4788A] bg-[#FDF0F3] rounded-sm">
          <p className="text-sm text-[#1A1118] font-sans font-light">{exito}</p>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 border-l-2 border-[#B85268] bg-[#FDF0F3] rounded-sm">
          <p className="text-sm text-[#B85268] font-sans font-light">{error}</p>
        </div>
      )}

      <div className="mb-6">
        <button
          onClick={() => {
            setMostrarFormulario(!mostrarFormulario)
            if (!mostrarFormulario) {
              setEditandoId(null)
              setFormData({ name: '', city: '', photo: '', comment: '', rating: 5, active: true, sort_order: 0 })
            }
          }}
          className="group relative px-5 py-2.5 bg-[#1A1118] text-white rounded-sm text-sm font-sans font-medium tracking-wide overflow-hidden transition-all duration-300 hover:bg-gradient-to-r hover:from-[#D4788A] hover:to-[#B85268]"
        >
          <span className="relative z-10">
            {mostrarFormulario ? 'Cancelar' : '+ Agregar testimonio'}
          </span>
        </button>
      </div>

      {mostrarFormulario && (
        <form onSubmit={handleSubmit} className="mb-8 p-6 bg-white rounded-sm border border-[rgba(212,120,138,0.15)] shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-5 h-px bg-[#D4788A]"></div>
            <h3 className="font-display text-lg font-light tracking-[-0.02em] text-[#1A1118]">
              {editandoId ? 'Editar testimonio' : 'Nuevo testimonio'}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-[0.6rem] tracking-[0.25em] uppercase font-sans font-light text-[#9A7480] mb-2">
                Nombre de la clienta *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Ej: María Fernanda"
                className="w-full border border-[rgba(212,120,138,0.25)] rounded-sm px-4 py-2.5 text-sm font-sans font-light focus:outline-none focus:ring-1 focus:ring-[#D4788A] focus:border-transparent bg-[#FFF8F5]"
              />
            </div>

            <div>
              <label className="block text-[0.6rem] tracking-[0.25em] uppercase font-sans font-light text-[#9A7480] mb-2">
                Ciudad
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Ej: Chiclayo"
                className="w-full border border-[rgba(212,120,138,0.25)] rounded-sm px-4 py-2.5 text-sm font-sans font-light focus:outline-none focus:ring-1 focus:ring-[#D4788A] focus:border-transparent bg-[#FFF8F5]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[0.6rem] tracking-[0.25em] uppercase font-sans font-light text-[#9A7480] mb-2">
                Opinión *
              </label>
              <textarea
                name="comment"
                value={formData.comment}
                onChange={handleChange}
                required
                rows={3}
                placeholder="Lo que dijo la clienta sobre su compra..."
                className="w-full border border-[rgba(212,120,138,0.25)] rounded-sm px-4 py-2.5 text-sm font-sans font-light focus:outline-none focus:ring-1 focus:ring-[#D4788A] focus:border-transparent bg-[#FFF8F5] resize-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[0.6rem] tracking-[0.25em] uppercase font-sans font-light text-[#9A7480] mb-2">
                URL de foto (opcional)
              </label>
              <input
                type="url"
                name="photo"
                value={formData.photo}
                onChange={handleChange}
                placeholder="https://... (si no pones nada se muestra la inicial del nombre)"
                className="w-full border border-[rgba(212,120,138,0.25)] rounded-sm px-4 py-2.5 text-sm font-sans font-light focus:outline-none focus:ring-1 focus:ring-[#D4788A] focus:border-transparent bg-[#FFF8F5]"
              />
            </div>

            <div>
              <label className="block text-[0.6rem] tracking-[0.25em] uppercase font-sans font-light text-[#9A7480] mb-2">
                Calificación (1-5)
              </label>
              <select
                name="rating"
                value={formData.rating}
                onChange={handleChange}
                className="w-full border border-[rgba(212,120,138,0.25)] rounded-sm px-4 py-2.5 text-sm font-sans font-light focus:outline-none focus:ring-1 focus:ring-[#D4788A] focus:border-transparent bg-[#FFF8F5]"
              >
                {[1, 2, 3, 4, 5].map((r) => (
                  <option key={r} value={r}>{r} {r === 1 ? 'estrella' : 'estrellas'}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[0.6rem] tracking-[0.25em] uppercase font-sans font-light text-[#9A7480] mb-2">
                Orden
              </label>
              <input
                type="number"
                name="sort_order"
                value={formData.sort_order}
                onChange={handleChange}
                placeholder="0"
                className="w-full border border-[rgba(212,120,138,0.25)] rounded-sm px-4 py-2.5 text-sm font-sans font-light focus:outline-none focus:ring-1 focus:ring-[#D4788A] focus:border-transparent bg-[#FFF8F5]"
              />
              <p className="text-[0.55rem] text-[#9A7480] mt-1 font-sans">Número menor = aparece primero</p>
            </div>

            <div className="flex items-center md:col-span-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  name="active"
                  checked={formData.active}
                  onChange={handleChange}
                  className="w-4 h-4 rounded-sm border-[rgba(212,120,138,0.35)] text-[#D4788A] focus:ring-[#D4788A] focus:ring-1 focus:ring-offset-0 cursor-pointer"
                />
                <span className="text-sm font-sans font-light text-[#1A1118] group-hover:text-[#D4788A] transition-colors duration-300">
                  Activo (se muestra en la tienda)
                </span>
              </label>
            </div>
          </div>

          <div className="flex gap-3 mt-6 pt-4 border-t border-[rgba(212,120,138,0.1)]">
            <button
              type="submit"
              disabled={guardando}
              className="px-6 py-2.5 bg-[#1A1118] text-white rounded-sm text-sm font-sans font-medium tracking-wide hover:bg-gradient-to-r hover:from-[#D4788A] hover:to-[#B85268] transition-all duration-300 disabled:bg-[#9A7480] disabled:cursor-not-allowed"
            >
              {guardando ? 'Guardando...' : (editandoId ? 'Actualizar' : 'Guardar')}
            </button>
          </div>
        </form>
      )}

      {cargando ? (
        <div className="text-center py-12">
          <div className="inline-block w-6 h-6 border-2 border-[#D4788A] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[#9A7480] font-sans text-sm mt-3">Cargando testimonios...</p>
        </div>
      ) : testimonios.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-[rgba(212,120,138,0.25)] rounded-sm">
          <svg className="w-12 h-12 text-[#9A7480]/40 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <p className="text-[#9A7480] font-sans font-light">No hay testimonios aún</p>
          <p className="text-xs text-[#9A7480]/60 mt-1">Agrega la primera opinión usando el botón de arriba</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[rgba(212,120,138,0.15)]">
                <th className="text-left py-3 text-[0.55rem] tracking-[0.25em] uppercase font-sans font-light text-[#9A7480]">Orden</th>
                <th className="text-left py-3 text-[0.55rem] tracking-[0.25em] uppercase font-sans font-light text-[#9A7480]">Cliente</th>
                <th className="text-left py-3 text-[0.55rem] tracking-[0.25em] uppercase font-sans font-light text-[#9A7480]">Opinión</th>
                <th className="text-left py-3 text-[0.55rem] tracking-[0.25em] uppercase font-sans font-light text-[#9A7480]">Rating</th>
                <th className="text-left py-3 text-[0.55rem] tracking-[0.25em] uppercase font-sans font-light text-[#9A7480]">Estado</th>
                <th className="text-right py-3 text-[0.55rem] tracking-[0.25em] uppercase font-sans font-light text-[#9A7480]">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {testimonios.map((t) => (
                <tr key={t.id} className="border-b border-[rgba(212,120,138,0.08)] hover:bg-[#FDF0F3]/30 transition-colors duration-200">
                  <td className="py-3 text-[#2D2030] font-sans text-sm">{t.sort_order}</td>
                  <td className="py-3">
                    <span className="font-sans text-[#1A1118] text-sm">{t.name}</span>
                    {t.city && (
                      <p className="text-xs text-[#9A7480] mt-0.5">{t.city}</p>
                    )}
                  </td>
                  <td className="py-3">
                    <p className="text-xs text-[#2D2030] max-w-xs truncate font-sans">"{t.comment}"</p>
                  </td>
                  <td className="py-3 text-xs text-[#C9A84C] font-sans">{'★'.repeat(t.rating || 5)}</td>
                  <td className="py-3">
                    <span className={`text-[0.65rem] px-2 py-1 rounded-sm font-sans ${
                      t.active
                        ? 'bg-[#D4788A]/10 text-[#B85268]'
                        : 'bg-gray-100 text-[#9A7480]'
                    }`}>
                      {t.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => handleToggleActivo(t.id, t.active)}
                        className="text-[0.7rem] px-3 py-1 border border-[rgba(212,120,138,0.3)] rounded-sm hover:bg-[#FDF0F3] hover:border-[#D4788A] transition-all duration-200 font-sans"
                      >
                        {t.active ? 'Desactivar' : 'Activar'}
                      </button>
                      <button
                        onClick={() => handleEditar(t)}
                        className="text-[0.7rem] px-3 py-1 border border-[rgba(212,120,138,0.3)] rounded-sm hover:bg-[#FDF0F3] hover:border-[#D4788A] transition-all duration-200 font-sans"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleEliminar(t.id)}
                        className="text-[0.7rem] px-3 py-1 border border-[#B85268]/30 text-[#B85268] rounded-sm hover:bg-[#FDF0F3] hover:border-[#B85268] transition-all duration-200 font-sans"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default TestimoniosPage
