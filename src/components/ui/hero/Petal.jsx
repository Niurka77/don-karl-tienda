const Petal = ({ delay, left, size, color, duration }) => (
  <div
    style={{
      position: 'absolute',
      left: `${left}%`,
      top: '-20px',
      width: size,
      height: size * 1.3,
      borderRadius: '50% 0 50% 50%',
      background: color,
      opacity: 0.4,
      animation: `heroPetalFall ${duration}s linear infinite`,
      animationDelay: `${delay}s`,
      filter: 'blur(0.5px)',
      pointerEvents: 'none',
    }}
  />
)

export default Petal
