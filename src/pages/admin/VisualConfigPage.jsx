import { useState } from 'react'
import useSiteConfigStore from '../../store/siteConfigStore'
import { supabase } from '../../lib/supabase'

const SECTIONS = [
  { key: 'hero', label: 'Hero Principal', anchor: '/' },
  { key: 'trust', label: 'Barra de Confianza', anchor: '/' },
  { key: 'categories', label: 'Categorías', anchor: '/' },
  { key: 'catalog', label: 'Catálogo', anchor: '/#product-grid-section' },
  { key: 'videos', label: 'Videos / Redes', anchor: '/' },
  { key: 'footer', label: 'Footer', anchor: '/#footer' },
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

function Toast({ message, type, onView }) {
  if (!message) return null
  const bg = type === 'success' ? 'bg-[#2E7D32]' : type === 'error' ? 'bg-[#E53935]' : 'bg-[#C9A84C]'
  const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'

  return (
    <div
      className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-3 rounded-sm shadow-lg text-white text-sm font-['DM_Sans'] ${bg}`}
      style={{ animation: 'slide-in 0.3s cubic-bezier(0.16,1,0.3,1)' }}
    >
      <span className="text-lg font-bold">{icon}</span>
      <span>{message}</span>
      {onView && (
        <button
          onClick={() => window.open('/', '_blank')}
          className="ml-2 px-3 py-1 bg-white/20 rounded-sm text-xs font-semibold hover:bg-white/30 transition-colors"
        >
          Ver resultado →
        </button>
      )}
    </div>
  )
}

// Guarda solo un tab específico
function SaveBar({ tabKey, hasChanges, saving, onSave }) {
  return (
    <div className="flex items-center justify-between bg-white rounded-sm border border-[rgba(212,120,138,0.12)] px-5 py-3 mt-6">
      <span className="text-xs text-[#9A7480] font-['DM_Sans']">
        {hasChanges ? '● Cambios pendientes' : '✓ Sin cambios'}
      </span>
      <div className="flex gap-3">
        <button
          onClick={() => window.open('/', '_blank')}
          className="flex items-center gap-2 px-4 py-2 text-[0.65rem] font-['DM_Sans'] font-medium tracking-widest uppercase border border-[rgba(212,120,138,0.2)] rounded-sm hover:bg-[#FDF0F3] transition-colors text-[#9A7480]"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Ver resultado
        </button>
        <button
          onClick={() => onSave(tabKey)}
          disabled={saving || !hasChanges}
          className={`flex items-center gap-2 px-5 py-2 text-[0.65rem] font-['DM_Sans'] font-semibold tracking-widest uppercase rounded-sm transition-all ${
            hasChanges
              ? 'bg-[#1A1118] text-white hover:bg-[#2D2030] shadow-md'
              : 'bg-[#F0E8E4] text-[#9A7480] cursor-not-allowed'
          }`}
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
  )
}

export default function VisualConfigPage() {
  const { config, saveConfig } = useSiteConfigStore()
  const [activeTab, setActiveTab] = useState('textures')
  const [uploading, setUploading] = useState(false)
  const [toast, setToast] = useState({ message: '', type: '', nav: null })

  // Estado local separado por tab
  const [localTextures, setLocalTextures] = useState({ ...config.textures })
  const [localDecorations, setLocalDecorations] = useState([...config.decorations])
  const [localTexts, setLocalTexts] = useState({ ...config.texts })
  const [localColors, setLocalColors] = useState({ ...config.customColors })

  // Tracking de guardado por tab
  const [savingTab, setSavingTab] = useState(null)

  const showToast = (message, type = 'success', nav = null) => {
    setToast({ message, type, nav })
    setTimeout(() => setToast({ message: '', type: '', nav: null }), 5000)
  }

  // Guardar un tab específico
  const handleSaveTab = async (tabKey) => {
    setSavingTab(tabKey)
    try {
      let newConfig
      if (tabKey === 'textures') {
        newConfig = { ...config, textures: localTextures }
      } else if (tabKey === 'decorations') {
        newConfig = { ...config, decorations: localDecorations }
      } else if (tabKey === 'texts') {
        newConfig = { ...config, texts: localTexts }
      } else if (tabKey === 'colors') {
        newConfig = { ...config, customColors: localColors }
      }
      await saveConfig(newConfig)

      const tabLabels = { textures: 'Texturas', decorations: 'Decoraciones', texts: 'Textos', colors: 'Colores' }
      showToast(`${tabLabels[tabKey]} guardadas`, 'success')
    } catch (err) {
      showToast('Error al guardar: ' + err.message, 'error')
    } finally {
      setSavingTab(null)
    }
  }

  // Verificar cambios por tab
  const texturesChanged = JSON.stringify(localTextures) !== JSON.stringify(config.textures)
  const decorationsChanged = JSON.stringify(localDecorations) !== JSON.stringify(config.decorations)
  const textsChanged = JSON.stringify(localTexts) !== JSON.stringify(config.texts)
  const colorsChanged = JSON.stringify(localColors) !== JSON.stringify(config.customColors)

  const hasAnyChange = texturesChanged || decorationsChanged || textsChanged || colorsChanged

  // Upload texture
  const handleUploadTexture = async (section, file) => {
    setUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `texture-${section}-${Date.now()}.${fileExt}`
      const { error } = await supabase.storage.from('site-assets').upload(fileName, file, { upsert: true })
      if (error) throw error
      const { data: { publicUrl } } = supabase.storage.from('site-assets').getPublicUrl(fileName)
      setLocalTextures((prev) => ({ ...prev, [section]: { ...prev[section], url: publicUrl } }))
      showToast('Textura subida. Presiona Guardar.', 'info')
    } catch (err) {
      showToast('Error: ' + err.message, 'error')
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
      const { error } = await supabase.storage.from('site-assets').upload(fileName, file, { upsert: true })
      if (error) throw error
      const { data: { publicUrl } } = supabase.storage.from('site-assets').getPublicUrl(fileName)
      setLocalDecorations((prev) => [...prev, {
        id: Date.now().toString(), url: publicUrl, section,
        position: { top: '10%', left: '10%' }, size: { width: '150px', height: 'auto' },
        opacity: 0.15, rotation: 0,
      }])
      showToast('Decoración agregada. Presiona Guardar.', 'info')
    } catch (err) {
      showToast('Error: ' + err.message, 'error')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FDFAF9] p-6 lg:p-10">
      <Toast
        message={toast.message}
        type={toast.type}
        onNavigate={toast.nav}
      />

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="font-['Cormorant_Garamond'] text-3xl font-light text-[#1A1118] mb-2">
            Configuración Visual
          </h1>
          <p className="text-sm text-[#9A7480] font-['DM_Sans']">
            Cada sección tiene su propio botón Guardar. Los cambios se aplican al guardar.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 border-b border-[rgba(212,120,138,0.15)]">
          {[
            { key: 'textures', label: 'Texturas', changed: texturesChanged },
            { key: 'decorations', label: 'Decoraciones', changed: decorationsChanged },
            { key: 'texts', label: 'Textos', changed: textsChanged },
            { key: 'colors', label: 'Colores', changed: colorsChanged },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-3 text-xs font-['DM_Sans'] font-medium tracking-widest uppercase transition-colors relative ${
                activeTab === tab.key
                  ? 'text-[#1A1118] border-b-2 border-[#D4788A]'
                  : 'text-[#9A7480] hover:text-[#4A3340]'
              }`}
            >
              {tab.label}
              {tab.changed && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#C9A84C] rounded-full animate-pulse" />
              )}
            </button>
          ))}
        </div>

        {/* ═══════════════════ TEXTURES TAB ═══════════════════ */}
        {activeTab === 'textures' && (
          <div className="space-y-8">
            <p className="text-xs text-[#9A7480] font-['DM_Sans']">
              Elige el fondo de cada sección: <strong>Ninguno</strong> (transparente), <strong>Textura</strong> (imagen), o <strong>Color</strong> (sólido). Son modos exclusivos.
            </p>

            {SECTIONS.map(({ key, label }) => {
              const tex = localTextures[key] || {}
              const hasBg = !!tex.bgColor
              const hasTex = !!tex.url
              const mode = hasBg ? 'color' : hasTex ? 'texture' : 'none'

              const setMode = (newMode) => {
                setLocalTextures((prev) => ({
                  ...prev,
                  [key]: {
                    ...prev[key],
                    url: newMode === 'texture' ? (prev[key]?.url || '') : '',
                    opacity: prev[key]?.opacity || 0.04,
                    blend: prev[key]?.blend || 'multiply',
                    bgColor: newMode === 'color' ? (prev[key]?.bgColor || '#ffffff') : '',
                  },
                }))
              }

              return (
                <div key={key} className="bg-white rounded-sm border border-[rgba(212,120,138,0.12)] p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-['Cormorant_Garamond'] text-lg text-[#1A1118]">{label}</h3>
                    {/* Selector de modo */}
                    <div className="flex gap-1 bg-[#FDFAF9] rounded-sm p-0.5 border border-[rgba(212,120,138,0.1)]">
                      {[
                        { value: 'none', label: 'Ninguno' },
                        { value: 'texture', label: 'Textura' },
                        { value: 'color', label: 'Color' },
                      ].map((m) => (
                        <button key={m.value} onClick={() => setMode(m.value)}
                          className={`px-3 py-1.5 text-[0.6rem] font-['DM_Sans'] font-medium tracking-wider uppercase rounded-sm transition-all ${
                            mode === m.value
                              ? 'bg-[#1A1118] text-white shadow-sm'
                              : 'text-[#9A7480] hover:text-[#4A3340]'
                          }`}>
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* ── Preview ── */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="relative aspect-video rounded-sm overflow-hidden border border-[rgba(212,120,138,0.1)]"
                      style={hasBg ? { backgroundColor: tex.bgColor } : { background: 'linear-gradient(135deg, #FDF0F3, #F2C4CE)' }}>
                      {hasTex && (
                        <div className="relative w-full h-full">
                          <div className="absolute inset-0 bg-[#FDFAF9]" />
                          <img src={tex.url} alt={`Textura ${label}`}
                            className="absolute inset-0 w-full h-full object-cover"
                            style={{ mixBlendMode: tex.blend, opacity: tex.opacity }} />
                        </div>
                      )}
                      {!hasBg && !hasTex && (
                        <div className="flex items-center justify-center h-full text-xs text-[#9A7480]">Sin fondo</div>
                      )}
                    </div>

                    <div className="space-y-4">
                      {/* ── Modo COLOR ── */}
                      {mode === 'color' && (
                        <div>
                          <label className="block text-xs font-medium text-[#4A3340] mb-2 font-['DM_Sans']">Color de fondo</label>
                          <div className="flex items-center gap-3">
                            <input type="color" value={tex.bgColor || '#ffffff'}
                              onChange={(e) => setLocalTextures((prev) => ({ ...prev, [key]: { ...prev[key], bgColor: e.target.value } }))}
                              className="w-12 h-12 rounded-sm border border-[rgba(212,120,138,0.2)] cursor-pointer" />
                            <div className="flex-1">
                              <span className="text-xs text-[#1A1118] font-['DM_Sans'] font-medium">{tex.bgColor || '#ffffff'}</span>
                              <div className="flex gap-2 mt-2">
                                {['#ffffff', '#FDF8F4', '#FFF8F5', '#FDF0F3', '#1A1118'].map((c) => (
                                  <button key={c} onClick={() => setLocalTextures((prev) => ({ ...prev, [key]: { ...prev[key], bgColor: c } }))}
                                    className="w-6 h-6 rounded-sm border border-[rgba(212,120,138,0.2)] hover:scale-110 transition-transform"
                                    style={{ backgroundColor: c }} title={c} />
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* ── Modo TEXTURA ── */}
                      {mode === 'texture' && (
                        <>
                          <div>
                            <label className="block text-xs font-medium text-[#4A3340] mb-2 font-['DM_Sans']">Subir imagen</label>
                            <input type="file" accept="image/*" disabled={uploading}
                              onChange={(e) => { if (e.target.files[0]) handleUploadTexture(key, e.target.files[0]) }}
                              className="text-xs text-[#9A7480] file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:text-xs file:font-medium file:bg-[#FDF0F3] file:text-[#D4788A] hover:file:bg-[#F2C4CE]" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-[#4A3340] mb-2 font-['DM_Sans']">Predefinidas</label>
                            <div className="flex flex-wrap gap-2">
                              {PRESET_TEXTURES.map((preset) => (
                                <button key={preset.name}
                                  onClick={() => setLocalTextures((prev) => ({ ...prev, [key]: { ...prev[key], url: preset.url } }))}
                                  className="px-3 py-1.5 text-[0.65rem] font-['DM_Sans'] border border-[rgba(212,120,138,0.2)] rounded-sm hover:bg-[#FDF0F3] transition-colors">
                                  {preset.name}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-[#4A3340] mb-2 font-['DM_Sans']">
                              Opacidad: {Math.round((tex.opacity || 0) * 100)}%
                            </label>
                            <input type="range" min="0" max="0.3" step="0.01"
                              value={tex.opacity || 0}
                              onChange={(e) => setLocalTextures((prev) => ({ ...prev, [key]: { ...prev[key], opacity: parseFloat(e.target.value) } }))}
                              className="w-full accent-[#D4788A]" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-[#4A3340] mb-2 font-['DM_Sans']">Fusión</label>
                            <select value={tex.blend || 'multiply'}
                              onChange={(e) => setLocalTextures((prev) => ({ ...prev, [key]: { ...prev[key], blend: e.target.value } }))}
                              className="w-full px-3 py-2 text-xs border border-[rgba(212,120,138,0.2)] rounded-sm bg-white text-[#1A1118] font-['DM_Sans']">
                              {BLENDS.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
                            </select>
                          </div>
                        </>
                      )}

                      {/* ── Modo NINGUNO ── */}
                      {mode === 'none' && (
                        <div className="flex items-center justify-center h-full text-xs text-[#9A7480] font-['DM_Sans'] py-8">
                          Sin fondo — sección transparente
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}

            <SaveBar tabKey="textures" hasChanges={texturesChanged} saving={savingTab === 'textures'}
              onSave={handleSaveTab} />
          </div>
        )}

        {/* ═══════════════════ DECORATIONS TAB ═══════════════════ */}
        {activeTab === 'decorations' && (
          <div className="space-y-6">
            <p className="text-xs text-[#9A7480] font-['DM_Sans']">
              Imágenes decorativas superpuestas. Controla opacidad, rotación y tamaño.
            </p>

            <div className="bg-white rounded-sm border border-[rgba(212,120,138,0.12)] p-6">
              <h3 className="font-['Cormorant_Garamond'] text-lg text-[#1A1118] mb-4">Agregar decoración</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#4A3340] mb-2 font-['DM_Sans']">Imagen</label>
                  <input type="file" accept="image/*" disabled={uploading}
                    onChange={(e) => { if (e.target.files[0]) handleUploadDecoration(e.target.files[0], 'global') }}
                    className="text-xs text-[#9A7480] file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:text-xs file:font-medium file:bg-[#FDF0F3] file:text-[#D4788A] hover:file:bg-[#F2C4CE]" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#4A3340] mb-2 font-['DM_Sans']">Sección</label>
                  <select id="deco-section"
                    className="w-full px-3 py-2 text-xs border border-[rgba(212,120,138,0.2)] rounded-sm bg-white text-[#1A1118] font-['DM_Sans']">
                    <option value="global">Global</option>
                    <option value="hero">Hero</option>
                    <option value="catalog">Catálogo</option>
                    <option value="footer">Footer</option>
                  </select>
                </div>
              </div>
            </div>

            {localDecorations.length === 0 ? (
              <p className="text-xs text-[#9A7480] font-['DM_Sans'] text-center py-8">No hay decoraciones</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {localDecorations.map((deco) => (
                  <div key={deco.id} className="bg-white rounded-sm border border-[rgba(212,120,138,0.12)] p-4">
                    <div className="flex gap-4">
                      <img src={deco.url} alt="Deco" className="w-20 h-20 object-contain" />
                      <div className="flex-1 space-y-2">
                        <div>
                          <label className="block text-[0.6rem] text-[#9A7480] mb-1 font-['DM_Sans']">Opacidad: {Math.round((deco.opacity || 0.15) * 100)}%</label>
                          <input type="range" min="0" max="1" step="0.05" value={deco.opacity || 0.15}
                            onChange={(e) => setLocalDecorations((prev) => prev.map((d) => d.id === deco.id ? { ...d, opacity: parseFloat(e.target.value) } : d))}
                            className="w-full accent-[#D4788A]" />
                        </div>
                        <div>
                          <label className="block text-[0.6rem] text-[#9A7480] mb-1 font-['DM_Sans']">Rotación: {deco.rotation || 0}°</label>
                          <input type="range" min="-180" max="180" step="5" value={deco.rotation || 0}
                            onChange={(e) => setLocalDecorations((prev) => prev.map((d) => d.id === deco.id ? { ...d, rotation: parseInt(e.target.value) } : d))}
                            className="w-full accent-[#D4788A]" />
                        </div>
                        <div>
                          <label className="block text-[0.6rem] text-[#9A7480] mb-1 font-['DM_Sans']">Ancho: {deco.size?.width || '150px'}</label>
                          <input type="range" min="50" max="500" step="10" value={parseInt(deco.size?.width) || 150}
                            onChange={(e) => setLocalDecorations((prev) => prev.map((d) => d.id === deco.id ? { ...d, size: { ...d.size, width: `${e.target.value}px` } } : d))}
                            className="w-full accent-[#D4788A]" />
                        </div>
                        <button onClick={() => setLocalDecorations((prev) => prev.filter((d) => d.id !== deco.id))}
                          className="text-xs text-[#E53935] hover:underline font-['DM_Sans']">Eliminar</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <SaveBar tabKey="decorations" hasChanges={decorationsChanged} saving={savingTab === 'decorations'}
              onSave={handleSaveTab} />
          </div>
        )}

        {/* ═══════════════════ TEXTS TAB ═══════════════════ */}
        {activeTab === 'texts' && (
          <div className="space-y-6">
            <p className="text-xs text-[#9A7480] font-['DM_Sans']">
              Editable el texto de cada sección. Guarda para aplicar.
            </p>

            {Object.entries(localTexts).map(([key, value]) => (
              <div key={key} className="bg-white rounded-sm border border-[rgba(212,120,138,0.12)] p-4">
                <label className="block text-xs font-medium text-[#4A3340] mb-2 font-['DM_Sans'] capitalize">
                  {key.replace(/_/g, ' ')}
                </label>
                {value.length > 80 ? (
                  <textarea value={value} rows={3}
                    onChange={(e) => setLocalTexts((prev) => ({ ...prev, [key]: e.target.value }))}
                    className="w-full px-3 py-2 text-xs border border-[rgba(212,120,138,0.2)] rounded-sm bg-white text-[#1A1118] font-['DM_Sans'] resize-none focus:outline-none focus:border-[#D4788A]" />
                ) : (
                  <input type="text" value={value}
                    onChange={(e) => setLocalTexts((prev) => ({ ...prev, [key]: e.target.value }))}
                    className="w-full px-3 py-2 text-xs border border-[rgba(212,120,138,0.2)] rounded-sm bg-white text-[#1A1118] font-['DM_Sans'] focus:outline-none focus:border-[#D4788A]" />
                )}
              </div>
            ))}

            <SaveBar tabKey="texts" hasChanges={textsChanged} saving={savingTab === 'texts'}
              onSave={handleSaveTab} />
          </div>
        )}

        {/* ═══════════════════ COLORS TAB ═══════════════════ */}
        {activeTab === 'colors' && (
          <div className="space-y-6">
            <p className="text-xs text-[#9A7480] font-['DM_Sans']">
              Personaliza los colores principales de la tienda.
            </p>

            {Object.entries(localColors).map(([key, value]) => (
              <div key={key} className="bg-white rounded-sm border border-[rgba(212,120,138,0.12)] p-4 flex items-center gap-4">
                <input type="color" value={value}
                  onChange={(e) => setLocalColors((prev) => ({ ...prev, [key]: e.target.value }))}
                  className="w-12 h-12 rounded-sm border border-[rgba(212,120,138,0.2)] cursor-pointer" />
                <div>
                  <label className="block text-xs font-medium text-[#4A3340] font-['DM_Sans'] capitalize">
                    {key === 'primary' ? 'Color principal' : key === 'accent' ? 'Color acento' : 'Fondo'}
                  </label>
                  <p className="text-[0.65rem] text-[#9A7480] font-['DM_Sans']">{value}</p>
                </div>
              </div>
            ))}

            <SaveBar tabKey="colors" hasChanges={colorsChanged} saving={savingTab === 'colors'}
              onSave={handleSaveTab} />
          </div>
        )}
      </div>
    </div>
  )
}
