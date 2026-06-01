import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

const AdminVideos = () => {
  const [videos, setVideos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [editandoId, setEditandoId] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tiktok_url: '',
    active: true,
    sort_order: 0
  })
  const [guardando, setGuardando] = useState(false)
  const [exito, setExito] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    cargarVideos()
  }, [])

  const cargarVideos = async () => {
    setCargando(true)
    const { data, error } = await supabase
      .from('social_videos')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })
    
    if (!error && data) setVideos(data)
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
          .from('social_videos')
          .update({
            title: formData.title.trim(),
            description: formData.description.trim(),
            tiktok_url: formData.tiktok_url.trim(),
            active: formData.active,
            sort_order: formData.sort_order,
            updated_at: new Date()
          })
          .eq('id', editandoId)
        
        if (error) throw error
        setExito('Video actualizado correctamente')
      } else {
        const { error } = await supabase
          .from('social_videos')
          .insert([{
            title: formData.title.trim(),
            description: formData.description.trim(),
            tiktok_url: formData.tiktok_url.trim(),
            active: formData.active,
            sort_order: formData.sort_order
          }])
        
        if (error) throw error
        setExito('Video agregado correctamente')
      }

      setFormData({ title: '', description: '', tiktok_url: '', active: true, sort_order: 0 })
      setEditandoId(null)
      setMostrarFormulario(false)
      cargarVideos()
    } catch (err) {
      setError(err.message)
    } finally {
      setGuardando(false)
    }
  }

  const handleEditar = (video) => {
    setFormData({
      title: video.title,
      description: video.description || '',
      tiktok_url: video.tiktok_url,
      active: video.active,
      sort_order: video.sort_order || 0
    })
    setEditandoId(video.id)
    setMostrarFormulario(true)
  }

  const handleEliminar = async (id) => {
    if (!confirm('¿Eliminar este video permanentemente?')) return
    
    const { error } = await supabase
      .from('social_videos')
      .delete()
      .eq('id', id)
    
    if (error) {
      setError(error.message)
    } else {
      setExito('Video eliminado')
      cargarVideos()
    }
  }

  const handleToggleActivo = async (id, active) => {
    const { error } = await supabase
      .from('social_videos')
      .update({ active: !active, updated_at: new Date() })
      .eq('id', id)
    
    if (error) {
      setError(error.message)
    } else {
      cargarVideos()
    }
  }

  return (
    <div className="bg-[#FFF8F5] rounded-sm p-6">
      <div className="border-b border-[rgba(212,120,138,0.2)] pb-4 mb-6">
        <div className="w-6 h-px bg-[#D4788A] mb-3"></div>
        <h2 className="font-['Cormorant_Garamond'] text-2xl font-light tracking-[-0.02em] text-[#1A1118]">
          Galeria de Videos TikTok
        </h2>
        <p className="text-xs text-[#9A7480] font-['DM_Sans'] mt-2">
          Gestiona los videos que aparecen en la galeria de la tienda
        </p>
      </div>

      {exito && (
        <div className="mb-4 p-3 border border-[#D4788A] bg-[#F2C4CE] bg-opacity-30 rounded-sm">
          <p className="text-sm text-[#1A1118] font-['DM_Sans']">{exito}</p>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 border border-[#B85268] bg-[#FDF0F3] rounded-sm">
          <p className="text-sm text-[#B85268] font-['DM_Sans']">{error}</p>
        </div>
      )}

      <div className="mb-6">
        <button
          onClick={() => {
            setMostrarFormulario(!mostrarFormulario)
            if (!mostrarFormulario) {
              setEditandoId(null)
              setFormData({ title: '', description: '', tiktok_url: '', active: true, sort_order: 0 })
            }
          }}
          className="px-4 py-2 bg-[#1A1118] text-white rounded-sm text-sm font-['DM_Sans'] font-medium tracking-wide hover:bg-gradient-to-r hover:from-[#D4788A] hover:to-[#B85268] transition-all duration-300"
        >
          {mostrarFormulario ? 'Cancelar' : '+ Agregar video'}
        </button>
      </div>

      {mostrarFormulario && (
        <form onSubmit={handleSubmit} className="mb-8 p-6 bg-[#FDF0F3] rounded-sm border border-[rgba(212,120,138,0.2)]">
          <h3 className="font-['Cormorant_Garamond'] text-xl font-light tracking-[-0.02em] text-[#1A1118] mb-4">
            {editandoId ? 'Editar video' : 'Nuevo video'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-[0.6rem] tracking-[0.25em] uppercase font-['DM_Sans'] font-light text-[#9A7480] mb-2">
                Titulo *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="Ej: Vestido Tommy Hilfiger"
                className="w-full border border-[rgba(212,120,138,0.25)] rounded-sm px-4 py-2.5 text-sm font-['DM_Sans'] font-light focus:outline-none focus:ring-1 focus:ring-[#D4788A] focus:border-transparent bg-white"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-[0.6rem] tracking-[0.25em] uppercase font-['DM_Sans'] font-light text-[#9A7480] mb-2">
                URL de TikTok *
              </label>
              <input
                type="url"
                name="tiktok_url"
                value={formData.tiktok_url}
                onChange={handleChange}
                required
                placeholder="https://www.tiktok.com/@kb.dresses.more/video/..."
                className="w-full border border-[rgba(212,120,138,0.25)] rounded-sm px-4 py-2.5 text-sm font-['DM_Sans'] font-light focus:outline-none focus:ring-1 focus:ring-[#D4788A] focus:border-transparent bg-white"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-[0.6rem] tracking-[0.25em] uppercase font-['DM_Sans'] font-light text-[#9A7480] mb-2">
                Descripcion
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={2}
                placeholder="Descripcion del video (opcional)"
                className="w-full border border-[rgba(212,120,138,0.25)] rounded-sm px-4 py-2.5 text-sm font-['DM_Sans'] font-light focus:outline-none focus:ring-1 focus:ring-[#D4788A] focus:border-transparent bg-white resize-none"
              />
            </div>
            
            <div>
              <label className="block text-[0.6rem] tracking-[0.25em] uppercase font-['DM_Sans'] font-light text-[#9A7480] mb-2">
                Orden
              </label>
              <input
                type="number"
                name="sort_order"
                value={formData.sort_order}
                onChange={handleChange}
                placeholder="0"
                className="w-full border border-[rgba(212,120,138,0.25)] rounded-sm px-4 py-2.5 text-sm font-['DM_Sans'] font-light focus:outline-none focus:ring-1 focus:ring-[#D4788A] focus:border-transparent bg-white"
              />
              <p className="text-xs text-[#9A7480] mt-1">Numero menor = aparece primero</p>
            </div>
            
            <div className="flex items-center">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="active"
                  checked={formData.active}
                  onChange={handleChange}
                  className="w-5 h-5 rounded-sm border-[rgba(212,120,138,0.35)] text-[#D4788A] focus:ring-[#D4788A] focus:ring-1 focus:ring-offset-0 cursor-pointer"
                />
                <span className="text-sm font-['DM_Sans'] text-[#1A1118]">Activo (se muestra en la tienda)</span>
              </label>
            </div>
          </div>
          
          <div className="flex gap-3 mt-6">
            <button
              type="submit"
              disabled={guardando}
              className="px-6 py-2.5 bg-[#1A1118] text-white rounded-sm text-sm font-['DM_Sans'] font-medium tracking-wide hover:bg-gradient-to-r hover:from-[#D4788A] hover:to-[#B85268] transition-all duration-300 disabled:bg-[#9A7480]"
            >
              {guardando ? 'Guardando...' : (editandoId ? 'Actualizar' : 'Guardar')}
            </button>
          </div>
        </form>
      )}

      {cargando ? (
        <div className="text-center py-8">
          <p className="text-[#9A7480] font-['DM_Sans']">Cargando videos...</p>
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-[rgba(212,120,138,0.25)] rounded-sm">
          <p className="text-[#9A7480] font-['DM_Sans']">No hay videos aun</p>
          <p className="text-xs text-[#9A7480] mt-1">Agrega tu primer video usando el boton de arriba</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[rgba(212,120,138,0.15)]">
                <th className="text-left py-3 text-[0.6rem] tracking-[0.25em] uppercase font-['DM_Sans'] font-light text-[#9A7480]">Orden</th>
                <th className="text-left py-3 text-[0.6rem] tracking-[0.25em] uppercase font-['DM_Sans'] font-light text-[#9A7480]">Titulo</th>
                <th className="text-left py-3 text-[0.6rem] tracking-[0.25em] uppercase font-['DM_Sans'] font-light text-[#9A7480]">Estado</th>
                <th className="text-left py-3 text-[0.6rem] tracking-[0.25em] uppercase font-['DM_Sans'] font-light text-[#9A7480]">Fecha</th>
                <th className="text-right py-3 text-[0.6rem] tracking-[0.25em] uppercase font-['DM_Sans'] font-light text-[#9A7480]">Acciones</th>
               </tr>
            </thead>
            <tbody>
              {videos.map((video) => (
                <tr key={video.id} className="border-b border-[rgba(212,120,138,0.1)]">
                  <td className="py-3 text-[#2D2030] font-['DM_Sans']">{video.sort_order}</td>
                  <td className="py-3">
                    <span className="font-['DM_Sans'] text-[#1A1118]">{video.title}</span>
                    {video.description && (
                      <p className="text-xs text-[#9A7480] mt-0.5 max-w-xs truncate">{video.description}</p>
                    )}
                  </td>
                  <td className="py-3">
                    <span className={`text-xs px-2 py-1 rounded-sm ${video.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {video.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="py-3 text-xs text-[#9A7480] font-['DM_Sans']">
                    {new Date(video.created_at).toLocaleDateString('es-PE')}
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => handleToggleActivo(video.id, video.active)}
                        className="text-xs px-3 py-1 border border-[rgba(212,120,138,0.3)] rounded-sm hover:bg-[#FDF0F3] transition-colors"
                      >
                        {video.active ? 'Desactivar' : 'Activar'}
                      </button>
                      <button
                        onClick={() => handleEditar(video)}
                        className="text-xs px-3 py-1 border border-[rgba(212,120,138,0.3)] rounded-sm hover:bg-[#FDF0F3] transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleEliminar(video.id)}
                        className="text-xs px-3 py-1 border border-[#B85268] text-[#B85268] rounded-sm hover:bg-[#FDF0F3] transition-colors"
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

export default AdminVideos