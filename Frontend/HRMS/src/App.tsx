import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import HomePage from './pages/HomePage.tsx'
import LoginPage from './pages/auth/LoginPage.tsx'
import SignupPage from './pages/auth/SignupPage.tsx'
import AdminDashboard from './pages/dashboards/AdminDashboard.tsx'
import HRDashboard from './pages/dashboards/HRDashboard.tsx'
import EmployeeDashboard from './pages/dashboards/EmployeeDashboard.tsx'
import UserManagement from './pages/admin/UserManagement.tsx'
import CompanySettings from './pages/admin/CompanySettings.tsx'
import AnnouncementManagement from './pages/admin/AnnouncementManagement.tsx'
import AuditLogs from './pages/admin/AuditLogs.tsx'
import EmployeeManagement from './pages/hr/EmployeeManagement.tsx'
import LeaveManagement from './pages/hr/LeaveManagement.tsx'
import PayrollManagement from './pages/hr/PayrollManagement.tsx'
import PerformanceReviews from './pages/hr/PerformanceReviews.tsx'
import ProfileManagement from './pages/employee/ProfileManagement.tsx'
import LeaveRequests from './pages/employee/LeaveRequests.tsx'
import Payslips from './pages/employee/Payslips.tsx'
import Performance from './pages/employee/Performance.tsx'
import ProtectedRoute from './components/routing/ProtectedRoute.tsx'
import Layout from './components/layout/Layout.tsx'
import ErrorPage from './pages/ErrorPage.tsx'
import ErrorBoundary from './components/ErrorBoundary.tsx'
import { useAuth } from './state/useAuth.tsx'

function AppRoutes() {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated && user && window.location.pathname === '/') {
      if (user.role === 'ADMIN') navigate('/admin')
      else if (user.role === 'HR') navigate('/hr')
      else if (user.role === 'EMPLOYEE') navigate('/employee')
    }
  }, [isAuthenticated, user, navigate])

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <Layout>
              <AdminDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <Layout>
              <UserManagement />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <Layout>
              <CompanySettings />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/announcements"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <Layout>
              <AnnouncementManagement />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/audit"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <Layout>
              <AuditLogs />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/hr"
        element={
          <ProtectedRoute allowedRoles={["HR", "ADMIN"]}>
            <Layout>
              <HRDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/hr/employees"
        element={
          <ProtectedRoute allowedRoles={["HR", "ADMIN"]}>
            <Layout>
              <EmployeeManagement />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/hr/leave"
        element={
          <ProtectedRoute allowedRoles={["HR", "ADMIN"]}>
            <Layout>
              <LeaveManagement />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/hr/payroll"
        element={
          <ProtectedRoute allowedRoles={["HR", "ADMIN"]}>
            <Layout>
              <PayrollManagement />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/hr/reviews"
        element={
          <ProtectedRoute allowedRoles={["HR", "ADMIN"]}>
            <Layout>
              <PerformanceReviews />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee"
        element={
          <ProtectedRoute allowedRoles={["EMPLOYEE", "HR", "ADMIN"]}>
            <Layout>
              <EmployeeDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/profile"
        element={
          <ProtectedRoute allowedRoles={["EMPLOYEE", "HR", "ADMIN"]}>
            <Layout>
              <ProfileManagement />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/leaves"
        element={
          <ProtectedRoute allowedRoles={["EMPLOYEE", "HR", "ADMIN"]}>
            <Layout>
              <LeaveRequests />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/payslips"
        element={
          <ProtectedRoute allowedRoles={["EMPLOYEE", "HR", "ADMIN"]}>
            <Layout>
              <Payslips />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/performance"
        element={
          <ProtectedRoute allowedRoles={["EMPLOYEE", "HR", "ADMIN"]}>
            <Layout>
              <Performance />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route path="/error" element={<ErrorPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppRoutes />
    </ErrorBoundary>
  )
}
