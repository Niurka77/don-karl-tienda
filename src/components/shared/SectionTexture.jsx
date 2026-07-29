import { useSiteConfig } from '../../hooks/useSiteConfig'

export default function SectionTexture({ section, children, className = '' }) {
  const { getTextureStyle, getDecorations } = useSiteConfig()
  const textureStyle = getTextureStyle(section)
  const decorations = getDecorations(section)
  const hasTexture = textureStyle.backgroundImage
  const hasDecos = decorations.length > 0

  if (!hasTexture && !hasDecos) {
    return <div className={className}>{children}</div>
  }

  return (
    <div className={`relative ${className}`}>
      {hasTexture && <div style={textureStyle} />}

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

      <div className="relative z-20">{children}</div>
    </div>
  )
}
