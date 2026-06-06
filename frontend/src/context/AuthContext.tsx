import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authApi } from '../services/api'

interface User {
  user_id: string
  username: string
  is_admin: boolean
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)

  // Load token from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
    }
  }, [])

  const login = async (email: string, password: string) => {
    const data = await authApi.login(email, password)
    setToken(data.token)
    setUser({ user_id: data.user_id, username: data.username, is_admin: data.is_admin })
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify({
      user_id: data.user_id,
      username: data.username,
      is_admin: data.is_admin,
    }))
  }

  const register = async (username: string, email: string, password: string) => {
    const data = await authApi.register(username, email, password)
    setToken(data.token)
    setUser({ user_id: data.user_id, username: data.username, is_admin: data.is_admin })
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify({
      user_id: data.user_id,
      username: data.username,
      is_admin: data.is_admin,
    }))
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      register,
      logout,
      isAuthenticated: !!token,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}