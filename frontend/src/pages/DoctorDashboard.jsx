import { useCallback, useEffect, useState } from 'react'
import Layout from '../components/Layout'
import StatusBadge from '../components/StatusBadge'
import PatientFile from '../components/PatientFile'
import { appointmentApi, errorMessage } from '../services/api'
import { notesSchema, validate } from '../lib/schemas'
import { ACTION_LABEL, NEXT_STATUS, formatDate } from '../lib/status'

function NotesEditor({ appointment, onSaved, onError }) {
  const [notes, setNotes] = useState(appointment.notes ?? '')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const save = async () => {
    const { data, errors } = validate(notesSchema, { notes })
    setError(errors?.notes ?? '')
    if (!data) return
    setSaving(true)
    try {
      await appointmentApi.setNotes(appointment.id, data.notes)
      onSaved()
    } catch (err) {
      onError(errorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mt-3">
      <label className="label" htmlFor={`notes-${appointment.id}`}>Visit notes</label>
      <textarea id={`notes-${appointment.id}`} rows={3} maxLength={1000} className="input" value={notes} onChange={(e) => setNotes(e.target.value)} />
      {error && <p className="field-error">{error}</p>}
      <button onClick={save} disabled={saving} className="btn-quiet mt-2">{saving ? 'Saving…' : 'Save notes'}</button>
    </div>
  )
}

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState('')
  const [openRecords, setOpenRecords] = useState(null)

  const load = useCallback(async () => {
    try {
      setAppointments(await appointmentApi.list())
    } catch (err) {
      setPageError(errorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const move = async (id, status) => {
    setPageError('')
    try {
      await appointmentApi.setStatus(id, status)
      await load()
    } catch (err) {
      setPageError(errorMessage(err))
    }
  }

  const waiting = appointments.filter((a) => a.status === 'PENDING').length

  return (
    <Layout
      welcome
      title="Patient queue"
      intro={loading ? '' : waiting ? `${waiting} request${waiting > 1 ? 's' : ''} waiting for your confirmation.` : 'Nothing waiting for confirmation.'}
    >
      {pageError && <p role="alert" className="mb-6 rounded bg-rose-soft px-3 py-2 text-rose">{pageError}</p>}

      {loading ? (
        <p className="text-muted">Loading…</p>
      ) : appointments.length === 0 ? (
        <p className="text-muted">No appointments assigned to you yet.</p>
      ) : (
        <ul className="space-y-4">
          {appointments.map((a) => (
            <li key={a.id} className="glass p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold">{a.patientName}</p>
                  <p className="text-sm text-muted">{formatDate(a.date)}</p>
                  <p className="mt-1">{a.reason}</p>
                </div>
                <StatusBadge status={a.status} />
              </div>

              {NEXT_STATUS[a.status]?.length > 0 && (
                <div className="mt-4 flex gap-2">
                  {NEXT_STATUS[a.status].map((s) => (
                    <button key={s} onClick={() => move(a.id, s)} className={s === 'CANCELLED' ? 'btn-quiet' : 'btn'}>
                      {ACTION_LABEL[s]}
                    </button>
                  ))}
                </div>
              )}

              {(a.status === 'CONFIRMED' || a.status === 'COMPLETED') && (
                <NotesEditor appointment={a} onSaved={load} onError={setPageError} />
              )}

              {(a.status === 'CONFIRMED' || a.status === 'COMPLETED') && (
                <>
                  <button
                    onClick={() => setOpenRecords(openRecords === a.id ? null : a.id)}
                    className="btn-quiet mt-4"
                    aria-expanded={openRecords === a.id}
                  >
                    {openRecords === a.id ? 'Hide patient file' : 'Patient file'}
                  </button>
                  {openRecords === a.id && <PatientFile patientId={a.patientId} />}
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </Layout>
  )
}
