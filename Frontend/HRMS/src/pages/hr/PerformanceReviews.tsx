import { useEffect, useState } from 'react'
import { useAuth } from '../../state/useAuth.tsx'

type PerformanceReview = {
  id: string
  period: string
  rating: number
  goals: any[]
  achievements: any[]
  comments: string
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  createdAt: string
  updatedAt: string
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
  reviewer?: {
    username: string
  }
}

type Employee = {
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

export default function PerformanceReviews() {
  const { api } = useAuth()
  const [reviews, setReviews] = useState<PerformanceReview[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'>('ALL')
  const [formData, setFormData] = useState({
    employeeId: '',
    reviewPeriodStart: '',
    reviewPeriodEnd: '',
    overallRating: '5',
    goals: '',
    achievements: '',
    areasForImprovement: '',
    feedback: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null)

  // Using authenticated API instance from useAuth

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setLoading(true)
      const [reviewsRes, employeesRes] = await Promise.all([
        api.get('/api/v1/performance-reviews'),
        api.get('/api/v1/employees?isActive=true')
      ])
      
      setReviews(reviewsRes.data.data)
      setEmployees(employeesRes.data.data)
    } catch (error) {
      console.error('Failed to load performance reviews:', error)
      setMessage({ type: 'error', text: 'Failed to load performance reviews' })
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const payload = {
        employeeId: formData.employeeId,
        period: `${formData.reviewPeriodStart} to ${formData.reviewPeriodEnd}`,
        goals: formData.goals ? [{
          title: "Goals",
          description: formData.goals,
          targetDate: formData.reviewPeriodEnd,
          weight: 100
        }] : [],
        achievements: formData.achievements ? [{
          title: "Achievements",
          description: formData.achievements,
          impact: "Positive impact on performance"
        }] : [],
        rating: parseInt(formData.overallRating),
        comments: formData.feedback
      }

      if (editingId) {
        await api.put(`/api/v1/performance-reviews/${editingId}`, payload)
        setMessage({ type: 'success', text: 'Performance review updated successfully' })
      } else {
        await api.post('/api/v1/performance-reviews', payload)
        setMessage({ type: 'success', text: 'Performance review created successfully' })
      }

      resetForm()
      loadData()
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to save performance review' 
      })
    } finally {
      setSaving(false)
    }
  }

  async function updateStatus(id: string, status: string) {
    try {
      await api.patch(`/api/v1/performance-reviews/${id}`, { status })
      setMessage({ type: 'success', text: `Review ${status.toLowerCase()} successfully` })
      loadData()
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update review status' })
    }
  }

  async function deleteReview(id: string) {
    if (!confirm('Are you sure you want to delete this performance review?')) return

    try {
      await api.delete(`/api/v1/performance-reviews/${id}`)
      setMessage({ type: 'success', text: 'Performance review deleted successfully' })
      loadData()
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete performance review' })
    }
  }

  function startEdit(review: PerformanceReview) {
    setEditingId(review.id)
    // Parse period string (format: "2025-01-01 to 2025-01-31")
    const periodParts = review.period ? review.period.split(' to ') : ['', '']
    setFormData({
      employeeId: review.employee.id,
      reviewPeriodStart: periodParts[0] || '',
      reviewPeriodEnd: periodParts[1] || '',
      overallRating: review.rating?.toString() || '5',
      goals: Array.isArray(review.goals) ? review.goals[0]?.description || '' : review.goals || '',
      achievements: Array.isArray(review.achievements) ? review.achievements[0]?.description || '' : review.achievements || '',
      areasForImprovement: '',
      feedback: review.comments || ''
    })
    setShowForm(true)
  }

  function resetForm() {
    setEditingId(null)
    setFormData({
      employeeId: '',
      reviewPeriodStart: '',
      reviewPeriodEnd: '',
      overallRating: '5',
      goals: '',
      achievements: '',
      areasForImprovement: '',
      feedback: ''
    })
    setShowForm(false)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'PENDING': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'COMPLETED': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  function getRatingColor(rating: number) {
    if (rating >= 4) return 'text-green-600 dark:text-green-400'
    if (rating >= 3) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  function renderStars(rating: number) {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))
  }

  const filteredReviews = reviews.filter(review => {
    if (filter === 'ALL') return true
    return review.status === filter
  })

  const stats = {
    total: reviews.length,
    pending: reviews.filter(r => r.status === 'PENDING').length,
    inProgress: reviews.filter(r => r.status === 'IN_PROGRESS').length,
    completed: reviews.filter(r => r.status === 'COMPLETED').length,
    avgRating: reviews.length > 0 
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
      : 0
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading performance reviews...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Performance Reviews</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage employee performance evaluations</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-primary-600 hover:bg-primary-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
        >
          Create Review
        </button>
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
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Reviews</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-gray-100 dark:bg-gray-700">
              <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
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
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">In Progress</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.inProgress}</p>
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
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.completed}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900">
              <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Rating</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {stats.avgRating.toFixed(1)}/5
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {['ALL', 'PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map((status) => (
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

      {/* Create/Edit Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {editingId ? 'Edit Performance Review' : 'Create New Performance Review'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Employee
                </label>
                <select
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Employee</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.employeeId} - {emp.firstName || 'N/A'} {emp.lastName || 'N/A'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Review Period Start
                </label>
                <input
                  type="date"
                  name="reviewPeriodStart"
                  value={formData.reviewPeriodStart}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Review Period End
                </label>
                <input
                  type="date"
                  name="reviewPeriodEnd"
                  value={formData.reviewPeriodEnd}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Overall Rating
                </label>
                <select
                  name="overallRating"
                  value={formData.overallRating}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  <option value="1">1 - Poor</option>
                  <option value="2">2 - Fair</option>
                  <option value="3">3 - Good</option>
                  <option value="4">4 - Very Good</option>
                  <option value="5">5 - Excellent</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Goals
                </label>
                <textarea
                  name="goals"
                  value={formData.goals}
                  onChange={handleChange}
                  rows={4}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Describe the goals set for this review period..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Achievements
                </label>
                <textarea
                  name="achievements"
                  value={formData.achievements}
                  onChange={handleChange}
                  rows={4}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="List the employee's key achievements..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Areas for Improvement
                </label>
                <textarea
                  name="areasForImprovement"
                  value={formData.areasForImprovement}
                  onChange={handleChange}
                  rows={4}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Identify areas where the employee can improve..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Overall Feedback
                </label>
                <textarea
                  name="feedback"
                  value={formData.feedback}
                  onChange={handleChange}
                  rows={4}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Provide overall feedback and comments..."
                  required
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={saving}
                className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium px-4 py-2 rounded-lg transition-colors"
              >
                {saving ? 'Saving...' : editingId ? 'Update Review' : 'Create Review'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium px-4 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl border p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              No {filter.toLowerCase()} performance reviews found
            </p>
          </div>
        ) : (
          filteredReviews.map((review) => (
            <div key={review.id} className="bg-white dark:bg-gray-800 rounded-xl border p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {review.employee.firstName || 'N/A'} {review.employee.lastName || 'N/A'}
                    </h3>
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(review.status)}`}>
                      {review.status}
                    </span>
                    <div className="flex items-center space-x-1">
                      {renderStars(review.rating)}
                      <span className={`ml-2 font-medium ${getRatingColor(review.rating)}`}>
                        {review.rating}/5
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Employee</p>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {review.employee.employeeId} • {review.employee.department?.name || 'N/A'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {review.employee.position?.title || 'N/A'}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Review Period</p>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {review.period}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Reviewer</p>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {review.reviewer ? review.reviewer.username : 'Not assigned'}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Completion</p>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {review.status === 'COMPLETED' ? new Date(review.updatedAt).toLocaleDateString() : 'Pending'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Goals</p>
                      <p className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                        {Array.isArray(review.goals) ? review.goals.map(g => g.description).join(', ') : review.goals || 'N/A'}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Achievements</p>
                      <p className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                        {Array.isArray(review.achievements) ? review.achievements.map(a => a.description).join(', ') : review.achievements || 'N/A'}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Areas for Improvement</p>
                      <p className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                        N/A
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Overall Feedback</p>
                      <p className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                        {review.comments || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="ml-6 flex flex-col space-y-2">
                  {review.status === 'PENDING' && (
                    <button
                      onClick={() => updateStatus(review.id, 'IN_PROGRESS')}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-3 py-1 rounded text-sm transition-colors"
                    >
                      Submit
                    </button>
                  )}
                  {review.status === 'IN_PROGRESS' && (
                    <button
                      onClick={() => updateStatus(review.id, 'COMPLETED')}
                      className="bg-green-600 hover:bg-green-700 text-white font-medium px-3 py-1 rounded text-sm transition-colors"
                    >
                      Complete
                    </button>
                  )}
                  <button
                    onClick={() => startEdit(review)}
                    className="bg-gray-600 hover:bg-gray-700 text-white font-medium px-3 py-1 rounded text-sm transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteReview(review.id)}
                    className="bg-red-600 hover:bg-red-700 text-white font-medium px-3 py-1 rounded text-sm transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
