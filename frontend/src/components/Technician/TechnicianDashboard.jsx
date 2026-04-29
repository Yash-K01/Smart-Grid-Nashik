import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Home, ClipboardList, CheckCircle, LogOut, Clock, TrendingUp, AlertCircle, User, Wrench } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'
import ViewAssignments from './ViewAssignments'
import NotificationBell from '../NotificationBell'

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

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('http://localhost:5000/api/technician/stats', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setStats(response.data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-72 bg-gradient-to-b from-green-800 to-teal-800 text-white shadow-2xl pt-16">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-10 pb-6 border-b border-white/20">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <Wrench className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <span className="text-xl font-bold">Tech Panel</span>
              <p className="text-xs text-green-200">Field Staff Portal</p>
            </div>
          </div>

          {/* Technician Info - FIXED */}
          <div className="mb-8 p-4 bg-white/10 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center text-xl font-bold">
                {displayInitial}
              </div>
              <div>
                <p className="font-semibold">{displayName}</p>
                <p className="text-xs text-green-200">{displayEmail}</p>
              </div>
            </div>
          </div>

          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab('assignments')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                activeTab === 'assignments' ? 'bg-white/20 shadow-lg' : 'hover:bg-white/10'
              }`}
            >
              <div className="flex items-center space-x-3">
                <ClipboardList className="w-5 h-5" />
                <span>View Assignments</span>
              </div>
              {stats.assigned > 0 && (
                <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                  {stats.assigned}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('update')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                activeTab === 'update' ? 'bg-white/20 shadow-lg' : 'hover:bg-white/10'
              }`}
            >
              <div className="flex items-center space-x-3">
                <TrendingUp className="w-5 h-5" />
                <span>Update Status</span>
              </div>
              {stats.inProgress > 0 && (
                <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                  {stats.inProgress}
                </span>
              )}
            </button>
          </nav>
        </div>

        <div className="absolute bottom-0 w-72 p-6">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Notification Bell */}
      <div className="fixed top-20 right-6 z-50">
        <NotificationBell />
      </div>

      <div className="ml-72">
        {activeTab === 'assignments' && <ViewAssignments mode="all" />}
        {activeTab === 'update' && <ViewAssignments mode="update" />}
      </div>
    </div>
  )
}

export default TechnicianDashboard