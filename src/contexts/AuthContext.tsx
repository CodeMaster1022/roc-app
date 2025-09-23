import { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { authService, User } from '@/services/authService'
import { favoriteService } from '@/services/favoriteService'

export type UserRole = 'hoster' | 'tenant'

interface AuthContextType {
  user: User | null
  role: UserRole
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string, role: UserRole) => Promise<void>
  logout: () => void
  updateProfile: (profile: Partial<User['profile']>) => Promise<void>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<UserRole>('tenant') // Default to tenant view
  const [loading, setLoading] = useState(true)

  // Load user from localStorage and verify token on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const savedUser = localStorage.getItem('roc_user')
        const token = authService.getStoredToken()
        
        if (token && savedUser) {
          // Verify token is still valid by fetching profile
          const response = await authService.getProfile()
          const userData = response.data.user
          setUser(userData)
          // Always use the user's registered role from the server
          setRole(userData.role)
          // Update localStorage with current user data
          localStorage.setItem('roc_user', JSON.stringify(userData))
        } else if (savedUser) {
          // If no token but saved user, clear everything
          authService.logout()
        }
      } catch (error) {
        // Token is invalid, clear auth data but keep favorites cache
        // so they can be restored when user logs back in
        console.warn('Token invalid, clearing auth data but preserving favorites cache')
        authService.logout()
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password })
      const userData = response.data.user
      
      setUser(userData)
      setRole(userData.role)
      
      // Save to localStorage
      localStorage.setItem('roc_user', JSON.stringify(userData))
    } catch (error) {
      throw error
    }
  }

  const register = async (email: string, password: string, name: string, userRole: UserRole) => {
    try {
      const response = await authService.register({ email, password, name, role: userRole })
      const userData = response.data.user
      
      setUser(userData)
      setRole(userData.role)
      
      // Save to localStorage
      localStorage.setItem('roc_user', JSON.stringify(userData))
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    authService.logout()
    // Only clear favorites cache on explicit logout, not on token expiration
    // This allows favorites to persist when user logs back in
    favoriteService.clearCache()
    setUser(null)
    setRole('tenant')
  }

  const updateProfile = async (profileUpdate: Partial<User['profile']>) => {
    try {
      const response = await authService.updateProfile(profileUpdate)
      const updatedUser = response.data.user
      
      setUser(updatedUser)
      localStorage.setItem('roc_user', JSON.stringify(updatedUser))
    } catch (error) {
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      role,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      updateProfile,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
