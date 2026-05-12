import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

const Stars = ({ rating, onRate, interactive = false, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onRate?.(star)}
          className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
        >
          <svg
            className={`${sizeClasses[size]} ${star <= rating ? 'text-kb-gold fill-kb-gold' : 'text-gray-300'}`}
            viewBox="0 0 24 24"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </button>
      ))}
    </div>
  )
}

const ReviewsSection = ({ productId, onReviewAdded }) => {
  const [reviews, setReviews] = useState([])
  const [newReview, setNewReview] = useState({ name: '', rating: 5, comment: '' })
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    loadReviews()
  }, [productId])

  const loadReviews = async () => {
    const { data } = await supabase
      .from('reviews')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false })
    if (data) setReviews(data)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!newReview.name.trim() || !newReview.comment.trim()) return
    
    setSubmitting(true)
    const { error } = await supabase.from('reviews').insert([{
      product_id: productId,
      customer_name: newReview.name.trim(),
      rating: newReview.rating,
      comment: newReview.comment.trim(),
      verified_purchase: false
    }])
    
    if (!error) {
      setNewReview({ name: '', rating: 5, comment: '' })
      setShowForm(false)
      await loadReviews()
      // Notificar al padre para actualizar rating
      if (onReviewAdded) {
        onReviewAdded()
      }
    }
    setSubmitting(false)
  }

  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) 
    : null

  return (
    <section className="mt-16 pt-10 border-t border-gray-200">
      {/* Header responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">Reseñas de clientas</h3>
          {avgRating && reviews.length > 0 && (
            <p className="text-sm text-gray-600">
              <span className="font-semibold text-gray-900">{avgRating}</span> de 5 • {reviews.length} reseña{reviews.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        {!showForm && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="bg-black text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-gray-800 transition-colors self-start sm:self-auto"
          >
            ✍️ Dejar mi reseña
          </button>
        )}
      </div>

      {/* Lista de reseñas */}
      <div className="space-y-4 mb-10">
        {reviews.length === 0 ? (
          <div className="bg-gray-50 rounded-xl p-8 text-center border border-gray-200">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-gray-700 font-medium mb-1">Sé la primera en dejar una reseña ✨</p>
            <p className="text-gray-500 text-sm">Tu opinión ayuda a otras clientas a decidir</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className="w-11 h-11 bg-gradient-to-br from-kb-gold to-orange-400 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm">
                    {review.customer_name.charAt(0).toUpperCase()}
                  </div>
                </div>
                
                {/* Contenido */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-gray-900">{review.customer_name}</span>
                      {review.verified_purchase && (
                        <span className="flex items-center gap-1 text-[11px] text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Compra verificada
                        </span>
                      )}
                    </div>
                    <Stars rating={review.rating} size="sm" />
                  </div>
                  
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {review.comment}
                  </p>
                  
                  <span className="text-xs text-gray-400 mt-3 block">
                    {new Date(review.created_at).toLocaleDateString('es-PE', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Formulario */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-900">Escribe tu reseña</h4>
            <button 
              type="button" 
              onClick={() => setShowForm(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              aria-label="Cerrar formulario"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tu nombre</label>
            <input
              type="text"
              value={newReview.name}
              onChange={(e) => setNewReview({...newReview, name: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
              placeholder="María G."
              required
              maxLength={50}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Calificación</label>
            <Stars rating={newReview.rating} onRate={(r) => setNewReview({...newReview, rating: r})} interactive size="lg" />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tu opinión</label>
            <textarea
              value={newReview.comment}
              onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all resize-none"
              rows="4"
              placeholder="¿Qué te pareció el producto? Cuéntanos sobre la calidad, el ajuste, la tela..."
              required
              maxLength={500}
            />
            <p className="text-xs text-gray-400 mt-1 text-right">
              {newReview.comment.length}/500
            </p>
          </div>
          
          <div className="flex gap-3 pt-2">
            <button 
              type="submit" 
              disabled={submitting} 
              className="flex-1 bg-black text-white px-6 py-3 rounded-lg font-semibold text-sm hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {submitting ? 'Publicando...' : 'Publicar reseña'}
            </button>
          </div>
        </form>
      )}
    </section>
  )
}

export default ReviewsSection