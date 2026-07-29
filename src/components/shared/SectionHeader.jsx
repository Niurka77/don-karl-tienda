import { p } from '../../lib/theme'

const SectionHeader = ({ title, subtitle, imagen, colorFondo }) => {
  return (
    <div
      style={{
        position: 'relative',
        padding: '3rem 2rem',
        textAlign: 'center',
        overflow: 'hidden',
        background: colorFondo || `linear-gradient(135deg, ${p.ivory}, ${p.cream})`,
        marginBottom: '2rem',
      }}
    >
      {imagen && (
        <img
          src={imagen}
          alt=""
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: 0.15,
          }}
        />
      )}

      <div
        style={{
          width: '32px',
          height: '1px',
          background: `linear-gradient(90deg, ${p.roseVivid}, ${p.gold})`,
          margin: '0 auto 1.25rem',
        }}
      />

      {title && (
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.3rem',
            fontWeight: 300,
            fontStyle: 'italic',
            color: p.ink,
            letterSpacing: '-0.01em',
            margin: 0,
          }}
        >
          {title}
        </h2>
      )}

      {subtitle && (
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '0.65rem',
            fontWeight: 400,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: p.textSoft,
            marginTop: '0.75rem',
            marginBottom: 0,
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  )
}

export default SectionHeader
