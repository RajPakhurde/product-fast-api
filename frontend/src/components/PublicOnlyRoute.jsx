import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function PublicOnlyRoute() {
  const { user, checkingSession } = useAuth()

  if (checkingSession) {
    return <p className="app-loading">Loading session…</p>
  }

  if (user) {
    return <Navigate to="/products" replace />
  }

  return <Outlet />
}
