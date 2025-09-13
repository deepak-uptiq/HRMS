import { useNavigate } from 'react-router-dom'

export default function ErrorPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-primary-600 dark:text-primary-400">404</h1>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-4">
            Page Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Sorry, we couldn't find the page you're looking for.
          </p>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={() => navigate(-1)}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Go Back
          </button>
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    </div>
  )
}
