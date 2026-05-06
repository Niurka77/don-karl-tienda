import ProductGrid from '../components/producto/ProductGrid'

const HomePage = () => {
  return (
    <div>
      {/* Banner */}
      <div className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 py-12 md:py-20">
          <h2 className="text-3xl md:text-5xl font-bold mb-3">
            Nueva Colección
          </h2>
          <p className="text-gray-300 text-lg md:text-xl mb-6">
            Importado directamente desde EE.UU.
          </p>
          <p className="text-gray-400 text-sm md:text-base max-w-lg">
            Descubre las últimas tendencias en moda. Calidad garantizada, envíos a todo el Perú.
          </p>
        </div>
      </div>

      {/* Productos */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">
          Todos los productos
        </h3>
        <ProductGrid />
      </div>
    </div>
  )
}

export default HomePage