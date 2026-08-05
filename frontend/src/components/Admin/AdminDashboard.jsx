// AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  Home,
  FileText,
  Users,
  UserPlus,
  LogOut,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import API from "../../config/api";
import ManageComplaints from "./ManageComplaints";
import RegisterTechnician from "./RegisterTechnician";
import NotificationBell from "../NotificationBell";

function AdminDashboard() {
  const { user, logout } = useAuth();

  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper function to safely convert to number
  const safeNumber = (value) => {
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  };

  const [stats, setStats] = useState({
    totalComplaints: 0,
    pendingComplaints: 0,
    assignedComplaints: 0,
    inProgressComplaints: 0,
    completedComplaints: 0,
    totalTechnicians: 0,
    totalUsers: 0,
    resolutionRate: 0,
  });

  const [recentComplaints, setRecentComplaints] = useState([]);
  const [areaData, setAreaData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  // Ensure pieData is always an array with safe values
  const pieData = [
    { name: "Pending", value: safeNumber(stats.pendingComplaints) },
    { name: "Assigned", value: safeNumber(stats.assignedComplaints) },
    { name: "In Progress", value: safeNumber(stats.inProgressComplaints) },
    { name: "Completed", value: safeNumber(stats.completedComplaints) },
  ].filter((item) => item.value > 0);

  const handleError = (error) => {
    console.error("Dashboard Error:", error);
    const message = error.response?.data?.message || error.message || "Failed to load dashboard";
    toast.error(message);
    setError(message);
  };

  useEffect(() => {
    fetchAllData();
    
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Use Promise.allSettled to handle partial failures
      const results = await Promise.allSettled([
        API.get("/admin/stats"),
        API.get("/admin/complaints/recent"),
        API.get("/admin/complaints/by-area"),
        API.get("/admin/complaints/monthly"),
      ]);

      // Handle stats with safe number conversion
      if (results[0].status === 'fulfilled') {
        const data = results[0].value.data;
        setStats({
          totalComplaints: safeNumber(data.totalComplaints),
          pendingComplaints: safeNumber(data.pendingComplaints),
          assignedComplaints: safeNumber(data.assignedComplaints),
          inProgressComplaints: safeNumber(data.inProgressComplaints),
          completedComplaints: safeNumber(data.completedComplaints),
          totalTechnicians: safeNumber(data.totalTechnicians),
          totalUsers: safeNumber(data.totalUsers),
          resolutionRate: safeNumber(data.resolutionRate),
        });
      } else {
        console.error('Failed to fetch stats:', results[0].reason);
        // Keep default stats (all 0)
      }

      // Handle recent complaints - ENSURE IT'S AN ARRAY
      if (results[1].status === 'fulfilled') {
        const data = results[1].value.data;
        setRecentComplaints(Array.isArray(data) ? data : []);
      } else {
        console.error('Failed to fetch recent complaints:', results[1].reason);
        setRecentComplaints([]);
      }

      // Handle area data - ENSURE IT'S AN ARRAY
      if (results[2].status === 'fulfilled') {
        const data = results[2].value.data;
        setAreaData(Array.isArray(data) ? data : []);
      } else {
        console.error('Failed to fetch area data:', results[2].reason);
        setAreaData([]);
      }

      // Handle monthly data - ENSURE IT'S AN ARRAY
      if (results[3].status === 'fulfilled') {
        const data = results[3].value.data;
        setMonthlyData(Array.isArray(data) ? data : []);
      } else {
        console.error('Failed to fetch monthly data:', results[3].reason);
        setMonthlyData([]);
      }

    } catch (error) {
      handleError(error);
      // Set empty arrays on error
      setRecentComplaints([]);
      setAreaData([]);
      setMonthlyData([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Assigned":
        return "bg-blue-100 text-blue-800";
      case "InProgress":
        return "bg-purple-100 text-purple-800";
      case "Completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-5"></div>
          <h2 className="text-xl font-semibold text-gray-700">
            Loading Dashboard...
          </h2>
          <p className="text-gray-500 mt-2">
            Please wait while we fetch the latest data.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-72 bg-gradient-to-b from-purple-800 to-indigo-800 text-white shadow-2xl pt-16">
        <div className="p-6">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10 pb-6 border-b border-white/20">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <Home className="w-6 h-6 text-purple-700" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Admin Panel</h2>
              <p className="text-xs text-purple-200">SmartGrid System</p>
            </div>
          </div>

          {/* Profile */}
          <div className="mb-8 p-4 rounded-xl bg-white/10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center text-lg font-bold">
                {user?.name?.[0]?.toUpperCase() || "A"}
              </div>
              <div>
                <p className="font-semibold">{user?.name || "Admin"}</p>
                <p className="text-xs text-purple-200">
                  {user?.email || "admin@smartgrid.com"}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                activeTab === "dashboard"
                  ? "bg-white/20 shadow-lg"
                  : "hover:bg-white/10"
              }`}
            >
              <TrendingUp className="w-5 h-5" />
              Dashboard
            </button>

            <button
              onClick={() => setActiveTab("complaints")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition ${
                activeTab === "complaints"
                  ? "bg-white/20 shadow-lg"
                  : "hover:bg-white/10"
              }`}
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5" />
                <span>Manage Complaints</span>
              </div>
              {safeNumber(stats.pendingComplaints) > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {safeNumber(stats.pendingComplaints)}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("technicians")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                activeTab === "technicians"
                  ? "bg-white/20 shadow-lg"
                  : "hover:bg-white/10"
              }`}
            >
              <Users className="w-5 h-5" />
              Technicians
            </button>

            <button
              onClick={() => setActiveTab("register")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                activeTab === "register"
                  ? "bg-white/20 shadow-lg"
                  : "hover:bg-white/10"
              }`}
            >
              <UserPlus className="w-5 h-5" />
              Register Technician
            </button>
          </nav>
        </div>

        {/* Logout */}
        <div className="absolute bottom-0 w-full p-6">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 transition"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </div>

      {/* Notification */}
      <div className="fixed top-20 right-6 z-50">
        <NotificationBell />
      </div>

      {/* Main Content */}
      <div className="ml-72">
        {activeTab === "dashboard" && (
          <div className="p-8">
            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                <p className="text-red-600 text-sm">{error}</p>
                <button
                  onClick={fetchAllData}
                  className="mt-2 text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">Total Complaints</p>
                    <h2 className="text-3xl font-bold text-gray-800 mt-2">
                      {safeNumber(stats.totalComplaints)}
                    </h2>
                  </div>
                  <FileText className="w-12 h-12 text-indigo-500 opacity-60" />
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">Pending</p>
                    <h2 className="text-3xl font-bold text-yellow-600 mt-2">
                      {safeNumber(stats.pendingComplaints)}
                    </h2>
                  </div>
                  <Clock className="w-12 h-12 text-yellow-500 opacity-60" />
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">In Progress</p>
                    <h2 className="text-3xl font-bold text-blue-600 mt-2">
                      {safeNumber(stats.assignedComplaints) + safeNumber(stats.inProgressComplaints)}
                    </h2>
                  </div>
                  <AlertTriangle className="w-12 h-12 text-blue-500 opacity-60" />
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">Completed</p>
                    <h2 className="text-3xl font-bold text-green-600 mt-2">
                      {safeNumber(stats.completedComplaints)}
                    </h2>
                  </div>
                  <CheckCircle className="w-12 h-12 text-green-500 opacity-60" />
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid lg:grid-cols-2 gap-6 mb-8">
              {/* Area Chart */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-6">
                  Complaints by Area
                </h3>
                {areaData && areaData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={areaData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="area" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#6366F1" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-72 flex items-center justify-center text-gray-500">
                    No area data available
                  </div>
                )}
              </div>

              {/* Pie Chart */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-6">
                  Complaint Status
                </h3>
                {pieData && pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={90}
                        label
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={index} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-72 flex items-center justify-center text-gray-500">
                    No complaint status data available
                  </div>
                )}
              </div>
            </div>

            {/* Monthly Trends */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <h3 className="text-lg font-bold text-gray-800 mb-6">
                Monthly Complaint Trends
              </h3>
              {monthlyData && monthlyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="complaints"
                      stroke="#6366F1"
                      strokeWidth={3}
                    />
                    <Line
                      type="monotone"
                      dataKey="resolved"
                      stroke="#22C55E"
                      strokeWidth={3}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-72 flex items-center justify-center text-gray-500">
                  No monthly data available
                </div>
              )}
            </div>

            {/* Recent Complaints */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gray-800 px-6 py-4">
                <h3 className="text-lg font-bold text-white">Recent Complaints</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-600">
                        Complaint ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-600">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-600">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-600">
                        Area
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-600">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-600">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {!recentComplaints || recentComplaints.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-10 text-gray-500">
                          No complaints found
                        </td>
                      </tr>
                    ) : (
                      recentComplaints.map((complaint) => (
                        <tr key={complaint._id} className="hover:bg-gray-50 transition">
                          <td className="px-6 py-4">#{complaint._id?.slice(-6)}</td>
                          <td className="px-6 py-4">{complaint.complaintType || "N/A"}</td>
                          <td className="px-6 py-4">{complaint.userId?.name || "-"}</td>
                          <td className="px-6 py-4">{complaint.userId?.area || "-"}</td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                                complaint.status || "Pending"
                              )}`}
                            >
                              {complaint.status || "Pending"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-500">
                            {complaint.submittedAt
                              ? new Date(complaint.submittedAt).toLocaleDateString()
                              : "N/A"}
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

        {/* Manage Complaints */}
        {activeTab === "complaints" && (
          <div className="p-8">
            <ManageComplaints refreshDashboard={fetchAllData} />
          </div>
        )}

        {/* Technician List */}
        {activeTab === "technicians" && (
          <div className="p-8">
            <RegisterTechnician
              showList={true}
              showForm={false}
              refreshDashboard={fetchAllData}
            />
          </div>
        )}

        {/* Register Technician */}
        {activeTab === "register" && (
          <div className="p-8">
            <RegisterTechnician
              showList={false}
              showForm={true}
              refreshDashboard={fetchAllData}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;