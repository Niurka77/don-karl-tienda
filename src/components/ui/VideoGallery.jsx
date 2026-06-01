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
    setCargando(true)
    const { data, error } = await supabase
      .from('social_videos')
      .select('*')
      .eq('active', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })
    
    if (!error && data) {
      // Eliminar duplicados por titulo en el frontend por si acaso
      const uniqueVideos = data.filter((video, index, self) => 
        index === self.findIndex(v => v.id === video.id)
      )
      setVideos(uniqueVideos)
    }
    setCargando(false)
  }

  const videosToShow = mostrarTodos ? videos : videos.slice(0, limit || VIDEOS_POR_PAGINA)

  if (cargando) {
    return (
      <div className="text-center py-16">
        <div className="inline-block w-8 h-8 border-2 border-[#D4788A] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[#9A7480] font-['DM_Sans'] text-sm mt-4">Cargando videos...</p>
      </div>
    )
  }

  if (videos.length === 0) {
    return null
  }

  return (
    <div className="relative">
      {/* Fondo decorativo sutil */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-[#D4788A]/5 blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-[#B85268]/5 blur-3xl"></div>
      </div>

      {showTitle && (
        <div className="text-center mb-16 relative">
          <div className="w-10 h-px bg-gradient-to-r from-transparent via-[#D4788A] to-transparent mx-auto mb-5"></div>
          <h2 className="font-['Cormorant_Garamond'] text-3xl md:text-4xl font-light italic tracking-[-0.02em] text-[#1A1118]">
            Inspírate con nuestros videos
          </h2>
          <div className="w-16 h-px bg-gradient-to-r from-transparent via-[#D4788A] to-transparent mx-auto mt-5"></div>
          <p className="text-sm text-[#9A7480] font-['DM_Sans'] font-light mt-5 max-w-md mx-auto tracking-wide">
            Descubre cómo lucen nuestros productos en la vida real
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {videosToShow.map((video, index) => (
          <div
            key={video.id}
            className="group relative bg-white rounded-sm overflow-hidden shadow-sm hover:shadow-lg transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-2"
            style={{ animationDelay: `${index * 80}ms`, animationFillMode: 'backwards' }}
          >
            {/* Badde decorativo */}
            <div className="absolute top-3 right-3 z-20">
              <div className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md">
                <svg className="w-4 h-4 text-[#D4788A]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
              </div>
            </div>

            {/* Contenedor del placeholder */}
            <div className="aspect-video bg-gradient-to-br from-[#FDF0F3] to-[#F2C4CE]/40 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#D4788A]/0 via-[#D4788A]/5 to-[#B85268]/0 group-hover:scale-110 transition-transform duration-700"></div>
              
              {/* Círculo decorativo */}
              <div className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full bg-[#D4788A]/10 group-hover:scale-150 transition-transform duration-700"></div>
              
              {/* Icono central */}
              <div className="relative z-10">
                <div className="w-24 h-24 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:shadow-2xl transition-all duration-300">
                  <svg className="w-12 h-12 text-[#D4788A] group-hover:text-[#B85268] transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                  </svg>
                </div>
              </div>
            </div>
            
            {/* Contenido */}
            <div className="p-6">
              <h3 className="font-['DM_Sans'] font-medium text-[#1A1118] text-lg tracking-wide">
                {video.title}
              </h3>
              {video.description && (
                <p className="text-sm text-[#9A7480] font-['DM_Sans'] font-light mt-2 leading-relaxed">
                  {video.description}
                </p>
              )}
              
              {/* Línea decorativa */}
              <div className="w-12 h-px bg-[#D4788A]/30 my-4"></div>
              
              {/* Botón */}
              <a
                href={video.tiktok_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-[#D4788A] hover:text-[#B85268] transition-all duration-300 font-['DM_Sans'] group/link"
              >
                <span className="border-b border-[#D4788A]/30 group-hover/link:border-[#B85268] pb-0.5">Ver en TikTok</span>
                <svg className="w-4 h-4 transform group-hover/link:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Botón Ver más / Ver menos */}
      {videos.length > (limit || VIDEOS_POR_PAGINA) && (
        <div className="text-center mt-14">
          <button
            onClick={() => setMostrarTodos(!mostrarTodos)}
            className="group relative px-8 py-3 border border-[rgba(212,120,138,0.4)] text-[#2D2030] rounded-sm text-sm font-['DM_Sans'] font-medium tracking-wider hover:border-[#D4788A] hover:text-[#D4788A] transition-all duration-300 overflow-hidden bg-white/50 backdrop-blur-sm"
          >
            <span className="relative z-10">
              {mostrarTodos ? '— Ver menos —' : `+ Ver todos los ${videos.length} videos`}
            </span>
          </button>
        </div>
      )}

      {/* Footer TikTok */}
      <div className="text-center mt-14 pt-8 border-t border-[rgba(212,120,138,0.12)]">
        <a
          href="https://www.tiktok.com/@kb.dresses.more"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 text-sm text-[#9A7480] hover:text-[#D4788A] transition-colors duration-300 font-['DM_Sans'] group"
        >
          <div className="w-8 h-8 rounded-full bg-[#1A1118] flex items-center justify-center group-hover:bg-gradient-to-r group-hover:from-[#D4788A] group-hover:to-[#B85268] transition-all duration-300">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
            </svg>
          </div>
          <span>Síguenos en TikTok</span>
          <span className="font-medium text-[#1A1118] group-hover:text-[#D4788A] transition-colors border-b border-transparent group-hover:border-[#D4788A] pb-0.5">
            @kb.dresses.more
          </span>
        </a>
      </div>
    </div>
  )
}

export default VideoGallery