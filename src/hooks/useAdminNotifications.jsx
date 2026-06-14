import { useState, useEffect } from 'react'

// 🔊 Sistema de sonidos (Web Audio API) - Centralizado
const playSound = (type) => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (!AudioContext) return
    
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    
    osc.connect(gain)
    gain.connect(ctx.destination)

    switch (type) {
      case 'success':
        osc.frequency.setValueAtTime(523.25, ctx.currentTime)
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1)
        gain.gain.setValueAtTime(0.3, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
        osc.start(ctx.currentTime)
        osc.stop(ctx.currentTime + 0.3)
        break
      
      case 'warning':
        osc.frequency.setValueAtTime(440, ctx.currentTime)
        gain.gain.setValueAtTime(0.2, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2)
        osc.start(ctx.currentTime)
        osc.stop(ctx.currentTime + 0.2)
        break
      
      case 'error':
        osc.frequency.setValueAtTime(300, ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.3)
        gain.gain.setValueAtTime(0.3, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
        osc.start(ctx.currentTime)
        osc.stop(ctx.currentTime + 0.3)
        break
      
      case 'click':
        osc.frequency.setValueAtTime(800, ctx.currentTime)
        gain.gain.setValueAtTime(0.1, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05)
        osc.start(ctx.currentTime)
        osc.stop(ctx.currentTime + 0.05)
        break
      
      case 'upload':
        osc.frequency.setValueAtTime(600, ctx.currentTime)
        osc.frequency.setValueAtTime(800, ctx.currentTime + 0.1)
        osc.frequency.setValueAtTime(1000, ctx.currentTime + 0.2)
        gain.gain.setValueAtTime(0.2, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
        osc.start(ctx.currentTime)
        osc.stop(ctx.currentTime + 0.3)
        break
      
      default:
        osc.frequency.setValueAtTime(800, ctx.currentTime)
        gain.gain.setValueAtTime(0.1, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05)
        osc.start(ctx.currentTime)
        osc.stop(ctx.currentTime + 0.05)
    }
  } catch (e) {
    console.warn('Audio no disponible:', e)
  }
}

// Hook personalizado
export const useAdminNotifications = () => {
  const [toasts, setToasts] = useState([])

  const agregarToast = (mensaje, tipo = 'info') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, mensaje, tipo }])
    playSound(tipo)
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 4000)
  }

  const eliminarToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  const ToastContainer = () => (
    <div className="fixed top-4 right-4 z-[60] space-y-2 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`pointer-events-auto px-4 py-3 rounded-sm shadow-md border flex items-center justify-between gap-3 animate-slide-in ${
            toast.tipo === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
            toast.tipo === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
            toast.tipo === 'warning' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' :
            'bg-[#FDF0F3] border-[#D4788A] text-[#1A1118]'
          }`}
        >
          <p className="text-sm font-['DM_Sans'] font-medium">{toast.mensaje}</p>
          <button 
            onClick={() => eliminarToast(toast.id)} 
            className="text-lg leading-none hover:opacity-70"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )

  return { agregarToast, eliminarToast, ToastContainer }
}

export default useAdminNotifications