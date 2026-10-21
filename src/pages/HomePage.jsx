import { useState, useEffect } from 'react'
import { useProducts } from '../hooks/useProducts'
import { Link, useNavigate } from 'react-router-dom'
import { WHATSAPP_PHONE } from '../lib/constants'
import HeroSection from '../components/sections/HeroSection'
import CategoriesSection from '../components/sections/CategoriesSection'
import AboutSection from '../components/sections/AboutSection'
import AdvisorySection from '../components/sections/AdvisorySection'
import TestimonialsSection from '../components/ui/TestimonialsSection'
import RevealSection from '../components/shared/RevealSection'
import SectionTexture from '../components/shared/SectionTexture'
import SectionDivider from '../components/shared/SectionDivider'
import ProductCard from '../components/producto/ProductCard'
import { p } from '../lib/theme'

const SectionDivider = () => (
  <div aria-hidden style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem' }}>
    <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent 0%, rgba(212,120,138,0.2) 30%, rgba(212,120,138,0.2) 70%, transparent 100%)' }} />
  </div>
)

const HomePage = () => {
  const navigate = useNavigate()
  const { products, loading, error, totalProductos, actualizarFiltros } = useProducts({})

  useEffect(() => {
    actualizarFiltros({})
  }, [actualizarFiltros])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-[#E8D5B7] border-t-[#C9607F] rounded-full animate-spin" />
    </div>
  )

  if (error) return (
    <div className="min-h-screen flex items-center justify-center text-center p-8">
      <p style={{ color: p.roseDeep }}>{error}</p>
      <Link to="/" className="btn-kb-ghost mt-4">← Volver a la tienda</Link>
    </div>
  )

  // Filtrar solo productos destacados o nuevos, máximo 8
  const featuredProducts = products.filter(p => p.is_featured || p.is_new).slice(0, 8)

  return (
    <main style={{ background: p.ivory, minHeight: '100vh' }}>

      <SectionTexture section="hero">
        <HeroSection
          title="Nuestro Cuaderno"
          subtitle="Tienda de moda y accesorios"
          ctaText="Explora el catálogo"
          backgroundImage=""
        />
      </SectionTexture>

      <SectionDivider />

      <SectionTexture section="categories">
        <RevealSection>
          <CategoriesSection />
        </RevealSection>
      </SectionTexture>

      <SectionDivider />

      {/* --- Catálogo destacada: máx. 8 productos — grid 2 cols móvil, 3 tablet, 4 escritorio --- */}
      <div className="py-6 px-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-[#E8D5B7] border-t-[#C9607F] rounded-full animate-spin mx-auto" />
          </div>
        ) : featuredProducts.length === 0 ? (
          <div className="text-center py-12 text-mauve">
            <p className="font-light tracking-widest">No hay productos destacados</p>
            <p className="mt-2 text-sm">Prueba ajustando los filtros</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* Botón "Ver todo el catálogo" */}
        <div className="py-4 text-center">
          <Link
            to="/catalogo"
            className="px-6 py-3 rounded-sm text-sm font-medium uppercase tracking-widest transition-all hover:-translate-y-0.5"
            style={{ background: p.roseDeep, color: '#FFFFFF', fontFamily: 'var(--font-sans)' }}
          >
            Ver todo el catálogo
          </Link>
        </div>
      </div>

      <SectionTexture section="about">
        <RevealSection>
          <AboutSection getText={getText} />
        </RevealSection>
      </SectionTexture>

      <SectionDivider />

      <SectionTexture section="advisory">
        <RevealSection>
          <AdvisorySection />
        </RevealSection>
      </SectionTexture>

      <SectionDivider />

      <SectionTexture section="testimonials">
        <RevealSection>
          <TestimonialsSection />
        </RevealSection>
      </SectionTexture>
    </main>
  )
}

export default HomePage