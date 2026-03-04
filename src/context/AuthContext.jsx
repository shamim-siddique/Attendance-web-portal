import { createContext, useContext, useState, useEffect } from 'react'
import { jwtDecode } from 'jwt-decode'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)

  const isAdmin = roles.includes('admin')
  const isManager = roles.includes('manager')
  const isAdminOrManager = isAdmin || isManager

  const login = (access_token, refresh_token) => {
    localStorage.setItem('access_token', access_token)
    localStorage.setItem('refresh_token', refresh_token)
    const decoded = jwtDecode(access_token)
    setUser(decoded)
    setRoles(decoded.roles || [])
  }

  const logout = async () => {
    try {
      const refresh_token = localStorage.getItem('refresh_token')
      const access_token = localStorage.getItem('access_token')
      if (refresh_token) {
        // Attempt backend logout (if exists) to revoke refresh token
        await fetch(import.meta.env.VITE_API_BASE_URL + '/web/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Client-Type': 'web',
            'Authorization': 'Bearer ' + access_token
          },
          body: JSON.stringify({ refresh_token })
        }).catch(() => { })
      }
    } finally {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      setUser(null)
      setRoles([])
      window.location.href = '/login'
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      setLoading(false)
      return
    }
    try {
      const decoded = jwtDecode(token)
      console.log('DEBUG: Current JWT token fields:', Object.keys(decoded))
      console.log('DEBUG: Current JWT token:', decoded)
      console.log('DEBUG: Has username:', 'username' in decoded)
      console.log('DEBUG: Has email:', 'email' in decoded)
      console.log('DEBUG: Username value:', decoded.username)
      console.log('DEBUG: Email value:', decoded.email)
      if (decoded.exp * 1000 < Date.now()) {
        localStorage.clear()
        setLoading(false)
        return
      }
      setUser(decoded)
      setRoles(decoded.roles || [])
    } catch (e) {
      localStorage.clear()
    } finally {
      setLoading(false)
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        roles,
        isAdmin,
        isManager,
        isAdminOrManager,
        loading,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
