import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'

const TestimonialsSection = ({ getText }) => {
  const [testimonials, setTestimonials] = useState([])
  const [loading, setLoading] = useState(true)
  const [indice, setIndice] = useState(0)

  useEffect(() => {
    const fetchTestimonios = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('testimonials')
          .select('*')
          .eq('active', true)
          .order('sort_order', { ascending: true })
          .order('created_at', { ascending: false })

        if (error) throw error
        setTestimonials(data || [])
      } catch (err) {
        console.error('Error al cargar testimonios:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchTestimonios()
  }, [])

  const siguiente = useCallback(() => {
    setIndice((prev) => (prev + 1) % Math.max(testimonials.length, 1))
  }, [testimonials.length])

  useEffect(() => {
    if (testimonials.length <= 1) return
    const timer = setInterval(siguiente, 6000)
    return () => clearInterval(timer)
  }, [siguiente, testimonials.length])

  if (loading) return null
  if (testimonials.length === 0) return null

  const visible = testimonials.slice(indice, indice + 3)
  const resto = visible.length < 3 ? testimonials.slice(0, 3 - visible.length) : []
  const tarjetas = [...visible, ...resto]

  const title = getText('testimonials_title') || 'Lo que dicen nuestras clientas'
  const subtitle = getText('testimonials_subtitle') || 'Opiniones reales de quienes ya compraron con nosotros'

  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#D4788A]/5" aria-hidden />
      <div className="absolute -bottom-32 -left-24 w-96 h-96 rounded-full bg-[#C9A84C]/5" aria-hidden />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-10">
        <div className="text-center mb-14 md:mb-16">
          <div className="flex items-center justify-center gap-4 mb-4">
            <span className="w-12 h-px bg-gradient-to-r from-transparent to-[#D4788A]" />
            <span className="text-[0.65rem] tracking-[0.35em] uppercase font-sans font-semibold text-[#D4788A]">
              Testimonios
            </span>
            <span className="w-12 h-px bg-gradient-to-l from-transparent to-[#D4788A]" />
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-light italic tracking-[-0.02em] text-[#1A1118]">
            {title}
          </h2>
          <p className="text-[#9A7480] font-sans text-sm font-light mt-3 max-w-md mx-auto tracking-wide">
            {subtitle}
          </p>
          <div className="w-16 h-px bg-gradient-to-r from-transparent via-[#D4788A] to-transparent mx-auto mt-5" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {tarjetas.map((t, i) => (
            <div
              key={`${t.id}-${i}`}
              className="relative bg-white rounded-sm shadow-sm p-7 md:p-8 flex flex-col"
              style={{
                border: '1px solid rgba(212,120,138,0.12)',
                animation: `fadeUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.1}s forwards`,
                opacity: 0,
                transform: 'translateY(30px)',
              }}
            >
              <svg className="w-8 h-8 text-[#D4788A]/30 mb-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9.983 3v7.391c0 5.704-3.731 9.57-8.983 10.609l-.995-2.151c2.432-.917 3.995-3.638 3.995-5.849h-4v-10h9.983zm14.017 0v7.391c0 5.704-3.748 9.571-9 10.609l-.996-2.151c2.433-.917 3.996-3.638 3.996-5.849h-3.983v-10h9.983z" />
              </svg>

              <p className="text-[#2D2030] text-sm md:text-[0.95rem] font-light leading-relaxed flex-1">
                "{t.comment}"
              </p>

              <div className="flex items-center gap-1 mb-5 mt-5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <svg key={s} className="w-4 h-4" viewBox="0 0 24 24" style={{ fill: s <= (t.rating || 5) ? '#C9A84C' : 'rgba(180,160,170,0.2)' }}>
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>

              <div className="flex items-center gap-3 pt-5 border-t border-[rgba(212,120,138,0.1)]">
                <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-display text-base flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #D4788A, #B85268)' }}>
                  {t.name?.charAt(0).toUpperCase() || 'C'}
                </div>
                <div>
                  <p className="text-[#1A1118] font-sans font-medium text-sm">{t.name}</p>
                  {t.city && (
                    <p className="text-[#9A7480] font-sans text-xs font-light">{t.city}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {testimonials.length > 3 && (
          <div className="flex items-center justify-center gap-4 mt-10">
            <button
              onClick={() => setIndice((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
              aria-label="Testimonios anteriores"
              className="w-10 h-10 rounded-full border border-[rgba(212,120,138,0.3)] text-[#B85268] flex items-center justify-center hover:bg-[#FDF0F3] transition-all duration-300"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(testimonials.length, 6) }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndice(i)}
                  aria-label={`Ir al testimonio ${i + 1}`}
                  className="w-2 h-2 rounded-full transition-all duration-300"
                  style={{
                    background: i === Math.min(indice, 5) ? '#D4788A' : 'rgba(212,120,138,0.2)',
                    width: i === Math.min(indice, 5) ? '24px' : '8px',
                  }}
                />
              ))}
            </div>
            <button
              onClick={siguiente}
              aria-label="Siguientes testimonios"
              className="w-10 h-10 rounded-full border border-[rgba(212,120,138,0.3)] text-[#B85268] flex items-center justify-center hover:bg-[#FDF0F3] transition-all duration-300"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  )
}

export default TestimonialsSection
