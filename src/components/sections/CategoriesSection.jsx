import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

const FALLBACK_CATEGORIES = [
  { title: 'Bolsos & Carteras', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80', link: '/categoria/bolsos' },
  { title: 'Vestidos de Noche', image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&q=80', link: '/categoria/vestidos' },
  { title: 'Billeteras', image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&q=80', link: '/categoria/billeteras' },
]

const CATEGORY_MAP = {
  'bolsos': { title: 'Bolsos & Carteras', slug: 'bolsos' },
  'carteras': { title: 'Bolsos & Carteras', slug: 'bolsos' },
  'vestidos': { title: 'Vestidos de Noche', slug: 'vestidos' },
  'billeteras': { title: 'Billeteras', slug: 'billeteras' },
}

export default function CategoriesSection({ categories }) {
  const [localCategories, setLocalCategories] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (categories) {
      setLoading(false)
      return
    }
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('name, brand, category, image_url, images_urls')

        if (error) throw error

        if (data?.length) {
          const grouped = {}
          data.forEach((p) => {
            const catKey = (p.category || '').toLowerCase().trim()
            const mapped = CATEGORY_MAP[catKey]
            if (!mapped) return
            if (!grouped[mapped.slug]) {
              grouped[mapped.slug] = {
                title: mapped.title,
                image: p.images_urls?.[0] || p.image_url || '',
                link: `/categoria/${mapped.slug}`,
              }
            }
          })
          const list = Object.values(grouped)
          setLocalCategories(list.length > 0 ? list : FALLBACK_CATEGORIES)
        } else {
          setLocalCategories(FALLBACK_CATEGORIES)
        }
      } catch {
        setLocalCategories(FALLBACK_CATEGORIES)
      } finally {
        setLoading(false)
      }
    }
    fetchCategories()
  }, [categories])

  const displayCategories = categories || localCategories

  if (loading || !displayCategories?.length) return null

  return (
    <section className="w-full bg-white px-4 md:px-8 py-16 md:py-24">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 md:grid-rows-2 gap-4 md:gap-6">
          {displayCategories.map((cat, i) => {
            const isLarge = i === 0

            return (
              <a
                key={i}
                href={cat.link || '#'}
                className={`relative overflow-hidden group ${isLarge ? 'md:col-span-1 md:row-span-2' : 'md:col-span-1 md:row-span-1'}`}
              >
                <div className={isLarge ? 'aspect-[4/5] md:aspect-auto md:h-full' : 'aspect-[16/9] md:aspect-auto md:h-full'}>
                  <img
                    src={cat.image}
                    alt={cat.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                <h3 className="absolute bottom-6 left-6 text-white font-display text-2xl md:text-3xl font-light">
                  {cat.title}
                </h3>
              </a>
            )
          })}
        </div>
      </div>
    </section>
  )
}
