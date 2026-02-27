import { createContext, useContext, useEffect, useState } from 'react'
import api from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('access')
    if (token) {
      api.get('/api/auth/me/').then((res) => setUser(res.data)).finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (username, password) => {
    const res = await api.post('/api/auth/token/', { username, password })
    localStorage.setItem('access', res.data.access)
    localStorage.setItem('refresh', res.data.refresh)
    const me = await api.get('/api/auth/me/')
    setUser(me.data)
  }

  const register = async (username, email, password) => {
    await api.post('/api/auth/register/', { username, email, password })
    await login(username, password)
  }

  const logout = () => {
    localStorage.removeItem('access')
    localStorage.removeItem('refresh')
    setUser(null)
  }

  const refreshUser = async () => {
    if (!localStorage.getItem('access')) return
    const me = await api.get('/api/auth/me/')
    setUser(me.data)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
