import logoKB from '/kb.png'
import WhatsAppButton from '../ui/WhatsAppButton'
import Header from './Header'
import Footer from './Footer'
import { Outlet, Link, useNavigate } from 'react-router-dom'
import CartDrawer from '../carrito/CartDrawer'
import useCartStore from '../../store/cartStore'
import { WHATSAPP_PHONE, WHATSAPP_MESSAGES } from '../../lib/constants'
import { useState, useEffect, useRef } from 'react'
import { useScrollReveal } from '../../hooks/useScrollReveal'
import { p } from '../../lib/theme'

const Layout = () => {
  const navigate = useNavigate()
  const { toggleCart, getItemCount } = useCartStore()
  const itemCount = getItemCount()
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const headerRef = useRef(null)
  const searchInputRef = useRef(null)
  const { ref: footerRef, isVisible: footerVisible } = useScrollReveal({ threshold: 0.1 })

  // ── Scroll effect ─────────────────────────────────────────────────────────
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // ── Mouse tracking para parallax sutil ────────────────────────────────────
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!headerRef.current) return
      const rect = headerRef.current.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width - 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5
      setMousePos({ x, y })
    }
    const el = headerRef.current
    if (el) {
      el.addEventListener('mousemove', handleMouseMove)
      return () => el.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  // ── Auto-focus search input ──────────────────────────────────────────────
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [searchOpen])

  // ── Search handler ──────────────────────────────────────────────────────
  const handleSearch = (e) => {
    e.preventDefault()
    const q = searchQuery.trim()
    if (!q) return
    setSearchOpen(false)
    setSearchQuery('')
    navigate(`/?busqueda=${encodeURIComponent(q)}`)
  }

  // ── Navegación con scroll suave ───────────────────────────────────────────
  const handleNavigateWithScroll = (url) => {
    setMobileMenuOpen(false)
    navigate(url)
    const timer = setTimeout(() => {
      const productGrid = document.getElementById('product-grid-section')
      if (productGrid) {
        const headerOffset = 140
        const elementPosition = productGrid.getBoundingClientRect().top
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset
        window.scrollTo({ top: offsetPosition, behavior: 'smooth' })
      }
    }, 500)
    return () => clearTimeout(timer)
  }

  const navItems = [
    { label: 'MUJER', action: () => handleNavigateWithScroll('/?genero=mujer') },
    { label: 'HOMBRE', action: () => handleNavigateWithScroll('/?genero=hombre') },
    { label: 'NOSOTROS', href: '/#nosotros' },
  ]

  // ─── Pétalos para el header ───────────────────────────────────────────────
  const petals = [
    { delay: 0, left: 10, size: 8, color: p.roseBlush, duration: 15 },
    { delay: 3, left: 25, size: 6, color: p.peach, duration: 18 },
    { delay: 6, left: 40, size: 7, color: p.coralSoft, duration: 16 },
    { delay: 9, left: 55, size: 5, color: p.roseMist, duration: 20 },
    { delay: 12, left: 70, size: 9, color: p.goldLight, duration: 17 },
    { delay: 15, left: 85, size: 6, color: p.apricot, duration: 19 },
  ]

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: `linear-gradient(180deg, ${p.ivory} 0%, ${p.cream} 100%)`,
      }}
    >
      {/* ════════════════════════════════════════════════════════════════════
          HEADER — Aurora Bloom Luxury
      ════════════════════════════════════════════════════════════════════ */}
      <Header
        scrolled={scrolled}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        searchOpen={searchOpen}
        setSearchOpen={setSearchOpen}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        mousePos={mousePos}
        itemCount={itemCount}
        toggleCart={toggleCart}
        onSearch={handleSearch}
        navItems={navItems}
        headerRef={headerRef}
        searchInputRef={searchInputRef}
        petals={petals}
      />

      {/* ════════════════════════════════════════════════════════════════════
          CONTENIDO PRINCIPAL
      ════════════════════════════════════════════════════════════════════ */}
      <main className="flex-1" id="main-content">
        <Outlet />
      </main>

      {/* WhatsApp */}
      <WhatsAppButton phoneNumber={WHATSAPP_PHONE} />

      {/* Cart Drawer */}
      <CartDrawer />

      {/* ════════════════════════════════════════════════════════════════════
          FOOTER — Aurora Bloom Luxury
      ════════════════════════════════════════════════════════════════════ */}
      <Footer onNavigate={handleNavigateWithScroll} />

      {/* ════════════════════════════════════════════════════════════════════
          KEYFRAMES
      ════════════════════════════════════════════════════════════════════ */}
      <style>{`
        @keyframes topbarGradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes marqueeScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        @keyframes headerPetalFall {
          0% { transform: translateY(0) rotate(0deg) scale(1); opacity: 0.4; }
          25% { transform: translateY(25vh) rotate(90deg) scale(0.9); opacity: 0.45; }
          50% { transform: translateY(50vh) rotate(180deg) scale(0.8); opacity: 0.35; }
          75% { transform: translateY(75vh) rotate(270deg) scale(0.7); opacity: 0.25; }
          100% { transform: translateY(110vh) rotate(360deg) scale(0.5); opacity: 0; }
        }

        @keyframes logoShine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }

        @keyframes cartPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        @keyframes heartBeat {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.8; }
        }

        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slide-down {
          animation: slide-down 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  )
}

export default Layout