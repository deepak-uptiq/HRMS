import { useEffect, useState } from 'react'
import { useAuth } from '../../state/useAuth.tsx'

type User = {
  id: string
  username: string
  email: string
  role: string
  requestedRole: string
  approvalStatus: string
  isActive: boolean
  createdAt: string
}

export default function UserManagement() {
  const { api } = useAuth()
  const [pendingUsers, setPendingUsers] = useState<User[]>([])
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Using authenticated API instance from useAuth

  useEffect(() => {
    loadUsers()
  }, [])

  async function loadUsers() {
    try {
      setLoading(true)
      const [pendingRes, allRes] = await Promise.all([
        api.get('/api/v1/users/pending/list'),
        api.get('/api/v1/users')
      ])
      setPendingUsers(pendingRes.data.data)
      setAllUsers(allRes.data.data)
    } catch (err: any) {
      setError('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  async function approveUser(userId: string) {
    try {
      await api.patch(`/api/v1/users/${userId}/approve`)
      loadUsers() // Reload users
    } catch (err: any) {
      setError('Failed to approve user')
    }
  }

  async function rejectUser(userId: string, reason?: string) {
    try {
      await api.patch(`/api/v1/users/${userId}/reject`, { reason })
      loadUsers() // Reload users
    } catch (err: any) {
      setError('Failed to reject user')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading users...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">User Management</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage user accounts and approvals</p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Pending Approvals */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Pending Approvals ({pendingUsers.length})
        </h2>
        
        {pendingUsers.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No pending approvals</p>
        ) : (
          <div className="space-y-4">
            {pendingUsers.map((user) => (
              <div key={user.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{user.username}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Requested Role: <span className="font-medium">{user.requestedRole}</span>
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      Registered: {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => approveUser(user.id)}
                      className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded-md transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => rejectUser(user.id, 'Application rejected')}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded-md transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* All Users */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          All Users ({allUsers.length})
        </h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Joined
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {allUsers.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {user.username}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {user.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.approvalStatus === 'APPROVED' && user.isActive
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : user.approvalStatus === 'PENDING'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {user.approvalStatus === 'APPROVED' && user.isActive ? 'Active' : user.approvalStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
