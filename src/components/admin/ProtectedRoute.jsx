import { Navigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore'

const ADMIN_EMAILS = ['karl@tienda.com']

const isAdmin = (user) => {
  if (!user) return false
  return (
    ADMIN_EMAILS.includes(user.email) ||
    user.app_metadata?.role === 'admin' ||
    user.user_metadata?.role === 'admin'
  )
}

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuthStore()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />
  }

  if (!isAdmin(user)) {
    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedRoute