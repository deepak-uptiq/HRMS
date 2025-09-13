import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '../../state/useAuth.tsx'

type DashboardStats = {
  totalEmployees: number
  pendingLeaves: number
  payrollTasks: number
  performanceReviews: number
}

type LeaveRequest = {
  id: string
  startDate: string
  endDate: string
  type: string
  status: string
  employee: {
    firstName: string
    lastName: string
  }
}

export default function HRDashboard() {
  const { api } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    pendingLeaves: 0,
    payrollTasks: 0,
    performanceReviews: 0
  })
  const [recentLeaves, setRecentLeaves] = useState<LeaveRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Using authenticated API instance from useAuth

  useEffect(() => {
    loadDashboardData()
  }, [])

  async function loadDashboardData() {
    try {
      setLoading(true)
      setError(null)

      // Fetch all data in parallel
      const [employeesRes, leavesRes, performanceRes] = await Promise.all([
        api.get('/api/v1/employees').catch(() => ({ data: { data: [] } })),
        api.get('/api/v1/leaves?status=PENDING').catch(() => ({ data: { data: [] } })),
        api.get('/api/v1/performance-reviews?status=PENDING').catch(() => ({ data: { data: [] } }))
      ])

      const employees = employeesRes.data.data || []
      const pendingLeaves = leavesRes.data.data || []
      const draftReviews = performanceRes.data.data || []

      setStats({
        totalEmployees: employees.filter((emp: any) => emp.isActive).length,
        pendingLeaves: pendingLeaves.length,
        payrollTasks: 0, // Will be calculated based on current month
        performanceReviews: draftReviews.length
      })

      // Set recent leave requests (last 5)
      setRecentLeaves(pendingLeaves.slice(0, 5))

    } catch (error) {
      console.error('Failed to load dashboard data:', error)
      setError('Failed to load dashboard data. Please check if the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
              <button 
                onClick={loadDashboardData}
                className="mt-2 text-sm bg-red-100 dark:bg-red-800 hover:bg-red-200 dark:hover:bg-red-700 px-3 py-1 rounded transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }


  return (

<div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-y-auto">
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
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400">
                HR Dashboard
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
                Welcome back! Here's what's happening in your organization today.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 px-4 py-3 rounded-xl border border-blue-200 dark:border-gray-600">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Last updated:</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {new Date().toLocaleTimeString()}
                  </span>
                </div>
              </div>
              <button 
                onClick={loadDashboardData}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 group hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Employees</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.totalEmployees}</p>
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1">Active employees</p>
                </div>
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-xl group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 group hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Payroll Tasks</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.payrollTasks}</p>
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1">This month</p>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-3 rounded-xl group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 group hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Performance Reviews</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.performanceReviews}</p>
                  <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">Due this quarter</p>
                </div>
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-xl group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Leave Requests */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Recent Leave Requests</h3>
                <Link 
                  to="/hr/leave" 
                  className="text-white/80 hover:text-white text-sm font-medium transition-colors"
                >
                  View all →
                </Link>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentLeaves.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400">No pending requests</p>
                  </div>
                ) : (
                  recentLeaves.map((leave) => (
                    <div key={leave.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-700 dark:to-gray-600 rounded-xl border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {(leave.employee.firstName || 'N')[0]}{(leave.employee.lastName || 'A')[0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {leave.employee.firstName || 'N/A'} {leave.employee.lastName || 'N/A'}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {leave.type} • {new Date(leave.startDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                        {leave.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        
          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4">
              <h3 className="text-xl font-bold text-white">Quick Actions</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link
                  to="/hr/employees"
                  className="group p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-gray-700 dark:to-gray-600 rounded-xl border border-blue-200 dark:border-gray-600 hover:shadow-lg transition-all duration-200 hover:scale-105"
                >
                  <div className="flex items-center space-x-3">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-2 rounded-lg group-hover:scale-110 transition-transform">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">Manage Employees</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Add, edit, or view records</div>
                    </div>
                  </div>
                </Link>

                <Link
                  to="/hr/leave"
                  className="group p-4 bg-gradient-to-r from-yellow-50 to-orange-100 dark:from-gray-700 dark:to-gray-600 rounded-xl border border-yellow-200 dark:border-gray-600 hover:shadow-lg transition-all duration-200 hover:scale-105"
                >
                  <div className="flex items-center space-x-3">
                    <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-2 rounded-lg group-hover:scale-110 transition-transform">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">Review Leaves</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Approve or reject requests</div>
                    </div>
                  </div>
                </Link>

                <Link
                  to="/hr/payroll"
                  className="group p-4 bg-gradient-to-r from-green-50 to-emerald-100 dark:from-gray-700 dark:to-gray-600 rounded-xl border border-green-200 dark:border-gray-600 hover:shadow-lg transition-all duration-200 hover:scale-105"
                >
                  <div className="flex items-center space-x-3">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-2 rounded-lg group-hover:scale-110 transition-transform">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">Generate Payslips</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Create and manage payslips</div>
                    </div>
                  </div>
                </Link>

                <Link
                  to="/hr/reviews"
                  className="group p-4 bg-gradient-to-r from-purple-50 to-pink-100 dark:from-gray-700 dark:to-gray-600 rounded-xl border border-purple-200 dark:border-gray-600 hover:shadow-lg transition-all duration-200 hover:scale-105"
                >
                  <div className="flex items-center space-x-3">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg group-hover:scale-110 transition-transform">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">Performance Reviews</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Conduct evaluations</div>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}