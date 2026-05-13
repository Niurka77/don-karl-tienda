import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

// Si no tienes las imágenes aún, usa placeholders
const slides = [
  {
    id: 1,
    code: "COD 61",
    title: "Cartera Guess Original",
    subtitle: "Marca Guess",
    description: "Cartera importada de EE.UU. Disponible en múltiples colores. ¡La más vendida!",
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop",
    link: "/?categoria=carteras&marca=guess"
  },
  {
    id: 2,
    code: "COD 55",
    title: "Vestido de Fiesta Elegante",
    subtitle: "Colección 2024",
    description: "Vestidos largos para ocasiones especiales. Tallas S, M, L, XL. Colores disponibles.",
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=600&fit=crop",
    link: "/?categoria=vestidos"
  },
  {
    id: 3,
    code: "COD 58",
    title: "Cartera Tommy Hilfiger",
    subtitle: "Marca Tommy Hilfiger",
    description: "Diseño exclusivo y calidad garantizada. Perfecta para el día a día.",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop",
    link: "/?categoria=carteras&marca=tommy"
  }
]

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="relative bg-gradient-to-br from-kb-pink-dark via-kb-pink to-kb-gold-light">
    

      {/* Slider Principal */}
      <div className="relative h-[500px] md:h-[600px] overflow-hidden">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-all duration-1000 ${
              index === currentSlide ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
            }`}
          >
            <div className="max-w-7xl mx-auto px-4 h-full flex items-center">
              <div className="flex-1 text-white py-12">
                <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-4">
                  {slide.code} • {slide.subtitle}
                </div>
                <h1 className="text-4xl md:text-6xl font-black mb-4 leading-tight">
                  {slide.title}
                </h1>
                <p className="text-white/95 text-lg mb-8 max-w-xl leading-relaxed">
                  {slide.description}
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link
                    to={slide.link}
                    className="inline-block bg-white text-kb-pink-dark font-bold px-8 py-4 rounded-full hover:bg-kb-gold-light hover:scale-105 transition-all shadow-2xl"
                  >
                    Ver Producto →
                  </Link>
                  <Link
                    to="/?genero=mujer"
                    className="inline-block bg-transparent border-2 border-white text-white font-bold px-8 py-4 rounded-full hover:bg-white hover:text-kb-pink-dark transition-all"
                  >
                    Ver Catálogo
                  </Link>
                </div>
              </div>

              <div className="hidden lg:block flex-1">
                <div className="relative">
                  <div className="absolute inset-0 bg-white/20 rounded-3xl transform rotate-3" />
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="relative rounded-3xl shadow-2xl w-full max-w-lg mx-auto object-cover aspect-square transform hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}

        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-3 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? 'bg-white w-12'
                  : 'bg-white/50 w-3 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Badges de confianza */}
      <div className="bg-white/95 backdrop-blur border-t border-kb-pink/20">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-kb-pink/10 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-kb-pink-dark" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
              </div>
              <div>
                <p className="font-bold text-gray-800 text-sm">100% Original</p>
                <p className="text-xs text-gray-500">Marcas garantizadas</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-kb-gold/20 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-kb-gold" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                  <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7h-3a1 1 0 00-1 1v6.05A2.5 2.5 0 0112.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/>
                </svg>
              </div>
              <div>
                <p className="font-bold text-gray-800 text-sm">Envío Rápido</p>
                <p className="text-xs text-gray-500">A todo el Perú</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-kb-pink/10 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-kb-pink-dark" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"/>
                  <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd"/>
                </svg>
              </div>
              <div>
                <p className="font-bold text-gray-800 text-sm">Pago Seguro</p>
                <p className="text-xs text-gray-500">Yape, Plin, Tarjetas</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-kb-gold/20 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-kb-gold" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                </svg>
              </div>
              <div>
                <p className="font-bold text-gray-800 text-sm">Soporte 24/7</p>
                <p className="text-xs text-gray-500">Atención personalizada</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HeroSection