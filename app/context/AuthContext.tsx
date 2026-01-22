'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { loginAction } from '../actions/loginAction'

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true'
    setIsAuthenticated(loggedIn)
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    const user = await loginAction(email, password)

    if (user) {
      localStorage.setItem("token", user.token);
      localStorage.setItem('isLoggedIn', 'true')
      setIsAuthenticated(true)
      router.push('/Home')
    } else {
      alert('Invalid email or password')
    }
  }

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem('isLoggedIn')
    setIsAuthenticated(false)
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
