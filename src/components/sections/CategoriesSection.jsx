import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import ImageWithFallback from '../ui/ImageWithFallback'

const FALLBACK_CATEGORIES = [
  { name: 'Carteras', icon: '👜' },
  { name: 'Vestidos', icon: '👗' },
  { name: 'Billeteras', icon: '👛' },
  { name: 'Accesorios', icon: '🕶️' },
  { name: 'Zapatos', icon: '👠' },
  { name: 'Joyas', icon: '💍' },
  { name: 'Ropa', icon: '🧥' },
  { name: 'Hombres', icon: '👔' },
]

export default function CategoriesSection({ getText }) {
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('category, images_urls, image_url')
          .not('category', 'is', null)
          .limit(300)

        if (error) throw error
        if (!active) return

        const seen = new Set()
        const cats = []
        for (const row of data || []) {
          const name = row.category?.trim()
          if (!name || seen.has(name.toLowerCase())) continue
          seen.add(name.toLowerCase())
          cats.push({
            name,
            image: row.images_urls?.[0] || row.image_url || '',
          })
        }
        cats.sort((a, b) => a.name.localeCompare(b.name))
        setCategories(cats)
      } catch (err) {
        console.warn('No se pudieron cargar categorías:', err)
        setCategories(FALLBACK_CATEGORIES.map((c) => ({ name: c.name, image: '' })))
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [])

  const goCategory = (name) => {
    navigate(`/?categoria=${encodeURIComponent(name)}`)
    setTimeout(() => {
      const target = document.getElementById('product-grid-section')
      if (target) {
        const offset = target.getBoundingClientRect().top + window.pageYOffset - 140
        window.scrollTo({ top: offset, behavior: 'smooth' })
      }
    }, 500)
  }

  if (!loading && categories.length === 0) return null

  return (
    <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(4rem, 8vw, 7rem) 1.5rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <p className="font-sans text-xs tracking-[0.22em] uppercase text-kb-rose mb-3 font-medium">
          {getText?.('categories_eyebrow') || 'Explora'}
        </p>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 300, color: 'var(--color-kb-obsidian)', letterSpacing: '-0.02em', lineHeight: 1.05 }}>
          Compra por <span style={{ fontStyle: 'italic', color: 'var(--color-kb-rose-deep)' }}>{getText?.('categories_heading_accent') || 'categoría'}</span>
        </h2>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1.75rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        {categories.map((cat) => (
          <button
            key={cat.name}
            onClick={() => goCategory(cat.name)}
            className="kb-cat-chip"
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: 0,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.65rem',
              flexShrink: 0, width: '92px',
            }}
          >
            <span
              className="kb-cat-chip__ring"
              style={{
                width: '88px', height: '88px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: '#FDF0F3', overflow: 'hidden', position: 'relative',
                border: '1px solid rgba(212,120,138,0.18)',
                transition: 'transform 0.4s cubic-bezier(0.16,1,0.3,1), border-color 0.3s ease, box-shadow 0.3s ease',
              }}
            >
              {cat.image ? (
                <ImageWithFallback
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  loading="lazy"
                />
              ) : (
                <span style={{ fontSize: '1.8rem' }}>{FALLBACK_CATEGORIES.find((f) => f.name === cat.name)?.icon || '🛍️'}</span>
              )}
            </span>
            <span
              className="kb-cat-chip__label"
              style={{
                fontFamily: 'var(--font-sans)', fontSize: '0.72rem', letterSpacing: '0.06em',
                color: 'var(--color-kb-mauve)', textTransform: 'uppercase',
                transition: 'color 0.3s ease', fontWeight: 500,
              }}
            >
              {cat.name}
            </span>
          </button>
        ))}
      </div>

      <style>{`
        .kb-cat-chip:hover .kb-cat-chip__ring {
          transform: translateY(-4px);
          border-color: var(--color-kb-rose, #D4788A);
          box-shadow: 0 14px 30px -12px rgba(212, 120, 138, 0.45);
        }
        .kb-cat-chip:hover .kb-cat-chip__label {
          color: var(--color-kb-rose-deep, #B85268);
        }
      `}</style>
    </section>
  )
}
