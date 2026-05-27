import { createContext, useContext, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router'
import * as authApi from '../api/auth'

interface User {
  name: string
  email: string
}

interface AuthContextType {
  token: string | null
  user: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'))
  const [user, setUser] = useState<User | null>(() => {
    const name = localStorage.getItem('userName')
    const email = localStorage.getItem('userEmail')
    return name && email ? { name, email } : null
  })
  const navigate = useNavigate()

  async function login(email: string, password: string) {
    const res = await authApi.login({ email, password })
    localStorage.setItem('token', res.token)
    localStorage.setItem('userName', res.name)
    localStorage.setItem('userEmail', res.email)
    setToken(res.token)
    setUser({ name: res.name, email: res.email })
    navigate('/')
  }

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('userName')
    localStorage.removeItem('userEmail')
    setToken(null)
    setUser(null)
    navigate('/login')
  }

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
