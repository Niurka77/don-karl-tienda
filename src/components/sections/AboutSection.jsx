import { WHATSAPP_PHONE, WHATSAPP_MESSAGES } from '../../lib/constants'
import { useSiteConfig } from '../../hooks/useSiteConfig'
import logoKB from '/kb.svg'

export default function AboutSection({ getText }) {
  const { config } = useSiteConfig()
  const phone = config.footerContact?.phone || WHATSAPP_PHONE

  const title = getText('about_title') || 'Nuestra historia'
  const description = getText('about_description') || 'KB Dresses & More nació en Chiclayo con una idea simple: traer moda importada de Estados Unidos con calidad y estilo para la mujer peruana.'
  const detail = getText('about_detail') || 'Seleccionamos cada pieza con ojo editorial: carteras, vestidos, billeteras y accesorios de marcas originales. Coordina tu compra por WhatsApp y recoge en tienda o recíbelo en casa.'
  const location = getText('about_location') || 'Chiclayo, Perú'
  const ctaText = getText('about_cta') || 'Hablemos por WhatsApp'

  const features = [
    {
      title: 'Calidad original',
      desc: 'Marcas importadas de USA, seleccionadas pieza por pieza',
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
      ),
    },
    {
      title: 'Atención personal',
      desc: 'Coordina tu pedido por WhatsApp con asesoría real',
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
      ),
    },
    {
      title: 'Recojo o envío',
      desc: 'Recoge en tienda en Chiclayo o recíbelo en tu casa',
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m1.5.5l-1.5-.5M6.75 7.364V3h-3v18m3-13.636l10.5-3.819" />
      ),
    },
  ]

  const stats = [
    { value: 'USA', label: 'moda importada' },
    { value: '+500', label: 'clientas felices' },
    { value: 'Perú', label: 'envíos nacionales' },
  ]

  return (
    <section
      id="nosotros"
      className="w-full relative overflow-hidden"
      style={{ backgroundColor: '#FAF3ED', scrollMarginTop: '80px' }}
    >
      {/* Textura decorativa de fondo */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div
          className="absolute -top-24 -left-24 w-72 h-72 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(212,120,138,0.12) 0%, transparent 70%)' }}
        />
        <div
          className="absolute -bottom-32 -right-24 w-96 h-96 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(201,169,97,0.14) 0%, transparent 70%)' }}
        />
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 items-stretch relative">
        {/* ── Texto ── */}
        <div className="flex flex-col justify-center px-8 py-16 md:px-16 md:py-24">
          {/* Eyebrow */}
          <div className="flex items-center gap-3 mb-6">
            <span className="inline-block h-px w-10" style={{ background: 'linear-gradient(90deg, #B85268, transparent)' }} />
            <p className="font-sans text-xs tracking-[0.22em] uppercase text-kb-rose mb-0 font-medium">
              KB Dresses & More
            </p>
          </div>

          <h2
            className="font-display text-3xl md:text-5xl font-light text-kb-obsidian leading-tight mb-6"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {title}{' '}
            <span className="italic font-normal" style={{ color: '#B85268' }}>
              con estilo
            </span>
          </h2>

          <p className="font-sans text-sm md:text-base text-kb-obsidian/70 font-light leading-relaxed mb-4 max-w-lg">
            {description}
          </p>
          <p className="font-sans text-sm md:text-base text-kb-obsidian/60 font-light leading-relaxed mb-10 max-w-lg">
            {detail}
          </p>

          {/* Características */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
            {features.map((f) => (
              <div key={f.title} className="flex flex-col gap-2">
                <div
                  className="w-10 h-10 flex items-center justify-center rounded-full mb-1"
                  style={{
                    background: 'rgba(212,120,138,0.1)',
                    border: '1px solid rgba(212,120,138,0.25)',
                    color: '#B85268',
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    {f.icon}
                  </svg>
                </div>
                <p className="font-sans text-sm font-medium text-kb-obsidian">{f.title}</p>
                <p className="font-sans text-xs text-kb-obsidian/55 font-light leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>

          {/* Separador */}
          <div className="h-px w-full mb-8" style={{ background: 'linear-gradient(90deg, rgba(212,120,138,0.35), transparent)' }} />

          {/* Estadísticas */}
          <div className="grid grid-cols-3 gap-4 mb-10">
            {stats.map((s) => (
              <div key={s.label}>
                <p className="font-display text-2xl md:text-3xl font-normal" style={{ color: '#B85268', fontFamily: 'var(--font-display)' }}>
                  {s.value}
                </p>
                <p className="font-sans text-[0.65rem] tracking-[0.12em] uppercase text-kb-obsidian/55 font-light mt-1">
                  {s.label}
                </p>
              </div>
            ))}
          </div>

          {/* Ubicación + CTA */}
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
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
        </div>

        {/* ── Panel con el logo ── */}
        <div
          className="relative flex flex-col items-center justify-center min-h-[420px] md:min-h-[640px] overflow-hidden"
          style={{
            background:
              'radial-gradient(120% 120% at 50% 0%, #E78FA2 0%, #D4788A 45%, #B85268 100%)',
          }}
        >
          {/* Aros decorativos */}
          <div className="absolute pointer-events-none" aria-hidden="true">
            <div
              className="rounded-full"
              style={{
                width: 'min(78%, 420px)',
                aspectRatio: '1/1',
                border: '1px solid rgba(255,255,255,0.35)',
              }}
            />
            <div
              className="absolute rounded-full"
              style={{
                inset: '6%',
                border: '1px dashed rgba(255,255,255,0.3)',
              }}
            />
            <div
              className="absolute rounded-full"
              style={{
                width: '100%',
                aspectRatio: '1/1',
                border: '1px solid rgba(255,255,255,0.12)',
                transform: 'scale(1.12)',
              }}
            />
          </div>

          {/* Partículas */}
          <span className="absolute top-14 left-[14%] text-white/40 text-lg" aria-hidden="true">✦</span>
          <span className="absolute top-1/3 right-[12%] text-white/30 text-xs" aria-hidden="true">✦</span>
          <span className="absolute bottom-16 right-[20%] text-white/40 text-base" aria-hidden="true">✦</span>
          <span className="absolute bottom-1/4 left-[10%] text-white/25 text-sm" aria-hidden="true">✦</span>

          {/* Logo */}
          <img
            src={logoKB}
            alt="KB Dresses and More"
            className="relative"
            style={{
              width: 'min(58%, 300px)',
              height: 'auto',
              filter: 'drop-shadow(0 14px 30px rgba(26,17,24,0.22))',
            }}
          />

          {/* Cintillo inferior del panel */}
          <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-2">
            <div className="h-px w-16" style={{ background: 'rgba(255,255,255,0.45)' }} />
            <span className="font-sans text-[0.62rem] tracking-[0.32em] uppercase text-white/75">
              KB Dresses & More
            </span>
            <span className="font-sans text-[0.55rem] tracking-[0.24em] uppercase text-white/50">
              Chiclayo · Perú
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
