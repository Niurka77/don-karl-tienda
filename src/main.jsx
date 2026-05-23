import React, { useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import useAuthStore from './store/authStore'

// ✅ Componente wrapper para inicializar auth DENTRO del árbol de React
const AppWithAuth = () => {
  useEffect(() => {
    // Inicializar auth solo una vez al montar
    useAuthStore.getState().initAuth()
    
    // ✅ Cleanup: remover suscripción al desmontar
    return () => {
      useAuthStore.getState().cleanup?.()
    }
  }, [])

  return <App />
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppWithAuth />
    </BrowserRouter>
  </React.StrictMode>,
)