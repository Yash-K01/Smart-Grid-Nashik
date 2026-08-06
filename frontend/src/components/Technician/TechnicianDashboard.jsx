import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Home, ClipboardList, CheckCircle, LogOut, Clock, TrendingUp, AlertCircle, User, Wrench } from 'lucide-react'
import toast from 'react-hot-toast'
import ViewAssignments from './ViewAssignments'
import NotificationBell from '../NotificationBell'
import API from '../../config/api' // Use API instance instead of axios

function TechnicianDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('assignments')
  const [stats, setStats] = useState({
    assigned: 0,
    inProgress: 0,
    completed: 0,
    total: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Get user data from localStorage as fallback
  const getUserData = () => {
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        return JSON.parse(userData)
      } catch (e) {
        return null
      }
    }
    return null
  }

  const localUserData = getUserData()
  const displayName = user?.name || localUserData?.name || 'Technician'
  const displayEmail = user?.email || localUserData?.email || 'tech@example.com'
  const displayInitial = displayName.charAt(0).toUpperCase()

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleError = (error) => {
    console.error('Error:', error)
    if (!error.response) {
      toast.error('Network Error - Please check your connection')
    } else if (error.response.status === 401) {
      toast.error('Session expired - Please login again')
      logout()
      navigate('/login')
    } else {
      toast.error(error.response?.data?.message || 'Something went wrong')
    }
  }

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        toast.error('Please login again')
        navigate('/login')
        return
      }

      const response = await API.get('/technician/stats', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setStats(response.data)
      setError(null)
    } catch (error) {
      handleError(error)
      setError('Failed to load statistics')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  // Navigation items configuration
  const navItems = [
    {
      id: 'assignments',
      label: 'View Assignments',
      icon: ClipboardList,
      badge: stats.assigned > 0 ? stats.assigned : null,
      badgeColor: 'bg-yellow-500'
    },
    {
      id: 'update',
      label: 'Update Status',
      icon: TrendingUp,
      badge: stats.inProgress > 0 ? stats.inProgress : null,
      badgeColor: 'bg-blue-500'
    }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 text-lg">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-72 bg-gradient-to-b from-green-800 to-teal-800 text-white shadow-2xl pt-16">
        <div className="p-6 h-full flex flex-col">
          {/* Logo */}
          <div className="flex items-center space-x-3 mb-10 pb-6 border-b border-white/20">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <Wrench className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <span className="text-xl font-bold">Tech Panel</span>
              <p className="text-xs text-green-200">Field Staff Portal</p>
            </div>
          </div>

          {/* Technician Info */}
          <div className="mb-8 p-4 bg-white/10 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center text-xl font-bold">
                {displayInitial}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{displayName}</p>
                <p className="text-xs text-green-200 truncate">{displayEmail}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                    isActive ? 'bg-white/20 shadow-lg' : 'hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== null && (
                    <span className={`${item.badgeColor} text-white text-xs px-2 py-1 rounded-full`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>

          {/* Logout Button */}
          <div className="pt-4 border-t border-white/20">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Notification Bell */}
      <div className="fixed top-20 right-6 z-50">
        <NotificationBell />
      </div>

      {/* Main Content */}
      <div className="ml-72">
        {/* Content Area */}
        <div className="p-8">
          {error ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
              <p className="text-red-600 font-semibold">{error}</p>
              <button
                onClick={fetchStats}
                className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              {activeTab === 'assignments' && <ViewAssignments mode="all" />}
              {activeTab === 'update' && <ViewAssignments mode="update" />}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default TechnicianDashboard