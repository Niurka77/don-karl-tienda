import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAdminNotifications } from '../../hooks/useAdminNotifications'

export default function DiscountCodesPage() {
  const [codes, setCodes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCode, setEditingCode] = useState(null)
  const { agregarToast, ToastContainer } = useAdminNotifications()

  const [formData, setFormData] = useState({
    code: '',
    discount_percent: '',
    min_purchase: '0',
    max_uses: '0',
    expires_at: '',
  })

  useEffect(() => {
    loadCodes()
  }, [])

  const loadCodes = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('discount_codes')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) {
      agregarToast('Error al cargar códigos', 'error')
    } else {
      setCodes(data || [])
    }
    setLoading(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.code.trim() || !formData.discount_percent) {
      agregarToast('Completa código y porcentaje', 'error')
      return
    }

    const payload = {
      code: formData.code.trim().toUpperCase(),
      discount_percent: parseInt(formData.discount_percent),
      min_purchase: parseFloat(formData.min_purchase) || 0,
      max_uses: parseInt(formData.max_uses) || 0,
      expires_at: formData.expires_at || null,
      active: true,
    }

    if (editingCode) {
      const { error } = await supabase
        .from('discount_codes')
        .update(payload)
        .eq('id', editingCode.id)
      if (error) {
        if (error.code === '23505') {
          agregarToast('Ese código ya existe', 'error')
        } else {
          agregarToast('Error: ' + error.message, 'error')
        }
        return
      }
      agregarToast('Código actualizado', 'success')
    } else {
      const { error } = await supabase.from('discount_codes').insert([payload])
      if (error) {
        if (error.code === '23505') {
          agregarToast('Ese código ya existe', 'error')
        } else {
          agregarToast('Error: ' + error.message, 'error')
        }
        return
      }
      agregarToast('Código creado', 'success')
    }

    setShowForm(false)
    setEditingCode(null)
    setFormData({ code: '', discount_percent: '', min_purchase: '0', max_uses: '0', expires_at: '' })
    loadCodes()
  }

  const handleEdit = (code) => {
    setEditingCode(code)
    setFormData({
      code: code.code,
      discount_percent: code.discount_percent.toString(),
      min_purchase: (code.min_purchase || 0).toString(),
      max_uses: (code.max_uses || 0).toString(),
      expires_at: code.expires_at ? code.expires_at.split('T')[0] : '',
    })
    setShowForm(true)
  }

  const handleToggleActive = async (id, currentActive) => {
    const { error } = await supabase
      .from('discount_codes')
      .update({ active: !currentActive })
      .eq('id', id)
    if (error) {
      agregarToast('Error al actualizar', 'error')
    } else {
      loadCodes()
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este código?')) return
    const { error } = await supabase.from('discount_codes').delete().eq('id', id)
    if (error) {
      agregarToast('Error al eliminar', 'error')
    } else {
      agregarToast('Código eliminado', 'success')
      loadCodes()
    }
  }

  return (
    <div className="min-h-screen bg-[#FDFAF9] p-6 lg:p-10">
      <ToastContainer />
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-['Cormorant_Garamond'] text-3xl font-light text-[#1A1118] mb-1">
              Códigos de Descuento
            </h1>
            <p className="text-sm text-[#9A7480] font-['DM_Sans']">
              Crea códigos que los clientes usan al comprar
            </p>
          </div>
          <button
            onClick={() => { setShowForm(true); setEditingCode(null); setFormData({ code: '', discount_percent: '', min_purchase: '0', max_uses: '0', expires_at: '' }) }}
            className="px-5 py-2.5 bg-[#1A1118] text-white text-xs font-['DM_Sans'] font-semibold tracking-widest uppercase rounded-sm hover:bg-[#2D2030] transition-colors"
          >
            + Nuevo Código
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-sm border border-[rgba(212,120,138,0.12)] p-6 mb-8">
            <h2 className="font-['Cormorant_Garamond'] text-xl text-[#1A1118] mb-4">
              {editingCode ? 'Editar Código' : 'Nuevo Código'}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[0.6rem] tracking-[0.25em] uppercase font-['DM_Sans'] font-light text-[#9A7480] mb-1">
                  Código *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="EJ: VERANO20"
                  className="w-full border border-[rgba(212,120,138,0.25)] rounded-sm px-4 py-2.5 text-sm font-['DM_Sans'] uppercase focus:outline-none focus:ring-1 focus:ring-[#D4788A]"
                />
              </div>
              <div>
                <label className="block text-[0.6rem] tracking-[0.25em] uppercase font-['DM_Sans'] font-light text-[#9A7480] mb-1">
                  Descuento (%) *
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.discount_percent}
                  onChange={(e) => setFormData({ ...formData, discount_percent: e.target.value })}
                  placeholder="10"
                  className="w-full border border-[rgba(212,120,138,0.25)] rounded-sm px-4 py-2.5 text-sm font-['DM_Sans'] focus:outline-none focus:ring-1 focus:ring-[#D4788A]"
                />
              </div>
              <div>
                <label className="block text-[0.6rem] tracking-[0.25em] uppercase font-['DM_Sans'] font-light text-[#9A7480] mb-1">
                  Compra mínima (S/)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.min_purchase}
                  onChange={(e) => setFormData({ ...formData, min_purchase: e.target.value })}
                  placeholder="0"
                  className="w-full border border-[rgba(212,120,138,0.25)] rounded-sm px-4 py-2.5 text-sm font-['DM_Sans'] focus:outline-none focus:ring-1 focus:ring-[#D4788A]"
                />
              </div>
              <div>
                <label className="block text-[0.6rem] tracking-[0.25em] uppercase font-['DM_Sans'] font-light text-[#9A7480] mb-1">
                  Usos máximos (0 = ilimitado)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.max_uses}
                  onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
                  placeholder="0"
                  className="w-full border border-[rgba(212,120,138,0.25)] rounded-sm px-4 py-2.5 text-sm font-['DM_Sans'] focus:outline-none focus:ring-1 focus:ring-[#D4788A]"
                />
              </div>
              <div>
                <label className="block text-[0.6rem] tracking-[0.25em] uppercase font-['DM_Sans'] font-light text-[#9A7480] mb-1">
                  Vence el
                </label>
                <input
                  type="date"
                  value={formData.expires_at}
                  onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                  className="w-full border border-[rgba(212,120,138,0.25)] rounded-sm px-4 py-2.5 text-sm font-['DM_Sans'] focus:outline-none focus:ring-1 focus:ring-[#D4788A]"
                />
              </div>
              <div className="flex items-end gap-3">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#1A1118] text-white text-xs font-['DM_Sans'] font-semibold tracking-widest uppercase rounded-sm hover:bg-[#2D2030] transition-colors"
                >
                  {editingCode ? 'Actualizar' : 'Crear'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setEditingCode(null) }}
                  className="px-6 py-2.5 border border-[rgba(212,120,138,0.25)] text-[#9A7480] text-xs font-['DM_Sans'] tracking-widest uppercase rounded-sm hover:bg-[#FDF0F3] transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <p className="text-sm text-[#9A7480] font-['DM_Sans'] text-center py-12">Cargando...</p>
        ) : codes.length === 0 ? (
          <p className="text-sm text-[#9A7480] font-['DM_Sans'] text-center py-12">No hay códigos creados</p>
        ) : (
          <div className="space-y-3">
            {codes.map((c) => (
              <div key={c.id} className="bg-white rounded-sm border border-[rgba(212,120,138,0.12)] p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-sm bg-[#FDF0F3] flex items-center justify-center">
                    <span className="font-['DM_Sans'] font-bold text-lg text-[#D4788A]">-{c.discount_percent}%</span>
                  </div>
                  <div>
                    <p className="font-['DM_Sans'] font-semibold text-[#1A1118] text-sm tracking-wider">{c.code}</p>
                    <p className="text-xs text-[#9A7480] font-['DM_Sans'] mt-0.5">
                      {c.min_purchase > 0 ? `Mínimo S/ ${c.min_purchase}` : 'Sin mínimo'}
                      {c.max_uses > 0 ? ` · ${c.used_count}/${c.max_uses} usos` : ' · Ilimitado'}
                      {c.expires_at && ` · Vence ${new Date(c.expires_at).toLocaleDateString()}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleActive(c.id, c.active)}
                    className={`px-3 py-1.5 text-xs font-['DM_Sans'] rounded-sm border transition-colors ${
                      c.active
                        ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                        : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {c.active ? 'Activo' : 'Inactivo'}
                  </button>
                  <button
                    onClick={() => handleEdit(c)}
                    className="px-3 py-1.5 text-xs font-['DM_Sans'] text-[#D4788A] border border-[rgba(212,120,138,0.2)] rounded-sm hover:bg-[#FDF0F3] transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="px-3 py-1.5 text-xs font-['DM_Sans'] text-red-500 border border-red-200 rounded-sm hover:bg-red-50 transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
