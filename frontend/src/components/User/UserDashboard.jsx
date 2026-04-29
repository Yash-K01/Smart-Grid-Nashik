import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Home, LogOut, PlusCircle, Eye } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'
import SubmitComplaint from './SubmitComplaint'
import TrackComplaint from './TrackComplaint'
import NotificationBell from '../NotificationBell'

function UserDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('submit')
  const [displayName, setDisplayName] = useState('User')
  const [displayEmail, setDisplayEmail] = useState('')
  const [displayInitial, setDisplayInitial] = useState('U')

  useEffect(() => {
    // Try to get user data from multiple sources
    const getUserData = () => {
      // First try from auth context
      let name = user?.name
      let email = user?.email
      
      // If not in context, try localStorage user
      if (!name) {
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser)
            name = parsedUser.name || parsedUser.displayName
            email = parsedUser.email
          } catch (e) {
            console.error('Error parsing stored user:', e)
          }
        }
      }
      
      // If still no name, try user_token
      if (!name) {
        const userToken = localStorage.getItem('user_token')
        const userUser = localStorage.getItem('user_user')
        if (userToken && userUser) {
          try {
            const parsedUser = JSON.parse(userUser)
            name = parsedUser.name
            email = parsedUser.email
          } catch (e) {
            console.error('Error parsing user_user:', e)
          }
        }
      }
      
      // Final fallback
      name = name || 'User'
      email = email || 'user@example.com'
      
      setDisplayName(name)
      setDisplayEmail(email)
      setDisplayInitial(name.charAt(0).toUpperCase())
    }
    
    getUserData()
  }, [user])

  // Also listen for storage changes (when user logs in from another tab)
  useEffect(() => {
    const handleStorageChange = () => {
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser)
          if (parsedUser.name) {
            setDisplayName(parsedUser.name)
            setDisplayEmail(parsedUser.email || displayEmail)
            setDisplayInitial(parsedUser.name.charAt(0).toUpperCase())
          }
        } catch (e) {
          console.error('Error in storage event:', e)
        }
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [displayEmail])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-72 bg-gradient-to-b from-indigo-800 to-purple-800 text-white shadow-2xl pt-16">
        <div className="p-6">
          {/* Logo */}
          <div className="flex items-center space-x-3 mb-10 pb-6 border-b border-white/20">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <Home className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <span className="text-xl font-bold">SmartGrid</span>
              <p className="text-xs text-indigo-200">User Portal</p>
            </div>
          </div>

          {/* User Info - FIXED */}
          <div className="mb-8 p-4 bg-white/10 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-xl font-bold">
                {displayInitial}
              </div>
              <div>
                <p className="font-semibold">{displayName}</p>
                <p className="text-xs text-indigo-200">{displayEmail}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab('submit')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === 'submit' ? 'bg-white/20 shadow-lg' : 'hover:bg-white/10'
              }`}
            >
              <PlusCircle className="w-5 h-5" />
              <span>Submit Complaint</span>
            </button>

            <button
              onClick={() => setActiveTab('track')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === 'track' ? 'bg-white/20 shadow-lg' : 'hover:bg-white/10'
              }`}
            >
              <Eye className="w-5 h-5" />
              <span>Track Complaint</span>
            </button>
          </nav>
        </div>

        {/* Logout Button */}
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

      {/* Main Content */}
      <div className="ml-72">
        {activeTab === 'submit' && <SubmitComplaint />}
        {activeTab === 'track' && <TrackComplaint />}
      </div>
    </div>
  )
}

export default UserDashboard