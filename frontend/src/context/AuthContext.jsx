import { createContext, useContext, useEffect, useState } from 'react'
import api from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token) {
      // Already have a token — verify it and load the user
      api.get('/auth/me/')
        .then((res) => setUser(res.data))
        .catch(() => {
          localStorage.clear()
          return createGuest()
        })
        .finally(() => setLoading(false))
    } else {
      // No token at all — create a guest account automatically
      createGuest().finally(() => setLoading(false))
    }
  }, [])

  async function createGuest() {
    try {
      const { data } = await api.post('/auth/guest/')
      localStorage.setItem('access_token', data.access)
      localStorage.setItem('refresh_token', data.refresh)
      setUser({ username: data.username, is_admin: false, is_guest: true })
    } catch (e) {
      console.error('Could not create guest session', e)
    }
  }

  async function login(username, password) {
    const { data } = await api.post('/auth/login/', { username, password })
    localStorage.setItem('access_token', data.access)
    localStorage.setItem('refresh_token', data.refresh)
    const me = await api.get('/auth/me/')
    setUser(me.data)
    return me.data
  }

  function logout() {
    localStorage.clear()
    setUser(null)
    // Create a fresh guest session immediately after logout
    createGuest()
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)