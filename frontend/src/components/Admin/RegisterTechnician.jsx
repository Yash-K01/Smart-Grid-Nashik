import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { UserPlus, Trash2, Mail, Phone, MapPin, GraduationCap, Briefcase, Eye, EyeOff, RefreshCw } from 'lucide-react'
import API from '../../config/api'

function RegisterTechnician({ showList = true, showForm = true, refreshDashboard }) {
  const [technicians, setTechnicians] = useState([])
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    education: '',
    experience: '',
    contactNumber: '',
    email: '',
    location: '',
    password: ''
  })

  const areas = [
    'Nashik Road', 'College Road', 'Gangapur Road', 'Panchavati', 
    'Satpur', 'Ambad', 'Cidco', 'Indira Nagar', 'Mhasrul', 
    'Pathardi', 'Untwadi', 'Mahatma Nagar', 'Gandhi Nagar', 
    'Sharanpur Road', 'Canada Corner', 'Mumbai Naka', 'Deolali Camp', 
    'Ozar', 'Vilholi', 'Adgaon'
  ]

  // Helper function to ensure data is always an array
  const ensureArray = (data) => {
    if (Array.isArray(data)) return data
    if (data?.data && Array.isArray(data.data)) return data.data
    if (data?.technicians && Array.isArray(data.technicians)) return data.technicians
    return []
  }

  useEffect(() => {
    if (showList) {
      fetchTechnicians()
    }
  }, [showList])

  const fetchTechnicians = async () => {
    setFetching(true)
    try {
      const response = await API.get('/admin/technicians')
      const data = ensureArray(response.data)
      setTechnicians(data)
    } catch (error) {
      console.error('Error fetching technicians:', error)
      toast.error(error.response?.data?.message || 'Failed to fetch technicians')
      setTechnicians([])
    } finally {
      setFetching(false)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validation
    if (!formData.name || !formData.contactNumber || !formData.email || !formData.location || !formData.password) {
      toast.error('Please fill all required fields')
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address')
      return
    }

    // Phone validation (10 digits)
    // In handleSubmit function - add this validation
      const phoneRegex = /^[6-9]\d{9}$/;
        if (!phoneRegex.test(formData.contactNumber)) {
            toast.error('Contact number must be 10 digits starting with 6, 7, 8, or 9');
            return;
        }

    // Password validation (minimum 6 characters)
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long')
      return
    }
    
    setLoading(true)
    
    try {
      await API.post('/admin/technician', formData)
      
      toast.success('Technician registered successfully!')
      
      setFormData({ 
        name: '', 
        education: '', 
        experience: '', 
        contactNumber: '', 
        email: '', 
        location: '', 
        password: '' 
      })
      
      if (showList) {
        fetchTechnicians()
      }
      
      if (refreshDashboard) {
        refreshDashboard()
      }
      
    } catch (error) {
      console.error('Error creating technician:', error)
      toast.error(error.response?.data?.message || 'Failed to create technician')
    } finally {
      setLoading(false)
    }
  }

  const deleteTechnician = async (id) => {
    if (!window.confirm('Are you sure you want to delete this technician?')) {
      return
    }

    try {
      await API.delete(`/admin/technician/${id}`)
      toast.success('Technician deleted successfully')
      
      if (showList) {
        fetchTechnicians()
      }
      
      if (refreshDashboard) {
        refreshDashboard()
      }
      
    } catch (error) {
      console.error('Error deleting technician:', error)
      toast.error(error.response?.data?.message || 'Failed to delete technician')
    }
  }

  const getStatusBadge = (status) => {
    if (status === 'available') {
      return <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Available</span>
    } else if (status === 'busy') {
      return <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">Busy</span>
    }
    return null
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Technician Management</h1>
        <p className="text-gray-600 mt-2">Register new technicians and manage existing ones</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Registration Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                Register New Technician
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <input 
                  type="text" 
                  name="name" 
                  placeholder="Full Name *" 
                  value={formData.name} 
                  onChange={handleChange} 
                  required 
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                />
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <input 
                  type="text" 
                  name="education" 
                  placeholder="Education" 
                  value={formData.education} 
                  onChange={handleChange} 
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                />
                <input 
                  type="text" 
                  name="experience" 
                  placeholder="Experience (e.g., 5 years)" 
                  value={formData.experience} 
                  onChange={handleChange} 
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                />
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <input 
                    type="tel" 
                    name="contactNumber"
                    placeholder="Contact Number * (10 digits starting with 6-9)" 
                    value={formData.contactNumber} 
                    onChange={handleChange} 
                    required 
                    maxLength="10"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                />
                <input 
                  type="email" 
                  name="email" 
                  placeholder="Email *" 
                  value={formData.email} 
                  onChange={handleChange} 
                  required 
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                />
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <select 
                  name="location" 
                  value={formData.location} 
                  onChange={handleChange} 
                  required 
                  className="w-full px-4 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                >
                  <option value="">Select Area *</option>
                  {areas.map(area => (
                    <option key={area} value={area}>{area}</option>
                  ))}
                </select>
                
                <div className="relative">
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    name="password" 
                    placeholder="Password * (min 6 chars)" 
                    value={formData.password} 
                    onChange={handleChange} 
                    required 
                    minLength="6"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition pr-10"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)} 
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              <button 
                type="submit" 
                disabled={loading} 
                className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                    Registering...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Register Technician
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Technicians List */}
        {showList && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gray-800 px-6 py-4 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-white">Registered Technicians</h2>
                <p className="text-gray-400 text-sm">Total: {technicians.length}</p>
              </div>
              <button
                onClick={fetchTechnicians}
                disabled={fetching}
                className="text-gray-400 hover:text-white transition disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 ${fetching ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <div className="overflow-y-auto max-h-[500px]">
              {fetching ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent mx-auto mb-2"></div>
                  <p className="text-gray-500">Loading technicians...</p>
                </div>
              ) : technicians.length === 0 ? (
                <div className="p-8 text-center">
                  <UserPlus className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">No technicians registered yet</p>
                  <p className="text-gray-400 text-sm mt-1">Use the form to register a new technician</p>
                </div>
              ) : (
                technicians.map((tech) => (
                  <div key={tech._id} className="p-4 border-b hover:bg-gray-50 transition">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-800">{tech.name}</h3>
                          {getStatusBadge(tech.status)}
                          {tech.assignedComplaints > 0 && (
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                              {tech.assignedComplaints} active
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-sm">
                          <p className="text-gray-600 flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {tech.email}
                          </p>
                          <p className="text-gray-600 flex items-center gap-1">
                            <Phone className="w-3 h-3" /> {tech.contactNumber}
                          </p>
                          <p className="text-gray-600 flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {tech.location}
                          </p>
                          {tech.education && (
                            <p className="text-gray-600 flex items-center gap-1">
                              <GraduationCap className="w-3 h-3" /> {tech.education}
                            </p>
                          )}
                          {tech.experience && (
                            <p className="text-gray-600 flex items-center gap-1 col-span-full">
                              <Briefcase className="w-3 h-3" /> {tech.experience}
                            </p>
                          )}
                        </div>
                      </div>
                      <button 
                        onClick={() => deleteTechnician(tech._id)} 
                        className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition"
                        title="Delete technician"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default RegisterTechnician