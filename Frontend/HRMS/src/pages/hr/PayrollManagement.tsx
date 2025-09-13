import { useEffect, useState } from 'react'
import { useAuth } from '../../state/useAuth.tsx'

type Payslip = {
  id: string
  month: number
  year: number
  basicSalary: number
  allowances: number
  deductions: number
  netSalary: number
  status: 'PENDING' | 'GENERATED' | 'PAID' | 'CANCELLED'
  processedAt?: string
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
}

type Employee = {
  id: string
  employeeId: string
  firstName: string
  lastName: string
  salary: number
  department: {
    name: string
  }
  position: {
    title: string
  }
}

export default function PayrollManagement() {
  const { api } = useAuth()
  const [payslips, setPayslips] = useState<Payslip[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [showForm, setShowForm] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1)
  const [filterYear, setFilterYear] = useState(new Date().getFullYear())
  const [bulkGenerate, setBulkGenerate] = useState(false)
  const [formData, setFormData] = useState({
    employeeId: '',
    basicSalary: '',
    allowances: '',
    deductions: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null)

  // Using authenticated API instance from useAuth

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  useEffect(() => {
    loadData()
  }, [filterMonth, filterYear])

  async function loadData() {
    try {
      setLoading(true)
      const [payslipsRes, employeesRes] = await Promise.all([
        api.get(`/api/v1/payslips?month=${filterMonth}&year=${filterYear}`),
        api.get('/api/v1/employees?isActive=true')
      ])
      
      setPayslips(payslipsRes.data.data)
      setEmployees(employeesRes.data.data)
    } catch (error) {
      console.error('Failed to load payroll data:', error)
      setMessage({ type: 'error', text: 'Failed to load payroll data' })
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
        month: selectedMonth,
        year: selectedYear,
        basicSalary: parseFloat(formData.basicSalary),
        allowances: parseFloat(formData.allowances) || 0,
        deductions: parseFloat(formData.deductions) || 0
      }

      await api.post('/api/v1/payslips', payload)
      setMessage({ type: 'success', text: 'Payslip generated successfully' })
      resetForm()
      loadData()
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to generate payslip' 
      })
    } finally {
      setSaving(false)
    }
  }

  async function generateBulkPayslips() {
    if (!confirm(`Generate payslips for all employees for ${months[selectedMonth - 1]} ${selectedYear}?`)) {
      return
    }

    setSaving(true)
    setMessage(null)

    try {
      await api.post('/api/v1/payslips/bulk', {
        month: selectedMonth,
        year: selectedYear
      })
      
      setMessage({ type: 'success', text: 'Bulk payslips generated successfully' })
      setBulkGenerate(false)
      loadData()
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to generate bulk payslips' 
      })
    } finally {
      setSaving(false)
    }
  }

  async function updatePayslipStatus(id: string, status: string) {
    try {
      await api.patch(`/api/v1/payslips/${id}`, { status })
      setMessage({ type: 'success', text: `Payslip marked as ${status.toLowerCase()}` })
      loadData()
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update payslip status' })
    }
  }

  async function deletePayslip(id: string) {
    if (!confirm('Are you sure you want to delete this payslip?')) return

    try {
      await api.delete(`/api/v1/payslips/${id}`)
      setMessage({ type: 'success', text: 'Payslip deleted successfully' })
      loadData()
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete payslip' })
    }
  }

  function resetForm() {
    setFormData({
      employeeId: '',
      basicSalary: '',
      allowances: '',
      deductions: ''
    })
    setShowForm(false)
    setBulkGenerate(false)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  function handleEmployeeSelect(employeeId: string) {
    const employee = employees.find(emp => emp.id === employeeId)
    if (employee) {
      setFormData(prev => ({
        ...prev,
        employeeId,
        basicSalary: employee.salary.toString()
      }))
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'PENDING': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
      case 'GENERATED': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'PAID': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const stats = {
    total: payslips.length,
    pending: payslips.filter(p => p.status === 'PENDING').length,
    generated: payslips.filter(p => p.status === 'GENERATED').length,
    paid: payslips.filter(p => p.status === 'PAID').length,
    totalAmount: payslips.reduce((sum, p) => sum + p.netSalary, 0)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading payroll data...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Payroll Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Generate and manage employee payslips</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setBulkGenerate(true)}
            className="bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Bulk Generate
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="bg-primary-600 hover:bg-primary-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Generate Payslip
          </button>
        </div>
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
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</p>
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Generated</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.generated}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Paid</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.paid}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Amount</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                ${stats.totalAmount.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Filter Payslips</h3>
        <div className="flex space-x-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Month
            </label>
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(parseInt(e.target.value))}
              className="rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {months.map((month, index) => (
                <option key={index} value={index + 1}>{month}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Year
            </label>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(parseInt(e.target.value))}
              className="rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Generate Form */}
      {(showForm || bulkGenerate) && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {bulkGenerate ? 'Bulk Generate Payslips' : 'Generate Individual Payslip'}
          </h2>
          
          {bulkGenerate ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Month
                  </label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {months.map((month, index) => (
                      <option key={index} value={index + 1}>{month}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Year
                  </label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={generateBulkPayslips}
                  disabled={saving}
                  className="bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  {saving ? 'Generating...' : 'Generate All Payslips'}
                </button>
                <button
                  onClick={resetForm}
                  className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Employee
                  </label>
                  <select
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={(e) => handleEmployeeSelect(e.target.value)}
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
                    Month
                  </label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {months.map((month, index) => (
                      <option key={index} value={index + 1}>{month}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Year
                  </label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Base Salary
                  </label>
                  <input
                    type="number"
                    name="basicSalary"
                    value={formData.basicSalary}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Allowances
                  </label>
                  <input
                    type="number"
                    name="allowances"
                    value={formData.allowances}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Deductions
                  </label>
                  <input
                    type="number"
                    name="deductions"
                    value={formData.deductions}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
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
                  {saving ? 'Generating...' : 'Generate Payslip'}
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
          )}
        </div>
      )}

      {/* Payslips List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Payslips for {months[filterMonth - 1]} {filterYear}
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Base Salary
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Allowances
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Deductions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Net Salary
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {payslips.map((payslip) => (
                <tr key={payslip.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {payslip.employee.firstName || 'N/A'} {payslip.employee.lastName || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {payslip.employee.employeeId} • {payslip.employee.department?.name || 'N/A'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    ₹{payslip.basicSalary.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    ₹{payslip.allowances.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    ₹{payslip.deductions.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    ₹{payslip.netSalary.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payslip.status)}`}>
                      {payslip.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    {payslip.status === 'PENDING' && (
                      <button
                        onClick={() => updatePayslipStatus(payslip.id, 'GENERATED')}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        Process
                      </button>
                    )}
                    {payslip.status === 'GENERATED' && (
                      <button
                        onClick={() => updatePayslipStatus(payslip.id, 'PAID')}
                        className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                      >
                        Mark Paid
                      </button>
                    )}
                    <button
                      onClick={() => deletePayslip(payslip.id)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {payslips.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              No payslips found for {months[filterMonth - 1]} {filterYear}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
