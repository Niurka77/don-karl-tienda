import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

const Stars = ({ rating, onRate, interactive = false }) => (
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
          className={`w-5 h-5 ${star <= rating ? 'text-kb-gold fill-kb-gold' : 'text-gray-300'}`}
          viewBox="0 0 24 24"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      </button>
    ))}
  </div>
)

const ReviewsSection = ({ productId }) => {
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
      verified_purchase: false // Se puede actualizar luego con lógica de orders
    }])
    
    if (!error) {
      setNewReview({ name: '', rating: 5, comment: '' })
      setShowForm(false)
      loadReviews()
    }
    setSubmitting(false)
  }

  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) 
    : null

  return (
    <section className="mt-12 pt-8 border-t border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-kb-black">Reseñas de clientas</h3>
        {avgRating && (
          <div className="flex items-center gap-2">
            <Stars rating={Math.round(avgRating)} />
            <span className="text-sm text-gray-600">({avgRating}/5 • {reviews.length})</span>
          </div>
        )}
      </div>

      {/* Lista de reseñas */}
      <div className="space-y-4 mb-6">
        {reviews.length === 0 ? (
          <p className="text-gray-500 text-sm">Sé la primera en dejar una reseña ✨</p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="bg-kb-gray rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-sm">{review.customer_name}</span>
                <Stars rating={review.rating} />
              </div>
              <p className="text-gray-700 text-sm">{review.comment}</p>
              <span className="text-xs text-gray-400 mt-2 block">
                {new Date(review.created_at).toLocaleDateString('es-PE')}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Botón/Formulario */}
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="btn-kb-accent text-sm"
        >
          ✍️ Dejar mi reseña
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg p-4 shadow-sm space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tu nombre</label>
            <input
              type="text"
              value={newReview.name}
              onChange={(e) => setNewReview({...newReview, name: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              placeholder="María G."
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Calificación</label>
            <Stars rating={newReview.rating} onRate={(r) => setNewReview({...newReview, rating: r})} interactive />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Tu opinión</label>
            <textarea
              value={newReview.comment}
              onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              rows="3"
              placeholder="¿Qué te pareció el producto?"
              required
            />
          </div>
          
          <div className="flex gap-2">
            <button type="submit" disabled={submitting} className="btn-kb-primary text-sm">
              {submitting ? 'Enviando...' : 'Publicar reseña'}
            </button>
            <button 
              type="button" 
              onClick={() => setShowForm(false)}
              className="text-sm text-gray-500 hover:text-gray-800"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </section>
  )
}

export default ReviewsSection