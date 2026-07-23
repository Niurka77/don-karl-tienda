import { useState, useEffect } from 'react'

const AnimatedPrice = ({ value, inView, duration = 1800 }) => {
  const [displayed, setDisplayed] = useState(0)

  useEffect(() => {
    if (!inView) return
    let start = null
    const step = (ts) => {
      if (!start) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayed(eased * value)
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [inView, value, duration])

  return <span>{displayed.toFixed(2)}</span>
}

export default AnimatedPrice
