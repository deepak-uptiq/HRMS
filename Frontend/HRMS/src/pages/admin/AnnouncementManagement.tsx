import { useEffect, useState } from 'react'
import { useAuth } from '../../state/useAuth.tsx'

type Announcement = {
  id: string
  title: string
  content: string
  type: 'INFO' | 'WARNING' | 'URGENT'
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  isActive: boolean
  endDate?: string
  createdAt: string
  createdByUser: {
    username: string
  }
}

export default function AnnouncementManagement() {
  const { api } = useAuth()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'INFO' as 'INFO' | 'WARNING' | 'URGENT',
    priority: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH',
    endDate: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null)

  // Using authenticated API instance from useAuth

  useEffect(() => {
    loadAnnouncements()
  }, [])

  async function loadAnnouncements() {
    try {
      const response = await api.get('/api/v1/announcements')
      setAnnouncements(response.data.data)
    } catch (error) {
      console.error('Failed to load announcements:', error)
      setMessage({ type: 'error', text: 'Failed to load announcements' })
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
        ...formData,
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null
      }

      if (editingId) {
        await api.put(`/api/v1/announcements/${editingId}`, payload)
        setMessage({ type: 'success', text: 'Announcement updated successfully' })
      } else {
        await api.post('/api/v1/announcements', payload)
        setMessage({ type: 'success', text: 'Announcement created successfully' })
      }

      resetForm()
      loadAnnouncements()
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save announcement' })
    } finally {
      setSaving(false)
    }
  }

  async function deleteAnnouncement(id: string) {
    if (!confirm('Are you sure you want to delete this announcement?')) return

    try {
      await api.delete(`/api/v1/announcements/${id}`)
      setMessage({ type: 'success', text: 'Announcement deleted successfully' })
      loadAnnouncements()
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete announcement' })
    }
  }

  async function toggleStatus(id: string, isActive: boolean) {
    try {
      await api.patch(`/api/v1/announcements/${id}`, { isActive: !isActive })
      loadAnnouncements()
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update announcement status' })
    }
  }

  function startEdit(announcement: Announcement) {
    setEditingId(announcement.id)
    setFormData({
      title: announcement.title,
      content: announcement.content,
      type: announcement.type,
      priority: announcement.priority,
      endDate: announcement.endDate ? announcement.endDate.split('T')[0] : ''
    })
    setShowForm(true)
  }

  function resetForm() {
    setEditingId(null)
    setFormData({
      title: '',
      content: '',
      type: 'INFO',
      priority: 'MEDIUM',
      endDate: ''
    })
    setShowForm(false)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  function getTypeColor(type: string) {
    switch (type) {
      case 'INFO': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'WARNING': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'URGENT': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  function getPriorityColor(priority: string) {
    switch (priority) {
      case 'HIGH': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'LOW': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading announcements...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Announcements</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage company-wide announcements</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-primary-600 hover:bg-primary-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
        >
          Create Announcement
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

      {/* Create/Edit Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {editingId ? 'Edit Announcement' : 'Create New Announcement'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Content
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                rows={4}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="INFO">Info</option>
                  <option value="WARNING">Warning</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Priority
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  End Date (Optional)
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={saving}
                className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium px-4 py-2 rounded-lg transition-colors"
              >
                {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
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

      {/* Announcements List */}
      <div className="space-y-4">
        {announcements.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl border p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">No announcements yet</p>
          </div>
        ) : (
          announcements.map((announcement) => (
            <div key={announcement.id} className="bg-white dark:bg-gray-800 rounded-xl border p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {announcement.title}
                    </h3>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(announcement.type)}`}>
                      {announcement.type}
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(announcement.priority)}`}>
                      {announcement.priority}
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      announcement.isActive
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                    }`}>
                      {announcement.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-400 mb-3">
                    {announcement.content}
                  </p>
                  
                  <div className="text-sm text-gray-500 dark:text-gray-500">
                    By {announcement.createdByUser.username} • {new Date(announcement.createdAt).toLocaleDateString()}
                    {announcement.endDate && (
                      <span> • Expires: {new Date(announcement.endDate).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => toggleStatus(announcement.id, announcement.isActive)}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${
                      announcement.isActive
                        ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    {announcement.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => startEdit(announcement)}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteAnnouncement(announcement.id)}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded-md transition-colors"
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
