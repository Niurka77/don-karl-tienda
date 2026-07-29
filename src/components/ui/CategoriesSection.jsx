import { Link } from 'react-router-dom'
import { useScrollReveal } from '../../hooks/useScrollReveal'
import { p } from '../../lib/theme'

const CATEGORIES = [
  {
    title: 'Carteras', titleAccent: 'Importadas',
    subtitle: 'Guess · Tommy · Calvin Klein',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=900&h=1200&fit=crop&q=95',
    link: '/?categoria=carteras', num: '01',
  },
  {
    title: 'Vestidos', titleAccent: 'de Fiesta',
    subtitle: 'Elegancia atemporal',
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=900&h=1200&fit=crop&q=95',
    link: '/?categoria=vestidos', num: '02',
  },
  {
    title: 'Billeteras', titleAccent: 'Premium',
    subtitle: 'Michael Kors · Tommy · CK',
    image: 'https://images.unsplash.com/photo-1606503156036-9d2b3da6b5b0?w=900&h=1200&fit=crop&q=95',
    link: '/?categoria=billeteras', num: '03',
  },
]

const CategoryCard = ({ cat, index, isLarge }) => {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.15 })

  return (
    <Link
      ref={ref}
      to={cat.link}
      style={{
        display: 'block', position: 'relative', overflow: 'hidden',
        height: isLarge ? '100%' : 'clamp(220px, 30vw, 320px)',
        textDecoration: 'none', color: 'inherit',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(24px)',
        transition: `opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${index * 120}ms, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${index * 120}ms`,
      }}
      onMouseEnter={e => { const img = e.currentTarget.querySelector('img'); if (img) img.style.transform = 'scale(1.04)' }}
      onMouseLeave={e => { const img = e.currentTarget.querySelector('img'); if (img) img.style.transform = 'scale(1)' }}
    >
      <img
        src={cat.image}
        alt={cat.title}
        loading="lazy"
        style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          objectFit: 'cover', transition: 'transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      />

      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, transparent 40%, rgba(26,17,24,0.6) 100%)',
      }} />

      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: 'clamp(1.2rem, 2.5vw, 2rem)', zIndex: 2,
      }}>
        {cat.num && (
          <span style={{
            fontFamily: 'var(--font-sans)', fontSize: '0.55rem', fontWeight: 400,
            letterSpacing: '0.2em', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '0.5rem',
          }}>
            {cat.num}
          </span>
        )}
        <h3 style={{
          fontFamily: 'var(--font-display)',
          fontSize: isLarge ? 'clamp(1.6rem, 3vw, 2.4rem)' : 'clamp(1.2rem, 2vw, 1.6rem)',
          fontWeight: 300, fontStyle: 'italic', color: '#FFFFFF',
          lineHeight: 1.1, margin: 0, letterSpacing: '-0.01em',
        }}>
          {cat.title}{' '}
          <span style={{ color: p.rose }}>{cat.titleAccent}</span>
        </h3>
        {cat.subtitle && (
          <p style={{
            fontFamily: 'var(--font-sans)', fontSize: '0.7rem', fontWeight: 300,
            letterSpacing: '0.08em', color: 'rgba(255,255,255,0.6)', marginTop: '0.4rem',
          }}>
            {cat.subtitle}
          </p>
        )}
      </div>
    </Link>
  )
}

const CategoriesSection = () => {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.2 })

  return (
    <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(3rem, 6vw, 5rem) 1.5rem' }}>
      <div
        ref={ref}
        style={{
          textAlign: 'center', marginBottom: 'clamp(2rem, 4vw, 3.5rem)',
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <div style={{ width: '40px', height: '1px', background: p.rose, margin: '0 auto 1.2rem' }} />
        <p style={{
          fontFamily: 'var(--font-sans)', fontSize: '0.6rem', fontWeight: 500,
          letterSpacing: '0.22em', textTransform: 'uppercase', color: p.rose, marginBottom: '0.6rem',
        }}>
          Explora por
        </p>
        <h2 style={{
          fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)',
          fontWeight: 300, color: p.obsidian, letterSpacing: '-0.02em', lineHeight: 1.05, margin: 0,
        }}>
          Explora por{' '}
          <span style={{ fontStyle: 'italic', color: p.rose }}>categoría</span>
        </h2>
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem',
        minHeight: 'clamp(340px, 50vw, 480px)',
      }}>
        <div style={{ gridRow: '1 / 3' }}>
          <CategoryCard cat={CATEGORIES[0]} index={0} isLarge />
        </div>
        {CATEGORIES.slice(1, 3).map((cat, i) => (
          <CategoryCard key={i} cat={cat} index={i + 1} isLarge={false} />
        ))}
      </div>

      <style>{`
        @media (max-width: 768px) {
          section > div:last-child {
            grid-template-columns: 1fr !important;
            grid-template-rows: auto !important;
          }
          section > div:last-child > div {
            grid-row: auto !important;
          }
        }
      `}</style>
    </section>
  )
}

export default CategoriesSection
