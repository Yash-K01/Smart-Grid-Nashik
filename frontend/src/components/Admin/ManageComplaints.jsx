import React, { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { API_URL } from '../../config/api'

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

function ManageComplaints() {
  const [complaints, setComplaints] = useState([])
  const [filteredComplaints, setFilteredComplaints] = useState([])
  const [technicians, setTechnicians] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedComplaint, setSelectedComplaint] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchComplaints()
    fetchTechnicians()
  }, [])

  useEffect(() => {
    filterComplaints()
  }, [complaints, selectedStatus, searchTerm])

  const fetchComplaints = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_URL}/admin/complaints`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setComplaints(response.data)
      setFilteredComplaints(response.data)
    } catch (error) {
      console.error('Error fetching complaints:', error)
      toast.error('Failed to load complaints')
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
    }
  }

  const filterComplaints = () => {
    let filtered = [...complaints]
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(c => c.status === selectedStatus)
    }
    if (searchTerm) {
      filtered = filtered.filter(c => 
        c._id?.toString().includes(searchTerm) ||
        c.complaintType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    setFilteredComplaints(filtered)
  }

  const assignTechnician = async (complaintId, technicianId) => {
    try {
      const token = localStorage.getItem('token')
      await axios.post(`${API_URL}/admin/assign`, 
        { complaintId, technicianId },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      toast.success('Technician assigned successfully!')
      fetchComplaints()
      setShowAssignModal(false)
      setSelectedComplaint(null)
    } catch (error) {
      console.error('Error assigning technician:', error)
      toast.error('Failed to assign technician')
    }
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800'
      case 'Assigned': return 'bg-blue-100 text-blue-800'
      case 'InProgress': return 'bg-purple-100 text-purple-800'
      case 'Completed': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getProgressWidth = (status) => {
    switch(status) {
      case 'Pending': return '25%'
      case 'Assigned': return '50%'
      case 'InProgress': return '75%'
      case 'Completed': return '100%'
      default: return '0%'
    }
  }

  const ComplaintMap = ({ complaint }) => {
    if (!complaint?.latitude && !complaint?.longitude) return null
    return (
      <MapContainer center={[complaint.latitude, complaint.longitude]} zoom={14} style={{ height: "200px", width: "100%", borderRadius: "0.5rem", zIndex: 1 }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors' />
        <Marker position={[complaint.latitude, complaint.longitude]}>
          <Popup><b>Complaint Location</b><br />{complaint.locationAddress}</Popup>
        </Marker>
      </MapContainer>
    )
  }

  // Fixed status buttons with explicit colors (not dynamic Tailwind classes)
  const getButtonClass = (statusValue, statusLabel) => {
    const isActive = selectedStatus === statusValue
    if (statusValue === 'all') {
      return isActive 
        ? 'px-4 py-2 rounded-lg font-medium transition bg-gray-800 text-white'
        : 'px-4 py-2 rounded-lg font-medium transition bg-gray-200 text-gray-700 hover:bg-gray-300'
    }
    if (statusValue === 'Pending') {
      return isActive
        ? 'px-4 py-2 rounded-lg font-medium transition bg-yellow-600 text-white'
        : 'px-4 py-2 rounded-lg font-medium transition bg-gray-200 text-gray-700 hover:bg-gray-300'
    }
    if (statusValue === 'Assigned') {
      return isActive
        ? 'px-4 py-2 rounded-lg font-medium transition bg-blue-600 text-white'
        : 'px-4 py-2 rounded-lg font-medium transition bg-gray-200 text-gray-700 hover:bg-gray-300'
    }
    if (statusValue === 'InProgress') {
      return isActive
        ? 'px-4 py-2 rounded-lg font-medium transition bg-purple-600 text-white'
        : 'px-4 py-2 rounded-lg font-medium transition bg-gray-200 text-gray-700 hover:bg-gray-300'
    }
    if (statusValue === 'Completed') {
      return isActive
        ? 'px-4 py-2 rounded-lg font-medium transition bg-green-600 text-white'
        : 'px-4 py-2 rounded-lg font-medium transition bg-gray-200 text-gray-700 hover:bg-gray-300'
    }
    return 'px-4 py-2 rounded-lg font-medium transition bg-gray-200 text-gray-700 hover:bg-gray-300'
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading complaints...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Manage Complaints</h1>
          <p className="text-gray-600 mt-2">View, filter and assign complaints to technicians</p>
        </div>

        {/* Filters - Fixed Buttons */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => setSelectedStatus('all')} 
                className={getButtonClass('all', 'All')}
              >
                All ({complaints.length})
              </button>
              <button 
                onClick={() => setSelectedStatus('Pending')} 
                className={getButtonClass('Pending', 'Pending')}
              >
                Pending ({complaints.filter(c => c.status === 'Pending').length})
              </button>
              <button 
                onClick={() => setSelectedStatus('Assigned')} 
                className={getButtonClass('Assigned', 'Assigned')}
              >
                Assigned ({complaints.filter(c => c.status === 'Assigned').length})
              </button>
              <button 
                onClick={() => setSelectedStatus('InProgress')} 
                className={getButtonClass('InProgress', 'InProgress')}
              >
                In Progress ({complaints.filter(c => c.status === 'InProgress').length})
              </button>
              <button 
                onClick={() => setSelectedStatus('Completed')} 
                className={getButtonClass('Completed', 'Completed')}
              >
                Completed ({complaints.filter(c => c.status === 'Completed').length})
              </button>
            </div>
            <input 
              type="text" 
              placeholder="Search by ID, type, or customer..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="px-4 py-2 pl-10 border rounded-lg w-64 focus:ring-2 focus:ring-indigo-500" 
            />
          </div>
        </div>

        {/* Complaints List */}
        <div className="space-y-4">
          {filteredComplaints.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <p className="text-gray-500">No complaints found</p>
            </div>
          ) : (
            filteredComplaints.map((complaint) => (
              <div key={complaint._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm text-gray-500 font-mono">Complaint #{complaint._id?.slice(-6)}</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(complaint.status)}`}>{complaint.status}</span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-800">{complaint.complaintType}</h3>
                      <p className="text-gray-600 mt-1"><span className="font-medium">Customer:</span> {complaint.userId?.name}</p>
                      <p className="text-gray-600"><span className="font-medium">Area:</span> {complaint.userId?.area}</p>
                      <p className="text-gray-500 text-sm mt-1">Submitted: {new Date(complaint.submittedAt).toLocaleString()}</p>
                    </div>
                    {complaint.status === 'Pending' && (
                      <button 
                        onClick={() => { setSelectedComplaint(complaint); setShowAssignModal(true) }} 
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                      >
                        Assign Technician
                      </button>
                    )}
                  </div>

                  {complaint.description && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <p className="text-gray-600 text-sm">{complaint.description}</p>
                    </div>
                  )}

                  {/* IMAGE DISPLAY FOR ADMIN */}
                  {complaint.imageUrl && (
                    <div className="mb-4">
                      <p className="text-gray-600 text-sm font-semibold">📷 Complaint Image:</p>
                      <img 
                        src={`http://localhost:5000${complaint.imageUrl}`} 
                        alt="Complaint" 
                        className="max-h-48 rounded-lg mt-1 border border-gray-200 shadow-sm"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/200x150?text=No+Image';
                        }}
                      />
                    </div>
                  )}

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Submitted</span>
                      <span>Assigned</span>
                      <span>In Progress</span>
                      <span>Completed</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500" style={{ width: getProgressWidth(complaint.status) }}></div>
                    </div>
                  </div>

                  {/* Location Map */}
                  {(complaint.latitude || complaint.locationAddress) && (
                    <details className="mt-4 cursor-pointer">
                      <summary className="text-sm text-indigo-600 font-semibold">📍 View Location</summary>
                      <div className="mt-3"><ComplaintMap complaint={complaint} /></div>
                    </details>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Assign Modal */}
      {showAssignModal && selectedComplaint && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
              <h3 className="text-xl font-bold text-white">Assign Technician</h3>
              <p className="text-indigo-100 text-sm">Complaint #{selectedComplaint._id?.slice(-6)}</p>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4"><span className="font-semibold">Type:</span> {selectedComplaint.complaintType}</p>
              <p className="text-gray-600 mb-4"><span className="font-semibold">Customer:</span> {selectedComplaint.userId?.name}</p>
              
              {/* Image in Assign Modal */}
              {selectedComplaint.imageUrl && (
                <div className="mb-4">
                  <p className="text-gray-600 text-sm font-semibold">📷 Complaint Image:</p>
                  <img 
                    src={`http://localhost:5000${selectedComplaint.imageUrl}`} 
                    alt="Complaint" 
                    className="max-h-32 rounded-lg mt-1 border border-gray-200"
                  />
                </div>
              )}
              
              <label className="block text-gray-700 font-semibold mb-2">Select Technician:</label>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {technicians.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No technicians available</p>
                ) : (
                  technicians.map((tech) => (
                    <button 
                      key={tech._id} 
                      onClick={() => assignTechnician(selectedComplaint._id, tech._id)} 
                      className="w-full text-left p-3 border rounded-lg hover:bg-indigo-50 transition"
                    >
                      <p className="font-semibold">{tech.name}</p>
                      <p className="text-sm text-gray-600">{tech.location} | {tech.contactNumber}</p>
                    </button>
                  ))
                )}
              </div>
            </div>
            <div className="border-t p-4 bg-gray-50">
              <button onClick={() => { setShowAssignModal(false); setSelectedComplaint(null) }} className="w-full bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ManageComplaints