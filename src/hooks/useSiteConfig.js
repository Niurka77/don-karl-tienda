import { useEffect } from 'react'
import useSiteConfigStore from '../store/siteConfigStore'

export function useSiteConfig() {
  const config = useSiteConfigStore((s) => s.config)
  const loadConfig = useSiteConfigStore((s) => s.loadConfig)

  // Cargar config al montar
  useEffect(() => {
    loadConfig()
  }, [loadConfig])

  // Aplicar texturas como CSS custom properties
  useEffect(() => {
    const root = document.documentElement

    // Aplicar colores personalizados
    if (config.customColors?.primary) {
      root.style.setProperty('--color-kb-rose', config.customColors.primary)
    }
    if (config.customColors?.accent) {
      root.style.setProperty('--color-kb-gold', config.customColors.accent)
    }
    if (config.customColors?.background) {
      root.style.setProperty('--color-background', config.customColors.background)
    }
  }, [config.customColors])

  // Obtener textura de una sección
  const getTexture = (section) => {
    return config.textures?.[section] || { url: '', opacity: 0, blend: 'multiply' }
  }

  // Estilo de textura para aplicar como background
  const getTextureStyle = (section) => {
    const tex = getTexture(section)
    if (!tex.url) return {}
    return {
      backgroundImage: `url(${tex.url})`,
      backgroundRepeat: 'repeat',
      backgroundSize: '200px',
      mixBlendMode: tex.blend,
      opacity: tex.opacity,
      pointerEvents: 'none',
      position: 'absolute',
      inset: 0,
      zIndex: 1,
    }
  }

  // Obtener decoraciones de una sección
  const getDecorations = (section) => {
    return config.decorations.filter((d) => d.section === section)
  }

  // Obtener texto traducido
  const getText = (key) => {
    return config.texts?.[key] || ''
  }

  return {
    config,
    getTexture,
    getTextureStyle,
    getDecorations,
    getText,
  }
}
