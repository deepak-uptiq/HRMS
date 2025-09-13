import { useEffect, useState } from 'react'
import { useAuth } from '../../state/useAuth.tsx'

type Leave = {
  id: string
  startDate: string
  endDate: string
  type: string
  reason: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  appliedAt: string
  reviewedAt?: string
  reviewComment?: string
  employee: {
    id: string
    employeeId: string
    firstName: string
    lastName: string
    department: {
      name: string
    }
    position: {
      title: string
    }
  }
  reviewedBy?: {
    username: string
  }
}

export default function LeaveManagement() {
  const { api } = useAuth()
  const [leaves, setLeaves] = useState<Leave[]>([])
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING')
  const [loading, setLoading] = useState(true)
  const [reviewing, setReviewing] = useState<string | null>(null)
  const [reviewData, setReviewData] = useState({
    status: 'APPROVED' as 'APPROVED' | 'REJECTED',
    comment: ''
  })
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null)

  // Using authenticated API instance from useAuth

  useEffect(() => {
    loadLeaves()
  }, [filter])

  async function loadLeaves() {
    try {
      setLoading(true)
      const params = filter !== 'ALL' ? `?status=${filter}` : ''
      const response = await api.get(`/api/v1/leaves${params}`)
      setLeaves(response.data.data)
    } catch (error) {
      console.error('Failed to load leaves:', error)
      setMessage({ type: 'error', text: 'Failed to load leave requests' })
    } finally {
      setLoading(false)
    }
  }

  async function handleReview(leaveId: string) {
    try {
      await api.patch(`/api/v1/leaves/${leaveId}`, {
        status: reviewData.status,
        reviewComment: reviewData.comment
      })
      
      setMessage({ 
        type: 'success', 
        text: `Leave request ${reviewData.status.toLowerCase()} successfully` 
      })
      
      setReviewing(null)
      setReviewData({ status: 'APPROVED', comment: '' })
      loadLeaves()
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update leave request' })
    }
  }

  function startReview(leaveId: string, currentStatus: string) {
    if (currentStatus === 'PENDING') {
      setReviewing(leaveId)
      setReviewData({ status: 'APPROVED', comment: '' })
    }
  }

  function cancelReview() {
    setReviewing(null)
    setReviewData({ status: 'APPROVED', comment: '' })
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'APPROVED': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'REJECTED': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  function calculateDays(startDate: string, endDate: string) {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
    return diffDays
  }

  const filteredLeaves = leaves.filter(leave => {
    if (filter === 'ALL') return true
    return leave.status === filter
  })

  const stats = {
    total: leaves.length,
    pending: leaves.filter(l => l.status === 'PENDING').length,
    approved: leaves.filter(l => l.status === 'APPROVED').length,
    rejected: leaves.filter(l => l.status === 'REJECTED').length
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading leave requests...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Leave Management</h1>
        <p className="text-gray-600 dark:text-gray-400">Review and manage employee leave requests</p>
      </div>

      {message && (
        <div className={`rounded-lg p-4 ${
          message.type === 'success' 
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400'
            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Requests</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900">
              <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Approved</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.approved}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 dark:bg-red-900">
              <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Rejected</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.rejected}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                filter === status
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              {status.charAt(0) + status.slice(1).toLowerCase()}
              {status !== 'ALL' && (
                <span className="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-300 py-0.5 px-2 rounded-full text-xs">
                  {stats[status.toLowerCase() as keyof typeof stats]}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Leave Requests List */}
      <div className="space-y-4">
        {filteredLeaves.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl border p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              No {filter.toLowerCase()} leave requests found
            </p>
          </div>
        ) : (
          filteredLeaves.map((leave) => (
            <div key={leave.id} className="bg-white dark:bg-gray-800 rounded-xl border p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {leave.employee.firstName || 'N/A'} {leave.employee.lastName || 'N/A'}
                    </h3>
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(leave.status)}`}>
                      {leave.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Employee</p>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {leave.employee.employeeId} • {leave.employee.department?.name || 'N/A'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {leave.employee.position?.title || 'N/A'}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Duration</p>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {calculateDays(leave.startDate, leave.endDate)} day(s)
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Type</p>
                      <p className="text-sm text-gray-900 dark:text-white">{leave.type}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Applied</p>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {new Date(leave.appliedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Reason</p>
                    <p className="text-sm text-gray-900 dark:text-white">{leave.reason}</p>
                  </div>

                  {leave.reviewComment && (
                    <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Review Comment {leave.reviewedBy && `by ${leave.reviewedBy.username}`}
                      </p>
                      <p className="text-sm text-gray-900 dark:text-white">{leave.reviewComment}</p>
                      {leave.reviewedAt && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {new Date(leave.reviewedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="ml-6">
                  {leave.status === 'PENDING' && (
                    <button
                      onClick={() => startReview(leave.id, leave.status)}
                      className="bg-primary-600 hover:bg-primary-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
                    >
                      Review
                    </button>
                  )}
                </div>
              </div>

              {/* Review Form */}
              {reviewing === leave.id && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Review Leave Request</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Decision
                      </label>
                      <div className="flex space-x-4">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="status"
                            value="APPROVED"
                            checked={reviewData.status === 'APPROVED'}
                            onChange={(e) => setReviewData(prev => ({ ...prev, status: e.target.value as any }))}
                            className="mr-2 text-green-600 focus:ring-green-500"
                          />
                          <span className="text-sm text-gray-900 dark:text-white">Approve</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="status"
                            value="REJECTED"
                            checked={reviewData.status === 'REJECTED'}
                            onChange={(e) => setReviewData(prev => ({ ...prev, status: e.target.value as any }))}
                            className="mr-2 text-red-600 focus:ring-red-500"
                          />
                          <span className="text-sm text-gray-900 dark:text-white">Reject</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Comment (Optional)
                      </label>
                      <textarea
                        value={reviewData.comment}
                        onChange={(e) => setReviewData(prev => ({ ...prev, comment: e.target.value }))}
                        rows={3}
                        placeholder="Add a comment about your decision..."
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleReview(leave.id)}
                        className={`font-medium px-4 py-2 rounded-lg transition-colors ${
                          reviewData.status === 'APPROVED'
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-red-600 hover:bg-red-700 text-white'
                        }`}
                      >
                        {reviewData.status === 'APPROVED' ? 'Approve Request' : 'Reject Request'}
                      </button>
                      <button
                        onClick={cancelReview}
                        className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium px-4 py-2 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
