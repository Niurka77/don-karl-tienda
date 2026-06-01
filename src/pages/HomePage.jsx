import ProductGrid from '../components/producto/ProductGrid'
import BotonPDF from '../components/producto/BotonPDF'
import HeroSection from '../components/ui/HeroSection'
import TrustSection from '../components/ui/TrustSection'
import CategoriesSection from '../components/ui/CategoriesSection'

const HomePage = () => {
  return (
    <div>
      <HeroSection />
      <TrustSection />
      <CategoriesSection />
      
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-1">
              Todos los productos
            </h3>
            <p className="text-gray-500 text-sm">
              Explora nuestro catálogo completo importado de EE.UU.
            </p>
          </div>
          <BotonPDF />
        </div>
        <ProductGrid />
      </div>
      import VideoGallery from '../components/ui/VideoGallery'

// Dentro del return, antes del footer o despues de los productos destacados:
<section className="max-w-screen-xl mx-auto px-6 lg:px-10 py-16 md:py-24">
  <VideoGallery limit={6} showTitle={true} />
</section>
    </div>
  )
}

export default HomePage