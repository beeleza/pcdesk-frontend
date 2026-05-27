import { Navigate, Outlet } from 'react-router'
import { useAuth } from '../contexts/AuthContext'

export default function PrivateRoute() {
  const { token } = useAuth()
  return token ? <Outlet /> : <Navigate to="/login" replace />
}
