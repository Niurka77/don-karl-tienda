import { Link } from 'react-router-dom'

const categories = [
  {
    title: "Carteras de Marca",
    subtitle: "Guess • Tommy • Calvin Klein",
    description: "Las mejores carteras importadas de EE.UU.",
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=400&fit=crop",
    link: "/?categoria=carteras",
    color: "from-kb-pink-dark to-kb-pink"
  },
  {
    title: "Vestidos de Fiesta",
    subtitle: "Elegancia y estilo",
    description: "Para esa ocasión especial. Tallas S al XXL",
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=400&fit=crop",
    link: "/?categoria=vestidos",
    color: "from-kb-gold to-yellow-600"
  },
  {
    title: "Billeteras Hombre",
    subtitle: "Michael Kors • Tommy • CK",
    description: "Diseños exclusivos y calidad garantizada",
    image: "https://images.unsplash.com/photo-1627123428493-eb5ae6dc65a3?w=600&h=400&fit=crop",
    link: "/?categoria=billeteras",
    color: "from-gray-700 to-gray-900"
  }
]

const CategoriesSection = () => {
  return (
    <div className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <span className="inline-block bg-kb-pink/10 text-kb-pink-dark px-4 py-2 rounded-full text-sm font-semibold mb-4">
            CATEGORÍAS
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-gray-800 mb-3">
            Explora Nuestros Productos
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Encuentra lo que buscas entre nuestra amplia variedad de productos importados
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {categories.map((cat, idx) => (
            <Link
              key={idx}
              to={cat.link}
              className="group relative overflow-hidden rounded-3xl shadow-xl aspect-[4/5]"
            >
              <img
                src={cat.image}
                alt={cat.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              
              <div className={`absolute inset-0 bg-gradient-to-t ${cat.color} opacity-80 group-hover:opacity-90 transition-opacity`} />
              
              <div className="absolute inset-0 p-6 flex flex-col justify-end">
                <p className="text-white/80 text-sm font-medium mb-1">{cat.subtitle}</p>
                <h3 className="text-white text-2xl font-bold mb-2 group-hover:translate-y-0 transition-transform">
                  {cat.title}
                </h3>
                <p className="text-white/90 text-sm mb-4">{cat.description}</p>
                <div className="flex items-center text-white font-semibold group-hover:gap-3 gap-2 transition-all">
                  Ver colección 
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>

              <div className="absolute top-4 right-4 w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default CategoriesSection