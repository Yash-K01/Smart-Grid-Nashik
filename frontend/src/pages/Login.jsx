import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, User, Wrench, Shield, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { API_URL } from '../../config/api'

function Login() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  
  // Get role from URL parameter - THIS IS THE KEY FIX
  const urlRole = searchParams.get('role')
  
  // Set selected role based on URL parameter
  const [selectedRole, setSelectedRole] = useState(() => {
    if (urlRole === 'user') return 'user'
    if (urlRole === 'technician') return 'technician'
    if (urlRole === 'admin') return 'admin'
    return 'user' // default
  })
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  // Update selected role when URL parameter changes
  useEffect(() => {
    if (urlRole === 'user') setSelectedRole('user')
    else if (urlRole === 'technician') setSelectedRole('technician')
    else if (urlRole === 'admin') setSelectedRole('admin')
  }, [urlRole])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.email || !formData.password) {
      toast.error('Please enter email and password')
      return
    }
    
    setLoading(true)
    
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          role: selectedRole
        }),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        toast.success('Login successful!')
        
        if (data.user.role === 'user') {
          navigate('/user/dashboard')
        } else if (data.user.role === 'admin') {
          navigate('/admin/dashboard')
        } else if (data.user.role === 'technician') {
          navigate('/technician/dashboard')
        }
      } else {
        toast.error(data.message || 'Invalid credentials')
      }
    } catch (error) {
      // Demo login for testing
      console.log('Login API not available, simulating demo login')
      
      // Check credentials based on selected role
      if (selectedRole === 'admin' && formData.email === 'admin@smartgrid.com' && formData.password === 'admin123') {
        const mockUser = { id: 1, name: 'Admin User', email: formData.email, role: 'admin' }
        localStorage.setItem('token', 'demo-token')
        localStorage.setItem('user', JSON.stringify(mockUser))
        toast.success('Admin Login successful!')
        navigate('/admin/dashboard')
      } 
      else if (selectedRole === 'user' && formData.email === 'user@demo.com' && formData.password === 'user123') {
        const mockUser = { id: 2, name: 'Demo User', email: formData.email, role: 'user' }
        localStorage.setItem('token', 'demo-token')
        localStorage.setItem('user', JSON.stringify(mockUser))
        toast.success('User Login successful!')
        navigate('/user/dashboard')
      } 
      else if (selectedRole === 'technician' && formData.email === 'tech@demo.com' && formData.password === 'tech123') {
        const mockUser = { id: 3, name: 'Demo Technician', email: formData.email, role: 'technician' }
        localStorage.setItem('token', 'demo-token')
        localStorage.setItem('user', JSON.stringify(mockUser))
        toast.success('Technician Login successful!')
        navigate('/technician/dashboard')
      } 
      else {
        toast.error(`Invalid ${selectedRole} credentials.\n\nDemo Credentials:\nAdmin: admin@smartgrid.com / admin123\nUser: user@demo.com / user123\nTechnician: tech@demo.com / tech123`)
      }
    } finally {
      setLoading(false)
    }
  }

  const roles = [
    { 
      id: 'user', 
      name: 'User', 
      icon: User, 
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-600 to-blue-700',
      description: 'For Citizens & Homeowners',
      demoEmail: 'user@demo.com',
      demoPassword: 'user123',
      placeholder: 'user@demo.com'
    },
    { 
      id: 'technician', 
      name: 'Technician', 
      icon: Wrench, 
      gradient: 'from-emerald-500 to-emerald-600',
      bgGradient: 'from-emerald-600 to-emerald-700',
      description: 'For Field Staff & Repairs',
      demoEmail: 'tech@demo.com',
      demoPassword: 'tech123',
      placeholder: 'tech@demo.com'
    },
    { 
      id: 'admin', 
      name: 'Admin', 
      icon: Shield, 
      gradient: 'from-purple-500 to-purple-600',
      bgGradient: 'from-purple-600 to-purple-700',
      description: 'Control & Management',
      demoEmail: 'admin@smartgrid.com',
      demoPassword: 'admin123',
      placeholder: 'admin@smartgrid.com'
    }
  ]

  const currentRole = roles.find(r => r.id === selectedRole)

  const fillDemoCredentials = () => {
    setFormData({
      email: currentRole.demoEmail,
      password: currentRole.demoPassword
    })
    toast.success(`${currentRole.name} demo credentials filled!`)
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" 
          className="w-full h-full object-cover" 
          alt="Background"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/90 via-purple-900/80 to-slate-900/90"></div>
      </div>

      {/* Animated Glow Orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>

      <div className="relative z-10 min-h-screen flex items-center justify-center py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            {/* Back to Home Button */}
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-6 transition-all duration-300 hover:-translate-x-1 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
              <span className="text-sm">Back to Home</span>
            </Link>

            {/* Login Card */}
            <div className="relative">
              {/* Subtle Glow */}
              <div className={`absolute -inset-0.5 bg-gradient-to-r ${currentRole.gradient} rounded-3xl blur opacity-30`}></div>
              
              {/* Main Card */}
              <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20">
                {/* Header - Shows which login is active */}
                <div className={`bg-gradient-to-r ${currentRole.gradient} px-8 py-6`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm`}>
                      {selectedRole === 'user' && <User className="w-6 h-6 text-white" />}
                      {selectedRole === 'technician' && <Wrench className="w-6 h-6 text-white" />}
                      {selectedRole === 'admin' && <Shield className="w-6 h-6 text-white" />}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">
                        {selectedRole === 'user' && 'User Login'}
                        {selectedRole === 'technician' && 'Technician Login'}
                        {selectedRole === 'admin' && 'Admin Login'}
                      </h2>
                      <p className="text-white/70 text-sm mt-0.5">{currentRole.description}</p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="p-8">
                  {/* Role Selection Tabs - Clicking these changes the form */}
                  <div className="grid grid-cols-3 gap-2 mb-8">
                    {roles.map((role) => (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => {
                          setSelectedRole(role.id)
                          setFormData({ email: '', password: '' }) // Clear form when switching
                          // Update URL without reload
                          navigate(`/login?role=${role.id}`, { replace: true })
                        }}
                        className={`py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                          selectedRole === role.id
                            ? `bg-gradient-to-r ${role.gradient} text-white shadow-lg scale-[1.02]`
                            : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white/90'
                        }`}
                      >
                        <role.icon className="w-4 h-4" />
                        {role.name}
                      </button>
                    ))}
                  </div>

                  {/* Email Input */}
                  <div className="mb-5">
                    <label className="block text-white/80 font-medium mb-2 text-sm">
                      Email Address
                    </label>
                    <div className="relative group">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4 group-focus-within:text-indigo-400 transition-colors" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-transparent text-white placeholder-white/30 outline-none transition-all"
                        placeholder={`Enter ${selectedRole} email (${currentRole.placeholder})`}
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div className="mb-6">
                    <label className="block text-white/80 font-medium mb-2 text-sm">
                      Password
                    </label>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4 group-focus-within:text-indigo-400 transition-colors" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-transparent text-white placeholder-white/30 outline-none transition-all"
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full bg-gradient-to-r ${currentRole.gradient} text-white py-3 rounded-xl font-semibold text-base transition-all duration-300 transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg`}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Logging in...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <Lock className="w-4 h-4" />
                        Login as {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}
                      </span>
                    )}
                  </button>

                      {selectedRole === 'user' && <p className="text-center text-white/60 text-sm mt-6">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-indigo-400 font-medium hover:text-indigo-300 hover:underline transition-colors">
                          Create Account
                        </Link>
                      </p>}

                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login