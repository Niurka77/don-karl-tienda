import { useState, useEffect } from 'react'
import { playSound } from '../lib/sound'

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
          <p className="text-sm font-sans font-medium">{toast.mensaje}</p>
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