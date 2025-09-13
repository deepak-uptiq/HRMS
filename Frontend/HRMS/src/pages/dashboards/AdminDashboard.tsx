import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../state/useAuth.tsx'


export default function AdminDashboard() {
  const { api } = useAuth()
  const [stats, setStats] = useState({
    pendingApprovals: 0,
    activeUsers: 0,
    totalUsers: 0,
    announcements: 0
  })
  const [loading, setLoading] = useState(true)

  // Using authenticated API instance from useAuth

  useEffect(() => {
    loadStats()
  }, [])

  async function loadStats() {
    try {
      const [pendingRes, usersRes] = await Promise.all([
        api.get('/api/v1/users/pending'),
        api.get('/api/v1/users')
      ])
      
      const users = usersRes.data.data
      const activeUsers = users.filter((u: any) => u.isActive && u.approvalStatus === 'APPROVED').length
      
      setStats({
        pendingApprovals: pendingRes.data.data.length,
        activeUsers,
        totalUsers: users.length,
        announcements: 0 // Will implement later
      })
    } catch (error) {
      console.error('Failed to load stats:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-y-auto">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-2 left-2 z-50">
        <button
          type="button"
          className="p-2 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 shadow-lg"
          onClick={() => {/* Mobile menu toggle */}}
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
      </div>

      {/* Header Section */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-0">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent dark:from-purple-400 dark:to-blue-400">
                Admin Dashboard
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
                System administration and user management center
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-gray-700 dark:to-gray-600 px-4 py-3 rounded-xl border border-purple-200 dark:border-gray-600">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">System Status:</span>
                  <span className="text-sm font-semibold text-green-600 dark:text-green-400">Online</span>
                </div>
              </div>
              <button 
                onClick={loadStats}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Refresh Data</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-0">
      
        {/* Stats Cards */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">System Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 group hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Approvals</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{loading ? "..." : stats.pendingApprovals}</p>
                  <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">New user requests</p>
                </div>
                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-3 rounded-xl group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 group hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Users</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{loading ? "..." : stats.activeUsers}</p>
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1">Approved and active</p>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-3 rounded-xl group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 group hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{loading ? "..." : stats.totalUsers}</p>
                  <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">All registered users</p>
                </div>
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-xl group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 group hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">System Health</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">100%</p>
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1">All systems operational</p>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-3 rounded-xl group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {stats.pendingApprovals > 0 
                ? `${stats.pendingApprovals} new user registration${stats.pendingApprovals > 1 ? 's' : ''} pending approval`
                : 'No recent activity'
              }
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl border p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <Link
              to="/admin/users"
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm block transition-colors"
            >
              Review pending users {stats.pendingApprovals > 0 && `(${stats.pendingApprovals})`}
            </Link>
            <Link
              to="/admin/announcements"
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm block transition-colors"
            >
              Manage announcements
            </Link>
            <Link
              to="/admin/settings"
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm block transition-colors"
            >
              Company settings
            </Link>
            <Link
              to="/admin/audit"
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm block transition-colors"
            >
              View audit logs
            </Link>
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}