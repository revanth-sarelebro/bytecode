// Every backend route the frontend calls lives here.
// Paths are relative to VITE_API_BASE_URL (for example http://localhost:5000/api).
// Backend route files: auth, user, doctor, appointment, medicalRecord, admin, ai.
// If Dev A names a route differently, change it HERE. Nothing else needs editing.
export const ENDPOINTS = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    me: '/auth/me',
    verifyOtp: '/auth/verify-otp',
    resendOtp: '/auth/resend-otp',
  },
  users: {
    updateProfile: '/users/me',
  },
  doctors: {
    list: '/doctors',
  },
  appointments: {
    list: '/appointments',
    create: '/appointments',
    status: (id) => `/appointments/${id}/status`,
    notes: (id) => `/appointments/${id}/notes`,
  },
  records: {
    mine: '/medical-records',
    forPatient: (patientId) => `/medical-records/patient/${patientId}`,
    create: '/medical-records',
  },
  reports: {
    mine: '/reports',
    forPatient: (patientId) => `/reports/patient/${patientId}`,
    create: '/reports',
  },
  medications: {
    mine: '/medications',
    forPatient: (patientId) => `/medications/patient/${patientId}`,
    create: '/medications',
  },
  admin: {
    users: '/admin/users',
    setActive: (id) => `/admin/users/${id}/active`,
    appointments: '/admin/appointments',
    createDoctor: '/admin/doctors',
    audit: '/admin/audit',
  },
  ai: {
    chat: '/ai/chat',
  },
}
