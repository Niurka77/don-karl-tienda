import { WHATSAPP_PHONE, WHATSAPP_MESSAGES } from '../../lib/constants'
import { useSiteConfig } from '../../hooks/useSiteConfig'

export default function AboutSection({ getText }) {
  const { config } = useSiteConfig()
  const phone = config.footerContact?.phone || WHATSAPP_PHONE

  const title = getText('about_title') || 'Nuestra historia'
  const description = getText('about_description') || 'KB Dresses & More nació en Chiclayo con una idea simple: traer moda importada de Estados Unidos con calidad y estilo para la mujer peruana.'
  const detail = getText('about_detail') || 'Seleccionamos cada pieza con ojo editorial: carteras, vestidos, billeteras y accesorios de marcas originales. Coordina tu compra por WhatsApp y recoge en tienda o recíbelo en casa.'
  const location = getText('about_location') || 'Chiclayo, Perú'
  const ctaText = getText('about_cta') || 'Hablemos por WhatsApp'

  return (
    <section id="nosotros" className="w-full" style={{ backgroundColor: '#FAF3ED', scrollMarginTop: '80px' }}>
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 items-stretch">
        {/* Texto */}
        <div className="flex flex-col justify-center px-8 py-16 md:px-16">
          <p className="font-sans text-xs tracking-[0.22em] uppercase text-kb-rose mb-3 font-medium">
            KB Dresses & More
          </p>
          <h2
            className="font-display text-3xl md:text-5xl font-light text-kb-obsidian leading-tight mb-6"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {title}
          </h2>
          <p className="font-sans text-sm md:text-base text-kb-obsidian/70 font-light leading-relaxed mb-4 max-w-lg">
            {description}
          </p>
          <p className="font-sans text-sm md:text-base text-kb-obsidian/60 font-light leading-relaxed mb-8 max-w-lg">
            {detail}
          </p>

          <div className="flex items-center gap-2 mb-8">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B85268" strokeWidth={1.8} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            <span className="font-sans text-sm text-kb-obsidian/70 tracking-wide">
              {location}
            </span>
          </div>

          <a
            href={`https://wa.me/${phone}?text=${encodeURIComponent(WHATSAPP_MESSAGES.contact)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="self-start bg-kb-rose-deep text-white px-10 py-4 text-xs font-sans tracking-[0.2em] uppercase transition-all duration-300 hover:bg-kb-gold font-semibold"
          >
            {ctaText}
          </a>
        </div>

        {/* Panel decorativo */}
        <div
          className="relative flex items-center justify-center min-h-[320px] md:min-h-[480px] overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, var(--color-kb-rose-deep) 0%, var(--color-kb-rose) 60%, var(--color-kb-rose-mist) 100%)',
          }}
        >
          <div className="absolute inset-0" aria-hidden="true">
            <svg viewBox="0 0 200 200" className="w-full h-full opacity-[0.08]" preserveAspectRatio="none">
              <path d="M40 40h120v120H40z" fill="none" stroke="#fff" strokeWidth="1" />
              <path d="M60 60h80v80H60z" fill="none" stroke="#fff" strokeWidth="1" />
              <circle cx="100" cy="100" r="60" fill="none" stroke="#fff" strokeWidth="1" />
            </svg>
          </div>
          <span
            className="relative font-display italic text-white text-6xl md:text-8xl font-light"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            KB
          </span>
          <span
            className="absolute bottom-8 left-8 font-sans text-[0.62rem] tracking-[0.3em] uppercase text-white/60"
          >
            Chiclayo · Perú
          </span>
        </div>
      </div>
    </section>
  )
}
