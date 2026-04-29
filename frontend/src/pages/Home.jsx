import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

function Home() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userName, setUserName] = useState('')

  // Check authentication status from multiple possible storage locations
  useEffect(() => {
    const checkAuth = () => {
      // Check all possible token locations
      const adminToken = localStorage.getItem('admin_token')
      const userToken = localStorage.getItem('user_token')
      const techToken = localStorage.getItem('technician_token')
      const activeRole = localStorage.getItem('active_role')
      
      // Also check old token format for backward compatibility
      const oldToken = localStorage.getItem('token')
      
      let token = null
      let userData = null
      
      // Check if any token exists
      if (adminToken || userToken || techToken || oldToken) {
        // Try to get user data from active role first
        if (activeRole === 'admin' && adminToken) {
          token = adminToken
          userData = localStorage.getItem('admin_user')
        } else if (activeRole === 'user' && userToken) {
          token = userToken
          userData = localStorage.getItem('user_user')
        } else if (activeRole === 'technician' && techToken) {
          token = techToken
          userData = localStorage.getItem('technician_user')
        } else if (oldToken) {
          // Fallback to old format
          token = oldToken
          userData = localStorage.getItem('user')
        } else if (adminToken) {
          token = adminToken
          userData = localStorage.getItem('admin_user')
        } else if (userToken) {
          token = userToken
          userData = localStorage.getItem('user_user')
        } else if (techToken) {
          token = techToken
          userData = localStorage.getItem('technician_user')
        }
        
        if (userData) {
          try {
            const parsedUser = JSON.parse(userData)
            setUserName(parsedUser.name || 'User')
            setIsAuthenticated(true)
          } catch (e) {
            setIsAuthenticated(false)
          }
        } else {
          setIsAuthenticated(false)
        }
      } else {
        setIsAuthenticated(false)
        setUserName('')
      }
    }
    
    checkAuth()
    
    // Listen for storage changes (when logout happens in another tab)
    const handleStorageChange = () => {
      checkAuth()
    }
    
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const handleLogout = () => {
    // Remove ALL possible authentication data
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_user')
    localStorage.removeItem('user_token')
    localStorage.removeItem('user_user')
    localStorage.removeItem('technician_token')
    localStorage.removeItem('technician_user')
    localStorage.removeItem('active_role')
    
    // Force update state
    setIsAuthenticated(false)
    setUserName('')
    
    // Redirect to home
    window.location.href = '/'
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div>
      {/* Navbar - Glass Effect */}
      <nav className="fixed w-full top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center shadow-lg transition-transform group-hover:scale-105">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                SmartGridSystem
              </span>
            </Link>
            
            {/* Right Menu */}
            <div className="flex items-center space-x-6">
              {!isAuthenticated ? (
                <>
                  {/* Portal Access Dropdown */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-blue-900/20"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
                      </svg>
                      <span>Portal Access</span>
                      <svg className={`w-4 h-4 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </button>

                    {isDropdownOpen && (
                      <div className="absolute right-0 mt-3 w-64 bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden p-2 z-50">
                        {/* User Login */}
                        <Link
                          to="/login?role=user"
                          className="flex items-center gap-4 p-4 hover:bg-blue-50 rounded-xl transition-colors group"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                            </svg>
                          </div>
                          <div>
                            <p className="text-gray-900 font-bold text-sm">User Login</p>
                            <p className="text-gray-500 text-xs">For Citizens & Homeowners</p>
                          </div>
                        </Link>

                        {/* Technician Login */}
                        <Link
                          to="/login?role=technician"
                          className="flex items-center gap-4 p-4 hover:bg-emerald-50 rounded-xl transition-colors group"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            </svg>
                          </div>
                          <div>
                            <p className="text-gray-900 font-bold text-sm">Technician Login</p>
                            <p className="text-gray-500 text-xs">For Field Staff & Repairs</p>
                          </div>
                        </Link>

                        {/* Admin Login */}
                        <Link
                          to="/login?role=admin"
                          className="flex items-center gap-4 p-4 hover:bg-purple-50 rounded-xl transition-colors group border-t border-gray-100 mt-1 pt-3"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-all">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                            </svg>
                          </div>
                          <div>
                            <p className="text-gray-900 font-bold text-sm">Admin Login</p>
                            <p className="text-gray-500 text-xs">Control & Management</p>
                          </div>
                        </Link>
                      </div>
                    )}
                  </div>
                  
                  <Link
                    to="/register"
                    className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:shadow-lg transition transform hover:scale-105 active:scale-95"
                  >
                    Register
                  </Link>
                </>
              ) : (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center gap-3 bg-gray-100 px-4 py-2 rounded-xl">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                      {userName.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-gray-700 font-semibold">{userName}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="bg-red-500 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-red-600 transition active:scale-95 shadow-lg shadow-red-900/20"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Background Image */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" 
            className="w-full h-full object-cover" 
            alt="Nashik City Grid"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/90 via-slate-900/80 to-transparent"></div>
        </div>
        
        <div className="relative z-10 container mx-auto px-6 text-center">
          <div>
            <span className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-widest text-indigo-300 uppercase bg-indigo-500/20 rounded-full border border-indigo-500/30">
              Official Management Portal
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight">
              Smart Grid <span className="text-indigo-400">Nashik</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
              Streamlining electricity complaints and technician dispatch for a brighter, more reliable Nashik city.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <a href="#features" className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-indigo-500/50 flex items-center justify-center gap-2">
                How It Works
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </a>
              <Link to="/register" className="w-full sm:w-auto bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 px-10 py-4 rounded-xl font-bold transition-all">
                Register Complaint
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce text-white/50">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">Efficient Resolution Process</h2>
            <p className="text-slate-500">Fast, transparent, and reliable support for citizens.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-10 group hover:bg-indigo-600 transition-all duration-500 shadow-lg border border-gray-100">
              <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-white/20 group-hover:text-white transition-colors">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 group-hover:text-white">Submit Complaint</h3>
              <p className="text-slate-600 leading-relaxed group-hover:text-indigo-100">
                Upload photos and share your live location directly. Our system geotags the issue for faster technician response.
              </p>
            </div>

            <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-10 group hover:bg-blue-600 transition-all duration-500 shadow-lg border border-gray-100">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-white/20 group-hover:text-white transition-colors">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 group-hover:text-white">Smart Dispatch</h3>
              <p className="text-slate-600 leading-relaxed group-hover:text-blue-100">
                Admin instantly verifies the claim and assigns the nearest technician available in the specific Nashik ward.
              </p>
            </div>

            <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-10 group hover:bg-emerald-600 transition-all duration-500 shadow-lg border border-gray-100">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-white/20 group-hover:text-white transition-colors">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path>
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 group-hover:text-white">Track & Resolve</h3>
              <p className="text-slate-600 leading-relaxed group-hover:text-emerald-100">
                Get live updates as the technician moves toward you. Mark the complaint as resolved once the work is verified.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">SmartGridSystem</h3>
              <p className="text-gray-400">Making electricity management smarter and more efficient for Nashik city.</p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Contact Us</h3>
              <p className="text-gray-400">📧 support@smartgrid.com</p>
              <p className="text-gray-400">📞 +91 1234567890</p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Follow Us</h3>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition">📷 Instagram</a>
                <a href="#" className="text-gray-400 hover:text-white transition">💬 WhatsApp</a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 SmartGridSystem. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home