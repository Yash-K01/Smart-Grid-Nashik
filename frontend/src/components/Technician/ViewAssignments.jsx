import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { CheckCircle, XCircle, Clock, MapPin, Phone, User, AlertCircle, Loader, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react'
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

function ViewAssignments({ mode = 'all' }) {
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState(null)
  const [expandedId, setExpandedId] = useState(null)
  const [filter, setFilter] = useState('all')
  const [showRemarkModal, setShowRemarkModal] = useState(false)
  const [selectedComplaint, setSelectedComplaint] = useState(null)
  const [remark, setRemark] = useState('')
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchAssignments()
    const interval = setInterval(fetchAssignments, 15000)
    return () => clearInterval(interval)
  }, [])

  const handleError = (error) => {
    console.error('Error:', error)
    if (!error.response) {
      toast.error('Network Error - Please check your connection')
    } else if (error.response.status === 401) {
      toast.error('Session expired - Please login again')
    } else {
      toast.error(error.response?.data?.message || 'Something went wrong')
    }
  }

  const fetchAssignments = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        toast.error('Please login again')
        return
      }

      const response = await API.get('/technician/complaints', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setAssignments(response.data)
      setError(null)
    } catch (error) {
      handleError(error)
      setError('Failed to load assignments')
    } finally {
      setLoading(false)
    }
  }

  const acceptWork = async (id) => {
    setProcessingId(id)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        toast.error('Please login again')
        return
      }

      await API.put(`/technician/accept/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast.success('Work accepted! Status updated to In Progress')
      fetchAssignments()
    } catch (error) {
      console.error('Error accepting work:', error)
      toast.error(error.response?.data?.message || 'Failed to accept work')
    } finally {
      setProcessingId(null)
    }
  }

  const rejectWork = async (id) => {
    const reason = prompt('Enter reason for rejection:')
    if (!reason) {
      toast.error('Rejection reason is required')
      return
    }
    
    setProcessingId(id)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        toast.error('Please login again')
        return
      }

      await API.put(`/technician/reject/${id}`, { reason }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast.success('Work rejected! Complaint sent back to admin')
      fetchAssignments()
    } catch (error) {
      console.error('Error rejecting work:', error)
      toast.error(error.response?.data?.message || 'Failed to reject work')
    } finally {
      setProcessingId(null)
    }
  }

  const openRemarkModal = (complaint) => {
    setSelectedComplaint(complaint)
    setRemark('')
    setShowRemarkModal(true)
  }

  const completeWork = async () => {
    if (!remark.trim()) {
      toast.error('Please enter completion remarks')
      return
    }
    
    setProcessingId(selectedComplaint._id)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        toast.error('Please login again')
        return
      }

      await API.put(`/technician/complete/${selectedComplaint._id}`, { remarks: remark }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast.success('Work completed successfully! Customer will be notified')
      fetchAssignments()
      setShowRemarkModal(false)
      setSelectedComplaint(null)
      setRemark('')
    } catch (error) {
      console.error('Error completing work:', error)
      toast.error(error.response?.data?.message || 'Failed to complete work')
    } finally {
      setProcessingId(null)
    }
  }

  const getFilteredAssignments = () => {
    if (mode === 'update') {
      return assignments.filter(a => a.status === 'InProgress')
    }
    
    if (filter === 'all') return assignments
    if (filter === 'pending') return assignments.filter(a => a.status === 'Assigned')
    if (filter === 'progress') return assignments.filter(a => a.status === 'InProgress')
    if (filter === 'completed') return assignments.filter(a => a.status === 'Completed')
    return assignments
  }

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Assigned':
        return { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending Acceptance', icon: Clock }
      case 'InProgress':
        return { bg: 'bg-blue-100', text: 'text-blue-800', label: 'In Progress', icon: Loader }
      case 'Completed':
        return { bg: 'bg-green-100', text: 'text-green-800', label: 'Completed', icon: CheckCircle }
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800', label: status, icon: AlertCircle }
    }
  }

  const getProgressWidth = (status) => {
    switch(status) {
      case 'Assigned': return '25%'
      case 'InProgress': return '75%'
      case 'Completed': return '100%'
      default: return '0%'
    }
  }

  const AssignmentMap = ({ complaint }) => {
    if (!complaint?.latitude && !complaint?.longitude) return null
    
    const lat = complaint.latitude || 19.9975
    const lng = complaint.longitude || 73.7898
    const position = [lat, lng]
    
    return (
      <MapContainer 
        key={`map-${complaint._id}`}
        center={position} 
        zoom={14} 
        style={{ height: "250px", width: "100%", borderRadius: "0.5rem", zIndex: 1 }}
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

  const filteredAssignments = getFilteredAssignments()
  const pendingCount = assignments.filter(a => a.status === 'Assigned').length
  const inProgressCount = assignments.filter(a => a.status === 'InProgress').length
  const completedCount = assignments.filter(a => a.status === 'Completed').length

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 text-lg">Loading assignments...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            {mode === 'update' ? 'Update Work Status' : 'My Assignments'}
          </h1>
          <p className="text-gray-600 mt-2">
            {mode === 'update' 
              ? 'Update status of work in progress' 
              : 'View and manage your assigned complaints'}
          </p>
        </div>

        {/* Stats Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-md text-center hover:shadow-lg transition">
            <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
            <div className="text-sm text-gray-500">Pending</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-md text-center hover:shadow-lg transition">
            <div className="text-2xl font-bold text-blue-600">{inProgressCount}</div>
            <div className="text-sm text-gray-500">In Progress</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-md text-center hover:shadow-lg transition">
            <div className="text-2xl font-bold text-green-600">{completedCount}</div>
            <div className="text-sm text-gray-500">Completed</div>
          </div>
        </div>

        {mode !== 'update' && (
          <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => setFilter('all')} 
                className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                  filter === 'all' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                All ({assignments.length})
              </button>
              <button 
                onClick={() => setFilter('pending')} 
                className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                  filter === 'pending' ? 'bg-yellow-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <Clock className="w-4 h-4" /> Pending ({pendingCount})
              </button>
              <button 
                onClick={() => setFilter('progress')} 
                className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                  filter === 'progress' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <Loader className="w-4 h-4" /> In Progress ({inProgressCount})
              </button>
              <button 
                onClick={() => setFilter('completed')} 
                className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                  filter === 'completed' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <CheckCircle className="w-4 h-4" /> Completed ({completedCount})
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center mb-6">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <p className="text-red-600 font-semibold">{error}</p>
            <button
              onClick={fetchAssignments}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
            >
              Retry
            </button>
          </div>
        )}

        {filteredAssignments.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Assignments</h3>
            <p className="text-gray-500">
              {mode === 'update' 
                ? 'No work in progress at the moment.' 
                : 'You have no assignments at the moment.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAssignments.map((assignment) => {
              const statusInfo = getStatusBadge(assignment.status)
              const StatusIcon = statusInfo.icon
              const isExpanded = expandedId === assignment._id
              
              return (
                <div key={assignment._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition">
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row justify-between items-start mb-4 gap-3">
                      <div className="flex-1 w-full">
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                          <span className="text-sm text-gray-500 font-mono">
                            #{assignment._id?.slice(-6)}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.bg} ${statusInfo.text} flex items-center gap-1`}>
                            <StatusIcon className="w-3 h-3" />
                            {statusInfo.label}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">{assignment.complaintType}</h3>
                        <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" /> {assignment.userId?.name || 'N/A'}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" /> {assignment.userId?.area || 'N/A'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-4 h-4" /> {assignment.userId?.mobile || 'N/A'}
                          </span>
                        </div>
                        <p className="text-gray-500 text-xs mt-2">
                          Submitted: {assignment.submittedAt ? new Date(assignment.submittedAt).toLocaleString() : 'N/A'}
                        </p>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {mode === 'update' && assignment.status === 'InProgress' && (
                          <button
                            onClick={() => openRemarkModal(assignment)}
                            disabled={processingId === assignment._id}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition flex items-center gap-2 disabled:opacity-50"
                          >
                            {processingId === assignment._id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                            ) : (
                              <MessageSquare className="w-4 h-4" />
                            )}
                            Complete Work
                          </button>
                        )}
                        
                        {mode !== 'update' && assignment.status === 'Assigned' && (
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => acceptWork(assignment._id)}
                              disabled={processingId === assignment._id}
                              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2 disabled:opacity-50"
                            >
                              {processingId === assignment._id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                              ) : (
                                <CheckCircle className="w-4 h-4" />
                              )}
                              Accept
                            </button>
                            <button
                              onClick={() => rejectWork(assignment._id)}
                              disabled={processingId === assignment._id}
                              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition flex items-center gap-2 disabled:opacity-50"
                            >
                              <XCircle className="w-4 h-4" />
                              Reject
                            </button>
                          </div>
                        )}
                        
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : assignment._id)}
                          className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition"
                          aria-label={isExpanded ? 'Collapse' : 'Expand'}
                        >
                          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span className={assignment.status === 'Assigned' ? 'text-yellow-600 font-semibold' : ''}>
                          Assigned
                        </span>
                        <span className={assignment.status === 'InProgress' ? 'text-blue-600 font-semibold' : ''}>
                          In Progress
                        </span>
                        <span className={assignment.status === 'Completed' ? 'text-green-600 font-semibold' : ''}>
                          Completed
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-yellow-500 via-blue-500 to-green-500 transition-all duration-500" 
                          style={{ width: getProgressWidth(assignment.status) }}
                        ></div>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="mt-6 pt-4 border-t space-y-4">
                        {assignment.description && (
                          <div>
                            <p className="text-gray-600 text-sm font-semibold">Issue Description:</p>
                            <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded-lg mt-1">
                              {assignment.description}
                            </p>
                          </div>
                        )}
                        
                        {/* Image Display */}
                        {assignment.imageUrl && (
                          <div>
                            <p className="text-gray-600 text-sm font-semibold">📷 Complaint Image:</p>
                            <img 
                              src={assignment.imageUrl.startsWith('http') ? assignment.imageUrl : `${process.env.REACT_APP_API_URL || ''}${assignment.imageUrl}`} 
                              alt="Complaint" 
                              className="max-h-48 rounded-lg mt-1 border border-gray-200 shadow-sm"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://via.placeholder.com/200x150?text=No+Image';
                              }}
                            />
                          </div>
                        )}
                        
                        {assignment.userId?.address && (
                          <div>
                            <p className="text-gray-600 text-sm font-semibold">Customer Address:</p>
                            <p className="text-gray-700 text-sm mt-1">{assignment.userId.address}</p>
                          </div>
                        )}
                        
                        {(assignment.latitude || assignment.locationAddress) && (
                          <div>
                            <p className="text-gray-600 text-sm font-semibold mb-2">📍 Location Map:</p>
                            <AssignmentMap complaint={assignment} />
                          </div>
                        )}
                        
                        {assignment.technicianRemarks && (
                          <div className={`rounded-lg p-3 ${assignment.status === 'Completed' ? 'bg-green-50' : 'bg-blue-50'}`}>
                            <p className={`text-sm font-semibold ${assignment.status === 'Completed' ? 'text-green-800' : 'text-blue-800'}`}>
                              📝 {assignment.status === 'Completed' ? 'Completion Remarks:' : 'Remarks:'}
                            </p>
                            <p className="text-gray-700 text-sm">{assignment.technicianRemarks}</p>
                          </div>
                        )}
                        
                        {/* Timestamps */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                          {assignment.assignedAt && (
                            <div>
                              <p className="text-gray-500">Assigned On</p>
                              <p className="font-medium">{new Date(assignment.assignedAt).toLocaleString()}</p>
                            </div>
                          )}
                          {assignment.startedAt && (
                            <div>
                              <p className="text-gray-500">Started On</p>
                              <p className="font-medium">{new Date(assignment.startedAt).toLocaleString()}</p>
                            </div>
                          )}
                          {assignment.completedAt && (
                            <div>
                              <p className="text-gray-500">Completed On</p>
                              <p className="font-medium">{new Date(assignment.completedAt).toLocaleString()}</p>
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

      {/* Remark Modal */}
      {showRemarkModal && selectedComplaint && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" 
             onClick={() => { setShowRemarkModal(false); setRemark('') }}>
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
              <h3 className="text-xl font-bold text-white">Complete Work</h3>
              <p className="text-indigo-100 text-sm">Complaint #{selectedComplaint._id?.slice(-6)}</p>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4">
                <span className="font-semibold">Type:</span> {selectedComplaint.complaintType}
              </p>
              
              {/* Image in Remark Modal */}
              {selectedComplaint.imageUrl && (
                <div className="mb-4">
                  <p className="text-gray-600 text-sm font-semibold">📷 Complaint Image:</p>
                  <img 
                    src={selectedComplaint.imageUrl.startsWith('http') ? selectedComplaint.imageUrl : `${process.env.REACT_APP_API_URL || ''}${selectedComplaint.imageUrl}`} 
                    alt="Complaint" 
                    className="max-h-32 rounded-lg mt-1 border border-gray-200"
                  />
                </div>
              )}
              
              <label className="block text-gray-700 font-semibold mb-2">Completion Remarks *</label>
              <textarea
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                rows="4"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                placeholder="Enter details about the work completed..."
                required
              />
              <p className="text-gray-500 text-xs mt-2">This remark will be sent to the customer via email.</p>
            </div>
            <div className="border-t p-4 bg-gray-50 flex gap-3">
              <button 
                onClick={() => { setShowRemarkModal(false); setRemark('') }} 
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button 
                onClick={completeWork} 
                disabled={processingId === selectedComplaint._id} 
                className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processingId === selectedComplaint._id ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Processing...
                  </span>
                ) : (
                  'Complete Work'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ViewAssignments