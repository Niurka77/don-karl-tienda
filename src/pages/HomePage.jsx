import ProductGrid from '../components/producto/ProductGrid'
import BotonPDF from '../components/producto/BotonPDF'
import HeroSection from '../components/ui/HeroSection'
import TrustSection from '../components/ui/TrustSection'
import CategoriesSection from '../components/ui/CategoriesSection'
import VideoGallery from '../components/ui/VideoGallery'
import SectionTexture from '../components/ui/SectionTexture'
import { useScrollReveal } from '../hooks/useScrollReveal'

const RevealSection = ({ children, delay = 0, className = '' }) => {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.12 })
  return (
    <div ref={ref} className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(28px)',
        transition: `opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
      }}>
      {children}
    </div>
  )
}

const SectionDivider = ({ variant = 'gradient' }) => (
  <div aria-hidden style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem' }}>
    {variant === 'gradient' ? (
      <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent 0%, rgba(212,120,138,0.2) 30%, rgba(212,120,138,0.2) 70%, transparent 100%)' }} />
    ) : (
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '40px', height: '1px', background: 'var(--color-kb-rose)' }} />
      </div>
    )}
  </div>
)

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

const VideoSectionHeader = () => (
  <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
    <div aria-hidden style={{ width: '40px', height: '1px', background: 'linear-gradient(90deg, transparent, var(--color-kb-rose), transparent)', margin: '0 auto 1.4rem' }} />
    <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.6rem', fontWeight: 500, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--color-kb-rose)', marginBottom: '0.75rem' }}>
      Lifestyle
    </p>
    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3.2rem)', fontWeight: 300, fontStyle: 'italic', color: 'var(--color-kb-obsidian)', letterSpacing: '-0.02em', lineHeight: 1.05, marginBottom: '0.75rem' }}>
      Síguenos en redes
    </h2>
    <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.85rem', fontWeight: 300, color: 'var(--color-kb-mauve)', maxWidth: '340px', margin: '0 auto', lineHeight: 1.65 }}>
      Descubre cómo nuestras clientas llevan cada pieza
    </p>
  </div>
)

const HomePage = () => {
  return (
    <main>
      {/* HERO — full-bleed con textura editable */}
      <SectionTexture section="hero">
        <HeroSection />
      </SectionTexture>

      {/* TRUST BAR — con textura editable */}
      <SectionTexture section="trust">
        <RevealSection delay={0}>
          <TrustSection />
        </RevealSection>
      </SectionTexture>

      <SectionDivider variant="short" />

      {/* CATEGORIES — con textura editable */}
      <SectionTexture section="categories">
        <RevealSection delay={0}>
          <CategoriesSection />
        </RevealSection>
      </SectionTexture>

      <SectionDivider />

      {/* CATALOG — con textura editable */}
      <SectionTexture section="catalog">
        <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(4rem, 8vw, 7rem) 1.5rem' }}>
          <RevealSection delay={0}>
            <CatalogueHeader />
          </RevealSection>
          <RevealSection delay={80}>
            <ProductGrid />
          </RevealSection>
        </section>
      </SectionTexture>

      <SectionDivider />

      {/* VIDEOS — con textura editable */}
      <SectionTexture section="videos">
        <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(4rem, 8vw, 7rem) 1.5rem' }}>
          <RevealSection delay={0}>
            <VideoSectionHeader />
          </RevealSection>
          <RevealSection delay={100}>
            <VideoGallery limit={6} showTitle={false} />
          </RevealSection>
        </section>
      </SectionTexture>
    </main>
  )
}

export default HomePage
