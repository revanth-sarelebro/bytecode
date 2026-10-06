import axios from 'axios'
import { ENDPOINTS as E } from './endpoints'
import * as mock from './mock'

export const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

const TOKEN_KEY = 'medisync_token'

// sessionStorage clears when the tab closes. Safest option is an HttpOnly cookie set by the server
// (then switch on withCredentials and delete the token code below).
export const tokenStore = {
  get: () => sessionStorage.getItem(TOKEN_KEY),
  set: (t) => sessionStorage.setItem(TOKEN_KEY, t),
  clear: () => sessionStorage.removeItem(TOKEN_KEY),
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
})

api.interceptors.request.use((config) => {
  const token = tokenStore.get()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// These calls happen before a session exists, so a 401 there is not "session expired".
const PRE_SESSION = [E.auth.login, E.auth.verifyOtp, E.auth.resendOtp]

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status
    if (status === 401 && !PRE_SESSION.includes(err.config?.url)) {
      tokenStore.clear()
      window.dispatchEvent(new Event('medisync:logout'))
    }
    return Promise.reject(err)
  }
)

// Turn any failure into one safe, readable sentence. Never show raw server errors.
export function errorMessage(err) {
  if (!err.response) return 'Cannot reach the server. Check your connection and try again.'
  switch (err.response.status) {
    case 400:
    case 422:
      return err.response.data?.message || 'Some details look wrong. Check the form and try again.'
    case 401:
      return 'Email or password is incorrect.'
    case 403:
      return 'You do not have permission to do that.'
    case 404:
      return 'That record no longer exists.'
    case 429:
      return 'Too many attempts. Wait a minute and try again.'
    default:
      return 'Something went wrong on our side. Try again shortly.'
  }
}

const data = (p) => p.then((r) => r.data)

const real = {
  authApi: {
    // Returns { otpRequired: true, challengeId, expiresInSeconds } or { token, user }
    login: (body) => data(api.post(E.auth.login, body)),
    verifyOtp: (body) => data(api.post(E.auth.verifyOtp, body)),
    resendOtp: (body) => data(api.post(E.auth.resendOtp, body)),
    register: (body) => data(api.post(E.auth.register, body)),
    me: () => data(api.get(E.auth.me)),
  },
  profileApi: {
    update: (body) => data(api.patch(E.users.updateProfile, body)),
  },
  doctorApi: {
    list: () => data(api.get(E.doctors.list)),
  },
  appointmentApi: {
    list: () => data(api.get(E.appointments.list)),
    create: (body) => data(api.post(E.appointments.create, body)),
    setStatus: (id, status) => data(api.patch(E.appointments.status(id), { status })),
    setNotes: (id, notes) => data(api.patch(E.appointments.notes(id), { notes })),
  },
  recordApi: {
    mine: () => data(api.get(E.records.mine)),
    forPatient: (patientId) => data(api.get(E.records.forPatient(patientId))),
    create: (body) => data(api.post(E.records.create, body)),
  },
  reportApi: {
    mine: () => data(api.get(E.reports.mine)),
    forPatient: (patientId) => data(api.get(E.reports.forPatient(patientId))),
    create: (body) => data(api.post(E.reports.create, body)),
  },
  medicationApi: {
    mine: () => data(api.get(E.medications.mine)),
    forPatient: (patientId) => data(api.get(E.medications.forPatient(patientId))),
    create: (body) => data(api.post(E.medications.create, body)),
  },
  adminApi: {
    users: () => data(api.get(E.admin.users)),
    setActive: (id, active) => data(api.patch(E.admin.setActive(id), { active })),
  },
  adminExtraApi: {
    appointments: () => data(api.get(E.admin.appointments)),
    createDoctor: (body) => data(api.post(E.admin.createDoctor, body)),
    audit: (limit = 100) => data(api.get(E.admin.audit, { params: { limit } })),
  },
  chatApi: {
    ask: (message) => data(api.post(E.ai.chat, { message })),
  },
}

const impl = USE_MOCK ? mock : real

export const authApi = impl.authApi
export const profileApi = impl.profileApi
export const doctorApi = impl.doctorApi
export const appointmentApi = impl.appointmentApi
export const recordApi = impl.recordApi
export const reportApi = impl.reportApi
export const medicationApi = impl.medicationApi
export const adminApi = impl.adminApi
export const adminExtraApi = impl.adminExtraApi
export const chatApi = impl.chatApi

export default api
