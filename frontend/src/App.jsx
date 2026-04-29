import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'

// Pages
import Home from './pages/Home'
import Register from './pages/Register'
import Login from './pages/Login'

// User Components
import UserDashboard from './components/User/UserDashboard'
import SubmitComplaint from './components/User/SubmitComplaint'
import TrackComplaint from './components/User/TrackComplaint'

// Admin Components
import AdminDashboard from './components/Admin/AdminDashboard'
import ManageComplaints from './components/Admin/ManageComplaints'
import RegisterTechnician from './components/Admin/RegisterTechnician'
import AssignTechnician from './components/Admin/AssignTechnician'  // ADD THIS

// Technician Components
import TechnicianDashboard from './components/Technician/TechnicianDashboard'

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token')
  const userData = localStorage.getItem('user')
  const user = userData ? JSON.parse(userData) : null
  
  if (!token) {
    return <Navigate to="/login" replace />
  }
  
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />
  }
  
  return children
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          
          {/* User Routes - Protected */}
          <Route path="/user/dashboard" element={
            <ProtectedRoute allowedRoles={['user']}>
              <UserDashboard />
            </ProtectedRoute>
          } />
          <Route path="/user/submit-complaint" element={
            <ProtectedRoute allowedRoles={['user']}>
              <SubmitComplaint />
            </ProtectedRoute>
          } />
          <Route path="/user/track-complaint" element={
            <ProtectedRoute allowedRoles={['user']}>
              <TrackComplaint />
            </ProtectedRoute>
          } />
          
          {/* Admin Routes - Protected */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/complaints" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ManageComplaints />
            </ProtectedRoute>
          } />
          <Route path="/admin/register-technician" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <RegisterTechnician />
            </ProtectedRoute>
          } />
          <Route path="/admin/assign/:id" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AssignTechnician />
            </ProtectedRoute>
          } />  {/* ADD THIS ROUTE */}
          
          {/* Technician Routes - Protected */}
          <Route path="/technician/dashboard" element={
            <ProtectedRoute allowedRoles={['technician']}>
              <TechnicianDashboard />
            </ProtectedRoute>
          } />
          
          {/* Fallback Route - 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App