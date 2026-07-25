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
  const [localTrustItems, setLocalTrustItems] = useState([...(config.trustItems || [])])
  const [localTrustStats, setLocalTrustStats] = useState([...(config.trustStats || [])])
  const [localBrands, setLocalBrands] = useState([...(config.brands || [])])
  const [localFooterContact, setLocalFooterContact] = useState({ ...(config.footerContact || {}) })
  const [localCategories, setLocalCategories] = useState([...(config.categories || [])])

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
      } else if (tabKey === 'trust') {
        newConfig = { ...config, trustItems: localTrustItems, trustStats: localTrustStats }
      } else if (tabKey === 'brands') {
        newConfig = { ...config, brands: localBrands }
      } else if (tabKey === 'footer') {
        newConfig = { ...config, footerContact: localFooterContact }
      } else if (tabKey === 'categories') {
        newConfig = { ...config, categories: localCategories }
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
  const trustChanged = JSON.stringify(localTrustItems) !== JSON.stringify(config.trustItems) || JSON.stringify(localTrustStats) !== JSON.stringify(config.trustStats)
  const brandsChanged = JSON.stringify(localBrands) !== JSON.stringify(config.brands)
  const footerChanged = JSON.stringify(localFooterContact) !== JSON.stringify(config.footerContact)
  const categoriesChanged = JSON.stringify(localCategories) !== JSON.stringify(config.categories)

  const hasAnyChange = texturesChanged || decorationsChanged || textsChanged || colorsChanged || trustChanged || brandsChanged || footerChanged || categoriesChanged

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
            { key: 'textures', label: 'Fondos', changed: texturesChanged },
            { key: 'texts', label: 'Textos', changed: textsChanged },
            { key: 'trust', label: 'Confianza', changed: trustChanged },
            { key: 'brands', label: 'Marcas', changed: brandsChanged },
            { key: 'categories', label: 'Categorías', changed: categoriesChanged },
            { key: 'footer', label: 'Footer', changed: footerChanged },
            { key: 'decorations', label: 'Decos', changed: decorationsChanged },
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

        {/* ═══════════════════ TRUST TAB ═══════════════════ */}
        {activeTab === 'trust' && (
          <div className="space-y-6">
            <p className="text-xs text-[#9A7480] font-['DM_Sans']">
              Items de confianza y estadísticas que se muestran en la sección "¿Por qué elegirnos?"
            </p>

            <div className="bg-white rounded-sm border border-[rgba(212,120,138,0.12)] p-6">
              <h3 className="font-['Cormorant_Garamond'] text-lg text-[#1A1118] mb-4">Items de confianza</h3>
              {localTrustItems.map((item, i) => (
                <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3 p-3 bg-[#FDFAF9] rounded-sm">
                  <input type="text" value={item.label} placeholder="Label"
                    onChange={(e) => { const copy = [...localTrustItems]; copy[i] = { ...copy[i], label: e.target.value }; setLocalTrustItems(copy) }}
                    className="px-3 py-2 text-xs border border-[rgba(212,120,138,0.2)] rounded-sm bg-white text-[#1A1118] font-['DM_Sans']" />
                  <input type="text" value={item.sub} placeholder="Subtítulo"
                    onChange={(e) => { const copy = [...localTrustItems]; copy[i] = { ...copy[i], sub: e.target.value }; setLocalTrustItems(copy) }}
                    className="px-3 py-2 text-xs border border-[rgba(212,120,138,0.2)] rounded-sm bg-white text-[#1A1118] font-['DM_Sans']" />
                  <div className="flex gap-2">
                    <input type="text" value={item.iconPath} placeholder="SVG path"
                      onChange={(e) => { const copy = [...localTrustItems]; copy[i] = { ...copy[i], iconPath: e.target.value }; setLocalTrustItems(copy) }}
                      className="flex-1 px-3 py-2 text-xs border border-[rgba(212,120,138,0.2)] rounded-sm bg-white text-[#1A1118] font-['DM_Sans']" />
                    <button onClick={() => setLocalTrustItems(localTrustItems.filter((_, j) => j !== i))}
                      className="px-2 text-[#E53935] hover:bg-red-50 rounded-sm text-xs">✕</button>
                  </div>
                </div>
              ))}
              <button onClick={() => setLocalTrustItems([...localTrustItems, { label: '', sub: '', iconPath: '' }])}
                className="mt-2 px-4 py-2 text-[0.65rem] font-['DM_Sans'] font-medium tracking-wider uppercase border border-[rgba(212,120,138,0.2)] rounded-sm hover:bg-[#FDF0F3] text-[#D4788A]">
                + Agregar item
              </button>
            </div>

            <div className="bg-white rounded-sm border border-[rgba(212,120,138,0.12)] p-6">
              <h3 className="font-['Cormorant_Garamond'] text-lg text-[#1A1118] mb-4">Estadísticas</h3>
              {localTrustStats.map((stat, i) => (
                <div key={i} className="grid grid-cols-3 gap-3 mb-3 p-3 bg-[#FDFAF9] rounded-sm">
                  <input type="number" value={stat.n} placeholder="Número"
                    onChange={(e) => { const copy = [...localTrustStats]; copy[i] = { ...copy[i], n: parseInt(e.target.value) || 0 }; setLocalTrustStats(copy) }}
                    className="px-3 py-2 text-xs border border-[rgba(212,120,138,0.2)] rounded-sm bg-white text-[#1A1118] font-['DM_Sans']" />
                  <input type="text" value={stat.s} placeholder="Sufijo"
                    onChange={(e) => { const copy = [...localTrustStats]; copy[i] = { ...copy[i], s: e.target.value }; setLocalTrustStats(copy) }}
                    className="px-3 py-2 text-xs border border-[rgba(212,120,138,0.2)] rounded-sm bg-white text-[#1A1118] font-['DM_Sans']" />
                  <input type="text" value={stat.l} placeholder="Label"
                    onChange={(e) => { const copy = [...localTrustStats]; copy[i] = { ...copy[i], l: e.target.value }; setLocalTrustStats(copy) }}
                    className="px-3 py-2 text-xs border border-[rgba(212,120,138,0.2)] rounded-sm bg-white text-[#1A1118] font-['DM_Sans']" />
                </div>
              ))}
            </div>

            <SaveBar tabKey="trust" hasChanges={trustChanged} saving={savingTab === 'trust'}
              onSave={handleSaveTab} />
          </div>
        )}

        {/* ═══════════════════ BRANDS TAB ═══════════════════ */}
        {activeTab === 'brands' && (
          <div className="space-y-6">
            <p className="text-xs text-[#9A7480] font-['DM_Sans']">
              Marcas que se muestran en el marquee de la sección de confianza.
            </p>

            <div className="bg-white rounded-sm border border-[rgba(212,120,138,0.12)] p-6">
              <div className="flex flex-wrap gap-3">
                {localBrands.map((brand, i) => (
                  <div key={i} className="flex items-center gap-2 bg-[#FDFAF9] rounded-sm px-3 py-2 border border-[rgba(212,120,138,0.1)]">
                    <input type="text" value={brand}
                      onChange={(e) => { const copy = [...localBrands]; copy[i] = e.target.value; setLocalBrands(copy) }}
                      className="w-40 px-2 py-1 text-xs border-0 bg-transparent text-[#1A1118] font-['DM_Sans'] font-medium focus:outline-none" />
                    <button onClick={() => setLocalBrands(localBrands.filter((_, j) => j !== i))}
                      className="text-[#E53935] hover:bg-red-50 rounded-sm w-5 h-5 flex items-center justify-center text-xs">✕</button>
                  </div>
                ))}
              </div>
              <button onClick={() => setLocalBrands([...localBrands, ''])}
                className="mt-4 px-4 py-2 text-[0.65rem] font-['DM_Sans'] font-medium tracking-wider uppercase border border-[rgba(212,120,138,0.2)] rounded-sm hover:bg-[#FDF0F3] text-[#D4788A]">
                + Agregar marca
              </button>
            </div>

            <SaveBar tabKey="brands" hasChanges={brandsChanged} saving={savingTab === 'brands'}
              onSave={handleSaveTab} />
          </div>
        )}

        {/* ═══════════════════ CATEGORIES TAB ═══════════════════ */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <p className="text-xs text-[#9A7480] font-['DM_Sans']">
              Categorías que se muestran en la sección de categorías. Si hay productos en BD, se usan sus imágenes automáticamente.
            </p>

            {localCategories.map((cat, i) => (
              <div key={i} className="bg-white rounded-sm border border-[rgba(212,120,138,0.12)] p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-['Cormorant_Garamond'] text-lg text-[#1A1118]">Categoría {cat.num}</h3>
                  <button onClick={() => setLocalCategories(localCategories.filter((_, j) => j !== i))}
                    className="text-xs text-[#E53935] hover:underline font-['DM_Sans']">Eliminar</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <input type="text" value={cat.title} placeholder="Título"
                      onChange={(e) => { const copy = [...localCategories]; copy[i] = { ...copy[i], title: e.target.value }; setLocalCategories(copy) }}
                      className="w-full px-3 py-2 text-xs border border-[rgba(212,120,138,0.2)] rounded-sm bg-white text-[#1A1118] font-['DM_Sans']" />
                    <input type="text" value={cat.titleAccent} placeholder="Título accent"
                      onChange={(e) => { const copy = [...localCategories]; copy[i] = { ...copy[i], titleAccent: e.target.value }; setLocalCategories(copy) }}
                      className="w-full px-3 py-2 text-xs border border-[rgba(212,120,138,0.2)] rounded-sm bg-white text-[#1A1118] font-['DM_Sans']" />
                    <input type="text" value={cat.subtitle} placeholder="Subtítulo"
                      onChange={(e) => { const copy = [...localCategories]; copy[i] = { ...copy[i], subtitle: e.target.value }; setLocalCategories(copy) }}
                      className="w-full px-3 py-2 text-xs border border-[rgba(212,120,138,0.2)] rounded-sm bg-white text-[#1A1118] font-['DM_Sans']" />
                    <textarea value={cat.description} placeholder="Descripción" rows={2}
                      onChange={(e) => { const copy = [...localCategories]; copy[i] = { ...copy[i], description: e.target.value }; setLocalCategories(copy) }}
                      className="w-full px-3 py-2 text-xs border border-[rgba(212,120,138,0.2)] rounded-sm bg-white text-[#1A1118] font-['DM_Sans'] resize-none" />
                    <input type="text" value={cat.link} placeholder="Link"
                      onChange={(e) => { const copy = [...localCategories]; copy[i] = { ...copy[i], link: e.target.value }; setLocalCategories(copy) }}
                      className="w-full px-3 py-2 text-xs border border-[rgba(212,120,138,0.2)] rounded-sm bg-white text-[#1A1118] font-['DM_Sans']" />
                  </div>
                  <div className="space-y-3">
                    <input type="text" value={cat.image} placeholder="URL de imagen"
                      onChange={(e) => { const copy = [...localCategories]; copy[i] = { ...copy[i], image: e.target.value }; setLocalCategories(copy) }}
                      className="w-full px-3 py-2 text-xs border border-[rgba(212,120,138,0.2)] rounded-sm bg-white text-[#1A1118] font-['DM_Sans']" />
                    <div className="aspect-[3/4] bg-[#FDF0F3] rounded-sm overflow-hidden">
                      {cat.image && <img src={cat.image} alt={cat.title} className="w-full h-full object-cover" />}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <button onClick={() => setLocalCategories([...localCategories, {
              title: '', titleAccent: '', subtitle: '', description: '', image: '', link: '/',
              num: String(localCategories.length + 1).padStart(2, '0'), accent: 'left',
            }])}
              className="px-4 py-2 text-[0.65rem] font-['DM_Sans'] font-medium tracking-wider uppercase border border-[rgba(212,120,138,0.2)] rounded-sm hover:bg-[#FDF0F3] text-[#D4788A]">
              + Agregar categoría
            </button>

            <SaveBar tabKey="categories" hasChanges={categoriesChanged} saving={savingTab === 'categories'}
              onSave={handleSaveTab} />
          </div>
        )}

        {/* ═══════════════════ FOOTER TAB ═══════════════════ */}
        {activeTab === 'footer' && (
          <div className="space-y-6">
            <p className="text-xs text-[#9A7480] font-['DM_Sans']">
              Información de contacto y redes sociales del footer.
            </p>

            <div className="bg-white rounded-sm border border-[rgba(212,120,138,0.12)] p-6">
              <h3 className="font-['Cormorant_Garamond'] text-lg text-[#1A1118] mb-4">Contacto</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: 'address', label: 'Dirección' },
                  { key: 'phone', label: 'Teléfono' },
                  { key: 'email', label: 'Email' },
                  { key: 'hours', label: 'Horario' },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label className="block text-xs font-medium text-[#4A3340] mb-1 font-['DM_Sans']">{label}</label>
                    <input type="text" value={localFooterContact[key] || ''}
                      onChange={(e) => setLocalFooterContact({ ...localFooterContact, [key]: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-[rgba(212,120,138,0.2)] rounded-sm bg-white text-[#1A1118] font-['DM_Sans']" />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-sm border border-[rgba(212,120,138,0.12)] p-6">
              <h3 className="font-['Cormorant_Garamond'] text-lg text-[#1A1118] mb-4">Redes sociales</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: 'facebook', label: 'Facebook URL' },
                  { key: 'instagram', label: 'Instagram URL' },
                  { key: 'pinterest', label: 'Pinterest URL' },
                  { key: 'tiktok', label: 'TikTok URL' },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label className="block text-xs font-medium text-[#4A3340] mb-1 font-['DM_Sans']">{label}</label>
                    <input type="url" value={localFooterContact[key] || ''}
                      onChange={(e) => setLocalFooterContact({ ...localFooterContact, [key]: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-[rgba(212,120,138,0.2)] rounded-sm bg-white text-[#1A1118] font-['DM_Sans']" />
                  </div>
                ))}
              </div>
            </div>

            <SaveBar tabKey="footer" hasChanges={footerChanged} saving={savingTab === 'footer'}
              onSave={handleSaveTab} />
          </div>
        )}
      </div>
    </div>
  )
}
