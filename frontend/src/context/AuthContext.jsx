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

  const startSession = ({ token, user }, expectedRole) => {
    // expectedRole: which sign-in page the person used. Wrong portal = no session is created.
    if (expectedRole && user.role !== expectedRole) {
      throw Object.assign(new Error('wrong portal'), { actualRole: user.role })
    }
    tokenStore.set(token)
    setUser(user)
    return user
  }

  // Step 1 (password). Returns { otpRequired, challengeId, ... } when 2-step verification is on.
  const login = async (values, expectedRole) => {
    const res = await authApi.login(values)
    if (res.otpRequired) return res
    return startSession(res, expectedRole)
  }

  // Step 2 (6-digit code). The session only starts here.
  const verifyOtp = async ({ challengeId, code }, expectedRole) => {
    const res = await authApi.verifyOtp({ challengeId, code })
    return startSession(res, expectedRole)
  }

  const register = async (values) => {
    const { token, user } = await authApi.register(values)
    tokenStore.set(token)
    setUser(user)
    return user
  }

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, verifyOtp, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
