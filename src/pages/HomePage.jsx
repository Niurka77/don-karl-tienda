import { useRef, useEffect, useState } from 'react'
import ProductGrid from '../components/producto/ProductGrid'
import BotonPDF from '../components/producto/BotonPDF'
import HeroSection from '../components/ui/HeroSection'
import TrustSection from '../components/ui/TrustSection'
import CategoriesSection from '../components/ui/CategoriesSection'
import VideoGallery from '../components/ui/VideoGallery'

// ─── Reveal animation hook ────────────────────────────────────────────────────
// Triggers a CSS class when a section enters the viewport.
// Avoids layout shifts — elements are invisible before reveal, not displaced.

const useRevealOnScroll = (threshold = 0.12) => {
  const ref = useRef(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [threshold])

  return { ref, isVisible }
}

// ─── Section reveal wrapper ───────────────────────────────────────────────────
// Wraps any section with an editorial fade-up reveal.
// `delay` staggers sibling reveals naturally without JS timers.

const RevealSection = ({ children, delay = 0, className = '' }) => {
  const { ref, isVisible } = useRevealOnScroll()

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(28px)',
        transition: `opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

// ─── Section divider ──────────────────────────────────────────────────────────
// Thin editorial rule that separates content sections.
// Communicates structure without adding visual weight.

const SectionDivider = () => (
  <div
    aria-hidden
    style={{
      maxWidth: '1280px',
      margin: '0 auto',
      padding: '0 1.5rem',
    }}
  >
    <div
      style={{
        height: '1px',
        background: 'linear-gradient(90deg, transparent 0%, rgba(212,120,138,0.2) 30%, rgba(212,120,138,0.2) 70%, transparent 100%)',
      }}
    />
  </div>
)

// ─── Product section header ───────────────────────────────────────────────────
// Editorial header for the catalogue section.
// Replaces the generic `h3 font-bold text-gray-800` from the original.
// The PDF download is repositioned as a secondary utility, not competing
// with the section headline for visual attention.

const CatalogueHeader = () => (
  <div
    style={{
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      marginBottom: '3rem',
      gap: '1.5rem',
      flexWrap: 'wrap',
    }}
  >
    <div>
      {/* Eyebrow — anchors the section editorially */}
      <p
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '0.6rem',
          fontWeight: 500,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: 'var(--color-kb-rose)',
          marginBottom: '0.6rem',
        }}
      >
        Colección actual
      </p>

      <h2
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(1.9rem, 3.5vw, 2.8rem)',
          fontWeight: 300,
          color: 'var(--color-kb-obsidian)',
          letterSpacing: '-0.02em',
          lineHeight: 1.05,
        }}
      >
        Todos los{' '}
        <span
          style={{
            fontStyle: 'italic',
            color: 'var(--color-kb-rose-deep)',
          }}
        >
          productos
        </span>
      </h2>

      {/* Supporting copy — informative, not decorative */}
      <p
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '0.85rem',
          fontWeight: 300,
          color: 'var(--color-kb-mauve)',
          marginTop: '0.5rem',
          letterSpacing: '0.01em',
        }}
      >
        Moda importada directamente desde Estados Unidos
      </p>
    </div>

    {/* PDF download — utility action, visually subordinate */}
    <div style={{ flexShrink: 0 }}>
      <BotonPDF />
    </div>
  </div>
)

// ─── Video section header ─────────────────────────────────────────────────────
// Extracted so VideoGallery's internal `showTitle` prop isn't needed.
// Gives us full typographic control without touching the child component.

const VideoSectionHeader = () => (
  <div
    style={{
      textAlign: 'center',
      marginBottom: '4rem',
    }}
  >
    <div
      aria-hidden
      style={{
        width: '40px',
        height: '1px',
        background: 'linear-gradient(90deg, transparent, var(--color-kb-rose), transparent)',
        margin: '0 auto 1.4rem',
      }}
    />
    <p
      style={{
        fontFamily: 'var(--font-sans)',
        fontSize: '0.6rem',
        fontWeight: 500,
        letterSpacing: '0.22em',
        textTransform: 'uppercase',
        color: 'var(--color-kb-rose)',
        marginBottom: '0.75rem',
      }}
    >
      Lifestyle
    </p>
    <h2
      style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(2rem, 4vw, 3.2rem)',
        fontWeight: 300,
        fontStyle: 'italic',
        color: 'var(--color-kb-obsidian)',
        letterSpacing: '-0.02em',
        lineHeight: 1.05,
        marginBottom: '0.75rem',
      }}
    >
      Síguenos en redes
    </h2>
    <p
      style={{
        fontFamily: 'var(--font-sans)',
        fontSize: '0.85rem',
        fontWeight: 300,
        color: 'var(--color-kb-mauve)',
        maxWidth: '340px',
        margin: '0 auto',
        lineHeight: 1.65,
      }}
    >
      Descubre cómo nuestras clientas llevan cada pieza
    </p>
  </div>
)

// ─── HomePage ─────────────────────────────────────────────────────────────────

const HomePage = () => {
  return (
    <main>
      {/*
        Hero: full-bleed, no padding wrapper.
        HeroSection owns its own layout completely — correct.
      */}
      <HeroSection />

      {/*
        Trust bar: placed immediately after hero.
        Converts the momentum from hero interest into brand confidence
        before the user sees any product. Correct sequence for ecommerce.
      */}
      <TrustSection />

      <SectionDivider />

      {/*
        Categories: editorial navigation shortcut.
        Lets users who know what they want jump directly.
        Reveal is slightly delayed to avoid competing with TrustSection.
      */}
      <RevealSection delay={0}>
        <CategoriesSection />
      </RevealSection>

      <SectionDivider />

      {/*
        Catalogue section.
        Max-width matches HeroSection's container for visual consistency
        across the page. Original used max-w-7xl (1280px) which is correct.
        Padding is generous — editorial breathing room, not crowded marketplace.
      */}
      <section
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: 'clamp(4rem, 8vw, 7rem) 1.5rem',
        }}
      >
        <RevealSection delay={0}>
          <CatalogueHeader />
        </RevealSection>

        <RevealSection delay={80}>
          <ProductGrid />
        </RevealSection>
      </section>

      <SectionDivider />

      {/*
        Video gallery: social proof section.
        Placed after product catalogue — the user has seen what we sell,
        now they see real people using it. Conversion sequence is intentional.
        showTitle={false} because VideoSectionHeader gives us full control.
      */}
      <section
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: 'clamp(4rem, 8vw, 7rem) 1.5rem',
        }}
      >
        <RevealSection delay={0}>
          <VideoSectionHeader />
        </RevealSection>

        <RevealSection delay={100}>
          <VideoGallery limit={6} showTitle={false} />
        </RevealSection>
      </section>
    </main>
  )
}

export default HomePage