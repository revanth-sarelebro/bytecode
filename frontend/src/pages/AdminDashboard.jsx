import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import Field from '../components/Field'
import StatusBadge from '../components/StatusBadge'
import { adminApi, adminExtraApi, errorMessage } from '../services/api'
import { doctorSchema, validate } from '../lib/schemas'
import { formatDate } from '../lib/status'
import { actionText, isAlert } from '../lib/audit'

const ROLE_TEXT = { PATIENT: 'Patient', DOCTOR: 'Doctor', ADMIN: 'Admin' }

const ACTION_TEXT = {
  RECORD_VIEWED: 'Viewed medical record',
  RECORD_CREATED: 'Added medical record',
  NOTES_UPDATED: 'Updated visit notes',
  STATUS_CHANGED: 'Changed appointment status',
  ACCOUNT_DISABLED: 'Disabled account',
  ACCOUNT_ENABLED: 'Enabled account',
  LOGIN_FAILED: 'Failed sign in',
  ACCESS_DENIED: 'Blocked from restricted page',
}
const when = (iso) => new Date(iso).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })

export default function AdminDashboard() {
  const [users, setUsers] = useState([])
  const [appointments, setAppointments] = useState([])
  const [activity, setActivity] = useState([])
  const [audit, setAudit] = useState([])
  const [showAllAudit, setShowAllAudit] = useState(false)
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState('')
  const [values, setValues] = useState({ name: '', email: '', speciality: '', password: '' })
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    try {
      const [u, a, log] = await Promise.all([
        adminApi.users(),
        adminExtraApi.appointments(),
        adminExtraApi.auditLog().catch(() => []),
      ])
      setUsers(u)
      setAppointments(a)
      setAudit(log)
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
      welcome
      title="Clinic overview"
      intro={loading ? '' : `${count('PATIENT')} patients, ${count('DOCTOR')} doctors, ${waiting} appointments waiting for confirmation.`}
    >
      {pageError && <p role="alert" className="mb-6 rounded bg-rose-soft px-3 py-2 text-rose">{pageError}</p>}

      {loading ? (
        <p className="text-muted">Loading…</p>
      ) : (
        <div className="space-y-12">
          <section>
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="text-xl font-bold">Recent activity</h2>
              <Link to="/admin/audit" className="text-sm font-semibold text-clinic underline">View full audit log</Link>
            </div>
            {activity.length === 0 ? (
              <p className="text-muted">No activity recorded yet.</p>
            ) : (
              <ul className="divide-y divide-line rounded border border-line bg-white text-sm">
                {activity.map((e) => (
                  <li key={e.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                    <span>
                      <span className="font-semibold">{e.actorName}</span>{' '}
                      <span className={isAlert(e.action) ? 'font-semibold text-rose' : ''}>{actionText(e.action).toLowerCase()}</span>
                      {e.target && <span className="text-muted"> · {e.target}</span>}
                    </span>
                    <span className="text-muted">{formatDate(e.createdAt)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

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

          <section>
            <h2 className="text-xl font-bold">Audit log</h2>
            <p className="mb-3 text-muted">Who looked at or changed patient data, and when.</p>
            {audit.length === 0 ? (
              <p className="text-muted">No activity recorded yet.</p>
            ) : (
              <>
                <div className="overflow-x-auto rounded border border-line bg-white">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-line bg-paper">
                      <tr>
                        <th className="px-4 py-2 font-semibold">When</th>
                        <th className="px-4 py-2 font-semibold">Who</th>
                        <th className="px-4 py-2 font-semibold">What they did</th>
                        <th className="px-4 py-2 font-semibold">Record</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {(showAllAudit ? audit : audit.slice(0, 8)).map((e) => (
                        <tr key={e.id}>
                          <td className="whitespace-nowrap px-4 py-2 text-muted">{when(e.createdAt)}</td>
                          <td className="px-4 py-2">{e.actorName} <span className="text-muted">({ROLE_TEXT[e.actorRole] ?? e.actorRole})</span></td>
                          <td className={`px-4 py-2 ${e.action === 'LOGIN_FAILED' || e.action === 'ACCESS_DENIED' ? 'font-semibold text-rose' : ''}`}>
                            {ACTION_TEXT[e.action] ?? e.action}
                          </td>
                          <td className="px-4 py-2 text-muted">{e.target}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {audit.length > 8 && (
                  <button onClick={() => setShowAllAudit((v) => !v)} className="btn-quiet mt-3">
                    {showAllAudit ? 'Show fewer' : `Show all ${audit.length} entries`}
                  </button>
                )}
              </>
            )}
          </section>
        </div>
      )}
    </Layout>
  )
}
