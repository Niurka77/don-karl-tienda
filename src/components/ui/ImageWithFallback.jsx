import { useState, useCallback } from 'react'

const FALLBACK_BG = 'linear-gradient(135deg, #FFE8EF 0%, #FFF5F0 40%, #F5EBD9 100%)'

export default function ImageWithFallback({ src, alt, className, style, ...props }) {
  const [hasError, setHasError] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const handleError = useCallback(() => setHasError(true), [])
  const handleLoad = useCallback(() => setLoaded(true), [])

  if (hasError || !src) {
    return (
      <div
        className={className}
        style={{
          background: FALLBACK_BG,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          ...style,
        }}
      >
        <svg
          viewBox="0 0 64 64"
          fill="none"
          style={{ width: '40%', maxWidth: '48px', opacity: 0.3 }}
        >
          <rect x="4" y="8" width="56" height="48" rx="4" stroke="#C9607F" strokeWidth="2" />
          <circle cx="22" cy="24" r="5" stroke="#C9607F" strokeWidth="2" />
          <path
            d="M4 42l14-14 10 10 8-8 24 24"
            stroke="#C9607F"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span
          style={{
            fontSize: '0.6rem',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: '#C9607F',
            opacity: 0.5,
            fontWeight: 600,
            fontFamily: 'ui-sans-serif, system-ui, sans-serif',
          }}
        >
          KB Dresses
        </span>
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={{
        ...style,
        opacity: loaded ? 1 : 0,
        transition: 'opacity 0.4s ease',
      }}
      onError={handleError}
      onLoad={handleLoad}
      {...props}
    />
  )
}
