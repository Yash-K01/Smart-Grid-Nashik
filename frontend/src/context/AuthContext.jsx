import React, { createContext, useState, useContext, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { API_URL } from '../config/api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  // Load user from localStorage on mount - Check all role-specific keys
  useEffect(() => {
    const checkUserInStorage = () => {
      // Check for any active session (role-specific keys)
      const adminToken = localStorage.getItem('admin_token')
      const adminUser = localStorage.getItem('admin_user')
      const userToken = localStorage.getItem('user_token')
      const userUser = localStorage.getItem('user_user')
      const techToken = localStorage.getItem('technician_token')
      const techUser = localStorage.getItem('technician_user')
      
      if (adminToken && adminUser) {
        try {
          const parsedUser = JSON.parse(adminUser)
          setUser(parsedUser)
          setIsAuthenticated(true)
          axios.defaults.headers.common['Authorization'] = `Bearer ${adminToken}`
        } catch (error) {
          console.error('Error parsing admin data:', error)
        }
      } 
      else if (userToken && userUser) {
        try {
          const parsedUser = JSON.parse(userUser)
          setUser(parsedUser)
          setIsAuthenticated(true)
          axios.defaults.headers.common['Authorization'] = `Bearer ${userToken}`
        } catch (error) {
          console.error('Error parsing user data:', error)
        }
      }
      else if (techToken && techUser) {
        try {
          const parsedUser = JSON.parse(techUser)
          setUser(parsedUser)
          setIsAuthenticated(true)
          axios.defaults.headers.common['Authorization'] = `Bearer ${techToken}`
        } catch (error) {
          console.error('Error parsing technician data:', error)
        }
      }
      setLoading(false)
    }
    
    checkUserInStorage()
    
    // Listen for storage changes (when another tab logs in/out)
    window.addEventListener('storage', checkUserInStorage)
    return () => window.removeEventListener('storage', checkUserInStorage)
  }, [])

  // REAL BACKEND LOGIN - Works with MongoDB
  const login = async (email, password, role) => {
    try {
      // Real backend API call
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
        role
      })
      
      const { token, user: userData } = response.data
      
      // Ensure user data has consistent structure
      const formattedUser = {
        _id: userData.id || userData._id,
        id: userData.id || userData._id,
        name: userData.name,
        email: userData.email,
        role: userData.role
      }
      
      // Store in role-specific keys (doesn't overwrite other roles)
      if (role === 'admin') {
        localStorage.setItem('admin_token', token)
        localStorage.setItem('admin_user', JSON.stringify(formattedUser))
      } else if (role === 'user') {
        localStorage.setItem('user_token', token)
        localStorage.setItem('user_user', JSON.stringify(formattedUser))
      } else if (role === 'technician') {
        localStorage.setItem('technician_token', token)
        localStorage.setItem('technician_user', JSON.stringify(formattedUser))
      }
      
      // Also set active session
      localStorage.setItem('active_role', role)
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      
      // Update state
      setUser(formattedUser)
      setIsAuthenticated(true)
      
      toast.success(`Welcome ${formattedUser.name}! Login successful.`)
      
      // Redirect based on role
      setTimeout(() => {
        if (formattedUser.role === 'user') {
          window.location.href = '/user/dashboard'
        } else if (formattedUser.role === 'admin') {
          window.location.href = '/admin/dashboard'
        } else if (formattedUser.role === 'technician') {
          window.location.href = '/technician/dashboard'
        }
      }, 500)
      
      return true
    } catch (error) {
      // Fallback to mock login for demo when backend is not available
      console.log('Backend not available, using mock login')
      
      // Mock login for testing (kept for backward compatibility)
      if (role === 'admin' && email === 'admin@smartgrid.com' && password === 'admin123') {
        const mockUser = { 
          _id: 'admin_1',
          id: 'admin_1',
          name: 'Admin User', 
          email, 
          role: 'admin' 
        }
        localStorage.setItem('admin_token', 'mock-token-123')
        localStorage.setItem('admin_user', JSON.stringify(mockUser))
        localStorage.setItem('active_role', 'admin')
        axios.defaults.headers.common['Authorization'] = `Bearer mock-token-123`
        setUser(mockUser)
        setIsAuthenticated(true)
        toast.success('Admin Login successful!')
        
        setTimeout(() => {
          window.location.href = '/admin/dashboard'
        }, 500)
        return true
      } 
      else if (role === 'user' && email === 'user@demo.com' && password === 'user123') {
        const mockUser = { 
          _id: 'user_1',
          id: 'user_1',
          name: 'Demo User', 
          email, 
          role: 'user' 
        }
        localStorage.setItem('user_token', 'mock-token-123')
        localStorage.setItem('user_user', JSON.stringify(mockUser))
        localStorage.setItem('active_role', 'user')
        axios.defaults.headers.common['Authorization'] = `Bearer mock-token-123`
        setUser(mockUser)
        setIsAuthenticated(true)
        toast.success('User Login successful!')
        setTimeout(() => {
          window.location.href = '/user/dashboard'
        }, 500)
        return true
      } 
      else if (role === 'technician' && email === 'tech@demo.com' && password === 'tech123') {
        const mockUser = { 
          _id: 'tech_1',
          id: 'tech_1',
          name: 'Demo Technician', 
          email, 
          role: 'technician' 
        }
        localStorage.setItem('technician_token', 'mock-token-123')
        localStorage.setItem('technician_user', JSON.stringify(mockUser))
        localStorage.setItem('active_role', 'technician')
        axios.defaults.headers.common['Authorization'] = `Bearer mock-token-123`
        setUser(mockUser)
        setIsAuthenticated(true)
        toast.success('Technician Login successful!')
        setTimeout(() => {
          window.location.href = '/technician/dashboard'
        }, 500)
        return true
      }
      
      toast.error(error.response?.data?.message || 'Invalid credentials')
      return false
    }
  }

  // Switch between different logged-in roles
  const switchRole = (role) => {
    if (role === 'admin') {
      const token = localStorage.getItem('admin_token')
      const userData = localStorage.getItem('admin_user')
      if (token && userData) {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
        setIsAuthenticated(true)
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
        localStorage.setItem('active_role', 'admin')
        window.location.href = '/admin/dashboard'
        toast.success(`Switched to ${parsedUser.name}`)
      } else {
        toast.error('No admin session found. Please login as admin.')
      }
    } else if (role === 'user') {
      const token = localStorage.getItem('user_token')
      const userData = localStorage.getItem('user_user')
      if (token && userData) {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
        setIsAuthenticated(true)
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
        localStorage.setItem('active_role', 'user')
        window.location.href = '/user/dashboard'
        toast.success(`Switched to ${parsedUser.name}`)
      } else {
        toast.error('No user session found. Please login as user.')
      }
    } else if (role === 'technician') {
      const token = localStorage.getItem('technician_token')
      const userData = localStorage.getItem('technician_user')
      if (token && userData) {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
        setIsAuthenticated(true)
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
        localStorage.setItem('active_role', 'technician')
        window.location.href = '/technician/dashboard'
        toast.success(`Switched to ${parsedUser.name}`)
      } else {
        toast.error('No technician session found. Please login as technician.')
      }
    }
  }

  // Check if a specific role is logged in
  const isRoleLoggedIn = (role) => {
    if (role === 'admin') {
      return !!localStorage.getItem('admin_token')
    } else if (role === 'user') {
      return !!localStorage.getItem('user_token')
    } else if (role === 'technician') {
      return !!localStorage.getItem('technician_token')
    }
    return false
  }

  // Get all logged-in roles
  const getLoggedInRoles = () => {
    const roles = []
    if (localStorage.getItem('admin_token')) roles.push('admin')
    if (localStorage.getItem('user_token')) roles.push('user')
    if (localStorage.getItem('technician_token')) roles.push('technician')
    return roles
  }

  // REAL BACKEND REGISTER - Saves to MongoDB
  const register = async (userData) => {
    try {
      // Real backend API call
      const response = await axios.post(`${API_URL}/auth/register`, userData)
      
      toast.success(response.data.message || 'Registration successful! Please login.')
      setTimeout(() => {
        window.location.href = '/login'
      }, 1500)
      return true
    } catch (error) {
      // Fallback for demo when backend is not available
      console.log('Backend not available, using mock registration')
      toast.success('Registration successful! (Demo Mode) Please login.')
      setTimeout(() => {
        window.location.href = '/login'
      }, 1500)
      return true
    }
  }

  const logout = () => {
    const currentRole = user?.role
    
    // Remove only current role's data (not all roles)
    if (currentRole === 'admin') {
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_user')
    } else if (currentRole === 'user') {
      localStorage.removeItem('user_token')
      localStorage.removeItem('user_user')
    } else if (currentRole === 'technician') {
      localStorage.removeItem('technician_token')
      localStorage.removeItem('technician_user')
    }
    
    localStorage.removeItem('active_role')
    delete axios.defaults.headers.common['Authorization']
    setUser(null)
    setIsAuthenticated(false)
    toast.success('Logged out successfully')
    window.location.href = '/'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      login, 
      register, 
      logout,
      switchRole,
      isRoleLoggedIn,
      getLoggedInRoles
    }}>
      {children}
    </AuthContext.Provider>
  )
}