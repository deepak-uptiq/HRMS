import { type ReactNode, useState } from 'react'
import { useAuth } from '../../state/useAuth.tsx'
import Sidebar from './Sidebar.tsx'

type Props = {
  children: ReactNode
}

export default function Layout({ children }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user } = useAuth()

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} user={user} />
      
      {/* Main content */}
      <div className="lg:pl-64">
        {/* Page content - positioned at very top */}
        <main className="pt-0">
          {children}
        </main>
      </div>
    </div>
  )
}
