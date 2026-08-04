import React, { useState } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import toast from 'react-hot-toast'
import API from '../../config/api' // Use API instance instead of axios

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

function LocationMarker({ setLocation }) {
  const [position, setPosition] = useState(null)
  
  useMapEvents({
    click(e) {
      setPosition(e.latlng)
      setLocation({
        lat: e.latlng.lat,
        lng: e.latlng.lng,
        address: `${e.latlng.lat}, ${e.latlng.lng}`
      })
    },
  })
  
  return position === null ? null : <Marker position={position} />
}

function SubmitComplaint() {
  const [loading, setLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [location, setLocation] = useState(null)
  const [formData, setFormData] = useState({
    complaintType: '',
    description: ''
  })

  const complaintTypes = [
    'Power Cut',
    'Low Voltage',
    'High Voltage',
    'Meter Issue',
    'Billing Issue',
    'Transformer Issue',
    'Wire Damage',
    'Other'
  ]

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB')
        return
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file')
        return
      }
      
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      const toastId = toast.loading('Getting location...')
      
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude
          const lng = position.coords.longitude
          
          setLocation({
            lat: lat,
            lng: lng,
            address: `${lat}, ${lng}`
          })
          
          // Get address from coordinates using reverse geocoding
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
            )
            const data = await response.json()
            if (data.display_name) {
              setLocation({
                lat: lat,
                lng: lng,
                address: data.display_name
              })
            }
          } catch (error) {
            console.error('Reverse geocoding error:', error)
          }
          
          toast.success('Location captured!', { id: toastId })
        },
        (error) => {
          if (error.code === 1) {
            toast.error('Please allow location access', { id: toastId })
          } else if (error.code === 2) {
            toast.error('Location unavailable. Please try again.', { id: toastId })
          } else if (error.code === 3) {
            toast.error('Location request timed out. Please try again.', { id: toastId })
          } else {
            toast.error('Failed to get location', { id: toastId })
          }
        },
        { 
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      )
    } else {
      toast.error('Geolocation is not supported by your browser')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate form
    if (!formData.complaintType) {
      toast.error('Please select complaint type')
      return
    }
    
    if (!location) {
      toast.error('Please select location on map')
      return
    }
    
    setLoading(true)
    
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        toast.error('Please login again')
        return
      }

      // Create FormData for file upload
      const submitData = new FormData()
      submitData.append('complaintType', formData.complaintType)
      submitData.append('description', formData.description || '')
      submitData.append('latitude', location.lat)
      submitData.append('longitude', location.lng)
      submitData.append('address', location.address)
      
      if (imageFile) {
        submitData.append('image', imageFile)
      }
      
      const response = await API.post('/user/complaint', submitData, {
        headers: { 
          'Content-Type': 'multipart/form-data'
        }
      })
      
      toast.success(response.data.message || 'Complaint submitted successfully!')
      
      // Reset form
      setFormData({ 
        complaintType: '', 
        description: '' 
      })
      setImagePreview(null)
      setImageFile(null)
      setLocation(null)
      
    } catch (error) {
      console.error('Error submitting complaint:', error)
      
      let errorMessage = 'Failed to submit complaint'
      
      if (error.response) {
        // Server responded with error
        if (error.response.status === 400) {
          errorMessage = error.response.data?.message || 'Invalid data submitted'
        } else if (error.response.status === 401) {
          errorMessage = 'Please login again to submit complaint'
        } else if (error.response.status === 413) {
          errorMessage = 'Image file is too large. Please upload a smaller image.'
        } else {
          errorMessage = error.response.data?.message || 'Failed to submit complaint'
        }
      } else if (error.request) {
        // Request made but no response
        errorMessage = 'No response from server. Please check your connection.'
      }
      
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6">
            <h1 className="text-3xl font-bold text-white">Submit New Complaint</h1>
            <p className="text-indigo-100 mt-2">Report your electricity issue with details and location</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Complaint Type */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Complaint Type <span className="text-red-500">*</span>
              </label>
              <select
                name="complaintType"
                value={formData.complaintType}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              >
                <option value="">Select issue type</option>
                {complaintTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                placeholder="Describe your issue in detail..."
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Upload Image (Optional)</label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-indigo-500 transition">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="imageUpload"
                />
                <label htmlFor="imageUpload" className="cursor-pointer block">
                  {imagePreview ? (
                    <div className="relative inline-block">
                      <img src={imagePreview} alt="Preview" className="max-h-48 rounded-lg" />
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null)
                          setImagePreview(null)
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div>
                      <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-gray-600">Click to upload image</p>
                      <p className="text-gray-400 text-sm">PNG, JPG up to 5MB</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Location Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
              <label className="block text-gray-700 font-semibold mb-3">
                📍 Location <span className="text-red-500">*</span>
              </label>
              
              <div className="flex flex-wrap gap-4 mb-4">
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Get My Current Location
                </button>
              </div>

              {location && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-700 text-sm font-medium">✅ Location selected!</p>
                  <p className="text-gray-600 text-xs mt-1 break-words">{location.address}</p>
                </div>
              )}

              <div className="mt-3">
                <p className="text-sm text-gray-600 mb-2">Or click on map to select location:</p>
                <MapContainer
                  center={[19.9975, 73.7898]}
                  zoom={13}
                  style={{ height: "350px", width: "100%", borderRadius: "0.5rem", zIndex: 1 }}
                  zoomControl={true}
                  scrollWheelZoom={true}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <LocationMarker setLocation={setLocation} />
                </MapContainer>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-bold text-lg hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  Submitting...
                </span>
              ) : (
                'Submit Complaint'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default SubmitComplaint