import { useState, useEffect } from 'react'
import { useAuth } from '../../state/useAuth.tsx'

type EmployeeProfile = {
  id: string
  employeeId: string
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  dateOfBirth: string
  hireDate: string
  salary: number
  department: {
    id: string
    name: string
  }
  position: {
    id: string
    title: string
  }
}

export default function ProfileManagement() {
  const { api } = useAuth()
  const [profile, setProfile] = useState<EmployeeProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: ''
  })

  useEffect(() => {
    loadProfile()
  }, [])

  async function loadProfile() {
    try {
      setLoading(true)
      const response = await api.get('/api/v1/employee/profile')
      
      const employeeData = response.data.data
      setProfile(employeeData)
      setFormData({
        firstName: employeeData.firstName || '',
        lastName: employeeData.lastName || '',
        email: employeeData.email || '',
        phone: employeeData.phone || '',
        address: employeeData.address || ''
      })
    } catch (error) {
      console.error('Failed to load profile:', error)
      setMessage({ type: 'error', text: 'Failed to load profile data' })
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    try {
      setSaving(true)
      setMessage(null)

      await api.patch('/api/v1/employee/profile', formData)

      setMessage({ type: 'success', text: 'Profile updated successfully!' })
      loadProfile() // Reload to get updated data
    } catch (error) {
      console.error('Failed to update profile:', error)
      setMessage({ type: 'error', text: 'Failed to update profile' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border p-6">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
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
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Profile Management</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your personal information and contact details</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Form */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl border p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Personal Information</h2>
            
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Address
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Profile Summary */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Employee Information</h3>
            {profile && (
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Employee ID:</span>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{profile.employeeId}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Department:</span>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{profile.department?.name}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Position:</span>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{profile.position?.title}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Hire Date:</span>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {new Date(profile.hireDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Date of Birth:</span>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {new Date(profile.dateOfBirth).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Account Security</h3>
            <div className="space-y-3">
              <button className="w-full text-left p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="text-sm font-medium text-gray-900 dark:text-white">Change Password</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Update your account password</div>
              </button>
              <button className="w-full text-left p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="text-sm font-medium text-gray-900 dark:text-white">Two-Factor Authentication</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Add extra security to your account</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
