import { useSiteConfig } from '../../hooks/useSiteConfig'

export default function SectionTexture({ section, children, className = '' }) {
  const { getTextureStyle, getDecorations, getSectionBg } = useSiteConfig()
  const textureStyle = getTextureStyle(section)
  const decorations = getDecorations(section)
  const bgColor = getSectionBg(section)
  const hasTexture = textureStyle.backgroundImage
  const hasDecos = decorations.length > 0
  const hasBg = !!bgColor

  // Si no hay nada configurado, solo renderizar contenido
  if (!hasTexture && !hasDecos && !hasBg) {
    return <div className={className}>{children}</div>
  }

  // Modo color: si hay bgColor, se usa color solido (sin textura)
  // Modo textura: si no hay bgColor pero si textura, se usa textura
  const useColorMode = hasBg

  return (
    <div
      className={`relative ${className}`}
      style={useColorMode ? { backgroundColor: bgColor } : undefined}
    >
      {/* Textura (solo si NO hay color) */}
      {!useColorMode && hasTexture && <div style={textureStyle} />}

      {/* Decoraciones flotantes (siempre) */}
      {decorations.map((deco) => (
        <img
          key={deco.id}
          src={deco.url}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute z-10"
          style={{
            top: deco.position?.top || '10%',
            left: deco.position?.left || '10%',
            width: deco.size?.width || '150px',
            height: deco.size?.height || 'auto',
            opacity: deco.opacity || 0.15,
            transform: `rotate(${deco.rotation || 0}deg)`,
          }}
        />
      ))}

      {/* Contenido */}
      <div className="relative z-20">{children}</div>
    </div>
  )
}
