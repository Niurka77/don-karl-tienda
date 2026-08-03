// 🔊 Sistema de sonidos centralizado (Web Audio API)
// Todos los sonidos de la app se definen aquí.

const ensureContext = () => {
  const AudioContext = window.AudioContext || window.webkitAudioContext
  if (!AudioContext) return null
  return new AudioContext()
}

const tone = (ctx, { freq, start, duration = 0.3, volume = 0.3, type = 'sine' }) => {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.type = type
  osc.frequency.setValueAtTime(freq, ctx.currentTime + start)
  gain.gain.setValueAtTime(0.0001, ctx.currentTime + start)
  gain.gain.exponentialRampToValueAtTime(volume, ctx.currentTime + start + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + duration)
  osc.start(ctx.currentTime + start)
  osc.stop(ctx.currentTime + start + duration + 0.05)
}

export const playSound = (type = 'info') => {
  try {
    const ctx = ensureContext()
    if (!ctx) return

    switch (type) {
      case 'success':
        tone(ctx, { freq: 523.25, start: 0, duration: 0.3 })
        tone(ctx, { freq: 659.25, start: 0.1, duration: 0.3 })
        break

      case 'warning':
        tone(ctx, { freq: 440, start: 0, duration: 0.2, volume: 0.2 })
        break

      case 'error':
        tone(ctx, { freq: 300, start: 0, duration: 0.3, volume: 0.3, type: 'triangle' })
        tone(ctx, { freq: 150, start: 0.1, duration: 0.3, volume: 0.3, type: 'triangle' })
        break

      case 'click':
        tone(ctx, { freq: 800, start: 0, duration: 0.05, volume: 0.1 })
        break

      case 'upload':
        tone(ctx, { freq: 600, start: 0, duration: 0.1, volume: 0.2 })
        tone(ctx, { freq: 800, start: 0.1, duration: 0.1, volume: 0.2 })
        tone(ctx, { freq: 1000, start: 0.2, duration: 0.2, volume: 0.2 })
        break

      // 🔔 Nuevo pedido (ding-dong distintivo)
      case 'order':
        tone(ctx, { freq: 880, start: 0, duration: 0.5, volume: 0.35 })
        tone(ctx, { freq: 1174.66, start: 0.18, duration: 0.6, volume: 0.35 })
        tone(ctx, { freq: 1567.98, start: 0.36, duration: 0.6, volume: 0.25 })
        break

      default:
        tone(ctx, { freq: 800, start: 0, duration: 0.05, volume: 0.1 })
    }
  } catch (e) {
    console.warn('Audio no disponible:', e)
  }
}

// Atajo para el sonido de nuevo pedido
export const playNewOrderSound = () => playSound('order')
