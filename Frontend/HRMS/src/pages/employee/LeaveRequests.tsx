import { useState, useEffect } from 'react'
import { useAuth } from '../../state/useAuth.tsx'

type LeaveRequest = {
  id: string
  type: string
  startDate: string
  endDate: string
  reason: string
  status: string
  createdAt: string
  approvedBy?: string
  reviewComment?: string
}

export default function LeaveRequests() {
  const { api } = useAuth()
  const [leaves, setLeaves] = useState<LeaveRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [formData, setFormData] = useState({
    type: 'VACATION',
    startDate: '',
    endDate: '',
    reason: ''
  })

  useEffect(() => {
    loadLeaves()
  }, [])

  async function loadLeaves() {
    try {
      setLoading(true)
      const response = await api.get('/api/v1/employee/leaves')
      setLeaves(response.data.data)
    } catch (error) {
      console.error('Failed to load leaves:', error)
      setMessage({ type: 'error', text: 'Failed to load leave requests' })
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      setMessage(null)
      await api.post('/api/v1/employee/leaves', formData)
      
      setMessage({ type: 'success', text: 'Leave request submitted successfully!' })
      setShowForm(false)
      setFormData({ type: 'VACATION', startDate: '', endDate: '', reason: '' })
      loadLeaves()
    } catch (error) {
      console.error('Failed to submit leave request:', error)
      setMessage({ type: 'error', text: 'Failed to submit leave request' })
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'APPROVED': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'REJECTED': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  function getTypeColor(type: string) {
    switch (type) {
      case 'VACATION': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'SICK': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'PERSONAL': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border p-6">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Leave Requests</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your leave requests and view their status</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Request Leave
        </button>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
        }`}>
          <div className="flex">
            <div className="ml-3">
              <p className={`text-sm font-medium ${
                message.type === 'success' 
                  ? 'text-green-800 dark:text-green-200' 
                  : 'text-red-800 dark:text-red-200'
              }`}>
                {message.text}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Leave Request Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Request Leave</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Leave Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="VACATION">Vacation</option>
                  <option value="SICK">Sick Leave</option>
                  <option value="PERSONAL">Personal</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reason
                </label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Please provide a reason for your leave request..."
                  required
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Leave Requests List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border">
        {leaves.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">📅</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No leave requests</h3>
            <p className="text-gray-500 dark:text-gray-400">You haven't submitted any leave requests yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {leaves.map((leave) => (
              <div key={leave.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(leave.type)}`}>
                        {leave.type}
                      </span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(leave.status)}`}>
                        {leave.status}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <span className="font-medium">
                        {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                      </span>
                      <span className="mx-2">•</span>
                      <span>
                        {Math.ceil((new Date(leave.endDate).getTime() - new Date(leave.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1} days
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-900 dark:text-white">{leave.reason}</p>
                    
                    {leave.reviewComment && (
                      <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Review Comment:</span> {leave.reviewComment}
                      </div>
                    )}
                  </div>
                  
                  <div className="text-right text-sm text-gray-500 dark:text-gray-400">
                    <div>Submitted</div>
                    <div>{new Date(leave.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
