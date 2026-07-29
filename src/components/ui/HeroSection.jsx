import { Link } from 'react-router-dom'
import { useScrollReveal } from '../../hooks/useScrollReveal'

const HERO_IMAGE = 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=1600&h=1000&fit=crop&q=85'

const HeroSection = () => {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.05 })

  return (
    <section
      ref={ref}
      style={{
        position: 'relative', width: '100%', height: '85vh', minHeight: '560px', maxHeight: '900px',
        overflow: 'hidden', background: '#1A1118',
      }}
    >
      <img
        src={HERO_IMAGE}
        alt="Vestidos de fiesta KB Dresses"
        loading="eager"
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%',
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'scale(1)' : 'scale(1.05)',
          transition: 'opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1), transform 1.4s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      />

      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(26,17,24,0.1) 0%, rgba(26,17,24,0.55) 100%)',
      }} />

      <div style={{
        position: 'relative', zIndex: 2,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        height: '100%', padding: '0 1.5rem', textAlign: 'center',
      }}>
        <div style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(32px)',
          transition: 'opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.3s, transform 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.3s',
        }}>
          <p style={{
            fontFamily: 'var(--font-sans)', fontSize: '0.65rem', fontWeight: 400,
            letterSpacing: '0.25em', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.65)', marginBottom: '1.5rem',
          }}>
            Nueva colección
          </p>

          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(2.4rem, 5.5vw, 4.5rem)',
            fontWeight: 300, fontStyle: 'italic', color: '#FFFFFF', lineHeight: 1.1,
            letterSpacing: '-0.02em', margin: 0,
          }}>
            Vestidos que<br />
            <span style={{ fontStyle: 'italic' }}>cuentan historias</span>
          </h1>

          <div style={{ width: '40px', height: '1px', background: 'var(--color-kb-rose)', margin: '2rem auto' }} />

          <Link
            to="/catalogo"
            style={{
              display: 'inline-block', fontFamily: 'var(--font-sans)',
              fontSize: '0.7rem', fontWeight: 400, letterSpacing: '0.18em',
              textTransform: 'uppercase', color: '#FFFFFF', textDecoration: 'none',
              padding: '0.9rem 2.8rem', background: '#1A1118',
              border: '1px solid rgba(255,255,255,0.2)',
              transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.color = '#1A1118' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#1A1118'; e.currentTarget.style.color = '#FFFFFF' }}
          >
            Ver colección
          </Link>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
