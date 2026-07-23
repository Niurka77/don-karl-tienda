import { useState, useEffect } from 'react'
import useSiteConfigStore from '../../store/siteConfigStore'
import { supabase } from '../../lib/supabase'

const SECTIONS = [
  { key: 'hero', label: 'Hero Principal' },
  { key: 'catalog', label: 'Catálogo' },
  { key: 'footer', label: 'Footer' },
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

export default function VisualConfigPage() {
  const { config, updateTexture, addDecoration, removeDecoration, updateDecoration, updateText, updateColor } = useSiteConfigStore()
  const [activeTab, setActiveTab] = useState('textures')
  const [uploading, setUploading] = useState(false)

  // Upload texture to Supabase Storage
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

      await updateTexture(section, {
        ...config.textures[section],
        url: publicUrl,
      })
    } catch (err) {
      console.error('Error uploading texture:', err)
      alert('Error subiendo textura: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  // Upload decoration image
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

      await addDecoration({
        url: publicUrl,
        section,
        position: { top: '10%', left: '10%' },
        size: { width: '150px', height: 'auto' },
        opacity: 0.15,
        rotation: 0,
      })
    } catch (err) {
      console.error('Error uploading decoration:', err)
      alert('Error subiendo decoración: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FDFAF9] p-6 lg:p-10">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="font-['Cormorant_Garamond'] text-3xl font-light text-[#1A1118] mb-2">
            Configuración Visual
          </h1>
          <p className="text-sm text-[#9A7480] font-['DM_Sans']">
            Controla texturas, decoraciones, colores y textos de tu tienda
          </p>
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
              Sube una textura para cada sección. Se aplicará como capa fina con transparencia controlable.
            </p>

            {SECTIONS.map(({ key, label }) => (
              <div key={key} className="bg-white rounded-sm border border-[rgba(212,120,138,0.12)] p-6">
                <h3 className="font-['Cormorant_Garamond'] text-lg text-[#1A1118] mb-4">{label}</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Preview */}
                  <div className="relative aspect-video bg-[#FDF0F3] rounded-sm overflow-hidden">
                    {config.textures[key]?.url ? (
                      <div className="relative w-full h-full">
                        <div className="absolute inset-0 bg-[#FDFAF9]" />
                        <img
                          src={config.textures[key].url}
                          alt={`Textura ${label}`}
                          className="absolute inset-0 w-full h-full object-cover"
                          style={{
                            mixBlendMode: config.textures[key].blend,
                            opacity: config.textures[key].opacity,
                          }}
                        />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full text-xs text-[#9A7480]">
                        Sin textura
                      </div>
                    )}
                  </div>

                  {/* Controls */}
                  <div className="space-y-4">
                    {/* Upload */}
                    <div>
                      <label className="block text-xs font-medium text-[#4A3340] mb-2 font-['DM_Sans']">
                        Subir imagen
                      </label>
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

                    {/* Presets */}
                    <div>
                      <label className="block text-xs font-medium text-[#4A3340] mb-2 font-['DM_Sans']">
                        Texturas predefinidas
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {PRESET_TEXTURES.map((tex) => (
                          <button
                            key={tex.name}
                            onClick={() => updateTexture(key, { ...config.textures[key], url: tex.url })}
                            className="px-3 py-1.5 text-[0.65rem] font-['DM_Sans'] border border-[rgba(212,120,138,0.2)] rounded-sm hover:bg-[#FDF0F3] transition-colors"
                          >
                            {tex.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Opacity */}
                    <div>
                      <label className="block text-xs font-medium text-[#4A3340] mb-2 font-['DM_Sans']">
                        Opacidad: {Math.round((config.textures[key]?.opacity || 0) * 100)}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="0.3"
                        step="0.01"
                        value={config.textures[key]?.opacity || 0}
                        onChange={(e) =>
                          updateTexture(key, {
                            ...config.textures[key],
                            opacity: parseFloat(e.target.value),
                          })
                        }
                        className="w-full accent-[#D4788A]"
                      />
                    </div>

                    {/* Blend mode */}
                    <div>
                      <label className="block text-xs font-medium text-[#4A3340] mb-2 font-['DM_Sans']">
                        Modo de fusión
                      </label>
                      <select
                        value={config.textures[key]?.blend || 'multiply'}
                        onChange={(e) =>
                          updateTexture(key, {
                            ...config.textures[key],
                            blend: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 text-xs border border-[rgba(212,120,138,0.2)] rounded-sm bg-white text-[#1A1118] font-['DM_Sans']"
                      >
                        {BLENDS.map((b) => (
                          <option key={b.value} value={b.value}>{b.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Clear */}
                    {config.textures[key]?.url && (
                      <button
                        onClick={() => updateTexture(key, { url: '', opacity: 0.04, blend: 'multiply' })}
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
              Sube imágenes decorativas (flores, sellos, marcos). Se superpondrán con transparencia.
            </p>

            {/* Upload new */}
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

            {/* List */}
            {config.decorations.length === 0 ? (
              <p className="text-xs text-[#9A7480] font-['DM_Sans'] text-center py-8">
                No hay decoraciones configuradas
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {config.decorations.map((deco) => (
                  <div key={deco.id} className="bg-white rounded-sm border border-[rgba(212,120,138,0.12)] p-4">
                    <div className="flex gap-4">
                      <img src={deco.url} alt="Decoración" className="w-20 h-20 object-contain" />
                      <div className="flex-1 space-y-2">
                        <div>
                          <label className="block text-[0.6rem] text-[#9A7480] mb-1 font-['DM_Sans']">Opacidad: {Math.round((deco.opacity || 0.15) * 100)}%</label>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={deco.opacity || 0.15}
                            onChange={(e) => updateDecoration(deco.id, { opacity: parseFloat(e.target.value) })}
                            className="w-full accent-[#D4788A]"
                          />
                        </div>
                        <div>
                          <label className="block text-[0.6rem] text-[#9A7480] mb-1 font-['DM_Sans']">Rotación: {deco.rotation || 0}°</label>
                          <input
                            type="range"
                            min="-180"
                            max="180"
                            step="5"
                            value={deco.rotation || 0}
                            onChange={(e) => updateDecoration(deco.id, { rotation: parseInt(e.target.value) })}
                            className="w-full accent-[#D4788A]"
                          />
                        </div>
                        <div>
                          <label className="block text-[0.6rem] text-[#9A7480] mb-1 font-['DM_Sans']">Ancho: {deco.size?.width || '150px'}</label>
                          <input
                            type="range"
                            min="50"
                            max="500"
                            step="10"
                            value={parseInt(deco.size?.width) || 150}
                            onChange={(e) => updateDecoration(deco.id, { size: { ...deco.size, width: `${e.target.value}px` } })}
                            className="w-full accent-[#D4788A]"
                          />
                        </div>
                        <button
                          onClick={() => removeDecoration(deco.id)}
                          className="text-xs text-[#E53935] hover:underline font-['DM_Sans']"
                        >
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
              Edita los textos que aparecen en la tienda. Los cambios se aplican en tiempo real.
            </p>

            {Object.entries(config.texts).map(([key, value]) => (
              <div key={key} className="bg-white rounded-sm border border-[rgba(212,120,138,0.12)] p-4">
                <label className="block text-xs font-medium text-[#4A3340] mb-2 font-['DM_Sans'] capitalize">
                  {key.replace(/_/g, ' ')}
                </label>
                {value.length > 80 ? (
                  <textarea
                    value={value}
                    onChange={(e) => updateText(key, e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 text-xs border border-[rgba(212,120,138,0.2)] rounded-sm bg-white text-[#1A1118] font-['DM_Sans'] resize-none focus:outline-none focus:border-[#D4788A]"
                  />
                ) : (
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => updateText(key, e.target.value)}
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
              Personaliza los colores principales de la tienda.
            </p>

            {Object.entries(config.customColors).map(([key, value]) => (
              <div key={key} className="bg-white rounded-sm border border-[rgba(212,120,138,0.12)] p-4 flex items-center gap-4">
                <input
                  type="color"
                  value={value}
                  onChange={(e) => updateColor(key, e.target.value)}
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
      </div>
    </div>
  )
}
