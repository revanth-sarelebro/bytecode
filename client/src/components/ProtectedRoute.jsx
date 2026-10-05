import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { HOME } from '../lib/status'

// UI guard only. The server must enforce the same rules on every endpoint.
export default function ProtectedRoute({ roles }) {
  const { user, loading } = useAuth()

  if (loading) return <p className="p-8 text-muted">Checking your session…</p>
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to={HOME[user.role]} replace />
  return <Outlet />
}
