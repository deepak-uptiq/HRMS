import { useState, useEffect } from 'react'
import { useAuth } from '../../state/useAuth.tsx'

type Payslip = {
  id: string
  month: number
  year: number
  basicSalary: number
  allowances: number
  deductions: number
  netSalary: number
  status: string
  generatedAt: string
  paidAt?: string
}

export default function Payslips() {
  const { api } = useAuth()
  const [payslips, setPayslips] = useState<Payslip[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  useEffect(() => {
    loadPayslips()
  }, [selectedYear])

  async function loadPayslips() {
    try {
      setLoading(true)
      const response = await api.get(`/api/v1/employee/payslips?year=${selectedYear}`)
      setPayslips(response.data.data)
    } catch (error) {
      console.error('Failed to load payslips:', error)
      setMessage({ type: 'error', text: 'Failed to load payslips' })
    } finally {
      setLoading(false)
    }
  }

  async function downloadPayslip(payslipId: string) {
    try {
      setMessage(null)
      const response = await api.get(`/api/v1/employee/payslips/${payslipId}/download`, {
        responseType: 'blob'
      })
      
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `payslip-${payslipId}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      setMessage({ type: 'success', text: 'Payslip downloaded successfully!' })
    } catch (error) {
      console.error('Failed to download payslip:', error)
      setMessage({ type: 'error', text: 'Failed to download payslip' })
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'GENERATED': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'PAID': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'CANCELLED': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  function getMonthName(month: number) {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ]
    return months[month - 1] || 'Unknown'
  }

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border p-6">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
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
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Payslips</h1>
          <p className="text-gray-600 dark:text-gray-400">View and download your salary slips</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Year:</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
          >
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
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

      {/* Payslips List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border">
        {payslips.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">💰</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No payslips found</h3>
            <p className="text-gray-500 dark:text-gray-400">No payslips available for {selectedYear}.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {payslips.map((payslip) => (
              <div key={payslip.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {getMonthName(payslip.month)} {payslip.year}
                      </h3>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payslip.status)}`}>
                        {payslip.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Basic Salary:</span>
                        <p className="font-medium text-gray-900 dark:text-white">
                          ₹{payslip.basicSalary.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Allowances:</span>
                        <p className="font-medium text-green-600 dark:text-green-400">
                          +₹{payslip.allowances.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Deductions:</span>
                        <p className="font-medium text-red-600 dark:text-red-400">
                          -₹{payslip.deductions.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Net Salary:</span>
                        <p className="font-bold text-lg text-gray-900 dark:text-white">
                          ₹{payslip.netSalary.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      Generated: {new Date(payslip.generatedAt).toLocaleDateString()}
                      {payslip.paidAt && (
                        <span className="ml-4">
                          Paid: {new Date(payslip.paidAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="ml-6">
                    <button
                      onClick={() => downloadPayslip(payslip.id)}
                      disabled={payslip.status === 'PENDING'}
                      className="bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      {payslip.status === 'PENDING' ? 'Not Available' : 'Download PDF'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      {payslips.length > 0 && (
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl border p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Year Summary ({selectedYear})</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {payslips.length}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Total Payslips</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                ₹{payslips.reduce((sum, p) => sum + p.netSalary, 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Total Earnings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                ₹{payslips.length > 0 ? (payslips.reduce((sum, p) => sum + p.netSalary, 0) / payslips.length).toLocaleString() : 0}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Average Monthly</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
