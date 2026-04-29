import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { API_URL } from '../../config/api'

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

  useEffect(() => {
    fetchComplaint()
    fetchTechnicians()
  }, [id])

  const fetchComplaint = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_URL}/admin/complaint/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setComplaint(response.data)
    } catch (error) {
      console.error('Error fetching complaint:', error)
      toast.error('Complaint not found')
      navigate('/admin/complaints')
    } finally {
      setLoading(false)
    }
  }

  const fetchTechnicians = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_URL}/admin/technicians`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setTechnicians(response.data)
    } catch (error) {
      console.error('Error fetching technicians:', error)
      toast.error('Failed to load technicians')
    }
  }

  const handleAssign = async (technicianId) => {
    setAssigning(true)
    try {
      const token = localStorage.getItem('token')
      await axios.post(`${API_URL}/admin/assign`, 
        { 
          complaintId: id,  // MongoDB uses string ID, not parseInt
          technicianId: technicianId 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      toast.success('Technician assigned successfully!')
      navigate('/admin/complaints')
    } catch (error) {
      console.error('Error assigning technician:', error)
      toast.error(error.response?.data?.message || 'Failed to assign technician')
    } finally {
      setAssigning(false)
    }
  }

  const ComplaintMap = () => {
    if (!complaint?.latitude || !complaint?.longitude) return null
    
    return (
      <MapContainer
        center={[complaint.latitude, complaint.longitude]}
        zoom={14}
        style={{ height: "300px", width: "100%", borderRadius: "0.5rem" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        <Marker position={[complaint.latitude, complaint.longitude]} />
      </MapContainer>
    )
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/admin/complaints')}
          className="mb-6 text-indigo-600 hover:text-indigo-800 flex items-center gap-2"
        >
          ← Back to Complaints
        </button>

        {/* Complaint Details */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
            <h2 className="text-xl font-bold text-white">Complaint Details</h2>
            <p className="text-indigo-100">#{complaint?._id?.slice(-6)} - {complaint?.complaintType}</p>
          </div>
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500">Customer Name</p>
                <p className="font-semibold">{complaint?.userId?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Contact</p>
                <p className="font-semibold">{complaint?.userId?.mobile}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Area</p>
                <p className="font-semibold">{complaint?.userId?.area}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Submitted</p>
                <p className="font-semibold">{new Date(complaint?.submittedAt).toLocaleString()}</p>
              </div>
            </div>
            
            {complaint?.description && (
              <div className="mb-4">
                <p className="text-sm text-gray-500">Description</p>
                <p className="text-gray-700">{complaint.description}</p>
              </div>
            )}
            
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-2">Location</p>
              <ComplaintMap />
              {complaint?.locationAddress && (
                <p className="text-gray-500 text-xs mt-2">{complaint.locationAddress}</p>
              )}
            </div>
          </div>
        </div>

        {/* Available Technicians */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gray-800 px-6 py-4">
            <h3 className="text-xl font-bold text-white">Available Technicians</h3>
            <p className="text-gray-400 text-sm">Select a technician to assign</p>
          </div>
          
          <div className="p-6 space-y-3">
            {technicians.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No technicians available</p>
                <button
                  onClick={() => navigate('/admin/register-technician')}
                  className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg"
                >
                  Register Technician
                </button>
              </div>
            ) : (
              technicians.map((tech) => (
                <div key={tech._id} className="border rounded-lg p-4 hover:shadow-md transition">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-gray-800">{tech.name}</h4>
                      <div className="grid grid-cols-2 gap-2 mt-1 text-sm">
                        <p className="text-gray-600">📞 {tech.contactNumber}</p>
                        <p className="text-gray-600">📍 {tech.location}</p>
                        {tech.education && <p className="text-gray-600">🎓 {tech.education}</p>}
                        {tech.experience && <p className="text-gray-600">💼 {tech.experience}</p>}
                      </div>
                    </div>
                    <button
                      onClick={() => handleAssign(tech._id)}
                      disabled={assigning}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                    >
                      {assigning ? 'Assigning...' : 'Assign'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AssignTechnician