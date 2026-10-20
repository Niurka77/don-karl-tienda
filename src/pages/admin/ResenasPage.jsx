import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import useSiteConfig from '../../hooks/useSiteConfig'
import { supabase } from '../../lib/supabase'
import { generateRemoveMutation } from '../../hooks/useRealtimeReload'

const ResenasPage = () => {
  const { siteConfig } = useSiteConfig()
  const { user } = useAuthStore()

  const [reviews, setReviews] = useState([])
  const [pendingReviews, setPendingReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending') // 'pending' o 'published'

  useEffect(() => {
    if (!user || user.app_metadata?.role !== 'admin') return

    const cargarResenas = async () => {
      try {
        // Cargar reseñas pendientes (approved = false o nulo)
        const { data: pending, error: pendingError } = await supabase
          .from('reviews')
          .select('*')
          .eq('approved', false)

        if (pendingError) throw pendingError
        setPendingReviews(pending || [])

        // Cargar reseñas publicadas (approved = true)
        const { data: published, error: publishedError } = await supabase
          .from('reviews')
          .select('*')
          .eq('approved', true)

        if (publishedError) throw publishedError
        setReviews(published || [])
      } catch (err) {
        console.error('Error cargando reseñas:', err)
      } finally {
        setLoading(false)
      }
    }

    cargarResenas()
  }, [user])

  const aprobarResena = async (reviewId) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ approved: true })
        .eq('id', reviewId)

      if (error) throw error
      // Recargar después de aprobar
      const { data: user } = useAuthStore()
      if (user.app_metadata?.role === 'admin') {
        useEffect(() => {}, []) // trigger reload
      }
      setPendingReviews(prev => prev.filter(r => r.id !== reviewId))
      setReviews(prev => [...prev, { id: reviewId, ...(prev.find(r) => r.id === reviewId)?.approved ? {} : {} }])
    } catch (err) {
      console.error('Error aprobando reseña:', err)
    }
  }

  const eliminarResena = async (reviewId) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId)

      if (error) throw error
      setPendingReviews(prev => prev.filter(r => r.id !== reviewId))
      setReviews(prev => prev.filter(r => r.id !== reviewId))
    } catch (err) {
      console.error('Error eliminando reseña:', err)
    }
  }

  return (
    <div style={{ background: 'var(--color-kb-ivory)', minHeight: '100vh' }}>
      <div className="max-w-screen-xl mx-auto px-6 lg:px-10 py-14 md:py-20">

        <div className="flex items-center gap-4 mb-14">
          <span style={{ width: '24px', height: '1px', background: 'var(--color-kb-rose)', display: 'inline-block' }} />
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', fontWeight: 300, fontStyle: 'italic', letterSpacing: '-0.02em', color: 'var(--color-kb-charcoal)' }}>
            Moderación de Reseñas
          </h1>
        </div>

        {loading ? (
          <div className="min-h-screen flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-6">

            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setFilter('pending')}
                className={filter === 'pending' ? 'px-4 py-2 rounded-sm text-sm font-semibold underline' : 'px-4 py-2 rounded-sm text-sm font-light transition-colors'}
              >
                Pendientes ({pendingReviews.length})
              </button>
              <button
                onClick={() => setFilter('published')}
                className={filter === 'published' ? 'px-4 py-2 rounded-sm text-sm font-semibold underline' : 'px-4 py-2 rounded-sm text-sm font-light transition-colors'}
              >
                Publicadas ({reviews.length})
              </button>
            </div>

            {filter === 'pending' && (
              <div className="space-y-4">
                {pendingReviews.length === 0 ? (
                  <div className="text-center py-8">
                    <div style={{ width: '40px', height: '1px', background: 'rgba(212,120,138,0.25)', margin: '0 auto 1.5rem' }} />
                    <p style={{ fontSize: '0.9rem', color: 'var(--color-kb-mauve)' }}>No hay reseñas pendientes</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {pendingReviews.map((review) => (
                      <div key={review.id} style={{
                        background: 'white',
                        padding: '1.4rem 1.6rem',
                        borderLeft: '2px solid var(--color-kb-rose)',
                        borderRadius: '2px',
                        animation: 'fadeInUp 0.3s ease'
                      }}>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div style={{
                              width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                              background: 'linear-gradient(135deg, var(--color-kb-rose), var(--color-kb-rose-deep))',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: 'white', fontSize: '0.85rem', fontFamily: 'var(--font-display)',
                            }}>
                              {review.customer_name?.charAt(0).toUpperCase() || 'C'}
                            </div>
                            <div>
                              <p style={{ fontSize: '0.82rem', fontWeight: 400, color: 'var(--color-kb-charcoal)' }}>
                                {review.customer_name || 'Cliente'}
                              </p>
                              {review.product_name && (
                                <span style={{ fontSize: '0.65rem', color: 'var(--color-kb-mauve)', letterSpacing: '0.04em' }}>Producto: {review.product_name}</span>
                              )}
                            </div>
                          </div>
                          <Stars rating={review.rating} size={12} />
                        </div>
                        <p style={{ fontSize: '0.82rem', color: 'var(--color-kb-mauve)', lineHeight: 1.4, marginBottom: '0.75rem' }}>
                          {review.comment}
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => aprobarResena(review.id)}
                            className="px-3 py-1 rounded-sm text-xs font-medium bg-[#1A1118] text-white hover:bg-gradient-to-r hover:from-[#D4788A] hover:to-[#B85268] transition-all duration-300"
                            style={{ fontSize: '0.62rem' }}
                          >
                            Aprobar
                          </button>
                          <button
                            onClick={() => eliminarResena(review.id)}
                            className="px-3 py-1 rounded-sm text-xs font-medium bg-[#C85A4D] text-white hover:bg-[#B85268] transition-all duration-300"
                            style={{ fontSize: '0.62rem' }}
                          >
                            Eliminar
                          </button>
                        </div>
                        <span style={{ fontSize: '0.65rem', color: 'rgba(154,116,128,0.5)', letterSpacing: '0.04em' }}>
                          {new Date(review.created_at).toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {filter === 'published' && (
              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <div className="text-center py-8">
                    <div style={{ width: '40px', height: '1px', background: 'rgba(212,120,138,0.25)', margin: '0 auto 1.5rem' }} />
                    <p style={{ fontSize: '0.9rem', color: 'var(--color-kb-mauve)' }}>No hay reseñas publicadas</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-3 gap-4">
                    {reviews.map((review) => (
                      <div key={review.id} style={{
                        background: 'white',
                        padding: '1.4rem 1.6rem',
                        borderLeft: '2px solid var(--color-kb-rose)',
                        borderRadius: '2px',
                        animation: 'fadeInUp 0.3s ease'
                      }}>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div style={{
                              width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                              background: 'linear-gradient(135deg, var(--color-kb-rose), var(--color-kb-rose-deep))',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: 'white', fontSize: '0.85rem', fontFamily: 'var(--font-display)',
                            }}>
                              {review.customer_name?.charAt(0).toUpperCase() || 'C'}
                            </div>
                            <div>
                              <p style={{ fontSize: '0.82rem', fontWeight: 400, color: 'var(--color-kb-charcoal)' }}>
                                {review.customer_name || 'Cliente'}
                              </p>
                              {review.product_name && (
                                <span style={{ fontSize: '0.65rem', color: 'var(--color-kb-mauve)', letterSpacing: '0.04em' }}>Producto: {review.product_name}</span>
                              )}
                            </div>
                          </div>
                          <Stars rating={review.rating} size={12} />
                        </div>
                        <p style={{ fontSize: '0.82rem', color: 'var(--color-kb-mauve)', lineHeight: 1.4, marginBottom: '0.75rem' }}>
                          {review.comment}
                        </p>
                        <span style={{ fontSize: '0.65rem', color: 'rgba(154,116,128,0.5)', letterSpacing: '0.04em' }}>
                          {new Date(review.created_at).toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ResenasPage