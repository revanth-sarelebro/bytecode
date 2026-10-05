import axios from 'axios'

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
    const isLoginCall = err.config?.url?.includes('/auth/login')
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

export const authApi = {
  login: (body) => api.post('/auth/login', body).then((r) => r.data),
  register: (body) => api.post('/auth/register', body).then((r) => r.data),
  me: () => api.get('/auth/me').then((r) => r.data),
}

export const appointmentApi = {
  list: () => api.get('/appointments').then((r) => r.data),
  create: (body) => api.post('/appointments', body).then((r) => r.data),
  setStatus: (id, status) => api.patch(`/appointments/${id}/status`, { status }).then((r) => r.data),
  setNotes: (id, notes) => api.patch(`/appointments/${id}/notes`, { notes }).then((r) => r.data),
}

export const doctorApi = {
  list: () => api.get('/doctors').then((r) => r.data),
}

export const adminApi = {
  users: () => api.get('/admin/users').then((r) => r.data),
  setActive: (id, active) => api.patch(`/admin/users/${id}/active`, { active }).then((r) => r.data),
}

export const chatApi = {
  ask: (message) => api.post('/chat', { message }).then((r) => r.data),
}

export default api

export const profileApi = {
  update: (body) => api.patch('/profile', body).then((r) => r.data),
}

export const recordApi = {
  mine: () => api.get('/records').then((r) => r.data),
  forPatient: (patientId) => api.get(`/patients/${patientId}/records`).then((r) => r.data),
  create: (body) => api.post('/records', body).then((r) => r.data),
}

export const adminExtraApi = {
  appointments: () => api.get('/admin/appointments').then((r) => r.data),
  createDoctor: (body) => api.post('/admin/doctors', body).then((r) => r.data),
}
