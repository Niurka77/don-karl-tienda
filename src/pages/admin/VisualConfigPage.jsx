import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useSiteConfigStore from '../../store/siteConfigStore'
import { supabase } from '../../lib/supabase'

const SECTIONS = [
  { key: 'hero', label: 'Hero Principal', anchor: '#hero-section' },
  { key: 'catalog', label: 'Catálogo', anchor: '#product-grid-section' },
  { key: 'footer', label: 'Footer', anchor: '#footer' },
]

const BLENDS = [
  { value: 'multiply', label: 'Multiply' },
  { value: 'overlay', label: 'Overlay' },
  { value: 'soft-light', label: 'Soft Light' },
  { value: 'normal', label: 'Normal' },
]

const PRESET_TEXTURES = [
  { name: 'Papel antiguo', url: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&q=60' },
  { name: 'Mármol rosa', url: 'https://images.unsplash.com/photo-1553095066-5e3ef3b68385?w=400&q=60' },
  { name: 'Tela texturizada', url: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400&q=60' },
  { name: 'Granito claro', url: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=400&q=60' },
]

// Mapeo de tabs a destinos de "Ver resultado"
const TAB_VIEW_MAP = {
  textures: '/',
  decorations: '/',
  texts: '/',
  colors: '/',
}

function Toast({ message, type, onClose }) {
  if (!message) return null
  const bg = type === 'success' ? 'bg-[#2E7D32]' : type === 'error' ? 'bg-[#E53935]' : 'bg-[#C9A84C]'
  const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'

  return (
    <div
      className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-3 rounded-sm shadow-lg text-white text-sm font-['DM_Sans'] animate-slide-in ${bg}`}
      style={{ animation: 'slide-in 0.3s cubic-bezier(0.16,1,0.3,1)' }}
    >
      <span className="text-lg font-bold">{icon}</span>
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100 text-lg">✕</button>
    </div>
  )
}

export default function VisualConfigPage() {
  const navigate = useNavigate()
  const { config, saveConfig } = useSiteConfigStore()
  const [activeTab, setActiveTab] = useState('textures')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState({ message: '', type: '' })

  // Estado local para cambios pendientes (no guardados aún)
  const [localConfig, setLocalConfig] = useState({ ...config })

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast({ message: '', type: '' }), 4000)
  }

  // Actualizar textura en estado local
  const updateTextureLocal = (section, texture) => {
    setLocalConfig((prev) => ({
      ...prev,
      textures: { ...prev.textures, [section]: texture },
    }))
  }

  // Actualizar decoración en estado local
  const updateDecorationLocal = (id, updates) => {
    setLocalConfig((prev) => ({
      ...prev,
      decorations: prev.decorations.map((d) => (d.id === id ? { ...d, ...updates } : d)),
    }))
  }

  // Eliminar decoración en estado local
  const removeDecorationLocal = (id) => {
    setLocalConfig((prev) => ({
      ...prev,
      decorations: prev.decorations.filter((d) => d.id !== id),
    }))
  }

  // Agregar decoración en estado local
  const addDecorationLocal = (decoration) => {
    setLocalConfig((prev) => ({
      ...prev,
      decorations: [...prev.decorations, { ...decoration, id: Date.now().toString() }],
    }))
  }

  // Actualizar texto en estado local
  const updateTextLocal = (key, value) => {
    setLocalConfig((prev) => ({
      ...prev,
      texts: { ...prev.texts, [key]: value },
    }))
  }

  // Actualizar color en estado local
  const updateColorLocal = (key, value) => {
    setLocalConfig((prev) => ({
      ...prev,
      customColors: { ...prev.customColors, [key]: value },
    }))
  }

  // GUARDAR todos los cambios
  const handleSave = async () => {
    setSaving(true)
    try {
      await saveConfig(localConfig)
      showToast('Cambios guardados correctamente', 'success')
    } catch (err) {
      console.error('Error saving:', err)
      showToast('Error al guardar: ' + err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  // Ver resultado en la tienda
  const handleViewResult = () => {
    navigate('/')
  }

  // Upload texture
  const handleUploadTexture = async (section, file) => {
    setUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `texture-${section}-${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('site-assets')
        .upload(fileName, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('site-assets')
        .getPublicUrl(fileName)

      updateTextureLocal(section, {
        ...localConfig.textures[section],
        url: publicUrl,
      })
      showToast('Textura subida. Presiona "Guardar" para aplicar.', 'info')
    } catch (err) {
      console.error('Error uploading texture:', err)
      showToast('Error subiendo textura: ' + err.message, 'error')
    } finally {
      setUploading(false)
    }
  }

  // Upload decoration
  const handleUploadDecoration = async (file, section) => {
    setUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `deco-${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('site-assets')
        .upload(fileName, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('site-assets')
        .getPublicUrl(fileName)

      addDecorationLocal({
        url: publicUrl,
        section,
        position: { top: '10%', left: '10%' },
        size: { width: '150px', height: 'auto' },
        opacity: 0.15,
        rotation: 0,
      })
      showToast('Decoración agregada. Presiona "Guardar" para aplicar.', 'info')
    } catch (err) {
      console.error('Error uploading decoration:', err)
      showToast('Error subiendo decoración: ' + err.message, 'error')
    } finally {
      setUploading(false)
    }
  }

  // Verificar si hay cambios sin guardar
  const hasChanges = JSON.stringify(localConfig) !== JSON.stringify(config)

  return (
    <div className="min-h-screen bg-[#FDFAF9] p-6 lg:p-10">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: '' })} />

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-10 gap-4">
          <div>
            <h1 className="font-['Cormorant_Garamond'] text-3xl font-light text-[#1A1118] mb-2">
              Configuración Visual
            </h1>
            <p className="text-sm text-[#9A7480] font-['DM_Sans']">
              Controla texturas, decoraciones, colores y textos de tu tienda
            </p>
          </div>

          {/* Botones de acción */}
          <div className="flex items-center gap-3">
            {hasChanges && (
              <span className="text-[0.65rem] text-[#C9A84C] font-['DM_Sans'] font-medium animate-pulse">
                ● Cambios sin guardar
              </span>
            )}

            <button
              onClick={handleViewResult}
              className="flex items-center gap-2 px-4 py-2.5 text-[0.65rem] font-['DM_Sans'] font-medium tracking-widest uppercase border border-[rgba(212,120,138,0.2)] rounded-sm hover:bg-[#FDF0F3] transition-colors text-[#9A7480]"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Ver resultado
            </button>

            <button
              onClick={handleSave}
              disabled={saving || !hasChanges}
              className={`flex items-center gap-2 px-5 py-2.5 text-[0.65rem] font-['DM_Sans'] font-semibold tracking-widest uppercase rounded-sm transition-all ${
                hasChanges
                  ? 'bg-[#1A1118] text-white hover:bg-[#2D2030] shadow-md'
                  : 'bg-[#F0E8E4] text-[#9A7480] cursor-not-allowed'
              }`}
            >
              {saving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Guardar cambios
                </>
              )}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 border-b border-[rgba(212,120,138,0.15)]">
          {[
            { key: 'textures', label: 'Texturas' },
            { key: 'decorations', label: 'Decoraciones' },
            { key: 'texts', label: 'Textos' },
            { key: 'colors', label: 'Colores' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-3 text-xs font-['DM_Sans'] font-medium tracking-widest uppercase transition-colors ${
                activeTab === tab.key
                  ? 'text-[#1A1118] border-b-2 border-[#D4788A]'
                  : 'text-[#9A7480] hover:text-[#4A3340]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TEXTURES TAB */}
        {activeTab === 'textures' && (
          <div className="space-y-8">
            <p className="text-xs text-[#9A7480] font-['DM_Sans']">
              Sube una textura para cada sección. Se aplicará como capa fina con transparencia controlable. Presiona <strong>"Guardar"</strong> para aplicar los cambios.
            </p>

            {SECTIONS.map(({ key, label }) => (
              <div key={key} className="bg-white rounded-sm border border-[rgba(212,120,138,0.12)] p-6">
                <h3 className="font-['Cormorant_Garamond'] text-lg text-[#1A1118] mb-4">{label}</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="relative aspect-video bg-[#FDF0F3] rounded-sm overflow-hidden">
                    {localConfig.textures[key]?.url ? (
                      <div className="relative w-full h-full">
                        <div className="absolute inset-0 bg-[#FDFAF9]" />
                        <img
                          src={localConfig.textures[key].url}
                          alt={`Textura ${label}`}
                          className="absolute inset-0 w-full h-full object-cover"
                          style={{
                            mixBlendMode: localConfig.textures[key].blend,
                            opacity: localConfig.textures[key].opacity,
                          }}
                        />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full text-xs text-[#9A7480]">
                        Sin textura
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-[#4A3340] mb-2 font-['DM_Sans']">Subir imagen</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files[0]) handleUploadTexture(key, e.target.files[0])
                        }}
                        className="text-xs text-[#9A7480] file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:text-xs file:font-medium file:bg-[#FDF0F3] file:text-[#D4788A] hover:file:bg-[#F2C4CE]"
                        disabled={uploading}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#4A3340] mb-2 font-['DM_Sans']">Texturas predefinidas</label>
                      <div className="flex flex-wrap gap-2">
                        {PRESET_TEXTURES.map((tex) => (
                          <button
                            key={tex.name}
                            onClick={() => updateTextureLocal(key, { ...localConfig.textures[key], url: tex.url })}
                            className="px-3 py-1.5 text-[0.65rem] font-['DM_Sans'] border border-[rgba(212,120,138,0.2)] rounded-sm hover:bg-[#FDF0F3] transition-colors"
                          >
                            {tex.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#4A3340] mb-2 font-['DM_Sans']">
                        Opacidad: {Math.round((localConfig.textures[key]?.opacity || 0) * 100)}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="0.3"
                        step="0.01"
                        value={localConfig.textures[key]?.opacity || 0}
                        onChange={(e) =>
                          updateTextureLocal(key, { ...localConfig.textures[key], opacity: parseFloat(e.target.value) })
                        }
                        className="w-full accent-[#D4788A]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#4A3340] mb-2 font-['DM_Sans']">Modo de fusión</label>
                      <select
                        value={localConfig.textures[key]?.blend || 'multiply'}
                        onChange={(e) =>
                          updateTextureLocal(key, { ...localConfig.textures[key], blend: e.target.value })
                        }
                        className="w-full px-3 py-2 text-xs border border-[rgba(212,120,138,0.2)] rounded-sm bg-white text-[#1A1118] font-['DM_Sans']"
                      >
                        {BLENDS.map((b) => (
                          <option key={b.value} value={b.value}>{b.label}</option>
                        ))}
                      </select>
                    </div>

                    {localConfig.textures[key]?.url && (
                      <button
                        onClick={() => updateTextureLocal(key, { url: '', opacity: 0.04, blend: 'multiply' })}
                        className="text-xs text-[#E53935] hover:underline font-['DM_Sans']"
                      >
                        Eliminar textura
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* DECORATIONS TAB */}
        {activeTab === 'decorations' && (
          <div className="space-y-6">
            <p className="text-xs text-[#9A7480] font-['DM_Sans']">
              Sube imágenes decorativas (flores, sellos, marcos). Presiona <strong>"Guardar"</strong> para aplicar.
            </p>

            <div className="bg-white rounded-sm border border-[rgba(212,120,138,0.12)] p-6">
              <h3 className="font-['Cormorant_Garamond'] text-lg text-[#1A1118] mb-4">Agregar decoración</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#4A3340] mb-2 font-['DM_Sans']">Imagen</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files[0]) handleUploadDecoration(e.target.files[0], 'global')
                    }}
                    className="text-xs text-[#9A7480] file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:text-xs file:font-medium file:bg-[#FDF0F3] file:text-[#D4788A] hover:file:bg-[#F2C4CE]"
                    disabled={uploading}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#4A3340] mb-2 font-['DM_Sans']">Sección</label>
                  <select
                    id="deco-section"
                    className="w-full px-3 py-2 text-xs border border-[rgba(212,120,138,0.2)] rounded-sm bg-white text-[#1A1118] font-['DM_Sans']"
                  >
                    <option value="global">Global (todas las páginas)</option>
                    <option value="hero">Solo Hero</option>
                    <option value="catalog">Solo Catálogo</option>
                    <option value="footer">Solo Footer</option>
                  </select>
                </div>
              </div>
            </div>

            {localConfig.decorations.length === 0 ? (
              <p className="text-xs text-[#9A7480] font-['DM_Sans'] text-center py-8">
                No hay decoraciones configuradas
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {localConfig.decorations.map((deco) => (
                  <div key={deco.id} className="bg-white rounded-sm border border-[rgba(212,120,138,0.12)] p-4">
                    <div className="flex gap-4">
                      <img src={deco.url} alt="Decoración" className="w-20 h-20 object-contain" />
                      <div className="flex-1 space-y-2">
                        <div>
                          <label className="block text-[0.6rem] text-[#9A7480] mb-1 font-['DM_Sans']">Opacidad: {Math.round((deco.opacity || 0.15) * 100)}%</label>
                          <input type="range" min="0" max="1" step="0.05" value={deco.opacity || 0.15}
                            onChange={(e) => updateDecorationLocal(deco.id, { opacity: parseFloat(e.target.value) })}
                            className="w-full accent-[#D4788A]" />
                        </div>
                        <div>
                          <label className="block text-[0.6rem] text-[#9A7480] mb-1 font-['DM_Sans']">Rotación: {deco.rotation || 0}°</label>
                          <input type="range" min="-180" max="180" step="5" value={deco.rotation || 0}
                            onChange={(e) => updateDecorationLocal(deco.id, { rotation: parseInt(e.target.value) })}
                            className="w-full accent-[#D4788A]" />
                        </div>
                        <div>
                          <label className="block text-[0.6rem] text-[#9A7480] mb-1 font-['DM_Sans']">Ancho: {deco.size?.width || '150px'}</label>
                          <input type="range" min="50" max="500" step="10" value={parseInt(deco.size?.width) || 150}
                            onChange={(e) => updateDecorationLocal(deco.id, { size: { ...deco.size, width: `${e.target.value}px` } })}
                            className="w-full accent-[#D4788A]" />
                        </div>
                        <button onClick={() => removeDecorationLocal(deco.id)}
                          className="text-xs text-[#E53935] hover:underline font-['DM_Sans']">
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TEXTS TAB */}
        {activeTab === 'texts' && (
          <div className="space-y-6">
            <p className="text-xs text-[#9A7480] font-['DM_Sans']">
              Edita los textos de la tienda. Presiona <strong>"Guardar"</strong> para aplicar los cambios.
            </p>

            {Object.entries(localConfig.texts).map(([key, value]) => (
              <div key={key} className="bg-white rounded-sm border border-[rgba(212,120,138,0.12)] p-4">
                <label className="block text-xs font-medium text-[#4A3340] mb-2 font-['DM_Sans'] capitalize">
                  {key.replace(/_/g, ' ')}
                </label>
                {value.length > 80 ? (
                  <textarea
                    value={value}
                    onChange={(e) => updateTextLocal(key, e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 text-xs border border-[rgba(212,120,138,0.2)] rounded-sm bg-white text-[#1A1118] font-['DM_Sans'] resize-none focus:outline-none focus:border-[#D4788A]"
                  />
                ) : (
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => updateTextLocal(key, e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[rgba(212,120,138,0.2)] rounded-sm bg-white text-[#1A1118] font-['DM_Sans'] focus:outline-none focus:border-[#D4788A]"
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* COLORS TAB */}
        {activeTab === 'colors' && (
          <div className="space-y-6">
            <p className="text-xs text-[#9A7480] font-['DM_Sans']">
              Personaliza los colores principales. Presiona <strong>"Guardar"</strong> para aplicar.
            </p>

            {Object.entries(localConfig.customColors).map(([key, value]) => (
              <div key={key} className="bg-white rounded-sm border border-[rgba(212,120,138,0.12)] p-4 flex items-center gap-4">
                <input
                  type="color"
                  value={value}
                  onChange={(e) => updateColorLocal(key, e.target.value)}
                  className="w-12 h-12 rounded-sm border border-[rgba(212,120,138,0.2)] cursor-pointer"
                />
                <div>
                  <label className="block text-xs font-medium text-[#4A3340] font-['DM_Sans'] capitalize">
                    {key === 'primary' ? 'Color principal' : key === 'accent' ? 'Color acento' : 'Fondo'}
                  </label>
                  <p className="text-[0.65rem] text-[#9A7480] font-['DM_Sans']">{value}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Botón guardar inferior (barra fija) */}
        {hasChanges && (
          <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-[rgba(212,120,138,0.15)] p-4 z-50">
            <div className="max-w-5xl mx-auto flex items-center justify-between">
              <span className="text-xs text-[#C9A84C] font-['DM_Sans'] font-medium">
                Tienes cambios sin guardar
              </span>
              <div className="flex gap-3">
                <button
                  onClick={() => { setLocalConfig({ ...config }); showToast('Cambios descartados', 'info') }}
                  className="px-4 py-2 text-[0.65rem] font-['DM_Sans'] font-medium tracking-widest uppercase border border-[rgba(212,120,138,0.2)] rounded-sm hover:bg-[#FDF0F3] transition-colors text-[#9A7480]"
                >
                  Descartar
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2 text-[0.65rem] font-['DM_Sans'] font-semibold tracking-widest uppercase bg-[#1A1118] text-white rounded-sm hover:bg-[#2D2030] shadow-md transition-all"
                >
                  {saving ? (
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  Guardar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
