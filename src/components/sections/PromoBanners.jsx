import { Link } from 'react-router-dom'

const Banner = ({ title, subtitle, ctaText, href, to, image, variant = 'rose' }) => {
  const isRose = variant === 'rose'
  return (
    <Link
      to={to || '/catalogo'}
      onClick={(e) => {
        if (href) {
          e.preventDefault()
          window.location.href = href
        }
      }}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1.5rem',
        overflow: 'hidden',
        padding: '2rem 2.25rem',
        borderRadius: '16px',
        background: isRose ? 'linear-gradient(120deg, #FCE8EC 0%, #F7D6DD 55%, #F2C4CE 100%)' : '#FBF6EE',
        border: `1px solid ${isRose ? 'rgba(212,120,138,0.25)' : 'rgba(201,168,76,0.25)'}`,
        textDecoration: 'none',
        minHeight: '190px',
        transition: 'transform 0.4s cubic-bezier(0.16,1,0.3,1), box-shadow 0.4s ease',
      }}
      className="kb-promo"
    >
      <div style={{ flex: 1, zIndex: 1 }}>
        <p
          style={{
            fontFamily: 'var(--font-sans)', fontSize: '0.62rem', letterSpacing: '0.28em',
            textTransform: 'uppercase', fontWeight: 600,
            color: isRose ? 'var(--color-kb-rose-deep, #B85268)' : 'var(--color-kb-gold, #C9A84C)',
            margin: '0 0 0.5rem',
          }}
        >
          {subtitle}
        </p>
        <h3
          style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem, 2.5vw, 2.2rem)',
            fontWeight: 300, color: '#2D1F26', lineHeight: 1.08, margin: '0 0 1.1rem',
            letterSpacing: '-0.01em',
          }}
        >
          {title}
        </h3>
        <span
          style={{
            display: 'inline-block',
            fontFamily: 'var(--font-sans)', fontSize: '0.66rem', letterSpacing: '0.2em',
            textTransform: 'uppercase', fontWeight: 600,
            padding: '0.7rem 1.5rem', borderRadius: '50px', cursor: 'pointer',
            background: isRose ? 'var(--color-kb-rose-deep, #B85268)' : 'transparent',
            color: isRose ? '#FFFFFF' : 'var(--color-kb-rose-deep, #B85268)',
            border: isRose ? '1px solid var(--color-kb-rose-deep, #B85268)' : '1.5px solid var(--color-kb-rose-deep, #B85268)',
            transition: 'all 0.3s ease',
          }}
          className="kb-promo__cta"
        >
          {ctaText}
        </span>
      </div>

      {image && (
        <div
          style={{
            width: '140px', height: '170px', flexShrink: 0, borderRadius: '12px',
            overflow: 'hidden', position: 'relative',
            boxShadow: '0 16px 36px -14px rgba(45,31,38,0.35)',
          }}
        >
          <img src={image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
        </div>
      )}

      <style>{`
        .kb-promo:hover { transform: translateY(-4px); box-shadow: 0 22px 44px -18px rgba(45,31,38,0.28); }
        .kb-promo:hover .kb-promo__cta { transform: translateY(-1px); }
        .kb-promo:hover .kb-promo__cta { background: var(--color-kb-gold, #C9A84C); border-color: var(--color-kb-gold, #C9A84C); color: #fff; }
      `}</style>
    </Link>
  )
}

export default function PromoBanners({ getText }) {
  return (
    <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        <Banner
          title={getText?.('banner_sale_title') || 'Nueva Colección'}
          subtitle={getText?.('banner_sale_eyebrow') || 'Summer Edit'}
          ctaText={getText?.('banner_sale_cta') || 'Descubrir'}
          to="/catalogo"
          variant="rose"
        />
        <Banner
          title={getText?.('banner_new_title') || 'Los más pedidos'}
          subtitle={getText?.('banner_new_eyebrow') || 'New Arrivals'}
          ctaText={getText?.('banner_new_cta') || 'Ver ahora'}
          to="/?sort=recientes"
          variant="cream"
        />
      </div>
    </section>
  )
}
