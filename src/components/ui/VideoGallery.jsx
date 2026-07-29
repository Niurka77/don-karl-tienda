import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { p } from '../../lib/theme'
import { useScrollReveal } from '../../hooks/useScrollReveal'

const VideoGallery = ({ limit = 6, showTitle = true }) => {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const { ref, isVisible } = useScrollReveal({ threshold: 0.1 })

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const { data, error } = await supabase
          .from('social_videos')
          .select('*')
          .eq('active', true)
          .order('sort_order')
          .order('created_at', { ascending: false })

        if (error) throw error
        const unique = data ? data.filter((v, i, arr) => arr.findIndex(a => a.id === v.id) === i) : []
        setVideos(unique.slice(0, limit))
      } catch (err) {
        console.error('Error al cargar videos:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchVideos()
  }, [limit])

  if (loading) {
    return (
      <section style={{ padding: 'clamp(4rem, 8vw, 7rem) 0', textAlign: 'center' }}>
        <div style={{ width: '32px', height: '32px', border: `3px solid ${p.roseBlush}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
      </section>
    )
  }

  if (videos.length === 0) return null

  return (
    <section
      ref={ref}
      style={{
        maxWidth: '1280px', margin: '0 auto',
        padding: 'clamp(4rem, 8vw, 7rem) 1.5rem',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(28px)',
        transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {showTitle && (
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ width: '40px', height: '1px', background: p.rose, margin: '0 auto 1.2rem' }} />
          <p style={{
            fontFamily: 'var(--font-sans)', fontSize: '0.6rem', fontWeight: 500,
            letterSpacing: '0.22em', textTransform: 'uppercase', color: p.rose, marginBottom: '0.6rem',
          }}>
            Lifestyle
          </p>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)',
            fontWeight: 300, fontStyle: 'italic', color: p.obsidian,
            letterSpacing: '-0.02em', lineHeight: 1.05, margin: '0 0 0.5rem',
          }}>
            Inspírate con{' '}
            <span style={{ color: p.rose }}>nuestros videos</span>
          </h2>
          <p style={{
            fontFamily: 'var(--font-sans)', fontSize: '0.85rem', fontWeight: 300,
            color: '#9A7480', maxWidth: '340px', margin: '0 auto', lineHeight: 1.65,
          }}>
            Descubre cómo lucen nuestros productos en la vida real
          </p>
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))',
        gap: '1.5rem',
      }}>
        {videos.map((video) => (
          <div
            key={video.id}
            style={{
              background: '#FFFFFF', overflow: 'hidden',
              transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)' }}
          >
            {video.url ? (
              <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}>
                <iframe
                  src={video.url.replace('watch?v=', 'embed/')}
                  title={video.title}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
            ) : (
              <div style={{
                aspectRatio: '16/9', background: `linear-gradient(135deg, ${p.roseMist}, ${p.roseBlush}40)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.75rem', color: p.mauveLight }}>
                  Video no disponible
                </span>
              </div>
            )}
            {video.title && (
              <div style={{ padding: '1rem 0.5rem 0.5rem' }}>
                <p style={{
                  fontFamily: 'var(--font-sans)', fontSize: '0.8rem', fontWeight: 400,
                  color: p.obsidian, lineHeight: 1.4,
                }}>
                  {video.title}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </section>
  )
}

export default VideoGallery
