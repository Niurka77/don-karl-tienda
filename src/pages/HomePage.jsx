import HeroSection from '../components/ui/HeroSection'
import CategoriesSection from '../components/ui/CategoriesSection'
import AdvisorySection from '../components/ui/AdvisorySection'
import VideoGallery from '../components/ui/VideoGallery'
import ProductGrid from '../components/producto/ProductGrid'
import BotonPDF from '../components/producto/BotonPDF'
import { useScrollReveal } from '../hooks/useScrollReveal'

const RevealSection = ({ children, delay = 0 }) => {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.12 })
  return (
    <div ref={ref} style={{
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translateY(0)' : 'translateY(28px)',
      transition: `opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
    }}>
      {children}
    </div>
  )
}

const CatalogueHeader = () => (
  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '3rem', gap: '1.5rem', flexWrap: 'wrap' }}>
    <div>
      <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.6rem', fontWeight: 500, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--color-kb-rose)', marginBottom: '0.6rem' }}>
        Colección actual
      </p>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.9rem, 3.5vw, 2.8rem)', fontWeight: 300, color: 'var(--color-kb-obsidian)', letterSpacing: '-0.02em', lineHeight: 1.05 }}>
        Todos los <span style={{ fontStyle: 'italic', color: 'var(--color-kb-rose-deep)' }}>productos</span>
      </h2>
      <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.85rem', fontWeight: 300, color: 'var(--color-kb-mauve)', marginTop: '0.5rem', letterSpacing: '0.01em' }}>
        Moda importada directamente desde Estados Unidos
      </p>
    </div>
    <div style={{ flexShrink: 0 }}><BotonPDF /></div>
  </div>
)

const SectionDivider = () => (
  <div aria-hidden style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem' }}>
    <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent 0%, rgba(212,120,138,0.2) 30%, rgba(212,120,138,0.2) 70%, transparent 100%)' }} />
  </div>
)

const HomePage = () => {
  return (
    <main>
      <HeroSection />

      <CategoriesSection />

      <SectionDivider />

      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(4rem, 8vw, 7rem) 1.5rem' }}>
        <RevealSection delay={0}>
          <CatalogueHeader />
        </RevealSection>
        <RevealSection delay={80}>
          <ProductGrid />
        </RevealSection>
      </section>

      <SectionDivider />

      <AdvisorySection />

      <VideoGallery limit={6} showTitle />
    </main>
  )
}

export default HomePage
