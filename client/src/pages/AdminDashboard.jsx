import { useCallback, useEffect, useState } from 'react'
import Layout from '../components/Layout'
import Field from '../components/Field'
import StatusBadge from '../components/StatusBadge'
import { adminApi, adminExtraApi, errorMessage } from '../services/api'
import { doctorSchema, validate } from '../lib/schemas'
import { formatDate } from '../lib/status'

const ROLE_TEXT = { PATIENT: 'Patient', DOCTOR: 'Doctor', ADMIN: 'Admin' }

export default function AdminDashboard() {
  const [users, setUsers] = useState([])
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState('')
  const [values, setValues] = useState({ name: '', email: '', speciality: '', password: '' })
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    try {
      const [u, a] = await Promise.all([adminApi.users(), adminExtraApi.appointments()])
      setUsers(u)
      setAppointments(a)
    } catch (err) {
      setPageError(errorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const set = (k) => (e) => setValues((v) => ({ ...v, [k]: e.target.value }))

  const toggle = async (u) => {
    setPageError('')
    try {
      await adminApi.setActive(u.id, !u.active)
      await load()
    } catch (err) {
      setPageError(errorMessage(err))
    }
  }

  const addDoctor = async (e) => {
    e.preventDefault()
    setPageError('')
    const { data, errors } = validate(doctorSchema, values)
    setErrors(errors ?? {})
    if (!data) return
    setBusy(true)
    try {
      await adminExtraApi.createDoctor(data)
      setValues({ name: '', email: '', speciality: '', password: '' })
      await load()
    } catch (err) {
      setPageError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const count = (role) => users.filter((u) => u.role === role).length
  const waiting = appointments.filter((a) => a.status === 'PENDING').length

  return (
    <Layout
      title="Clinic overview"
      intro={loading ? '' : `${count('PATIENT')} patients, ${count('DOCTOR')} doctors, ${waiting} appointments waiting for confirmation.`}
    >
      {pageError && <p role="alert" className="mb-6 rounded bg-rose-soft px-3 py-2 text-rose">{pageError}</p>}

      {loading ? (
        <p className="text-muted">Loading…</p>
      ) : (
        <div className="space-y-12">
          <section>
            <h2 className="mb-3 text-xl font-bold">People</h2>
            <div className="overflow-x-auto rounded border border-line bg-white">
              <table className="w-full text-left">
                <thead className="border-b border-line bg-paper text-sm">
                  <tr>
                    <th className="px-4 py-2 font-semibold">Name</th>
                    <th className="px-4 py-2 font-semibold">Email</th>
                    <th className="px-4 py-2 font-semibold">Role</th>
                    <th className="px-4 py-2 font-semibold">Access</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td className="px-4 py-3">{u.name}</td>
                      <td className="px-4 py-3 text-muted">{u.email}</td>
                      <td className="px-4 py-3">{ROLE_TEXT[u.role]}</td>
                      <td className="px-4 py-3">
                        {u.role === 'ADMIN' ? (
                          <span className="text-muted">Always on</span>
                        ) : (
                          <button onClick={() => toggle(u)} className="btn-quiet">
                            {u.active ? 'Disable account' : 'Enable account'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="grid gap-8 md:grid-cols-[2fr_3fr]">
            <form onSubmit={addDoctor} noValidate className="space-y-4 self-start rounded border border-line bg-white p-5">
              <h2 className="text-xl font-bold">Add a doctor</h2>
              <Field label="Full name" value={values.name} onChange={set('name')} error={errors.name} />
              <Field label="Email" type="email" value={values.email} onChange={set('email')} error={errors.email} />
              <Field label="Speciality" value={values.speciality} onChange={set('speciality')} error={errors.speciality} />
              <Field label="Temporary password" type="password" autoComplete="new-password" value={values.password} onChange={set('password')} error={errors.password} />
              <button className="btn w-full" disabled={busy}>{busy ? 'Adding…' : 'Add doctor'}</button>
            </form>

            <div>
              <h2 className="mb-3 text-xl font-bold">All appointments</h2>
              {appointments.length === 0 ? (
                <p className="text-muted">No appointments booked yet.</p>
              ) : (
                <ul className="divide-y divide-line rounded border border-line bg-white">
                  {appointments.map((a) => (
                    <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 p-4">
                      <div>
                        <p className="font-semibold">{a.patientName} with {a.doctorName}</p>
                        <p className="text-sm text-muted">{formatDate(a.date)}</p>
                      </div>
                      <StatusBadge status={a.status} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>
      )}
    </Layout>
  )
}
