import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const slides = [
  {
    id: 1,
    title: "Carteras Importadas",
    subtitle: "Guess, Tommy, Calvin Klein",
    description: "Diseños exclusivos desde Estados Unidos. Calidad y estilo en cada pieza.",
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=1200&h=800&fit=crop",
    category: "carteras"
  },
  {
    id: 2,
    title: "Vestidos de Fiesta",
    subtitle: "Elegancia atemporal",
    description: "Para ocasiones especiales. Tallas S al XXL. Colección 2024.",
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=1200&h=800&fit=crop",
    category: "vestidos"
  },
  {
    id: 3,
    title: "Billeteras Premium",
    subtitle: "Michael Kors, Tommy, CK",
    description: "Piel de alta calidad. El accesorio perfecto para el día a día.",
    image: "https://images.unsplash.com/photo-1627123428493-eb5ae6dc65a3?w=1200&h=800&fit=crop",
    category: "billeteras"
  }
]

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 6000)
    
    return () => clearInterval(timer)
  }, [])

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') {
      setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
    } else if (e.key === 'ArrowRight') {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }
  }

  // ✅ Función para navegar con filtro de categoría
  const handleComprarAhora = (categoria) => {
    navigate(`/?categoria=${categoria}`)
  }

  return (
    <div 
      className="relative bg-gradient-to-br from-kb-blush via-white to-kb-soft-pink/30 overflow-hidden"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-label="Carrusel de productos destacados"
    >
      {/* Elementos decorativos flotantes */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-kb-rose/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-kb-mauve/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

      {/* Slider */}
      <div className="relative min-h-[600px] md:min-h-[700px] flex items-center">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-all duration-1000 ease-out ${
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
            aria-hidden={index !== currentSlide}
          >
            <div className="max-w-7xl mx-auto px-4 py-12 grid md:grid-cols-2 gap-12 items-center">
              
              {/* Izquierda: Imagen Circular */}
              <div className="relative flex justify-center order-2 md:order-1">
                <div className="relative w-72 h-72 md:w-96 md:h-96 rounded-full overflow-hidden border-8 border-white shadow-2xl animate-scale-in">
                  <img 
                    src={slide.image}
                    alt={slide.title}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                    loading="eager"
                  />
                </div>
                
                {/* Badge flotante de precio */}
                <div className="absolute -bottom-4 -right-4 bg-kb-rose text-white rounded-2xl p-4 shadow-xl animate-fade-in-up">
                  <p className="text-xs font-bold uppercase tracking-wider mb-1">Desde</p>
                  <p className="text-2xl font-bold">S/ 45.00</p>
                </div>
              </div>

              {/* Derecha: Contenido */}
              <div className="text-center md:text-left order-1 md:order-2 animate-fade-in-up">
                
                {/* Badge categoría */}
                <span className="inline-block bg-kb-rose text-white rounded-full px-4 py-1.5 text-xs font-bold tracking-wider uppercase mb-4">
                  Nueva Colección 2024
                </span>
                
                {/* Título */}
                <h1 className="font-serif text-4xl md:text-6xl font-bold text-kb-charcoal mb-4 leading-tight">
                  {slide.title.split(' ')[0]} <span className="text-kb-rose italic">{slide.title.split(' ').slice(1).join(' ')}</span>
                </h1>
                
                {/* Subtítulo */}
                <p className="text-lg text-kb-mauve mb-3 font-medium">
                  {slide.subtitle}
                </p>
                
                {/* Descripción */}
                <p className="text-kb-charcoal/80 mb-6 leading-relaxed max-w-lg mx-auto md:mx-0">
                  {slide.description}
                </p>
                
                {/* Tags */}
                <div className="flex flex-wrap gap-3 justify-center md:justify-start mb-8">
                  {['Elegancia', 'Calidad', 'Envíos Nacionales'].map((tag) => (
                    <span key={tag} className="text-sm font-semibold text-kb-rose bg-kb-blush px-4 py-1.5 rounded-full">
                      #{tag}
                    </span>
                  ))}
                </div>
                
                {/* ✅ Botones con navegación funcional */}
                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                  <button
                    onClick={() => handleComprarAhora(slide.category)}
                    className="bg-kb-charcoal hover:bg-kb-rose text-white font-bold py-4 px-10 rounded-full transition-all hover:shadow-xl hover:-translate-y-1 tracking-wide"
                  >
                    COMPRAR AHORA
                  </button>
                  <button
                    onClick={() => navigate('/?genero=mujer')}
                    className="border-2 border-kb-charcoal text-kb-charcoal hover:bg-kb-charcoal hover:text-white font-bold py-4 px-10 rounded-full transition-all tracking-wide"
                  >
                    VER CATÁLOGO
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Indicadores */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 flex gap-3" role="tablist" aria-label="Navegación de slides">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              onClick={() => setCurrentSlide(index)}
              className={`transition-all duration-500 rounded-full ${
                index === currentSlide
                  ? 'bg-kb-rose w-12 h-1.5'
                  : 'bg-kb-rose/30 w-6 h-1.5 hover:bg-kb-rose/50'
              }`}
              role="tab"
              aria-selected={index === currentSlide}
              aria-label={`Ir a slide ${index + 1}: ${slide.title}`}
            />
          ))}
        </div>
      </div>

      {/* Banda de confianza */}
      <div className="bg-white border-t border-border">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col items-center gap-2">
              <svg className="w-6 h-6 text-kb-rose" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              <span className="text-xs font-semibold text-kb-charcoal">100% ORIGINAL</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <svg className="w-6 h-6 text-kb-rose" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1v-5h2v5a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H17a1 1 0 001-1V5a1 1 0 00-1-1H3z"/>
              </svg>
              <span className="text-xs font-semibold text-kb-charcoal">ENVÍO RÁPIDO</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <svg className="w-6 h-6 text-kb-rose" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
              </svg>
              <span className="text-xs font-semibold text-kb-charcoal">PAGO SEGURO</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <svg className="w-6 h-6 text-kb-rose" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
              </svg>
              <span className="text-xs font-semibold text-kb-charcoal">ATENCIÓN 24/7</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HeroSection