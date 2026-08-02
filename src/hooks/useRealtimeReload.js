import { useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

// Hook que recarga datos automáticamente cuando hay cambios en una tabla
// (INSERT / UPDATE / DELETE) vía Supabase Realtime.
// `onReload` se guarda en una ref para no re-suscribirse en cada render.
export const useRealtimeReload = (table, onReload) => {
  const onReloadRef = useRef(onReload)
  onReloadRef.current = onReload

  useEffect(() => {
    const channel = supabase
      .channel(`rt-${table}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        () => { onReloadRef.current() }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [table])
}

export default useRealtimeReload
