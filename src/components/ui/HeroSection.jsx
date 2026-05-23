import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const slides = [
  {
    id: 1,
    title: "Carteras Importadas",
    subtitle: "Guess • Tommy • Calvin Klein",
    description: "Diseños exclusivos desde EE.UU. Calidad y estilo en cada pieza.",
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=1200&h=800&fit=crop",
    link: "/?categoria=carteras",
    category: "carteras"
  },
  {
    id: 2,
    title: "Vestidos de Fiesta",
    subtitle: "Elegancia atemporal",
    description: "Para ocasiones especiales. Tallas S al XXL. Colección 2024.",
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=1200&h=800&fit=crop",
    link: "/?categoria=vestidos",
    category: "vestidos"
  },
  {
    id: 3,
    title: "Billeteras Premium",
    subtitle: "Michael Kors • Tommy • CK",
    description: "Piel de alta calidad. El accesorio perfecto para el día a día.",
    image: "https://images.unsplash.com/photo-1627123428493-eb5ae6dc65a3?w=1200&h=800&fit=crop",
    link: "/?categoria=billeteras",
    category: "billeteras"
  }
]

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 6000)
    
    // ✅ Cleanup explícito del intervalo
    return () => {
      clearInterval(timer)
    }
  }, [])

  // ✅ Función para navegación con teclado
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') {
      setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
    } else if (e.key === 'ArrowRight') {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }
  }

  return (
    <div 
      className="relative bg-background overflow-hidden"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-label="Carrusel de productos destacados"
    >
      {/* Slider */}
      <div className="relative h-[80vh] min-h-[500px] md:h-[90vh] md:min-h-[600px]">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-all duration-1000 ease-out ${
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
            aria-hidden={index !== currentSlide}
          >
            <div className="container mx-auto px-6 lg:px-8 h-full">
              <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center h-full">
                
                {/* Texto */}
                <div className="text-foreground space-y-4 md:space-y-6 animate-fade-in-up">
                  <span className="inline-block text-[10px] font-mono tracking-[0.2em] text-muted-foreground uppercase bg-muted/50 px-3 py-1 rounded-full">
                    {slide.category}
                  </span>
                  <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold leading-tight tracking-tight">
                    {slide.title}
                  </h1>
                  <p className="text-xs md:text-sm tracking-wider text-muted-foreground uppercase">
                    {slide.subtitle}
                  </p>
                  <p className="text-sm md:text-base text-muted-foreground max-w-md leading-relaxed">
                    {slide.description}
                  </p>
                  <div className="flex flex-wrap gap-3 md:gap-4 pt-2 md:pt-4">
                    <Link
                      to={slide.link}
                      className="bg-foreground text-background px-6 md:px-8 py-2.5 md:py-3 rounded-full text-xs md:text-sm font-medium tracking-wide hover:bg-foreground/90 transition-all transform hover:-translate-y-0.5 shadow-lg"
                    >
                      Comprar ahora →
                    </Link>
                    <Link
                      to="/?genero=mujer"
                      className="border border-foreground/20 text-foreground px-6 md:px-8 py-2.5 md:py-3 rounded-full text-xs md:text-sm font-medium tracking-wide hover:bg-foreground hover:text-background transition-all"
                    >
                      Ver catálogo
                    </Link>
                  </div>
                </div>

                {/* Imagen */}
                <div className="relative animate-scale-in">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-2xl shadow-xl">
                    <img
                      src={slide.image}
                      alt={slide.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 ease-out hover:scale-105"
                      loading="eager"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Indicadores */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 flex gap-2" role="tablist" aria-label="Navegación de slides">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              onClick={() => setCurrentSlide(index)}
              className={`transition-all duration-500 rounded-full ${
                index === currentSlide
                  ? 'bg-foreground w-10 md:w-12 h-1'
                  : 'bg-foreground/30 w-5 md:w-6 h-1 hover:bg-foreground/50'
              }`}
              role="tab"
              aria-selected={index === currentSlide}
              aria-label={`Ir a slide ${index + 1}: ${slide.title}`}
              aria-controls={`slide-${slide.id}`}
            />
          ))}
        </div>
      </div>

      {/* Banda de confianza */}
      <div className="border-t border-border bg-background">
        <div className="container mx-auto px-6 lg:px-8 py-3 md:py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 text-center">
            <div className="text-[10px] md:text-xs font-medium text-muted-foreground tracking-wide">100% ORIGINAL</div>
            <div className="text-[10px] md:text-xs font-medium text-muted-foreground tracking-wide">ENVÍO RÁPIDO</div>
            <div className="text-[10px] md:text-xs font-medium text-muted-foreground tracking-wide">PAGO SEGURO</div>
            <div className="text-[10px] md:text-xs font-medium text-muted-foreground tracking-wide">ATENCIÓN 24/7</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HeroSection