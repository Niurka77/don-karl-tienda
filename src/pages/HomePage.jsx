import { useSiteConfig } from '../hooks/useSiteConfig'
import HeroSection from '../components/sections/HeroSection'
import CategoriesSection from '../components/sections/CategoriesSection'
import AboutSection from '../components/sections/AboutSection'
import AdvisorySection from '../components/sections/AdvisorySection'
import ProductGrid from '../components/producto/ProductGrid'
import BotonPDF from '../components/producto/BotonPDF'
import VideoGallery from '../components/ui/VideoGallery'
import TestimonialsSection from '../components/ui/TestimonialsSection'
import SectionTexture from '../components/shared/SectionTexture'
import RevealSection from '../components/shared/RevealSection'

const SectionDivider = () => (
  <div aria-hidden style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem' }}>
    <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent 0%, rgba(212,120,138,0.2) 30%, rgba(212,120,138,0.2) 70%, transparent 100%)' }} />
  </div>
)

const CatalogueHeader = ({ getText }) => (
  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '3rem', gap: '1.5rem', flexWrap: 'wrap' }}>
    <div>
      <p className="font-sans text-xs tracking-[0.22em] uppercase text-kb-rose mb-2 font-medium">
        {getText('catalog_eyebrow') || 'Colección actual'}
      </p>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.9rem, 3.5vw, 2.8rem)', fontWeight: 300, color: 'var(--color-kb-obsidian)', letterSpacing: '-0.02em', lineHeight: 1.05 }}>
        Todos los <span style={{ fontStyle: 'italic', color: 'var(--color-kb-rose-deep)' }}>{getText('catalog_heading_accent') || 'productos'}</span>
      </h2>
      <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.85rem', fontWeight: 300, color: 'var(--color-kb-mauve)', marginTop: '0.5rem', letterSpacing: '0.01em' }}>
        {getText('catalog_tagline') || 'Moda importada directamente desde Estados Unidos'}
      </p>
    </div>
    <div style={{ flexShrink: 0 }}><BotonPDF /></div>
  </div>
)

const VideoSectionHeader = ({ getText }) => (
  <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
    <div aria-hidden style={{ width: '40px', height: '1px', background: 'linear-gradient(90deg, transparent, var(--color-kb-rose), transparent)', margin: '0 auto 1.4rem' }} />
    <p className="font-sans text-xs tracking-[0.22em] uppercase text-kb-rose mb-3 font-medium">
      {getText('videos_eyebrow') || 'Lifestyle'}
    </p>
    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3.2rem)', fontWeight: 300, fontStyle: 'italic', color: 'var(--color-kb-obsidian)', letterSpacing: '-0.02em', lineHeight: 1.05, marginBottom: '0.75rem' }}>
      {getText('videos_title') || 'Síguenos en redes'}
    </h2>
    <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.85rem', fontWeight: 300, color: 'var(--color-kb-mauve)', maxWidth: '340px', margin: '0 auto', lineHeight: 1.65 }}>
      {getText('videos_subtitle') || 'Descubre cómo nuestras clientas llevan cada pieza'}
    </p>
  </div>
)

const HomePage = () => {
  const { getText, config } = useSiteConfig()

  return (
    <main>
      <SectionTexture section="hero">
        <HeroSection
          title={getText('hero_title')}
          subtitle={getText('hero_subtitle')}
          ctaText={getText('hero_cta')}
          backgroundImage={config.textures?.hero?.url || ''}
        />
      </SectionTexture>

      <SectionDivider />

      <SectionTexture section="categories">
        <RevealSection>
          <CategoriesSection getText={getText} />
        </RevealSection>
      </SectionTexture>

      <SectionDivider />

      <SectionTexture section="catalog">
        <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(4rem, 8vw, 7rem) 1.5rem' }}>
          <RevealSection>
            <CatalogueHeader getText={getText} />
          </RevealSection>
          <RevealSection delay={80}>
            <ProductGrid />
          </RevealSection>
        </section>
      </SectionTexture>

      <SectionDivider />

      <SectionTexture section="about">
        <RevealSection>
          <AboutSection getText={getText} />
        </RevealSection>
      </SectionTexture>

      <SectionDivider />

      <SectionTexture section="advisory">
        <RevealSection>
          <AdvisorySection
            title={getText('advisory_title')}
            description={getText('advisory_description')}
            ctaText={getText('advisory_cta')}
            backgroundColor={config.customColors?.background || '#FDF0F3'}
          />
        </RevealSection>
      </SectionTexture>

      <SectionDivider />

      <SectionTexture section="videos">
        <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(4rem, 8vw, 7rem) 1.5rem' }}>
          <RevealSection>
            <VideoSectionHeader getText={getText} />
          </RevealSection>
          <RevealSection delay={100}>
            <VideoGallery limit={6} showTitle={false} />
          </RevealSection>
        </section>
      </SectionTexture>

      <SectionDivider />

      <SectionTexture section="testimonials">
        <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(4rem, 8vw, 7rem) 1.5rem' }}>
          <RevealSection>
            <TestimonialsSection getText={getText} />
          </RevealSection>
        </section>
      </SectionTexture>
    </main>
  )
}

export default HomePage
