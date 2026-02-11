import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAppSelector } from '../../hooks/useStore'

interface AdminRouteProps {
  children: ReactNode
}

function AdminRoute({ children }: AdminRouteProps) {
  const { user, hydrateStatus } = useAppSelector((state) => state.auth)

  if (hydrateStatus === 'loading') {
    return <div className="state-container">Loading session...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (user.role !== 'admin') {
    return (
      <div className="state-container">
        <h1>Admin access required</h1>
        <p>Your current account does not have administrator privileges.</p>
      </div>
    )
  }

  return <>{children}</>
}

export default AdminRoute
