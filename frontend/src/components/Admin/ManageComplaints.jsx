import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
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

function ManageComplaints({ refreshDashboard }) {
  const [complaints, setComplaints] = useState([])
  const [filteredComplaints, setFilteredComplaints] = useState([])
  const [technicians, setTechnicians] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedComplaint, setSelectedComplaint] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [assigning, setAssigning] = useState(false)
  const [selectedTechnician, setSelectedTechnician] = useState(null)

  // Helper function to ensure data is always an array
  const ensureArray = (data) => {
    if (Array.isArray(data)) return data
    if (data?.data && Array.isArray(data.data)) return data.data
    if (data?.complaints && Array.isArray(data.complaints)) return data.complaints
    return []
  }

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
      const response = await API.get('/admin/complaints')
      const data = ensureArray(response.data)
      setComplaints(data)
      setFilteredComplaints(data)
    } catch (error) {
      console.error('Error fetching complaints:', error)
      toast.error(error.response?.data?.message || 'Failed to load complaints')
      setComplaints([])
      setFilteredComplaints([])
    } finally {
      setLoading(false)
    }
  }

  const fetchTechnicians = async () => {
    try {
      const response = await API.get('/admin/technicians')
      const data = ensureArray(response.data)
      // Filter only available technicians
      const availableTechs = data.filter(tech => tech.status === 'available')
      setTechnicians(availableTechs)
    } catch (error) {
      console.error('Error fetching technicians:', error)
      toast.error(error.response?.data?.message || 'Failed to load technicians')
      setTechnicians([])
    }
  }

  const filterComplaints = () => {
    let filtered = [...complaints]
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(c => c.status === selectedStatus)
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(c => 
        c._id?.toString().includes(term) ||
        c.complaintType?.toLowerCase().includes(term) ||
        c.userId?.name?.toLowerCase().includes(term) ||
        c.userId?.area?.toLowerCase().includes(term)
      )
    }
    setFilteredComplaints(filtered)
  }

  const assignTechnician = async (complaintId, technicianId) => {
    const complaint = complaints.find(c => c._id === complaintId)
    if (complaint?.technicianId) {
      toast.error('This complaint already has a technician assigned')
      return
    }

    setAssigning(true)
    setSelectedTechnician(technicianId)
    
    try {
      await API.post('/admin/assign', { 
        complaintId, 
        technicianId 
      })
      
      toast.success('Technician assigned successfully!')
      fetchComplaints()
      
      if (refreshDashboard) {
        refreshDashboard()
      }
      
      setShowAssignModal(false)
      setSelectedComplaint(null)
    } catch (error) {
      console.error('Error assigning technician:', error)
      toast.error(error.response?.data?.message || 'Failed to assign technician')
    } finally {
      setAssigning(false)
      setSelectedTechnician(null)
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

  const getStatusBadgeColor = (status) => {
    switch(status) {
      case 'Pending': return 'bg-yellow-600'
      case 'Assigned': return 'bg-blue-600'
      case 'InProgress': return 'bg-purple-600'
      case 'Completed': return 'bg-green-600'
      default: return 'bg-gray-600'
    }
  }

  const ComplaintMap = ({ complaint }) => {
    if (!complaint?.latitude && !complaint?.longitude) return null
    
    const position = [complaint.latitude, complaint.longitude]
    
    return (
      <MapContainer 
        key={`map-${complaint._id}`}
        center={position} 
        zoom={14} 
        style={{ height: "200px", width: "100%", borderRadius: "0.5rem", zIndex: 1 }}
        zoomControl={true}
        scrollWheelZoom={true}
      >
        <TileLayer 
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' 
        />
        <Marker position={position}>
          <Popup>
            <div className="text-sm">
              <b>Complaint Location</b>
              <br />
              {complaint.locationAddress || 'No address provided'}
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    )
  }

  const getButtonClass = (statusValue) => {
    const isActive = selectedStatus === statusValue
    const baseClass = 'px-4 py-2 rounded-lg font-medium transition'
    
    if (statusValue === 'all') {
      return isActive 
        ? `${baseClass} bg-gray-800 text-white`
        : `${baseClass} bg-gray-200 text-gray-700 hover:bg-gray-300`
    }
    
    const colorMap = {
      'Pending': 'yellow',
      'Assigned': 'blue',
      'InProgress': 'purple',
      'Completed': 'green'
    }
    
    const color = colorMap[statusValue] || 'gray'
    
    return isActive
      ? `${baseClass} bg-${color}-600 text-white`
      : `${baseClass} bg-gray-200 text-gray-700 hover:bg-gray-300`
  }

  if (loading) {
    return (
      <div className="min-h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 text-lg">Loading complaints...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Manage Complaints</h1>
        <p className="text-gray-600 mt-2">View, filter and assign complaints to technicians</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => setSelectedStatus('all')} 
              className={getButtonClass('all')}
            >
              All ({complaints.length})
            </button>
            <button 
              onClick={() => setSelectedStatus('Pending')} 
              className={getButtonClass('Pending')}
            >
              Pending ({complaints.filter(c => c.status === 'Pending').length})
            </button>
            <button 
              onClick={() => setSelectedStatus('Assigned')} 
              className={getButtonClass('Assigned')}
            >
              Assigned ({complaints.filter(c => c.status === 'Assigned').length})
            </button>
            <button 
              onClick={() => setSelectedStatus('InProgress')} 
              className={getButtonClass('InProgress')}
            >
              In Progress ({complaints.filter(c => c.status === 'InProgress').length})
            </button>
            <button 
              onClick={() => setSelectedStatus('Completed')} 
              className={getButtonClass('Completed')}
            >
              Completed ({complaints.filter(c => c.status === 'Completed').length})
            </button>
          </div>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search by ID, type, customer..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="px-4 py-2 pl-10 border rounded-lg w-64 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
            <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Complaints List */}
      <div className="space-y-4">
        {filteredComplaints.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-500 text-lg">No complaints found</p>
            <p className="text-gray-400 text-sm">Try adjusting your filters or search term</p>
          </div>
        ) : (
          filteredComplaints.map((complaint) => (
            <div key={complaint._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition">
              <div className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <span className="text-sm text-gray-500 font-mono">
                        Complaint #{complaint._id?.slice(-6)}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(complaint.status)}`}>
                        {complaint.status}
                      </span>
                      {complaint.technicianId && (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                          👤 {complaint.technicianId?.name || 'Assigned'}
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">{complaint.complaintType}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 mt-2">
                      <p className="text-gray-600">
                        <span className="font-medium">Customer:</span> {complaint.userId?.name || 'N/A'}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">Area:</span> {complaint.userId?.area || 'N/A'}
                      </p>
                      <p className="text-gray-500 text-sm col-span-2">
                        Submitted: {complaint.submittedAt ? new Date(complaint.submittedAt).toLocaleString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                  {complaint.status === 'Pending' && (
                    <button 
                      onClick={() => { setSelectedComplaint(complaint); setShowAssignModal(true) }} 
                      className="mt-3 md:mt-0 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition whitespace-nowrap"
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

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Submitted</span>
                    <span>Assigned</span>
                    <span>In Progress</span>
                    <span>Completed</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${getStatusBadgeColor(complaint.status)}`} 
                      style={{ width: getProgressWidth(complaint.status) }}
                    ></div>
                  </div>
                </div>

                {/* Location Map */}
                {(complaint.latitude || complaint.locationAddress) && (
                  <details className="mt-4 cursor-pointer">
                    <summary className="text-sm text-indigo-600 font-semibold hover:text-indigo-800">
                      📍 View Location
                    </summary>
                    <div className="mt-3">
                      <ComplaintMap complaint={complaint} />
                    </div>
                  </details>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Assign Modal */}
      {showAssignModal && selectedComplaint && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => { setShowAssignModal(false); setSelectedComplaint(null) }}>
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
              <h3 className="text-xl font-bold text-white">Assign Technician</h3>
              <p className="text-indigo-100 text-sm">Complaint #{selectedComplaint._id?.slice(-6)}</p>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <p className="text-gray-600"><span className="font-semibold">Type:</span> {selectedComplaint.complaintType}</p>
                <p className="text-gray-600"><span className="font-semibold">Customer:</span> {selectedComplaint.userId?.name || 'N/A'}</p>
              </div>
              
              <label className="block text-gray-700 font-semibold mb-2">Select Technician:</label>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {technicians.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No technicians available</p>
                    <p className="text-gray-400 text-sm mt-1">Please register a technician first</p>
                  </div>
                ) : (
                  technicians.map((tech) => (
                    <button 
                      key={tech._id} 
                      onClick={() => assignTechnician(selectedComplaint._id, tech._id)} 
                      disabled={assigning}
                      className="w-full text-left p-3 border rounded-lg hover:bg-indigo-50 transition disabled:opacity-50"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-gray-800">{tech.name}</p>
                          <p className="text-sm text-gray-600">
                            📍 {tech.location || 'N/A'} | 📞 {tech.contactNumber || 'N/A'}
                          </p>
                          {tech.assignedComplaints !== undefined && (
                            <p className="text-xs text-gray-500">
                              📋 {tech.assignedComplaints} active complaints
                            </p>
                          )}
                        </div>
                        {assigning && selectedTechnician === tech._id && (
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-indigo-600 border-t-transparent"></div>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
            <div className="border-t p-4 bg-gray-50">
              <button 
                onClick={() => { setShowAssignModal(false); setSelectedComplaint(null) }} 
                className="w-full bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition"
              >
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