import { createContext, useContext, useState, useCallback, useMemo, useRef } from 'react'

const NotificationContext = createContext()

export const useNotificationCenter = () => useContext(NotificationContext)

const playNotifSound = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.setValueAtTime(880, ctx.currentTime)
    osc.frequency.setValueAtTime(1108, ctx.currentTime + 0.08)
    gain.gain.setValueAtTime(0.2, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.2)
  } catch {}
}

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([])

  const pushNotification = useCallback((notif) => {
    const n = { id: Date.now(), ...notif, timestamp: new Date().toISOString(), leido: false }
    setNotifications(prev => [n, ...prev])
    playNotifSound()
  }, [])

  const marcarLeidas = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, leido: true })))
  }, [])

  const eliminar = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const unreadCount = useMemo(() => notifications.filter(n => !n.leido).length, [notifications])

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, pushNotification, marcarLeidas, eliminar }}>
      {children}
    </NotificationContext.Provider>
  )
}
