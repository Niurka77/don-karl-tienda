import { Link } from 'react-router-dom'
import { useState } from 'react'

const categories = [
  {
    title: "Carteras",
    titleAccent: "Importadas",
    subtitle: "Guess · Tommy · Calvin Klein",
    description: "Importadas desde EE.UU.",
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&h=1000&fit=crop",
    link: "/?categoria=carteras",
    num: "01",
  },
  {
    title: "Vestidos",
    titleAccent: "de Fiesta",
    subtitle: "Elegancia atemporal",
    description: "Para ocasiones especiales",
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&h=1000&fit=crop",
    link: "/?categoria=vestidos",
    num: "02",
  },
  {
    title: "Billeteras",
    titleAccent: "Premium",
    subtitle: "Michael Kors · Tommy · CK",
    description: "Diseño y funcionalidad",
    image: "https://images.unsplash.com/photo-1627123428493-eb5ae6dc65a3?w=800&h=1000&fit=crop",
    link: "/?categoria=billeteras",
    num: "03",
  },
]

const CategoryCard = ({ cat }) => {
  const [hovered, setHovered] = useState(false)

  return (
    <Link
      to={cat.link}
      className="group relative block overflow-hidden w-full h-full"
      aria-label={`Explorar ${cat.title}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <img
        src={cat.image}
        alt={cat.title}
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          transition: 'transform 1.1s cubic-bezier(0.16,1,0.3,1)',
          transform: hovered ? 'scale(1.07)' : 'scale(1)',
        }}
        loading="lazy"
      />

      {/* Overlay base */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, rgba(26,17,24,0) 25%, rgba(26,17,24,0.80) 100%)',
          opacity: hovered ? 0.95 : 0.85,
          transition: 'opacity 0.5s ease',
        }}
      />

      {/* Tinte rosado hover */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 100%, rgba(212,120,138,0.18) 0%, transparent 70%)',
          opacity: hovered ? 1 : 0,
          transition: 'opacity 0.6s ease',
        }}
      />

      {/* Número esquina */}
      <div
        className="absolute top-5 left-5 text-editorial"
        style={{
          color: 'rgba(242,196,206,0.35)',
          fontSize: '0.6rem',
          letterSpacing: '0.22em',
          opacity: hovered ? 0 : 1,
          transition: 'opacity 0.3s ease',
        }}
      >
        {cat.num}
      </div>

      {/* "Ver colección" arriba derecha */}
      <div
        className="absolute top-5 right-5 text-editorial"
        style={{
          color: 'rgba(242,196,206,0.75)',
          fontSize: '0.58rem',
          letterSpacing: '0.2em',
          opacity: hovered ? 1 : 0,
          transform: hovered ? 'translateY(0)' : 'translateY(-6px)',
          transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        Ver colección
      </div>

      {/* Contenido abajo */}
      <div
        className="absolute inset-x-0 bottom-0 p-6 lg:p-7"
        style={{
          transform: hovered ? 'translateY(-5px)' : 'translateY(0)',
          transition: 'transform 0.5s cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        <p
          className="text-editorial mb-2"
          style={{
            color: 'rgba(242,196,206,0.6)',
            fontSize: '0.58rem',
            letterSpacing: '0.2em',
            opacity: hovered ? 1 : 0.7,
            transition: 'opacity 0.4s ease',
          }}
        >
          {cat.subtitle}
        </p>

        <h3
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.5rem, 2.2vw, 1.9rem)',
            fontWeight: 300,
            letterSpacing: '-0.02em',
            color: 'var(--color-kb-ivory)',
            lineHeight: 1.08,
            marginBottom: '0.5rem',
          }}
        >
          {cat.title}{' '}
          <span style={{ fontStyle: 'italic', color: 'var(--color-kb-rose-mist)' }}>
            {cat.titleAccent}
          </span>
        </h3>

        {/* Descripción desliza al hover */}
        <div
          style={{
            overflow: 'hidden',
            maxHeight: hovered ? '36px' : '0',
            opacity: hovered ? 1 : 0,
            transition: 'max-height 0.4s cubic-bezier(0.16,1,0.3,1), opacity 0.4s ease',
            marginBottom: hovered ? '0.9rem' : '0',
          }}
        >
          <p style={{ fontSize: '0.78rem', fontWeight: 300, color: 'rgba(253,240,243,0.6)', letterSpacing: '0.02em' }}>
            {cat.description}
          </p>
        </div>

        {/* Flecha */}
        <div
          className="flex items-center gap-2"
          style={{
            color: hovered ? 'var(--color-kb-rose-mist)' : 'rgba(242,196,206,0.45)',
            transition: 'color 0.4s ease',
          }}
        >
          <span style={{
            display: 'inline-block', height: '1px', background: 'currentColor', flexShrink: 0,
            width: hovered ? '28px' : '14px',
            transition: 'width 0.5s cubic-bezier(0.16,1,0.3,1)',
          }} />
          <span className="text-editorial" style={{ fontSize: '0.58rem', letterSpacing: '0.18em' }}>
            Explorar
          </span>
        </div>
      </div>
    </Link>
  )
}

const CategoriesSection = () => {
  return (
    <section className="py-24 md:py-32" style={{ background: 'var(--color-kb-ivory)' }}>
      <div className="max-w-screen-xl mx-auto px-6 lg:px-10">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span style={{ width: '24px', height: '1px', background: 'var(--color-kb-rose)', display: 'inline-block' }} />
              <span className="text-editorial" style={{ color: 'var(--color-kb-rose)', fontSize: '0.62rem', letterSpacing: '0.25em' }}>
                Colecciones
              </span>
            </div>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 300, letterSpacing: '-0.02em', lineHeight: 1.05,
              color: 'var(--color-kb-charcoal)',
            }}>
              Explora por{' '}
              <span style={{ fontStyle: 'italic', color: 'var(--color-kb-rose)' }}>categoría</span>
            </h2>
          </div>
          <p style={{ fontSize: '0.85rem', fontWeight: 300, color: 'var(--color-kb-mauve)', maxWidth: '260px', lineHeight: 1.65 }}>
            Piezas seleccionadas para ti, importadas directamente desde Estados Unidos.
          </p>
        </div>

        {/* Grid asimétrico — desktop */}
        <div className="hidden md:grid gap-4" style={{ gridTemplateColumns: '1fr 1fr', gridTemplateRows: '360px 360px' }}>
          {/* Grande izquierda — ocupa las 2 filas */}
          <div style={{ gridRow: 'span 2', position: 'relative' }}>
            <CategoryCard cat={categories[0]} />
          </div>
          {/* Dos pequeñas derecha */}
          <div style={{ position: 'relative' }}>
            <CategoryCard cat={categories[1]} />
          </div>
          <div style={{ position: 'relative' }}>
            <CategoryCard cat={categories[2]} />
          </div>
        </div>

        {/* Grid mobile — 3 apiladas con aspect-ratio */}
        <div className="md:hidden flex flex-col gap-4">
          {categories.map((cat, idx) => (
            <div key={idx} style={{ position: 'relative', aspectRatio: '4/3' }}>
              <CategoryCard cat={cat} />
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="flex justify-center mt-12">
          <Link to="/" className="btn-kb-ghost" style={{ fontSize: '0.68rem' }}>
            Ver toda la colección
          </Link>
        </div>
      </div>
    </section>
  )
}

export default CategoriesSection
