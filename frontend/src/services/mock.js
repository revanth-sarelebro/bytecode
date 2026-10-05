// Fake backend for frontend-only work. Turn on with VITE_USE_MOCK=true in .env.
// Data lives in the browser (localStorage). Reset it by clearing site data.
// It follows the same rules the real server must follow, so the UI behaves the same.
import { NEXT_STATUS } from '../lib/status'

const DB_KEY = 'medisync_mock_db'
const TOKEN_KEY = 'medisync_token'
const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms))
const uid = (p) => `${p}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
const fail = (status, message) => { throw { response: { status, data: { message } } } }

function at(days, hour, minute = 0) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  d.setHours(hour, minute, 0, 0)
  return d.toISOString()
}

function seed() {
  const pw = 'Test1234'
  return {
    users: [
      { id: 'u1', name: 'Asha Reddy', email: 'patient@test.com', password: pw, role: 'PATIENT', active: true, phone: '9876543210', dateOfBirth: '1996-04-12', bloodGroup: 'B+' },
      { id: 'u2', name: 'Vikram Rao', email: 'patient2@test.com', password: pw, role: 'PATIENT', active: true },
      { id: 'd1', name: 'Dr. Meera Iyer', email: 'doctor@test.com', password: pw, role: 'DOCTOR', active: true, speciality: 'General Physician' },
      { id: 'd2', name: 'Dr. Karan Mehta', email: 'doctor2@test.com', password: pw, role: 'DOCTOR', active: true, speciality: 'Dermatology' },
      { id: 'a1', name: 'Rohan Verma', email: 'admin@test.com', password: pw, role: 'ADMIN', active: true },
    ],
    appointments: [
      { id: 'ap1', patientId: 'u1', doctorId: 'd1', date: at(3, 10, 30), reason: 'Follow-up for recurring headaches', status: 'CONFIRMED', notes: '' },
      { id: 'ap2', patientId: 'u1', doctorId: 'd2', date: at(6, 16), reason: 'Skin rash on left arm', status: 'PENDING', notes: '' },
      { id: 'ap3', patientId: 'u1', doctorId: 'd1', date: at(-14, 9), reason: 'Annual health check', status: 'COMPLETED', notes: 'Blood pressure normal. Advised more water and sleep.' },
      { id: 'ap4', patientId: 'u2', doctorId: 'd1', date: at(1, 11), reason: 'Cough for one week', status: 'PENDING', notes: '' },
    ],
    records: [
      { id: 'r1', patientId: 'u1', doctorId: 'd1', diagnosis: 'Mild tension headache', prescriptions: 'Paracetamol 500 mg when needed. Rest and fluids.', createdAt: at(-14, 9, 40) },
    ],
    audit: [
      { id: 'l1', actorName: 'Dr. Meera Iyer', actorRole: 'DOCTOR', action: 'RECORD_CREATE', target: 'Asha Reddy', createdAt: at(-14, 9, 40) },
      { id: 'l2', actorName: 'Asha Reddy', actorRole: 'PATIENT', action: 'APPOINTMENT_CREATE', target: 'Dr. Karan Mehta', createdAt: at(-1, 10, 12) },
    ],
  }
}

function load() {
  try {
    const raw = localStorage.getItem(DB_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* fall through to fresh data */ }
  const fresh = seed()
  localStorage.setItem(DB_KEY, JSON.stringify(fresh))
  return fresh
}
const save = (db) => localStorage.setItem(DB_KEY, JSON.stringify(db))

const publicUser = ({ password, ...rest }) => rest
const nameOf = (db, id) => db.users.find((u) => u.id === id)?.name ?? 'Unknown'

function log(db, actor, action, target = '') {
  db.audit.unshift({
    id: uid('l'),
    actorName: actor?.name ?? 'Unknown',
    actorRole: actor?.role ?? '',
    action,
    target,
    createdAt: new Date().toISOString(),
  })
}

function current(db) {
  const user = db.users.find((u) => u.id === sessionStorage.getItem(TOKEN_KEY))
  if (!user || !user.active) fail(401, 'Not signed in.')
  return user
}

function need(user, ...roles) {
  if (!roles.includes(user.role)) fail(403, 'You do not have permission to do that.')
}

const shapeAppointment = (db, a) => ({
  ...a,
  patientName: nameOf(db, a.patientId),
  doctorName: nameOf(db, a.doctorId),
})

const hasRelation = (db, doctorId, patientId) =>
  db.appointments.some((a) => a.doctorId === doctorId && a.patientId === patientId)

const byDateDesc = (a, b) => new Date(b.date) - new Date(a.date)

export const authApi = {
  async login({ email, password }) {
    await delay()
    const db = load()
    const user = db.users.find((u) => u.email === email)
    if (!user || user.password !== password || !user.active) {
      log(db, { name: email, role: '' }, 'LOGIN_FAILED', email)
      save(db)
      fail(401, 'Email or password is incorrect.')
    }
    log(db, user, 'LOGIN')
    save(db)
    return { token: user.id, user: publicUser(user) }
  },

  async register({ name, email, password }) {
    await delay()
    const db = load()
    if (db.users.some((u) => u.email === email)) fail(400, 'An account with this email already exists.')
    // Role is never taken from the request. Self-signup is always PATIENT.
    const user = { id: uid('u'), name, email, password, role: 'PATIENT', active: true }
    db.users.push(user)
    log(db, user, 'LOGIN')
    save(db)
    return { token: user.id, user: publicUser(user) }
  },

  async me() {
    await delay(100)
    return publicUser(current(load()))
  },
}

export const profileApi = {
  async update(body) {
    await delay()
    const db = load()
    const me = current(db)
    Object.assign(db.users.find((u) => u.id === me.id), {
      name: body.name, phone: body.phone, dateOfBirth: body.dateOfBirth, bloodGroup: body.bloodGroup,
    })
    log(db, me, 'PROFILE_UPDATE')
    save(db)
    return publicUser(db.users.find((u) => u.id === me.id))
  },
}

export const doctorApi = {
  async list() {
    await delay()
    const db = load()
    current(db)
    return db.users.filter((u) => u.role === 'DOCTOR' && u.active).map(({ id, name, speciality }) => ({ id, name, speciality }))
  },
}

export const appointmentApi = {
  async list() {
    await delay()
    const db = load()
    const me = current(db)
    let rows = db.appointments
    if (me.role === 'PATIENT') rows = rows.filter((a) => a.patientId === me.id)
    if (me.role === 'DOCTOR') rows = rows.filter((a) => a.doctorId === me.id)
    return [...rows].sort(byDateDesc).map((a) => shapeAppointment(db, a))
  },

  async create({ doctorId, date, reason }) {
    await delay()
    const db = load()
    const me = current(db)
    need(me, 'PATIENT')
    if (!db.users.some((u) => u.id === doctorId && u.role === 'DOCTOR' && u.active)) fail(400, 'Choose a valid doctor.')
    if (new Date(date) <= new Date()) fail(400, 'Pick a time in the future.')
    const a = { id: uid('ap'), patientId: me.id, doctorId, date, reason, status: 'PENDING', notes: '' }
    db.appointments.push(a)
    log(db, me, 'APPOINTMENT_CREATE', nameOf(db, doctorId))
    save(db)
    return shapeAppointment(db, a)
  },

  async setStatus(id, status) {
    await delay()
    const db = load()
    const me = current(db)
    const a = db.appointments.find((x) => x.id === id)
    if (!a) fail(404, 'Not found.')
    const owns = (me.role === 'PATIENT' && a.patientId === me.id) || (me.role === 'DOCTOR' && a.doctorId === me.id)
    if (!owns) { log(db, me, 'ACCESS_DENIED', `appointment ${id}`); save(db); fail(403, 'You do not have permission to do that.') }
    if (me.role === 'PATIENT' && status !== 'CANCELLED') fail(403, 'Patients can only cancel.')
    if (!NEXT_STATUS[a.status]?.includes(status)) fail(400, 'That status change is not allowed.')
    a.status = status
    log(db, me, 'APPOINTMENT_STATUS', `${nameOf(db, a.patientId)} → ${status}`)
    save(db)
    return shapeAppointment(db, a)
  },

  async setNotes(id, notes) {
    await delay()
    const db = load()
    const me = current(db)
    need(me, 'DOCTOR')
    const a = db.appointments.find((x) => x.id === id && x.doctorId === me.id)
    if (!a) fail(404, 'Not found.')
    a.notes = notes
    log(db, me, 'NOTES_UPDATE', nameOf(db, a.patientId))
    save(db)
    return shapeAppointment(db, a)
  },
}

const shapeRecord = (db, r) => ({ ...r, doctorName: nameOf(db, r.doctorId) })

export const recordApi = {
  async mine() {
    await delay()
    const db = load()
    const me = current(db)
    need(me, 'PATIENT')
    return db.records.filter((r) => r.patientId === me.id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((r) => shapeRecord(db, r))
  },

  async forPatient(patientId) {
    await delay()
    const db = load()
    const me = current(db)
    need(me, 'DOCTOR')
    if (!hasRelation(db, me.id, patientId)) { log(db, me, 'ACCESS_DENIED', `records of ${nameOf(db, patientId)}`); save(db); fail(403, 'You do not have permission to do that.') }
    log(db, me, 'RECORD_VIEW', nameOf(db, patientId))
    save(db)
    return db.records.filter((r) => r.patientId === patientId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((r) => shapeRecord(db, r))
  },

  async create({ patientId, diagnosis, prescriptions }) {
    await delay()
    const db = load()
    const me = current(db)
    need(me, 'DOCTOR')
    if (!hasRelation(db, me.id, patientId)) fail(403, 'You do not have permission to do that.')
    const r = { id: uid('r'), patientId, doctorId: me.id, diagnosis, prescriptions, createdAt: new Date().toISOString() }
    db.records.push(r)
    log(db, me, 'RECORD_CREATE', nameOf(db, patientId))
    save(db)
    return shapeRecord(db, r)
  },
}

export const adminApi = {
  async users() {
    await delay()
    const db = load()
    need(current(db), 'ADMIN')
    return db.users.map(publicUser)
  },

  async setActive(id, active) {
    await delay()
    const db = load()
    const me = current(db)
    need(me, 'ADMIN')
    const u = db.users.find((x) => x.id === id)
    if (!u || u.role === 'ADMIN') fail(400, 'That account cannot be changed.')
    u.active = active
    log(db, me, active ? 'USER_ENABLED' : 'USER_DISABLED', u.name)
    save(db)
    return publicUser(u)
  },
}

export const adminExtraApi = {
  async appointments() {
    await delay()
    const db = load()
    need(current(db), 'ADMIN')
    return [...db.appointments].sort(byDateDesc).map((a) => shapeAppointment(db, a))
  },

  async createDoctor({ name, email, speciality, password }) {
    await delay()
    const db = load()
    const me = current(db)
    need(me, 'ADMIN')
    if (db.users.some((u) => u.email === email)) fail(400, 'An account with this email already exists.')
    const d = { id: uid('d'), name: name.startsWith('Dr.') ? name : `Dr. ${name}`, email, password, role: 'DOCTOR', active: true, speciality }
    db.users.push(d)
    log(db, me, 'DOCTOR_CREATE', d.name)
    save(db)
    return publicUser(d)
  },

  async audit(limit = 100) {
    await delay()
    const db = load()
    need(current(db), 'ADMIN')
    return db.audit.slice(0, limit)
  },
}

export const chatApi = {
  async ask(message) {
    await delay(500)
    const m = message.toLowerCase()
    let reply = 'I can help with booking, cancelling, clinic hours and finding your records. What would you like to know?'
    if (/ignore|system prompt|previous instructions|other patient|all patient|reveal|jailbreak|password/.test(m)) {
      reply = "I can only help with clinic questions. I can't share other people's information or change my rules."
    } else if (/hour|open|close|timing/.test(m)) {
      reply = 'The clinic is open Monday to Saturday, 9 am to 6 pm.'
    } else if (/cancel/.test(m)) {
      reply = 'Open Appointments, find the visit and press Cancel. You can cancel while it is waiting or confirmed.'
    } else if (/book|appointment|schedule/.test(m)) {
      reply = 'Use the Book a visit form on the Appointments page. Pick a doctor, a time and a reason. The doctor then confirms it.'
    } else if (/record|prescription|diagnos/.test(m)) {
      reply = 'Your diagnoses and prescriptions are under Medical records in the top menu.'
    } else if (/profile|phone|blood/.test(m)) {
      reply = 'Open Profile in the top menu to update your phone number, date of birth and blood group.'
    }
    return { reply }
  },
}
