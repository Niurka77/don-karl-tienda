import { useState, useEffect, useRef } from 'react'

export function useScrollReveal(options = {}) {
  const { threshold = 0.1, rootMargin = '0px', delay = 0 } = options
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const activate = () => setIsVisible(true)
          if (delay > 0) {
            setTimeout(activate, delay)
          } else {
            activate()
          }
          observer.disconnect()
        }
      },
      { threshold, rootMargin }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold, rootMargin, delay])

  return { ref, isVisible }
}
