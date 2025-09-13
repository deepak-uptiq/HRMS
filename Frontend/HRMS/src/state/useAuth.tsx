import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { config } from '../config/env.ts'

type Role = 'ADMIN' | 'HR' | 'EMPLOYEE'

type User = {
  id: string
  username: string
  email: string
  role: Role
}

type AuthContextType = {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  api: any
  login: (email: string, password: string) => Promise<'OK' | 'PENDING' | 'ERROR' | { status: 'OK', user: User }>
  register: (username: string, email: string, password: string, role: Role) => Promise<'OK' | 'ERROR'>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const t = localStorage.getItem('token')
    const u = localStorage.getItem('user')
    if (t && u) {
      setToken(t)
      setUser(JSON.parse(u))
    }
  }, [])

  const api = useMemo(() => {
    const instance = axios.create({ baseURL: config.apiUrl })
    instance.interceptors.request.use((requestConfig) => {
      if (token) requestConfig.headers.Authorization = `Bearer ${token}`
      return requestConfig
    })
    return instance
  }, [token])

  async function login(email: string, password: string) {
    try {
      console.log('🔍 Attempting login with:', { email, password: '***' });
      console.log('🔍 API URL:', config.apiUrl);
      
      const res = await api.post('/api/v1/auth/login', { email, password })
      console.log('🔍 Full response:', res);
      console.log('🔍 Response data:', res.data);
      console.log('🔍 Response data.data:', res.data.data);
      
      const { user, token } = res.data.data
      setUser(user)
      setToken(token)
      localStorage.setItem('user', JSON.stringify(user))
      localStorage.setItem('token', token)
      
      console.log('✅ Login successful for:', user.role);
      return { status: 'OK' as const, user }
    } catch (e: any) {
      console.error('❌ Login failed:', e);
      console.error('❌ Error response:', e?.response);
      console.error('❌ Error message:', e?.response?.data?.message || 'Unknown error');
      const msg = e?.response?.data?.message || ''
      if (msg.toLowerCase().includes('pending approval')) return 'PENDING'
      return 'ERROR'
    }
  }

  async function register(username: string, email: string, password: string, role: Role) {
    try {
      await api.post('/api/v1/auth/register', { username, email, password, role })
      return 'OK'
    } catch (e: any) {
      return 'ERROR'
    }
  }

  function logout() {
    setUser(null)
    setToken(null)
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  }

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, api, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}