import { useRef, useState } from 'react'
import { p } from '../../../lib/theme'

const MagneticButton = ({ onClick, children, variant = 'primary', icon, strength = 0.3 }) => {
  const btnRef = useRef(null)
  const [offset, setOffset] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e) => {
    if (!btnRef.current) return
    const rect = btnRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    setOffset({ x: x * strength, y: y * strength })
  }

  const handleMouseLeave = () => setOffset({ x: 0, y: 0 })

  const isPrimary = variant === 'primary'
  const bg = isPrimary
    ? `linear-gradient(135deg, ${p.roseVivid}, ${p.coral}, ${p.goldSoft})`
    : p.ivory
  const color = isPrimary ? '#fff' : p.roseDeep
  const border = isPrimary ? 'none' : `1px solid ${p.roseBlush}`

  return (
    <button
      ref={btnRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        background: bg,
        color,
        border,
        padding: '0.85rem 2rem',
        borderRadius: '999px',
        fontSize: '0.72rem',
        fontWeight: 500,
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
        cursor: 'pointer',
        transform: `translate(${offset.x}px, ${offset.y}px)`,
        transition: 'transform 0.25s cubic-bezier(0.16,1,0.3,1)',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {isPrimary && (
        <span
          style={{
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
            transition: 'left 0.5s ease',
          }}
          className="shimmer"
        />
      )}
      {icon && (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d={icon} />
        </svg>
      )}
      {children}
    </button>
  )
}

export default MagneticButton
