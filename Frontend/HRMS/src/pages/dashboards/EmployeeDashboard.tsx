

import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '../../state/useAuth.tsx'
import RAGAssistant from '../../components/RAGAssistant'

type EmployeeStats = {
  totalLeaves: number
  pendingLeaves: number
  approvedLeaves: number
  totalPayslips: number
}

export default function EmployeeDashboard() {
  const { user, api } = useAuth()
  const [stats, setStats] = useState<EmployeeStats>({
    totalLeaves: 0,
    pendingLeaves: 0,
    approvedLeaves: 0,
    totalPayslips: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  async function loadDashboardData() {
    try {
      setLoading(true)
      setError(null)

      // Fetch employee data using employee-specific endpoints
      const [leavesRes, payslipsRes] = await Promise.all([
        api.get('/api/v1/employee/leaves').catch(() => ({ data: { data: [] } })),
        api.get('/api/v1/employee/payslips').catch(() => ({ data: { data: [] } }))
      ])

      const leaves = leavesRes.data.data || []
      const payslips = payslipsRes.data.data || []

      setStats({
        totalLeaves: leaves.length,
        pendingLeaves: leaves.filter((l: any) => l.status === 'PENDING').length,
        approvedLeaves: leaves.filter((l: any) => l.status === 'APPROVED').length,
        totalPayslips: payslips.length
      })
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border p-6">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Error loading dashboard
              </h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                {error}
              </div>
              <div className="mt-4">
                <button
                  onClick={loadDashboardData}
                  className="bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200 px-3 py-2 rounded-md text-sm font-medium hover:bg-red-200 dark:hover:bg-red-700"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-y-auto">
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
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent dark:from-green-400 dark:to-blue-400">
                Employee Dashboard
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
                Welcome back, <span className="font-semibold text-gray-900 dark:text-white">{user?.username}</span>! Here's your personal overview.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-gray-700 dark:to-gray-600 px-4 py-3 rounded-xl border border-green-200 dark:border-gray-600">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
                  <span className="text-sm font-semibold text-green-600 dark:text-green-400">Active</span>
                </div>
              </div>
              <button 
                onClick={loadDashboardData}
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Your Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 group hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Leaves</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.totalLeaves}</p>
                  <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">All time</p>
                </div>
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-xl group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 group hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Leaves</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.pendingLeaves}</p>
                  <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">Awaiting approval</p>
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Approved Leaves</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.approvedLeaves}</p>
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1">This year</p>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-3 rounded-xl group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 group hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Payslips</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.totalPayslips}</p>
                  <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">Available</p>
                </div>
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-xl group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link
              to="/employee/profile"
              className="flex items-center p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-400 text-lg">👤</span>
                </div>
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-900 dark:text-white">Update Profile</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Manage your personal information</div>
              </div>
            </Link>
            
            <Link
              to="/employee/leaves"
              className="flex items-center p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 dark:text-green-400 text-lg">📝</span>
                </div>
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-900 dark:text-white">Request Leave</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Submit a new leave request</div>
              </div>
            </Link>
            
            <Link
              to="/employee/payslips"
              className="flex items-center p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                  <span className="text-purple-600 dark:text-purple-400 text-lg">💳</span>
                </div>
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-900 dark:text-white">View Payslips</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Download your salary slips</div>
              </div>
            </Link>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
              <span>Welcome to your employee dashboard!</span>
            </div>
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
              <span>Your profile is set up and ready to use.</span>
            </div>
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></div>
              <span>You can now request leaves and view payslips.</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border p-6">
          <RAGAssistant />
        </div>
      </div>
      </div>
    </div>
  )
}