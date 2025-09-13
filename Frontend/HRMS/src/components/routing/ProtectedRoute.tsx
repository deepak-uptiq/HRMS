import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../state/useAuth.tsx'

type Props = {
  children: ReactNode
  allowedRoles: Array<'ADMIN' | 'HR' | 'EMPLOYEE'>
}

export default function ProtectedRoute({ children, allowedRoles }: Props) {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (user && !allowedRoles.includes(user.role)) return <Navigate to="/login" replace />
  return <>{children}</>
}


