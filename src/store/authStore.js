import { create } from 'zustand'
import { supabase } from '../lib/supabase'

const useAuthStore = create((set) => ({
  user: null,
  session: null,
  loading: true,

  // Inicializar sesión
  initAuth: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      set({ 
        user: session?.user || null, 
        session: session,
        loading: false 
      })

      // Escuchar cambios de sesión
      supabase.auth.onAuthStateChange((_event, session) => {
        set({ 
          user: session?.user || null, 
          session: session 
        })
      })
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
    await supabase.auth.signOut()
    set({ user: null, session: null })
  },
}))

export default useAuthStore