import React, { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { UserPlus, Trash2, Mail, Phone, MapPin, GraduationCap, Briefcase, Eye, EyeOff } from 'lucide-react'
import { API_URL } from '../../config/api'

function RegisterTechnician({ showList = true, showForm = true }) {
  const [technicians, setTechnicians] = useState([])
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: '', education: '', experience: '', contactNumber: '', email: '', location: '', password: ''
  })

  const areas = ['Nashik Road', 'College Road', 'Gangapur Road', 'Panchavati', 'Satpur', 'Ambad', 'Cidco', 'Indira Nagar', 'Mhasrul', 'Pathardi', 'Untwadi', 'Mahatma Nagar', 'Gandhi Nagar', 'Sharanpur Road', 'Canada Corner', 'Mumbai Naka', 'Deolali Camp', 'Ozar', 'Vilholi', 'Adgaon']

  useEffect(() => {
    if (showList) {
      fetchTechnicians()
    }
  }, [showList])

  const fetchTechnicians = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_URL}/admin/technicians`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setTechnicians(response.data)
    } catch (error) {
      console.error('Error fetching technicians:', error)
      toast.error('Failed to fetch technicians')
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name || !formData.contactNumber || !formData.email || !formData.location || !formData.password) {
      toast.error('Please fill all required fields')
      return
    }
    
    setLoading(true)
    
    try {
      const token = localStorage.getItem('token')
      await axios.post(`${API_URL}/admin/technician`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      toast.success('Technician registered successfully!')
      setFormData({ name: '', education: '', experience: '', contactNumber: '', email: '', location: '', password: '' })
      
      if (showList) {
        fetchTechnicians()
      }
    } catch (error) {
      console.error('Error creating technician:', error)
      toast.error(error.response?.data?.message || 'Failed to create technician')
    } finally {
      setLoading(false)
    }
  }

  const deleteTechnician = async (id) => {
    if (window.confirm('Are you sure you want to delete this technician?')) {
      try {
        const token = localStorage.getItem('token')
        await axios.delete(`${API_URL}/admin/technician/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        toast.success('Technician deleted successfully')
        if (showList) fetchTechnicians()
      } catch (error) {
        console.error('Error deleting technician:', error)
        toast.error('Failed to delete technician')
      }
    }
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Technician Management</h1>
          <p className="text-gray-600 mt-2">Register new technicians and manage existing ones</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Registration Form - Only show if showForm is true */}
          {showForm && (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  Register New Technician
                </h2>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <input type="text" name="name" placeholder="Full Name *" value={formData.name} onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
                <div className="grid md:grid-cols-2 gap-4">
                  <input type="text" name="education" placeholder="Education" value={formData.education} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
                  <input type="text" name="experience" placeholder="Experience" value={formData.experience} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <input type="tel" name="contactNumber" placeholder="Contact Number *" value={formData.contactNumber} onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg" />
                  <input type="email" name="email" placeholder="Email *" value={formData.email} onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg" />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <select name="location" value={formData.location} onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg bg-white">
                    <option value="">Select Area *</option>
                    {areas.map(area => <option key={area} value={area}>{area}</option>)}
                  </select>
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} name="password" placeholder="Password *" value={formData.password} onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg pr-10" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50">
                  {loading ? 'Registering...' : 'Register Technician'}
                </button>
              </form>
            </div>
          )}

          {/* Technicians List - Only show if showList is true */}
          {showList && (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gray-800 px-6 py-4">
                <h2 className="text-xl font-bold text-white">Registered Technicians</h2>
                <p className="text-gray-400 text-sm">Total: {technicians.length}</p>
              </div>
              <div className="overflow-y-auto max-h-[500px]">
                {technicians.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-gray-500">No technicians registered yet</p>
                  </div>
                ) : (
                  technicians.map((tech) => (
                    <div key={tech._id} className="p-4 border-b hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-800">{tech.name}</h3>
                          <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                            <p className="text-gray-600"><Mail className="w-3 h-3 inline mr-1" /> {tech.email}</p>
                            <p className="text-gray-600"><Phone className="w-3 h-3 inline mr-1" /> {tech.contactNumber}</p>
                            <p className="text-gray-600"><MapPin className="w-3 h-3 inline mr-1" /> {tech.location}</p>
                            {tech.education && <p className="text-gray-600"><GraduationCap className="w-3 h-3 inline mr-1" /> {tech.education}</p>}
                            {tech.experience && <p className="text-gray-600"><Briefcase className="w-3 h-3 inline mr-1" /> {tech.experience}</p>}
                          </div>
                        </div>
                        <button onClick={() => deleteTechnician(tech._id)} className="text-red-600 hover:text-red-800 p-2">
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
    </div>
  )
}

export default RegisterTechnician