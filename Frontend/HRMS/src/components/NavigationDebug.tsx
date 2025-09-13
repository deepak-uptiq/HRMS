import { useLocation, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

export default function NavigationDebug() {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    console.log('Current route:', location.pathname)
  }, [location])

  const testRoutes = [
    { path: '/hr', name: 'HR Dashboard' },
    { path: '/hr/employees', name: 'Employees' },
    { path: '/hr/leave', name: 'Leave Management' },
    { path: '/hr/payroll', name: 'Payroll' },
    { path: '/hr/reviews', name: 'Performance Reviews' }
  ]

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-lg">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
        Navigation Debug
      </h3>
      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
        Current: {location.pathname}
      </p>
      <div className="space-y-1">
        {testRoutes.map((route) => (
          <button
            key={route.path}
            onClick={() => {
              console.log('Navigating to:', route.path)
              navigate(route.path)
            }}
            className={`block text-xs px-2 py-1 rounded transition-colors ${
              location.pathname === route.path
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            {route.name}
          </button>
        ))}
      </div>
    </div>
  )
}
