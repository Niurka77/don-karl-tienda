import logoKB from '/kb.png'

const checkItems = [
  {
    label: 'Productos 100% Originales',
    sub: 'Guess, Tommy Hilfiger, Calvin Klein, Michael Kors',
  },
  {
    label: 'Envíos a Todo el Perú',
    sub: 'Delivery seguro y rápido a cualquier ciudad',
  },
  {
    label: 'Atención Personalizada',
    sub: 'Te ayudamos a encontrar lo que buscas',
  },
]

const TrustSection = () => {
  return (
    <section
      id="nosotros"
      className="py-24 md:py-32 relative overflow-hidden"
      style={{ background: 'var(--color-kb-obsidian)' }}
    >
      {/* Texturas de fondo */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: `
          radial-gradient(ellipse 55% 70% at 0% 50%, rgba(212,120,138,0.06) 0%, transparent 60%),
          radial-gradient(ellipse 40% 50% at 100% 20%, rgba(184,82,104,0.04) 0%, transparent 60%)
        `,
      }} />

      <div className="relative max-w-screen-xl mx-auto px-6 lg:px-10">
        <div className="grid md:grid-cols-2 gap-16 lg:gap-24 items-center">

          {/* ── LEFT: tarjeta oscura con logo e info ── */}
          <div className="relative">

            {/* Línea decorativa vertical */}
            <div style={{
              position: 'absolute', left: '-20px', top: '10%', bottom: '10%', width: '1px',
              background: 'linear-gradient(180deg, transparent, rgba(212,120,138,0.3), transparent)',
            }} />

            {/* Tarjeta */}
            <div style={{
              background: 'rgba(45,32,48,0.6)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(212,120,138,0.15)',
              padding: '2.5rem',
              borderRadius: '2px',
            }}>
              {/* Logo */}
              <div style={{ marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid rgba(212,120,138,0.12)' }}>
                <img
                  src={logoKB}
                  alt="KB Dresses and More"
                  className="w-full object-contain"
                  style={{ filter: 'brightness(0) invert(1) opacity(0.8)', maxHeight: '80px' }}
                />
              </div>

              {/* Info contacto */}
              <div className="space-y-5">
                {[
                  {
                    icon: (
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    ),
                    label: 'Tienda Física',
                    value: 'Galería Chiclayo — 2do Piso',
                  },
                  {
                    icon: (
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    ),
                    label: 'WhatsApp',
                    value: '+51 906 877 812',
                  },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
                      border: '1px solid rgba(212,120,138,0.2)',
                      background: 'rgba(212,120,138,0.07)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"
                        style={{ color: 'var(--color-kb-rose)' }}>
                        {item.icon}
                      </svg>
                    </div>
                    <div>
                      <p style={{ fontSize: '0.65rem', fontWeight: 500, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(212,120,138,0.65)', marginBottom: '2px', fontFamily: 'var(--font-sans)' }}>
                        {item.label}
                      </p>
                      <p style={{ fontSize: '0.88rem', fontWeight: 300, color: 'rgba(253,240,243,0.85)', letterSpacing: '0.02em' }}>
                        {item.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Decoración número */}
              <div style={{
                marginTop: '2rem', paddingTop: '1.5rem',
                borderTop: '1px solid rgba(212,120,138,0.1)',
                display: 'flex', alignItems: 'baseline', gap: '0.5rem',
              }}>
                <span style={{
                  fontFamily: 'var(--font-display)', fontSize: '2.8rem',
                  fontWeight: 300, letterSpacing: '-0.04em',
                  color: 'rgba(255,255,255,0.06)', lineHeight: 1,
                  userSelect: 'none',
                }}>
                  KB
                </span>
                <span className="text-editorial" style={{ color: 'rgba(212,120,138,0.3)', fontSize: '0.58rem', letterSpacing: '0.2em' }}>
                  Dresses & More
                </span>
              </div>
            </div>
          </div>

          {/* ── RIGHT: texto editorial ── */}
          <div>
            {/* Label */}
            <div className="flex items-center gap-3 mb-6">
              <span style={{ width: '24px', height: '1px', background: 'var(--color-kb-rose)', display: 'inline-block' }} />
              <span className="text-editorial" style={{ color: 'var(--color-kb-rose)', fontSize: '0.62rem', letterSpacing: '0.25em' }}>
                Sobre nosotros
              </span>
            </div>

            {/* Título */}
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2rem, 4vw, 3.2rem)',
              fontWeight: 300, letterSpacing: '-0.02em', lineHeight: 1.08,
              color: 'var(--color-kb-ivory)',
              marginBottom: '1.5rem',
            }}>
              Moda importada desde{' '}
              <span style={{ fontStyle: 'italic', color: 'var(--color-kb-rose-mist)' }}>
                EE.UU.
              </span>
            </h2>

            {/* Párrafo */}
            <p style={{
              fontSize: '0.9rem', fontWeight: 300,
              color: 'rgba(154,116,128,0.85)',
              lineHeight: 1.8, marginBottom: '2.5rem',
              maxWidth: '460px',
            }}>
              En <strong style={{ color: 'rgba(242,196,206,0.8)', fontWeight: 400 }}>KB Dresses & More</strong> nos
              especializamos en traer lo último en tendencias directamente desde Estados Unidos. Contamos con
              una amplia variedad de carteras, vestidos de fiesta, billeteras y accesorios de las mejores marcas.
            </p>

            {/* Lista de checks */}
            <div className="space-y-5 mb-10">
              {checkItems.map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  {/* Check icon */}
                  <div style={{
                    width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0, marginTop: '1px',
                    border: '1px solid rgba(212,120,138,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
                      style={{ color: 'var(--color-kb-rose)' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.88rem', fontWeight: 400, color: 'rgba(253,240,243,0.85)', marginBottom: '2px' }}>
                      {item.label}
                    </p>
                    <p style={{ fontSize: '0.75rem', fontWeight: 300, color: 'rgba(154,116,128,0.65)', letterSpacing: '0.02em' }}>
                      {item.sub}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Divisor */}
            <div style={{ height: '1px', background: 'rgba(212,120,138,0.1)', marginBottom: '2rem' }} />

            {/* CTA WhatsApp */}
            <a
              href="https://wa.me/51906877812"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 transition-all duration-350"
              style={{
                padding: '0.9rem 2rem',
                background: 'linear-gradient(135deg, var(--color-kb-rose), var(--color-kb-rose-deep))',
                color: 'white',
                fontSize: '0.68rem', fontWeight: 500,
                fontFamily: 'var(--font-sans)',
                letterSpacing: '0.16em', textTransform: 'uppercase',
                borderRadius: '2px',
                boxShadow: '0 6px 24px rgba(212,120,138,0.3)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 10px 32px rgba(212,120,138,0.4)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 6px 24px rgba(212,120,138,0.3)'
              }}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Escríbenos por WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

export default TrustSection
