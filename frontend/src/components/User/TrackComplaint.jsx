import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import API from '../../config/api' // Use API instance instead of axios

// Fix Leaflet default icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

function TrackComplaint() {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedComplaint, setSelectedComplaint] = useState(null)
  const [error, setError] = useState(null)

  // Helper function to get image URL
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null
    // If it's already a full URL, return as is
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl
    }
    // Remove leading slash if present to avoid double slashes
    const cleanPath = imageUrl.startsWith('/') ? imageUrl.substring(1) : imageUrl
    // Use the baseURL from API instance
    const baseURL = API.defaults.baseURL
    // Remove trailing slash from baseURL if present
    const cleanBase = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL
    return `${cleanBase}/${cleanPath}`
  }

  useEffect(() => {
    fetchComplaints()
    const interval = setInterval(fetchComplaints, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleError = (error) => {
    console.error('Error:', error)
    if (!error.response) {
      toast.error('Network Error - Please check your connection')
    } else if (error.response.status === 401) {
      toast.error('Session expired - Please login again')
    } else {
      toast.error(error.response?.data?.message || 'Failed to load complaints')
    }
  }

  const fetchComplaints = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        toast.error('Please login again')
        return
      }

      const response = await API.get('/user/complaints')
      setComplaints(response.data)
      setError(null)
    } catch (error) {
      handleError(error)
      setError('Failed to load complaints')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800'
      case 'Assigned': return 'bg-blue-100 text-blue-800'
      case 'InProgress': return 'bg-purple-100 text-purple-800'
      case 'Completed': return 'bg-green-100 text-green-800'
      case 'Rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Pending': return '⏳'
      case 'Assigned': return '📋'
      case 'InProgress': return '🔧'
      case 'Completed': return '✅'
      case 'Rejected': return '❌'
      default: return '📌'
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

  const getProgressStep = (status) => {
    switch(status) {
      case 'Pending': return 1
      case 'Assigned': return 2
      case 'InProgress': return 3
      case 'Completed': return 4
      default: return 0
    }
  }

  const ComplaintMap = ({ complaint }) => {
    if (!complaint?.latitude && !complaint?.longitude) return null
    
    const lat = complaint.latitude || 19.9975
    const lng = complaint.longitude || 73.7898
    const position = [lat, lng]
    
    return (
      <MapContainer
        key={`map-${complaint._id}`}
        center={position}
        zoom={15}
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
              {complaint.locationAddress || `${lat}, ${lng}`}
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    )
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 text-lg">Loading complaints...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6">
            <h1 className="text-3xl font-bold text-white">Track Complaints</h1>
            <p className="text-indigo-100 mt-2">Real-time status of your complaints</p>
          </div>

          <div className="p-8">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center mb-6">
                <p className="text-red-600 font-semibold">{error}</p>
                <button
                  onClick={fetchComplaints}
                  className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                >
                  Retry
                </button>
              </div>
            )}

            {complaints.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-24 h-24 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No Complaints Found</h3>
                <p className="text-gray-600">You haven't submitted any complaints yet.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {complaints.map((complaint) => {
                  const isExpanded = selectedComplaint?._id === complaint._id
                  const progressStep = getProgressStep(complaint.status)
                  
                  return (
                    <div key={complaint._id} className="border rounded-xl overflow-hidden hover:shadow-lg transition">
                      <div className="p-6">
                        <div className="flex flex-col md:flex-row justify-between items-start mb-4">
                          <div className="flex-1 w-full">
                            <div className="flex flex-wrap items-center gap-3 mb-2">
                              <span className="text-sm text-gray-500 font-mono">
                                Complaint #{complaint._id?.slice(-6)}
                              </span>
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(complaint.status)}`}>
                                {getStatusIcon(complaint.status)} {complaint.status}
                              </span>
                              {complaint.technicianId && (
                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                                  👤 {complaint.technicianId?.name || 'Assigned'}
                                </span>
                              )}
                            </div>
                            <h3 className="text-xl font-bold text-gray-800">{complaint.complaintType}</h3>
                            <p className="text-gray-500 text-sm mt-1">
                              Submitted: {complaint.submittedAt ? new Date(complaint.submittedAt).toLocaleString() : 'N/A'}
                            </p>
                          </div>
                          <button
                            onClick={() => setSelectedComplaint(isExpanded ? null : complaint)}
                            className="mt-3 md:mt-0 text-indigo-600 hover:text-indigo-800 font-medium text-sm flex items-center gap-1"
                          >
                            {isExpanded ? 'Hide Details ▲' : 'View Details ▼'}
                          </button>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-4">
                          <div className="flex justify-between text-xs text-gray-600 mb-2">
                            <span className={`text-center flex-1 ${progressStep >= 1 ? 'text-indigo-600 font-semibold' : ''}`}>
                              Submitted
                            </span>
                            <span className={`text-center flex-1 ${progressStep >= 2 ? 'text-indigo-600 font-semibold' : ''}`}>
                              Assigned
                            </span>
                            <span className={`text-center flex-1 ${progressStep >= 3 ? 'text-indigo-600 font-semibold' : ''}`}>
                              In Progress
                            </span>
                            <span className={`text-center flex-1 ${progressStep >= 4 ? 'text-indigo-600 font-semibold' : ''}`}>
                              Completed
                            </span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                              style={{ width: getProgressWidth(complaint.status) }}
                            />
                          </div>
                        </div>

                        {/* Expanded Details */}
                        {isExpanded && (
                          <div className="mt-6 pt-4 border-t space-y-4">
                            {complaint.description && (
                              <div>
                                <p className="text-gray-600 font-semibold text-sm">Description:</p>
                                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg mt-1">
                                  {complaint.description}
                                </p>
                              </div>
                            )}

                            {complaint.imageUrl && (
                              <div>
                                <p className="text-gray-600 font-semibold text-sm">📷 Uploaded Image:</p>
                                <img 
                                  src={getImageUrl(complaint.imageUrl)} 
                                  alt="Complaint" 
                                  className="max-h-48 rounded-lg mt-2 border border-gray-200 shadow-sm"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = 'https://via.placeholder.com/200x150?text=No+Image';
                                  }}
                                />
                              </div>
                            )}

                            {(complaint.latitude || complaint.locationAddress) && (
                              <div>
                                <p className="text-gray-600 font-semibold text-sm mb-2">📍 Location:</p>
                                <ComplaintMap complaint={complaint} />
                                {complaint.locationAddress && (
                                  <p className="text-gray-500 text-xs mt-2 break-words">
                                    {complaint.locationAddress}
                                  </p>
                                )}
                              </div>
                            )}

                            {complaint.technicianRemarks && (
                              <div className={`rounded-lg p-3 ${complaint.status === 'Completed' ? 'bg-green-50' : 'bg-blue-50'}`}>
                                <p className={`text-sm font-semibold ${complaint.status === 'Completed' ? 'text-green-800' : 'text-blue-800'}`}>
                                  📝 Technician Remarks:
                                </p>
                                <p className="text-gray-700">{complaint.technicianRemarks}</p>
                              </div>
                            )}

                            {/* Timestamps */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                              {complaint.submittedAt && (
                                <div>
                                  <p className="text-gray-500">Submitted On</p>
                                  <p className="font-medium">{new Date(complaint.submittedAt).toLocaleString()}</p>
                                </div>
                              )}
                              {complaint.assignedAt && (
                                <div>
                                  <p className="text-gray-500">Assigned On</p>
                                  <p className="font-medium">{new Date(complaint.assignedAt).toLocaleString()}</p>
                                </div>
                              )}
                              {complaint.completedAt && (
                                <div>
                                  <p className="text-gray-500">Completed On</p>
                                  <p className="font-medium">{new Date(complaint.completedAt).toLocaleString()}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Summary Stats */}
        {complaints.length > 0 && (
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 text-center shadow hover:shadow-lg transition">
              <div className="text-2xl font-bold text-gray-800">{complaints.length}</div>
              <div className="text-sm text-gray-500">Total</div>
            </div>
            <div className="bg-white rounded-xl p-4 text-center shadow hover:shadow-lg transition">
              <div className="text-2xl font-bold text-yellow-600">
                {complaints.filter(c => c.status === 'Pending').length}
              </div>
              <div className="text-sm text-gray-500">Pending</div>
            </div>
            <div className="bg-white rounded-xl p-4 text-center shadow hover:shadow-lg transition">
              <div className="text-2xl font-bold text-blue-600">
                {complaints.filter(c => c.status === 'InProgress' || c.status === 'Assigned').length}
              </div>
              <div className="text-sm text-gray-500">In Progress</div>
            </div>
            <div className="bg-white rounded-xl p-4 text-center shadow hover:shadow-lg transition">
              <div className="text-2xl font-bold text-green-600">
                {complaints.filter(c => c.status === 'Completed').length}
              </div>
              <div className="text-sm text-gray-500">Completed</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TrackComplaint