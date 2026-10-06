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

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status
    const isLoginCall = err.config?.url === E.auth.login
    if (status === 401 && !isLoginCall) {
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

const real_authApi = {
  login: (body) => data(api.post(E.auth.login, body)),
  register: (body) => data(api.post(E.auth.register, body)),
  me: () => data(api.get(E.auth.me)),
}

const real_profileApi = {
  update: (body) => data(api.patch(E.users.updateProfile, body)),
}

const real_doctorApi = {
  list: () => data(api.get(E.doctors.list)),
}

const real_appointmentApi = {
  list: () => data(api.get(E.appointments.list)),
  create: (body) => data(api.post(E.appointments.create, body)),
  setStatus: (id, status) => data(api.patch(E.appointments.status(id), { status })),
  setNotes: (id, notes) => data(api.patch(E.appointments.notes(id), { notes })),
}

const real_recordApi = {
  mine: () => data(api.get(E.records.mine)),
  forPatient: (patientId) => data(api.get(E.records.forPatient(patientId))),
  create: (body) => data(api.post(E.records.create, body)),
}

const real_adminApi = {
  users: () => data(api.get(E.admin.users)),
  setActive: (id, active) => data(api.patch(E.admin.setActive(id), { active })),
}

const real_adminExtraApi = {
  appointments: () => data(api.get(E.admin.appointments)),
  createDoctor: (body) => data(api.post(E.admin.createDoctor, body)),
  audit: (limit = 100) => data(api.get(E.admin.audit, { params: { limit } })),
}

const real_chatApi = {
  ask: (message) => data(api.post(E.ai.chat, { message })),
}

const pick = (name) => (USE_MOCK ? mock[name] : { authApi: real_authApi, profileApi: real_profileApi, doctorApi: real_doctorApi, appointmentApi: real_appointmentApi, recordApi: real_recordApi, adminApi: real_adminApi, adminExtraApi: real_adminExtraApi, chatApi: real_chatApi }[name])

export const authApi = pick('authApi')
export const profileApi = pick('profileApi')
export const doctorApi = pick('doctorApi')
export const appointmentApi = pick('appointmentApi')
export const recordApi = pick('recordApi')
export const adminApi = pick('adminApi')
export const adminExtraApi = pick('adminExtraApi')
export const chatApi = pick('chatApi')

export default api
