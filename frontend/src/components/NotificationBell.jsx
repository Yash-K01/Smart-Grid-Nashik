import React, { useState, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import { Bell, CheckCircle, XCircle, AlertCircle, Clock, Mail, UserPlus, Trash2, CheckCheck } from 'lucide-react'
import API from "../config/api";

function NotificationBell() {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [markingAll, setMarkingAll] = useState(false)
  const dropdownRef = useRef(null)

  const handleError = (error) => {
    console.error('Notification Error:', error)
    if (!error.response) {
      toast.error("Network Error - Please check your connection")
    } else if (error.response.status === 401) {
      toast.error("Session expired - Please login again")
      // Optionally redirect to login
    } else {
      toast.error(
        error.response.data?.message || 
        error.message || 
        "Something went wrong"
      )
    }
  }

  useEffect(() => {
    fetchNotifications()
    fetchUnreadCount()
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(() => {
      if (!isOpen) {
        fetchUnreadCount()
      }
    }, 30000)
    
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    
    return () => {
      clearInterval(interval)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen]) // Added isOpen to dependency

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const response = await API.get("/notifications")
      setNotifications(response.data || [])
    } catch (error) {
      handleError(error)
      setNotifications([]) // Set empty array on error
    } finally {
      setLoading(false)
    }
  }

  const fetchUnreadCount = async () => {
    try {
      const response = await API.get("/notifications/unread-count")
      setUnreadCount(response.data?.count || 0)
    } catch (error) {
      handleError(error)
      setUnreadCount(0) // Set 0 on error
    }
  }

  const markAsRead = async (id) => {
    try {
      await API.put(`/notifications/${id}/read`)
      
      // Update local state immediately for better UX
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === id ? { ...notif, isRead: true } : notif
        )
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
      
      toast.success('Marked as read')
    } catch (error) {
      handleError(error)
      // Refresh on error to sync state
      await fetchNotifications()
      await fetchUnreadCount()
    }
  }

  const markAllAsRead = async () => {
    setMarkingAll(true)
    try {
      await API.put("/notifications/mark-all-read")
      
      // Update local state immediately
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true }))
      )
      setUnreadCount(0)
      
      toast.success('All notifications marked as read')
    } catch (error) {
      handleError(error)
      // Refresh on error to sync state
      await fetchNotifications()
      await fetchUnreadCount()
    } finally {
      setMarkingAll(false)
    }
  }

  const deleteNotification = async (id) => {
    try {
      await API.delete(`/notifications/${id}`)
      
      // Update local state immediately
      const deletedNotif = notifications.find(n => n._id === id)
      setNotifications(prev => prev.filter(notif => notif._id !== id))
      
      if (deletedNotif && !deletedNotif.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
      
      toast.success("Notification deleted")
    } catch (error) {
      handleError(error)
      // Refresh on error to sync state
      await fetchNotifications()
      await fetchUnreadCount()
    }
  }

  const getNotificationIcon = (title, type) => {
    // Check by type first if available
    if (type === 'assignment') return <UserPlus className="w-4 h-4 text-blue-500" />
    if (type === 'started') return <Clock className="w-4 h-4 text-purple-500" />
    if (type === 'resolved') return <CheckCircle className="w-4 h-4 text-green-500" />
    if (type === 'rejected') return <XCircle className="w-4 h-4 text-red-500" />
    
    // Fallback to title
    if (title?.includes('Assigned') || title?.includes('assign')) 
      return <UserPlus className="w-4 h-4 text-blue-500" />
    if (title?.includes('Started') || title?.includes('start')) 
      return <Clock className="w-4 h-4 text-purple-500" />
    if (title?.includes('Resolved') || title?.includes('complete')) 
      return <CheckCircle className="w-4 h-4 text-green-500" />
    if (title?.includes('Rejected') || title?.includes('cancel')) 
      return <XCircle className="w-4 h-4 text-red-500" />
    if (title?.includes('New')) 
      return <Mail className="w-4 h-4 text-indigo-500" />
    
    return <AlertCircle className="w-4 h-4 text-gray-500" />
  }

  const formatTime = (date) => {
    if (!date) return 'Unknown time'
    
    const now = new Date()
    const notifDate = new Date(date)
    const diffMs = now - notifDate
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
    return notifDate.toLocaleDateString()
  }

  const toggleDropdown = () => {
    setIsOpen(!isOpen)
    if (!isOpen) {
      fetchNotifications()
      fetchUnreadCount()
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="relative bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl overflow-hidden z-50 border border-gray-100">
          {/* Header */}
          <div className="flex justify-between items-center p-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
            <h3 className="font-bold flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Notifications
              {unreadCount > 0 && (
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                  {unreadCount} unread
                </span>
              )}
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                disabled={markingAll}
                className="text-xs bg-white/20 px-2 py-1 rounded hover:bg-white/30 transition flex items-center gap-1 disabled:opacity-50"
              >
                {markingAll ? (
                  <span className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></span>
                ) : (
                  <CheckCheck className="w-3 h-3" />
                )}
                Mark all read
              </button>
            )}
          </div>
          
          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent mx-auto mb-2"></div>
                <p className="text-gray-500 text-sm">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No notifications yet</p>
                <p className="text-gray-400 text-xs mt-1">You'll see updates here</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-4 border-b hover:bg-gray-50 transition cursor-pointer ${
                    !notification.isRead ? 'bg-indigo-50' : ''
                  }`}
                  onClick={() => markAsRead(notification._id)}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.title, notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <p className={`text-sm font-semibold ${!notification.isRead ? 'text-indigo-700' : 'text-gray-800'}`}>
                          {notification.title}
                        </p>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-indigo-600 rounded-full flex-shrink-0"></div>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mt-1 break-words">
                        {notification.message}
                      </p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-gray-400">
                          {formatTime(notification.createdAt)}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteNotification(notification._id)
                          }}
                          className="text-xs text-gray-400 hover:text-red-500 transition flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {/* Footer */}
          {notifications.length > 0 && !loading && (
            <div className="p-2 bg-gray-50 text-center border-t">
              <p className="text-xs text-gray-400">
                {notifications.filter(n => !n.isRead).length} unread · {notifications.length} total
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default NotificationBell