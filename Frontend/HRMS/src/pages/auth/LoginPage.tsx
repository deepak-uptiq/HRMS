import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../state/useAuth.tsx'

export default function LoginPage() {
  const { login, user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('🔄 User already logged in, redirecting...', user.role);
      if (user.role === 'ADMIN') {
        navigate('/admin');
      } else if (user.role === 'HR') {
        navigate('/hr');
      } else if (user.role === 'EMPLOYEE') {
        navigate('/employee');
      } else {
        navigate('/');
      }
    }
  }, [isAuthenticated, user, navigate])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setPending(true)
    
    const r = await login(email, password)
    setPending(false)
    
    if (r === 'PENDING') return setError('Your account is pending admin approval.')
    if (r === 'ERROR') return setError('Invalid credentials')
    
    // Redirect based on user role
    if (typeof r === 'object' && r.status === 'OK') {
      const userRole = r.user.role;
      console.log('🎯 Redirecting to dashboard for role:', userRole);
      
      if (userRole === 'ADMIN') {
        navigate('/admin');
      } else if (userRole === 'HR') {
        navigate('/hr');
      } else if (userRole === 'EMPLOYEE') {
        navigate('/employee');
      } else {
        navigate('/');
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">HRMS</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Human Resource Management System</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 text-center">Sign in</h2>
          <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email address
              </label>
              <input 
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                placeholder="Enter your email"
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <input 
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                placeholder="Enter your password"
                required 
              />
            </div>
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
              </div>
            )}
            <button 
              disabled={pending} 
              className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg py-3 px-4 transition-colors focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              {pending ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <Link 
                to="/signup" 
                className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
              >
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}


