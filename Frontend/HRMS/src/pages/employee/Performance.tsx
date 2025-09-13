import { useState, useEffect } from 'react'
import { useAuth } from '../../state/useAuth.tsx'

type PerformanceReview = {
  id: string
  period: string
  goals: string
  achievements: string
  rating: number
  comments: string
  status: string
  createdAt: string
  reviewedBy?: string
  reviewer?: {
    username: string
    email: string
  }
}

export default function Performance() {
  const { api } = useAuth()
  const [reviews, setReviews] = useState<PerformanceReview[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    loadPerformanceReviews()
  }, [])

  async function loadPerformanceReviews() {
    try {
      setLoading(true)
      const response = await api.get('/api/v1/employee/performance-reviews')
      setReviews(response.data.data)
    } catch (error) {
      console.error('Failed to load performance reviews:', error)
      setMessage({ type: 'error', text: 'Failed to load performance reviews' })
    } finally {
      setLoading(false)
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'COMPLETED': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'CANCELLED': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  function getRatingColor(rating: number) {
    if (rating >= 4.5) return 'text-green-600 dark:text-green-400'
    if (rating >= 3.5) return 'text-blue-600 dark:text-blue-400'
    if (rating >= 2.5) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  function getRatingLabel(rating: number) {
    if (rating >= 4.5) return 'Excellent'
    if (rating >= 3.5) return 'Good'
    if (rating >= 2.5) return 'Satisfactory'
    if (rating >= 1.5) return 'Needs Improvement'
    return 'Poor'
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border p-6">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Performance Reviews</h1>
        <p className="text-gray-600 dark:text-gray-400">View your performance evaluations and feedback</p>
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

      {/* Performance Reviews List */}
      <div className="space-y-6">
        {reviews.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl border p-8 text-center">
            <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">📊</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No performance reviews</h3>
            <p className="text-gray-500 dark:text-gray-400">You don't have any performance reviews yet.</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="bg-white dark:bg-gray-800 rounded-xl border p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Performance Review - {review.period}
                  </h3>
                  <div className="flex items-center space-x-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(review.status)}`}>
                      {review.status}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Created: {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`text-2xl font-bold ${getRatingColor(review.rating)}`}>
                    {review.rating.toFixed(1)}/5.0
                  </div>
                  <div className={`text-sm font-medium ${getRatingColor(review.rating)}`}>
                    {getRatingLabel(review.rating)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Goals</h4>
                  <p className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    {review.goals}
                  </p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Achievements</h4>
                  <p className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    {review.achievements}
                  </p>
                </div>
              </div>

              {review.comments && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Manager Comments</h4>
                  <p className="text-sm text-gray-900 dark:text-white bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                    {review.comments}
                  </p>
                </div>
              )}

              {review.reviewer && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Reviewed by: {review.reviewer?.username || 'N/A'}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Performance Summary */}
      {reviews.length > 0 && (
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl border p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Performance Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {reviews.length}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Total Reviews</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getRatingColor(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length)}`}>
                {(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Average Rating</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {reviews.filter(r => r.status === 'COMPLETED').length}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {reviews.filter(r => r.status === 'PENDING' || r.status === 'IN_PROGRESS').length}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">In Progress</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
