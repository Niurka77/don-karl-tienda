import { create } from 'zustand'
import { supabase } from '../lib/supabase'

const useAuthStore = create((set, get) => ({
  user: null,
  session: null,
  loading: true,
  unsubscribe: null, // ✅ Guardar referencia para cleanup

  // Inicializar sesión
  initAuth: async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('Error obteniendo sesión:', error)
        set({ loading: false })
        return
      }
      
      set({ 
        user: session?.user || null, 
        session: session,
        loading: false 
      })

      // ✅ Limpieza previa si existe suscripción anterior
      const previousUnsubscribe = get().unsubscribe
      if (previousUnsubscribe && typeof previousUnsubscribe === 'function') {
        previousUnsubscribe()
      }

      // ✅ Escuchar cambios de sesión y guardar referencia de cleanup
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        set({ 
          user: session?.user || null, 
          session: session 
        })
      })
      
      // ✅ Guardar función de unsubscribe en el estado
      set({ unsubscribe: () => subscription?.unsubscribe() })
      
    } catch (error) {
      console.error('Error al inicializar auth:', error)
      set({ loading: false })
    }
  },

  // Login
  login: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error

    set({ user: data.user, session: data.session })
    return data
  },

  // Logout
  logout: async () => {
    try {
      await supabase.auth.signOut()
      // ✅ Limpiar suscripción al hacer logout
      const unsubscribe = get().unsubscribe
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe()
      }
      set({ user: null, session: null, unsubscribe: null })
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
      throw error
    }
  },
  
  // ✅ Método para cleanup manual (útil en React.StrictMode o tests)
  cleanup: () => {
    const unsubscribe = get().unsubscribe
    if (unsubscribe && typeof unsubscribe === 'function') {
      unsubscribe()
      set({ unsubscribe: null })
    }
  }
}))

export default useAuthStore