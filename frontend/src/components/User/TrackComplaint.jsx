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

function TrackComplaint() {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedComplaint, setSelectedComplaint] = useState(null)

  useEffect(() => {
    fetchComplaints()
    const interval = setInterval(fetchComplaints, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchComplaints = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_URL}/user/complaints`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setComplaints(response.data)
    } catch (error) {
      console.error('Error fetching complaints:', error)
      toast.error('Failed to load complaints')
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
    
    const lat = complaint.latitude || 19.9975
    const lng = complaint.longitude || 73.7898
    
    return (
      <MapContainer
        center={[lat, lng]}
        zoom={15}
        style={{ height: "200px", width: "100%", borderRadius: "0.5rem", zIndex: 1 }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        <Marker position={[lat, lng]}>
          <Popup>
            <b>Complaint Location</b><br />
            {complaint.locationAddress || `${lat}, ${lng}`}
          </Popup>
        </Marker>
      </MapContainer>
    )
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
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6">
            <h1 className="text-3xl font-bold text-white">Track Complaints</h1>
            <p className="text-indigo-100 mt-2">Real-time status of your complaints</p>
          </div>

          <div className="p-8">
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
                {complaints.map((complaint) => (
                  <div key={complaint._id} className="border rounded-xl overflow-hidden hover:shadow-lg transition">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-sm text-gray-500">Complaint #{complaint._id?.slice(-6)}</span>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(complaint.status)}`}>
                              {complaint.status}
                            </span>
                          </div>
                          <h3 className="text-xl font-bold text-gray-800">{complaint.complaintType}</h3>
                          <p className="text-gray-500 text-sm mt-1">
                            Submitted: {new Date(complaint.submittedAt).toLocaleString()}
                          </p>
                        </div>
                        <button
                          onClick={() => setSelectedComplaint(selectedComplaint?._id === complaint._id ? null : complaint)}
                          className="text-indigo-600 hover:text-indigo-800"
                        >
                          {selectedComplaint?._id === complaint._id ? 'Hide Details ▲' : 'View Details ▼'}
                        </button>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-4">
                        <div className="flex justify-between text-xs text-gray-600 mb-2">
                          <span className="text-center flex-1">Submitted</span>
                          <span className="text-center flex-1">Assigned</span>
                          <span className="text-center flex-1">In Progress</span>
                          <span className="text-center flex-1">Completed</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                            style={{ width: getProgressWidth(complaint.status) }}
                          />
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {selectedComplaint?._id === complaint._id && (
                        <div className="mt-6 pt-4 border-t space-y-4">
                          {complaint.description && (
                            <div>
                              <p className="text-gray-600 font-semibold">Description:</p>
                              <p className="text-gray-700">{complaint.description}</p>
                            </div>
                          )}

                          {complaint.imageUrl && (
                            <div>
                              <p className="text-gray-600 font-semibold">Uploaded Image:</p>
                              <img 
                                src={`${API_URL.replace('/api', '')}${complaint.imageUrl}`} 
                                alt="Complaint" 
                                className="max-h-48 rounded-lg mt-2 border border-gray-200"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = 'https://via.placeholder.com/200?text=Image+Not+Found';
                                }}
                              />
                            </div>
                          )}

                          {(complaint.latitude || complaint.locationAddress) && (
                            <div>
                              <p className="text-gray-600 font-semibold mb-2">Location:</p>
                              <ComplaintMap complaint={complaint} />
                              {complaint.locationAddress && (
                                <p className="text-gray-500 text-xs mt-2">{complaint.locationAddress}</p>
                              )}
                            </div>
                          )}

                          {complaint.technicianRemarks && (
                            <div className="bg-blue-50 rounded-lg p-3">
                              <p className="text-blue-800 font-semibold">Technician Remarks:</p>
                              <p className="text-gray-700">{complaint.technicianRemarks}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Summary Stats */}
        {complaints.length > 0 && (
          <div className="mt-6 grid grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 text-center shadow">
              <div className="text-2xl font-bold text-gray-800">{complaints.length}</div>
              <div className="text-sm text-gray-500">Total</div>
            </div>
            <div className="bg-white rounded-xl p-4 text-center shadow">
              <div className="text-2xl font-bold text-yellow-600">{complaints.filter(c => c.status === 'Pending').length}</div>
              <div className="text-sm text-gray-500">Pending</div>
            </div>
            <div className="bg-white rounded-xl p-4 text-center shadow">
              <div className="text-2xl font-bold text-blue-600">{complaints.filter(c => c.status === 'InProgress' || c.status === 'Assigned').length}</div>
              <div className="text-sm text-gray-500">In Progress</div>
            </div>
            <div className="bg-white rounded-xl p-4 text-center shadow">
              <div className="text-2xl font-bold text-green-600">{complaints.filter(c => c.status === 'Completed').length}</div>
              <div className="text-sm text-gray-500">Completed</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TrackComplaint