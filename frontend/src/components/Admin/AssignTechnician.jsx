import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import API from '../../config/api'

// Fix Leaflet default icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

function AssignTechnician() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [complaint, setComplaint] = useState(null)
  const [technicians, setTechnicians] = useState([])
  const [loading, setLoading] = useState(true)
  const [assigning, setAssigning] = useState(false)
  const [selectedTechnician, setSelectedTechnician] = useState(null)

  // Helper function to ensure data is always an array
  const ensureArray = (data) => {
    if (Array.isArray(data)) return data
    if (data?.data && Array.isArray(data.data)) return data.data
    if (data?.technicians && Array.isArray(data.technicians)) return data.technicians
    return []
  }

  useEffect(() => {
    fetchComplaint()
    fetchTechnicians()
  }, [id])

  const fetchComplaint = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        toast.error('Please login again')
        navigate('/login')
        return
      }

      const response = await API.get(`/admin/complaint/${id}`)
      
      // Handle response with data wrapper
      const complaintData = response.data?.data || response.data
      setComplaint(complaintData)
    } catch (error) {
      console.error('Error fetching complaint:', error)
      const errorMessage = error.response?.data?.message || 'Complaint not found'
      toast.error(errorMessage)
      navigate('/admin/complaints')
    } finally {
      setLoading(false)
    }
  }

  const fetchTechnicians = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        toast.error('Please login again')
        navigate('/login')
        return
      }

      const response = await API.get('/admin/technicians')
      console.log('📊 Technicians response:', response.data)
      
      // Extract technicians array using ensureArray
      const techs = ensureArray(response.data)
      console.log('👥 All technicians:', techs)
      
      // Filter only available technicians
      const availableTechs = techs.filter(tech => tech.status === 'available')
      console.log('✅ Available technicians:', availableTechs)
      
      setTechnicians(availableTechs)
    } catch (error) {
      console.error('Error fetching technicians:', error)
      toast.error(error.response?.data?.message || 'Failed to load technicians')
      setTechnicians([])
    }
  }

  const handleAssign = async (technicianId) => {
    // Check if complaint already has a technician assigned (using assignedTechnicianId)
    if (complaint?.assignedTechnicianId) {
      toast.error('This complaint already has a technician assigned')
      return
    }

    setAssigning(true)
    setSelectedTechnician(technicianId)
    
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        toast.error('Please login again')
        navigate('/login')
        return
      }

      await API.post('/admin/assign', 
        { 
          complaintId: id,
          technicianId: technicianId 
        }
      )
      
      toast.success('Technician assigned successfully!')
      
      // Navigate back to complaints list after successful assignment
      setTimeout(() => {
        navigate('/admin/complaints')
      }, 1000)
      
    } catch (error) {
      console.error('Error assigning technician:', error)
      toast.error(error.response?.data?.message || 'Failed to assign technician')
    } finally {
      setAssigning(false)
      setSelectedTechnician(null)
    }
  }

  // Map Component
  const ComplaintMap = () => {
    if (!complaint?.latitude || !complaint?.longitude) return null
    
    const position = [complaint.latitude, complaint.longitude]
    
    return (
      <MapContainer
        key={`map-${complaint._id}`}
        center={position}
        zoom={14}
        style={{ height: "300px", width: "100%", borderRadius: "0.5rem" }}
        zoomControl={true}
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={position} />
      </MapContainer>
    )
  }

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 text-lg">Loading complaint details...</p>
        </div>
      </div>
    )
  }

  // If complaint not found
  if (!complaint) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg">
          <p className="text-gray-600 text-lg mb-4">Complaint not found</p>
          <button
            onClick={() => navigate('/admin/complaints')}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate('/admin/complaints')}
            className="mb-6 text-indigo-600 hover:text-indigo-800 flex items-center gap-2 font-medium transition"
          >
            <span>←</span> Back to Complaints
          </button>

          {/* Complaint Details */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-white">Complaint Details</h2>
                  <p className="text-indigo-100 text-sm">
                    #{complaint?._id?.slice(-6)} - {complaint?.complaintType}
                  </p>
                </div>
                <div className="bg-white/20 px-3 py-1 rounded-full">
                  <span className="text-white text-sm font-semibold">
                    Status: {complaint?.status || 'Pending'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Customer Name</p>
                  <p className="font-semibold text-gray-800">
                    {complaint?.userId?.name || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Contact</p>
                  <p className="font-semibold text-gray-800">
                    {complaint?.userId?.mobile || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Area</p>
                  <p className="font-semibold text-gray-800">
                    {complaint?.userId?.area || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Submitted</p>
                  <p className="font-semibold text-gray-800">
                    {complaint?.submittedAt ? new Date(complaint.submittedAt).toLocaleString() : 'N/A'}
                  </p>
                </div>
              </div>
              
              {complaint?.description && (
                <div className="mb-4">
                  <p className="text-sm text-gray-500">Description</p>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg mt-1">
                    {complaint.description}
                  </p>
                </div>
              )}
              
              {/* Map Section */}
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-2">Location</p>
                <ComplaintMap />
                {complaint?.address && (
                  <p className="text-gray-500 text-xs mt-2 flex items-center gap-1">
                    <span>📍</span> {complaint.address}
                  </p>
                )}
              </div>

              {/* Technician Assignment Status */}
              {complaint?.assignedTechnicianId && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-700">
                    <span className="font-semibold">Already Assigned:</span> 
                    {' '}{complaint.assignedTechnicianId?.name || 'Technician assigned'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Available Technicians */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gray-800 px-6 py-4 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-white">Available Technicians</h3>
                <p className="text-gray-400 text-sm">
                  {technicians.length} technician{technicians.length !== 1 ? 's' : ''} available
                </p>
              </div>
              <button
                onClick={() => navigate('/admin/register-technician')}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm"
              >
                + Register New
              </button>
            </div>
            
            <div className="p-6 space-y-3">
              {technicians.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <svg className="w-16 h-16 mx-auto opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-lg">No technicians available</p>
                  <p className="text-gray-400 text-sm mt-1">Register a new technician to assign</p>
                  <button
                    onClick={() => navigate('/admin/register-technician')}
                    className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
                  >
                    Register Technician
                  </button>
                </div>
              ) : (
                technicians.map((tech) => (
                  <div key={tech._id} className="border rounded-lg p-4 hover:shadow-md transition">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-gray-800 text-lg">{tech.name}</h4>
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                            Available
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 text-sm">
                          <p className="text-gray-600 flex items-center gap-1">
                            <span>📞</span> {tech.contactNumber || 'N/A'}
                          </p>
                          <p className="text-gray-600 flex items-center gap-1">
                            <span>📍</span> {tech.location || 'N/A'}
                          </p>
                          {tech.education && (
                            <p className="text-gray-600 flex items-center gap-1">
                              <span>🎓</span> {tech.education}
                            </p>
                          )}
                          {tech.experience && (
                            <p className="text-gray-600 flex items-center gap-1">
                              <span>💼</span> {tech.experience}
                            </p>
                          )}
                          {tech.assignedComplaints !== undefined && (
                            <p className="text-gray-600 flex items-center gap-1">
                              <span>📋</span> {tech.assignedComplaints} active complaints
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleAssign(tech._id)}
                        disabled={assigning || complaint?.assignedTechnicianId}
                        className={`px-6 py-2 rounded-lg transition font-medium whitespace-nowrap ${
                          assigning && selectedTechnician === tech._id
                            ? 'bg-gray-400 cursor-not-allowed'
                            : complaint?.assignedTechnicianId
                            ? 'bg-gray-300 cursor-not-allowed'
                            : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                      >
                        {assigning && selectedTechnician === tech._id ? (
                          <span className="flex items-center gap-2">
                            <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                            Assigning...
                          </span>
                        ) : complaint?.assignedTechnicianId ? (
                          'Already Assigned'
                        ) : (
                          'Assign'
                        )}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AssignTechnician