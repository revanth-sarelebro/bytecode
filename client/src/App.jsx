import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import PatientDashboard from './pages/PatientDashboard'
import PatientProfile from './pages/PatientProfile'
import PatientRecords from './pages/PatientRecords'
import DoctorDashboard from './pages/DoctorDashboard'
import AdminDashboard from './pages/AdminDashboard'
import { HOME } from './lib/status'

function Landing() {
  const { user, loading } = useAuth()
  if (loading) return null
  return <Navigate to={user ? HOME[user.role] : '/login'} replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login/:portal?" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<ProtectedRoute roles={['PATIENT']} />}>
        <Route path="/patient" element={<PatientDashboard />} />
        <Route path="/patient/records" element={<PatientRecords />} />
        <Route path="/patient/profile" element={<PatientProfile />} />
      </Route>
      <Route element={<ProtectedRoute roles={['DOCTOR']} />}>
        <Route path="/doctor" element={<DoctorDashboard />} />
      </Route>
      <Route element={<ProtectedRoute roles={['ADMIN']} />}>
        <Route path="/admin" element={<AdminDashboard />} />
      </Route>

      <Route path="*" element={<p className="p-8">Page not found.</p>} />
    </Routes>
  )
}
