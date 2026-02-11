import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAppSelector } from '../../hooks/useStore'

interface ProtectedRouteProps {
  children: ReactNode
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation()
  const { user, hydrateStatus } = useAppSelector((state) => state.auth)

  if (hydrateStatus === 'loading') {
    return <div className="state-container">Loading session...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <>{children}</>
}

export default ProtectedRoute
