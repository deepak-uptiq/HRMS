import { useEffect, useState } from 'react'
import { useAuth } from '../../state/useAuth.tsx'

type AuditLog = {
  id: string
  action: string
  entity: string
  entityId: string
  oldValues?: any
  newValues?: any
  ipAddress: string
  userAgent: string
  createdAt: string
  user: {
    username: string
    email: string
  }
}

export default function AuditLogs() {
  const { api } = useAuth()
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    action: '',
    entity: '',
    startDate: '',
    endDate: '',
    userId: ''
  })
  const [expandedLog, setExpandedLog] = useState<string | null>(null)

  // Using authenticated API instance from useAuth

  useEffect(() => {
    loadAuditLogs()
  }, [])

  async function loadAuditLogs() {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      if (filters.action) params.append('action', filters.action)
      if (filters.entity) params.append('entity', filters.entity)
      if (filters.startDate) params.append('startDate', filters.startDate)
      if (filters.endDate) params.append('endDate', filters.endDate)
      if (filters.userId) params.append('userId', filters.userId)

      const response = await api.get(`/api/v1/audit-logs?${params.toString()}`)
      setLogs(response.data.data)
    } catch (error) {
      console.error('Failed to load audit logs:', error)
    } finally {
      setLoading(false)
    }
  }

  function handleFilterChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setFilters(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  function handleSearch() {
    loadAuditLogs()
  }

  function clearFilters() {
    setFilters({
      action: '',
      entity: '',
      startDate: '',
      endDate: '',
      userId: ''
    })
    // Reload without filters
    setTimeout(loadAuditLogs, 100)
  }

  function getActionColor(action: string) {
    switch (action.toLowerCase()) {
      case 'create': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'update': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'delete': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'login': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  function formatJsonValue(value: any) {
    if (!value) return 'N/A'
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2)
    }
    return value.toString()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading audit logs...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Audit Logs</h1>
        <p className="text-gray-600 dark:text-gray-400">Track all system activities and changes</p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Filters</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Action
            </label>
            <select
              name="action"
              value={filters.action}
              onChange={handleFilterChange}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">All Actions</option>
              <option value="CREATE">Create</option>
              <option value="UPDATE">Update</option>
              <option value="DELETE">Delete</option>
              <option value="LOGIN">Login</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Entity
            </label>
            <select
              name="entity"
              value={filters.entity}
              onChange={handleFilterChange}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">All Entities</option>
              <option value="User">User</option>
              <option value="Employee">Employee</option>
              <option value="Leave">Leave</option>
              <option value="Announcement">Announcement</option>
              <option value="Company">Company</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Start Date
            </label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              End Date
            </label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-end space-x-2">
            <button
              onClick={handleSearch}
              className="bg-primary-600 hover:bg-primary-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors"
            >
              Search
            </button>
            <button
              onClick={clearFilters}
              className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Audit Logs List */}
      <div className="space-y-4">
        {logs.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl border p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">No audit logs found</p>
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="bg-white dark:bg-gray-800 rounded-xl border">
              <div 
                className="p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getActionColor(log.action)}`}>
                      {log.action}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {log.entity} #{log.entityId}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        by {log.user.username} • {new Date(log.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-gray-400">
                    <svg className={`w-5 h-5 transition-transform ${expandedLog === log.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {expandedLog === log.id && (
                <div className="px-6 pb-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="pt-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Details</h4>
                      <div className="space-y-2 text-sm">
                        <div><span className="font-medium">User:</span> {log.user.username} ({log.user.email})</div>
                        <div><span className="font-medium">IP Address:</span> {log.ipAddress}</div>
                        <div><span className="font-medium">User Agent:</span> {log.userAgent}</div>
                        <div><span className="font-medium">Timestamp:</span> {new Date(log.createdAt).toLocaleString()}</div>
                      </div>
                    </div>

                    {(log.oldValues || log.newValues) && (
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Changes</h4>
                        
                        {log.oldValues && (
                          <div className="mb-4">
                            <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Old Values:</h5>
                            <pre className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg text-xs overflow-x-auto">
                              {formatJsonValue(log.oldValues)}
                            </pre>
                          </div>
                        )}

                        {log.newValues && (
                          <div>
                            <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Values:</h5>
                            <pre className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg text-xs overflow-x-auto">
                              {formatJsonValue(log.newValues)}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {logs.length > 0 && (
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          Showing {logs.length} audit log{logs.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  )
}
