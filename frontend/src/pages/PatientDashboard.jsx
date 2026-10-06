import { useCallback, useEffect, useState } from 'react'
import Layout from '../components/Layout'
import Field from '../components/Field'
import StatusBadge from '../components/StatusBadge'
import { appointmentApi, doctorApi, errorMessage } from '../services/api'
import { appointmentSchema, validate } from '../lib/schemas'
import { NEXT_STATUS, formatDate } from '../lib/status'

export default function PatientDashboard() {
  const [appointments, setAppointments] = useState([])
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState('')
  const [values, setValues] = useState({ doctorId: '', date: '', reason: '' })
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    try {
      const [a, d] = await Promise.all([appointmentApi.list(), doctorApi.list()])
      setAppointments(a)
      setDoctors(d)
    } catch (err) {
      setPageError(errorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const set = (k) => (e) => setValues((v) => ({ ...v, [k]: e.target.value }))

  const book = async (e) => {
    e.preventDefault()
    setPageError('')
    const { data, errors } = validate(appointmentSchema, values)
    setErrors(errors ?? {})
    if (!data) return

    setBusy(true)
    try {
      await appointmentApi.create({ ...data, date: new Date(data.date).toISOString() })
      setValues({ doctorId: '', date: '', reason: '' })
      await load()
    } catch (err) {
      setPageError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const cancel = async (id) => {
    try {
      await appointmentApi.setStatus(id, 'CANCELLED')
      await load()
    } catch (err) {
      setPageError(errorMessage(err))
    }
  }

  return (
    <Layout welcome title="Your appointments" intro="Request a time with a doctor. You will see it here once they confirm.">
      {pageError && <p role="alert" className="mb-6 rounded bg-rose-soft px-3 py-2 text-rose">{pageError}</p>}

      <div className="grid gap-10 md:grid-cols-[2fr_3fr]">
        <form onSubmit={book} noValidate className="space-y-4 self-start glass p-5">
          <h2 className="text-xl font-bold">Book a visit</h2>
          <Field as="select" label="Doctor" value={values.doctorId} onChange={set('doctorId')} error={errors.doctorId}>
            <option value="">Choose a doctor</option>
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>{d.name}{d.speciality ? `, ${d.speciality}` : ''}</option>
            ))}
          </Field>
          <Field label="Date and time" type="datetime-local" value={values.date} onChange={set('date')} error={errors.date} />
          <Field as="textarea" rows={3} maxLength={300} label="What is the visit about?" value={values.reason} onChange={set('reason')} error={errors.reason} />
          <button className="btn w-full" disabled={busy}>{busy ? 'Sending request…' : 'Request appointment'}</button>
        </form>

        <section>
          <h2 className="mb-3 text-xl font-bold">History</h2>
          {loading ? (
            <p className="text-muted">Loading…</p>
          ) : appointments.length === 0 ? (
            <p className="text-muted">No appointments yet. Use the form to request your first one.</p>
          ) : (
            <ul className="divide-y divide-line glass">
              {appointments.map((a) => (
                <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div>
                    <p className="font-semibold">{a.doctorName}</p>
                    <p className="text-sm text-muted">{formatDate(a.date)}</p>
                    <p className="mt-1 text-sm">{a.reason}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <StatusBadge status={a.status} />
                    {NEXT_STATUS[a.status]?.includes('CANCELLED') && (
                      <button onClick={() => cancel(a.id)} className="btn-quiet">Cancel</button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </Layout>
  )
}
