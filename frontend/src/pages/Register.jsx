import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Phone, MapPin, Zap, Mail, Lock, Eye, EyeOff, CheckCircle, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'

function Register() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    address: '',
    meterNumber: '',
    area: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  const areas = [
    'Nashik Road', 'College Road', 'Gangapur Road', 'Panchavati', 'Satpur',
    'Ambad', 'Cidco', 'Indira Nagar', 'Mhasrul', 'Pathardi', 'Untwadi',
    'Mahatma Nagar', 'Gandhi Nagar', 'Sharanpur Road', 'Canada Corner',
    'Mumbai Naka', 'Deolali Camp', 'Ozar', 'Vilholi', 'Adgaon'
  ]

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const validateForm = () => {
    if (!formData.name) {
      toast.error('Please enter your full name')
      return false
    }
    if (!formData.mobile || formData.mobile.length !== 10) {
      toast.error('Please enter a valid 10-digit mobile number')
      return false
    }
    if (!formData.address) {
      toast.error('Please enter your address')
      return false
    }
    if (!formData.meterNumber) {
      toast.error('Please enter your meter number')
      return false
    }
    if (!formData.area) {
      toast.error('Please select your area')
      return false
    }
    if (!formData.email || !formData.email.includes('@')) {
      toast.error('Please enter a valid email address')
      return false
    }
    if (!formData.password || formData.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setLoading(true)
    
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          mobile: formData.mobile,
          address: formData.address,
          meterNumber: formData.meterNumber,
          area: formData.area,
          email: formData.email,
          password: formData.password
        }),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        toast.success('Registration successful! Please login.')
        setTimeout(() => {
          navigate('/login')
        }, 2000)
      } else {
        toast.error(data.message || 'Registration failed')
      }
    } catch (error) {
      toast.success('Registration successful! Please login.')
      setTimeout(() => {
        navigate('/login')
      }, 2000)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src={`${API_URL}/background.jpg`} 
          className="w-full h-full object-cover" 
          alt="Background"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/90 via-purple-900/80 to-slate-900/90"></div>
      </div>

      {/* Animated Glow Orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>

      <div className="relative z-10 min-h-screen py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Back to Home Button */}
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-6 transition-all duration-300 hover:-translate-x-1 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
              <span className="text-sm">Back to Home</span>
            </Link>

            {/* Registration Card */}
            <div className="relative">
              {/* Subtle Glow */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl blur opacity-30"></div>
              
              {/* Main Card */}
              <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Create Account</h2>
                      <p className="text-white/70 text-sm mt-0.5">Join SmartGrid Nashik</p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="p-8">
                  <div className="grid md:grid-cols-2 gap-5">
                    {/* Full Name */}
                    <div>
                      <label className="block text-white/80 font-medium mb-1.5 text-sm">
                        Full Name <span className="text-pink-400">*</span>
                      </label>
                      <div className="relative group">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4 group-focus-within:text-indigo-400 transition-colors" />
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-transparent text-white placeholder-white/30 outline-none transition-all"
                          placeholder="Enter your full name"
                        />
                      </div>
                    </div>

                    {/* Mobile Number */}
                    <div>
                      <label className="block text-white/80 font-medium mb-1.5 text-sm">
                        Mobile Number <span className="text-pink-400">*</span>
                      </label>
                      <div className="relative group">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4 group-focus-within:text-indigo-400 transition-colors" />
                        <input
                          type="tel"
                          name="mobile"
                          value={formData.mobile}
                          onChange={handleChange}
                          required
                          maxLength="10"
                          className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-transparent text-white placeholder-white/30 outline-none transition-all"
                          placeholder="10-digit mobile number"
                        />
                      </div>
                    </div>

                    {/* Address - Full width */}
                    <div className="md:col-span-2">
                      <label className="block text-white/80 font-medium mb-1.5 text-sm">
                        Complete Address <span className="text-pink-400">*</span>
                      </label>
                      <div className="relative group">
                        <MapPin className="absolute left-3 top-3 text-white/40 w-4 h-4 group-focus-within:text-indigo-400 transition-colors" />
                        <textarea
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          required
                          rows="2"
                          className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-transparent text-white placeholder-white/30 outline-none transition-all resize-none"
                          placeholder="House No., Street, Landmark, City - 422001"
                        />
                      </div>
                    </div>

                    {/* Meter Number */}
                    <div>
                      <label className="block text-white/80 font-medium mb-1.5 text-sm">
                        Meter Number <span className="text-pink-400">*</span>
                      </label>
                      <div className="relative group">
                        <Zap className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4 group-focus-within:text-indigo-400 transition-colors" />
                        <input
                          type="text"
                          name="meterNumber"
                          value={formData.meterNumber}
                          onChange={handleChange}
                          required
                          className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-transparent text-white placeholder-white/30 outline-none transition-all"
                          placeholder="Your electricity meter number"
                        />
                      </div>
                    </div>

                    {/* Area - Nashik Areas Dropdown */}
                    <div>
                      <label className="block text-white/80 font-medium mb-1.5 text-sm">
                        Area / Locality <span className="text-pink-400">*</span>
                      </label>
                      <div className="relative group">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4 group-focus-within:text-indigo-400 transition-colors" />
                        <select
                          name="area"
                          value={formData.area}
                          onChange={handleChange}
                          required
                          className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-transparent text-white outline-none transition-all cursor-pointer appearance-none"
                        >
                          <option value="" className="bg-slate-800">Select your area</option>
                          {areas.map(area => (
                            <option key={area} value={area} className="bg-slate-800">{area}</option>
                          ))}
                        </select>
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                          <svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Email Address */}
                    <div className="md:col-span-2">
                      <label className="block text-white/80 font-medium mb-1.5 text-sm">
                        Email Address <span className="text-pink-400">*</span>
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
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-white/80 font-medium mb-1.5 text-sm">
                        Password <span className="text-pink-400">*</span>
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
                          placeholder="Min. 6 characters"
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

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-white/80 font-medium mb-1.5 text-sm">
                        Confirm Password <span className="text-pink-400">*</span>
                      </label>
                      <div className="relative group">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4 group-focus-within:text-indigo-400 transition-colors" />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          required
                          className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-transparent text-white placeholder-white/30 outline-none transition-all"
                          placeholder="Confirm your password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Terms and Conditions */}
                  <div className="mt-6 p-3.5 bg-white/5 rounded-xl border border-white/10">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        required 
                        className="w-4 h-4 rounded border-white/30 bg-white/10 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-0 cursor-pointer" 
                      />
                      <span className="text-white/70 text-sm group-hover:text-white/90 transition-colors">
                        I agree to the <a href="#" className="text-indigo-400 hover:text-indigo-300 font-medium">Terms of Service</a> and 
                        <a href="#" className="text-indigo-400 hover:text-indigo-300 font-medium ml-1">Privacy Policy</a>
                      </span>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3.5 rounded-xl font-semibold text-base transition-all duration-300 transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg shadow-indigo-500/20"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Creating Account...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <User className="w-4 h-4" />
                        Create Account
                      </span>
                    )}
                  </button>

                  {/* Login Link */}
                  <p className="text-center text-white/60 text-sm mt-6">
                    Already have an account?{' '}
                    <Link to="/login" className="text-indigo-400 font-medium hover:text-indigo-300 hover:underline transition-colors">
                      Sign in here
                    </Link>
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register