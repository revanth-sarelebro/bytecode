import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { authApi, tokenStore } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(Boolean(tokenStore.get()))

  const logout = useCallback(() => {
    tokenStore.clear()
    setUser(null)
  }, [])

  // Restore session on page refresh
  useEffect(() => {
    if (!tokenStore.get()) return
    authApi.me().then(setUser).catch(logout).finally(() => setLoading(false))
  }, [logout])

  // api.js fires this when the server says the token is no longer valid
  useEffect(() => {
    window.addEventListener('medisync:logout', logout)
    return () => window.removeEventListener('medisync:logout', logout)
  }, [logout])

  // expectedRole: which sign-in page the person used. Wrong portal = no session is created.
  const login = async (values, expectedRole) => {
    const { token, user } = await authApi.login(values)
    if (expectedRole && user.role !== expectedRole) {
      throw Object.assign(new Error('wrong portal'), { actualRole: user.role })
    }
    tokenStore.set(token)
    setUser(user)
    return user
  }

  const register = async (values) => {
    const { token, user } = await authApi.register(values)
    tokenStore.set(token)
    setUser(user)
    return user
  }

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
