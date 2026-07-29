import { useScrollReveal } from '../../hooks/useScrollReveal'
import { WHATSAPP_PHONE } from '../../lib/constants'
import { p } from '../../lib/theme'

const ADVISORY_IMAGE = 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&h=1000&fit=crop&q=85'

const AdvisorySection = () => {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.12 })

  return (
    <section
      ref={ref}
      style={{ background: '#F9F2F2', padding: 'clamp(3.5rem, 7vw, 6rem) 0' }}
    >
      <div style={{
        maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem',
        display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 'clamp(2rem, 5vw, 5rem)', alignItems: 'center',
      }}>

        <div style={{
          position: 'relative', overflow: 'hidden',
          height: 'clamp(360px, 45vw, 520px)',
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateX(0)' : 'translateX(-24px)',
          transition: 'opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.15s, transform 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.15s',
        }}>
          <img
            src={ADVISORY_IMAGE}
            alt="Asesoría de estilo personalizada"
            loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{
            position: 'absolute', bottom: '1.5rem', left: '1.5rem',
            background: p.obsidian, padding: '0.6rem 1rem',
            display: 'flex', alignItems: 'center', gap: '0.5rem',
          }}>
            <span style={{
              fontFamily: 'var(--font-display)', fontSize: '1.2rem',
              fontWeight: 300, fontStyle: 'italic', color: '#FFFFFF',
            }}>
              8+
            </span>
            <span style={{
              fontFamily: 'var(--font-sans)', fontSize: '0.55rem', fontWeight: 400,
              letterSpacing: '0.12em', textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.7)', lineHeight: 1.3,
            }}>
              Años de<br />experiencia
            </span>
          </div>
        </div>

        <div style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateX(0)' : 'translateX(24px)',
          transition: 'opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.3s, transform 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.3s',
        }}>
          <p style={{
            fontFamily: 'var(--font-sans)', fontSize: '0.6rem', fontWeight: 500,
            letterSpacing: '0.22em', textTransform: 'uppercase', color: p.rose, marginBottom: '0.8rem',
          }}>
            Asesoría
          </p>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem, 3vw, 2.6rem)',
            fontWeight: 300, color: p.obsidian, lineHeight: 1.15,
            margin: '0 0 1.2rem', letterSpacing: '-0.02em',
          }}>
            Encuentra tu{' '}
            <span style={{ fontStyle: 'italic', color: p.rose }}>estilo perfecto</span>
          </h2>
          <p style={{
            fontFamily: 'var(--font-sans)', fontSize: '0.85rem', fontWeight: 300,
            color: '#7A6B72', lineHeight: 1.75, marginBottom: '2rem', maxWidth: '420px',
          }}>
            Cada mujer tiene un estilo único. Te ayudamos a descubrir las piezas que mejor
            resaltan tu personalidad, combinando tendencias de moda importada con tu esencia.
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <a
              href={`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent('Hola, me gustaría agendar una asesoría de estilo.')}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block', fontFamily: 'var(--font-sans)',
                fontSize: '0.7rem', fontWeight: 400, letterSpacing: '0.18em',
                textTransform: 'uppercase', color: p.obsidian, textDecoration: 'none',
                padding: '0.85rem 2.2rem', border: `1px solid ${p.obsidian}`,
                transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = p.obsidian; e.currentTarget.style.color = '#FFFFFF' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = p.obsidian }}
            >
              Agendar cita
            </a>

            <a
              href="/catalogo"
              style={{
                display: 'inline-block', fontFamily: 'var(--font-sans)',
                fontSize: '0.7rem', fontWeight: 400, letterSpacing: '0.18em',
                textTransform: 'uppercase', color: '#7A6B72', textDecoration: 'none',
                padding: '0.85rem 2.2rem', transition: 'color 0.3s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = p.obsidian }}
              onMouseLeave={e => { e.currentTarget.style.color = '#7A6B72' }}
            >
              Ver catálogo
            </a>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          section > div {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  )
}

export default AdvisorySection
