import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../state/useAuth.tsx'

type Role = 'ADMIN' | 'HR' | 'EMPLOYEE'

export default function SignupPage() {
  const { register } = useAuth()
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'EMPLOYEE' as Role
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setPending(true)
    const result = await register(formData.username, formData.email, formData.password, formData.role)
    setPending(false)

    if (result === 'OK') {
      setSuccess('Registration successful! Please wait for admin approval before you can login.')
      setFormData({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'EMPLOYEE'
      })
    } else {
      setError('Registration failed. Email or username might already exist.')
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">HRMS</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Human Resource Management System</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 text-center">Create Account</h2>
          
          <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Username
              </label>
              <input 
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                type="text"
                name="username"
                value={formData.username} 
                onChange={handleChange} 
                placeholder="Enter your username"
                required 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email address
              </label>
              <input 
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                type="email"
                name="email"
                value={formData.email} 
                onChange={handleChange} 
                placeholder="Enter your email"
                required 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Role
              </label>
              <select 
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                name="role"
                value={formData.role} 
                onChange={handleChange}
                required
              >
                <option value="EMPLOYEE">Employee</option>
                <option value="HR">HR Manager</option>
                <option value="ADMIN">Administrator</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <input 
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                type="password"
                name="password"
                value={formData.password} 
                onChange={handleChange} 
                placeholder="Enter your password"
                required 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirm Password
              </label>
              <input 
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword} 
                onChange={handleChange} 
                placeholder="Confirm your password"
                required 
              />
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                <p className="text-green-600 dark:text-green-400 text-sm">{success}</p>
              </div>
            )}

            <button 
              disabled={pending} 
              className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg py-3 px-4 transition-colors focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              {pending ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link 
                to="/login" 
                className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
