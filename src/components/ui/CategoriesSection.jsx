import { Link } from 'react-router-dom'

// NOTA: Estas imágenes son estáticas (placeholder). 
// En producción, deberían venir de tu bucket de Supabase.
// Las mantengo como ejemplo visual de la estética "editorial".
const categories = [
  {
    title: "Carteras",
    subtitle: "Guess • Tommy • Calvin Klein",
    description: "Importadas desde EE.UU.",
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&h=1000&fit=crop",
    link: "/?categoria=carteras",
  },
  {
    title: "Vestidos",
    subtitle: "Elegancia atemporal",
    description: "Para ocasiones especiales",
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&h=1000&fit=crop",
    link: "/?categoria=vestidos",
  },
  {
    title: "Billeteras",
    subtitle: "Michael Kors • Tommy • CK",
    description: "Diseño y funcionalidad",
    image: "https://images.unsplash.com/photo-1627123428493-eb5ae6dc65a3?w=800&h=1000&fit=crop",
    link: "/?categoria=billeteras",
  }
]

const CategoriesSection = () => {
  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Encabezado editorial */}
        <div className="text-center mb-16">
          <span className="text-[10px] font-mono tracking-[0.2em] text-muted-foreground uppercase">
            Colecciones
          </span>
          <h2 className="text-3xl md:text-4xl font-serif font-semibold text-foreground mt-3 mb-4">
            Explora por categoría
          </h2>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Piezas seleccionadas para ti, importadas desde Estados Unidos.
          </p>
        </div>

        {/* Grid de categorías */}
        <div className="grid md:grid-cols-3 gap-8">
          {categories.map((cat, idx) => (
            <Link
              key={idx}
              to={cat.link}
              className="group relative overflow-hidden rounded-2xl aspect-[4/5] shadow-elegant transition-all duration-700 hover:shadow-elegant-hover"
            >
              {/* Imagen con zoom elegante */}
              <img
                src={cat.image}
                alt={cat.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                loading="lazy"
              />
              
              {/* Overlay negro sutil (reemplaza gradientes coloridos) */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-90 group-hover:opacity-95 transition-opacity duration-500" />
              
              {/* Texto superpuesto */}
              <div className="absolute inset-0 p-8 flex flex-col justify-end text-white">
                <p className="text-[11px] font-mono tracking-wider uppercase mb-2 opacity-80 group-hover:opacity-100 transition">
                  {cat.subtitle}
                </p>
                <h3 className="text-2xl font-serif font-semibold mb-2 group-hover:translate-y-0 transition-transform duration-300">
                  {cat.title}
                </h3>
                <p className="text-sm text-white/80 mb-4">
                  {cat.description}
                </p>
                <div className="inline-flex items-center text-sm font-medium group-hover:gap-3 gap-2 transition-all duration-300">
                  Ver colección 
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export default CategoriesSection