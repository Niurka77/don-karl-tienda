import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'

const defaultConfig = {
  // Texturas por sección
  textures: {
    hero: { url: '', opacity: 0.04, blend: 'multiply', bgColor: '' },
    trust: { url: '', opacity: 0.03, blend: 'multiply', bgColor: '' },
    categories: { url: '', opacity: 0.03, blend: 'multiply', bgColor: '' },
    catalog: { url: '', opacity: 0.03, blend: 'multiply', bgColor: '' },
    videos: { url: '', opacity: 0.03, blend: 'multiply', bgColor: '' },
    footer: { url: '', opacity: 0.05, blend: 'multiply', bgColor: '' },
  },
  // Decoraciones flotantes
  decorations: [],
  // Textos editables de la tienda
  texts: {
    hero_title: 'Nueva Colección',
    hero_subtitle: 'Piezas únicas de moda importada',
    hero_cta: 'Descubrir Colección',
    hero_cta_secondary: 'Ver Todo',
    catalog_title: 'Catálogo',
    catalog_subtitle: 'Explora nuestras piezas seleccionadas',
    footer_brand: 'Piezas únicas de moda importada desde Estados Unidos, seleccionadas con ojo editorial para la mujer que sabe quién es.',
    footer_tagline: 'Diseñado con ✦ en Chiclayo, Perú',
    topbar_text: 'Envío gratis en compras mayores a S/ 200 — Recoge en tienda',
    whatsapp_message: 'Hola, me interesa un producto de tu tienda',
  },
  // Colores personalizados (override de la paleta)
  customColors: {
    primary: '#D4788A',
    accent: '#C9A84C',
    background: '#FDFAF9',
  },
}

const useSiteConfigStore = create(
  persist(
    (set, get) => ({
      config: defaultConfig,
      loading: false,
      error: null,

      // Cargar config desde Supabase
      loadConfig: async () => {
        set({ loading: true, error: null })
        try {
          const { data, error } = await supabase
            .from('site_config')
            .select('*')
            .eq('id', 'main')
            .single()

          if (error && error.code !== 'PGRST116') throw error

          if (data) {
            set({
              config: {
                ...defaultConfig,
                ...data.config,
              },
              loading: false,
            })
          } else {
            set({ loading: false })
          }
        } catch (error) {
          console.error('Error loading site config:', error)
          set({ error: error.message, loading: false })
        }
      },

      // Guardar config en Supabase
      saveConfig: async (newConfig) => {
        set({ loading: true, error: null })
        try {
          const { error } = await supabase
            .from('site_config')
            .upsert({ id: 'main', config: newConfig, updated_at: new Date().toISOString() })

          if (error) throw error

          set({ config: newConfig, loading: false })
        } catch (error) {
          console.error('Error saving site config:', error)
          set({ error: error.message, loading: false })
          throw error
        }
      },

      // Actualizar texturas
      updateTexture: async (section, texture) => {
        const newConfig = {
          ...get().config,
          textures: {
            ...get().config.textures,
            [section]: texture,
          },
        }
        await get().saveConfig(newConfig)
      },

      // Agregar decoración
      addDecoration: async (decoration) => {
        const newConfig = {
          ...get().config,
          decorations: [
            ...get().config.decorations,
            { ...decoration, id: Date.now().toString() },
          ],
        }
        await get().saveConfig(newConfig)
      },

      // Eliminar decoración
      removeDecoration: async (id) => {
        const newConfig = {
          ...get().config,
          decorations: get().config.decorations.filter((d) => d.id !== id),
        }
        await get().saveConfig(newConfig)
      },

      // Actualizar decoración
      updateDecoration: async (id, updates) => {
        const newConfig = {
          ...get().config,
          decorations: get().config.decorations.map((d) =>
            d.id === id ? { ...d, ...updates } : d
          ),
        }
        await get().saveConfig(newConfig)
      },

      // Actualizar textos
      updateText: async (key, value) => {
        const newConfig = {
          ...get().config,
          texts: {
            ...get().config.texts,
            [key]: value,
          },
        }
        await get().saveConfig(newConfig)
      },

      // Actualizar colores personalizados
      updateColor: async (key, value) => {
        const newConfig = {
          ...get().config,
          customColors: {
            ...get().config.customColors,
            [key]: value,
          },
        }
        await get().saveConfig(newConfig)
      },

      // Reset a defaults
      resetConfig: async () => {
        await get().saveConfig(defaultConfig)
      },
    }),
    {
      name: 'kb-site-config',
      partialize: (state) => ({ config: state.config }),
    }
  )
)

export default useSiteConfigStore
