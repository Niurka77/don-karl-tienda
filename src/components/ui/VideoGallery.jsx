import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

const VIDEOS_POR_PAGINA = 6

const VideoGallery = ({ limit, showTitle = true }) => {
  const [videos, setVideos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [mostrarTodos, setMostrarTodos] = useState(false)

  useEffect(() => {
    cargarVideos()
  }, [])

  const cargarVideos = async () => {
    const { data, error } = await supabase
      .from('social_videos')
      .select('*')
      .eq('active', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })
    
    if (!error && data) {
      setVideos(data)
    }
    setCargando(false)
  }

  const videosToShow = mostrarTodos ? videos : videos.slice(0, limit || VIDEOS_POR_PAGINA)

  if (cargando) {
    return (
      <div className="text-center py-12">
        <div className="inline-block w-6 h-6 border-2 border-[#D4788A] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[#9A7480] font-['DM_Sans'] text-sm mt-3">Cargando videos...</p>
      </div>
    )
  }

  if (videos.length === 0) {
    return null
  }

  return (
    <div>
      {showTitle && (
        <div className="text-center mb-12">
          <div className="w-8 h-px bg-[#D4788A] mx-auto mb-4"></div>
          <h2 className="font-['Cormorant_Garamond'] text-2xl md:text-3xl font-light italic tracking-[-0.02em] text-[#1A1118]">
            Inspírate con nuestros videos
          </h2>
          <p className="text-sm text-[#9A7480] font-['DM_Sans'] font-light mt-3 max-w-md mx-auto">
            Mira como lucen nuestros productos en uso real
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {videosToShow.map((video, index) => (
          <div
            key={video.id}
            className="group bg-white rounded-sm overflow-hidden shadow-sm hover:shadow-md transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1"
            style={{ animationDelay: `${index * 80}ms`, animationFillMode: 'backwards' }}
          >
            {/* Contenedor del thumbnail/placeholder */}
            <div className="aspect-video bg-gradient-to-br from-[#FDF0F3] to-[#F2C4CE]/30 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#D4788A]/5 to-[#B85268]/5 group-hover:scale-105 transition-transform duration-700"></div>
              
              {/* Icono TikTok */}
              <div className="relative z-10">
                <div className="w-20 h-20 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-10 h-10 text-[#D4788A]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                  </svg>
                </div>
              </div>
            </div>
            
            {/* Contenido de la tarjeta */}
            <div className="p-5">
              <h3 className="font-['DM_Sans'] font-medium text-[#1A1118] text-base tracking-wide">
                {video.title}
              </h3>
              {video.description && (
                <p className="text-sm text-[#9A7480] font-['DM_Sans'] font-light mt-2 line-clamp-2">
                  {video.description}
                </p>
              )}
              
              {/* Botón Ver en TikTok */}
              <a
                href={video.tiktok_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-4 text-sm text-[#D4788A] hover:text-[#B85268] transition-colors duration-300 font-['DM_Sans'] group/link"
              >
                <span>Ver en TikTok</span>
                <svg className="w-4 h-4 transform group-hover/link:translate-x-0.5 transition-transform duration-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
              
              <p className="text-[0.65rem] text-[#9A7480]/60 font-['DM_Sans'] mt-3">
                Al hacer clic, verás el video en TikTok
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Botón Ver más */}
      {videos.length > (limit || VIDEOS_POR_PAGINA) && (
        <div className="text-center mt-10">
          <button
            onClick={() => setMostrarTodos(!mostrarTodos)}
            className="group relative px-8 py-3 border border-[rgba(212,120,138,0.4)] text-[#2D2030] rounded-sm text-sm font-['DM_Sans'] font-medium tracking-wide hover:border-[#D4788A] hover:text-[#D4788A] transition-all duration-300 overflow-hidden"
          >
            <span className="relative z-10">
              {mostrarTodos ? 'Ver menos' : `Ver todos los ${videos.length} videos`}
            </span>
          </button>
        </div>
      )}

      {/* Link al perfil de TikTok */}
      <div className="text-center mt-10 pt-6 border-t border-[rgba(212,120,138,0.1)]">
        <a
          href="https://www.tiktok.com/@kb.dresses.more"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-[#9A7480] hover:text-[#D4788A] transition-colors duration-300 font-['DM_Sans'] group"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
          </svg>
          <span>Síguenos en TikTok</span>
          <span className="font-medium text-[#1A1118] group-hover:text-[#D4788A] transition-colors">@kb.dresses.more</span>
        </a>
      </div>
    </div>
  )
}

export default VideoGallery