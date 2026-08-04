import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { 
  Home, FileText, Users, UserPlus, LogOut, 
  CheckCircle, Clock, AlertTriangle, TrendingUp
} from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import ManageComplaints from './ManageComplaints'
import RegisterTechnician from './RegisterTechnician'
import NotificationBell from '../NotificationBell'
import { API_URL } from '../../config/api'

function AdminDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalComplaints: 0,
    pendingComplaints: 0,
    assignedComplaints: 0,
    inProgressComplaints: 0,
    completedComplaints: 0,
    totalTechnicians: 0,
    totalUsers: 0,
    resolutionRate: 0
  })
  const [recentComplaints, setRecentComplaints] = useState([])
  const [areaData, setAreaData] = useState([])
  const [monthlyData, setMonthlyData] = useState([])

  useEffect(() => {
    fetchAllData()
    // Auto refresh every 30 seconds
    const interval = setInterval(fetchAllData, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchAllData = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      
      const [statsRes, recentRes, areaRes, monthlyRes] = await Promise.all([
        axios.get(`${API_URL}/admin/stats`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/admin/complaints/recent`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/admin/complaints/by-area`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/admin/complaints/monthly`, { headers: { Authorization: `Bearer ${token}` } })
      ])
      
      setStats(statsRes.data)
      setRecentComplaints(recentRes.data)
      setAreaData(areaRes.data)
      setMonthlyData(monthlyRes.data)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

  const pieData = [
    { name: 'Pending', value: stats.pendingComplaints },
    { name: 'Assigned', value: stats.assignedComplaints },
    { name: 'In Progress', value: stats.inProgressComplaints },
    { name: 'Completed', value: stats.completedComplaints },
  ].filter(item => item.value > 0)

  const getStatusColor = (status) => {
    switch(status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800'
      case 'Assigned': return 'bg-blue-100 text-blue-800'
      case 'InProgress': return 'bg-purple-100 text-purple-800'
      case 'Completed': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-72 bg-gradient-to-b from-purple-800 to-indigo-800 text-white shadow-2xl pt-16">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-10 pb-6 border-b border-white/20">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <Home className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <span className="text-xl font-bold">Admin Panel</span>
              <p className="text-xs text-purple-200">SmartGrid System</p>
            </div>
          </div>

          <div className="mb-8 p-4 bg-white/10 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-xl font-bold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold">{user?.name || 'Admin User'}</p>
                <p className="text-xs text-purple-200">{user?.email || 'admin@smartgrid.com'}</p>
              </div>
            </div>
          </div>

          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === 'dashboard' ? 'bg-white/20 shadow-lg' : 'hover:bg-white/10'
              }`}
            >
              <TrendingUp className="w-5 h-5" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('complaints')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                activeTab === 'complaints' ? 'bg-white/20 shadow-lg' : 'hover:bg-white/10'
              }`}
            >
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5" />
                <span>Manage Complaints</span>
              </div>
              {stats.pendingComplaints > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {stats.pendingComplaints}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('technicians')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === 'technicians' ? 'bg-white/20 shadow-lg' : 'hover:bg-white/10'
              }`}
            >
              <Users className="w-5 h-5" />
              <span>Technicians</span>
            </button>

            <button
              onClick={() => setActiveTab('register')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === 'register' ? 'bg-white/20 shadow-lg' : 'hover:bg-white/10'
              }`}
            >
              <UserPlus className="w-5 h-5" />
              <span>Register Technician</span>
            </button>
          </nav>
        </div>

        <div className="absolute bottom-0 w-72 p-6">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Notification Bell - Top Right Corner */}
      <div className="fixed top-20 right-6 z-50">
        <NotificationBell />
      </div>

      {/* Main Content */}
      <div className="ml-72">
        {activeTab === 'dashboard' && (
          <div className="p-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Total Complaints</p>
                    <p className="text-3xl font-bold text-gray-800">{stats.totalComplaints}</p>
                  </div>
                  <FileText className="w-12 h-12 text-indigo-500 opacity-50" />
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Pending</p>
                    <p className="text-3xl font-bold text-yellow-600">{stats.pendingComplaints}</p>
                  </div>
                  <Clock className="w-12 h-12 text-yellow-500 opacity-50" />
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">In Progress</p>
                    <p className="text-3xl font-bold text-blue-600">{stats.inProgressComplaints + stats.assignedComplaints}</p>
                  </div>
                  <AlertTriangle className="w-12 h-12 text-blue-500 opacity-50" />
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Completed</p>
                    <p className="text-3xl font-bold text-green-600">{stats.completedComplaints}</p>
                  </div>
                  <CheckCircle className="w-12 h-12 text-green-500 opacity-50" />
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Complaints by Area</h3>
                {areaData.length > 0 ? (
                  <BarChart width={400} height={250} data={areaData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="area" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                ) : (
                  <div className="h-64 flex items-center justify-center text-gray-500">No data available</div>
                )}
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Complaint Status Distribution</h3>
                {pieData.length > 0 ? (
                  <PieChart width={400} height={250}>
                    <Pie data={pieData} cx={200} cy={120} innerRadius={60} outerRadius={80} fill="#8884d8" dataKey="value" label>
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                ) : (
                  <div className="h-64 flex items-center justify-center text-gray-500">No data available</div>
                )}
              </div>
            </div>

            {/* Monthly Trends */}
            <div className="bg-white rounded-xl p-6 shadow-lg mb-8">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Monthly Trends</h3>
              {monthlyData.length > 0 ? (
                <LineChart width={800} height={250} data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="complaints" stroke="#8884d8" />
                  <Line type="monotone" dataKey="resolved" stroke="#82ca9d" />
                </LineChart>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-500">No data available</div>
              )}
            </div>

            {/* Recent Complaints */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="px-6 py-4 bg-gray-800">
                <h3 className="text-lg font-bold text-white">Recent Complaints</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Area</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {recentComplaints.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-8 text-center text-gray-500">No complaints found</td>
                      </tr>
                    ) : (
                      recentComplaints.map((complaint) => (
                        <tr key={complaint._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-900">#{complaint._id?.slice(-6)}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{complaint.complaintType}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{complaint.userId?.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{complaint.userId?.area}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(complaint.status)}`}>
                              {complaint.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {new Date(complaint.submittedAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default AdminDashboard