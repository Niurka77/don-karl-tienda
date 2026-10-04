import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

const VIDEOS_POR_PAGINA = 6

// ─── Cache en memoria del oEmbed de TikTok (evita re-consultas) ─────────────
const oembedCache = {}

const fetchTikTokMeta = async (url) => {
  if (!url) return { thumb: '', title: '' }
  if (oembedCache[url]) return oembedCache[url]

  try {
    const res = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`)
    if (!res.ok) throw new Error('oEmbed falló')
    const data = await res.json()
    oembedCache[url] = { thumb: data.thumbnail_url || '', title: data.title || '' }
  } catch {
    oembedCache[url] = { thumb: '', title: '' }
  }
  return oembedCache[url]
}

// ─── Placeholder editorial (reemplaza las fotos de stock) ───────────────────
const VideoPlaceholder = () => (
  <div
    className="w-full h-full flex flex-col items-center justify-center"
    style={{
      background: 'linear-gradient(150deg, #F2C4CE 0%, #E8D5B7 55%, #FDF0F3 100%)',
    }}
  >
    <span
      style={{
        fontFamily: 'var(--font-display)',
        fontStyle: 'italic',
        fontSize: '2.6rem',
        color: 'rgba(184,82,104,0.55)',
        letterSpacing: '-0.02em',
      }}
    >
      KB
    </span>
    <span
      style={{
        fontSize: '0.55rem',
        letterSpacing: '0.35em',
        textTransform: 'uppercase',
        color: 'rgba(154,116,128,0.8)',
        fontFamily: 'var(--font-sans)',
        fontWeight: 600,
        marginTop: '0.4rem',
      }}
    >
      Dresses & More
    </span>
  </div>
)

const TikTokIcon = ({ className = 'w-4 h-4', color = '#D4788A' }) => (
  <svg className={className} fill={color} viewBox="0 0 24 24">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
)

const VideoGallery = ({ limit, showTitle = true }) => {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAll, setShowAll] = useState(false)
  const [thumbs, setThumbs] = useState({})

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('social_videos')
          .select('*')
          .eq('active', true)
          .order('sort_order', { ascending: true })
          .order('created_at', { ascending: false })

        if (error) throw error
        const unique = data ? data.filter((v, i, arr) => arr.findIndex(a => a.id === v.id) === i) : []
        setVideos(unique)

        // Obtener el frame real (thumbnail) de cada video via oEmbed
        const entries = {}
        await Promise.all(
          unique.map(async (v) => {
            const meta = await fetchTikTokMeta(v.tiktok_url)
            entries[v.id] = meta.thumb
          })
        )
        setThumbs(entries)
      } catch (err) {
        console.error('Error al cargar videos:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchVideos()
  }, [])

  const finalLimit = limit && limit > 0 ? limit : VIDEOS_POR_PAGINA
  const videosToShow = showAll ? videos : videos.slice(0, finalLimit)

  if (loading) {
    return (
      <section className="py-20 text-center">
        <div className="inline-block w-12 h-12 border-4 border-[#D4788A] border-t-transparent rounded-full animate-spin" />
        <p className="text-[#9A7480] font-sans text-sm mt-4">Cargando videos...</p>
      </section>
    )
  }

  if (videos.length === 0) return null

  return (
    <section className="relative py-16 md:py-24 overflow-hidden">

      <div className="relative max-w-7xl mx-auto px-6 lg:px-10">
        {/* ─── HEADER ─── */}
        {showTitle && (
          <div className="text-center mb-14 md:mb-20">
            <div className="flex items-center justify-center gap-4 mb-4">
              <span className="w-12 h-px bg-gradient-to-r from-transparent to-[#D4788A]" />
              <span className="text-[0.65rem] tracking-[0.35em] uppercase font-sans font-semibold text-[#D4788A]">
                TikTok
              </span>
              <span className="w-12 h-px bg-gradient-to-l from-transparent to-[#D4788A]" />
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-light italic tracking-[-0.02em] text-[#1A1118]">
              Inspírate con{' '}
              <span className="text-[#D4788A]">nuestros videos</span>
            </h2>
            <p className="text-[#9A7480] font-sans text-sm font-light mt-3 max-w-md mx-auto tracking-wide">
              Avances reales de nuestras piezas en TikTok
            </p>
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-[#D4788A] to-transparent mx-auto mt-5" />
          </div>
        )}

        {/* ─── GRID DE VIDEOS (vertical / estilo TikTok) ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {videosToShow.map((video, index) => {
            const thumb = thumbs[video.id] || ''
            return (
              <div
                key={video.id}
                className="group relative bg-white rounded-sm overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-3"
                style={{
                  animation: `fadeUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.08}s forwards`,
                  opacity: 0,
                  transform: 'translateY(30px)',
                }}
              >
                {/* ── Avance del video (frame real o placeholder) ── */}
                <a
                  href={video.tiktok_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block aspect-[3/4] bg-[#FDF0F3] relative overflow-hidden"
                  aria-label={`Ver video: ${video.title}`}
                >
                  {thumb ? (
                    <img
                      src={thumb}
                      alt={video.title}
                      className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                        e.currentTarget.nextSibling.style.display = 'flex'
                      }}
                    />
                  ) : null}

                  {/* Placeholder (solo si la miniatura no carga) */}
                  <div
                    className="w-full h-full"
                    style={{ display: thumb ? 'none' : 'flex' }}
                  >
                    <VideoPlaceholder />
                  </div>

                  {/* Degradado inferior */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1A1118]/55 via-transparent to-transparent" />

                  {/* ── Badge TikTok ── */}
                  <div className="absolute top-4 right-4 z-10">
                    <div className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                      <TikTokIcon />
                    </div>
                  </div>

                  {/* ── Botón Play (avance) ── */}
                  <div className="absolute inset-0 flex items-center justify-center z-10 transition-all duration-500 group-hover:opacity-100 opacity-80">
                    <div className="w-16 h-16 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-7 h-7 ml-1 text-[#D4788A]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>

                  {/* Contador de reproducciones (decorativo) */}
                  <div className="absolute bottom-3 left-4 z-10 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-white/90" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span className="text-white/90 text-xs font-sans font-light tracking-wide">TikTok</span>
                  </div>
                </a>

                {/* ── CONTENIDO ── */}
                <div className="p-5 md:p-6">
                  <h3 className="font-display text-xl md:text-2xl font-light tracking-[-0.01em] text-[#1A1118] line-clamp-1">
                    {video.title}
                  </h3>
                  {video.description && (
                    <p className="text-sm text-[#9A7480] font-sans font-light mt-1 leading-relaxed line-clamp-2">
                      {video.description}
                    </p>
                  )}
                  <div className="w-12 h-px bg-[#D4788A]/30 my-4" />
                  <a
                    href={video.tiktok_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-sans font-medium text-[#D4788A] hover:text-[#B85268] transition-all duration-300 group/link"
                  >
                    <span className="border-b border-[#D4788A]/30 group-hover/link:border-[#B85268] pb-0.5">Ver en TikTok</span>
                    <svg className="w-4 h-4 transform group-hover/link:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>

                {/* ── Borde brillante en hover ── */}
                <div className="absolute inset-0 pointer-events-none border-2 border-transparent group-hover:border-[#D4788A]/40 transition-colors duration-500 rounded-sm" />
              </div>
            )
          })}
        </div>

        {/* ─── BOTÓN VER MÁS ─── */}
        {videos.length > finalLimit && (
          <div className="flex justify-center mt-12 md:mt-16">
            <button
              onClick={() => setShowAll(!showAll)}
              className="group relative px-8 py-3 bg-[#1A1118] text-white rounded-sm font-sans font-medium text-sm tracking-wider hover:bg-gradient-to-r hover:from-[#D4788A] hover:to-[#B85268] transition-all duration-300 shadow-md hover:shadow-xl"
            >
              <span className="relative z-10">
                {showAll ? '— Ver menos —' : `+ Ver todos los ${videos.length} videos`}
              </span>
            </button>
          </div>
        )}

        {/* ─── FOOTER TIKTOK ─── */}
        <div className="flex justify-center mt-16 pt-8 border-t border-[rgba(212,120,138,0.12)]">
          <a
            href="https://www.tiktok.com/@kb.dresses.more"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 text-sm text-[#9A7480] hover:text-[#D4788A] transition-colors duration-300 font-sans group"
          >
            <div className="w-9 h-9 rounded-full bg-[#1A1118] flex items-center justify-center group-hover:bg-gradient-to-r group-hover:from-[#D4788A] group-hover:to-[#B85268] transition-all duration-300 shadow-md group-hover:shadow-lg">
              <TikTokIcon color="#FFFFFF" />
            </div>
            <span>Síguenos en TikTok</span>
            <span className="font-medium text-[#1A1118] group-hover:text-[#D4788A] transition-colors border-b border-transparent group-hover:border-[#D4788A] pb-0.5">
              @kb.dresses.more
            </span>
          </a>
        </div>
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

export default VideoGallery