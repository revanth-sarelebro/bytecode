// Every backend route the frontend calls lives here.
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
    list: '/appointments/my',
    create: '/appointments',
    status: (id) => `/appointments/${id}/status`,
    notes: (id) => `/appointments/${id}/notes`,
  },

  records: {
    mine: '/medical-records/my',
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