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
    trust_title: '¿Por qué elegirnos?',
    trust_subtitle: 'Tu confianza es nuestra prioridad',
    categories_title: 'Explora por',
    categories_title_accent: 'categoría',
    footer_brand: 'Piezas únicas de moda importada desde Estados Unidos, seleccionadas con ojo editorial para la mujer que sabe quién es.',
    footer_tagline: 'Diseñado con ✦ en Chiclayo, Perú',
    topbar_text: 'Envío gratis en compras mayores a S/ 200 — Recoge en tienda',
    whatsapp_message: 'Hola, me interesa un producto de tu tienda',
  },
  // Items de confianza (Hero Trust Bar + TrustSection)
  trustItems: [
    { label: '100% Originales', sub: 'Marcas de USA', iconPath: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' },
    { label: 'Envío a Todo el Perú', sub: 'Rápido y seguro', iconPath: 'M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0' },
    { label: 'Atención Personalizada', sub: 'Te ayudamos a elegir', iconPath: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
    { label: 'Pago Seguro', sub: 'Yape, Plin, Tarjeta', iconPath: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
  ],
  // Estadísticas del TrustSection
  trustStats: [
    { n: 500, s: '+', l: 'Productos importados' },
    { n: 8, s: '', l: 'Años de experiencia' },
    { n: 100, s: '%', l: 'Originales garantizados' },
    { n: 24, s: 'h', l: 'Tiempo de respuesta' },
  ],
  // Marcas del BrandMarquee
  brands: ['GUESS', 'TOMMY HILFIGER', 'CALVIN KLEIN', 'MICHAEL KORS', 'VICTORIA\'S SECRET', 'STEVE MADDEN', 'DKNY', 'COACH'],
  // Info del Footer
  footerContact: {
    address: 'Galería Chiclayo — Balta y Arica, 2do Piso',
    phone: '+51 906 877 812',
    email: 'info@kbdresses.com',
    hours: 'Lun - Sáb: 10am - 8pm',
    facebook: 'https://facebook.com/kbdresses',
    instagram: 'https://instagram.com/kbdresses',
    pinterest: 'https://pinterest.com/kbdresses',
    tiktok: 'https://www.tiktok.com/@kb.dresses.more',
  },
  // Categorías (fallbacks si no hay en BD)
  categories: [
    { title: 'Carteras', titleAccent: 'Importadas', subtitle: 'Guess · Tommy · Calvin Klein', description: 'Piezas exclusivas importadas directamente desde Estados Unidos.', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=900&h=1200&fit=crop&q=95', link: '/?categoria=carteras', num: '01', accent: 'left' },
    { title: 'Vestidos', titleAccent: 'de Fiesta', subtitle: 'Elegancia atemporal', description: 'Diseños que te harán brillar en cada ocasión especial.', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=900&h=1200&fit=crop&q=95', link: '/?categoria=vestidos', num: '02', accent: 'right' },
    { title: 'Billeteras', titleAccent: 'Premium', subtitle: 'Michael Kors · Tommy · CK', description: 'Funcionalidad y lujo en cada detalle.', image: 'https://images.unsplash.com/photo-1606503156036-9d2b3da6b5b0?w=900&h=1200&fit=crop&q=95', link: '/?categoria=billeteras', num: '03', accent: 'right' },
  ],
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
